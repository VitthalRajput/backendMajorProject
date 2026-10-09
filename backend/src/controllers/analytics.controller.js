import { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { analyticsIngestionService } from "../services/analyticsIngestion.service.js";

/**
 * Detect client device type from User-Agent header
 * @param {string} userAgent
 * @returns {"desktop" | "mobile" | "tablet" | "tv" | "other"}
 */
const detectDeviceType = (userAgent = "") => {
    const ua = userAgent.toLowerCase();
    if (/(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/.test(ua)) {
        return "tablet";
    }
    if (/(mobi|ipod|phone|blackberry|opera mini|fennec|minimo)/.test(ua)) {
        return "mobile";
    }
    if (/(smart-tv|googletv|appletv|hbbtv|pov_tv|netcast|roku)/.test(ua)) {
        return "tv";
    }
    if (/windows|macintosh|linux/.test(ua)) {
        return "desktop";
    }
    return "other";
};

/**
 * High-throughput endpoint to ingest video watch heartbeat pings
 * POST /api/v1/analytics/watch-ping
 */
const recordWatchPing = asyncHandler(async (req, res) => {
    const { videoId, watchDurationSeconds, retentionPointSeconds } = req.body;
    let { channelId, deviceType, userId } = req.body;

    if (!videoId || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Valid videoId is required");
    }

    const durationSec = Number(watchDurationSeconds);
    if (isNaN(durationSec) || durationSec < 0) {
        throw new ApiError(400, "watchDurationSeconds must be a non-negative number");
    }

    const retentionSec = Number(retentionPointSeconds);
    if (isNaN(retentionSec) || retentionSec < 0) {
        throw new ApiError(400, "retentionPointSeconds must be a non-negative number");
    }

    // Resolve channelId from video if not provided in body
    if (!channelId || !isValidObjectId(channelId)) {
        const video = await Video.findById(videoId).select("owner");
        if (!video) {
            throw new ApiError(404, "Video not found");
        }
        channelId = video.owner;
    }

    // Auto-detect device type if not provided
    if (!deviceType || !["desktop", "mobile", "tablet", "tv", "other"].includes(deviceType)) {
        deviceType = detectDeviceType(req.headers["user-agent"] || "");
    }

    // User ID from JWT session if logged in
    const authenticatedUserId = req.user?._id || (userId && isValidObjectId(userId) ? userId : null);

    // Queue in high-throughput ingestion buffer
    await analyticsIngestionService.ingestPing({
        videoId,
        userId: authenticatedUserId,
        channelId,
        watchDurationSeconds: durationSec,
        retentionPointSeconds: retentionSec,
        deviceType,
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            { recorded: true },
            "Watch ping recorded successfully"
        )
    );
});

export { recordWatchPing };
export default { recordWatchPing };


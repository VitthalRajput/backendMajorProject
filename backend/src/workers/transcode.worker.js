import path from "path";
import { Worker } from "bullmq";
import { redisConnection } from "../config/redis.js";
import { Video } from "../models/video.model.js";
import { TranscodeService } from "../services/transcode.service.js";
import { notificationService } from "../services/notification.service.js";

/**
 * Processor for transcoding a video job
 * @param {import('bullmq').Job} job
 */
export const processTranscodeJob = async (job) => {
    const { videoId, videoFilePath, customThumbnailPath } = job.data;
    console.log(`[Transcode Worker] Starting transcode job for video: ${videoId}`);

    try {
        const video = await Video.findById(videoId);
        if (!video) {
            throw new Error(`Video document not found for id: ${videoId}`);
        }

        // 1. Initial status update
        await Video.findByIdAndUpdate(videoId, {
            status: "processing",
            processingProgress: 5,
        });
        if (job.updateProgress) await job.updateProgress(5);
        notificationService.emitVideoProgress(videoId, {
            status: "processing",
            progress: 5,
            message: "Probing video stream metadata...",
        });

        // 2. Probe video metadata & duration
        const { duration } = await TranscodeService.getVideoMetadata(videoFilePath);
        console.log(`[Transcode Worker] Video duration: ${duration}s for video: ${videoId}`);

        // 3. Automated thumbnail extraction at 10%, 50%, and 90%
        const thumbnailDir = path.resolve("public", "thumbnails", videoId);
        const generatedThumbnails = await TranscodeService.extractThumbnails(
            videoFilePath,
            thumbnailDir,
            duration,
            videoId
        );

        await Video.findByIdAndUpdate(videoId, {
            processingProgress: 15,
            thumbnails: generatedThumbnails,
        });
        if (job.updateProgress) await job.updateProgress(15);
        notificationService.emitVideoProgress(videoId, {
            status: "processing",
            progress: 15,
            thumbnails: generatedThumbnails,
            message: "Thumbnails generated, starting HLS encoding...",
        });

        // 4. Generate multi-variant HLS stream (360p, 720p, 1080p + master.m3u8)
        const hlsDir = path.resolve("public", "hls", videoId);
        const masterManifestUrl = await TranscodeService.generateHlsStream(
            videoFilePath,
            hlsDir,
            duration,
            videoId,
            async (pct) => {
                if (job.updateProgress) await job.updateProgress(pct);
                notificationService.emitVideoProgress(videoId, {
                    status: "processing",
                    progress: pct,
                    message: `Transcoding HLS variants (${pct}%)...`,
                });
                await Video.findByIdAndUpdate(videoId, { processingProgress: pct });
            }
        );

        // 5. Update MongoDB document with ready status
        const defaultThumbnail =
            video.thumbnail && video.thumbnail.trim() !== ""
                ? video.thumbnail
                : generatedThumbnails[0] || "";

        const updatedVideo = await Video.findByIdAndUpdate(
            videoId,
            {
                status: "ready",
                processingProgress: 100,
                hlsManifest: masterManifestUrl,
                videoFile: masterManifestUrl, // HLS stream manifest URL for player
                thumbnails: generatedThumbnails,
                thumbnail: defaultThumbnail,
                duration: Math.round(duration),
                processingError: null,
            },
            { new: true }
        );

        // 6. Notify SSE subscribers of completion
        notificationService.emitVideoProgress(videoId, {
            status: "ready",
            progress: 100,
            message: "Video transcoding completed successfully",
            video: updatedVideo,
        });

        // 7. Cleanup raw uploaded video file and custom thumbnail file
        TranscodeService.cleanupFile(videoFilePath);
        if (customThumbnailPath) {
            TranscodeService.cleanupFile(customThumbnailPath);
        }

        console.log(`[Transcode Worker] Successfully finished transcoding video: ${videoId}`);
        return { success: true, masterManifestUrl, duration };
    } catch (err) {
        console.error(`[Transcode Worker Error] Transcoding failed for video ${videoId}:`, err.message);

        // Record failure in database
        await Video.findByIdAndUpdate(videoId, {
            status: "failed",
            processingError: err.message,
        });

        // Notify SSE subscribers
        notificationService.emitVideoProgress(videoId, {
            status: "failed",
            error: err.message,
            message: "Video transcoding failed",
        });

        // Clean up temporary files on failure
        TranscodeService.cleanupFile(videoFilePath);
        if (customThumbnailPath) {
            TranscodeService.cleanupFile(customThumbnailPath);
        }

        throw err;
    }
};

/**
 * Initialize and start the BullMQ worker
 * @returns {Worker}
 */
export const startTranscodeWorker = () => {
    try {
        const worker = new Worker("video-transcode", processTranscodeJob, {
            connection: redisConnection,
            concurrency: 2,
        });

        worker.on("ready", () => {
            console.log("[BullMQ Worker] 'video-transcode' worker is ready and waiting for jobs");
        });

        worker.on("completed", (job) => {
            console.log(`[BullMQ Worker] Completed job ${job.id} for video: ${job.data?.videoId}`);
        });

        worker.on("failed", (job, err) => {
            console.error(`[BullMQ Worker] Job ${job?.id} failed:`, err.message);
        });

        worker.on("error", (err) => {
            console.warn(`[BullMQ Worker Warning]:`, err.message);
        });

        return worker;
    } catch (err) {
        console.warn(`[BullMQ Worker Initialization Error]:`, err.message);
        return null;
    }
};

// Standalone execution support
if (process.argv[1] && process.argv[1].includes("transcode.worker.js")) {
    import("../db/index.js").then(({ default: connectDB }) => {
        connectDB().then(() => {
            console.log("[Standalone Worker] MongoDB connected, starting transcode worker...");
            startTranscodeWorker();
        });
    });
}

export default startTranscodeWorker;

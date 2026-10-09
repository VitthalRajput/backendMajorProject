import mongoose from "mongoose";
import { WatchEvent } from "../models/watchEvent.model.js";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ChannelAnalyticsDaily } from "../models/channelAnalyticsDaily.model.js";
import { VideoAnalyticsSummary } from "../models/videoAnalyticsSummary.model.js";

export class AnalyticsAggregationService {
    /**
     * Compute Audience Retention Curve and completion rate for a video
     * @param {string} videoId
     * @param {Date} [startDate]
     * @param {Date} [endDate]
     */
    static async computeVideoRetention(videoId, startDate, endDate) {
        const vId = new mongoose.Types.ObjectId(videoId);
        const video = await Video.findById(vId);
        if (!video) {
            throw new Error("Video not found");
        }

        const duration = Math.max(1, video.duration || 60);

        const matchFilter = { videoId: vId };
        if (startDate || endDate) {
            matchFilter.createdAt = {};
            if (startDate) matchFilter.createdAt.$gte = new Date(startDate);
            if (endDate) matchFilter.createdAt.$lte = new Date(endDate);
        }

        // Faceted pipeline to compute overall metrics, device breakdown, and slice buckets
        const [aggregationResult] = await WatchEvent.aggregate([
            { $match: matchFilter },
            {
                $facet: {
                    overview: [
                        {
                            $group: {
                                _id: null,
                                totalViews: { $sum: 1 },
                                totalWatchTimeSeconds: { $sum: "$watchDurationSeconds" },
                            },
                        },
                    ],
                    deviceBreakdown: [
                        {
                            $group: {
                                _id: "$deviceType",
                                count: { $sum: 1 },
                            },
                        },
                    ],
                    // Compute distribution across 10 video slices (0% to 100%)
                    retentionPoints: [
                        {
                            $project: {
                                retentionPointSeconds: 1,
                                slicePercent: {
                                    $min: [
                                        100,
                                        {
                                            $multiply: [
                                                {
                                                    $floor: {
                                                        $multiply: [
                                                            { $divide: ["$retentionPointSeconds", duration] },
                                                            10,
                                                        ],
                                                    },
                                                },
                                                10,
                                            ],
                                        },
                                    ],
                                },
                            },
                        },
                        {
                            $group: {
                                _id: "$slicePercent",
                                count: { $sum: 1 },
                            },
                        },
                    ],
                },
            },
        ]);

        const overview = aggregationResult?.overview?.[0] || { totalViews: 0, totalWatchTimeSeconds: 0 };
        const totalViews = overview.totalViews || 0;
        const totalWatchTimeSeconds = overview.totalWatchTimeSeconds || 0;

        // Device breakdown map
        const deviceMap = { desktop: 0, mobile: 0, tablet: 0, tv: 0, other: 0 };
        aggregationResult?.deviceBreakdown?.forEach((item) => {
            if (item._id && deviceMap[item._id] !== undefined) {
                deviceMap[item._id] = item.count;
            } else {
                deviceMap.other += item.count;
            }
        });

        // Compute 10-slice retention curve (0%, 10%, 20% ... 100%)
        const sliceMap = new Map();
        aggregationResult?.retentionPoints?.forEach((item) => {
            sliceMap.set(item._id, item.count);
        });

        // If no watch events, return flat baseline
        const initialCount = totalViews > 0 ? totalViews : 1;
        const retentionCurve = [];

        // Build cumulative survival curve
        for (let pct = 0; pct <= 100; pct += 10) {
            const timestampSeconds = Math.round((pct / 100) * duration);

            // Slices that reached at least this percentage
            let countAtOrPastSlice = 0;
            for (let checkPct = pct; checkPct <= 100; checkPct += 10) {
                countAtOrPastSlice += sliceMap.get(checkPct) || 0;
            }

            // Fallback: if viewers at beginning exist
            const sampleCount = countAtOrPastSlice > 0 ? countAtOrPastSlice : Math.max(0, totalViews - Math.round(totalViews * (pct / 100) * 0.4));
            const retentionRate = totalViews > 0
                ? Math.min(100, Math.max(0, Math.round((sampleCount / initialCount) * 100)))
                : (pct === 0 ? 100 : Math.max(0, 100 - pct));

            retentionCurve.push({
                slicePercent: pct,
                timestampSeconds,
                retentionRate: pct === 0 ? 100 : retentionRate,
                sampleCount,
            });
        }

        // Average completion rate
        const averageCompletionRate = totalViews > 0 && duration > 0
            ? Math.min(100, Math.round((totalWatchTimeSeconds / (totalViews * duration)) * 100))
            : 0;

        return {
            videoId: video._id,
            title: video.title,
            duration,
            totalViews,
            totalWatchTimeSeconds,
            averageCompletionRate,
            retentionCurve,
            deviceBreakdown: deviceMap,
        };
    }

    /**
     * Compute Top-Performing Videos by Watch Time & Views for a Channel over Date Range
     * @param {string} channelId
     * @param {Date} startDate
     * @param {Date} endDate
     * @param {number} [limit=10]
     */
    static async getTopPerformingVideos(channelId, startDate, endDate, limit = 10) {
        const cId = new mongoose.Types.ObjectId(channelId);

        const matchFilter = { channelId: cId };
        if (startDate || endDate) {
            matchFilter.createdAt = {};
            if (startDate) matchFilter.createdAt.$gte = new Date(startDate);
            if (endDate) matchFilter.createdAt.$lte = new Date(endDate);
        }

        return await WatchEvent.aggregate([
            { $match: matchFilter },
            {
                $group: {
                    _id: "$videoId",
                    views: { $sum: 1 },
                    watchTimeSeconds: { $sum: "$watchDurationSeconds" },
                },
            },
            {
                $lookup: {
                    from: "videos",
                    localField: "_id",
                    foreignField: "_id",
                    as: "videoDetails",
                },
            },
            { $unwind: "$videoDetails" },
            {
                $project: {
                    _id: "$videoDetails._id",
                    title: "$videoDetails.title",
                    thumbnail: "$videoDetails.thumbnail",
                    duration: "$videoDetails.duration",
                    publishedAt: "$videoDetails.createdAt",
                    views: 1,
                    watchTimeSeconds: 1,
                    watchHours: {
                        $round: [{ $divide: ["$watchTimeSeconds", 3600] }, 1],
                    },
                },
            },
            { $sort: { watchTimeSeconds: -1, views: -1 } },
            { $limit: limit },
        ]);
    }

    /**
     * Compute Channel Overview metrics: total views, watch hours, and subscriber delta
     * @param {string} channelId
     * @param {Date} [startDate]
     * @param {Date} [endDate]
     */
    static async getChannelOverview(channelId, startDate, endDate) {
        const cId = new mongoose.Types.ObjectId(channelId);

        const matchFilter = { channelId: cId };
        if (startDate || endDate) {
            matchFilter.createdAt = {};
            if (startDate) matchFilter.createdAt.$gte = new Date(startDate);
            if (endDate) matchFilter.createdAt.$lte = new Date(endDate);
        }

        // Aggregate watch events for total views and watch hours
        const [watchStats] = await WatchEvent.aggregate([
            { $match: matchFilter },
            {
                $group: {
                    _id: null,
                    totalViews: { $sum: 1 },
                    totalWatchTimeSeconds: { $sum: "$watchDurationSeconds" },
                },
            },
        ]);

        const totalViews = watchStats?.totalViews || 0;
        const totalWatchTimeSeconds = watchStats?.totalWatchTimeSeconds || 0;
        const totalWatchHours = Math.round((totalWatchTimeSeconds / 3600) * 10) / 10;

        // Compute subscriber delta in period
        const subFilter = { channel: cId };
        if (startDate || endDate) {
            subFilter.createdAt = {};
            if (startDate) subFilter.createdAt.$gte = new Date(startDate);
            if (endDate) subFilter.createdAt.$lte = new Date(endDate);
        }

        const subscribersGained = await Subscription.countDocuments(subFilter);
        const totalSubscribers = await Subscription.countDocuments({ channel: cId });

        // Device breakdown
        const deviceStats = await WatchEvent.aggregate([
            { $match: matchFilter },
            {
                $group: {
                    _id: "$deviceType",
                    count: { $sum: 1 },
                },
            },
        ]);

        const deviceBreakdown = { desktop: 0, mobile: 0, tablet: 0, tv: 0, other: 0 };
        deviceStats.forEach((item) => {
            if (item._id && deviceBreakdown[item._id] !== undefined) {
                deviceBreakdown[item._id] = item.count;
            } else {
                deviceBreakdown.other += item.count;
            }
        });

        // Top 5 videos
        const topVideos = await this.getTopPerformingVideos(channelId, startDate, endDate, 5);

        return {
            channelId,
            totalViews,
            totalWatchTimeSeconds,
            totalWatchHours,
            subscribersGained,
            totalSubscribers,
            subscriberDelta: subscribersGained,
            deviceBreakdown,
            topVideos,
        };
    }

    /**
     * Summarize raw WatchEvent records into ChannelAnalyticsDaily and VideoAnalyticsSummary
     * @param {Date} [targetDate] Date to summarize (defaults to yesterday or current date)
     */
    static async summarizeDailyAnalytics(targetDate = new Date()) {
        const startOfDay = new Date(targetDate);
        startOfDay.setUTCHours(0, 0, 0, 0);

        const endOfDay = new Date(targetDate);
        endOfDay.setUTCHours(23, 59, 59, 999);

        console.log(`[Analytics Aggregation] Starting summarization for: ${startOfDay.toISOString().slice(0, 10)}`);

        // 1. Summarize by Channel
        const channelSummaries = await WatchEvent.aggregate([
            {
                $match: {
                    createdAt: { $gte: startOfDay, $lte: endOfDay },
                },
            },
            {
                $group: {
                    _id: "$channelId",
                    totalViews: { $sum: 1 },
                    totalWatchTimeSeconds: { $sum: "$watchDurationSeconds" },
                },
            },
        ]);

        for (const summary of channelSummaries) {
            const channelId = summary._id;
            const watchHours = Math.round((summary.totalWatchTimeSeconds / 3600) * 10) / 10;

            const subscribersGained = await Subscription.countDocuments({
                channel: channelId,
                createdAt: { $gte: startOfDay, $lte: endOfDay },
            });

            await ChannelAnalyticsDaily.findOneAndUpdate(
                { channelId, date: startOfDay },
                {
                    $set: {
                        totalViews: summary.totalViews,
                        totalWatchTimeSeconds: summary.totalWatchTimeSeconds,
                        totalWatchHours: watchHours,
                        subscribersGained,
                        subscriberDelta: subscribersGained,
                    },
                },
                { upsert: true, new: true }
            );
        }

        // 2. Summarize by Video
        const videoSummaries = await WatchEvent.aggregate([
            {
                $match: {
                    createdAt: { $gte: startOfDay, $lte: endOfDay },
                },
            },
            {
                $group: {
                    _id: { videoId: "$videoId", channelId: "$channelId" },
                    totalViews: { $sum: 1 },
                    totalWatchTimeSeconds: { $sum: "$watchDurationSeconds" },
                },
            },
        ]);

        for (const item of videoSummaries) {
            const { videoId, channelId } = item._id;
            try {
                const retention = await this.computeVideoRetention(videoId, startOfDay, endOfDay);

                await VideoAnalyticsSummary.findOneAndUpdate(
                    { videoId, date: startOfDay },
                    {
                        $set: {
                            channelId,
                            totalViews: item.totalViews,
                            totalWatchTimeSeconds: item.totalWatchTimeSeconds,
                            averageCompletionRate: retention.averageCompletionRate,
                            retentionCurve: retention.retentionCurve,
                            deviceBreakdown: retention.deviceBreakdown,
                        },
                    },
                    { upsert: true, new: true }
                );
            } catch (err) {
                console.warn(`[Analytics Aggregation Warning] Video ${videoId} summary:`, err.message);
            }
        }

        console.log(`[Analytics Aggregation] Finished summarization. Processed ${channelSummaries.length} channels, ${videoSummaries.length} videos.`);
    }
}

export default AnalyticsAggregationService;


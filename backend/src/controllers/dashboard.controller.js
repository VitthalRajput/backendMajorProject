import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { Subscription } from "../models/subscription.model.js"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { AnalyticsAggregationService } from "../services/analyticsAggregation.service.js"

const getChannelStats = asyncHandler(async (req, res) => {
    const channelId = req.user?._id

    // total videos + total views for this channel
    const videoStats = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $group: {
                _id: null,
                totalVideos: { $sum: 1 },
                totalViews: { $sum: "$views" },
                videoIds: { $push: "$_id" }
            }
        }
    ])

    const totalVideos = videoStats[0]?.totalVideos || 0
    const totalViews = videoStats[0]?.totalViews || 0
    const videoIds = videoStats[0]?.videoIds || []

    // total subscribers for this channel
    const totalSubscribers = await Subscription.countDocuments({
        channel: channelId
    })

    // total likes across all this channel's videos
    const totalLikes = await Like.countDocuments({
        video: { $in: videoIds }
    })

    const stats = {
        totalVideos,
        totalViews,
        totalSubscribers,
        totalLikes
    }

    return res
        .status(200)
        .json(new ApiResponse(200, stats, "Channel stats fetched successfully"))
})

const getChannelVideos = asyncHandler(async (req, res) => {
    const channelId = req.user?._id

    const videos = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes"
            }
        },
        {
            $lookup: {
                from: "comments",
                localField: "_id",
                foreignField: "video",
                as: "comments"
            }
        },
        {
            $addFields: {
                likesCount: { $size: "$likes" },
                commentsCount: { $size: "$comments" }
            }
        },
        {
            $sort: { createdAt: -1 }
        },
        {
            $project: {
                videoFile: 1,
                thumbnail: 1,
                title: 1,
                description: 1,
                duration: 1,
                views: 1,
                status: 1,
                processingProgress: 1,
                isPublished: 1,
                createdAt: 1,
                likesCount: 1,
                commentsCount: 1
            }
        }
    ])

    return res
        .status(200)
        .json(new ApiResponse(200, videos, "Channel videos fetched successfully"))
})

/**
 * GET /api/v1/dashboard/overview
 * Channel total views, watch hours, subscriber delta, device breakdown, and top videos
 */
const getDashboardOverview = asyncHandler(async (req, res) => {
    const channelId = req.user?._id
    const { timeRange = "28d", startDate, endDate } = req.query

    let start = null
    let end = endDate ? new Date(endDate) : new Date()

    if (startDate) {
        start = new Date(startDate)
    } else if (timeRange === "7d") {
        start = new Date()
        start.setDate(start.getDate() - 7)
    } else if (timeRange === "28d") {
        start = new Date()
        start.setDate(start.getDate() - 28)
    } else if (timeRange === "90d") {
        start = new Date()
        start.setDate(start.getDate() - 90)
    } else if (timeRange === "365d") {
        start = new Date()
        start.setDate(start.getDate() - 365)
    }

    const overview = await AnalyticsAggregationService.getChannelOverview(
        channelId,
        start,
        end
    )

    // Lifetime video counts
    const totalVideos = await Video.countDocuments({ owner: channelId })

    const responseData = {
        ...overview,
        totalVideos,
        timeRange,
        startDate: start ? start.toISOString() : null,
        endDate: end.toISOString()
    }

    return res
        .status(200)
        .json(new ApiResponse(200, responseData, "Dashboard overview fetched successfully"))
})

/**
 * GET /api/v1/dashboard/videos/:videoId/retention
 * Audience retention curve and completion rate for a specific video
 */
const getVideoRetention = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { startDate, endDate } = req.query

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id")
    }

    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    // Channel-owner authorization verification
    if (video.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You are not authorized to view analytics for this video")
    }

    const start = startDate ? new Date(startDate) : null
    const end = endDate ? new Date(endDate) : null

    const retentionData = await AnalyticsAggregationService.computeVideoRetention(
        videoId,
        start,
        end
    )

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                retentionData,
                "Video retention analytics fetched successfully"
            )
        )
})

export {
    getChannelStats,
    getChannelVideos,
    getDashboardOverview,
    getVideoRetention
}
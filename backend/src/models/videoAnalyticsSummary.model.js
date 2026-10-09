import mongoose, { Schema } from "mongoose";

const retentionSliceSchema = new Schema(
    {
        slicePercent: {
            type: Number, // 0, 10, 20, 30 ... 100
            required: true,
        },
        timestampSeconds: {
            type: Number,
            default: 0,
        },
        retentionRate: {
            type: Number, // Percentage of viewers remaining at this slice (0 - 100)
            required: true,
        },
        sampleCount: {
            type: Number,
            default: 0,
        },
    },
    { _id: false }
);

const videoAnalyticsSummarySchema = new Schema(
    {
        videoId: {
            type: Schema.Types.ObjectId,
            ref: "Video",
            required: true,
            index: true,
        },
        channelId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        date: {
            type: Date,
            required: true,
            index: true,
        },
        totalViews: {
            type: Number,
            default: 0,
            min: 0,
        },
        totalWatchTimeSeconds: {
            type: Number,
            default: 0,
            min: 0,
        },
        averageWatchDuration: {
            type: Number,
            default: 0,
            min: 0,
        },
        averageCompletionRate: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },
        retentionCurve: {
            type: [retentionSliceSchema],
            default: [],
        },
        deviceBreakdown: {
            desktop: { type: Number, default: 0 },
            mobile: { type: Number, default: 0 },
            tablet: { type: Number, default: 0 },
            tv: { type: Number, default: 0 },
            other: { type: Number, default: 0 },
        },
    },
    {
        timestamps: true,
    }
);

videoAnalyticsSummarySchema.index({ videoId: 1, date: -1 }, { unique: true });
videoAnalyticsSummarySchema.index({ channelId: 1, date: -1 });

export const VideoAnalyticsSummary = mongoose.model(
    "VideoAnalyticsSummary",
    videoAnalyticsSummarySchema
);
export default VideoAnalyticsSummary;


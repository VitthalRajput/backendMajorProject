import mongoose, { Schema } from "mongoose";

const channelAnalyticsDailySchema = new Schema(
    {
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
        totalWatchHours: {
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
        subscribersGained: {
            type: Number,
            default: 0,
        },
        subscribersLost: {
            type: Number,
            default: 0,
        },
        subscriberDelta: {
            type: Number,
            default: 0,
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

// Unique compound index so each channel has at most 1 summary record per date
channelAnalyticsDailySchema.index({ channelId: 1, date: -1 }, { unique: true });

export const ChannelAnalyticsDaily = mongoose.model(
    "ChannelAnalyticsDaily",
    channelAnalyticsDailySchema
);
export default ChannelAnalyticsDaily;


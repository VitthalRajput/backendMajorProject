import mongoose, { Schema } from "mongoose";

const watchEventSchema = new Schema(
    {
        videoId: {
            type: Schema.Types.ObjectId,
            ref: "Video",
            required: true,
            index: true,
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            default: null,
            index: true,
        },
        channelId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        watchDurationSeconds: {
            type: Number,
            required: true,
            min: 0,
        },
        retentionPointSeconds: {
            type: Number,
            required: true,
            min: 0,
        },
        deviceType: {
            type: String,
            enum: ["desktop", "mobile", "tablet", "tv", "other"],
            default: "desktop",
            index: true,
        },
    },
    {
        timestamps: { createdAt: true, updatedAt: false }, // Only record createdAt
    }
);

// Compound indexes for analytics aggregation
watchEventSchema.index({ videoId: 1, createdAt: -1 });
watchEventSchema.index({ channelId: 1, createdAt: -1 });
watchEventSchema.index({ videoId: 1, retentionPointSeconds: 1 });
watchEventSchema.index({ createdAt: 1 });

export const WatchEvent = mongoose.model("WatchEvent", watchEventSchema);
export default WatchEvent;


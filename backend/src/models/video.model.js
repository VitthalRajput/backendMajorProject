import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema(
    {
        videoFile: {
            type: String, // HLS master manifest (.m3u8) or Cloudinary URL
            default: "",
        },
        hlsManifest: {
            type: String, // Direct HLS master playlist URL
            default: "",
        },
        thumbnail: {
            type: String, // Primary thumbnail
            default: "",
        },
        thumbnails: {
            type: [String], // Automated extracted thumbnails (e.g. 10%, 50%, 90%)
            default: [],
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
            trim: true,
        },
        duration: {
            type: Number, // In seconds (extracted via ffprobe)
            default: 0,
        },
        status: {
            type: String,
            enum: ["processing", "ready", "failed"],
            default: "processing",
            index: true,
        },
        processingProgress: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },
        processingError: {
            type: String,
            default: null,
        },
        rawVideoPath: {
            type: String,
            default: "",
        },
        views: {
            type: Number,
            default: 0,
        },
        isPublished: {
            type: Boolean,
            default: true,
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

videoSchema.plugin(mongooseAggregatePaginate);

export const Video = mongoose.model("Video", videoSchema);

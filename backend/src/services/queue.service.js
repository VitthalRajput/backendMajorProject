import { Queue } from "bullmq";
import { redisConnection } from "../config/redis.js";
import { processTranscodeJob } from "../workers/transcode.worker.js";

/**
 * BullMQ Queue named 'video-transcode'
 */
export const videoTranscodeQueue = new Queue("video-transcode", {
    connection: redisConnection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: "exponential",
            delay: 5000,
        },
        removeOnComplete: {
            age: 3600, // keep completed jobs for 1 hour
            count: 100,
        },
        removeOnFail: {
            age: 86400, // keep failed jobs for 24 hours
        },
    },
});

let hasLoggedQueueWarning = false;

videoTranscodeQueue.on("error", (err) => {
    if (!hasLoggedQueueWarning) {
        console.warn(`[BullMQ Queue Warning]: ${err.message}`);
        hasLoggedQueueWarning = true;
    }
});

/**
 * Enqueue a video transcoding job into BullMQ
 * @param {{ videoId: string, videoFilePath: string, customThumbnailPath?: string }} jobData
 * @returns {Promise<import('bullmq').Job | null>}
 */
export const addTranscodeJob = async (jobData) => {
    try {
        const job = await videoTranscodeQueue.add("transcode-hls", jobData, {
            jobId: `transcode-${jobData.videoId}`,
        });
        console.log(`[Queue] Enqueued transcode job ${job.id} for video ${jobData.videoId}`);
        return job;
    } catch (err) {
        console.warn(`[Queue Warning] Could not enqueue to Redis (${err.message}). Running transcode directly in background.`);
        // Fallback: If Redis is unavailable in local environment, process directly in background
        setImmediate(async () => {
            try {
                await processTranscodeJob({
                    id: `local-${jobData.videoId}`,
                    data: jobData,
                    updateProgress: async (p) => {
                        console.log(`[Local Transcode Progress] Video ${jobData.videoId}: ${p}%`);
                    },
                });
            } catch (fallbackErr) {
                console.error(`[Fallback Transcode Error]:`, fallbackErr.message);
            }
        });
        return null;
    }
};

export default {
    videoTranscodeQueue,
    addTranscodeJob,
};


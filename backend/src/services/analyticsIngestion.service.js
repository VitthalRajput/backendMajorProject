import { WatchEvent } from "../models/watchEvent.model.js";
import { Video } from "../models/video.model.js";
import { redisConnection } from "../config/redis.js";

class AnalyticsIngestionService {
    constructor() {
        this.eventBuffer = [];
        this.batchSize = 50;
        this.flushIntervalMs = 5000;
        this.isFlushing = false;

        // Start periodic background flush
        this.intervalId = setInterval(() => {
            this.flush();
        }, this.flushIntervalMs);
    }

    /**
     * Ingest a single watch ping event into high-throughput buffer
     * @param {{ videoId: string, userId?: string, channelId: string, watchDurationSeconds: number, retentionPointSeconds: number, deviceType?: string }} pingData
     */
    async ingestPing(pingData) {
        const event = {
            videoId: pingData.videoId,
            userId: pingData.userId || null,
            channelId: pingData.channelId,
            watchDurationSeconds: Math.max(0, Number(pingData.watchDurationSeconds) || 0),
            retentionPointSeconds: Math.max(0, Number(pingData.retentionPointSeconds) || 0),
            deviceType: pingData.deviceType || "desktop",
            createdAt: new Date(),
        };

        this.eventBuffer.push(event);

        // Buffer view increments in Redis if connected
        const videoIdStr = String(pingData.videoId);
        try {
            if (redisConnection && redisConnection.status === "ready") {
                await redisConnection.hincrby("analytics:views:buffer", videoIdStr, 1);
                if (event.watchDurationSeconds > 0) {
                    await redisConnection.hincrby(
                        "analytics:watchtime:buffer",
                        videoIdStr,
                        Math.round(event.watchDurationSeconds)
                    );
                }
            }
        } catch (err) {
            // Non-blocking warning if Redis is unreachable
        }

        // Trigger immediate flush if batch size reached
        if (this.eventBuffer.length >= this.batchSize) {
            setImmediate(() => this.flush());
        }

        return true;
    }

    /**
     * Flush buffered watch events using bulkWrite operations
     */
    async flush() {
        if (this.isFlushing) return;
        this.isFlushing = true;

        try {
            // 1. Flush watch events to MongoDB
            if (this.eventBuffer.length > 0) {
                const eventsToInsert = this.eventBuffer.splice(0, this.eventBuffer.length);
                const bulkOps = eventsToInsert.map((doc) => ({
                    insertOne: {
                        document: doc,
                    },
                }));

                await WatchEvent.bulkWrite(bulkOps, { ordered: false });
            }

            // 2. Flush Redis view counts buffer to Video collection
            await this.flushRedisBuffers();
        } catch (err) {
            console.error("[Analytics Ingestion Error] Flush failed:", err.message);
        } finally {
            this.isFlushing = false;
        }
    }

    /**
     * Flush Redis view buffers to Video documents
     */
    async flushRedisBuffers() {
        try {
            if (!redisConnection || redisConnection.status !== "ready") {
                return;
            }

            // Read view count increments
            const viewCounts = await redisConnection.hgetall("analytics:views:buffer");
            if (viewCounts && Object.keys(viewCounts).length > 0) {
                const bulkVideoOps = [];
                for (const [vId, countStr] of Object.entries(viewCounts)) {
                    const count = parseInt(countStr, 10);
                    if (count > 0) {
                        bulkVideoOps.push({
                            updateOne: {
                                filter: { _id: vId },
                                update: { $inc: { views: count } },
                            },
                        });
                    }
                }

                if (bulkVideoOps.length > 0) {
                    await Video.bulkWrite(bulkVideoOps, { ordered: false });
                }

                // Delete the flushed keys
                await redisConnection.del("analytics:views:buffer");
                await redisConnection.del("analytics:watchtime:buffer");
            }
        } catch (err) {
            console.warn("[Analytics Ingestion Warning] Redis buffer flush:", err.message);
        }
    }

    /**
     * Cleanup on graceful server shutdown
     */
    async shutdown() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
        await this.flush();
    }
}

export const analyticsIngestionService = new AnalyticsIngestionService();
export default analyticsIngestionService;


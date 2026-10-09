import cron from "node-cron";
import { AnalyticsAggregationService } from "./analyticsAggregation.service.js";

class CronService {
    constructor() {
        this.jobs = [];
    }

    /**
     * Start all scheduled analytics cron jobs
     */
    start() {
        console.log("[Cron Service] Initializing analytics cron jobs...");

        // 1. Hourly aggregation job (at minute 0 of every hour)
        const hourlyJob = cron.schedule("0 * * * *", async () => {
            console.log("[Cron Job] Running hourly analytics aggregation...");
            try {
                await AnalyticsAggregationService.summarizeDailyAnalytics(new Date());
            } catch (err) {
                console.error("[Cron Job Error] Hourly analytics aggregation failed:", err.message);
            }
        });
        this.jobs.push(hourlyJob);

        // 2. Midnight consolidation job (at 00:05 AM every day for previous day's final consolidation)
        const dailyJob = cron.schedule("5 0 * * *", async () => {
            console.log("[Cron Job] Running daily analytics consolidation for previous day...");
            try {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                await AnalyticsAggregationService.summarizeDailyAnalytics(yesterday);
            } catch (err) {
                console.error("[Cron Job Error] Daily analytics consolidation failed:", err.message);
            }
        });
        this.jobs.push(dailyJob);

        console.log("[Cron Service] Scheduled: Hourly aggregation ('0 * * * *') & Daily consolidation ('5 0 * * *')");
    }

    /**
     * Stop all running cron jobs
     */
    stop() {
        this.jobs.forEach((job) => job.stop());
        this.jobs = [];
        console.log("[Cron Service] Stopped all scheduled cron jobs");
    }

    /**
     * Manually trigger aggregation for a specific date
     * @param {Date} date
     */
    async triggerSummarize(date = new Date()) {
        await AnalyticsAggregationService.summarizeDailyAnalytics(date);
    }
}

export const cronService = new CronService();
export default cronService;


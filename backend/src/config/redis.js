import { Redis } from "ioredis";

const redisHost = process.env.REDIS_HOST || "127.0.0.1";
const redisPort = parseInt(process.env.REDIS_PORT || "6379", 10);
const redisPassword = process.env.REDIS_PASSWORD || undefined;

export const redisOptions = {
    host: redisHost,
    port: redisPort,
    password: redisPassword,
    maxRetriesPerRequest: null, // Required by BullMQ
    enableReadyCheck: false,
    retryStrategy(times) {
        if (times > 5) {
            // Keep retry backoff to 10 seconds when offline to prevent log spam
            return 10000;
        }
        return Math.min(times * 1000, 3000);
    },
};

export const redisConnection = process.env.REDIS_URL
    ? new Redis(process.env.REDIS_URL, {
          maxRetriesPerRequest: null,
          enableReadyCheck: false,
      })
    : new Redis(redisOptions);

let hasLoggedWarning = false;

redisConnection.on("connect", () => {
    hasLoggedWarning = false;
    console.log(`[Redis] Connected to Redis at ${redisHost}:${redisPort}`);
});

redisConnection.on("error", (err) => {
    if (!hasLoggedWarning) {
        console.warn(`[Redis Connection Warning]: ${err.message}. Retrying in background...`);
        hasLoggedWarning = true;
    }
});

export default redisConnection;


import { rateLimit } from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import redisConnection from "../config/redis.js";

/**
 * Creates a RedisStore backed by the active ioredis connection.
 */
const createRedisStore = (prefix) => {
    return new RedisStore({
        sendCommand: (...args) => redisConnection.call(...args),
        prefix: `rl:${prefix}:`
    });
};

/**
 * Standard error response formatter matching StreamCore's JSON structure.
 */
const createRateLimitHandler = (message) => {
    return (req, res /*, next, options */) => {
        return res.status(429).json({
            statusCode: 429,
            data: null,
            message: message || "Too many requests from this IP, please try again later.",
            success: false,
            errors: ["Rate limit exceeded"]
        });
    };
};

/**
 * 1. Strict Limiter for Authentication Routes
 * Mitigates brute-force attacks on login and registration/signup.
 * Window: 15 minutes | Max: 10 attempts per IP
 */
export const authLimiter = rateLimit({
    store: createRedisStore("auth"),
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    passOnStoreError: true, // Prevents blocking requests if Redis connection is temporarily interrupted
    handler: createRateLimitHandler("Too many authentication attempts from this IP, please try again after 15 minutes.")
});

/**
 * 2. Standard API Limiter for General Read Routes
 * Protects read endpoints and general API usage against scraping and Denial of Service.
 * Window: 15 minutes | Max: 300 requests per IP
 */
export const standardApiLimiter = rateLimit({
    store: createRedisStore("api"),
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    passOnStoreError: true,
    handler: createRateLimitHandler("Too many requests from this IP, please try again later.")
});

/**
 * 3. Upload & Write Limiter
 * Mitigates spam and abuse on video creation and comment publishing endpoints.
 * Window: 15 minutes | Max: 25 write/upload actions per IP
 */
export const uploadLimiter = rateLimit({
    store: createRedisStore("write"),
    windowMs: 15 * 60 * 1000,
    limit: 25,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    passOnStoreError: true,
    handler: createRateLimitHandler("Too many create or upload requests. Please slow down and try again later.")
});


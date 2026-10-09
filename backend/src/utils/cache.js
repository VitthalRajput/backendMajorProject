import redisConnection from "../config/redis.js";

/**
 * Generates a dynamic Redis cache key combining prefix, route resource IDs, and query params.
 * Properly accounts for pagination query parameters (page, limit) and optional filter queries.
 */
export const generateCacheKey = (keyPrefix, req) => {
    const resourceId = req.params?.videoId || req.params?.id || req.params?.commentId || "";
    const page = req.query?.page;
    const limit = req.query?.limit;

    const parts = [keyPrefix];

    if (resourceId) {
        parts.push(resourceId);
    }

    // Capture pagination params
    const queryParts = [];
    if (page !== undefined) queryParts.push(`p=${page}`);
    if (limit !== undefined) queryParts.push(`l=${limit}`);

    // Capture additional query filters if present
    if (req.query?.query) queryParts.push(`q=${encodeURIComponent(req.query.query)}`);
    if (req.query?.sortBy) queryParts.push(`sb=${req.query.sortBy}`);
    if (req.query?.sortType) queryParts.push(`st=${req.query.sortType}`);

    if (queryParts.length > 0) {
        parts.push(queryParts.join("&"));
    }

    return parts.join(":");
};

/**
 * Reusable cache-aside middleware using ioredis.
 * Checks Redis for cached response. If HIT, sends cached JSON immediately.
 * If MISS, intercepts res.json to cache the outgoing successful response with TTL.
 *
 * @param {string|Function} keyPrefix - String prefix or function (req) => string
 * @param {number} ttlSeconds - Time to live in seconds (default: 300)
 */
export const cacheAside = (keyPrefix, ttlSeconds = 300) => {
    return async (req, res, next) => {
        // Only cache GET requests
        if (req.method !== "GET") {
            return next();
        }

        const cacheKey = typeof keyPrefix === "function"
            ? keyPrefix(req)
            : generateCacheKey(keyPrefix, req);

        req._cacheKey = cacheKey;

        try {
            // Check if Redis is connected/ready
            if (redisConnection && (redisConnection.status === "ready" || redisConnection.status === "connect")) {
                const cachedData = await redisConnection.get(cacheKey);

                if (cachedData) {
                    res.setHeader("X-Cache", "HIT");
                    res.setHeader("X-Cache-Key", cacheKey);
                    try {
                        const parsed = JSON.parse(cachedData);
                        return res.status(200).json(parsed);
                    } catch (parseErr) {
                        console.warn(`[Redis Cache Parse Error] Key ${cacheKey}:`, parseErr.message);
                        // In case of corrupt cache, delete and proceed to handler
                        await redisConnection.del(cacheKey);
                    }
                }
            }
        } catch (readErr) {
            console.warn(`[Redis Cache Read Warning] ${cacheKey}:`, readErr.message);
        }

        res.setHeader("X-Cache", "MISS");

        // Intercept res.json to cache successful responses (2xx)
        const originalJson = res.json.bind(res);
        res.json = (body) => {
            if (res.statusCode >= 200 && res.statusCode < 300 && body !== undefined && body !== null) {
                if (redisConnection && (redisConnection.status === "ready" || redisConnection.status === "connect")) {
                    redisConnection.set(cacheKey, JSON.stringify(body), "EX", ttlSeconds)
                        .catch((err) => {
                            console.warn(`[Redis Cache Set Warning] Failed to cache ${cacheKey}:`, err.message);
                        });
                }
            }
            return originalJson(body);
        };

        next();
    };
};

/**
 * Programmatic cache-aside utility for fetching or storing data.
 *
 * @param {string} key - Cache key
 * @param {number} ttlSeconds - TTL in seconds
 * @param {Function} fetcherFn - Async function returning fresh data on miss
 */
export const cacheAsideFetch = async (key, ttlSeconds = 300, fetcherFn) => {
    try {
        if (redisConnection && (redisConnection.status === "ready" || redisConnection.status === "connect")) {
            const cached = await redisConnection.get(key);
            if (cached) {
                return JSON.parse(cached);
            }
        }
    } catch (err) {
        console.warn(`[Redis Cache Fetch Warning] ${key}:`, err.message);
    }

    const freshData = await fetcherFn();

    try {
        if (freshData !== undefined && freshData !== null && redisConnection && (redisConnection.status === "ready" || redisConnection.status === "connect")) {
            await redisConnection.set(key, JSON.stringify(freshData), "EX", ttlSeconds);
        }
    } catch (err) {
        console.warn(`[Redis Cache Store Warning] ${key}:`, err.message);
    }

    return freshData;
};

/**
 * Deletes specific Redis keys.
 */
export const deleteCache = async (...keys) => {
    try {
        if (!redisConnection || (redisConnection.status !== "ready" && redisConnection.status !== "connect")) {
            return;
        }
        const validKeys = keys.filter(Boolean);
        if (validKeys.length > 0) {
            await redisConnection.del(...validKeys);
        }
    } catch (err) {
        console.warn("[Redis Cache Deletion Warning]:", err.message);
    }
};

/**
 * Invalidates Redis keys matching a pattern non-blockingly using scanStream.
 */
export const invalidateCachePattern = async (pattern) => {
    try {
        if (!redisConnection || (redisConnection.status !== "ready" && redisConnection.status !== "connect")) {
            return;
        }

        const stream = redisConnection.scanStream({
            match: pattern,
            count: 100
        });

        const keysToDelete = [];
        for await (const resultKeys of stream) {
            for (const key of resultKeys) {
                keysToDelete.push(key);
            }
        }

        if (keysToDelete.length > 0) {
            for (let i = 0; i < keysToDelete.length; i += 100) {
                const chunk = keysToDelete.slice(i, i + 100);
                if (chunk.length > 0) {
                    await redisConnection.del(...chunk);
                }
            }
        }
    } catch (err) {
        console.warn(`[Redis Invalidate Pattern Warning] Pattern "${pattern}":`, err.message);
    }
};

/**
 * Domain-specific invalidation hooks
 */
export const invalidateVideoCache = async (videoId) => {
    const idStr = videoId?.toString ? videoId.toString() : videoId;
    await Promise.all([
        idStr ? invalidateCachePattern(`videos:detail:${idStr}*`) : Promise.resolve(),
        invalidateCachePattern("videos:trending*"),
        invalidateCachePattern("videos:feed*")
    ]);
};

export const invalidateCommentCache = async (videoId) => {
    const idStr = videoId?.toString ? videoId.toString() : videoId;
    await Promise.all([
        idStr ? invalidateCachePattern(`comments:video:${idStr}*`) : Promise.resolve(),
        idStr ? invalidateCachePattern(`comments:${idStr}*`) : Promise.resolve(),
        invalidateCachePattern("comments:*")
    ]);
};

export const invalidateVideoLikesCache = async (videoId) => {
    const idStr = videoId?.toString ? videoId.toString() : videoId;
    await Promise.all([
        idStr ? invalidateCachePattern(`videos:detail:${idStr}*`) : Promise.resolve(),
        invalidateCachePattern("videos:trending*")
    ]);
};


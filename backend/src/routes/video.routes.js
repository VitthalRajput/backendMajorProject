import { Router } from "express"
import {
    getAllVideos,
    getTrendingVideos,
    publishAVideo,
    getVideoById,
    getVideoStatusStream,
    updateVideo,
    deleteVideo,
    togglePublishStatus
} from "../controllers/video.controller.js"
import { getVideoComments } from "../controllers/comment.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { upload } from "../middlewares/multer.middleware.js"
import { cacheAside } from "../utils/cache.js"
import { uploadLimiter } from "../middlewares/rateLimiter.middleware.js"

const router = Router()

// Public route to browse videos feed & search
router.route("/").get(getAllVideos)

// Secured route to publish a new video with upload spam protection
router.route("/").post(
    verifyJWT,
    uploadLimiter,
    upload.fields([
        { name: "videoFile", maxCount: 1 },
        { name: "thumbnail", maxCount: 1 }
    ]),
    publishAVideo
)

// Trending videos endpoint with distributed Redis cache (300s TTL)
// Defined BEFORE /:videoId to prevent param collision
router.route("/trending").get(cacheAside("videos:trending", 300), getTrendingVideos)

// High-read comments endpoint on video route with distributed cache (120s TTL)
router.route("/:videoId/comments").get(cacheAside("comments:video", 120), getVideoComments)
router.route("/:id/comments").get(cacheAside("comments:video", 120), getVideoComments)

// Real-time SSE endpoint for video transcoding status updates
router.route("/:videoId/status-stream").get(getVideoStatusStream)
router.route("/status-stream/:videoId").get(getVideoStatusStream)

// High-read public route to view video details with distributed Redis cache (300s TTL)
router.route("/:videoId").get(cacheAside("videos:detail", 300), getVideoById)

// Secured video modifications
router.route("/:videoId").delete(verifyJWT, deleteVideo)
router.route("/:videoId").patch(verifyJWT, upload.single("thumbnail"), updateVideo)
router.route("/toggle/publish/:videoId").patch(verifyJWT, togglePublishStatus)

export default router
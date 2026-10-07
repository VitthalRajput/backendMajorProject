import { Router } from "express"
import {
    getAllVideos,
    publishAVideo,
    getVideoById,
    getVideoStatusStream,
    updateVideo,
    deleteVideo,
    togglePublishStatus
} from "../controllers/video.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { upload } from "../middlewares/multer.middleware.js"

const router = Router()

// Public route to browse videos feed & search
router.route("/").get(getAllVideos)

// Secured route to publish a new video
router.route("/").post(
    verifyJWT,
    upload.fields([
        { name: "videoFile", maxCount: 1 },
        { name: "thumbnail", maxCount: 1 }
    ]),
    publishAVideo
)

// Real-time SSE endpoint for video transcoding status updates
router.route("/:videoId/status-stream").get(getVideoStatusStream)
router.route("/status-stream/:videoId").get(getVideoStatusStream)

// Public route to view video details
router.route("/:videoId").get(getVideoById)

// Secured video modifications
router.route("/:videoId").delete(verifyJWT, deleteVideo)
router.route("/:videoId").patch(verifyJWT, upload.single("thumbnail"), updateVideo)
router.route("/toggle/publish/:videoId").patch(verifyJWT, togglePublishStatus)

export default router
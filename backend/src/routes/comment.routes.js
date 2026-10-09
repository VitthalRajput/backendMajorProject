import { Router } from "express"
import {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
} from "../controllers/comment.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { cacheAside } from "../utils/cache.js"
import { uploadLimiter } from "../middlewares/rateLimiter.middleware.js"

const router = Router()

router.use(verifyJWT)

router.route("/:videoId")
    .get(cacheAside("comments:video", 120), getVideoComments)
    .post(uploadLimiter, addComment)

router.route("/c/:commentId")
    .patch(updateComment)
    .delete(deleteComment)

export default router
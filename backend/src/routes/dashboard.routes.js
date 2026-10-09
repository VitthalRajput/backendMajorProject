import { Router } from "express"
import {
    getChannelStats,
    getChannelVideos,
    getDashboardOverview,
    getVideoRetention
} from "../controllers/dashboard.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"

const router = Router()

// All dashboard routes are secured with authentication
router.use(verifyJWT)

router.route("/stats").get(getChannelStats)
router.route("/videos").get(getChannelVideos)
router.route("/overview").get(getDashboardOverview)
router.route("/videos/:videoId/retention").get(getVideoRetention)

export default router
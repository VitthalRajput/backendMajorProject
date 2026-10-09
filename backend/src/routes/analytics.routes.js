import { Router } from "express";
import { recordWatchPing } from "../controllers/analytics.controller.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

const router = Router();

/**
 * Middleware that extracts user if accessToken is present,
 * but allows unauthenticated guest viewers through without error.
 */
const optionalJWT = async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        if (token && process.env.ACCESS_TOKEN_SECRET) {
            const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
            if (decodedToken?._id) {
                const user = await User.findById(decodedToken._id).select("-password -refreshToken");
                if (user) {
                    req.user = user;
                }
            }
        }
    } catch (err) {
        // Proceed as anonymous/guest viewer
    }
    next();
};

// High-throughput watch heartbeat ping endpoint
router.route("/watch-ping").post(optionalJWT, recordWatchPing);

export default router;


import { Router } from "express";
import { registerUser, refreshAccessToken } from "../controllers/user.controller.js";
import {upload } from "../middlewares/multer.middleware.js"
import { loginUser } from "../controllers/user.controller.js";
import { loggedOut } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/register").post(
    upload.fields([
        { 
            name:"avatar",
            maxCount:1
        },
        {name:"coverImage",
            maxCount:1
        }
    ]),
    registerUser)

    router.route( "/login").post(loginUser)
    
    // Secure Routes
    router.route("/logout").post(verifyJWT, loggedOut)
    router.route("/refresh-token").post(refreshAccessToken)

export default router
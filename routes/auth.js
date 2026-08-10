const express = require("express");
const authMiddleware = require("../middlewares/authentication");
const generateError = require("../utils/error");
const { User, GoogleCredentials } = require("../models/index");

const router = express.Router();


router.get("/me", authMiddleware, async (req, res, next) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: {
                exclude: ["sessionTokenHash", "sessionTokenExpiresAt"]
            },

            include: {
                model: GoogleCredentials,
                as: "googleAccount",

                attributes: {
                    exclude: [
                        "googleSub",
                        "googleEmail",
                        "encryptedRefreshToken",
                        "encryptedAccessToken",
                        "accessTokenExpiresAt",
                        "userId",
                        "grantedScopes"
                    ]
                }
            }
        });


        if (!user) {
            return next(generateError(404, "User could not be found"));
        }

        // This is what front end gets about the user.
        // If front end during development process will need something else
        // This part could be adjusted accordingly.
        res.status(200).json({
            user: {
                id: user.id,
                email: user.email,
                authorizationStatus: user.googleAccount.authorizationStatus
            }
        })

    } catch (err) {
        next(err);
    }
})



router.post("/logout", authMiddleware, async (req, res, next) => {
    try {

        const user = await User.findByPk(req.user.id);

        if(!user) {
            return next(generateError(404, "Could not find User"));
        }

        await user.update({
            sessionTokenHash: null,
            sessionTokenExpiresAt: null
        });

        res.clearCookie("sessionToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV.toLowerCase() !== "development",
            sameSite: "lax",
        })

        res.sendStatus(204);

    } catch (err) {
        next(err);
    }
})




module.exports = router;
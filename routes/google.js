const express = require("express");
const oauth2Client = require("../config/googleOAuth");
const { User, GoogleCredentials } = require("../models/index");
const authMiddleware = require("../middlewares/authentication");
const crypto = require("crypto");
const hash = require("../utils/hash");
const generateError = require("../utils/error");
const { encrypt } = require("../utils/tokenEncryption");
require("dotenv").config();


const router = express.Router();


router.get("/google", (req, res, next) => {

    const state = crypto.randomBytes(32).toString("hex");

    res.cookie("googleOAuthState", state, {
        httpOnly: true,
        secure: process.env.NODE_ENV.toLowerCase() !== "development",
        sameSite: "lax",
        maxAge: 10 * 60 * 1000
    })

    // This something like, When I send this user to Google, here is what kind of access 
    // my app wants and how I want the authorization flow to behave
    const authorizationUrl = oauth2Client.generateAuthUrl({
        access_type: "offline",
        prompt: "consent",
        scope: [
            "openid",
            "email",
            "profile",
            "https://www.googleapis.com/auth/gmail.modify"
        ],
        state: state
    });

    res.redirect(authorizationUrl);
});



router.get("/google/callback", async (req, res, next) => {
    try {

        const cookieBody = {
            httpOnly: true,
            secure: process.env.NODE_ENV.toLowerCase() !== "development",
            sameSite: "lax",
        }

        const { code, state, error } = req.query;

        if (error) {
            res.clearCookie("googleOAuthState", cookieBody);
            return next(generateError(403, 'Google sign-in was cancelled'));
        }

        const cookieState = req.cookies.googleOAuthState;

        if (state !== cookieState) {
            res.clearCookie("googleOAuthState", cookieBody);
            return next(generateError(400, "Invalid OAuth state"));
        }

        res.clearCookie("googleOAuthState", cookieBody);

        const { tokens } = await oauth2Client.getToken(code);

        const ticket = await oauth2Client.verifyIdToken({
            idToken: tokens.id_token,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();

        const matchedCredentials = await GoogleCredentials.findOne({
            where: {
                googleSub: payload.sub
            }
        })

        const updatesObj = {};
        let idOfUser;

        if (matchedCredentials) {

            updatesObj.encryptedAccessToken = encrypt(tokens.access_token);
            updatesObj.accessTokenExpiresAt = new Date(tokens.expiry_date);


            if (tokens.refresh_token) {

                updatesObj.encryptedRefreshToken = encrypt(tokens.refresh_token);
            }

            if (matchedCredentials.googleEmail !== payload.email.trim().toLowerCase()) {

                updatesObj.googleEmail = payload.email.trim().toLowerCase();

                await User.update(
                    {
                        email: payload.email.trim().toLowerCase()
                    },

                    {
                        where: {
                            id: matchedCredentials.userId
                        },
                    }
                )
            }

            idOfUser = matchedCredentials.userId;

            updatesObj.authorizationStatus = "connected";
            await matchedCredentials.update(updatesObj);

        } else {

            const newUser = await User.create({
                email: payload.email,
            })

            const scopes = tokens.scope.split(" ");

            const newGoogleCredentials = await GoogleCredentials.create({
                googleSub: payload.sub,
                googleEmail: payload.email.trim().toLowerCase(),
                userId: newUser.id,
                displayName: payload.name,
                encryptedRefreshToken: encrypt(tokens.refresh_token),
                encryptedAccessToken: encrypt(tokens.access_token),
                accessTokenExpiresAt: new Date(tokens.expiry_date),
                grantedScopes: scopes,
            })

            idOfUser = newUser.id;
        }

        const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // Duration of 7 days

        const sessionToken = crypto.randomBytes(32).toString("hex");
        const hashedSessionToken = hash(sessionToken);

        const user = await User.findByPk(idOfUser);

        await user.update({
            sessionTokenHash: hashedSessionToken,
            sessionTokenExpiresAt: new Date(Date.now() + SESSION_DURATION)
        });

        res.cookie("sessionToken", sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV.toLowerCase() !== "development",
            sameSite: "lax",
            maxAge: SESSION_DURATION
        })

        // TODO: once the extension UI exists, this needs to actually tell the
        // extension "hey, auth is done" - right now it's just a JSON blob
        // sitting in a browser tab that nothing is watching. Options later:
        // close the tab automatically and let the extension notice, or
        // redirect to a page the extension is watching for, or just switch to
        // chrome.identity.launchWebAuthFlow which handles this for us.
        res.json({ success: true });

    } catch (err) {
        next(err);
    }
})


module.exports = router;

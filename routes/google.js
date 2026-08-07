const express = require("express");
const oauth2Client = require("../config/googleOAuth");
const { User, GoogleCredentials } = require("../models/index");

const router = express.Router();


router.get("/google", async (req, res, next) => {
    try {

        const googleAccount = await GoogleCredentials.findOne({
            where: {
                
            }
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
            ]
        });

        res.redirect(authorizationUrl);

    } catch (error) {
        next(error);
    }
})


module.exports = router;

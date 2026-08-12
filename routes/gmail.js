const express = require("express");
const { google } = require("googleapis");
const authMiddleware = require("../middlewares/authentication");
const { GoogleCredentials } = require("../models/index");
const googleTokenRefresh = require("../utils/googleTokenRefresh");
require("dotenv").config();


const router = express.Router();


router.get("/", authMiddleware, async (req, res, next) => {
    try {

        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_REDIRECT_URI
        );

        const id = req.user.id;

        const matchingCredentials = await GoogleCredentials.findOne({
            where: {
                userId: id
            }
        });

        const rawAccessToken = await googleTokenRefresh(matchingCredentials);

        oauth2Client.setCredentials({
            access_token: rawAccessToken
        });

        // Creating gmail client as well and giving it the modified 
        // OAuth2 client, in modify I mean with the access token
        // set as its new credential. Acess Token that we just got from the
        // googleTokenRefresh function.


        const gmail = google.gmail({
            version: "v1",
            auth: oauth2Client
        });


        const emailList = await gmail.users.messages.list({
            userId: "me",
            q: "in:inbox is:unread -is:starred older_than:14d -is:important" 
        })

        /*
        
        const gmail = google.gmail({
            version: "v1",
            auth: oauth2Client
        });


        // Only the test case this is not supposed to go in the 
        // real code, had to do it to make sure 
        // that I could get specific email and format it as we needed.

        const response = await gmail.users.messages.get({
            userId: "me",
            id: "19fd2c2fc30c6325"
        });

        const message = response.data;

        const headers = message.payload.headers ?? [];
        const labels = message.labelIds ?? [];

        const from = headers.find(
            header => header.name === "From"
        )?.value ?? null;

        const subject = headers.find(
            header => header.name === "Subject"
        )?.value ?? null;

        const date = headers.find(
            header => header.name === "Date"
        )?.value ?? null;

        const plainTextPart = message.payload.parts?.find(
            part => part.mimeType === "text/plain"
        );

        let body = null;

        if (plainTextPart?.body?.data) {
            body = Buffer.from(
                plainTextPart.body.data,
                "base64url"
            ).toString("utf-8");
        }

        const email = {
            id: message.id,
            threadId: message.threadId,

            from,
            subject,
            date,

            snippet: message.snippet,

            labels,

            isRead: !labels.includes("UNREAD"),
            isStarred: labels.includes("STARRED"),
            isImportant: labels.includes("IMPORTANT"),
            isInInbox: labels.includes("INBOX"),

            body
        };
        */

        const result = [];

        const messages = emailList.data.messages ?? [];

        for (const message of messages) {
            const response = await gmail.users.messages.get({
                userId: "me",
                id: message.id,
                format: "metadata",
                metadataHeaders: ["From", "Subject", "Date"]
            });

            const headers = response.data.payload?.headers ?? [];

            const getHeader = (name) =>
                headers.find(
                    header => header.name.toLowerCase() === name.toLowerCase()
                )?.value;

            const obj = {
                id: response.data.id,
                from: getHeader("From"),
                subject: getHeader("Subject"),
                date: getHeader("Date"),
                labels: response.data.labelIds
            }

            result.push(obj);
        }


        return res.json(result)

    } catch (err) {

        next(err)
    }
})



module.exports = router;
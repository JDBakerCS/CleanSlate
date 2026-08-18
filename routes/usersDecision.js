const express = require("express");
const authMiddleware = require("../middlewares/authentication");
const generateError = require("../utils/error");
const { ClassificationRun, GoogleCredentials } = require("../models/index");
const { google } = require("googleapis");
const googleTokenRefresh = require("../services/googleTokenRefresh");
const pLimit = require("p-limit");

const router = express.Router();



router.post("/:runId/accept", authMiddleware, async (req, res, next) => {
    try {

        const limit = pLimit(5);

        const { labelName } = req.body;

        const trimmedLabelName = typeof labelName === "string" ? labelName.trim() : "";

        if (!trimmedLabelName) {
            return next(generateError(400, "labelName is required"));
        }

        const runId = Number(req.params.runId);

        if (Number.isNaN(runId)) {
            return next(generateError(400, "runId must be a number"));
        }

        const run = await ClassificationRun.findOne({
            where: {
                id: runId,
                userId: req.user.id
            }
        });

        if (!run) {
            return next(generateError(404, "Specific run could not be found"));
        }

        const matchedLabelNameObj = run.result.categories.find(({ labelName }) => {
            return trimmedLabelName === labelName;
        });

        if (!matchedLabelNameObj) {
            return next(generateError(404, "No such label exists in this specific run"));
        }

        if(matchedLabelNameObj.status === "completed") return next(generateError(409, "This category has already been accepted"));

        const matchingCredentials = await GoogleCredentials.findOne({
            where: { userId: req.user.id }
        });


        const rawAccessToken = await googleTokenRefresh(matchingCredentials);

        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_REDIRECT_URI
        );


        oauth2Client.setCredentials({ access_token: rawAccessToken });

        const gmail = google.gmail({ version: "v1", auth: oauth2Client });

        let labelResult = null;

        if (matchedLabelNameObj.existingLabelId === null) {
            labelResult = await gmail.users.labels.create({
                userId: "me",
                requestBody: {
                    name: trimmedLabelName
                }
            })
        }

        const realLabelId = matchedLabelNameObj.existingLabelId ?? labelResult.data.id;


        const promisesArr = matchedLabelNameObj.threadIds.map(({ threadId }) => {
            return limit(() => {
                return gmail.users.threads.modify({
                    userId: "me",
                    id: threadId,

                    requestBody: {
                        addLabelIds: [realLabelId],
                        removeLabelIds: ["INBOX"]
                    }
                })
            })
        })

        await Promise.all(promisesArr);

        matchedLabelNameObj.status = "completed";
        matchedLabelNameObj.existingLabelId = realLabelId;

        run.changed("result", true);
        await run.save();

        res.status(200).json({
            labelName: matchedLabelNameObj.labelName,
            status: matchedLabelNameObj.status,
            existingLabelId: matchedLabelNameObj.existingLabelId
        });

    } catch (err) {
        next(err);
    }
})






module.exports = router;
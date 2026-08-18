const express = require("express");
const authMiddleware = require("../middlewares/authentication");
const allEmails = require("../services/emails");
const ai = require("../config/gemini");
const geminiIntegration = require("../services/geminiService");
const { ClassificationRun } = require("../models/index");

const router = express.Router();


router.get("/", authMiddleware, async (req, res, next) => {
    try {

        // first and second stage filter and its results.
        const returned = await allEmails(req.user.id);

        // AI integration part and the result returned from it.
        const result = await geminiIntegration(returned.forGemini, returned.labels);

        // Gemini only ever saw stripped-down thread data and only returns
        // threadId + confidenceScore, so attach the actual emails back on
        // using the full thread data already fetched above.
        const threadsById = new Map(returned.threads.map((thread) => [thread.threadId, thread]));

        result.categories.forEach((category) => {
            category.threadIds = category.threadIds.map(({ threadId, confidenceScore }) => {
                const fullThread = threadsById.get(threadId);

                const messages = fullThread
                    ? fullThread.messages.map(({ threadId, labels, ...rest }) => rest)
                    : [];

                return {
                    threadId,
                    confidenceScore,
                    messages
                };
            });
        });

        const newClassificationRun = await ClassificationRun.create({
            userId: req.user.id,
            result: result
        });

        const formattedResult = {
            runId: newClassificationRun.id,
            categories: result.categories
        };

        res.status(200).json(formattedResult)

    } catch (err) {

        next(err);
    }
})


module.exports = router;
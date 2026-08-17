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

        const newClassificationRun = await ClassificationRun.create({
            userId: req.user.id,
            result: result
        });

        const formattedResult = {
            labels: result.labels,
            runId: newClassificationRun.id,
            categories: result.categories
        };

        res.status(200).json(formattedResult)

    } catch (err) {

        next(err);
    }
})


module.exports = router;
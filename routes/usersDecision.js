const express = require("express");
const authMiddleware = require("../middlewares/authentication");
const generateError = require("../utils/error");
const { ClassificationRun } = require("../models/index");

const router = express.Router();



router.post("/:runId/accept", authMiddleware ,async (req, res, next) => {
   
    const { labelName } = req.body;

    if(!labelName || typeof labelName !== "string") {}
})






module.exports = router;
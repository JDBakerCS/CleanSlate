const express = require("express");
const authMiddleware = require("../middlewares/authentication");
const allEmails = require("../utils/emails");

const router = express.Router();


router.get("/", authMiddleware, async (req, res, next) => {
    try {

        const returned = await allEmails(req.user.id)

        res.status(200).json(returned);

    } catch (err) {

        next(err)
    }
})


module.exports = router;
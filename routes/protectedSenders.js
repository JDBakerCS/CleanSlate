const express = require("express");
const authMiddleware = require("../middlewares/authentication");
const generateError = require("../utils/error");
const { ProtectedSender } = require("../models/index");

const router = express.Router();


router.post("/", authMiddleware, async (req, res, next) => {
    try {

        const emailStruct = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        const id = req.user.id;

        const { displayName, senderEmail} = req.body;

        if(!senderEmail || typeof senderEmail !== "string" || !emailStruct.test(senderEmail)) {
            return next(generateError(400, "Invalid email format. Use a format like someone@example.com."));
        }

        if(displayName !== undefined && (typeof displayName !== "string" || Array.from(displayName).length > 255)) {
    
            return next(generateError(400, "Name has to be string max of 255 characters"));
        }

        const newProtectedSender = await ProtectedSender.create({
            userId: id,
            displayName: displayName ?? null,
            senderEmail: senderEmail.trim().toLowerCase()
        });

        res.status(201).json(newProtectedSender);

    } catch(err) {
        if(err.name === "SequelizeUniqueConstraintError") {
            return next(generateError(409, "This sender is already protected"));
        }

        next(err);
    }
})



router.get("/", authMiddleware, async (req, res, next) => {
    try {
        const id = req.user.id;

        const allProtectedSenders = await ProtectedSender.findAll({
            where: {
                userId: id
            },

            attributes: {
                exclude: [
                    "userId"
                ]
            }
        });


        // very basic version, if we decide to add pagination the structure of the 
        // whole get route will change.
        res.status(200).json(allProtectedSenders);

    } catch(err) {
        next(err)
    }
})


router.delete("/:id", authMiddleware, async (req, res, next) => {
    try {
        
        const reqId = Number(req.params.id);

        const sender = await ProtectedSender.findOne({
            where: {
                userId: req.user.id,
                id: reqId
            }
        });
        

        if(!sender) {
            return next(generateError(404, "Specific Protected user does not exist"));
        }

        await sender.destroy();

        res.sendStatus(204);

    } catch(err) {
        next(err);
    }
})


module.exports = router;
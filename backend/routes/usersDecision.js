const express = require("express");
const authMiddleware = require("../middlewares/authentication");
const pLimit = require("p-limit");
const loadCategoryDecision = require("../middlewares/categoryDecision");
const generateError = require("../utils/error");

const router = express.Router();


router.post("/:runId/accept", authMiddleware, loadCategoryDecision("accepted"), async (req, res, next) => {
    try {

        const limit = pLimit(5);

        let labelResult = null;

        if (req.category.existingLabelId === null) {
            labelResult = await req.gmail.users.labels.create({
                userId: "me",
                requestBody: {
                    name: req.labelName
                }
            })
        }

        const realLabelId = req.category.existingLabelId ?? labelResult.data.id;


        const promisesArr = req.category.threadIds.map(({ threadId }) => {
            return limit(() => {
                return req.gmail.users.threads.modify({
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

        req.category.status = "completed";
        req.category.existingLabelId = realLabelId;

        req.run.changed("result", true);
        await req.run.save();

        res.status(200).json({
            labelName: req.category.labelName,
            status: req.category.status,
            existingLabelId: req.category.existingLabelId
        });

    } catch (err) {
        next(err);
    }
})




router.delete("/:runId/delete", authMiddleware, loadCategoryDecision("deleted"), async (req, res, next) => {
    try {

        const limit = pLimit(5);

        const promisesArr = req.category.threadIds.map(({ threadId }) => {
            return limit(() => {
                return req.gmail.users.threads.trash({
                    userId: "me",
                    id: threadId
                })
            })
        })

        await Promise.all(promisesArr);

        req.category.status = "completed";

        req.run.changed("result", true);
        await req.run.save();


        res.sendStatus(204);

    } catch (err) {
        next(err);
    }
})



router.post("/:runId/decline", authMiddleware, loadCategoryDecision("declined"), async (req, res, next) => {
    try {

        req.category.status = "completed";
        req.run.changed("result", true);

        await req.run.save();

        res.status(200).json({
            labelName: req.category.labelName,
            status: req.category.status
        })

    } catch (err) {
        next(err);
    }
})



router.post("/:runId/details/accept", authMiddleware, loadCategoryDecision("accepted"), async (req, res, next) => {
    try {

        const limit = pLimit(5);

        const { threads } = req.body;

        const categoryThreadIds = req.category.threadIds.map(({ threadId }) => threadId);

        const allMatch = threads.every((id) => {
            return categoryThreadIds.includes(id);
        })

        if (!allMatch) return next(generateError(400, "Some of the threads do not belong to this specific label, try again"));

        const matchedThreads = req.category.threadIds.filter(({ threadId }) => {
            return threads.includes(threadId);
        });


        let labelResult = null;

        if (req.category.existingLabelId === null) {
            labelResult = await req.gmail.users.labels.create({
                userId: "me",
                requestBody: {
                    name: req.labelName
                }
            })
        }

        const realLabelId = req.category.existingLabelId ?? labelResult.data.id;


        const promisesArr = matchedThreads.map(({ threadId }) => {
            return limit(() => {
                return req.gmail.users.threads.modify({
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

        req.category.existingLabelId = realLabelId;


        const notMatched = req.category.threadIds.filter(({ threadId }) => {
            return !threads.includes(threadId);
        });


        req.category.threadIds = notMatched;

        req.run.changed("result", true);
        await req.run.save();


        res.status(200).json({
            labelName: req.category.labelName,
            existingLabelId: req.category.existingLabelId,
            threadIds: req.category.threadIds
        });

    } catch (err) {
        next(err);
    }
})



router.delete("/:runId/details/delete", authMiddleware, loadCategoryDecision("deleted"), async (req, res, next) => {
    try {

        const limit = pLimit(5);

        const { threads } = req.body;

        const categoryThreadIds = req.category.threadIds.map(({ threadId }) => threadId);

        const allMatch = threads.every((id) => {
            return categoryThreadIds.includes(id);
        })

        if (!allMatch) return next(generateError(400, "Some of the threads do not belong to this specific label, try again"));

        const matchedThreads = req.category.threadIds.filter(({ threadId }) => {
            return threads.includes(threadId);
        });

        const promisesArr = matchedThreads.map(({ threadId }) => {
            return limit(() => {
                return req.gmail.users.threads.trash({
                    userId: "me",
                    id: threadId
                })
            })
        })

        await Promise.all(promisesArr);

        const notMatched = req.category.threadIds.filter(({ threadId }) => {
            return !threads.includes(threadId);
        });

        req.category.threadIds = notMatched;

        req.run.changed("result", true);
        await req.run.save();

        res.status(200).json({
            labelName: req.category.labelName,
            threadIds: req.category.threadIds
        });

    } catch (err) {
        next(err);
    }
})



router.post("/:runId/details/decline", authMiddleware, loadCategoryDecision("declined"), async (req, res, next) => {
    try {

        const { threads } = req.body;

        const categoryThreadIds = req.category.threadIds.map(({ threadId }) => threadId);

        const allMatch = threads.every((id) => {
            return categoryThreadIds.includes(id);
        })

        if (!allMatch) return next(generateError(400, "Some of the threads do not belong to this specific label, try again"));

        const notMatched = req.category.threadIds.filter(({ threadId }) => {
            return !threads.includes(threadId);
        });

        req.category.threadIds = notMatched;

        req.run.changed("result", true);
        await req.run.save();

        res.status(200).json({
            labelName: req.category.labelName,
            threadIds: req.category.threadIds
        });

    } catch (err) {
        next(err);
    }
})



module.exports = router;
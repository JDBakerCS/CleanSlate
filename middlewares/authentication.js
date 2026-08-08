const generateError = require("../utils/error");
const hash = require("../utils/hash");

const { User } = require("../models/index");


const authMiddleware = async (req, res, next) => {
    try {

        const sessionToken = req.cookies.sessionToken;

        if (!sessionToken) {
            return next(generateError(401, "Unauthorized"));
        }

        const hashedIncomingToken = hash(sessionToken);

        const matchedTokenUser = await User.findOne({
            where: {
                sessionTokenHash: hashedIncomingToken
            }
        })

        if (
            !matchedTokenUser ||
            matchedTokenUser.sessionTokenExpiresAt <= new Date()
        ) {
            return next(generateError(401, "Unauthorized"));
        }

        req.user = { id: matchedTokenUser.id };

        next();

    } catch(err) {
        next(err);
    }
}

module.exports = authMiddleware;
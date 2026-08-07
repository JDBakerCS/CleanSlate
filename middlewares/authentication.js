const generateError = require("../utils/error");
const hash = require("../utils/hash");

const { User } = require("../models/index");


const authMiddleware = async (req, res, next) => {
    const sessionToken = req.cookies.sessionToken;

    if(!sessionToken) {
        return next(generateError(401, "Unauthorized"));
    }

    const hashedIncomingToken = hash(sessionToken);

    const matchedToken = await User.findOne({
        where: {
            sessionTokenHash: hashedIncomingToken
        }
    })
}
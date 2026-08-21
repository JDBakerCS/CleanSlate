const generateError = require("../utils/error");
const hash = require("../utils/hash");

const { User } = require("../models/index");


const authMiddleware = async (req, res, next) => {
    try {

        const authHeader = req.headers.authorization;
        const bearerToken = authHeader && authHeader.startsWith("Bearer ")
            ? authHeader.slice("Bearer ".length)
            : null;

        // Cookie for the React page, bearer token for the extension.
        const sessionToken = bearerToken || req.cookies.sessionToken;
        
        if (!sessionToken) {
            return next(generateError(401, "Unauthorized"));
        }

        const hashedIncomingToken = hash(sessionToken);

        const matchedTokenUser = await User.findOne({
            where: {
                sessionTokenHash: hashedIncomingToken
            }
        })

        
        const cookieBody = {
            httpOnly: true,
            secure: process.env.NODE_ENV.toLowerCase() !== "development",
            sameSite: "lax",
        }


        if (matchedTokenUser && matchedTokenUser.sessionTokenExpiresAt <= new Date()) {
            await matchedTokenUser.update({
                sessionTokenHash: null,
                sessionTokenExpiresAt: null
            })

            res.clearCookie("sessionToken", cookieBody)

            return next(generateError(401, "Unauthorized"));
        }

        if (!matchedTokenUser) {
            res.clearCookie("sessionToken", cookieBody)

            return next(generateError(401, "Unauthorized"));
        }

        req.user = { id: matchedTokenUser.id, email: matchedTokenUser.email }; // added email since front end might need it later

        next();

    } catch (err) {
        next(err);
    }
}

module.exports = authMiddleware;
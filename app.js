const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const googleRouter = require("./routes/google");
const authenticationRouter = require("./routes/auth");
const gmailRouter = require("./routes/gmail");
const protectedSendersRoute = require("./routes/protectedSenders");
const usersChoiceRoute = require("./routes/usersDecision");

const app = express();

// EXTENSION_ORIGIN is per-developer: an unpacked Chrome extension gets a
// different chrome-extension://<id> origin on each machine unless the
// manifest pins a key, so this can't be hardcoded like the Vite origin.
const allowedOrigins = [
    "http://localhost:5173",
    process.env.EXTENSION_ORIGIN,
];

app.use(express.json());
app.use(cors({
    origin: (requestOrigin, callback) => {
        if (!requestOrigin || allowedOrigins.includes(requestOrigin)) {
            return callback(null, true);
        }

        callback(null, false);
    },
    credentials: true,
}));
app.use(cookieParser());
app.use(morgan("dev"));

app.use("/api/auth", googleRouter);
app.use("/api/auth", authenticationRouter);
app.use("/api/gmail", gmailRouter);
app.use("/api/protected", protectedSendersRoute);
app.use("/api/gmail/categories", usersChoiceRoute);


app.get("/api/health", (req, res) => {
    res.json({ message: "I am running" })
})


module.exports = app;
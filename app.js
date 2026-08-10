const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const googleRouter = require("./routes/google");
const authenticationRouter = require("./routes/auth");
const gmailRouter = require("./routes/gmail");

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

app.use("/api/auth", googleRouter);
app.use("/api/auth", authenticationRouter);
app.use("/api/gmail", gmailRouter);


app.get("/api/health", (req, res) => {
    res.json({message: "I am running"})
})


module.exports = app;
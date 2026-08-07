const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const googleRouter = require("./routes/google");

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

app.use("/api/auth", googleRouter);


app.get("/api/health", (req, res) => {
    res.json({message: "I am running"})
})


module.exports = app;
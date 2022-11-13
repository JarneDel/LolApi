const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const indexRouter = require("./routes/index");
const getMatchRouter = require("./routes/api/getMatchPerPlayer");
const getRouter = require("./routes/api/getRoutes");
const cors = require("cors");

// const { cacheMatchHistory } = require("./models/cacheMatchHistory");
// const { calculateWinrateNormal } = require("./models/calculator");

const app = express();

// dev use only
// todo: remove this
app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use("/api/", getRouter);
app.use("/api/v2/", getMatchRouter);
app.use("/", indexRouter);

module.exports = app;

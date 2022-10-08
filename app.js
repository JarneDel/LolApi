const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const dotenv = require("dotenv").config();

let calculator = require("./models/calculateWinrate");
const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const fs = require("fs");
const {
  calculateWinrateNormal,
  calculateWinRateAram,
  calculateWinrate,
} = require("./models/calculateWinrate");
const { cacheMatchHistory } = require("./models/cacheMatchHistory");

const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

calculator.getLastMatches("JungleDiffAt0m", "euw1").then((matches) => {

  console.log(calculateWinrateNormal(matches));
  console.log(calculateWinRateAram(matches));
  console.log(calculateWinrate(matches));
  cacheMatchHistory(matches);
});

app.use("/", indexRouter);
app.use("/users", usersRouter);

module.exports = app;

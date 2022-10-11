const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const dotenv = require("dotenv").config();

let calculator = require("./models/calculator");
const db = require("./models/db");
const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const fs = require("fs");
const getRouter = require("./routes/api/getRoutes");
// const { cacheMatchHistory } = require("./models/cacheMatchHistory");
// const { calculateWinrateNormal } = require("./models/calculator");

const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use("/api/", getRouter);
// calculator.CreateMatchesWithCache("JungleDiffAt0m").then((puuid) => {
//   console.log("This should be the puuid: > ", puuid);
//   db.getMatchesByPuuid(puuid).then((matches) => {
//     console.log(calculator.getGameMode(matches));
//     console.log(calculator.calculateWinRateNormal(matches, puuid));
//     console.log(calculator.calculateWinRateAram(matches, puuid));
//     console.log(calculator.calculateWinRateURF(matches, puuid));
//   });
// });

app.use("/", indexRouter);
app.use("/users", usersRouter);

module.exports = app;

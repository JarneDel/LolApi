const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const dotenv = require("dotenv").config();

let calculator = require("./models/calculateWinrate");
const db = require("./models/db")
const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const fs = require("fs");
const { cacheMatchHistory } = require("./models/cacheMatchHistory");
const { calculateWinrateNormal } = require("./models/calculateWinrate");

const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

calculator.CreateMatchesWithCache("JungleDiffAt0m").then((someObject) =>{
  console.log(someObject);
  db.getAllMatches()
    .then( (matches )=>{
    console.log(calculator.calculateWinrate(matches));
  })
})




app.use("/", indexRouter);
app.use("/users", usersRouter);

module.exports = app;

"use strict";

const express = require('express');
const router = express.Router();
const { getSummonerInfo, getMatchID, getMatchInfo, getMatchTimeline, getMatchInfoAsync } = require('../../models/LolApiRequest');
const db = require('../../models/db');
const calculator = require('../../models/calculator');
const { cacheUser } = require("../../models/cacheUsers");
const getMatch = require("../../models/LolApiRequest");
const { newUser } = require("../../models/newUser");

/* GET home page. */
router.get('/:region/winrate/:username', function(req, res, next) {
  const { username, region } = req.params;
  getSummonerInfo(username, region).then((summonerInfo) => {
    db.getMatchesByPuuid(summonerInfo.puuid).then((matches) => {
      let winRates ={};
      winRates.normal = calculator.calculateWinRateNormal(matches, summonerInfo.puuid);
      winRates.aram=calculator.calculateWinRateAram(matches, summonerInfo.puuid);
      winRates.urf=calculator.calculateWinRateURF(matches, summonerInfo.puuid);
      res.send(winRates);
    });
  }).catch(err => {
    console.log(err);
    res.status(429).send(err);
  });
});

// cache the matches for real
router.post('/cacheMatches/', async function (req, res, next) {
  const body = req.body;
  // get matches from api
  console.info("Caching matches for user: ", body.username, "body: ",body);
  const matchList = await getMatchID(body.puuid, "europe", 100);
  newUser(body, matchList, res).catch((err) => {
    console.error("Error while caching users: getRoutes >"+ err);
    res.status(404);
  });
});

router.get('/:region/cacheMatches/:username/count', function(req, res, next) {
  const { username, region } = req.params;
  getSummonerInfo(username, region).then((summonerInfo) => {
    db.getMatchesByPuuid(summonerInfo.puuid).then((matches) => {
      res.send(matches.length.toString());
    });
  });
});

// user login
router.get('/user/:username/:region/', async function(req, res, next) {
  const { username, region } = req.params;
  const user = await cacheUser(username, region);
  if(user.firstTime){
    const matchList = await getMatch.getMatchID(user.puuid, "europe", 100);
    newUser(user, matchList).then((result) => {
      console.log("New user created");
    }).catch((err)=>{
      console.warn(err)
      res.status(429).send("To many requests")
    });
  }
  console.log("getRoutes/user: userObject:", user);
  res.send(user);
});



module.exports = router;

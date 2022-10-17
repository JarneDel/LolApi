"use strict";

const express = require('express');
const router = express.Router();
const { getSummonerInfo, getMatchID, getMatchInfo, getMatchTimeline, getMatchInfoAsync } = require('../../models/getMatch');
const db = require('../../models/db');
const calculator = require('../../models/calculator');
const { cacheUser, cacheMatchIds } = require("../../models/cacheUsers");
const getMatch = require("../../models/getMatch");
const { getAndResolveMatch } = require("../../models/cacheMatchHistory");
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
  });
});

router.get('/:region/cacheMatches/:username', function(req, res, next) {
  const { username, region } = req.params;
  calculator.CreateMatchesWithCache(username, region).then((puuid) => {
    res.send(puuid);
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


router.get('/user/:username/:region/', async function(req, res, next) {
  const { username, region } = req.params;
  const user = await cacheUser(username, region);
  if(user.firstTime){
    const matchList = await getMatch.getMatchID(user.puuid, "europe", 100);
    newUser(user, matchList).then((result) => {
      console.log("New user created");
    });
  }
  console.log(user);
  res.send(user);
});



module.exports = router;

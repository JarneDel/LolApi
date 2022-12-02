"use strict";

const express = require('express');
const router = express.Router();
const { getMatchID } = require('../../models/LolApiRequest');
const { cacheUser } = require("../../models/cacheUsers");
const { newUser } = require("../../models/newUser");
const cors = require("cors");
const { localToRegional } = require("../../models/regions");

/* GET home page. */
// used
router.post('/cacheMatches/', cors(),async function (req, res) {
  const body = req.body;
  // get matches from api
  console.info("Caching matches for user: ", body.name);
  // region to global region
  const globalRegion = localToRegional(body.region);
  const count = process.env.REQUEST_COUNT
  const matchList = await getMatchID(body.puuid, globalRegion, count).catch((err) => {
    console.error(err);
    res.status(500).send(err);
  });
  newUser(body, matchList, res).catch((err) => {
    console.error("Error while caching users: getRoutes >"+ err);
    res.status(404);
  });
});

// user login -- used
router.get('/user/:username/:region/', cors(), async function(req, res) {
  const { username, region } = req.params;
  const user = await cacheUser(username, region);
  const globalRegion = localToRegional(region);
  if(user.firstTime){ // never goes in here
    let count = process.env.REQUEST_COUNT
    const matchList = await getMatchID(user.puuid, globalRegion, count);
    newUser(user, matchList).then(() => {
      console.log("New user created");
    }).catch((err)=>{
      console.warn(err)
      res.status(429).send("To many requests")
    });
  }
  console.log("getRoutes/user: puuid:", user.puuid);
  res.send(user);
});


module.exports = router;

"use strict";

const express = require('express');
const router = express.Router();
const { getMatchID } = require('../../models/LolApiRequest');
const { cacheUser } = require("../../models/cacheUsers");
const { newUser } = require("../../models/newUser");

/* GET home page. */
// used
router.post('/cacheMatches/', async function (req, res) {
  const body = req.body;
  // get matches from api
  console.info("Caching matches for user: ", body.username, "body: ",body);
  const matchList = await getMatchID(body.puuid, "europe", 100);
  newUser(body, matchList, res).catch((err) => {
    console.error("Error while caching users: getRoutes >"+ err);
    res.status(404);
  });
});

// user login -- used
router.get('/user/:username/:region/', async function(req, res) {
  const { username, region } = req.params;
  const user = await cacheUser(username, region);
  if(user.firstTime){
    const matchList = await getMatchID(user.puuid, "europe", 100);
    newUser(user, matchList).then(() => {
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

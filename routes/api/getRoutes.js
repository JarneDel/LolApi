"use strict";

const express = require("express");
const router = express.Router();
const { getMatchID } = require("../../models/LolApiRequest");
const { cacheUser } = require("../../models/cacheUsers");
const cors = require("cors");
const { localToRegional } = require("../../models/regions");
const db = require("../../models/db");
const path = require("path");
const { getMatchInfo } = require("../../models/LolApiRequest.js");
// use .env
require("dotenv").config({
  path: path.join(__dirname, "../../.env"),
});

/* GET home page. */
// used
router.post("/cacheMatches/", cors(), async function (req, res) {
  try {
    const body = req.body;
    if (!body || Object.keys(body).length === 0) {
      res.status(400).send("No body provided");
      return;
    }
    if (!("puuid" in body)) {
      res.status(400).send("No puuid provided");
      return;
    }
    if (!("region" in body)) {
      res.status(400).send("No region provided");
      return;
    }
    const globalRegion = localToRegional(body.region);
    const count = process.env.REQUEST_COUNT || 20;
    let matchList = [];
    try {
      matchList = await getMatchID(body.puuid, globalRegion, count);
    } catch (e) {
      console.error(e);
      res.status(500).send(e);
      return;
    }
    if (matchList.length === 0) {
      res.send("No new matches found");
      return;
    }

    const existingMatches = body.matchList || [];
    const newMatches = matchList.filter(
      (match) => !existingMatches.includes(match)
    );
    console.log("New matches found: ", newMatches.length);
    for (const matchID of newMatches) {
      // get match info from league api and cache it
      try {
        const matchInfo = await getMatchInfo(matchID, globalRegion);
        await db.addMatch(matchInfo, body.puuid);
      } catch (e) {
        console.log(e);
        if (e.status === 404) {
          console.log("Match not found: ", matchID);
        }
      }

      // wait 60 ms to not exceed the rate limit
      await new Promise((resolve) => setTimeout(resolve, 60));
    }
    // add new matches to user
    await db.addMatchToUser(body.puuid, newMatches);
    const user = await db.getUserByPuuid(body.puuid);
    const linesChanged = user.matchList.length - existingMatches.length;

    res.send(`${linesChanged} Matches cached`);
  } catch (e) {
    console.error(e);
    res.status(500).send("error");
  }
});

// user login -- used
router.get("/user/:username/:region/", cors(), async function (req, res) {
  const { username, region } = req.params;
  const user = await cacheUser(username, region);
  console.log("getRoutes/user: puuid:", user.puuid);
  res.send(user);
});

module.exports = router;

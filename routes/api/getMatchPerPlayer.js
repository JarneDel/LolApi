"use strict";
const express = require('express');
const router = express.Router();
const db = require('../../models/db');


router.get("/matches/:region/:username/:champion", async function(req, res, next) {
  const { region, username, champion } = req.params;
  const user = await db.getUser(username, region);
  const matchList = user.matchList;
  const matches = await db.getMatchesByIDList(matchList);
  let outmatches = [];
  for (const match of matches) {
    let i = -1;
    for (const [index, participant] of match.metadata.participants.entries()) {
      if(participant === user.puuid) {
        i = index
      }
    }
    if (i === -1){
      console.error("error: puuid not found in match");
      continue;
    }
    // get matchinfo
    let info = match.info.participants[i];
    if (info.championName === champion) {
      match.yourUserIndex = i
      outmatches.push(match);
    }
  }
  if (outmatches.length > 0) {
    res.send(outmatches);
  }
  else {
    res.send("No matches found");
  }
});

module.exports = router;
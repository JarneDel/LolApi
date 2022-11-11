"use strict";
const express = require('express');
const router = express.Router();
const db = require('../../models/db');
const cors = require("cors");
const { getMatchTimeline } = require("../../models/LolApiRequest");
const cache = require("../../models/cache");

router.get("/matches/:puuid/:champion", cors(), cache(10), async function (req, res, next) {
    const {puuid, champion} = req.params;
    const matches = await db.getMatchesByPuuid(puuid);
    let outmatches = [];
    const idOrName = isNaN(champion) ? "championName" : "championId";
    console.log("Puuid of user: ", puuid);
    for (const match of matches) {
        let userIndex = match.userIndex;
        const participantInfo = match.info.participants[userIndex]
        const championPlayed = participantInfo.championName
        const championId = participantInfo.id
        console.debug("Champion played: ", championPlayed, "Champion id: ", championId);
        if (idOrName === "championName") {
            if (championPlayed === champion) {
                outmatches.push(match);
            }
        }else if (idOrName === "championId") {
            if (championId === champion) {
                outmatches.push(match);
            }
        }
    }
    console.info("Matches found: ", outmatches.length);
    outmatches.sort((a, b) => b.info.gameCreation - a.info.gameCreation);
    res.send(outmatches);

});

router.get("/matches/:puuid", cors(), cache(10), async function (req, res, next) {
    // get matched per champion and their winrates
    const {puuid} = req.params;
    const startTime = performance.now()
    const matches = await db.getMatchesByPuuid(puuid);
    const endTime = performance.now()
    console.info("Time to get matches from db", endTime - startTime)
    let outmatches = {};
    for (const match of matches) {
        let userIndex = match.userIndex;
        const participantInfo = match.info.participants[userIndex]
        const championPlayed = participantInfo.championName
        const championId = participantInfo.championId
        const win = participantInfo.win
        const kills = participantInfo.kills
        const deaths = participantInfo.deaths
        const assists = participantInfo.assists
        // check if champion is already in outmatches
        if (outmatches[championPlayed]) {
            outmatches[championPlayed].matches++;
            if (win) {
                outmatches[championPlayed].wins++;
            }
            outmatches[championPlayed].kills += kills;
            outmatches[championPlayed].deaths += deaths;
            outmatches[championPlayed].assists += assists;
            outmatches[championPlayed].avgKills = outmatches[championPlayed].kills / outmatches[championPlayed].matches;
            outmatches[championPlayed].avgDeaths = outmatches[championPlayed].deaths / outmatches[championPlayed].matches;
            outmatches[championPlayed].avgAssists = outmatches[championPlayed].assists / outmatches[championPlayed].matches;
            // outmatches[championPlayed].championId = championId;
        }
        else {
            outmatches[championPlayed] = {
                matches: 1,
                wins: win ? 1 : 0,
                championId: championId,
                kills: kills,
                deaths: deaths,
                assists: assists,
                avgKills: kills,
                avgDeaths: deaths,
                avgAssists: assists
            }
        }
    }
    // order by matches played descending
    outmatches = Object.entries(outmatches).sort((a, b) => b[1].matches - a[1].matches);
    // put back in one array
    outmatches = outmatches.map((entry) => {
        return {
            champion: entry[0],
            championId: entry[1].championId,
            matches: entry[1].matches,
            wins: entry[1].wins,
            winrate: (entry[1].wins / entry[1].matches).toFixed(2),
            kda: `${entry[1].avgKills.toFixed(1)}/${entry[1].avgDeaths.toFixed(1)}/${entry[1].avgAssists.toFixed(1)}`
    }})
    res.send(outmatches);
});

router.get("/match/:matchId/timeline", cors(), cache(10), async function (req, res, next) {
    const {matchId} = req.params;
    let timeLine = await getMatchTimeline(matchId);
    res.send(timeLine);
});

module.exports = router;
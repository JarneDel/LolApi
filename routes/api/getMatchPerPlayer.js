"use strict";
const express = require('express');
const router = express.Router();
const db = require('../../models/db');

router.get("/matches/:region/:username/:champion", async function (req, res, next) {
    const {region, username, champion} = req.params;
    const user = await db.getUser(username, region);
    const matches = await db.getMatchesByPuuid(user.puuid);
    let outmatches = [];
    const idOrName = isNaN(champion) ? "championName" : "championId";
    const puuid = user.puuid;
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
    res.send(outmatches);

});

router.get("/matches/:puuid", async function (req, res, next) {
    // get matched per champion and their winrates
    const {puuid} = req.params;
    const matches = await db.getMatchesByPuuid(puuid);
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



module.exports = router;
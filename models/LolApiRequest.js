// get summoner by id
require("dotenv").config();
const {get} = require("./getRequest");

async function getSummonerInfo(username, region = "euw1") {
  console.debug("Getting summoner info for", username);
  let url = `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-name/${username}`;
  return await get(url);
}

async function getMatchID(puuid, region = "europe", count = 80) {
  console.debug("Getting match id's for", puuid);
  let url = `https://${region}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=${count}`;
  return await get(url);
}

async function getMatchInfo(matchID, region = "europe") {
  console.debug("Getting match info for", matchID);
  let url = `https://${region}.api.riotgames.com/lol/match/v5/matches/${matchID}`;
  return await get(url);
}
async function getMatchTimeline(matchID, region = "europe") {
  console.debug("Getting match timeline for", matchID);
  let url = `https://${region}.api.riotgames.com/lol/match/v5/matches/${matchID}/timeline`;
  return await get(url);
}


module.exports = {
  getSummonerInfo,
  getMatchID,
  getMatchInfo,
  getMatchTimeline,
};

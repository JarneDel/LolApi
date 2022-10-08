// get summoner by id
require("dotenv").config();
const get = require("./getRequest");

async function getSummonerInfo(username, region = "euw1") {
  let url = `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-name/${username}`;
  return await get.get(url);
}

async function getMatchID(puuid, region = "europe", count = 100) {
  let url = `https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=${count}`;
  return await get.get(url);
}

async function getMatchInfo(matchID, region = "europe") {
  let url = `https://${region}.api.riotgames.com/lol/match/v5/matches/${matchID}`;
  return await get.get(url);
}
async function getMatchTimeline(matchID, region = "europe") {
  let url = `https://${region}.api.riotgames.com/lol/match/v5/matches/${matchID}/timeline`;
  return await get.get(url);
}

module.exports = {
  getSummonerInfo,
  getMatchID,
  getMatchInfo,
  getMatchTimeline,
};

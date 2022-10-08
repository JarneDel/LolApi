"use strict";
const getMatch = require("./getMatch");
const { cacheMatchHistory } = require("./cacheMatchHistory");
const db = require("./db");


// deprecated
const getLastMatches = async (username, region = "euw1", amount = 20) => {
  let globalRegion;
  let matches = [];
  switch (region) {
    case "euw1":
    case "eun1":
      globalRegion = "europe";
      break;
  }
  let summonerInfo = await getMatch.getSummonerInfo(username, region);
  let matchID = await getMatch.getMatchID(
    summonerInfo.puuid,
    globalRegion,
    amount
  );
  for (let i = 0; i < matchID.length; i++) {
    try {
      let matchInfo = await getMatch.getMatchInfo(matchID[i], globalRegion);
      matches.push(matchInfo);
    } catch (err) {
      if (err.status === 429) {
        console.log("Too many requests");
      } else {
        console.log(err);
      }
    }
  }
  console.log(matches.length);
  return matches;
};

const CreateMatchesWithCache = async (username, region = "euw1") => {
  let globalRegion;
  switch (region) {
    case "euw1":
    case "eun1":
      globalRegion = "europe";
      break;
  }
  const {puuid: puuid  } = await getMatch.getSummonerInfo(username, region);
  console.log(puuid);
  const matchIDs = await getMatch.getMatchID(puuid, globalRegion, 100);
  cacheMatchHistory(matchIDs).then((res) => {
    console.log("New match: ", res);
    return true;
  });
}

const __getAllMatches = async function (){
  return db.getAllMatches();
}

const __getMatchesByMatchID = async function (puuid){
  return db.getMatchIDsByPuuid(puuid)
}


const calculateWinrate = function (matches) {
  let wins = 0;
  let losses = 0;
  for (let i = 0; i < matches.length; i++) {
    if (matches[i].info.participants[0].win) {
      wins++;
    } else {
      losses++;
    }
  }
  return { wins, losses };
};

const calculateWinrateNormal = function (matches) {
  let wins = 0;
  let losses = 0;

  for (let i = 0; i < matches.length; i++) {
    if (
      matches[i].info.queueId === 400 ||
      matches[i].info.queueId === 420 ||
      matches[i].info.queueId === 430 ||
      matches[i].info.queueId === 440
    ) {
      if (matches[i].info.participants[0].win) {
        wins++;
      } else {
        losses++;
      }
    }
  }
  return { wins, losses };
};

const calculateWinRateAram = function (matches) {
  let wins = 0;
  let losses = 0;

  for (let i = 0; i < matches.length; i++) {
    if (matches[i].info.queueId === 450) {
      if (matches[i].info.participants[0].win) {
        wins++;
      } else {
        losses++;
      }
    }
  }
  return { wins, losses };
};

module.exports = {
  getLastMatches,
  CreateMatchesWithCache,

  calculateWinrate,
  calculateWinrateNormal,
  calculateWinRateAram,
};

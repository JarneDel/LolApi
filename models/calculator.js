"use strict";
const getMatch = require("./LolApiRequest");
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
    case "br1":
    case "na1":
      globalRegion = "americas";
      break;
    case "kr":
      globalRegion = "asia";
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
    case "br1":
    case "na1":
      globalRegion = "americas";
      break;
    case "kr":
      globalRegion = "asia";
      break;
  }
  console.log(globalRegion , "global region");
  const { puuid: puuid } = await getMatch.getSummonerInfo(username, region);
  console.log(puuid);
  const matchIDs = await getMatch.getMatchID(puuid, globalRegion, process.env.REQUEST_COUNT);
  return cacheMatchHistory(matchIDs, globalRegion).then((res) => {
    console.log("New match: ", res);
    return puuid; // return puuid to be used in the to calculate winrate
  });
};

const __getAllMatches = async function () {
  return db.getAllMatches();
};

const __getMatchesByMatchID = async function (puuid) {
  return db.getMatchIDsByPuuid(puuid);
};

// very inefficient way of calculating win rate and it is wrong ! it always checks for the 0th player
// todo - create a db method to calculate winrate-
const calculateWinRate = function (matches, puuid) {
  let wins = 0;
  let losses = 0;

  for (let match of matches) {
    const participantList = match.metadata.participants;
    let participantNumber = -1;
    for (let i = 0; i < participantList.length; i++) {
      if (participantList[i] === puuid) {
        participantNumber = i;
      }
    }
    if (participantNumber === -1) continue;
    if (match.info.participants[participantNumber].win) {
      wins++;
    } else {
      losses++;
    }
  }
  const winRate = ((wins / (wins + losses)) * 100).toFixed(2);
  return { wins, losses, winRate };
};

const calculateWinRateNormal = function (matches, puuid) {
  let normalMatches = [];
  for (const match of matches) {
    const queueids = [400, 420, 430, 440];
    if (queueids.includes(match.info.queueId)) {
      // 400: normal draft, 420: ranked solo/duo, 430: normal blind, 440: ranked flex
      normalMatches.push(match);
    }
  }
  return calculateWinRate(normalMatches, puuid);
};

const calculateWinRateAram = function (matches, puuid) {
  let aramMatches = [];
  for (const match of matches) {
    if (match.info.queueId === 450) {
      // 450: aram
      aramMatches.push(match);
    }
  }
  return calculateWinRate(aramMatches, puuid);
};

const calculateWinRateURF = function (matches, puuid) {
  let urfMatches = [];
  for (const match of matches) {
    if (match.info.queueId === 1900) {
      // 1900: urf
      urfMatches.push(match);
    }
  }
  return calculateWinRate(urfMatches, puuid);
};

const getGameMode = function (matches) {
  let outObjectList = [];
  let gameModeList = [];
  for (const match of matches) {
    if (!gameModeList.includes(match.info.gameMode)) {
      gameModeList.push(match.info.gameMode);
      outObjectList.push({
        match: match.info.gameMode,
        queueId: match.info.queueId,
      });
    }
  }
  return outObjectList;
};

module.exports = {
  getLastMatches,
  CreateMatchesWithCache,

  calculateWinRate,
  calculateWinRateNormal,
  calculateWinRateAram,
  calculateWinRateURF,
  getGameMode,
};

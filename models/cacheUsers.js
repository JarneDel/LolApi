const db = require("../models/db");
const getMatch = require("../models/getMatch");
const calculator = require("../models/calculator");
const { checkIfUserExits, getUser } = require("./db");


async function checkIfCached(username, region) {
  return db.checkIfUserExits(username, region).then((result) => {
    if (result.length === 0) {
      return false;
    } else {
      return result
    }
  });
}

async function checkIfUserExitsByPuuid(puuid) {
  return db.checkIfUserExitsByPuuid(puuid).then((result) => {
    return Object.values(result[0])[0] !== 0;
  });
}


async function cacheUser(username, region) {
  try {
    let result = await checkIfCached(username, region);
    if (!result) {
      let summonerInfo = await getMatch.getSummonerInfo(username, region);
      summonerInfo.region = region;
      return await db.addUser(summonerInfo);
    } else {
      console.log(`User ${username} already cached, returning cached user`);
      return result[0];
    }
  } catch (e) {
    console.warn(e);
    return false;
  }
}

async function getUserByUsername(username, region) {
  if (await cacheUser(username, region)) {
    return await db.getUser(username, region);
  }
  else {
    console.warn("Error occured while caching user");
    return false;
  }
}

async function cacheMatchIds(puuid,region , matchList) {
  if (await checkIfUserExitsByPuuid(puuid, region)) {
    return await db.addMatchToUser(puuid, region, matchList);
  } else
    console.warn("User not cached");
    return false;
}

async function test(username, region, puuid) {
  // checkIfCached(username, region).then((result) => {
  //   console.log(`User ${username} is cached: ${result}`);
  // });
  //
  // cacheUser(username, region).then(
  //   (result) => {
  //     console.log(`caching user ${username} is ${result}`);
  //   }
  // );
  //
  // getUserByUsername(username, region).then(
  //   (result) => {
  //     console.log(`user: ${username} ${result}`);
  //   }
  // );
  //
  // checkIfUserExitsByPuuid(puuid).then(
  //   (result) => {
  //     console.log(`user with puuid ${puuid} is cached: ${result}`);
  //   });
  // getUser(username, region).then(
  //   (result) => {
  //     console.log(`user: ${username} ${result}`);
  //   });

  let matchList = await db.getMatchIDsByPuuid(puuid)
  console.log(matchList);
  const outputList = [];
  for (const matchObject of matchList) {
    outputList.push(matchObject.matchid);
  }
  console.log(outputList);
  console.log(await cacheMatchIds(puuid, outputList));
}
module.exports = {
  cacheUser,
  checkIfCached,
  cacheMatchIds
}
// flow:
// 1. Incoming request from client with username and region
// 2. Check if user is cached
// 3. If not cached, cache user
// 4.0 If cached, get user from db
// 4.1. If not cached, Get user from riot api
// 5. Get match list from riot api
// 6. update match list in db
// 7. Get match list from db
// 8. Get match missing from db from riot api
// 9. Make calculations
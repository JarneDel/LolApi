//@ts-check
"use strict";
const CosmosClient = require("@azure/cosmos").CosmosClient;

const config = require("../config");


const { endpoint, key, databaseId, containerId, userContainerId } = config;

// const userContainerId = config.userContainer.id;
const partitionKey = { kind: "Hash", paths: ["/matchid"] };
const clientPartitionKey = { kind: "Hash", paths: ["/puuid"] };

const options = {
  endpoint: endpoint, key: key, userAgentSuffix: "lolNodeServer"
};


const client = new CosmosClient({ endpoint, key });

const database = client.database(databaseId);
const matchContainer = database.container(containerId);
const userContainer = database.container(userContainerId);

async function checkIfMatchExists(matchId) {
  const { resources } = await matchContainer.items.query({
    query: "SELECT c.id, c.metadata FROM c WHERE c.matchid = @param1", parameters: [{ name: "@param1", value: matchId }]
  })
    .fetchAll();
  if (resources.length > 0) return resources[0]; else return null;
}


/** create a family item if it does not exist */
async function addMatch(match) {
  if (match === null) return "match does not exist";
  // check if match already exists in db
  let a = await matchContainer
    .items.query({
      query: "SELECT * FROM c WHERE c.matchid = @param1",
      parameters: [{ name: "@param1", value: match.metadata.matchId }]
    })
    .fetchAll();
  if (a.resources.length > 0) {
    console.log("match already exists in db");
    // return matchData
    return a.resources[0];
  } else {
    // add match to db
    match.matchid = match.metadata.matchId;
    match.id = match.metadata.matchId;
    const { resource: createdItem } = await matchContainer.items.create(match);
    console.log(`Created item with id:\n${createdItem.id}\n`);
    // return matchData
    return createdItem;
  }
}

async function getMatchIdList() {
  // cosmos db select query
  const { resources } = await matchContainer
    .items.query("SELECT c.matchid FROM c")
    .fetchAll();
  // convert array of objects to array of matchid's
  let returnList = [];
  // console.log(resources)
  for (let i = 0; i < resources.length; i++) {
    returnList.push(resources[i].matchid);
  }
  console.log("matchIDList", returnList);
  return returnList;
}

const getAllMatches = async function() {
  const { resources } = await matchContainer.items.readAll().fetchAll();
  return resources;
};

async function getMatchesByPuuid(puuid) {
  const query = {
    query: "SELECT * FROM c WHERE ARRAY_CONTAINS(c.metadata.participants, @param1)",
    parameters: [{ name: "@param1", value: puuid }]
  };
  const { resources } = await matchContainer.items.query(query).fetchAll();
  return resources;
}

async function getMatchIDsByPuuid(puuid) {
  const query = {
    query: "SELECT c.matchid FROM c WHERE ARRAY_CONTAINS(c.metadata.participants, @param1)",
    parameters: [{ name: "@param1", value: puuid }]
  };
  const { resources } = await matchContainer.items.query(query).fetchAll();
  return resources;
}

async function winOrLoseByChampion(puuid) {
  const { resources } = await matchContainer.items.query({
    query: "SELECT c.queueId, c."
  });
}

async function getMatchCountByPuuid(puuid) {
  const resources = await matchContainer
    .items.query({
      query: "SELECT VALUE COUNT(1) FROM c WHERE ARRAY_CONTAINS(c.metadata.participants, @param1)",
      parameters: [{ name: "@param1", value: puuid }]
    })
    .fetchAll();
  console.log(resources);
  return resources;
}


// User container

async function addUser(user) {
  user.nameLowerCase = user.name.toLowerCase();
  const { resource: createdItem } = await userContainer
    .items.create(user);
  console.log(`Created item with id:\n${createdItem.id}\n`);
  return createdItem;
}

async function AddMatchListToUser(puuid, matchList) {
  const { resource: createdItem } = await userContainer
    .items.query({
      query: "INSERT INTO c (c.matchList) VALUES (@param1) WHERE c.puuid = @param2",
      parameters: [{ name: "@param1", value: matchList }, { name: "@param2", value: puuid }]
    });
  // console.log(`updated item with puuid:\n${createdItem.puuid}\n`);
  console.log(createdItem);
  return createdItem;
}

// todo - sql add
async function addMatchToUser(puuid, matchList) {
  let user = await getUserByPuuid(puuid);
  if (user !== null) {
    if (user.matchList === undefined) {
      user.matchList = [];
    }
    user.matchList = user.matchList.concat(matchList);
    const { resource } = await userContainer.items.upsert(user);
    return resource;
  }
}


async function checkIfUserExits(username, region) {
  const { resources } = await userContainer
    .items.query({
      query: "SELECT * FROM c WHERE c.nameLowerCase = @param1 and c.region = @param2",
      parameters: [{ name: "@param1", value: username.toLowerCase() }, { name: "@param2", value: region }]
    })
    .fetchAll();
  return resources;
}

async function checkIfUserExitsByPuuid(puuid) {
  const { resources } = await userContainer
    .items.query({
      query: "SELECT count(1) FROM c WHERE c.puuid = @param1",
      parameters: [{ name: "@param1", value: puuid }]
    })
    .fetchAll();
  return resources;
}

async function getUser(username, region) {
  console.log("Getting user", username, region);
  let start1 = performance.now();
  const a = await userContainer
    .items.query({
      query: "SELECT * FROM c WHERE c.nameLowerCase = @param1 AND c.region = @param2",
      parameters: [{ name: "@param1", value: username.toLowerCase() }, { name: "@param2", value: region }]
    })
    .fetchNext();
  let end1 = performance.now();
  console.log("getUser time", end1 - start1);

  return a.resources[0];
}

async function getUserByPuuid(puuid) {
  const { resources } = await userContainer
    .items.query({
      query: "SELECT * FROM c WHERE c.puuid = @param1", parameters: [{ name: "@param1", value: puuid }]
    })
    .fetchAll();
  return resources[0];
}


/**
 * exit the app with a prompt
 * @param {message} message - The message to display
 * */
function exit(message) {
  console.log(message);
  console.log("Press any key to exit");
  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.on("data", process.exit.bind(process, 0));
}

module.exports = {
  addMatch,
  getMatchIdList,
  getAllMatches,
  getMatchesByPuuid,
  getMatchIDsByPuuid,
  checkIfMatchExists,
  getMatchCountByPuuid,
  addUser,
  AddMatchListToUser,
  addMatchToUser,
  checkIfUserExits,
  checkIfUserExitsByPuuid,
  getUser
};

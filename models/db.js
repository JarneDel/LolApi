//@ts-check
"use strict";
const CosmosClient = require("@azure/cosmos").CosmosClient;

const config = require("../config");

const endpoint = config.endpoint;
const key = config.key;

const databaseId = config.database.id;
const containerId = config.container.id;
const userContainerId = config.userContainer.id;
const partitionKey = { kind: "Hash", paths: ["/matchid"] };
const clientPartitionKey = { kind: "Hash", paths: ["/puuid"] };

const options = {
  endpoint: endpoint,
  key: key,
  userAgentSuffix: "lolNodeServer"
};

const client = new CosmosClient(options);

/** create the database if it does not exist */

async function createDatabase() {
  const { database } = await client.databases.createIfNotExists({
    id: databaseId
  });
  console.log(`Created database:\n${database.id}\n`);
}

/** read the database definition */

async function readDatabase() {
  const { resource: databaseDefinition } = await client
    .database(databaseId)
    .read();
  console.log(`Reading database:\n${databaseDefinition.id}\n`);
}

/** create the container if it does not exist */
async function createContainer() {
  const { container } = await client
    .database(databaseId)
    .containers.createIfNotExists({ id: containerId, partitionKey });
  console.log(`Created container:\n${config.container.id}\n`);
}

/** read the container definition */
async function readContainer() {
  const { resource: containerDefinition } = await client
    .database(databaseId)
    .container(containerId)
    .read();
  console.log(`Reading container:\n${containerDefinition.id}\n`);
}

async function checkIfMatchExists(matchId) {
  const { resources } = await client
    .database(databaseId)
    .container(containerId)
    .items.query({
      query: "SELECT * FROM c WHERE c.matchid = @param1",
      parameters: [{ name: "@param1", value: matchId }]
    })
    .fetchAll();
  if(resources.length > 0) return resources[0];
  else return null;
}


/** create a family item if it does not exist */
async function addMatch(match) {
  if (match === null) return "match does not exist";
  // check if match already exists in db
  let a = await client
    .database(databaseId)
    .container(containerId)
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
    const { resource: createdItem } = await client
      .database(databaseId)
      .container(containerId)
      .items.create(match);
    console.log(`Created item with id:\n${createdItem.id}\n`);
    // return matchData
    return createdItem;
  }
}

async function getMatchIdList() {
  // cosmos db select query
  const { resources } = await client
    .database(databaseId)
    .container(containerId)
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
  const { resources } = await client
    .database(databaseId)
    .container(containerId)
    .items.readAll()
    .fetchAll();
  return resources;
};

async function getMatchesByPuuid(puuid) {
  const { resources } = await client
    .database(databaseId)
    .container(containerId)
    .items.query({
      query:
        "SELECT * FROM c WHERE ARRAY_CONTAINS(c.metadata.participants, @param1)",
      parameters: [{ name: "@param1", value: puuid }]
    })
    .fetchAll();
  return resources;
}

async function getMatchIDsByPuuid(puuid) {
  const { resources } = await client
    .database(databaseId)
    .container(containerId)
    .items.query({
      query:
        "SELECT c.matchid FROM c WHERE ARRAY_CONTAINS(c.metadata.participants, @param1)",
      parameters: [{ name: "@param1", value: puuid }]
    })
    .fetchAll();
  return resources;
}

async function winOrLoseByChampion(puuid) {
  const { resources } = await client
    .database(databaseId)
    .container(containerId)
    .items.query({
      query: "SELECT c.queueId, c."
    });
}

async function getMatchCountByPuuid(puuid) {
  const resources = await client
    .database(databaseId)
    .container(containerId)
    .items.query({
      query:
        "SELECT VALUE COUNT(1) FROM c WHERE ARRAY_CONTAINS(c.metadata.participants, @param1)",
      parameters: [{ name: "@param1", value: puuid }]
    })
    .fetchAll();
  console.log(resources);
  return resources;
}


// User container

async function addUser(user) {
  user.nameLowerCase = user.name.toLowerCase();
  const { resource: createdItem } = await client
    .database(databaseId)
    .container(userContainerId)
    .items.create(user);
  console.log(`Created item with id:\n${createdItem.id}\n`);
  return createdItem;
}

async function AddMatchListToUser(puuid, matchList) {
  const { resource: createdItem } = await client
    .database(databaseId)
    .container(userContainerId)
    .items.query(
      {
        query: "INSERT INTO c (c.matchList) VALUES (@param1) WHERE c.puuid = @param2",
        parameters: [{ name: "@param1", value: matchList }, { name: "@param2", value: puuid }]
      }
    );
  // console.log(`updated item with puuid:\n${createdItem.puuid}\n`);
  console.log(createdItem);
  return createdItem;
}

// todo - sql add
async function addMatchToUser(puuid, matchList) {
  let user = await getUserByPuuid(puuid);
  if (user !== null) {
    user.matchList = user.matchList.concat(matchList);
    const { resource } = await client.database(databaseId).container(userContainerId).items.upsert(user);
    return resource;
  }
}


async function checkIfUserExits(username, region) {
  const { resources } = await client
    .database(databaseId)
    .container(userContainerId)
    .items.query({
      query: "SELECT * FROM c WHERE c.nameLowerCase = @param1 and c.region = @param2",
      parameters: [{ name: "@param1", value: username.toLowerCase() }, { name: "@param2", value: region }]
    })
    .fetchAll();
  return resources;
}

async function checkIfUserExitsByPuuid(puuid) {
  const { resources } = await client
    .database(databaseId)
    .container(userContainerId)
    .items.query({
      query: "SELECT count(1) FROM c WHERE c.puuid = @param1",
      parameters: [{ name: "@param1", value: puuid }]
    })
    .fetchAll();
  return resources;
}

async function getUser(username, region) {
  console.log("Getting user", username, region);
  const { resources } = await client
    .database(databaseId)
    .container(userContainerId)
    .items.query({
      query: "SELECT * FROM c WHERE c.nameLowerCase = @param1 AND c.region = @param2",
      parameters: [{ name: "@param1", value: username.toLowerCase() }, { name: "@param2", value: region }]
    })
    .fetchAll();
  return resources[0];
}

async function getUserByPuuid(puuid) {
  const { resources } = await client
    .database(databaseId)
    .container(userContainerId)
    .items.query({
      query: "SELECT * FROM c WHERE c.puuid = @param1",
      parameters: [{ name: "@param1", value: puuid }]
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

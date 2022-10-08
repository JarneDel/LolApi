//@ts-check
"use strict";
const CosmosClient = require("@azure/cosmos").CosmosClient;

const config = require("../config");

const endpoint = config.endpoint;
const key = config.key;

const databaseId = config.database.id;
const containerId = config.container.id;
const partitionKey = { kind: "Hash", paths: ["/matchid"] };

const options = {
  endpoint: endpoint,
  key: key,
  userAgentSuffix: "lolNodeServer",
};

const client = new CosmosClient(options);

/** create the database if it does not exist */

async function createDatabase() {
  const { database } = await client.databases.createIfNotExists({
    id: databaseId,
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

/** create a family item if it does not exist */
async function addMatch(match) {
  if (match === null) return "match does not exist";
  try {
    match.matchid = match.metadata.matchId;
    match.id = match.metadata.matchId;
    const { resource: createdItem } = await client
      .database(databaseId)
      .container(containerId)
      .items.create(match);
    return createdItem;
  } catch (e) {
    console.error(e);
    return null;
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

const getAllMatches = async function () {
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
      parameters: [{ name: "@param1", value: puuid }],
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
        "SELECT * FROM c WHERE ARRAY_CONTAINS(c.metadata.participants, @param1)",
      parameters: [{ name: "@param1", value: puuid }],
    })
    .fetchAll();
  return resources;
}

async function cleanup() {
  await client.database(databaseId).delete();
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
  createDatabase,
  readDatabase,
  createContainer,
  readContainer,
  cleanup,
  getMatchIdList,
  getAllMatches,
  getMatchesByPuuid,
  getMatchIDsByPuuid,
};

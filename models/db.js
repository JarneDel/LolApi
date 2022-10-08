//@ts-check
const CosmosClient = require("@azure/cosmos").CosmosClient;

const config = require("../config");
const url = require("url");

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
  match.matchid = match.metadata.matchId;
  match.id = match.metadata.matchId;
  const {resource: createdItem} = await client.database(databaseId).container(containerId).items.create(match);
  return createdItem;
}

async function getMatchIdList () {
  // cosmos db select query
  const {resources} = await client.database(databaseId).container(containerId).items.query("SELECT i.matchid FROM items i").fetchAll();
  return resources;
}

const getAllMatches = async function () {
  const { resources } = await client
    .database(databaseId)
    .container(containerId)
    .items.readAll()
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



module.exports= {
  addMatch,
  createDatabase,
  readDatabase,
  createContainer,
  readContainer,
  cleanup,
  getMatchIdList,
  getAllMatches,
}
//@ts-check
"use strict";
const CosmosClient = require("@azure/cosmos").CosmosClient;

const config = require("../config");


const {endpoint, key, databaseId, containerId, userContainerId} = config;

// const userContainerId = config.userContainer.id;

const client = new CosmosClient({endpoint, key});

const database = client.database(databaseId);
const matchContainer = database.container(containerId);
const userContainer = database.container(userContainerId);

async function checkIfMatchExists(matchId, puuid) {
    const {resources} = await matchContainer.items.query({
        query: "SELECT c.matchid, c.metadata FROM c WHERE c.matchid = @param1 and c.puuidUser = @param2",
        parameters: [{name: "@param1", value: matchId}, {name: "@param2", value: puuid}]
    })
        .fetchAll();
    if (resources.length > 0) return resources[0]; else return null;
}

async function checkIfMatchesExist(matchList){
    const query = {
        query: "SELECT c.matchid FROM c WHERE ARRAY_CONTAINS(@matchList, c.matchid)",
        parameters: [{name: "@param1", value: matchList}]
    }
    const {resources} = await matchContainer.items.query(query).fetchAll();
    return resources;
}



// -- this one is already updated with the new partition key
/** create a match item if it does not exist */
async function addMatch(match, puuidUser) {
    if (match === null) return "match does not exist";
    // add some values to the object
    const matchId = match.metadata.matchId;
    if (puuidUser == null) throw("db.addMatch: creator is required");
    match.matchid = matchId
    match.puuidUser = puuidUser;

    // add the index of the creator to the object
    match.metadata.participants.forEach((participant, i) => {
        if (participant === puuidUser) {
            console.info("User found: ", participant, " Index: ", i)
            match.userIndex = i;

        }
    })
    // check if match already exists in db
    let {resources} = await matchContainer
        .items.query({
            query: "SELECT count(1) FROM c WHERE c.matchid = @param1 and c.puuidUser = @param2",
            parameters: [{name: "@param1", value: match.metadata.matchId}, {name: "@param2", value: puuidUser}]
        })
        .fetchAll();
    if (resources[0]['$1'] === 1) {
        console.info("db.addMatch: match already exists in db");
        return match;
    } else {
        // add the match to the database
        // check if creator param is given
        const {resource: createdItem} = await matchContainer.items.create(match)
        console.info("db.addMatch: created item with id: ", createdItem.id, "and pk: ", createdItem.puuidUser, "and matchId: ", createdItem.matchid);
        return createdItem;
    }
}

const getAllMatches = async function () {
    const {resources} = await matchContainer.items.readAll().fetchAll();
    return resources;
};

async function getMatchesByPuuid(puuid) {
    const query = {
        query: "SELECT * FROM c WHERE c.puuidUser = @param1",
        parameters: [{name: "@param1", value: puuid}]
    };
    const {resources} = await matchContainer.items.query(query).fetchAll();
    return resources;
}


// User container

async function addUser(user) {
    user.nameLowerCase = user.name.toLowerCase();
    const {resource: createdItem} = await userContainer
        .items.create(user);
    console.log(`Created item with id:\n${createdItem.id}\n`);
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
        const {resource} = await userContainer.items.upsert(user);
        return resource;
    }
}

async function checkIfUserExits(username, region) {
    const {resources} = await userContainer
      .items.query({
          query: "SELECT * FROM c WHERE c.nameLowerCase = @param1 and c.region = @param2",
          parameters: [{name: "@param1", value: username.toLowerCase()}, {name: "@param2", value: region}]
      })
      .fetchAll();
    return resources;
}


async function checkIfUserExitsByPuuid(puuid) {
    const {resources} = await userContainer
        .items.query({
            query: "SELECT count(1) FROM c WHERE c.puuid = @param1",
            parameters: [{name: "@param1", value: puuid}]
        })
        .fetchAll();
    return resources;
}


async function getUserByPuuid(puuid) {
    const {resources} = await userContainer
        .items.query({
            query: "SELECT * FROM c WHERE c.puuid = @param1", parameters: [{name: "@param1", value: puuid}]
        })
        .fetchAll();
    return resources[0];
}

module.exports = {
    addMatch,
    getAllMatches,
    getMatchesByPuuid,
    checkIfMatchExists,
    addUser,
    addMatchToUser,
    checkIfUserExitsByPuuid,
    checkIfUserExits,
    checkIfMatchesExist
};

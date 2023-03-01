import { MongoClient } from "mongodb";
import { IUser } from "@/Interfaces/IUser";

const uri = process.env.CONNECTION_STRING;
if (!uri) throw new Error("No connection string found in .env file");
const mongoClient = new MongoClient(uri);
const client = mongoClient.connect();

export default (() => {
  const _getMatchCollection = async () => {
    let connection = await client;
    const db = connection.db("LeagueOfStatistics");
    return db.collection("match");
  };
  const _getUserCollection = async () => {
    let connection = await client;
    const db = connection.db("LeagueOfStatistics");
    return db.collection("user");
  };

  const checkIfMatchExists = async (matchId: string, puuid: string) => {
    const collection = await _getMatchCollection();
    const query = { matchId: matchId, userPuuid: puuid };
    const cursor = collection.find(query);
    const result = await cursor.toArray();
    if (result.length > 0) return result[0];
    else return null;
  };

  const checkIfMatchesExist = async (matchList: string[]) => {
    const collection = await _getMatchCollection();
    // query to retrieve matchid's only, no need to retrieve the whole document
    const query = { matchId: { $in: matchList } };
    const cursor = collection.find(query, { projection: { matchId: 1 }});
    return await cursor.toArray();
  };

  const insertMatch = async (match: any, userPuuid: string) => {
    const collection = await _getMatchCollection();
    match.userPuuid = userPuuid;
    match.matchId = match.metadata.matchId;

    match.metadata.participants.forEach((participant: any, i: any) => {
      if (participant === userPuuid) match.userIndex = i;
    });
    // check if match already exists in database
    const existingMatch = await checkIfMatchExists(match.matchId, userPuuid);

    if (existingMatch) {
      console.debug("Match already exists in database: ", match.matchId);
      return existingMatch;
    }
    // insert match into database
    const result = await collection.insertOne(match);
    console.info(
      "Successfully inserted match into database: ",
      match.matchId,
      "dbId: ",
      result.insertedId
    );
    return result.acknowledged;
  };
  const getAllMatches = async () => {
    const collection = await _getMatchCollection();
    return collection.find({}).toArray();
  };

  const getMatchById = async (matchId: string) => {
    const collection = await _getMatchCollection();
    const query = { matchId: matchId };
    const cursor = collection.find(query);
    return await cursor.toArray();
  };

  const getMatchesByPuuid = async (puuid: string) => {
    const collection = await _getMatchCollection();
    const query = { userPuuid: puuid };
    const cursor = collection.find(query);
    return await cursor.toArray();
  };

  // user collection
  const insertUser = async (user: any): Promise<boolean> => {
    try {
      user.nameLowerCased = user.name.toLowerCase();
      const collection = await _getUserCollection();
      const result = await collection.insertOne(user);
      console.info(
        "Successfully inserted user into database: ",
        user.name,
        "dbId: ",
        result.insertedId
      );
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  async function getUserByName(name: string, region: string): Promise<any> {
    const collection = await _getUserCollection();
    const query = { nameLowerCased: name.toLowerCase(), region: region };
    const data = await collection.findOne(query);
    return data as unknown as IUser;
  }

  const getUserByPuuid = async (puuid: string) => {
    const collection = await _getUserCollection();
    const query = { puuid: puuid };
    return await collection.findOne(query);
  };
  const addMatchToUser = async (matchId: string, userPuuid: string) => {
    try {
      const collection = await _getUserCollection();
      const query = { puuid: userPuuid };
      const update = { $push: { matchList: matchId } };
      const result = await collection.updateOne(query, update);
      console.info(
        "Successfully added match to user: ",
        matchId,
        "dbId: ",
        result.upsertedId
      );
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };
  const addMatchesToUser = async (matchIdList : string[], userPuuid: string) : Promise<boolean> =>{
    try {
      const collection = await _getUserCollection()
      const query = {puuid: userPuuid}
      // https://docs.mongodb.com/manual/reference/operator/update/push/
      const update = {$push: {matchList: {$each: matchIdList}}} // $each is needed to push multiple values at once
      const result = await collection.updateOne(query, update)
      console.info("Successfully added matches to user: ", matchIdList, "dbId: ", result.upsertedCount)
      return true
    } catch (e) {
      console.error(e)
      return false
    }
  }

  return {
    checkIfMatchesExist,
    checkIfMatchExists,
    insertMatch,
    getAllMatches,
    getMatchById,
    getMatchesByPuuid,
    insertUser,
    getUserByName,
    getUserByPuuid,
    addMatchToUser,
    addMatchesToUser
  };
})();

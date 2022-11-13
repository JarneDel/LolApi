const db = require("../models/db");
const getMatch = require("./LolApiRequest");

async function checkIfUserExitsByPuuid(puuid) {
    return db.checkIfUserExitsByPuuid(puuid).then((result) => {
        return result["$1"] !== 0;
    });
}

async function cacheUser(username, region) {
    try {
        let result = await checkIfCached(username, region);
        if (result) {
            console.log(`User ${username} already cached, returning cached user`);
            return result[0];
        } else {
            let summonerInfo = await getMatch.getSummonerInfo(username, region);

            const hasStatus = "status" in summonerInfo;
            if (hasStatus) {
                if (summonerInfo.status.status_code === 404) {
                    console.warn(`User ${username} not found`);
                    return false;
                }
            }
            summonerInfo.region = region;
            const user = await db.addUser(summonerInfo);
            user.firstTime = true;
            return user;


        }
    } catch (e) {
        console.warn(e);
        return false;
    }
}

async function cacheMatchIds(puuid, matchList) {
    if (await checkIfUserExitsByPuuid(puuid)) {
        return await db.addMatchToUser(puuid, matchList);
    } else
        console.warn("User not cached");
    return false;
}



module.exports = {
    cacheUser,
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
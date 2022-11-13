const db = require("../models/db");
const getMatch = require("./LolApiRequest");

async function checkIfUserExitsByPuuid(puuid) {
    return db.checkIfUserExitsByPuuid(puuid).then((result) => {
        return result["$1"] !== 0;
    });
}

async function checkIfCached(username, region) {
    return db.checkIfUserExits(username, region).then((result) => {
        if (result.length === 0) {
            return false;
        } else {
            return result
        }
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

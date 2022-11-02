const cacheUsers = require("./cacheUsers");
const {getAndResolveMatch} = require("./cacheMatchHistory");
const db = require("./db");


async function newUser(userObject, matchList, res) {
    // list of matches
    let outMatches = [];
    // const user = await cacheUsers.cacheUser(username, region); // 450 ms when user is cached, 650 ms when user is not cached
    // // get recent matches from league api
    // const matchList = await getMatch.getMatchID(user.puuid, "europe", 100); // 190 ms
    // check if new matches can be cached

    // check if any matches are cached at all
    if (!userObject.hasOwnProperty("matchList")) {
        console.log("No matches cached yet");
        // immediately cache the new matches
        for (const matchID of matchList) {
            // get match info from league api and cache it
            // check if match is already cached
            const exists = await db.checkIfMatchExists(matchID, userObject.puuid);
            if (exists == null) {
                getAndResolveMatch(matchID, userObject.puuid, (matchObject) => {
                    outMatches.push(matchObject);
                    console.info("cached / total: ", outMatches.length, "/", matchList.length);
                    if (outMatches.length === matchList.length) {
                        const success = callbackCoupleMachToUser(outMatches, userObject);
                        if (success) {
                            res.status(201).send(userObject);
                        }
                    }
                });
                // wait 60 ms to not exceed the rate limit
                await new Promise((resolve) => setTimeout(resolve, 80));
            }else{
                console.info("Match already cached: ", matchID);
                outMatches.push(exists.matchid);
                console.info("cached / total: ", outMatches.length, "/", matchList.length);
                if (outMatches.length === matchList.length) {
                    const success = callbackCoupleMachToUser(outMatches, userObject);
                    if (success) {
                        res.status(201).send(userObject);
                    }
                }
            }
        }
    } else {
        // check if there are new matches
        const newMatches = matchList.filter((matchID) => !userObject.matchList.includes(matchID));
        console.log("New matches found: ", newMatches.length);
        if (newMatches.length > 0) {
            // cache new matches
            for (const matchID of newMatches) {
                // get match info from league api and cache it
                getAndResolveMatch(matchID, userObject.puuid, (matchObject) => {
                    outMatches.push(matchObject);
                    if (outMatches.length === newMatches.length) {
                        res.status(201).send(userObject);
                        callbackCoupleMachToUser(outMatches, userObject);
                    }
                });
                // wait 60 ms to not exceed the rate limit
                await new Promise((resolve) => setTimeout(resolve, 60));
            }
        }
        else{
            console.log("No new matches found");
            res.status(200).send("No new matches found");
        }
    }

}

const callbackCoupleMachToUser = async function (matchObjectList, userObject) {
    try {
        const listMatchIds = matchObjectList.map((matchObject) => matchObject.matchid);
        const res = await cacheUsers.cacheMatchIds(userObject.puuid, listMatchIds);
        console.log("New matches cached for user: ", userObject.username, "response: ", res);
        return true;
    } catch (e) {
        console.error("Error while caching matches: newUser >" + e);
        return false
    }


};

// newUser("JungleDiffAt0m", "euw1");
module.exports = {newUser}

// newUser("JungleDiffAt0m", "euw1", callbackCoupleMachToUser);
// console.log("done");

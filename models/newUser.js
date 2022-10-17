const cacheUsers = require("./cacheUsers");
const { getAndResolveMatch } = require("./cacheMatchHistory");


async function newUser(user, matchList) {
  // list of matches
  let outMatches = [];
  // const user = await cacheUsers.cacheUser(username, region); // 450 ms when user is cached, 650 ms when user is not cached
  // // get recent matches from league api
  // const matchList = await getMatch.getMatchID(user.puuid, "europe", 100); // 190 ms
  // check if new matches can be cached

  // check if any matches are cached at all
  if (!user.hasOwnProperty("matchList")) {
    console.log("No matches cached yet");
    // immediately cache the new matches
    for (const matchID of matchList) {
      // get match info from league api and cache it
      getAndResolveMatch(matchID, "europe", (matchObject) => {
        outMatches.push(matchObject);
        if (outMatches.length === matchList.length) {
          callbackCoupleMachToUser(outMatches, user);
        }
      });
      // wait 60 ms to not exceed the rate limit
      await new Promise((resolve) => setTimeout(resolve, 80));
    }
  } else {
    // check if there are new matches
    const newMatches = matchList.filter((matchID) => !user.matchList.includes(matchID));
    // todo -- if there arent any new matches, return the cached matches so that we can use them for the calculation
    // cache new matches
    for (const matchID of newMatches) {
      // get match info from league api and cache it
      getAndResolveMatch(matchID, "europe", (matchObject) => {
        outMatches.push(matchObject);
        if (outMatches.length === newMatches.length) {
          callbackCoupleMachToUser(outMatches, user);
        }
      });
      // wait 60 ms to not exceed the rate limit
      await new Promise((resolve) => setTimeout(resolve, 60));
    }
  }

}

const callbackCoupleMachToUser = function(matchObjectList, userObject) {
  const listMatchIds = matchObjectList.map((matchObject) => matchObject.id);

  cacheUsers.cacheMatchIds(userObject.puuid, listMatchIds).then((result) => {
    console.log("Paired successfully: " + result);
    // todo -- once paired successfully, we need to get the other cached matches and add them to the matchObjectList, so that we can use them for the calculations
  });


};

// newUser("JungleDiffAt0m", "euw1");
module.exports = { newUser }

// newUser("JungleDiffAt0m", "euw1", callbackCoupleMachToUser);
// console.log("done");

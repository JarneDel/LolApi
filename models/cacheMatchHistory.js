const db = require("./db");
const getMatch = require("./getMatch");

// deprecated
// const cacheMatchHistory = async function (matches) {
//   let cache = {};
//   for (let i = 0; i < matches.length; i++) {
//     db.addMatch(matches[i])
//       .then(console.log(`${matches[i].metadata.matchId} created`))
//       .catch((err) => {
//       console.log(err);
//     });
//   }
//   console.log(cache);
// };

function tryAgain(matchId, globalRegion, callbackUseItem) {
  getAndResolveMatch(matchId, globalRegion, callbackUseItem);
}

const getAndResolveMatch = function(matchId, globalRegion, callbackUseItem) {
  db.checkIfMatchExists(matchId).then((matchExists) => {
    if (matchExists == null) {
      getMatch.getMatchInfo(matchId, globalRegion).then((resolved) => {
        db.addMatch(resolved).then((item) => {
          console.log(`${item.matchid} created`);
          callbackUseItem(item);
        });
      }, (rejected) => {
        console.log("Promise rejected,", rejected);
        if (rejected.status.statusCode === 403) {
          setTimeout(function() {
            tryAgain(matchId);
          }, 1000);
        }
      });
    } else {
      callbackUseItem(matchExists);
    }
  });
};

// todo -- deprecate this function
const cacheMatchHistory = async function(listMatchIds, globalRegion) {
  let count = 0;
  console.log("Listmatches: ", listMatchIds);
  // returns all matchID's in cache
  db.getMatchIdList().then((list) => {
    console.log(list);
    for (let i = 0; i < listMatchIds.length; i++) {
      try {
        // check if a newly fetched match is already in the database
        if (!list.includes(listMatchIds[i])) {
          console.log("Match that was not yet found will be added");
          count += getAndResolveMatch(listMatchIds[i], globalRegion);
        }
      } catch (e) {
        console.log(e);
      }
    }
    console.log("Count: ", count);
    console.log("Done caching match history!");
  });

};

module.exports = { cacheMatchHistory, getAndResolveMatch };
const db = require("./db");
const getMatch = require("./LolApiRequest");

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

function tryAgain(matchId, puuidUser, callbackUseItem) {
    console.info("Trying again");
    getAndResolveMatch(matchId, puuidUser, callbackUseItem);
}

const getAndResolveMatch = function (matchId, puuidUser, callbackUseItem) {
    getMatch.getMatchInfo(matchId).then((resolved) => {
        db.addMatch(resolved, puuidUser).then((item) => {
            console.log(`${item.matchid} created`);
            callbackUseItem(item);
        }).catch((err) => {
            console.error(err);
        });
    }, (rejected) => {
        console.log("Promise rejected,", rejected);
        if (rejected.status.statusCode === 403) {
            setTimeout(function () {
                tryAgain(matchId, puuidUser);
            }, 1000);
        }
    });
};


// todo -- deprecate this function
const cacheMatchHistory = async function (listMatchIds, globalRegion) {
    console.log("Listmatches: ", listMatchIds);
    // returns all matchID's in cache
    db.getMatchIdList().then((list) => {
        console.log(list);
        for (let i = 0; i < listMatchIds.length; i++) {
            try {
                // check if a newly fetched match is already in the database
                if (!list.includes(listMatchIds[i])) {
                    console.log("Match that was not yet found will be added");
                    getAndResolveMatch(listMatchIds[i], globalRegion);
                }
            } catch (e) {
                console.log(e);
            }
        }
        console.log("Done caching match history!");
    });

};

module.exports = {getAndResolveMatch};

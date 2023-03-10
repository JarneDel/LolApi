const db = require("./db");
const getMatch = require("./LolApiRequest");


function tryAgain(matchId, puuidUser, callbackUseItem, globalRegion) {
    console.info("Trying again");
    getAndResolveMatch(matchId, puuidUser, callbackUseItem, globalRegion);
}

const getAndResolveMatch = function (matchId, puuidUser, callbackUseItem, globalRegion) {
    getMatch.getMatchInfo(matchId, globalRegion).then((resolved) => {
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
                tryAgain(matchId, puuidUser, callbackUseItem, globalRegion);
            }, rejected.status.retryAfter * 1100);
        }
        if (rejected.status.statusCode === 404) {
            console.log("Match not found");
            callbackUseItem(null);
        }
    });
};


module.exports = {getAndResolveMatch};

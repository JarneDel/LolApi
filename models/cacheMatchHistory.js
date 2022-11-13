const db = require("./db");
const getMatch = require("./LolApiRequest");


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


module.exports = {getAndResolveMatch};

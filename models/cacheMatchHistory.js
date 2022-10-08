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

const cacheMatchHistory = async function (listMatchIds) {
  const returnList = [];
  console.log("Listmatches: ", listMatchIds);
  // returns all matchID's in cache
  db.getMatchIdList().then((list) => {
    console.log(list);
    for (let i = 0; i < listMatchIds.length; i++) {
      // check if a newly fetched match is already in the database
      if (!list.includes(listMatchIds[i])) {
        console.log("Match that was not yet found will be added");
        try {
          getMatch.getMatchInfoAsync(listMatchIds[i]).then((e) => {
            db.addMatch(e).then((item) => {
              console.log(`${item.matchid} created`);
              returnList.push(item.matchid);
            });
          });
        } catch (e) {
          console.log(e);
        }
      }
    }
    console.log("Done caching match history!");
    return returnList;
  });
};

module.exports = { cacheMatchHistory };

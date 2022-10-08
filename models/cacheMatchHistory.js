const db  = require('./db');
const fs = require("fs");


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

const cacheMatchHistory = async function (listMatches) {
  const returnList = [];
  db.getMatchIdList().then((list) => {
    for (let i = 0; i < listMatches.length; i++) {
      if (!list.includes(listMatches[i].metadata.matchId)) {
        db.addMatch(listMatches[i]).then((item) => {
          console.log(`${item.matchid} created`);
          returnList.push(item.matchid);
        });
      }
    }
    return returnList;
  });
}


module.exports = { cacheMatchHistory };

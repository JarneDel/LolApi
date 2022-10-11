require("dotenv").config();
const https = require("https");

const get = function (url, extraHeaders) {
  let headers = {
    "X-Riot-Token": process.env.RIOT_API_KEY,
    ...extraHeaders,
  };
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: headers }, (res) => {
        let data = [];
        const headerDate =
          res.headers && res.headers.date
            ? res.headers.date
            : "no response date";
        console.log("Status Code:", res.statusCode);
        console.log("Date in Response header:", headerDate);
        if(res.statusCode === 429){
          console.log("Too many requests, waiting 60 seconds");
          reject({status: 429})
        }
        res.on("data", (chunk) => {
          data.push(chunk);
        });
        res.on("end", () => {
          console.log("response ended");
          const result = JSON.parse(Buffer.concat(data).toString());
          console.log(result);
          resolve(result);
        });
      })
      .on("error", (err) => {
        console.log("Error: " + err.message);
        reject(err);
      });
  });
};

module.exports = { get };

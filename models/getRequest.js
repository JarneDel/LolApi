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
        console.debug("Date in Response header:", headerDate);
        if(res.statusCode === 429){
          console.warn("Too many requests");
          console.warn("Retry-After:", res.headers["retry-after"]);
          reject({status: 429, retryAfter: res.headers["retry-after"]});
        }
        res.on("data", (chunk) => {
          data.push(chunk);
        });
        res.on("end", () => {
          console.debug("response ended");
          const result = JSON.parse(Buffer.concat(data).toString());
          console.debug(result);
          resolve(result);
        });
      })
      .on("error", (err) => {
        console.warn("Error: " + err.message);
        reject(err);
      });
  });
};

module.exports = { get };

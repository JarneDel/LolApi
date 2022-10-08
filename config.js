var config = {};
require("dotenv").config();

const mh = require("./test.json");
config.endpoint =
  "https://dbeindwerkinteractiondesign.documents.azure.com:443/";
config.key =
  "Pwr3HNwJoN68TJE3LCRtvawmQKZzJZ2BGfp1xLrk15WJ84qteEup4z9dtKOQ6ivihs1afBkEgSBWVlNIOQZuiw==";
console.log(config.endpoint, config.key);

config.database = {
  id: "lolmatchhistory",
};

config.container = {
  id: "matchhistory",
};

config.items = {
  matches: mh,
};

module.exports = config;

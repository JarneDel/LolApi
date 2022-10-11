// please add this to your .gitignore file

var config = {};
require("dotenv").config();

const mh = require("./test.json");
config.endpoint = process.env.COSMOS_ENDPOINT;
config.key = process.env.COSMOS_KEY;


config.database = {
  id: "lolmatchhistory",
};

config.container = {
  id: "matchhistory",
};

config.userContainer = {
  id: "userContainer",
}

config.items = {
  matches: mh,
};

module.exports = config;

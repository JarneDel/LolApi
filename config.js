// please add this to your .gitignore file

var config = {};
require("dotenv").config();

config.endpoint = process.env.COSMOS_ENDPOINT;
config.key = process.env.COSMOS_KEY;


config.databaseId = "lolmatchhistory";

config.containerId = "match";

config.userContainerId = "userContainer2";


module.exports = config;

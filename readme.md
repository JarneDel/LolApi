# League Of Statistics
League of Statistics is a League of legends champion and statistics viewer, You can see your winrate and match history, per champion.  
---
## Requirements 
Azure cosmosdb  
NodeJs  
Express  
Riot games api key https://developer.riotgames.com/  

## Enviroment variables
Create a .env file with the following keys:  

RIOT_API_KEY: "api key from riot games",   
COSMOS_KEY: "cosmosdb key ending on =="  
COSMOS_ENDPOINT: "cosmosdb primary key"  
REQUEST_COUNT: "amount of request that you want to do when caching match history 0-100 recommended: 20"  

## Database configuration
1 noSql azure cosmosdb
2 containers: match, userContainer2 
(change the names in config.js)

## Project installation
run `npm install`

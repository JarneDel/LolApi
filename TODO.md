# Todo
- get all matches per player in db
- MatchTimeLine

- reduce load on server by only loading matches of the corresponding player

flow: 
1. Incoming request from client with username and region
 2. Check if user is cached
 3. If not cached, cache user
4.  
   a) If cached, get user from db  
   b)  If not cached, Get user from riot api
5. Get match list from riot api
6. update match list in db
7. Get match list from db
8. Get match missing from db from riot api
9. Make calculations

- for when caching the match info:
- send a request every 50 ms - 20 requests per second
- delay in js: https://stackoverflow.com/questions/951021/what-is-the-javascript-version-of-sleep
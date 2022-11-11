const mcache = require('memory-cache');

const cache = (minutes) => {
  console.log(minutes);
  if (minutes === undefined) {
    minutes = 1;
  }
  const ms = minutes * 60 * 1000;
  return (req, res, next) => {
    let key = '__express__' + req.originalUrl || req.url;
    let cachedBody = mcache.get(key);
    if (cachedBody) {
      res.send(cachedBody);
    } else {
      res.sendResponse = res.send;
      res.send = (body) => {
        mcache.put(key, body, 60 * 60 * 1000 + ms);
        res.sendResponse(body);
      };
      next();
    }
  }
}

module.exports = cache;
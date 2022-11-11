const mcache = require('memory-cache');

const cache = () => {
  return (req, res, next) => {
    let key = '__express__' + req.originalUrl || req.url;
    let cachedBody = mcache.get(key);
    if (cachedBody) {
      res.send(cachedBody);
    } else {
      res.sendResponse = res.send;
      res.send = (body) => {
        mcache.put(key, body, 300 * 1000);
        res.sendResponse(body);
      };
      next();
    }
  }
}

module.exports = cache;
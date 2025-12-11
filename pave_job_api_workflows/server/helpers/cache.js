const NodeCache = require('node-cache'); // https://www.npmjs.com/package/node-cache
const cacheHelper = module.exports;

/**
 * Initialize a NodeCache instance
 * @returns {NodeCache}
 */
cacheHelper.init = () => {
  return new NodeCache();
};

/**
 * Initialize NodeCache instance in req.storage
 * @param {e.Request} req
 * @returns {e.Request}
 */
cacheHelper.initReq = (req) => {
  req.app.locals.nodeCache = cacheHelper.init();
  return req;
};

/**
 * Get a value from cache
 * @param {NodeCache} nodeCache
 * @param {string} key
 * @returns {null|*}
 */
cacheHelper.getValue = (nodeCache, key) => {
  const value = null;
  if (nodeCache && key) {
    const cacheValue = nodeCache.get(key);
    if (cacheValue) return cacheValue;
  }
  return value;
};

/**
 * Store a value to cache
 * @param {NodeCache} nodeCache
 * @param {string} key
 * @param {string} value
 * @param {number} [ttl=undefined]
 * @returns {boolean}
 */
cacheHelper.setValue = (nodeCache, key, value, ttl) => {
  if (nodeCache && key && value) {
    const status = nodeCache.set(key, value, ttl);
    return status;
  }
  return false;
};

/**
 * Delete a value from cache
 * @param {NodeCache} nodeCache
 * @param key
 * @returns {number}
 */
cacheHelper.delValue = (nodeCache, key) => {
  let recordsDeleted = 0;
  if (nodeCache && key) {
    recordsDeleted = nodeCache.del(key);
  }
  return recordsDeleted;
};

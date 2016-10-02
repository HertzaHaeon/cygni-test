export default class localCache {
  /**
   * Create localCache-specific key from provided key
   *
   * @param {string} key
   * @returns {string}
   */
  static makeCacheKey(key) {
    return 'localCache|' + key;
  }

  /**
   * Get cached value if it exists and is fresh, undefined otherwise
   *
   * @param {string} key
   * @returns {undefined|Object}
   */
  static get(key) {
    const cacheKey = localCache.makeCacheKey(key);
    let cachedData = localStorage.getItem(cacheKey);
    if (cachedData) {
      try {
        cachedData = JSON.parse(cachedData);
      } catch (error) {
        return;
      }
      if (cachedData) {
        if (cachedData.expires === false || cachedData.expires > Date.now()) {
          return cachedData.data;
        } else {
          localCache.clear(key);
        }
      }
    }
    return undefined;
  }

  /**
   * Store object in cache, with an optional maximum age. Without age, cache lasts until explicitly cleared.
   *
   * @param {string} key
   * @param {Object} data
   * @param {int} [age]
   */
  static set(key, data = {}, age) {
    const cacheKey = localCache.makeCacheKey(key);
    const cacheData = JSON.stringify({
      data,
      expires: age ? (Date.now() + (parseInt(age, 10) * 1000)) : false
    });
    if (localStorage.getItem(cacheKey) === null) {
      localStorage.setItem(cacheKey, cacheData);
    }
  }

  /**
   * Clear cached data
   *
   * @param {string} key
   */
  static clear(key) {
    localStorage.removeItem(localCache.makeCacheKey(key));
  }
}

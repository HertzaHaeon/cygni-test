import config from '../config';
import localCache from './localCache';

export default class FlickrService {
  /**
   * Returns cached response if it exists, otherwise does a fresh JSON fetch
   *
   * @param {string} url
   * @returns {Promise}
   */
  static cacheOrFetch(url) {
    let cached = localCache.get(url);
    if (cached) {
      return Promise.resolve(cached);
    } else {
      return fetch(url)
        .then(response => response.json())
    }
  }

  /**
   * Gets Flickr userId from URL user name (https://www.flickr.com/photos/[username])
   *
   * @param {string} user
   * @returns {Promise}
   */
  static getUserId(user) {
    const userUrl = encodeURIComponent('https://www.flickr.com/photos/' + user);
    const url = `${config.flickr.url}?method=flickr.urls.lookupUser&api_key=${config.flickr.apiKey}&url=${userUrl}&format=json&nojsoncallback=1`;

    return FlickrService.cacheOrFetch(url)
      .then(response => {
        switch (response.stat) {
          case 'fail':
            console.error(response.message);
            throw response.message;
          default:
            localCache.set(url, response, config.flickr.cacheRequestAge);
            return response.user.id;
        }
      });
  }

  /**
   * Loads photos for a Flickr user
   *
   * @param {string} userName
   * @returns {Promise}
   */
  static loadUserGallery(userName) {
    // First translate name into id
    return FlickrService.getUserId(userName)
      .then(userId => {
        return FlickrService.loadPhotos('flickr.people.getPublicPhotos', {user_id: userId});
      });
  }

  /**
   * Loads photos for one or more tags
   *
   * @param {string|Array} tags
   * @returns {Promise}
   */
  static loadTagGallery(tags) {
    let tagList = tags instanceof Array ? tags.join(',') : tags.toString();
    return FlickrService.loadPhotos('flickr.photos.search', {tags: tagList, sort: 'interestingness-desc'});
  }

  static loadInterestingGallery(date) {
    return FlickrService.loadPhotos('flickr.interestingness.getList', {date: date});
  }

  /**
   * Generic photo loading method
   *
   * @param {string} method
   * @param {Object} [params]
   * @returns {Promise}
   */
  static loadPhotos(method, params = {}) {
    let url = `${config.flickr.url}?method=${method}&api_key=${config.flickr.apiKey}&extras=url_s,url_l,url_o&format=json&nojsoncallback=1`;
    let query = [];

    // Build query string from parameters
    for (let p in params) {
      if (params.hasOwnProperty(p) && params[p]) {
        query.push(`${p}=${params[p]}`);
      }
    }
    if (query.length) {
      url += '&' + query.join('&');
    }

    return FlickrService.cacheOrFetch(url)
      .then(response => {
          switch (response.stat) {
            case 'fail':
              console.error(response.message);
              throw response.message;
            default:
              localCache.set(url, response, config.flickr.cacheRequestAge);
              response.photos.photo = response.photos.photo.map(photo => {
              return {
                id: photo.id,
                title: photo.title,
                thumbnail: {
                  url: photo.url_s,
                  width: parseInt(photo.width_s, 10),
                  height: parseInt(photo.height_s, 10)
                },
                image: {
                  // Take large photo if available, otherwise original
                  url: photo.url_l ? photo.url_l : photo.url_o,
                  width: photo.url_l ? parseInt(photo.width_l, 10) : parseInt(photo.width_o, 10),
                  height: photo.url_l ? parseInt(photo.height_l, 10) : parseInt(photo.width_o, 10)
                }
              }
            });
            return response.photos;
          }
        }
      );
  }
}

var fs = require('fs');
var os = require('os');

var md5 = require('md5');
var request = require('request');
var express = require('express');
var searchEngine = require('../google');
var Promise = require("es6-promise").Promise;
var cookieParser = require('cookie-parser');
const Cache = require('../cache');
var searchEngine = searchEngine.service;
let cache_file = os.homedir() + '/.buddhalow/cache'

var cache = new Cache()

process.on('unhandledRejection', error => {
  // Will print "unhandledRejection err is not defined"
  // console.log('unhandledRejection', error.message);
});


class SpotifyService {
  constructor(apikeys, session) {

    var self = this;

    this.cache = {};
    this.isPlaying = false;

    this.resources = {};
    this.callbacks = {};
    this.apikeys = apikeys
    this.accessToken = null;
    this.session = session;

    this.me = null;
    this.cache = {};
    if (fs.existsSync(cache_file)) {
      try {
        this.cache = JSON.parse(fs.readFileSync(cache_file));
      } catch (e) {

      }
    }

    this.session = null;
  }

  getSessions() {
    if (fs.existsSync(sessions_file)) {
      return JSON.parse(fs.readFileSync(sessions_file));
    }
  }

  setSessions(value) {
    fs.writeFileSync(sessions_file, JSON.strigify(value));
  }

  getArtistByName(name) {
    var self = this;
    return new Promise((resolve, fail) => {
      // console.log("ERROR", err);
      if (name.length === 23) {
        music.getArtist(name).then(result => {
          resolve(result);
        }, err => {
          // console.log("ERROR", err);
          fail(err);
        });
      } else {
        music.search('artist:"' + encodeURI(name) + '"', 0, 1, 'artist').then(result => {
          if (result.objects.length < 1) {
            fail(404);
            return
          }
          ;
          music.getArtist(result.objects[0].id).then(result => {
            // console.log("ERROR", result);
            resolve(result);
          }, err => {
            // console.log("ERROR", err);
            fail(err);
          })
        }, err => {
          // console.log("ERROR", err);
          fail(err);
        })
      }
    });
  }

  getAuthorByName(name) {
    var self = this;
    return new Promise((resolve, fail) => {
      if (name.length == 22) {
        music.getAuthor(name).then(result => {
          resolve(result);
        }, err => {
          fail(err);
        });
      } else {
        music.search('artist:"' + encodeURI(name) + '"', 0, 1, 'artist').then(result => {
          if (result.objects.length < 1) {
            fail(404);
            return
          }
          ;
          music.getAuthor(result.objects[0].id).then(result => {
            resolve(result);
          }, err => {
            fail(err);
          })
        }, err => {
          fail(err);
        })
      }
    });
  }

  getAlbumByName(name, artist) {
    var self = this;
    return new Promise((resolve, fail) => {
      self.search('album:"' + encodeURI(name) + '" AND artist:"' + encodeURI(artist.name) + "'", 'album', 0, 28).then(result => {
        if (result.objects.length < 1) {
          fail({error: 'Not found'});
          return
        }
        ;
        music.getAlbum(result.objects[0].id).then(result => {
          resolve(result);
        }, err => {
          fail(err).send();
        })
      }, err => {
        fail(err).send();
      })
    });
  }

  getAlbumByUPC(name, artist) {
    var self = this;
    return new Promise((resolve, fail) => {
      self.search('upc:"' + encodeURI(name) + '"', 'album', 0, 28).then(result => {
        if (result.objects.length < 1) {
          fail({error: 'Not found'});
          return
        }
        ;
        music.getAlbum(result.objects[0].id).then(result => {
          resolve(result);
        }, err => {
          fail(err).send();
        })
      }, err => {
        fail(err).send();
      })
    });
  } 

  getTrackByName(name, artist, album) {
    var self = this;
    return new Promise((resolve, fail) => {
      self.search('"' + name + '" AND album:"' + encodeURI(name) + '" AND artist:"' + encodeURI(artist.name) + "'", 'track', 0, 28).then(result => {
        if (result.objects.length < 1) {
          fail({error: 'Not found'});
          return
        }
        ;
        resolve(result);

      }, err => {
        fail(err).send();
      })
    });
  }

  getLoginUrl() {
    return 'https://accounts.spotify.com/authorize?client_id=' + this.apikeys.client_id + '&scope=user-follow-read streaming user-top-read user-read-email user-read-recently-played user-read-birthdate user-read-private playlist-modify-public playlist-modify-private user-read-currently-playing user-read-playback-state user-library-read user-library-modify user-modify-playback-state&response_type=code&redirect_uri=' + encodeURI(this.apikeys.redirect_uri);
  }

  authenticate(req, resolve) {
    var self = this;
    this.req = req;
    // console.log(req);
    // console.log("Ta");
    request({
      url: 'https://accounts.spotify.com/api/token',
      method: 'POST',
      form: {
        grant_type: 'authorization_code',
        code: req.query.code,
        redirect_uri: self.apikeys.redirect_uri
      },
      headers: {
        'Authorization': 'Basic ' + new Buffer(self.apikeys.client_id + ':' + self.apikeys.client_secret).toString('base64')
      }
    }, (error, response, body) => {
      // console.log(error);
      var result = JSON.parse(body);
      result.issued = new Date().getTime();
      if (error || !result.access_token) {
        resolve(error);

        return;
      }
      resolve(null, result);
    });


  }

  getMe() {
    var self = this;
    return new Promise((resolve, fail) => {
      self._request('GET', '/me').then(result => {
        result.artists = []

        resolve(result);
      }, error => {
        fail(error);
      });
    });
  }

  getCurrentTrack() {
    var self = this;
    return new Promise((resolve, fail) => {
      self._request('GET', '/me/player/currently-playing').then(result => {
        resolve(result);
      });
    });
  }

  getAccessToken() {
    try {
      return this.req.session.spotifyAccessToken; //JSON.parse(fs.readFileSync(os.homedir() + '/.bungalow/spotify_access_token.json'));
    } catch (e) {
      return null;
    }
  }

  isAccessTokenValid() {
    var access_token = this.getAccessToken();
    if (!access_token) return false;
    return new Date() < new Date(access_token.time) + access_token.expires_in * 1000;
  }

  refreshAccessToken() {
    var self = this;
    return new Promise((resolve, fail) => {
      var refresh_token = self.session.refresh_token;
      request({
        url: 'https://accounts.spotify.com/api/token',
        method: 'POST',
        form: {
          grant_type: 'refresh_token',
          refresh_token,
          redirect_uri: self.apikeys.redirect_uri
        },
        headers: {
          'Authorization': 'Basic ' + new Buffer(self.apikeys.client_id + ':' + self.apikeys.client_secret).toString('base64')
        }
      }, (error, response, body) => {
        var result = JSON.parse(body);
        if (error || 'error' in result) {
          fail();
          return;
        }
        // console.log(self.apikeys);
        self.session = result;
        self.session.issued = new Date().getTime();
        self.session.refresh_token = refresh_token;
        try {

          console.log("Refresh", result);
          this.res.cookie('spotify', JSON.stringify(result));
          resolve(result);

        } catch (e) {
          console.log(e);
          fail(e);
        }
      });
    });
  }

  searchFor(q, type, offset, limit) {
    var self = this;
    return new Promise((resolve, fail) => {
      self._request('GET', '/search', {
        q,
        type,
        offset,
        limit
      }).then(result => {
        resolve(result);
      }, err => {
        fail(err);
      });
    });
  }

  _request(method, path, payload, postData) {
    var self = this;
    return new Promise((resolve, fail) => {
      if (!payload) payload = {};
      if (!payload.offset) payload.offset = 0;
      if (!isNaN(payload.offset)) payload.offset = parseInt(payload.offset);
      if (!payload.type) payload.type = 'track';
      if (!isNaN(payload.limit)) payload.limit = parseInt(payload.limit);
      if (!payload.limit) payload.limit = 30;

      function _do(_resolve, _fail, _notAuthorized) {
        if (false) {
          var cachePath = path + '?offset=' + payload.offset + '&limit=' + payload.limit + '&q=' + payload.q + '&type=' + payload.type + '&snapshot_id=' + payload.snapshot_id;

          if (method == 'GET' && cache.isCached(cachePath) && path.indexOf('currently-playing') == -1 && path.indexOf('/track') == -1) {
            resolve(cache.load(cachePath));
            return;
          }

          if (false && method === 'GET' && self.cache instanceof Object && cachePath in self.cache) {
            var result = self.cache[cachePath];
            resolve(result);
            return;
          }

          if (!self.session) {
            fail(401);
            return;
          }
        }
        var headers = {};

        headers["Authorization"] = "Bearer " + self.session.access_token;
        if (payload instanceof Object) {
          headers["Content-type"] = "application/json";

        } else {
          headers["Content-type"] = ("application/x-www-form-urlencoded");
        }
        var url = 'https://api.spotify.com/v1' + path;
        console.log(url);
        console.log(payload);
        console.log('POSTDATA', postData);

        request({
            method,
            url,
            headers,
            qs: payload,
            json: true,
            body: (postData)
          },
          (error, response, body) => {
            if (response.statusCode === 400 || response.statusCode === 401) {
              _fail();
            }
            console.log(body);
            if (error) {
              // console.log(error, response, body)
              fail(body);
              return;
            }

            function formatObject(obj, i) {
              obj.position = payload.offset + i;
              obj.p = payload.offset + i + 1;
              obj.service = service;
              obj.version = '';
              if (obj.type === 'country') {
                obj.president = null;
                if (obj.id === 'qi') {
                  obj.president = {
                    id: 'drsounds',
                    name: 'Dr. Sounds',
                    uri: 'spotify:user:drsounds',
                    images: [{
                      url: 'http://blog.typeandtell.com/sv/wp-content/uploads/sites/2/2017/06/Alexander-Forselius-dpi27-750x500.jpg'
                    }],
                    type: 'user'
                  }
                }

              }
              // console.log(obj.type)
              if (obj.type === 'playlist') {
                obj.uri = 'spotify:playlist:' + obj.id
                // console.log("Got playlist")
              }
              if (obj.type == 'user') {
                obj.manages = [];
                obj.controls = []
                if (obj.id == 'buddhalow' || obj.id == 'buddhalowmusic' || obj.id == 'drsounds') {
                  obj.president_of = [{
                    id: 'qi',
                    name: 'Qiland',
                    uri: 'country:qi',
                    type: 'country'
                  }];
                  obj.manages.push({
                    id: '2FOROU2Fdxew72QmueWSUy',
                    type: 'artist',
                    name: 'Dr. Sounds',
                    uri: 'spotify:artist:2FOROU2Fdxew72QmueWSUy',
                    images: [{
                      url: 'http://blog.typeandtell.com/sv/wp-content/uploads/sites/2/2017/06/Alexander-Forselius-dpi27-750x500.jpg'
                    }]
                  });
                  obj.manages.push({
                    id: "1yfKXBG0YdRc5wrAwSgTBj",
                    name: "Buddhalow",
                    uri: "spotify:artist:1yfKXBG0YdRc5wrAwSgTBj",
                    type: "artist",
                    images: [{
                      url: 'https://static1.squarespace.com/static/580c9426bebafb840ac7089e/t/580d061de3df28929ead74ac/1477248577786/_MG_0082.jpg?format=1500w'
                    }]
                  });
                }
              }
              if (obj.type == 'artist') {
                obj.users = [];
                obj.labels = [];
                obj.manager = {
                  id: '',
                  name: '',
                  uri: 'spotify:user:',
                  type: 'user',
                  username: ''
                };
                if (obj.id == '2FOROU2Fdxew72QmueWSUy') {
                  obj.manager = {
                    id: 'drsounds',
                    name: 'Dr. Sounds',
                    type: 'user',
                    url: 'spotify:user:drsounds'
                  };
                  obj.users.push({
                    id: 'drsounds',
                    name: 'Dr. Sounds',
                    type: 'user',
                    url: 'spotify:user:drsounds'
                  });
                  obj.labels.push({
                    id: 'buddhalowmusic',
                    name: 'Buddhalow Music',
                    type: 'label',
                    uri: 'spotify:label:buddhalowmusic'
                  });
                  obj.labels.push({
                    id: 'drsounds',
                    name: 'Dr. Sounds',
                    type: 'label',
                    uri: 'spotify:label:drsounds'
                  });
                  obj.labels.push({
                    id: 'recordunion',
                    name: 'Record Union',
                    type: 'label',
                    uri: 'spotify:label:recordunion'
                  });
                  obj.labels.push({
                    id: 'substream',
                    name: 'Substream',
                    type: 'label',
                    uri: 'spotify:label:substream'
                  });
                }


              }

              if ('duration_ms' in obj) {
                obj.duration = obj.duration_ms / 1000;
              }
              if (obj.type === 'user') {
                obj.name = obj.id;
              }
              if ('track' in obj) {
                obj = Object.assign(obj, obj.track);
              }
              if ('artists' in obj) {
                try {
                  obj.artists = obj.artists.map(formatObject);
                } catch (e) {

                }
              }

              if ('album' in obj) {
                obj.album = formatObject(obj.album, 0);
              }
              if ('display_name' in obj) {
                obj.name = obj.display_name;
              }
              if (obj.name instanceof String && obj.name.indexOf('-') != -1) {
                obj.version = obj.substr(obj.indexOf('-') + '-'.length).trim();
                obj.name = obj.name.split('-')[0];
              }
              return obj;
            }

            try {
              if (response.statusCode < 200 || response.statusCode > 299) {
                // console.log(body);
                fail(response.body);
                return;
              }
              if (body == "") {
                resolve({
                  status: response.body
                });
                return;
              }
              var data = (body);
              if (!data) {
                // console.log(body);
                fail(response.body);
              }
              if ('error' in data || !data) {
                // console.log(body);
                fail(response.body);
                return;
              }
              data.service = {
                name: 'Spotify',
                id: 'spotify',
                type: 'service',
                description: ''
              }
              if ('items' in data) {
                data.objects = data.items;
                delete data.items;
              }
              if ('devices' in data) {
                data.objects = data.devices;
              }
              if ('categories' in data) {
                data.objects = data.categories.items.map((o) => {
                  o.uri = 'spotify:category:' + o.id;
                  o.type = 'category';
                  o.images = o.icons;
                  delete o.icons;
                  return o;
                });
                delete data.categories;
              }
              if ('tracks' in data) {
                if (data.tracks instanceof Array) {
                  data.objects = data.tracks;
                } else {
                  data.objects = data.tracks.items;
                }
                delete data.tracks;
              }
              if (!('images' in data)) {
                data.images = [{
                  url: ''
                }];
              }
              if ('album' in data) {
                data.album = formatObject(data.album);
                delete data.albums;
              }

              if ('owner' in data) {
                data.owner = formatObject(data.owner);
                delete data.albums;
              }
              if ('artists' in data) {
                data.objects = data.artists.items;
              }
              if ('objects' in data && data.objects && data.type != 'artist') {
                data.objects = data.objects.map(formatObject);

              }
              if ('artists' in data && data.type == 'album') {
                data.objects = data.artists.map(formatObject);
              }
              if ('artists' in data && data.artists.items) {
                data.artists = data.artists.items.map(formatObject);
                delete data.artists;

              }
              if ('albums' in data && data.type != 'artist') {
                data.objects = data.albums.items.map(formatObject);
              }
              if ('items' in data && data.items.track) {
                data.objects = data.items.track.map(formatObject);
              }
              data = formatObject(data, 0);
              // console.log(data);
              data.updated_at = new Date().getTime();
              self.cache[cachePath] = data;
              /*if (method === 'GET') {
                                cache.save(cachePath, data);
                            } else {
                                cache.invalidate(cachePath);
                            }*/
              resolve(data);
            } catch (e) {
              // console.log(e)
              // console.log("Failed")
              fail(e);
            }
          }
        );
      }
      _do(resolve, fail, () => {
        self.refreshAccessToken().then(result => {
          _do(resolve, fail);
        });
      });


    });
  }

  /**
   * Returns user by id
   **/
  getUser(id) {
    var self = this;
    return new Promise((resolve, fail) => {
      self._request('GET', '/users/' + id).then(result => {
        resolve(result);
        result.podcasts = []
        result.podcasts.push({
          id: 'aHR0cDovL2FzcGllcG9kZGVuLnBvZGJlYW4uY29tL2ZlZWQv',
          uri: 'bungalow:podcast:aHR0cDovL2FzcGllcG9kZGVuLnBvZGJlYW4uY29tL2ZlZWQv',
          type: 'podcast',
          language: 'sv',
          country: 'se',
          images: [
            {
              url: 'http://deow9bq0xqvbj.cloudfront.net/image-logo/1444849/aspiepodden.jpg'
            }
          ]
        })
      }, err => {
        fail(err);
      });
    });
  }

  /**
   * Returns user by id
   **/
  getArtist(id) {
    var self = this;
    return new Promise((resolve, fail) => {
      self._request('GET', '/artists/' + id).then(result => {
        resolve(result);
        result.podcasts = []
        /*result.podcasts.push({
                   id: 'aHR0cDovL2FzcGllcG9kZGVuLnBvZGJlYW4uY29tL2ZlZWQv',
                   uri: 'bungalow:podcast:aHR0cDovL2FzcGllcG9kZGVuLnBvZGJlYW4uY29tL2ZlZWQv',
                   type: 'podcast',
                   images: [
                       {
                           url: 'http://deow9bq0xqvbj.cloudfront.net/image-logo/1444849/aspiepodden.jpg'
                       }
                   ]
               })*/
      }, err => {
        // console.log(err);
        fail(err);
      });
    });
  }

  /**
   * Returns user by id
   **/
  getAuthor(id) {
    var self = this;
    return new Promise((resolve, fail) => {
      self._request('GET', '/artists/' + id).then(result => {
        result.type = 'author'
        resolve(result);
      }, err => {
        fail(err);
      });
    });
  }

  getReleasesByArtistName(id, release_type, offset, limit) {
    var self = this;
    if (!release_type || release_type == "release") release_type = 'single,album';
    return new Promise((resolve, fail) => {
      self.getArtistByName(id).then(artist => {
        self.getReleasesByArtist(artist.id, release_type, offset, limit).then(result => {
          resolve(result);
        }, err => {
          fail(err);
        })
      }, err => {
        fail(err);
      });
    });

  }

  getAudiobooksByAuthorName(id, release_type, offset, limit) {
    var self = this;
    if (!release_type || release_type == "release") release_type = 'single,album';
    return new Promise((resolve, fail) => {
      self.getAuthorByName(id).then(artist => {
        self.getAudiobooksByAuthor(artist.id, release_type, offset, limit).then(result => {
          resolve(result);
        }, err => {
          fail(err);
        })
      }, err => {
        fail(err);
      });
    });

  }

  getAboutPageForArtist(artist_id) {
    return new Promise((resolve, reject) => {
      var cheerio = require('cheerio')
      request({
        method: 'GET',
        url: 'https://open.spotify.com/artist/' + artist_id
      }, (error, response, body) => {
        // console.log("A")
        try {
          // console.log('body', body)
          var $ = cheerio.load(body)
          var spotifyEntityScript = $('script').slice(4).eq(0)
          // console.log('spotifyEntityScript', spotifyEntityScript)
          spotifyEntityScript = spotifyEntityScript.html()
          // console.log('spotifyEntityScript', spotifyEntityScript)
          var delimiter = "Spotify = {};\n        Spotify.Entity = "
          var json = spotifyEntityScript.substr(spotifyEntityScript.indexOf(delimiter) + delimiter.length)
          // console.log('json', json)
          var readyJson = json.replace(/;/, '')
          // console.log('json', readyJson)
          let result = {}     // JSON.parse(readyJson.trim().slice(0, -1))
          resolve(result)
        } catch (e) {
          // console.log(e)
          reject(e)
        }
      })
    });
  }

  static getReleaseByName(release_name, artist_name, release_type, offset, limit) {
    var self = this;
    if (!release_type || release_type == "release") release_type = 'single,album';
    return new Promise((resolve, fail) => {
      self.search('artist:"' + artist_name + '" AND album:"' + release_name + '"', 0, 1, 'release').then(result => {
        self.getRelease(result.objects[0])
      });
    });

  }

  static getTrackByName(name, artist_name, release_type, offset, limit) {
    var self = this;
    if (!release_type || release_type == "release") release_type = 'single,album';
    return new Promise((resolve, fail) => {
      self.search('track:"' + name + '" AND album:"' + artist_name + '"', 0, 1, 'release').then(result => {
        resolve(result);
      });
    });

  }

  /**
   * Returns user by id
   **/
  getReleasesByArtist(id, release_type, offset, limit) {
    var self = this;
    return new Promise((resolve, fail) => {
      var params = {
        offset,
        limit,
      }
      if (release_type && release_type !== 'release') {
        params['album_type'] = release_type
      }
      self._request('GET', '/artists/' + id + '/albums', params).then(result => {

        resolve(result);
      }, err => {
        // console.log(err);
        fail(err);
      });
    });
  }

  /**
   * Returns user by id
   **/
  getShowsByPublisher(id, offset, limit) {
    var self = this;
    return new Promise((resolve, fail) => {
      var params = {
        offset,
        limit,
        type: 'show',
        q: id
      }
      self._request('GET', '/search', params).then(result => {

        resolve(result);
      }, err => {
        // console.log(err);
        fail(err);
      });
    });
  }

  /**
   * Returns user by id
   **/
  getAudiobooksByAuthor(id, release_type, offset, limit) {
    var self = this;

    if (!release_type || release_type == "release") release_type = 'single,album';
    return new Promise((resolve, fail) => {
      self._request('GET', '/artists/' + id + '/albums', {
        offset,
        limit,
        album_type: release_type
      }).then(result => {
        result.objects = result.objects.map(
          o => {
            o.type = 'audiobook',
              o.uri = 'spotify:audiobook:' + o.uri.split(/:/)[2]
            return o
          }
        )
        // console.log(result)
        resolve(result);
      }, err => {
        // console.log(err);
        fail(err);
      });
    });
  }

  /**
   * Returns user by id
   **/
  getReleases(id, release_type, offset, limit) {
    var self = this;

    if (!release_type || release_type == "release") release_type = 'single,album';
    return new Promise((resolve, fail) => {
      self._request('GET', '/artists/' + id + '/albums', {
        offset,
        limit,
        album_type: release_type
      }).then(result => {

        resolve(result);
      }, err => {
        // console.log(err);
        fail(err);
      });
    });
  }

  /**
   * Returns user by id
   **/
  getTracksInAlbum(id, offset, limit) {
    var self = this;
    return new Promise((resolve, fail) => {
      self._request('GET', '/albums/' + id + '/tracks', {offset, limit}).then(result => {
        resolve(result);
      }, err => {
        fail(err);
      });
    });
  }

  /**
   * Returns user by id
   **/
  getChaptersInAudiobook(id, offset, limit) {
    var self = this;
    return new Promise((resolve, fail) => {
      self._request('GET', '/albums/' + id + '/tracks', {offset, limit}).then(result => {
        result.objects = result.objects.map(
          o => {
            o.type = 'chapter',
              o.audiobook = o.album
            o.authors = o.artists
            o.uri = 'spotify:chapter:' + o.uri.split(/:/)[2]
            return o
          }
        )
        resolve(result);
      }, err => {
        fail(err);
      });
    });
  }

  getPlaylistById(identifier) {
    var self = this;
    return new Promise((resolve, fail) => {
      self._request('GET', '/playlists/' + identifier).then(result => {
        resolve(result)
      }, err => {
        fail(err);
      });
    });
  }

  /**
   * Returns user by id
   **/
  getPlaylist(username, identifier) {
    var self = this;
    return new Promise((resolve, fail) => {
      self._request('GET', '/users/' + username + '/playlists/' + identifier).then(result => {
        result.type = 'playlist'
        self._request('GET', '/users/' + username + '/playlists/' + identifier + '/tracks').then(result2 => {
          result.tracks = result2;
          result.snapshot_id = encodeURIComponent(result.snapshot_id);
          resolve(result);
        });
      }, err => {
        fail(err);
      });
    });
  }

  /**
   * Returns user by id
   **/
  getMeditation(username, identifier) {
    var self = this;
    return new Promise((resolve, fail) => {
      self._request('GET', '/users/' + username + '/playlists/' + identifier).then(result => {
        result.type = 'meditation'
        self._request('GET', '/users/' + username + '/playlists/' + identifier + '/tracks').then(result2 => {
          result2.objects = result2.objects.map(o => {
            o.type = 'seed'
            o.uri = o.uri.replace(/track/, 'seed')
            return o
          })
          result.seeds = result2;
          result.meditators = meditation.followers
          result.snapshot_id = encodeURIComponent(result.snapshot_id);
          resolve(result);
        });
      }, err => {
        fail(err);
      });
    });
  }

  /**
   * Returns user by id
   **/
  getCountry(code) {
    var self = this;
    return new Promise((resolve, fail) => {
      if (code === 'qi') {
        resolve({
          id: code,
          uri: 'spotify:country:' + code,
          name: 'Qiland',
          type: 'country',
          service,
          images: [{
            url: 'http://buddhalow.se/wp-content/uploads/2017/12/qi.png'
          }]
        });
        return;
      }
      request({
        url: 'https://restcountries.eu/rest/v2/alpha/' + code
      }, (err2, response2, body2) => {

        try {
          var result = JSON.parse(body2);

          resolve({
            id: code,
            uri: 'spotify:country:' + code,
            name: result.name,
            type: 'country',
            service,
            images: [{
              url: result.flag
            }]
          });
        } catch (e) {
          fail(500);
        }
      });
    });
  }

  getTopTracksInCountry(code, limit, offset) {
    var self = this;
    return new Promise((resolve, fail) => {
      if (code == 'qi') {
        var result = {
          name: 'Qiland',
          id: 'qi',
          service
        };
        var url = '/me/top/tracks'; // '/users/drsounds/playlists/2KVJSjXlaz1PFl6sbOC5AU';
        self._request('GET', url).then(result => {
          try {
            request({
              url: url + '/tracks',
              headers
            }, (err2, response2, body2) => {
              var result3 = JSON.parse(body2);
              resolve({
                objects: result3.items.map((track, i) => {
                  var track = assign(track, track.track);
                  track.user = track.added_by;
                  track.time = track.added_at;
                  track.position = i;
                  track.service = service;
                  if (track.user)
                    track.user.name = track.user.id;
                  track.user.service = service;
                  return track;
                })
              });
            });
          } catch (e) {
            fail(500);
          }
        }, err => {
          fail(500);
        });
      }
      self._request('GET', '/browse/categories/toplists/playlists?country=' + code + '&limit=' + limit + '&offset=' + offset).then(result2 => {
        try {
          self._request('GET', result2.objects[0].href.substr('https://api.spotify.com/v1'.length) + '/tracks').then(result3 => {

            resolve({
              objects: result3.items.map((track, i) => {
                var track = assign(track, track.track);
                track.user = track.added_by;
                track.album.service = service;
                track.position = i;
                track.artists = track.artists.map(a => {
                  a.service = service;
                  return a;
                })
                track.service = service;
                track.time = track.added_at;
                if (track.user)
                  track.user.name = track.user.id;
                return track;
              })
            });
          });
        } catch (e) {
          fail(500);
        }
      }, err => {
        fail(500);
      });
    });
  }

  getTopListForCountry(code, limit, offset) {
    var self = this;
    return new Promise((resolve, fail) => {
      if (code == 'qi') {
        resolve({
          id: code,
          uri: 'spotify:country:' + code + ':top:' + limit,
          name: 'Top Tracks',
          type: 'country',
          service,
          images: [{
            url: 'http://buddhalow.se/wp-content/uploads/2017/12/qi.png'
          }],
          in: {
            id: code,
            name: 'Qiland',
            uri: 'spotify:country:' + code
          }
        });
        return;
      }
      request({
        url: 'https://restcountries.eu/rest/v2/alpha/' + code
      }, (err2, response2, body2) => {

        try {
          var result = JSON.parse(body2);

          resolve({
            id: code,
            uri: 'spotify:country:' + code + ':top:' + limit,
            name: 'Top Tracks',
            type: 'country',
            service,
            images: [{
              url: result.flag
            }],
            in: {
              id: code,
              name: result.name,
              uri: 'spotify:country:' + code
            }
          });
        } catch (e) {
          fail(500);
        }
      });
    });
  }

  getTopTracksInCountry(code, limit, offset) {
    var self = this;
    return new Promise((resolve, fail) => {
      if (code == 'qi') {
        var result = {
          name: 'Qiland',
          id: 'qi',
          service
        };
        var url = '/users/drsounds/playlists/2KVJSjXlaz1PFl6sbOC5AU/tracks?limit=' + limit;
        self._request('GET', url).then(result3 => {

          resolve({
            uri: 'spotify:country:' + code + ':top:' + limit + ':track',
            objects: result3.objects.slice(0, limit).map((track, i) => {
              var track = assign(track, track.track);
              track.user = track.added_by;
              track.time = track.added_at;
              track.position = i;
              track.service = service;
              if (track.user)
                track.user.name = track.user.id;
              track.user.service = service;
              return track;
            })
          });
        }, err => {
          fail(500);
        });
        return;
      }
      self._request('GET', '/browse/categories/toplists/playlists?country=' + code + '&limit=' + limit + '&offset=' + offset).then(result2 => {
        try {
          var uri = result2.playlists.items[0].href.substr('https://api.spotify.com/v1'.length) + '/tracks';
          self._request('GET', uri).then(result3 => {
            try {
              resolve({
                uri: 'spotify:country:' + code + ':top:' + limit + ':track',
                objects: result3.objects.slice(0, limit).map((track, i) => {
                  var track = assign(track, track.track);
                  track.user = track.added_by;
                  track.album.service = service;
                  track.position = i;
                  track.artists = track.artists.map(a => {
                    a.service = service;
                    return a;
                  })
                  track.service = service;
                  track.time = track.added_at;
                  if (track.user)
                    track.user.name = track.user.id;
                  return track;
                })
              });
            } catch (e) {
              fail(500);
            }
          });
        } catch (e) {
          fail(500);
        }
      }, err => {
        fail(500);
      });
    });
  }

  reorderTracksInPlaylistSnapshot(
    username,
    identifier,
    snapshot_id,
    range_start,
    range_length,
    insert_before
  ) {
    var self = this;
    return new Promise((resolve, fail) => {
      self._request('PUT', '/users/' + username + '/playlists/' + identifier + '/tracks', {}, {
        range_start,
        range_length,
        insert_before,
        snapshot_id
      }).then(result => {
        resolve(result);
      }, err => {
        fail(err);
      });
    });
  }

  replaceTracksInPlaylistSnapshot(username, identifier, snapshot_id, uris) {
    var self = this;
    return new Promise((resolve, fail) => {
      self._request('PUT', '/users/' + username + '/playlists/' + identifier + '/tracks', {}, {
        uris
      }).then(result => {
        resolve(result);
      }, err => {
        fail(err);
      });
    });
  }

  addTracksToPlaylistSnapshot(username, identifier, snapshot_id, uris, position) {
    var self = this;
    return new Promise((resolve, fail) => {
      self._request('POST', '/users/' + username + '/playlists/' + identifier + '/tracks', null, {
        position,
        uris
      }).then(result => {
        resolve(result);
      }, err => {
        fail(err);
      });
    });
  }

  deleteTracksFromPlaylist(username, identifier, tracks) {
    var self = this;
    return new Promise((resolve, fail) => {
      self._request('DELETE', '/users/' + username + '/playlists/' + identifier + '/tracks', null, {
        tracks
      }).then(result => {
        resolve(result);
      }, err => {
        fail(err);
      });
    });
  }

  /**
   * Returns user by id
   * @remarks The snapshot_id is only for decorative purpose, since we currently can't retrieve tracks for a certain
   * snapshot from the Spotify API. The reason for using the deocrative is that we use the uri spotify:user:<user_id>:playlist:<playlist_id>:snapshot:<snapshot_id>:track
   * to allow for better editing facility
   **/
  getTracksInPlaylistSnapshot(username, identifier, snapshot_id, offset, limit) {
    var self = this;
    return new Promise((resolve, fail) => {
      self._request('GET', '/users/' + username + '/playlists/' + identifier + '/tracks', {
        offset,
        limit
      }).then(result => {
        resolve(result);
      }, err => {
        fail(err);
      });
    });
  }

  /**
   * Returns user by id
   * @remarks The snapshot_id is only for decorative purpose, since we currently can't retrieve tracks for a certain
   * snapshot from the Spotify API. The reason for using the deocrative is that we use the uri spotify:user:<user_id>:playlist:<playlist_id>:snapshot:<snapshot_id>:track
   * to allow for better editing facility
   **/
  getTracksInPlaylist(identifier, offset, limit) {
    var self = this;
    return new Promise((resolve, fail) => {
      self._request('GET', '/playlists/' + identifier + '/tracks', {
        offset,
        limit
      }).then(result => {
        resolve(result);
      }, err => {
        fail(err);
      });
    });
  }

  /**
   * Returns user by id
   * @remarks The snapshot_id is only for decorative purpose, since we currently can't retrieve tracks for a certain
   * snapshot from the Spotify API. The reason for using the deocrative is that we use the uri spotify:user:<user_id>:playlist:<playlist_id>:snapshot:<snapshot_id>:track
   * to allow for better editing facility
   **/
  getTracksInPlaylistByIdSnapshot(identifier, snapshot_id, offset, limit) {
    var self = this;
    return new Promise((resolve, fail) => {
      self._request('GET', '/playlists/' + identifier + '/tracks', {
        offset,
        limit
      }).then(result => {
        resolve(result);
      }, err => {
        fail(err);
      });
    });
  }

  /**
   * Returns user by id
   * @remarks The snapshot_id is only for decorative purpose, since we currently can't retrieve tracks for a certain
   * snapshot from the Spotify API. The reason for using the deocrative is that we use the uri spotify:user:<user_id>:playlist:<playlist_id>:snapshot:<snapshot_id>:track
   * to allow for better editing facility
   **/
  getSeedsInMeditationSnapshot(identifier, snapshot_id, offset, limit) {
    var self = this;
    return new Promise((resolve, fail) => {
      self._request('GET', '/playlists/' + identifier + '/tracks', {
        offset,
        limit
      }).then(result => {
        result.objects = result.objects.map(o => {
          o.type = 'seed'
          o.uri = o.uri.replace(/track/, 'seed')
          return o
        })
        resolve(result);
      }, err => {
        fail(err);
      });
    });
  }

  /**
   * Returns user by id
   **/
  getTracksInAlbum(identifier, offset, limit) {
    var self = this;
    return new Promise((resolve, fail) => {
      self._request('GET', '/albums/' + identifier + '/tracks', {
        offset,
        limit
      }).then(result => {
        resolve(result);
      }, err => {
        fail(err);
      });
    });
  }

  /**
   * Returns user by id
   **/
  getPlaylistsByUser(username, offset, limit) {
    var self = this;
    return new Promise((resolve, fail) => {
      self._request('GET', '/users/' + username + '/playlists', {
        limit,
        offset
      }).then(result => {
        result.type = 'playlist'
        /*Promise.all(result.objects.map(function (playlist) {
                    return self.getTracksInPlaylist(playlist.id);
                })).then(function (tracklists) {
                    try {
                        for (var i = 0; i < tracklists.length; i++) {
                            result.objects[i].tracks = tracklists[i];
                        }
                        resolve(result);
                    } catch (e) {
                        fail(e);
                    }
                }, function (err) {
                    fail(err);
                });*/
        resolve(result);
      }, err => {
        fail(err);
      });
    });
  }

  /**
   * Returns user by id
   **/
  getGenres(offset, limit) {
    var self = this;
    return new Promise((resolve, fail) => {
      self._request('GET', '/recommendations/available-genre-seeds', {
        limit,
        offset
      }).then(result => {
        // console.log(result)
        result.objects = result.genres.map((id) => {
          return {
            id,
            name: id,
            icon: id,
            images: [{
              'url': ''
            }],
            type: 'genre',
            uri: 'spotify:genre:' + id,

          };
        })
        delete result['genres']
        /*Promise.all(result.objects.map(function (playlist) {
                    return self.getTracksInPlaylist(playlist.id);
                })).then(function (tracklists) {
                    try {
                        for (var i = 0; i < tracklists.length; i++) {
                            result.objects[i].tracks = tracklists[i];
                        }
                        resolve(result);
                    } catch (e) {
                        fail(e);
                    }
                }, function (err) {
                    fail(err);
                });*/
        resolve(result);
      }, err => {
        fail(err);
      });
    });
  }

  /**
   * Returns user by id
   **/
  getTrack(identifier) {
    var self = this;
    return new Promise((resolve, fail) => {
      self._request('GET', '/tracks/' + identifier).then(result => {
        resolve(result);
      }, err => {
        fail(err);
      });
    });
  }

  /**
   * Returns user by id
   **/
  getMyPlaylists(offset, limit) {
    var self = this;
    return new Promise((resolve, fail) => {
      self._request('GET', '/me/playlists', {
        offset,
        limit
      }).then(result => {
        resolve(result);
      }, err => {
        fail(err);
      });
    });
  }

  /**
   * Returns user by id
   **/
  getMyArtists(offset, limit) {
    var self = this;
    return new Promise((resolve, fail) => {
      self._request('GET', '/me/artists', {
        offset,
        limit
      }).then(result => {
        resolve(result);
      }, err => {
        // console.log(err)
        fail(err);
      });
    });
  }

  /**
   * Returns user by id
   **/
  getRelatedArtistsForArtist(identifier, offset, limit) {
    var self = this;
    return new Promise((resolve, fail) => {
      self._request('GET', '/artists/' + identifier + '/related-artists', {
        offset,
        limit
      }).then(result => {
        resolve(result);
      }, err => {
        fail(err);
      });
    });
  }

  /**
   * Returns user by id
   **/
  getCategories(offset, limit) {
    var self = this;
    return new Promise((resolve, fail) => {
      self._request('GET', '/browse/categories', {
        offset,
        limit
      }).then(result => {
        resolve(result);
      }, err => {
        fail(err);
      });
    });
  }

  /**
   * Returns user by id
   **/
  getMyPlaylists(offset, limit) {
    var self = this;
    return new Promise((resolve, fail) => {
      self._request('GET', '/me/playlists', {
        offset,
        limit
      }).then(result => {
        resolve(result);
      }, err => {
        fail(err);
      });
    });
  }

  /**
   * Returns user by id
   **/
  getCategory(id, offset, limit) {
    var self = this;
    return new Promise((resolve, fail) => {
      self._request('GET', '/browse/categories/' + id, {
        offset,
        limit
      }).then(result => {
        result.images = result.icons
        resolve(result);
      }, err => {
        fail(err);
      });
    });
  }

  /**
   * Returns user by id
   **/
  getPlaylistsInCategory(id, offset, limit) {
    var self = this;
    return new Promise((resolve, fail) => {
      self._request('GET', '/browse/categories/' + id + '/playlists', {
        offset,
        limit
      }).then(result => {
        resolve({
          objects: result.playlists.items
        });
      }, err => {
        fail(err);
      });
    });
  }

  /**
   * Returns user by id
   **/
  getFeaturedPlaylists(offset, limit) {
    var self = this;
    return new Promise((resolve, fail) => {
      self._request('GET', '/browse/featured-playlists', {
        offset,
        limit
      }).then(result => {
        result.objects = result.playlists.items

        resolve(result);

      }, err => {
        fail(err);
      });
    });
  }

  /**
   * Returns user by id
   **/
  getNewReleases(offset, limit) {
    var self = this;
    return new Promise((resolve, fail) => {
      self._request('GET', '/browse/new-releases', {
        offset,
        limit
      }).then(result => {
        resolve(result);
      }, err => {
        fail(err);
      });
    });
  }

  /**
   * Returns user by id
   **/
  getMyReleases(id, offset, limit) {
    var self = this;
    return new Promise((resolve, fail) => {
      self._request('GET', '/me/albums', {
        offset,
        limit
      }).then(result => {
        resolve(result);
      }, err => {
        fail(err);
      });
    });
  }

  /**
   /**
   * Returns user by id
   **/
  getMyTracks(offset, limit) {
    var self = this;
    return new Promise((resolve, fail) => {
      // console.log("T");
      self._request('GET', '/me/tracks', {
        offset,
        limit
      }).then(result => {
        resolve(result);
      }, err => {
        fail(err);
      });
    });
  }

  /**
   /**
   * Returns user by id
   **/
  getMyArtists(offset, limit) {
    var self = this;
    return new Promise((resolve, fail) => {
      self._request('GET', '/me/artists', {
        offset,
        limit
      }).then(result => {
        resolve(result);
      }, err => {
        fail(err);
      });
    });
  }

  /**
   /**
   * Returns user by id
   **/
  getMyPlaylists(offset, limit) {
    var self = this;
    return new Promise((resolve, fail) => {
      self._request('GET', '/me/playlists', {
        offset,
        limit
      }).then(result => {
        resolve(result);
      }, err => {
        fail(err);
      });
    });
  }

  /**
   * Returns user by id
   **/
  playTrack(body) {
    var self = this;
    return new Promise((resolve, fail) => {

      self._request('PUT', '/me/player/play', {}, body).then(result => {
        resolve(result);
      }, err => {
        fail(err);
      });
    });
  }

  request(method, url, payload, postData, req, cb) {
    var self = this;
    this.req = req;
    return new Promise((resolve, fail) => {
      var activity = () => {
        if (!payload.offset) payload.offset = 0;
        if (!isNaN(payload.offset)) payload.offset = parseInt(payload.offset);
        if (!payload.type) payload.type = 'track';
        if (!isNaN(payload.limit)) payload.limit = parseInt(payload.limit);
        if (!payload.limit) payload.limit = 80;

        var token = self.getAccessToken();
        var headers = {};
        headers["Authorization"] = "Bearer " + token.access_token;
        if (payload instanceof Object) {
          headers["Content-type"] = "application/json";

        } else {
          headers["Content-type"] = ("application/x-www-form-urlencoded");


        }


        var parts = url.split(/\//);
        // console.log(parts);
        if (parts[0] == 'internal') {
          if (parts[1] == 'History') {
            if (parts[2] === 'track') {
              url = 'https://api.spotify.com/v1/me/player/recently-played?limit=' + (payload.limit || 39);

              request({
                  url,
                  headers
                },
                (error, response, body) => {

                  var data = JSON.parse(body);

                  try {
                    resolve({
                      'objects': data[payload.type].items.map((o, i) => {
                        o.position = i + payload.offset;
                        return o;
                      }), 'service': service
                    });
                  } catch (e) {
                    fail(e);
                  }
                }
              );
              return;
            }
          }
          if (parts[1] == 'library') {
            if (parts[2] == 'track') {
              request({
                  url: 'https://api.spotify.com/v1/me/tracks?limit=' + (payload.limit) + '&offset=' + (payload.offset),
                  headers
                },
                (error, response, body) => {
                  var data = JSON.parse(body);
                  try {
                    resolve({
                      type: 'library',
                      name: 'Library',
                      'objects': data.items.map((t, i) => {
                        var track = t.track;
                        track.service = service;
                        track.position = i + payload.offset;
                        return track;
                      })
                    });
                  } catch (e) {
                    fail();
                  }
                }
              );
            }
            resolve({
              id: 'library',
              uri: 'internal:library',
              name: 'Library',
              type: 'library',
              description: ''
            });
          }
        }
        if (parts[0] == 'search') {
          url = 'https://api.spotify.com/v1/    ?q=' + encodeURIComponent(payload.q) + '&type=' + (payload.type || 'track') + '&limit=' + (payload.limit || 39) + '&offset=' + (payload.offset || 1);
          request({
              url,
              headers
            },
            (error, response, body) => {

              var data = JSON.parse(body);
              try {
                resolve({
                  'objects': data[payload.type + 's'].items.map((o, i) => {
                    o.position = i + payload.offset;
                    return o;
                  }), 'service': service
                });
              } catch (e) {
                fail(e);
              }
            }
          );
        }
        if (parts[0] == 'me') {
          if (parts[1] == 'track') {
            request({
                url: 'https://api.spotify.com/v1/me/tracks?limit=85&limit=' + (payload.limit || 99) + '&offset=' + (payload.offset || 0) + '&country=se',
                headers

              },
              (error, response, body) => {
                var data = JSON.parse(body);
                try {
                  resolve({
                    type: 'library',
                    name: 'Library',
                    'objects': data.items.map((t, i) => {
                      var track = t.track;
                      track.service = service;
                      track.position = i + payload.offset;
                      return track;
                    })
                  });
                } catch (e) {
                  fail();
                }
              }
            );
            return;
          } else if (parts[1] == 'playlist') {
            request({
                url: 'https://api.spotify.com/v1/me/playlists?limit=' + (payload.limit || 99) + '&offset=' + (payload.offset || 0) + '&country=se',
                headers

              },
              (error, response, body) => {
                var data = JSON.parse(body);
                try {
                  resolve({
                    type: 'collection',
                    name: 'Playlists',
                    'objects': data.items.map((s, i) => {
                      s.service = service;
                      s.position = i + payload.offset;
                      return s;
                    }),
                    service
                  });
                } catch (e) {
                  fail(500);
                }
              }
            );
            return;

          } else if (parts[1] == 'player') {
            if (parts[2] == 'play') {

              var uri = 'https://api.spotify.com/v1/me/player/play';
              var d = {
                url: uri,
                headers,
                method,
                contentType: 'application/json',
                body: JSON.stringify(postData)
              };
              request(d,
                (error, response, body) => {
                  if (error) {
                    fail(500);
                    return;
                  }
                  request(
                    'https://api.spotify.com/v1/me/player',
                    {
                      headers
                    },
                    (error2, response2, body2) => {
                      try {
                        var result = JSON.parse(body2);
                        result.service = service;
                        resolve(result);
                      } catch (e) {
                        fail(500);
                      }
                      return;
                    });
                }
              );

              return;
            } else if (parts[2] === 'pause') {
              var uri = 'https://api.spotify.com/v1/me/player/pause';
              var d = {
                url: uri,
                headers,
                method,
                contentType: 'application/json',
                body: JSON.stringify(postData)
              };
              request(d,
                (error, response, body) => {
                  try {
                    resolve(JSON.parse(body));
                  } catch (e) {
                    fail();
                  }
                  return;
                }
              )
              return;
            } else if (parts[2] == 'currently-playing') {
              request(
                'https://api.spotify.com/v1/me/player/currently-playing',
                {
                  headers
                },
                (error2, response2, body2) => {
                  try {
                    var result = JSON.parse(body2);
                    result.service = service;
                    resolve({});
                  } catch (e) {
                    fail();
                  }
                });
              return;
            }
            return;
          } else {
            resolve({
              name: 'Library',
              uri: 'spotify:me',
              type: 'library'
            });
            return;
          }
          return;
        }
        if (parts[0] == 'artist') {
          if (parts.length > 2) {
            if (parts[2] == 'top') {
              if (parts.length > 4) {
                if (parts[4] == 'track') {
                  request({
                      url: 'https://api.spotify.com/v1/artists/' + parts[1] + '/top-tracks?limit=' + (payload.limit || 99) + '&offset=' + (payload.offset || 0) + '&country=se',
                      headers
                    },
                    (error, response, body) => {
                      var data = JSON.parse(body);
                      try {
                        resolve({
                          type: 'toplist',
                          name: 'Top Tracks',
                          'objects': data.tracks.slice(0, parseInt(parts[3])).map((t, i) => {
                            t.service = service;
                            t.position = i;
                            return t;
                          }),
                          service
                        });
                      } catch (e) {
                        fail();
                      }
                    }
                  );
                }
              } else {
                request({
                    url: 'https://api.spotify.com/v1/artists/' + parts[1] + '',
                    headers
                  },
                  (error, response, body) => {
                    var obj = JSON.parse(body);
                    resolve({
                      type: 'toplist',
                      name: 'Top Tracks',
                      service,
                      description: 'The top ' + parts[3] + ' tracks by <sp-link uri="' + obj.uri + '">' + obj.name + '</sp-link> that have played at most',
                      for: obj,
                      uri: obj.uri + ':top:' + parts[3],
                      images: [{
                        url: '/images/toplist.svg'
                      }]
                    });
                  });
              }
            }
            if (parts[2] == 'release') {
              var limit = (payload.limit || 10);
              request({
                  url: 'https://api.spotify.com/v1/artists/' + parts[1] + '/albums?limit=' + (payload.limit || 99) + '&offset=' + (payload.offset || 0),
                  headers
                },
                (error, response, body) => {
                  var data = JSON.parse(body);
                  try {
                    resolve({'objects': data.items});
                  } catch (e) {
                    fail();
                  }
                }
              );
              return;
            }
          } else {
            request({
                url: 'https://api.spotify.com/v1/artists/' + parts[1],
                headers
              },
              (error, response, body) => {
                try {
                  var data = JSON.parse(body);
                  // console.log(data);
                  data.service = service;
                  resolve(data);
                } catch (e) {
                  fail(500);
                }
              }
            );
            return;
          }
        }

        if (parts[0] == 'album') {
          if (parts.length > 2) {
            request({
                url: 'https://api.spotify.com/v1/albums/' + parts[1] + '/tracks',
                headers
              },
              (error, response, body) => {
                if (error) {
                  fail(500);
                }
                try {
                  body = body.replace('spotify:', '');

                  var data = JSON.parse(body);

                  resolve({
                    'objects': data.items.map((t, i) => {
                      t.service = service;
                      t.position = i;
                      return t;
                    }),
                    service
                  });
                } catch (e) {
                  resolve({
                    'objects': []
                  })
                }
              }
            );
          } else {
            request({
                url: 'https://api.spotify.com/v1/albums/' + parts[1] + '',
                headers
              },
              (error, response, body) => {
                try {


                  var data = JSON.parse(body);
                  data.service = service;
                  resolve(data);
                } catch (e) {
                  fail(500);
                }
              }
            );
          }
        }
        if (parts[0] == 'track') {
          request({
              url: 'https://api.spotify.com/v1/tracks/' + parts[1] + ''
            },
            (error, response, body) => {
              try {
                var data = JSON.parse(body);
                data.service = service;
                resolve(data);
              } catch (e) {
                fail();
              }
            }
          );
        }
        if (parts[0] == 'country') {
          var code = parts[1];
          if (parts[2] === 'category') {
            if (parts[4] === 'playlist') {
              request({
                url: 'https://api.spotify.com/v1/browse/categories/' + parts[3] + '/playlists?country=' + parts[1] + '&limit=' + payload.limit + '&offset=' + payload.offset,
                headers
              }, (err, response, body) => {
                try {
                  var result = JSON.parse(body);
                  resolve({
                    objects: result.playlists.map(o => {
                      o.service = service;
                      return o;
                    })
                  });
                } catch (e) {
                  fail(500);
                }
              });
              return;
            }
          } else if (parts[2] === 'top') {
            if (parts[4] === 'track') {
              if (parts[1] == 'qi') {
                var result = {
                  name: 'Qiland',
                  id: 'qi',
                  service
                };
                url = 'https://api.spotify.com/v1/users/drsounds/playlists/2KVJSjXlaz1PFl6sbOC5AU';
                request({
                  url,
                  headers
                }, (err, response, body) => {
                  try {
                    request({
                      url: url + '/tracks',
                      headers
                    }, (err2, response2, body2) => {
                      var result3 = JSON.parse(body2);
                      resolve({
                        objects: result3.items.map((track, i) => {
                          var track = assign(track, track.track);
                          track.user = track.added_by;
                          track.time = track.added_at;
                          track.position = i;
                          track.service = service;
                          if (track.user)
                            track.user.name = track.user.id;
                          track.user.service = service;
                          return track;
                        })
                      });
                    });
                  } catch (e) {
                    fail(500);
                  }
                });
                return;
              }
              request({
                url: 'https://api.spotify.com/v1/browse/categories/toplists/playlists?country=' + parts[1] + '&limit=' + payload.limit + '&offset=' + payload.offset,
                headers
              }, (err, response, body) => {
                try {
                  var result = JSON.parse(body);
                  result = {objects: result.playlists.items};
                  request({
                    url: result.objects[0].href + '/tracks',
                    headers
                  }, (err2, response2, body2) => {
                    var result3 = JSON.parse(body2);
                    resolve({
                      objects: result3.items.map((track, i) => {
                        var track = assign(track, track.track);
                        track.user = track.added_by;
                        track.album.service = service;
                        track.position = i;
                        track.artists = track.artists.map(a => {
                          a.service = service;
                          return a;
                        })
                        track.service = service;
                        track.time = track.added_at;
                        if (track.user)
                          track.user.name = track.user.id;
                        return track;
                      })
                    });
                  });
                } catch (e) {
                  fail(500);
                }
              });
              return;
            } else {
              if (code === 'qi') {
                var result = {
                  id: parts[3],
                  uri: 'spotify:country:' + code + ':top:' + parts[3],
                  name: 'Top Tracks',
                  type: 'toplist',
                  service,
                  images: [{
                    url: ''
                  }],
                  in: {
                    id: 'qi',
                    type: 'country',
                    name: 'Qiland',
                    uri: 'spotify:country:qi',
                    service,
                    images: [{
                      url: ''
                    }]
                  },
                  description: 'The most popular tracks in Qiland'
                };
                resolve(result);
                return;
              }
              request({
                url: 'https://restcountries.eu/rest/v2/alpha/' + code,
                headers
              }, (err2, response2, body2) => {

                try {
                  var result = JSON.parse(body2);

                  resolve({
                    id: parts[3],
                    uri: 'spotify:country:' + code + ':top:' + parts[3],
                    name: 'Top Tracks',
                    type: 'toplist',
                    service,
                    images: [{
                      url: result.flag
                    }],
                    in: result,
                    description: 'The most popular tracks in ' + result.name
                  })
                } catch (e) {
                  fail(500);
                }
              });
            }
          } else if (parts[2] === 'playlist') {
            request({
              url: 'https://api.spotify.com/v1/browse/categories/toplists/playlists?country=' + parts[1] + '&limit=' + payload.limit + '&offset=' + payload.offset,
              headers
            }, (err, response, body) => {
              try {
                var result = JSON.parse(body);
                resolve({
                  objects: result.playlists.map(p => {
                    p.service = service;
                    p.owner.service = service;
                  })
                });
              } catch (e) {
                fail(500);
              }
              return;
            })
          } else {
            if (code == 'qi') {
              resolve({
                type: 'country',
                name: 'Qiland',
                id: 'qi',
                uri: 'spotify:country:qi',
                service,
                images: [
                  {
                    url: ''
                  }
                ]
              })
            }
            request({
              url: 'https://restcountries.eu/rest/v2/alpha/' + code,
            }, (error, response, body) => {
              try {
                var result = JSON.parse(body);
                result.type = 'country';
                result.uri = 'spotify:country:' + code;
                result.service = service;
                result.images = [{
                  url: result.flag
                }]
                resolve(result);
              } catch (e) {
                fail(500);
              }
            });
            return;

          }
        }
        if (parts[0] == 'user') {
          var userid = parts[1];
          if (parts.length > 2) {
            if (parts[2] == 'playlist') {
              if (parts.length < 4) {
                payload = {
                  limit: 10,
                  offset: 0
                };
                url = 'https://api.spotify.com/v1/users/' + userid + '/playlists?limit=' + (payload.limit || 99) + '&offset=' + (payload.offset || 0)
                request({
                  url,
                  headers
                }, (error, response, body) => {
                  try {
                    var result = JSON.parse(body);
                    resolve({
                      'objects': result.items.map((p) => {
                        p.owner.name = p.owner.id;
                        p.service = service;
                        p.owner.service = service;
                        return p;
                      })
                    });
                  } catch (e) {
                    fail(503);
                  }

                });
                return;
              } else {
                if (parts[4] == 'follower') {
                  var users = [];
                  for (var i = 0; i < 10; i++) {
                    users.push({
                      'id': 'follower' + i,
                      'name': 'Track ' + i,
                      'uri': 'spotify:user:' + parts[3] + ':follower:' + i,
                      service: {
                        id: 'mock',
                        name: 'Mock',
                        uri: 'service:mock'
                      }
                    });
                  }
                  resolve({
                    'objects': users,
                    service: {
                      id: 'mock',
                      name: 'Mock',
                      uri: 'service:mock'
                    }
                  });
                } else if (parts[4] == 'track') {
                  url = 'https://api.spotify.com/v1/users/' + parts[1] + '/playlists/' + parts[3] + '/tracks?limit=' + (payload.limit || 50) + '&offset=' + (payload.offset || 0);
                  request({
                    url,
                    headers
                  }, (error, response, body) => {
                    try {
                      var result = JSON.parse(body);
                      resolve({
                        'objects': result.items.map((track, i) => {
                          var track = assign(track, track.track);
                          if (track.added_by)
                            track.added_by.service = service;
                          track.user = track.added_by;
                          track.time = track.added_at;
                          track.position = parseInt(payload.offset) + i;
                          track.service = service;
                          track.album.service = service;
                          track.artists = track.artists.map(a => {
                            a.service = service;
                            return a;
                          })
                          if (track.user) {
                            track.user.name = track.user.id;
                            track.user.service = service;
                          }
                          return track;
                        })
                      })
                    } catch (e) {
                      fail(500);
                    }
                  });
                } else {
                  request({
                    url: 'https://api.spotify.com/v1/users/' + parts[1] + '/playlists/' + parts[3] + '',
                    headers
                  }, (error, response, body) => {
                    try {
                      var result = JSON.parse(body);
                      result.owner.name = result.owner.id;
                      result.service = service;
                      result.owner.service = service;
                      resolve(result);
                    } catch (e) {
                      fail(500);
                    }
                  });
                }
              }
            }

          } else {
            // console.log("Getting users");
            request({
                url: 'https://api.spotify.com/v1/users/' + parts[1] + '',
                headers
              },
              (error, response, body) => {
                if (error) {
                  fail(500);
                }
                try {
                  var user = JSON.parse(body);
                  if (user) {
                    user.name = user.display_name;
                    user.service = service;
                  }
                  resolve(user);
                } catch (e) {
                  fail(500);
                }
              }
            );

          }
        }
        if (parts[0] == 'genre') {
          var userid = parts[1];
          if (parts.length > 2) {
            if (parts[2] == 'playlist') {
              if (parts.length < 4) {
                payload = {
                  limit: 10,
                  offset: 0
                };
                request({
                  url: 'https://api.spotify.com/v1/browse/categories/' + userid + '/playlists?limit=' + payload.limit + '&offset=' + payload.offset,
                  headers
                }, (error, response, body) => {
                  try {
                    var result = JSON.parse(body);


                    resolve({
                      'objects': result.playlists.items.map((pls, i) => {
                        pls.service = service;
                        pls.position = i + payload.offset;
                      }),
                      service
                    });
                  } catch (e) {
                    fail(500);
                  }
                });
                return;
              }
            }
          } else {
            // console.log("Getting users");
            request({
                url: 'https://api.spotify.com/v1/browse/categories/' + parts[1] + '',
                headers
              },
              (error, response, body) => {
                if (error) {
                  fail({'error': ''});
                }
                try {
                  var user = JSON.parse(body);
                  user.images = user.icons;
                  user.service = service;
                  resolve(user);
                } catch (e) {
                  fail(500);
                }
              }
            );

          }
        }
      };
      activity();
    });
  }

  getPlaylistsFeaturingArtist(name, exclude, offset, limit) {
    return new Promise((resolve, reject) => {
      var q = 'name=' + name + '&exclude=' + exclude + '&offset=' + offset + '&limit=' + limit;

      if (cache.isCached(q)) {
        var result = cache.load(q);
        resolve(result);
        return;
      }

      var promises = [0, 1, 2, 3].map(i => new Promise(
        (resolve2, reject2) => {
          offset = parseInt(offset);
          searchEngine.search('"' + name + '"', 'open.spotify.com/user', 'items(title,link)', '015106568197926965801%3Aif4ytykb8ws', exclude, offset + (i * limit), limit).then(result => {
            var data = {};
            try {
              data.objects = result.items.map((o) => {
                var uri = 'spotify:' + o.link.split('/').slice(3).join(':');
                return {
                  id: uri.split(':')[4],
                  uri,
                  name: o.title,
                  type: 'playlist',
                  user: {
                    name: uri.split(':')[2],
                    id: uri.split(':')[2],
                    uri: 'spotify:user:' + uri.split(':')[2],
                    type: 'user'
                  }
                };
              });
              data.service = result.service;
              resolve2(data);
            } catch (e) {
              // console.log(e);
              reject2(e);
            }
          }, err => {
            reject2(err);
          });
        }
      ));
      Promise.all(promises).then(
        results => {
          var data = {
            objects: [],
            service: {
              id: 'google',
              name: 'Google',
              type: 'service'
            }
          };
          results.map(r => {
            r.objects.map(o => {
              data.objects.push(o);
            })
          });
          cache.save(q, data);
          resolve(data);
        }
      ).catch(errors => {
        // console.log(errors);
        reject(errors);
      });
      ;
    });
  }

  getPlaylistsFeaturingRelease(name, artist, exclude, offset, limit) {
    return new Promise((resolve, reject) => {
      var q = 'name=' + name + '&exclude=' + exclude + '&offset=' + offset + '&limit=' + limit;
      var filePath = os.homedir() + '/.bungalow/cache/' + md5(q) + '.json';

      if (fs.existsSync(filePath)) {
        var result = JSON.parse(fs.readFileSync(filePath));
        resolve(result);
        return;
      }

      var promises = [0, 1, 2, 3].map(i => new Promise(
        (resolve2, reject2) => {
          offset = parseInt(offset);
          searchEngine.search('"' + artist + ' - ' + name + '"', 'open.spotify.com/user', 'items(title,link)', '015106568197926965801%3Aif4ytykb8ws', exclude, offset + (i * limit), limit).then(result => {
            var data = {};
            try {
              data.objects = result.items.map((o) => {
                var uri = 'spotify:' + o.link.split('/').slice(3).join(':');
                return {
                  id: uri.split(':')[4],
                  uri,
                  name: o.title,
                  type: 'playlist',
                  user: {
                    name: uri.split(':')[2],
                    id: uri.split(':')[2],
                    uri: 'spotify:user:' + uri.split(':')[2],
                    type: 'user'
                  }
                };
              });
              data.service = result.service;
              resolve2(data);
            } catch (e) {
              // console.log(e);
              reject2(e);
            }
          }, err => {
            reject2(err);
          });
        }
      ));
      Promise.all(promises).then(
        results => {
          var data = {
            objects: [],
            service: {
              id: 'google',
              name: 'Google',
              type: 'service'
            }
          };
          results.map(r => {
            r.objects.map(o => {
              data.objects.push(o);
            })
          });
          fs.writeFileSync(filePath, JSON.stringify(data));
          resolve(data);
        }
      ).catch(errors => {
        // console.log(errors);
        reject(errors);
      });
      ;
    });
  }

  requestAccessToken(code) {
    var self = this;
    var promise = new Promise((resolve, fail) => {
      var headers = {};
      headers["Authorization"] = "Basic " + new Buffer(self.apikeys.client_id).toString() + ':' + new Buffer(self.apikeys.client_secret);

      headers["Content-type"] = ("application/x-www-form-urlencoded");
      request({
          url: 'https://accounts.spotify.com/api/token',
          headers,
          form: "grant_type=authorization_code&code=" + code + "&redirect_uri=" + encodeURI(self.apikeys.redirect_uri)
        },
        (error, response, body) => {
          var data = JSON.parse(body);
          if (!('accessToken' in data)) {
            fail({'error': 'Request problem'});
            return;
          }
          self.setSession(data);
          self.nodeSpotifyService.getMe().then(data => {
            resolve(data);
          });

        }
      );
    });
    return promise;
  }

  addToCache(resource) {
  }

  notify(event) {
    var type = event.type;
    if (type in this.events) {
      this.events[type].call(this, event);
    }
  }

  addEventListener(event, callback) {
    this.events[event] = callback;
  }

  ready() {

  }

  getPosition() {
    return this.SpotifyBrowse.player.currentSecond;
  }

  logout() {
    this.SpotifyBrowse.logout();
  }

  stop() {
  }

  getImageForTrack(id, callback) {
    this.request('GET', 'https://api.spotify.com/v1/tracks/' + id).then(track => {
      callback(track.album.images[0].url);
    });
  }

  seek(position) {
  }

  login() {
    // console.log("Log in");
    var self = this;
    var promise = new Promise(function (resolve, fail) {
      alert("AFFF");
      var win = gui.Window.get(window.open('https://accounts.spotify.com/authorize/?client_id=' + this.apikeys.client_id + '&response_type=code&redirect_uri=' + encodeURI(this.apiKeys.redirect_uri) + '&scope=user-follow-read%20streaming%20user-read-birthdate%20user-read-private%20user-read-email%20app-remote-control&state=34fFs29kd09', {
        "position": "center",
        "focus": true,
        "toolbar": false,
        "frame": true
      }));
      // console.log(win);
      alert(win);
      var i = setInterval(() => {
        if (!win) {
          clearInterval(i);
          var code = localStorage.getItem("code", null);
          if (code) {
            self.requestAccessToken(code, () => {
              resolve();
            }, () => {
              fail();
            })
          }
        }
      }, 99);
    });
    return promise;
  }

  getAlbumTracks(id) {

    var self = this;
    var promise = new Promise((resolve, fail) => {
      self._request("GET", "/albums/" + id + "/tracks").then(data => {
        resolve(data);
      }, err => {
        fail(err);
      });
    });
    return promise;

  }

  getFolders(id) {

    var self = this;
    var promise = new Promise((resolve, fail) => {
      self._request("GET", "/me/folders").then(data => {
        resolve(data);
      }, err => {
        fail(err);
      });
    });
    return promise;
  }

  getFolderById(id) {

    var self = this;
    var promise = new Promise((resolve, fail) => {
      self._request("GET", "/me/folders/" + id).then(data => {
        resolve(data);
      }, err => {
        fail(err);
      });
    });
    return promise;
  }

  getPlaylistsInFolder(id) {

    var self = this;
    var promise = new Promise((resolve, fail) => {
      self._request("GET", "/me/folders/" + id).then(data => {
        resolve(data);
      }, err => {
        fail(err);
      });
    });
    return promise;
  }

  search(query, offset, limit, type) {
    var self = this;
    var promise = new Promise((resolve, fail) => {
      self._request('GET', '/search', {
        q: (query),
        limit,
        offset,
        type
      }).then(data => {
        resolve(data);
      }, err => {
        fail(err);
      });
    });
    return promise;
  }

  loadPlaylist(user, id, callback) {
    var self = this;
    var promise = new Promise((resolve, fail) => {
      self.request("GET", "/users/" + user + "/playlists/" + id + "/tracks").then(tracklist => {
        self.request("GET", "/users/" + uri.user + "/playlists/" + uri).then(playlist => {
          playlist.tracks = tracklist.tracks.items;
          resolve(playlist);
        });
      }, err => {
        fail(err);
      });
    });
    return promise;
  }

  createPlaylist(data) {
    var self = this;

    var promise = new Promise((resolve, fail) => {
      self.getMe().then(me => {
        self._request("POST", "/users/" + me.id + "/playlists", null, data).then(object => {
          resolve(object);
        }, err => {
          fail(err);
        });
      }, err => {
        fail(err);
      });
    });
    return promise;
  }

  getTopList(uri, callback) {

  }

  getUserPlaylists() {
    var self = this;
    var promise = new Promise((resolve, fail) => {
      var user = self.getMe();
      self.request("GET", "/users/" + user.id + '/playlists').then(data => {
        resolve({
          'objects': data.items
        });
      }, err => {
        fail(err);
      });
    });
    return promise;
  }

  getTopTracksForArtist(id, country, offset, limit) {
    var self = this;

    var promise = new Promise((resolve, fail) => {
      self._request("GET", "/artists/" + id + '/top-tracks', {
        country
      }).then(data => {
        resolve(data);
      }, err => {
        fail(err);
      }, err => {
        fail(err);
      });
    });
    return promise;
  }

  getTopTracksForLabel(id, offset, limit) {
    var self = this;

    var promise = new Promise((resolve, fail) => {
      self._request("GET", "/search", {
        q: 'label:"' + id + '"',
        limit,
        offset,
        type: 'track'
      }).then(data => {
        resolve(data);
      }, err => {
        fail(err);
      });
    });
    return promise;
  }

  getArtistsOfLabel(id, offset, limit) {
    var self = this;

    var promise = new Promise((resolve, fail) => {
      self._request("GET", "/search", {
        q: 'label:"' + id + '"',
        limit,
        offset,
        type: 'artist'
      }).then(data => {
        resolve(data);
      }, err => {
        fail(err);
      });
    });
    return promise;
  }

  getAlbum(id) {
    var self = this;
    var promise = new Promise((resolve, fail) => {
      self._request('GET', '/albums/' + id).then(album => {
        album.image = album.images[0].url;
        album.tracks = [];
        resolve(album);
      }, err => {
        fail(err);
      });
    });
    return promise;
  }

  getAudiobook(id) {
    var self = this;
    var promise = new Promise((resolve, fail) => {
      self._request('GET', '/albums/' + id).then(album => {
        album.image = album.images[0].url;
        album.type = 'audiobook'
        album.authors = album.artists
        delete album.authors
        album.tracks = [];
        resolve(album);
      }, err => {
        fail(err);
      });
    });
    return promise;
  }

  resolveTracks(uris, callback) {

  }

  getPlaylistTracks(user, playlist_id, page, callback) {
    var self = this;
    var promise = new Promise((resolve, fail) => {
      self._request('GET', '/users/' + user + '/playlists/' + playlist_id).then(data => {
        resolve({
          'objects': data.tracks.items
        });
      }, err => {
        fail(err);
      });
    });
    return promise;
  }

  playPause() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.resume();
    }
  }

  pause() {
    this.isPlaying = false;
  }

  resume() {
    this.isPlaying = true;
  }

  reorderTracks(playlistUri, indices, newPosition) {
    // console.log("SpotifyBrowse is now reordering tracks");
    // console.log("Done successfully");
  }

  removeTracks(playlist, indices) {
    playlist.reorderTracks(indices, newPosition);
  }

  addTracks(playlist, tracks, position) {
    playlist.addTracks(tracks, position);
  }

  createServer() {
    var app = express();
    app.timeout = .1;
    app.use(function (err, req, res, next) {
      console.error(err.stack)
      res.status(500).send('Something broke!')
    })

    app.use(cookieParser());
    var music = this

    app.use((req, res, next) => {
      music.req = req;
      music.res = res;
      var session = req.cookies['spotify'];
      if (!!session) {
        console.log(session);
        try {
          music.session = JSON.parse(session);
        } catch (e) {

        }
      }
      next();
    });


    app.get('/login', (req, res) => {
      res.redirect(music.getLoginUrl());
    });

    app.get('/authenticate', (req, res) => {
      // console.log("Got authenticate request");
      // console.log(req);
      music.authenticate(req, (err, session) => {
        if (err != null) {
          res.status(err).send({error: err});
          res.send();
        }
        // console.log("success");
        res.clearCookie('spotify');
        res.statusCode = 200;


        var strSession = JSON.stringify(session);
        res.cookie('spotify', strSession);
        res.json(session);
        res.send();

      });
    });


    app.get('/login', (req, res) => {
      res.redirect(music.getLoginUrl());
    });


    app.get('/library/playlist', (req, res) => {
      this.getMyPlaylists(req.query.offset || 0, req.query.limit || 50).then(result => {

        res.json(result);
      }, err => {
        res.status(err).send({error: err});
      });
    })
    app.get('/library/playlists', (req, res) => {
      this.getMyPlaylists(req.query.offset || 0, req.query.limit || 50).then(result => {

        res.json(result);
      }, err => {
        res.status(err).send({error: err});
      });
    })
    app.get('/user/:username/playlist', (req, res) => {
      var body = {};
      if (req.body) {
        body = (req.body);
      }
      music.getPlaylistsByUser(req.params.username, req.query.offset, req.query.limit).then(result => {

        res.json(result);
      }, err => {
        res.status(err).send({error: err});
      });
    });


    app.get('/label/:username/playlist', (req, res) => {


      var body = {};
      if (req.body) {
        body = (req.body);
      }
      music.getPlaylistsByUser(req.params.username, req.query.offset, req.query.limit).then(result => {

        res.json(result);
      }, err => {
        res.status(err).send({error: err});
      });
    });

    app.get('/label/:identifier/artist', (req, res) => {


      var body = {};
      if (req.body) {
        body = (req.body);
      }
      music.getArtistsOfLabel(req.params.identifier, req.query.offset, req.query.limit).then(result => {

        res.json(result);
      }, err => {
        res.status(err).send({error: err});
      });
    });

    app.get('/history', (req, res) => {


      var body = {};
      if (req.body) {
        body = (req.body);
      }
      res.json({
        id: 'history',
        name: 'History',
        type: 'history',
        uri: 'spotify:history'
      })
    });

    app.get('/history/track', (req, res) => {


      var body = {};
      if (req.body) {
        body = (req.body);
      }
      music._request('GET', '/me/player/recently-played').then(result => {

        res.json(result);
      }, err => {
        res.status(err).send({error: err});
      });
    });

    app.get('/label/:identifier/top/:number/track', (req, res) => {


      var body = {};
      if (req.body) {
        body = (req.body);
      }
      music.getTopTracksForLabel(req.params.identifier, 0, req.params.number).then(result => {

        res.json(result);
      }, err => {
        res.status(err).send({error: err});
      });
    });

    app.get('/label/:identifier/top/:number', (req, res) => {


      var body = {};
      if (req.body) {
        body = (req.body);
      }
      music.getTopTracksForLabel(req.params.identifier, 0, req.params.number).then(result => {

        res.json({
          images: [{
            url: ''
          }],
          id: req.identifier,
          type: 'toplist',
          tracks: result.objects,
          uri: 'spotify:label:' + req.params.identifier + ':top:' + req.params.number,
          name: 'Top Tracks'
        })
      })
    });
    app.get('/user/:username', (req, res) => {


      var body = {};
      if (req.body) {
        body = (req.body);
      }
      music.getUser(req.params.username).then(result => {

        res.json(result);
      }, err => {
        res.status(err).send({error: err});
      });
    });


    app.get('/curator/:username/playlist', (req, res) => {


      var body = {};
      if (req.body) {
        body = (req.body);
      }
      music.getPlaylistsByUser(req.params.username, req.query.offset, req.query.limit).then(result => {

        res.json(result);
      }, err => {
        res.status(err).send({error: err});
      });
    });


    app.get('/curator/:username', (req, res) => {


      var body = {};
      if (req.body) {
        body = (req.body);
      }
      music.getUser(req.params.username).then(result => {

        res.json(result);
      }, err => {
        res.status(err).send({error: err});
      });
    });

    app.get('/me/playlist', (req, res) => {


      var body = {};
      if (req.body) {
        body = (req.body);
      }
      music.getMyPlaylists(req.query.offset, req.query.limit).then(result => {

        res.json(result);
      }, err => {
        res.status(err).send({error: err});
      });
    });

    app.get('/me/folder', (req, res) => {


      var body = {};
      if (req.body) {
        body = (req.body);
      }
      music.getFolders(req.query.offset, req.query.limit).then(result => {

        res.json(result);
      }, err => {
        res.status(err).send({error: err});
      });
    });

    app.get('/me/release', (req, res) => {


      var body = {};
      if (req.body) {
        body = (req.body);
      }
      music.getMyReleases(req.query.offset, req.query.limit).then(result => {

        res.json(result);
      }, err => {
        res.status(err).send({error: err});
      });
    });
    app.get('/publisher/:id', (req, res) => {


      var body = {};
      if (req.body) {
        body = (req.body);
      }
      let id = req.params.id;
      res.json({
        id,
        name: id,
        type: 'publisher',
        uri: 'spotify:publisher:' + id
      })
    });

    app.get('/publisher/:id/show', (req, res) => {


      var body = {};
      if (req.body) {
        body = (req.body);
      }
      music.getShowsByPublisher(req.params.id, req.query.offset, req.query.limit).then(result => {
        result.objects = result.shows.items;
        res.json(result);
      }, err => {
        res.status(err).send({error: err});
      });
    });
    app.get('/library', (req, res) => {


      var body = {};
      if (req.body) {
        body = (req.body);
      }
      res.json({
        id: 'library',
        name: 'Library',
        uri: 'internal:library',
        description: 'My Library',
        type: 'library'
      });
    });
    app.put('/me/player/play', (req, res) => {


      var body = {};
      if (req.body) {
        body = (req.body);
        delete body.offset;
      }
      music.playTrack(body).then(result => {
        res.json({}).send();
      }, err => {

        res.status(err).send({error: err});
      });
    });

    app.put('/me/player/pause', (req, res) => {


      var body = {};
      if (req.body) {
        body = (req.body);
        delete body.offset;
      }
      music._request('PUT', '/me/player/pause').then(result => {
        res.json({}).send();
      }, err => {
        res.status(err).send({error: err});
      });
    });

    app.put('/me/player/seek', (req, res) => {

      console.log(req.body);

      music._request('PUT', '/me/player/seek', {position_ms: parseInt(req.body.position_ms)}).then(result => {
        res.json({}).send();
      }, err => {
        res.status(err).send({error: err});
      });
    });


    app.get('/me/player/currently-playing', (req, res) => {


      var body = {};
      if (req.body) {
        body = (req.body);
      }
      music.getCurrentTrack(body).then(result => {

        res.json(result);
      }, err => {
        res.status(err).send({error: err});
      });
    });


    app.get('/library/top/:top/track', (req, res) => {


      var body = {};
      if (req.body) {
        body = (req.body);
      }
      music.getMyTracks(req.query.offset, req.query.limit).then(result => {

        res.json(result);
      }, err => {
        res.status(err).send({error: err});
      });
    });

    app.get('/library/track', (req, res) => {


      var body = {};
      if (req.body) {
        body = (req.body);
      }
      music.getMyTracks(req.query.offset, req.query.limit).then(result => {

        res.json(result);
      }, err => {
        res.status(err).send({error: err});
      });
    });

    app.get('/library/artist', (req, res) => {


      var body = {};
      if (req.body) {
        body = (req.body);
      }
      // console.log("FG")
      this.getMyArtists(req.query.offset, req.query.limit).then(result => {

        // console.log("FG")
        res.json(result);
      }, err => {
        // console.log(err)
        res.status(err).send({error: err});
      });
    });

    app.get('/category', (req, res) => {


      var body = {};
      if (req.body) {
        body = (req.body);
      }
      music.getCategories(req.query.offset, req.query.limit).then(result => {

        res.json(result);
      }, err => {
        res.status(err).send({error: err});
      });
    });


    app.get('/category/:identifier', (req, res) => {


      var body = {};
      if (req.body) {
        body = (req.body);
      }
      music.getCategory(req.params.identifier, req.query.offset, req.query.limit).then(result => {

        res.json(result);
      }, err => {
        res.status(err).send({error: err});
      });
    });


    app.get('/label/:identifier', (req, res) => {
      /*wiki.req = req;
            var name = decodeURIComponent(req.params.identifier);
            wiki.describe(name).then(function (description) {
                res.json({
                    name: name,
                    description: description || ''
                });
            });*/
      res.json({
        images: [
          {
            url: ''
          }
        ],
        id: req.params.identifier,
        name: req.params.identifier,
        uri: 'spotify:label:' + req.params.identifier,
        type: 'label'
      });
    });


    app.get('/label/:identifier/release', (req, res) => {

      var name = decodeURIComponent(req.params.identifier);
      music.search('label:"' + req.params.identifier + '"', req.params.limit, req.params.offset, 'album').then(result => {
        res.json(result);
      }, err => {
        res.status(err).send({error: err});
      });
    });


    app.get('/category/:identifier/playlist', (req, res) => {


      var body = {};
      if (req.body) {
        body = (req.body);
      }
      music.getPlaylistsInCategory(req.params.identifier, req.query.offset, req.query.limit).then(result => {

        res.json(result);
      }, err => {
        res.status(err).send({error: err});
      });
    });


    app.get('/search', (req, res) => {


      var body = {};
      if (req.body) {
        body = (req.body);
      }
      music.search(req.query.q, req.query.offset, req.query.limit,  req.query.type).then(result => {
        result.images = [{
          url: ''
        }]
        res.json(result);
      }, err => {
        res.status(err).send({error: err});
      });
    });


    app.get('/search', (req, res) => {


      var body = {};
      if (req.body) {
        body = (req.body);
      }
      music.search(req.query.q, req.query.limit, req.query.offset, req.query.type).then(result => {
        result.images = [{
          url: ''
        }]
        result.uri = 'media:search:' + req.params.query
        res.json(result);
      }, err => {
        res.status(err).send({error: err});
      });
    });


    app.get('/year/:year', (req, res) => {


      var body = {};
      if (req.body) {
        body = (req.body);
      }
      music.search('year:' + req.params.year, req.query.limit, req.query.offset, req.query.type).then(result => {
        result.images = [{
          url: ''
        }]
        result.type = 'year'
        result.name = req.params.year
        result.id = req.params.year
        result.uri = 'spotify:year:' + req.params.year
        res.json(result);
      }, err => {
        res.status(err).send({error: err});
      });
    });

    app.get('/genre/:genre', (req, res) => {


      var body = {};
      if (req.body) {
        body = (req.body);
      }
      music.search('genre:"' + req.params.genre + '"', req.query.limit, req.query.offset, req.query.type).then(result => {
        result.images = [{
          url: ''
        }]
        result.type = 'genre'
        result.name = req.params.genre
        result.uri = 'spotify:genre:' + req.params.genre
        result.id = req.params.genre
        res.json(result);
      }, err => {
        res.status(err).send({error: err});
      });
    });

    app.get('/genre', (req, res) => {


      var body = {};
      if (req.body) {
        body = (req.body);
      }
      music.getGenres(req.query.limit, req.query.offset, req.query.type).then(result => {
        res.json(result);
      }, err => {
        res.status(err).send({error: err});
      });
    });

    app.get('/search/:query/track', (req, res) => {


      var body = {};
      if (req.body) {
        body = (req.body);
      }
      music.search(req.params.query, req.query.offset, req.query.limit, 'track').then(result => {

        res.json(result);
      }, err => {
        res.status(err).send({error: err});
      });
    });

    app.get('/label/:query/track', (req, res) => {


      var body = {};
      if (req.body) {
        body = (req.body);
      }
      music.search('label:"' + req.params.query + '"', req.query.offset, req.query.limit, 'track').then(result => {

        res.json(result);
      }, err => {
        res.status(err).send({error: err});
      });
    });

    app.get('/year/:year/track', (req, res) => {


      var body = {};
      if (req.body) {
        body = (req.body);
      }
      music.search('year:' + req.params.year, req.query.offset || 0, req.query.limit || 28, 'track').then(result => {

        res.json(result);
      }, err => {
        res.status(err).send({error: err});
      });
    });

    app.get('/genre/:genre/track', (req, res) => {


      var body = {};
      if (req.body) {
        body = (req.body);
      }
      music.search('genre:"' + req.params.genre + '"', req.query.offset, req.query.limit, 'track').then(result => {

        res.json(result);
      }, err => {
        res.status(err).send({error: err});
      });
    });

    app.get('/search/:query/artist', (req, res) => {


      var body = {};
      if (req.body) {
        body = (req.body);
      }
      music.search(req.params.query, req.query.limit, req.query.offset, 'artist').then(result => {

        res.json(result);
      }, reject => {
        res.json(reject);
      });
    });


    app.get('/year/:year/artist', (req, res) => {


      var body = {};
      if (req.body) {
        body = (req.body);
      }
      music.search('year:' + req.params.year + '', req.query.limit, req.query.offset, 'artist').then(result => {

        res.json(result);
      }, reject => {
        res.json(reject);
      });
    });

    app.get('/genre/:genre/artist', (req, res) => {


      var body = {};
      if (req.body) {
        body = (req.body);
      }
      music.search('genre:"' + req.params.genre + '"', req.query.limit, req.query.offset, 'artist').then(result => {

        res.json(result);
      }, reject => {
        res.json(reject);
      });
    });


    app.get('/search/:query/release', (req, res) => {


      var body = {};
      if (req.body) {
        body = (req.body);
      }
      music.search(req.params.query, req.query.limit, req.query.offset, 'album').then(result => {

        res.json(result);
      }, err => {
        res.status(err).send({error: err});
      });
    });


    app.get('/genre/:genre/release', (req, res) => {


      var body = {};
      if (req.body) {
        body = (req.body);
      }
      music.search('genre:"' + req.params.genre + '"', req.query.limit, req.query.offset, 'album').then(result => {

        res.json(result);
      }, err => {
        res.status(err).send({error: err});
      });
    });

    app.get('/year/:year/release', (req, res) => {


      var body = {};
      if (req.body) {
        body = (req.body);
      }
      music.search('year:' + req.params.year + '', req.query.limit, req.query.offset, 'album').then(result => {

        res.json(result);
      }, err => {
        res.status(err).send({error: err});
      });
    });

    app.get('/genre/:genre/album', (req, res) => {


      var body = {};
      if (req.body) {
        body = (req.body);
      }
      music.search('genre:"' + req.params.genre + '"', req.query.limit, req.query.offset, 'album').then(result => {

        res.json(result);
      }, err => {
        res.status(err).send({error: err});
      });
    });

    app.get('/year/:year/release', (req, res) => {


      var body = {};
      if (req.body) {
        body = (req.body);
      }
      music.search('year:"' + req.params.year + '"', req.query.limit, req.query.offset, 'album').then(result => {

        res.json(result);
      }, err => {
        res.status(err).send({error: err});
      });
    });

    app.get('/year/:genre/album', (req, res) => {


      var body = {};
      if (req.body) {
        body = (req.body);
      }
      music.search('year:"' + req.params.query + '"', req.query.limit, req.query.offset, 'album').then(result => {

        res.json(result);
      }, err => {
        res.status(err).send({error: err});
      });
    });
    app.get('/search/:query/album', (req, res) => {


      var body = {};
      if (req.body) {
        body = (req.body);
      }
      music.search(req.params.query, req.query.limit, req.query.offset, 'album').then(result => {

        res.json(result);
      }, err => {
        res.status(err).send({error: err});
      });
    });


    app.get('/search/:query/playlist', (req, res) => {


      var body = {};
      if (req.body) {
        body = (req.body);
      }
      music.search(req.query.q, req.query.limit, req.query.offset, 'playlist').then(result => {

        res.json(result);
      }, err => {
        res.status(err).send({error: err});
      });
    });


    app.get('/user/:username/playlist/:identifier', (req, res) => {


      var body = {};
      if (req.body) {
        body = (req.body);
      }
      music.getPlaylist(req.params.username, req.params.identifier).then(result => {

        res.json(result);
      }, err => {
        res.status(err).send({error: err});
      });
    });


    app.get('/playlist/:identifier', (req, res) => {


      var body = {};
      if (req.body) {
        body = (req.body);
      }
      if (req.params.identifier === 'new') {
        res.json({
          id: 'new',
          type: 'playlist',
          name: 'New Playlist'
        });
        return;
      }
      music.getPlaylistById(req.params.identifier).then(result => {

        res.json(result);
      }, err => {
        res.status(err).send({error: err});
      });
    });

    app.get('/user/:username/meditation/:identifier', (req, res) => {


      var body = {};
      if (req.body) {
        body = (req.body);
      }
      music.getMeditation(req.params.username, req.params.identifier).then(result => {

        res.json(result);
      }, err => {
        res.status(err).send({error: err});
      });
    });

    app.get('/user/:username/playlist/:identifier/snapshot/:snapshot_id/track', (req, res) => {


      var body = {};
      if (req.body) {
        body = (req.body);
      }
      music.getTracksInPlaylistSnapshot(req.params.username, req.params.identifier, req.params.snapshot_id, req.query.offset, req.query.limit).then(result => {
        res.json(result);
      }, err => {
        res.status(err).send({error: err});
      });
    });


    app.get('/playlist/:identifier/snapshot/:snapshot_id/track', (req, res) => {


      var body = {};
      if (req.body) {
        body = (req.body);
      }
      music.getTracksInPlaylistByIdSnapshot(req.params.identifier, req.params.snapshot_id, req.query.offset, req.query.limit).then(result => {
        res.json(result);
      }, err => {
        res.status(err).send({error: err});
      });
    });


    app.get('/playlist/:identifier/track', (req, res) => {


      var body = {};
      if (req.body) {
        body = (req.body);
      }

      if (req.params.identifier === 'new') {
        res.json({
          objects: []
        });
        return;
      }
      music.getTracksInPlaylist(req.params.identifier, req.query.offset, req.query.limit).then(result => {
        res.json(result);
      }, err => {
        res.status(err).send({error: err});
      });
    });

    app.get('/user/:username/meditation/:identifier/snapshot/:snapshot_id/seed', (req, res) => {


      var body = {};
      if (req.body) {
        body = (req.body);
      }
      music.getSeedsInMeditationSnapshot(req.params.identifier, req.params.snapshot_id, req.query.offset, req.query.limit).then(result => {
        res.json(result);
      }, err => {
        res.status(err).send({error: err});
      });
    });

    app.post('/user/:username/playlist/:identifier/snapshot/:snapshot_id/track', (req, res) => {


      var body = {};
      if (req.body) {
        body = (req.body);
      }
      music.addTracksToPlaylistSnapshot(req.params.username, req.params.identifier, req.params.snapshot_id, body.uris, body.position).then(result => {
        res.json(result);
      }, err => {
        res.status(err).send({error: err});
      });
    });


    app.put('/user/:username/playlist/:identifier/snapshot/:snapshot_id/track', (req, res) => {


      var body = {};
      if (req.body) {
        body = (req.body);
      }
      if ('range_start' in body) {
        music.reorderTracksInPlaylistSnapshot(req.params.username, req.params.identifier, req.params.snapshot, body.range_start, body.range_length + 1, parseInt(body.insert_before)).then(result => {
          res.json(result);
        }, err => {
          res.status(err).send({error: err});
        });
      } else {
        music.replaceTracksInPlaylistSnapshot(req.params.username, req.params.identifier, req.params.snapshot_id, body.uris).then(result => {
          res.json(result);
        }, err => {
          res.status(500).send({error: err});
        });
      }
    });


    app.get('/artist/:identifier', (req, res) => {


      var body = {};
      if (req.body) {
        body = (req.body);
      }
      music.getArtist(req.params.identifier).then(result => {

        res.json(result).send();
      }, error => {
        res.status(500).json(error).send();
      })

    });

    app.get('/show/:identifier', (req, res) => {


      var body = {};
      if (req.body) {
        body = (req.body);
      }
      music._request('GET', '/shows/' + req.params.identifier).then(result => {

        res.json(result).send();
      }, error => {
        res.status(500).json(error).send();
      })

    });


    app.get('/me/artist', (req, res) => {


      var body = {};
      if (req.body) {
        body = (req.body);
      }
      music._request('GET', '/me/following', {type: 'artist'}).then(result => {

        res.json(result).send();
      }, error => {
        console.log(error);
        res.status(500).json(error).send();
      })

    });

    app.get('/show/:identifier/episode', (req, res) => {


      var body = {};
      if (req.body) {
        body = (req.body);
      }
      music._request('GET', '/shows/' + req.params.identifier + '/episodes', {limit: req.query.limit}).then(result => {

        res.json(result).send();
      }, error => {
        res.status(500).json(error).send();
      })

    });

    app.get('/author/:identifier', (req, res) => {


      var body = {};
      if (req.body) {
        body = (req.body);
      }
      music.getAuthorByName(req.params.identifier).then(result => {
        res.json(result).send();
      }, error => {
        res.status(500).json(error).send();
      })

    });

    app.get('/artist/:identifier/about', (req, res) => {


      var body = {};
      if (req.body) {
        body = (req.body);
      }
      music.getAboutPageForArtist(req.params.identifier).then(result => {
        res.json(result).send();
      }, error => {
        res.json({}).send()
        //    res.status(500).json(error).send();
      })

    });

    app.get('/artist/:identifier/playlist', (req, res) => {


      var body = {};
      if (req.body) {
        body = (req.body);
      }
      music.getArtistByName(req.params.identifier).then(artist => {
        var manager_id = '';
        if ('manager' in artist) {
          manager_id = artist.manager.id;
        }
        var offset = req.query.offset || 0;
        music.getPlaylistsFeaturingArtist(artist.name, manager_id, offset, 10).then(result => {
          res.json(result).send();
        }, err => {
          res.status(500).json(err).send();
        });
      }, error => {
        res.status(500).json(error).send();
      })
    });


    app.get('/author/:identifier/playlist', (req, res) => {


      var body = {};
      if (req.body) {
        body = (req.body);
      }
      music.getArtistByName(req.params.identifier).then(artist => {
        var manager_id = '';
        if ('manager' in artist) {
          manager_id = artist.manager.id;
        }
        var offset = req.query.offset || 0;
        music.getPlaylistsFeaturingArtist(artist.name, manager_id, offset, 10).then(result => {
          res.json(result).send();
        }, err => {
          res.status(500).json(err).send();
        });
      }, error => {
        res.status(500).json(error).send();
      })
    });


    app.get('/album/:identifier/playlist', (req, res) => {


      var body = {};
      if (req.body) {
        body = (req.body);
      }
      music.getAlbum(req.params.identifier).then(release => {
        music.getPlaylistsFeaturingRelease(release.name, release.artists[0].name, '', req.query.offset, 10).then(result => {
          res.json(result).send();
        }, err => {
          res.status(500).json(err).send();
        });
      }, error => {
        res.status(500).json(error).send();
      })
    });


    app.get('/audiobook/:identifier/playlist', (req, res) => {


      var body = {};
      if (req.body) {
        body = (req.body);
      }
      music.getAlbum(req.params.identifier).then(release => {
        music.getPlaylistsFeaturingRelease(release.name, release.artists[0].name, '', req.query.offset, 10).then(result => {
          res.json(result).send();
        }, err => {
          res.status(500).json(err).send();
        });
      }, error => {
        res.status(500).json(error).send();
      })
    });


    app.get('/release/:identifier/playlist', (req, res) => {


      var body = {};
      if (req.body) {
        body = (req.body);
      }
      music.getAlbum(req.params.identifier).then(release => {
        music.getPlaylistsFeaturingRelease(release.name, '', req.query.offset, 10).then(result => {
          res.json(result).send();
        }, err => {
          res.status(500).json(err).send();
        });
      }, error => {
        res.status(500).json(error).send();
      })
    });


    app.get('/artist/:artist_id/album/:album_id', (req, res) => {


      var body = {};
      if (req.body) {
        body = (req.body);
      }

      music.getAlbum(req.params.identifier).then(result => {
        res.json(result).send();
      }, err => {
        res.status(500).json(err).send();
      });

    });


    app.get('/artist/:identifier/info', (req, res) => {

      music.getArtistByName(req.params.identifier).then(artist => {
        music.getPlaylistsFeaturingArtist(artist.name, 0).then(result => {
          musicInfo.getArtistInfo(result.name).then(artistInfo => {
            res.json(artistInfo);
          }, err => {
            res.status(err).send({error: err});
          });
        }, err => {
          res.status(500).json(err).send();
        });
      }, error => {
        res.status(500).json(error).send();
      })

    })


    app.get('/artist/:identifier/about', (req, res) => {


      var body = {};
      if (req.body) {
        body = (req.body);
      }
      res.json({}).send()
      /*

      music.getArtistByName(req.params.identifier).then(result => {
        var data = {
          monthlyListners: 0,
          weeklyListeners: 0,
          dailyListeners: 0,
          discoveredOn: {
            objects: []
          },
          rank: 1000000,
          biography: null
        };
        res.json(data);
        /*
        wiki.describe(result.name).then(description => {
          if (description == null) {
            wiki.describe(result.name + ' (Music artist)').then(description => {
              if (result.description != null) {
                data.biography = {
                  service: {
                    id: 'wikipedia',
                    name: 'Wikipedia',
                    uri: 'service:wikipedia',
                    type: 'service',
                    images: [{
                      url: ''
                    }]
                  },
                  body: description
                };
              }
              res.json(data);
            }, err => {
              res.status(500).send({error: reject});
            });
            return;
          }
          data.biography = {
            service: {
              id: 'wikipedia',
              name: 'Wikipedia',
              uri: 'service:wikipedia',
              type: 'service',
              images: [{
                url: ''
              }]
            },
            body: description
          };
          res.json(data);
        }, err => {
          res.status(500).send({error: reject});
        });*//*
      }, reject => {
        res.status(500).send({error: reject});
      });*/
    });

    app.get('/artist/:identifier/top/:count', (req, res) => {


      var body = {};
      if (req.body) {
        body = (req.body);
      }
      music.getArtist(req.params.identifier).then(result => {
        music.getTopTracksForArtist(result.id, 'se').then(toplist => {
          toplist.objects = toplist.objects.slice(0, req.params.count);
          res.json({
            name: 'Top Tracks',
            type: 'toplist',
            images: [{
              url: '/images/toplist.svg'
            }],
            id: 'toplist',
            snapshot_id: req.params.identifier,
            uri: result.uri + ':top:' + req.params.count,
            description: 'Top ' + req.params.count + ' tracks for <sp-link uri="' + result.uri + '">' + result.name + '</sp-link>',
            tracks: toplist
          });
        }, err => {
          res.statusCode = 500;
          res.json(err);
        });
      }, reject => {
        res.status(500).send({error: reject});
      }, err => {
        res.status(500).send({error: reject});
        res.json(err);
      });
    });


    app.get('/artist/:identifier/top/:count/track', (req, res) => {


      var body = {};
      if (req.body) {
        body = (req.body);
      }
      music.getArtist(req.params.identifier).then(artist => {
        music.getTopTracksForArtist(artist.id, 'se', req.params.offset, req.params.limit).then(result => {
          result.objects = result.objects.slice(0, req.params.count);
          res.json(result);
          res.send();
        }, reject => {
          res.status(500).send({error: reject});
          res.send();
        });
      }, err => {
        res.status(err).send({error: err});
      });

    });

    app.get('/artist/:identifier/release', (req, res) => {


      var body = {};
      if (req.body) {
        body = (req.body);
      }

      music.getReleasesByArtist(req.params.identifier, null, req.query.offset, req.query.limit).then(result => {
        res.json(result);
        res.send();
      }, reject => {
        res.status(500).send({error: reject});
        res.send();
      });
    });


    app.get('/artist/:identifier/album', (req, res) => {


      var body = {};
      if (req.body) {
        body = (req.body);
      }

      music.getReleasesByArtist(req.params.identifier, 'album', req.query.offset, req.query.limit).then(result => {
        res.json(result);
        res.send();
      }, reject => {
        res.status(500);
        res.send();
      });
    });

    app.get('/author/:identifier/audiobook', (req, res) => {


      var body = {};
      if (req.body) {
        body = (req.body);
      }

      music.getAudiobooksByAuthor(req.params.identifier, 'audiobook', req.query.offset, req.query.limit).then(result => {
        res.json(result);
        res.send();
      }, reject => {
        res.status(500);
        res.send();
      });
    });


    app.get('/artist/:identifier/single', (req, res) => {


      var body = {};
      if (req.body) {
        body = (req.body);
      }

      music.getReleasesByArtist(req.params.identifier, 'single', req.query.offset, req.query.limit).then(result => {
        res.json(result);
        res.send();
      }, reject => {
        res.status(500).send({error: reject});
        res.send();
      });
    });


    app.get('/artist/:identifier/appears_on', (req, res) => {


      var body = {};
      if (req.body) {
        body = (req.body);
      }
      // console.log(req.query);
      music.getReleasesByArtist(req.params.identifier, 'appears_on', req.query.offset, req.query.limit).then(result => {
        res.json(result);
        res.send();
      }, reject => {
        res.status(500).send({error: reject});
        res.send();
      });
    });


    app.get('/artist/:identifier/compilation', (req, res) => {


      var body = {};
      if (req.body) {
        body = (req.body);
      }

      music.getReleasesByArtist(req.params.identifier, 'compilation', req.query.offset, req.query.limit).then(result => {
        res.json(result);
        res.send();
      }, reject => {
        res.status(500).send({error: reject});
        res.send();
      });
    });


    app.get('/album/:identifier', (req, res) => {


      var body = {};
      if (req.body) {
        body = (req.body);
      }

      music.getAlbum(req.params.identifier).then(result => {
        res.json(result);
        res.send();
      }, reject => {
        res.status(500).send({error: reject});
        res.send();
      });
    });


    app.get('/audiobook/:identifier', (req, res) => {


      var body = {};
      if (req.body) {
        body = (req.body);
      }

      music.getAudiobook(req.params.identifier).then(result => {
        res.json(result);
        res.send();
      }, reject => {
        res.status(500).send({error: reject});
        res.send();
      });
    });
    app.get('/album/:identifier/track', (req, res) => {


      var body = {};
      if (req.body) {
        body = (req.body);
      }

      music.getTracksInAlbum(req.params.identifier, req.query.offset, req.query.limit).then(result => {
        res.json(result);
        res.send();
      }, reject => {
        res.status(500).send({error: reject});
        res.send();
      });
    });

    app.get('/audiobook/:identifier/chapter', (req, res) => {


      var body = {};
      if (req.body) {
        body = (req.body);
      }

      music.getChaptersInAudiobook(req.params.identifier, req.query.offset, req.query.limit).then(result => {
        res.json(result);
        res.send();
      }, reject => {
        res.status(500).send({error: reject});
        res.send();
      });
    });

    app.get('/artist/:identifier/album/:identifier/track', (req, res) => {


      var body = {};
      if (req.body) {
        body = (req.body);
      }

      music.getTracksInAlbum(req.params.identifier, req.query.offset, req.query.limit).then(result => {
        res.json(result);
        res.send();
      }, reject => {
        res.status(500).send({error: reject});
        res.send();
      });
    });


    app.get('/author/:identifier/audiobook/:identifier/track', (req, res) => {


      var body = {};
      if (req.body) {
        body = (req.body);
      }

      music.getTracksInAlbum(req.params.identifier, req.query.offset, req.query.limit).then(result => {
        res.json(result);
        res.send();
      }, reject => {
        res.status(500).send({error: reject});
        res.send();
      });
    });

    app.get('/country/:identifier', (req, res) => {


      var body = {};
      if (req.body) {
        body = (req.body);
      }

      music.getCountry(req.params.identifier).then(result => {
        res.json(result);
        res.send();
      }, reject => {
        res.status(500).send({error: reject});
        res.send();
      });
    });


    app.get('/country/:identifier/top/:limit', (req, res) => {


      var body = {};
      if (req.body) {
        body = (req.body);
      }

      music.getTopListForCountry(req.params.identifier, req.params.limit).then(result => {
        res.json(result);
        res.send();
      }, reject => {
        res.status(500).send({error: reject});
        res.send();
      });
    });


    app.get('/country/:identifier/top/:limit/track', (req, res) => {


      var body = {};
      if (req.body) {
        body = (req.body);
      }

      music.getTopTracksInCountry(req.params.identifier, req.params.limit).then(result => {
        res.json(result);
        res.send();
      }, reject => {
        res.status(500).send({error: reject});
        res.send();
      });
    });

    app.get('/featured/playlist', (req, res) => {


      var body = {};
      if (req.body) {
        body = (req.body);
      }
      music.getFeaturedPlaylists(req.query.offset, req.query.limit).then(result => {

        res.json(result);
        res.send();
      }, reject => {
        res.json(reject);
        res.send();
      });
    });

    app.get('/track/:identifier', (req, res) => {

      music.getTrack(req.params.identifier).then(result => {
        res.json(result);
        res.send();
      }, reject => {
        res.status(500).send({error: reject});
        res.send();
      });
    })

    app.get('/track/:identifier/track', (req, res) => {

      music.getTrack(req.params.identifier).then(result => {
        res.json({
          objects: [result]
        });
        res.send();
      }, reject => {
        res.status(500).send({error: reject});
        res.send();
      });
    })

    app.get('/artist/:artist_name/release/:release_name/track/:track_name', (req, res) => {

      music.getTrackByName(req.params.artist_name, req.params.release_name, req.params.track_name).then(result => {
        res.json(result);
        res.send();
      }, reject => {
        res.status(500).send({error: reject});
        res.send();
      });
    })


    app.get('/upc/:upc', (req, res) => {

      music.getReleaseByUPC(req.params.upc).then(result => {
        res.json(result);
        res.send();
      }, reject => {
        res.status(500).send({error: reject});
        res.send();
      });
    })


    app.get('/isrc/:identifier', (req, res) => {

      music.getTrack(req.params.identifier).then(result => {
        res.json(result);
        res.send();
      }, reject => {
        res.status(500).send({error: reject});
        res.send();
      });
    })


    app.get('/category/:identifier/playlist', (req, res) => {

      music.getPlaylistsInCategory(req.params.identifier).then(result => {
        res.json(result);
        res.send();
      }, reject => {
        res.json(reject);
        res.send();
      });
    })

    app.get('/category/:identifier', (req, res) => {

      music.getCategory(req.params.identifier).then(result => {
        res.json(result);
        res.send();
      }, reject => {
        res.status(500).json({error: reject});
        res.send();
      });
    })

    app.get('/me/player/devices', (req, res) => {
      music._request('GET', '/me/player/devices').then(result => {
        res.json({
          objects: result.devices
        })
        res.send()
      }, reject => {
        res.status(500).json({error: reject});
        res.send()
      });
    })

    app.get('/category', (req, res) => {

      music.getCategories(req.params.identifier).then(result => {
        res.json(result);
        res.send();
      }, reject => {
        res.status(500).send({error: reject});
        res.send();
      });
    })

    app.post('/token', (req, res) => {
      music.refreshAccessToken().then(result => {
        res.json({status: 201}).send();
      })
    })
    app.post('/me/playlist', (req, res) => {
      music.createPlaylist(req.body).then(result => {
        res.json(result);
        res.send();
      }, reject => {
        res.status(500).send({error: reject});
        res.send();
      });
    })
    return app
  }
}

var service = {
  id: 'spotify',
  uri: 'service:spotify',
  type: 'service',
  name: 'Spotify',
  description: 'Music service'
};

module.exports = SpotifyService

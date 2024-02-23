import EventEmitter from '/js/events.js';
import SpotifyService from '/js/plugins/spotify/service.js';
import {serializeObject} from '/js/util/string.js'

let formatObject = (payload = {}) => {
  return
}

window.objects = {};


/**
 * Data store for application
 **/
class Store extends EventEmitter {
  onSpotifyWebPlaybackSDKReady = (player) => {
    
  };
  constructor() {
    super();
    this.spotify = new SpotifyService();
    this.services = {};
    this.state = {};
    this.currentDevice = null;
    window.addEventListener('playpausepressed', () => {
      this.playPause();

    })

    this.isRequesting = false;
    this.heart = setInterval(async () => {
      try {
        if (this.hasStartedPlaying && !this.isRequesting) {
          this.isRequesting = true;
          this.state.player = await this.getCurrentTrack();
          this.isRequesting = false;
          this.emit('change');
          $('tr').removeClass('sp-current-track')
          $('tr[data-uri="' + this.state?.player?.item?.uri + '"]').addClass('sp-current-track')
          $('#player_position').val(this.state.player.progress_ms);
          if (this.state.player && this.state.player.item != null && this.state.player.is_playing) {
            $('sp-nowplaying .nowplayingimage').attr('data-uri', this.state.player.context.uri)
            $('sp-nowplaying .nowplayingimage').css({'background-image': 'url("' + this.state.player.item.album.images[0].url + '")'})
            $('sp-nowplaying .nowplayingheader').html(`
                        <sp-link uri="${this.state.player.item.uri}">${this.state.player.item.name}</sp-link><br>
                        ${this.state.player.item.artists.map(a => `
                            <sp-link uri="${a.uri}">${a.name}</sp-link>
                        `).join(', ')}
                    `)
            document.querySelector('sp-nowplaying').resize();
            $('#player_position').attr('max', this.state.player.item.duration_ms);
            $('#playBtn').addClass('fa-pause');
            $('#playBtn').removeClass('fa-play');

          } else {

            $('#playBtn').addClass('fa-play');
            $('#playBtn').removeClass('fa-pause');
          }
        }
      } catch (e) {
        console.log(e);
      }
    }, 5000);
    this.discoveredTracks = JSON.parse(localStorage.getItem('discoveredTracks')) || {
      objects: []
    };
  }

  getDiscoveredTracks(track, playlist = null) {
    let results = this.discoveredTracks.objects.filter((t) => t.uri == track.uri);
    if (playlist != null)
      results = results.filter((t) => {
        return t.playlists.filter((o) => o.uri == playlist.uri).length > 0
      });
    return results;

  }

  hasDiscoveredTrack(track, playlist = null) {
    return this.getDiscoveredTracks(track, playlist).length > 0;
  }

  discoverTrack(track, playlist = null, position = -1, played = false) {
    track.playlists = [];
    track.played = played;
    if (playlist != null) {
      if (!playlist.positions) {
        playlist.positions = [];
      }
      playlist.positions.push({
        position: position,
        time: new Date()
      });
      track.playlists.push(playlist);
    }
    this.discoveredTracks.objects.push(track);
    //    localStorage.setItem('discoveredTracks', JSON.stringify(this.discoveredTracks));
  }


  /**
   * Save state
   **/
  saveState() {
    //   localStorage.setItem('store', JSON.stringify(this.state));
  }

  /**
   * Load state
   **/
  loadState() {
    if (!localStorage.getItem('store'))
      return {};

    return JSON.parse(localStorage.getItem('store'));
  }

  async getDevices() {
    try {
      let result = await this.request('GET', 'spotify:me:player:devices', null, null, false, true);
      return result.devices;
    } catch (e) {
      throw "Error";
    }

  }

  async playPause() {
    this.state.player = await this.getCurrentTrack();
    let result = null;
    let device = this.currentDevice;
    if (!device) {
      let devices = await this.getDevices();
      if (devices instanceof Array) {
        device = devices[0];
      }

    }
    if (this.state.player.is_playing) {
      result = this.request('PUT', 'spotify:me:player:pause', {device_id: device.id}, null, false, true);
    } else {
      result = this.request('PUT', 'spotify:me:player:play', {device_id: device.id}, null, false, true);
    }
    this.state.player = await this.getCurrentTrack();
    this.emit('change');
  }

  seek(pos) {
    this.request('PUT', 'spotify:me:player:seek', null, {position_ms: pos})
  }

  /**
   * Set state for resource
   **/
  setState(uri, state) {
    this.state[uri] = state;
    this.emit('change');
    this.saveState();
  }

  async play(context) {
    let result = this.request('PUT', 'spotify:me:player:play', {}, context, false);
    this.state.player = await this.getCurrentTrack();
    this.emit('change');

  }

  async playTrack(track, context) {
    let device = this.currentDevice;
    if (!device) {
      let devices = await this.getDevices();
      console.log(devices);
      if (devices instanceof Array) {
        device = devices[0];
      }
    }
    track.uri = track.uri.replace(/chapter/, 'track').replace(/seed/, 'track')
    let payload = {
      uris: [track.uri]
    }
    if (context) {
      payload.context_uri = context.uri
    }
    this.request('PUT', 'spotify:me:player:play', {device_id: device.id}, payload, false, true);
    this.hasStartedPlaying = true
    this.currentDevice = device;
  }

  playTrackAtPosition(position, context) {
    this.request('PUT', 'spotify:me:player:play', {device_id: device.id}, {
      // context_uri: context.uri,
      position: {
        offset: position
      }
    });
  }

  async getCurrentTrack() {
    let result = await this.request('GET', 'spotify:me:player:currently-playing', null, null, false, true);

    return result;
  }
  async _request(method, uri, params, payload, cache, direct) {
    try {
      return await this._request(method, uri, params, payload, cache=true, direct=false)
    } catch(e) {
      debugger;
      await fetch('/api/spotify/token', {
        method: 'POST'
      });
      return await this._request(method, uri, params, payload, cache, direct)
    }
  }
  async request(method, uri, params, payload, cache = true, direct = false) {
    if (!uri) return;
    let strongUri = (uri)
    if (params) {

      strongUri += '?' + (params instanceof Object ? serializeObject(params) : '');
    }
    if (uri in window.resources) {
      return window.resources[uri];
    }
    if (strongUri in this.state && method === "GET" && cache) {

      return this.state[strongUri];
    }
    let overlay = null;
    try {
      overlay = await fetch('/api/overlay/?uri=' + encodeURIComponent(uri)).then(r => r.json());
    } catch (e) {
    }
    if (!payload) payload = {offset: 0};

    let formatObject = (obj, i) => {
      if (!payload.offset) {
        payload.offset = 0;
      }

      if (!obj) {
        return null;
      }
      this.state[obj.uri + '?'] = $.extend(this.state[obj.uri + '?'], obj);
      window.resources[obj.uri] = $.extend(window.resources[obj.uri] || {}, obj);
      if ('added_at' in obj) {
        if ('album' in obj) {
          obj = Object.assign(obj, obj.album)
        }
        if ('artist' in obj) {
          obj = Object.assign(obj, obj.artist)
        }
        if ('album' in obj) {
          obj = Object.assign(obj, obj.album)
        }
      }
      try {
        window.setObject(obj.uri, obj);
      } catch (e) {

      }
      obj.position = payload.offset + i;
      obj.p = payload.offset + i + 1;
      obj.service = 'spotify';
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
      if (obj.type === 'playlist') {
        obj.uri = 'spotify:playlist:' + obj.id
        console.log("Got playlist")
      }
      if (obj.type === 'user') {
        obj.manages = [];
        obj.controls = []
        if (obj.id === 'buddhalow' || obj.id === 'buddhalowmusic' || obj.id === 'drsounds') {
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
      if (obj.type === 'artist') {
        obj.users = [];
        obj.labels = [];
        obj.manager = {
          id: '',
          name: '',
          uri: 'spotify:user:',
          type: 'user',
          username: ''
        };
        if (obj.id === '2FOROU2Fdxew72QmueWSUy') {
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
          obj.authors = obj.artists.map(formatObject);
        } catch (e) {

        }
      }

      if ('album' in obj) {
        obj.album = formatObject(obj.album, 0);
      }
      if ('display_name' in obj) {
        obj.name = obj.display_name;
      }
      if (obj.name instanceof String && obj.name.indexOf('-') !== -1) {
        obj.version = obj.substr(obj.indexOf('-') + '-'.length).trim();
        obj.name = obj.name.split('-')[0];
      }
      // window.objects[obj.uri] = _.extend(window.objects[obj.uri] || {}, obj);
      return obj;
    };
    try {
      let esc = encodeURIComponent
      let query = params ? Object.keys(params)
        .map(k => esc(k) + '=' + esc(params[k]))
        .join('&') : '';

      if (uri == null) return;
      var url = uri;
      if (uri.indexOf('bungalow:') === 0 || uri.indexOf('spotify:') === 0) {
        let parts = url.split(':').slice(1);
        if (direct) {
          if (parts[0] === 'search') {
            let session = JSON.parse(localStorage.getItem('spotify.session'))
            return await fetch('https://api.spotify.com/v1/search?q=' + parts[1] + '&type=' + parts[2] + '&' + query, {
              mode: 'cors',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + session.access_token
              },
              method: 'GET',
            }).then((e) => {
              if (e.status < 200 || e.status > 299) {
                alert(e.status);
              }
              return e.json();

            }).then(result => {

              if (result && `${parts[2]}s` in result)
                result.objects = result[`${parts[2]}s`].items.map(formatObject);
              return result;
            })
          }
          parts = parts.map((p, i) => {
            if (p === 'release') {
              p = 'album'
            }
            if (i % 2 === 0) {
              if (p[p.length - 1] !== 's' && (['track', 'user', 'artist', 'album', 'playlist'].indexOf(p) > -1))
                return p + 's'
              else
                return p;
            }
            return p;
          })
          url = 'https://api.spotify.com/v1/' + parts.join('/')

          if (parts[0] === 'playlists') {
            if (parts[2] === 'snapshot' && parts[4] === 'tracks') {

              url = 'https://api.spotify.com/v1/playlists/' + parts[1] + '/tracks?' + query;
            }
          }
          if (parts[0] === 'artists') {
            if (parts.length > 2) {
              if (parts[2] === 'singles') {
                url = 'https://api.spotify.com/v1/artists/' + parts[1] + '/albums?album_type=single&' + query;
              }
              if (parts[2] === 'albums') {
                url = 'https://api.spotify.com/v1/artists/' + parts[1] + '/albums?album_type=album&' + query;
              }

              if (parts[2] === 'abouts') {
                return {}
              }
              if (parts[2] === 'tops') {
                if (parts.length > 4) {
                  let result = await this._request('GET', 'spotify:artist:' + parts[1] + ':track')
                  return result;
                } else if (parts.length > 3) {
                  return {
                    id: 'toplist',
                    name: 'Top List',
                    uri: 'spotify:artist:' + parts[1] + ':top:' + parts[3],
                    type: 'toplist',
                    'for': {
                      name: 'Artist',
                      id: parts[1],
                      uri: 'spotify:artist:' + parts[1] + ':top:' + parts[3],
                      type: 'artist'
                    }
                  }
                }
              }
            }
          }
          if (parts[0] === 'library' && parts.length < 3) {
            return {
              id: 'library',
              type: 'library',
              name: 'library'
            }
          }

        } else {
          url = '/api/spotify/' + parts.join('/');

        }
        if (query instanceof Object) {
          parts += '?' + query;
        }


        let result;


        if (method === 'GET') {

          let session = JSON.parse(localStorage.getItem('spotify.session'))
          result = await fetch(url, {
            mode: 'cors',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + session.access_token
            },
            method: 'GET',
          }).then((e) => {
            if (e.status < 200 || e.status > 299) {
              alert(e.status);
            }
            let result = e.json();
            //window.objects[uri] = $.extend(window.objects[uri], result);
            return result;
            if (result && 'objects' in result)
              result.objects = result.objects.map(formatObject);

            if (result && 'items' in result)
              result.objects = result.items.map(formatObject);
            return result;
          }).catch((error) => {
            console.log(error);
          });
        } else {
          result = await fetch(url + '?' + query, {
            mode: 'cors',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + JSON.parse(localStorage.getItem('spotify.session')).access_token
            },
            method: method,
            body: JSON.stringify(payload)
          }).then((e) => {

            if ((e.status < 200 || e.status > 299) && uri.indexOf('spotify:me:player:play') !== -1) {
              alert(e.status);
            }
            return formatObject(e.json())
          });
        }

        if (!!result && !!overlay) {
          result = $.extend(result, overlay);
        } else if (!!overlay) {
          result = overlay;
        }

        if (result && 'objects' in result) {
          for (let obj of result.objects) {
            let bungalowUri = obj.uri;
            this.state[bungalowUri] = obj;
            if (obj.type === 'album') {

              if ('tracks' in obj) {
                let trackset = {
                  objects: []
                };
                for (let track of obj.tracks.items) {
                  this.state[track.uri] = track;
                  trackset.objects.push(track);
                }
                this.state[obj.uri + ':track?offset=0&limit=0'] = trackset;
              }
            }
          }
        } else {
          if (!result.uri) {
            result.uri = 'spotify:player'; // TODO Fix this later
          }
          result = formatObject(result);
        }
        this.setState(uri, result);

        window.setObject(uri, result);
        return result;

      }
      if (uri in this.state)
        return this.state[uri];

      let result = fetch(url, {credentials: 'include', mode: 'cors'}).then((e) => e.json());
      this.setState(uri, result);

      return result;
    } catch (e) {
      console.log(e.stack);
      alert("An error occured " + e);
      throw e;

    }
  }

  /**
   * Get album by ID
   **/
  getAlbumById(id) {
    let uri = 'spotify:album:' + id;
    let result = fetch('/api/spotify/album/' + id, {credentials: 'include', mode: 'cors'}).then((e) => e.json())
    this.setState(uri, result);
    return result;
  }

  getArtistById(id) {
    let uri = 'spotify:artist:' + id;
    let result = fetch('/api/spotify/artist/' + id, {credentials: 'include', mode: 'cors'}).then((e) => e.json());
    this.setState(uri, result);
    return result;
  }

  login() {
    return new Promise((resolve, reject) => {
      var loginWindow = window.open('/api/spotify/music/login');

      var t = setInterval(() => {
        if (!loginWindow) {
          clearInterval(t);
          resolve(true);
        }
      });
    });
  }
  request(method, uri, params, data) {
      if (/^spotify:user:(.*)$/.test(uri)) {
          return this.getUser(uri.split(':')[2]);
      } 
      if (/^spotify:user:(.*):playlist:(.*)$/.test(uri)) {
          return this.getPlaylist(uri.split(':')[2], uri.split(':')[4]);
      }
      if (/^spotify:artist:(.*)/.test(uri)) {
          
          return this.getArtist(uri.split(':')[2]);
      }
      if (/^spotify:artist:(.*):(release|album)/.test(uri)) {
          
          return this.getReleasesByArtist(uri.split(':')[2]);
      }
      if (/^spotify:(release|album):(.*)/.test(uri)) {
          
          return this.getAlbum(uri.split(':')[2]);
      }
      if (/^spotify:(release|album):(.*):track/.test(uri)) {
          
          return this.getTracksInAlbum(uri.split(':')[2]);
      }
      if (/^spotify:user:(.*):playlist:(.*):track/.test(uri)) {
          
          return this.getTracksInPlaylist(uri.split(':')[2], uri.split(':')[4]);
      }
      if (/^spotify:user:(.*):playlist:(.*):track/.test(uri)) {
          
          return this.getTracksInPlaylist(uri.split(':')[2], uri.split(':')[4]);
      }
      if (/^spotify:track:(.*)/.test(uri)) {
          
          return this.getTrackById(uri.split(':'));
      }
  }
  
  get session() {
      return JSON.parse(localStorage.getItem('spotify.session'));
  }
  
  get accessToken() {
      return this.session.access_token;
  }

  getCurrentUser() {
      var self = this;
      return new Promise(function (resolve, fail) {
          self._request('GET', '/me').then(function (result) {
              result.artists = [
                  
              ]
              
              resolve(result);
          });
      })
  }

  getCurrentTrack() {
      var self = this;
      return new Promise(function (resolve, fail) {
          self._request('GET', '/me/player/currently-playing').then(function (result) {
              resolve(result);
          });
      })
  }

  getAccessToken () {
      try {
          return this.accessToken; //JSON.parse(fs.readFileSync(os.homedir() + '/.bungalow/spotify_access_token.json'));
      } catch (e) {
          return null;
      }
  }
  
  setAccessToken (accessToken) {
  
      this.accessToken = accessToken;
      
  }
  
  
  
  
  
  searchFor(q, type, offset, limit) {
      var self = this;
      return new Promise(function (resolve, fail) {
          self._request('GET', '/search', {
              q: q,
              type: type,
              offset: offset,
              limit: limit
          }).then(function (result) {
              resolve(result);
          }, function (err) {
              fail(err);
          });
      });
  }
  
  
  _request (method, path, payload, postData) {
      var self = this;
      return new Promise(function (resolve, fail) {
          if (!payload) payload = {};
          if (!payload.offset) payload.offset = 0;
          if (!isNaN(payload.offset)) payload.offset = parseInt(payload.offset);
          if (!payload.type) payload.type = 'track';
          if (!isNaN(payload.limit)) payload.limit = parseInt(payload.limit);
          if (!payload.limit) payload.limit = 30;
          
          
              var cachePath = path + '?offset=' + payload.offset + '&limit=' + payload.limit + '';
          if (method === 'GET', self.cache instanceof Object && cachePath in self.cache) {
              var result = self.cache[cachePath];
              resolve(result);
              return;
          }
          
          var headers = {};
          
          headers["Authorization"] = "Bearer " + self.accessToken;
          if (payload instanceof Object) {
              headers["Content-type"] = "application/json";
      
          } else {
              headers["Content-type"] = ("application/x-www-form-urlencoded");
          }
          var url = 'https://api.spotify.com/v1' + path;
          fetch(url,{
              credentials: 'include',
              method: method,
              
              headers: headers,
              qs: payload,
              body: JSON.stringify(postData)
          }).then(r => r.json()).then((data) => {
                  
                      function formatObject (obj, i) {
                      obj.position = payload.offset + i; 
                      obj.p = payload.offset + i + 1; 
                      obj.service = service;
                      obj.version = '';
                      if (obj.type == 'country') {
                          obj.president = null;
                          if (obj.id == 'qi') {
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
                      
                      if (obj.type == 'user') {
                          obj.manages = [];
                          obj.controls = []
                          if (obj.id == 'buddhalow' || obj.id == 'buddhalowmusic' || obj.id == 'drsounds') {
                              obj.president_of = [{
                                  id: 'qi',
                                  name: 'Qiland',
                                  uri: 'bungalow:country:qi',
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
                          if (obj.id == '2FOROU2Fdxew72QmueWSUy') {
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
                          obj = assign(obj, obj.track);
                      }
                      if ('artists' in obj) {
                          obj.artists = obj.artists.map(formatObject);
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
                          data.artists = data.artists.map(formatObject);
                      }
                      data = formatObject(data, 0);
                      console.log(data);
                      data.updated_at = new Date().getTime();
                      self.cache[cachePath] = data;
                      resolve(data);
                      
                  } catch (e) {
                      console.log(e);
                      debugger;
                      fail(e);
                  }
              }
          );
      }, (e) => {
          fail(e);
      });
  }
  
  
  /**
   * Returns user by id
   **/
  getUser (id) {
      var self = this;
      return new Promise(function (resolve, fail) {
          self._request('GET', '/users/' + id).then(function (result) {
              resolve(result); 
          }, function (err) {
              fail(err);
          });
      });
  }
  
  /**
   * Returns user by id
   **/
  getArtist (id) {
      var self = this;
      return new Promise(function (resolve, fail) {
          self._request('GET', '/artists/' + id).then(function (result) {
              resolve(result); 
          }, function (err) {
              fail(err);
          });
      });
  }
  
  
  /**
   * Returns user by id
   **/
  getReleasesByArtist (id, release_type, offset, limit) {
      var self = this;
      
      if (!release_type || release_type == "release") release_type = 'single,album';
      return new Promise(function (resolve, fail) {
          self._request('GET', '/artists/' + id + '/albums', {
              offset: offset,
              limit: limit,
              album_type: release_type
          }).then(function (result) {
          
              Promise.all(result.objects.map(function (album) {
                  return self.getTracksInAlbum(album.id);
              })).then(function (tracklists) {
                  for (var i = 0; i < tracklists.length; i++) {
                      result.objects[i].tracks = tracklists[i];
              
                  }
                  resolve(result); 
              });
          }, function (err) {
              console.log(err);
              fail(err);
          });
      });
  }
  
  
  /**
   * Returns user by id
   **/
  getTracksInAlbum (id, offset, limit) {
      var self = this;
      return new Promise(function (resolve, fail) {
          self._request('GET', '/albums/' + id + '/tracks', {offset: offset, limit: limit}).then(function (result) {
              resolve(result); 
          }, function (err) {
              fail(err);
          });
      });
  }
  
  /**
   * Returns user by id
   **/
  getPlaylist (username, identifier) {
      var self = this;
      return new Promise(function (resolve, fail) {
          self._request('GET', '/users/' + username + '/playlists/' + identifier).then(function (result) {
              self._request('GET', '/users/' + username + '/playlists/' + identifier + '/tracks').then(function (result2) {
              result.tracks = result2;
              resolve(result); 
              });
          }, function (err) {
              fail(err);
          });
      });
  }
  
  /**
   * Returns user by id
   **/
  getCountry (code) {
      var self = this;
      return new Promise(function (resolve, fail) {
          if (code == 'qi') {
              resolve({
                  id: code,
                  uri: 'spotify:country:' + code,
                  name: 'Qiland',
                  type: 'country',
                  service: service,
                  images: [{
                      url: 'https://media.licdn.com/mpr/mpr/shrink_200_200/AAEAAQAAAAAAAA2NAAAAJDliMzE1NTYzLThjOTMtNDRiZi1iNjc1LWQxYTlmNzVlM2M4NQ.png'
                  }]
              });
              return;
          }
          fetch({
              url: 'https://restcountries.eu/rest/v2/alpha/' + code
          }).then((r) => r.json()).then((result) => {
              
              
              resolve({
                  id: code,
                  uri: 'spotify:country:' + code,
                  name: result.name,
                  type: 'country',
                  service: service,
                  images: [{
                      url: result.flag
                  }]
              });
          
          });
      });
  }
  
  getTopTracksInCountry (code, limit, offset) {
      var self = this;
      return new Promise(function(resolve, fail) {
              if (code == 'qi') {
              var result = { 
                  name: 'Qiland',
                  id: 'qi',
                  service: service
              };
              var url = '/users/spotify/playlists/37i9dQZF1Cz2XVi756juiX'; // '/users/drsounds/playlists/2KVJSjXlaz1PFl6sbOC5AU';
              self._request('GET', url).then(function (result) {
                  try {
                      fetch({
                          url: url + '/tracks',
                          headers: headers
                      }).then(r => r.json()).then((result3) => {
                          resolve({
                              objects: result3.items.map(function (track, i) {
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
              }, function (err) {
                  fail(500);
              });
          }
          self._request('GET','/browse/categories/toplists/playlists?country=' + code + '&limit=' + limit + '&offset=' + offset).then(function (result2) {
              try {
                  self._request('GET', result2.objects[0].href.substr('https://api.spotify.com/v1'.length) + '/tracks').then(function (result3) {
                      
                      resolve({
                          objects: result3.items.map(function (track, i) {
                              var track = assign(track, track.track);
                              track.user = track.added_by;
                              track.album.service = service;
                              track.position = i;
                              track.artists = track.artists.map(function (a) {
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
          }, function (err) {
              fail(500);
          });
      })
  }
  
  
  getTopListForCountry (code, limit, offset) {
      var self = this;
      return new Promise(function(resolve, fail) {
              if (code == 'qi') {
              resolve({
                  id: code,
                  uri: 'spotify:country:' + code + ':top:' + limit,
                  name: 'Top Tracks',
                  type: 'country',
                  service: service,
                  images: [{
                      url: 'https://media.licdn.com/mpr/mpr/shrink_200_200/AAEAAQAAAAAAAA2NAAAAJDliMzE1NTYzLThjOTMtNDRiZi1iNjc1LWQxYTlmNzVlM2M4NQ.png'
                  }],
                  in: {
                      id: code,
                      name: 'Qiland',
                      uri: 'spotify:country:' + code
                  }
              });
              return;
          }
          fetch({
              url: 'https://restcountries.eu/rest/v2/alpha/' + code
          }).then(r => r.json()).then((result) => {
              
              try {
                  
                  resolve({
                      id: code,
                      uri: 'spotify:country:' + code + ':top:' + limit,
                      name: 'Top Tracks',
                      type: 'country',
                      service: service,
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
      })
  }
  
  getTopTracksInCountry (code, limit, offset) {
      var self = this;
      return new Promise(function(resolve, fail) {
              if (code == 'qi') {
              var result = { 
                  name: 'Qiland',
                  id: 'qi',
                  service: service
              };
              var url = '/users/drsounds/playlists/2KVJSjXlaz1PFl6sbOC5AU/tracks';
              self._request('GET', url).then(function (result3) {
          
                  resolve({
                      uri: 'spotify:country:' + code + ':top:' + limit + ':track',
                      objects: result3.objects.map(function (track, i) {
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
              }, function (err) {
                  fail(500);
              });
              return;
          }
          self._request('GET','/browse/categories/toplists/playlists?country=' + code + '&limit=' + limit + '&offset=' + offset).then(function (result2) {
              try {
                  var uri = result2.playlists.items[0].href.substr('https://api.spotify.com/v1'.length) + '/tracks';
                  self._request('GET', uri).then(function (result3) {
                      try {
                          resolve({
                              uri: 'spotify:country:' + code + ':top:' + limit + ':track',
                              objects: result3.objects.map(function (track, i) {
                                  var track = assign(track, track.track);
                                  track.user = track.added_by;
                                  track.album.service = service;
                                  track.position = i;
                                  track.artists = track.artists.map(function (a) {
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
          }, function (err) {
              fail(500);
          });
      })
  }
  
  reorderTracksInPlaylist (username, identifier, range_start, range_length, insert_before) {
      var self = this;
      return new Promise(function (resolve, fail) {
          self._request('PUT', '/users/' + username + '/playlists/' + identifier + '/tracks', {}, {
              range_start: range_start,
              range_length: range_length,
              insert_before: insert_before
          }).then(function (result) {
              resolve(result); 
          }, function (err) {
              fail(err);
          });
      });
  }
  
  
  addTracksToPlaylist (username, identifier, uris, position) {
      var self = this;
      return new Promise(function (resolve, fail) {
          self._request('POST', '/users/' + username + '/playlists/' + identifier + '/tracks', {
              position: position,
              uris: uris
          }).then(function (result) {
              resolve(result); 
          }, function (err) {
              fail(err);
          });
      });
  }
  
  
  deleteTracksFromPlaylist (username, identifier, tracks) {
      var self = this;
      return new Promise(function (resolve, fail) {
          self._request('DELETE', '/users/' + username + '/playlists/' + identifier + '/tracks', {
              tracks: tracks
          }).then(function (result) {
              resolve(result); 
          }, function (err) {
              fail(err);
          });
      });
  }
  
  
  /**
   * Returns user by id
   **/
  getTracksInPlaylist (username, identifier, offset, limit) {
      var self = this;
      return new Promise(function (resolve, fail) {
          self._request('GET', '/users/' + username + '/playlists/' + identifier + '/tracks', {
              offset: offset,
              limit: limit
          }).then(function (result) {
                  resolve(result); 
          }, function (err) {
              fail(err);
          });
      });
  }
  
  
  /**
   * Returns user by id
   **/
  getTracksInAlbum (identifier, offset, limit) {
      var self = this;
      return new Promise(function (resolve, fail) {
          self._request('GET', '/albums/' + identifier + '/tracks', {
              offset: offset,
              limit: limit
          }).then(function (result) {
              resolve(result); 
          }, function (err) {
              fail(err);
          });
      });
  }
  
  
  
  /**
   * Returns user by id
   **/
  SgetPlaylistsByUser (username, offset, limit) {
      var self = this;
      return new Promise(function (resolve, fail) {
          self._request('GET', '/users/' + username + '/playlists', {
              limit: limit,
              offset: offset
          }).then(function (result) {
              Promise.all(result.objects.map(function (playlist) {
                  return self.getTracksInPlaylist(playlist.owner.id, playlist.id);
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
              });
          }, function (err) {
              fail(err);
          });
      });
  }
  
  
  
  /**
   * Returns user by id
   **/
  getTrack (identifier) {
      var self = this;
      return new Promise(function (resolve, fail) {
          self._request('GET', '/tracks/' + identifier).then(function (result) {
              resolve(result); 
          }, function (err) {
              fail(err);
          });
      });
  }
  
  
  /**
   * Returns user by id
   **/
  getMyPlaylists (offset, limit) {
      var self = this;
      return new Promise(function (resolve, fail) {
          self._request('GET', '/me/playlists', {
              offset: offset,
              limit: limit
          }).then(function (result) {
              resolve(result); 
          }, function (err) {
              fail(err);
          });
      });
  }
  
  
  /**
   * Returns user by id
   **/
  getMyArtists (offset, limit) {
      var self = this;
      return new Promise(function (resolve, fail) {
          self._request('GET', '/me/artists', {
              offset: offset,
              limit: limit
          }).then(function (result) {
              resolve(result); 
          }, function (err) {
              fail(err);
          });
      });
  }
  
  
  
  /**
   * Returns user by id
   **/
  getRelatedArtistsForArtist (identifier, offset, limit) {
      var self = this;
      return new Promise(function (resolve, fail) {
          self._request('GET', '/artists/' + identifier + '/related-artists', {
              offset: offset,
              limit: limit
          }).then(function (result) {
              resolve(result); 
          }, function (err) {
              fail(err);
          });
      });
  }
  
  
  /**
   * Returns user by id
   **/
  getCategories (offset, limit) {
      var self = this;
      return new Promise(function (resolve, fail) {
          self._request('GET', '/browse/categories', {
              offset: offset,
              limit: limit
          }).then(function (result) {
              resolve(result); 
          }, function (err) {
              fail(err);
          });
      });
  }
  
  
  /**
   * Returns user by id
   **/
  getCategory (id, offset, limit) {
      var self = this;
      return new Promise(function (resolve, fail) {
          self._request('GET', '/browse/categories/' + id, {
              offset: offset,
              limit: limit
          }).then(function (result) {
              resolve(result); 
          }, function (err) {
              fail(err);
          });
      });
  }
  
  
  /**
   * Returns user by id
   **/
  getPlaylistsInCategory (id, offset, limit) {
      var self = this;
      return new Promise(function (resolve, fail) {
          self._request('GET', '/browse/categories/' + id + '/playlists', {
              offset: offset,
              limit: limit
          }).then(function (result) {
              resolve({
                  objects: result.playlists.items
              }); 
          }, function (err) {
              fail(err);
          });
      });
  }
  
  
  /**
   * Returns user by id
   **/
  getFeaturedPlaylists (offset, limit) {
      var self = this;
      return new Promise(function (resolve, fail) {
          self._request('GET', '/browse/featured-playlists', {
              offset: offset,
              limit: limit
          }).then(function (result) {
              resolve(result); 
          }, function (err) {
              fail(err);
          });
      });
  }
  
  
  /**
   * Returns user by id
   **/
  getNewReleases (offset, limit) {
      var self = this;
      return new Promise(function (resolve, fail) {
          self._request('GET', '/browse/new-releases', {
              offset: offset,
              limit: limit
          }).then(function (result) {
              resolve(result); 
          }, function (err) {
              fail(err);
          });
      });
  }
  
  
  /**
   * Returns user by id
   **/
  getMyReleases (id, offset, limit) {
      var self = this;
      return new Promise(function (resolve, fail) {
          self._request('GET', '/me/albums', {
              offset: offset,
              limit: limit
          }).then(function (result) {
              resolve(result); 
          }, function (err) {
              fail(err);
          });
      });
  }
  
  /**
  /**
   * Returns user by id
   **/
  getMyTracks (offset, limit) {
      var self = this;
      return new Promise(function (resolve, fail) {
          self._request('GET', '/me/tracks', {
              offset: offset,
              limit: limit
          }).then(function (result) {
              resolve(result); 
          }, function (err) {
              fail(err);
          });
      });
  }
  
  /**
   * Returns user by id
   **/
  playTrack (body) {
      var self = this;
      return new Promise(function (resolve, fail) {
          self._request('PUT', '/me/player/play', {}, body).then(function (result) {
              resolve(result); 
          }, function (err) {
              fail(err);
          });
      });
  }
  
  
  
  
  
  notify(event) {
      var type = event.type;
      if (type in this.events) {
          this.events[type].call(this, event);
      }
  }
  
  addEventListener (event, callback) {
      this.events[event] = callback;
  }
  
  getImageForTrack (id, callback) {
      this.request('GET', 'https://api.spotify.com/v1/tracks/' + id).then(function (track) {
          callback(track.album.images[0].url);
      });
  }
  
  
  
  
  /**
   * Adds songs to a playlist
   **/
  addTracksToPlaylist (user, playlist_id, uris, position) {
      var self = this;
      var promise = new Promise(function (resolve, fail) {
          self.request("POST", "/users/" + user + "/playlists/" + playlist_id + "/tracks", {
                  "uris": uris, position: position
          }).then(function () {
              resolve();
          }, function (err) {
              fail(err);
          });
  
      });
      return promise;
  
  }
  
  getAlbumTracks(id) {
  
      var self = this;
      var promise = new Promise(function (resolve, fail) {
          self._request("GET", "/albums/" + id + "/tracks").then(function (data) {
              resolve(data);
          }, function (err) {
              fail(err);
          });
      });
      return promise;
      
  };
  
  
  getFolders (id) {
  
      var self = this;
      var promise = new Promise(function (resolve, fail) {
          self._request("GET", "/me/folders").then(function (data) {
              resolve(data);
          }, function (err) {
              fail(err);
          });
      });
      return promise;
  };
  
  getFolderById (id) {
  
      var self = this;
      var promise = new Promise(function (resolve, fail) {
          self._request("GET", "/me/folders/" + id).then(function (data) {
              resolve(data);
          }, function (err) {
              fail(err);
          });
      });
      return promise;
  };
  
  
  
  getPlaylistsInFolder (id) {
  
      var self = this;
      var promise = new Promise(function (resolve, fail) {
          self._request("GET", "/me/folders/" + id).then(function (data) {
              resolve(data);
          }, function (err) {
              fail(err);
          });
      });
      return promise;
  };
  
  
  
  search (query, offset, limit, type) {
      var self = this;
      var promise = new Promise(function (resolve, fail) {
          self._request('GET', '/search', {
              q: query,
              limit: limit,
              offset: offset,
              type: type
          }).then(function (data) {
              resolve(data);
          }, function (err) {
              fail(err);
          });
      });
      return promise;
  };
  
  
  createPlaylist (title) {
      var self = this;
  
      var promise = new Promise(function (resolve, fail) {
          var me = self.getMe();
          self.request("POST", "/users/" + me.id + "/playlists", {name: title}).then(function (object) {
              resolve(object);
          }, function (err) {
              fail(err);
          });
      });
      return promise;
  };
  
  
  getMyPlaylists() {
      var self = this;
      var promise = new Promise(function (resolve, fail) {
          var user = self.getMe();
          self.request("GET", "/users/" + user.id + '/playlists').then(function (data) {
              resolve({
                  'objects': data.items
              });
          }, function (err) {
              fail(err);
          });
      });
      return promise;
  }
  
  
  getTopTracksForArtist(id, country, offset, limit) {
      var self = this;
  
      var promise = new Promise(function (resolve, fail) {
          self._request("GET", "/artists/" + id + '/top-tracks', {
              country: country
          }).then(function (data) {
              resolve(data);
          }, function (err) {
              fail(err);
          }, function (err) {
              fail(err);
          });
      });
      return promise;
  }
  
  getAlbum (id) {
      var self = this;
      var promise = new Promise(function (resolve, fail) {
          self._request('GET', '/albums/' + id).then(function (album) {
              album.image = album.images[0].url;
              album.tracks = [];
              self.getAlbumTracks(album.id).then(function (data) {
                  album.tracks = data;
                  resolve(album);
  
              });
          }, function (err) {
              fail(err);
          });
      });
      return promise;
  }
  
  
  getPlaylistTracks (user, playlist_id, page, callback) {
      var self = this;
      var promise = new Promise(function (resolve, fail) {
              self._request('GET', '/users/' + user + '/playlists/' + playlist_id).then(function (data) {
                  resolve({
                      'objects': data.tracks.items
                  });
              }, function (err) {
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
  reorderTracks (playlistUri, indices, newPosition) {
      console.log("SpotifyBrowse is now reordering tracks");
      console.log("Done successfully");
  }

}

export default new Store();


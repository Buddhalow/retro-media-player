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

}

export default new Store();


import EventEmitter from '/js/events.js';
import SpotifyService from '/js/plugins/spotify/service.js';
import {serializeObject} from '/js/util/string.js'

let formatObject = (payload = {}) => {
  return
}

window.objects = {};

class PlayerStore extends EventEmitter {
   
    constructor() {
      super();
        this.player = window.spotifyPlayer;
        window.playerStore = this;
        this.state = {};
        if (!this.player) return;
        this.initPlayer();
        
    }
    initPlayer() {
      // Error handling
      let player = this.player;
      player.addListener('initialization_error', ({ message }) => { console.error(message); });
      player.addListener('authentication_error', ({ message }) => { console.error(message); });
      player.addListener('account_error', ({ message }) => { console.error(message); });
      player.addListener('playback_error', ({ message }) => { console.error(message); });
  
      // Playback status updates
      player.addListener('player_state_changed', ({position, duration, paused, shuffle, track_window: {current_track}}) => {
          this.state.player = {
              item: current_track,
              is_playing: !paused,
              shuffle
          };
          this.emit('change');
          this.saveState();
      });
  
      // Ready
      player.addListener('ready', ({ device_id }) => {
          this.state.device_id = device_id;
          console.log('Ready with Device ID', device_id);
      });
  
      // Not Ready
      player.addListener('not_ready', ({ device_id }) => {
          this.state.device_id = device_id;
      });
  
      // Connect to the player!
      player.connect();
      this.player = player;
    }
    getDiscoveredTracks(track, playlist = null) {
  
    }
  
    hasDiscoveredTrack(track, playlist = null) {
    }
  
    discoverTrack(track, playlist = null, position = -1, played = false) {
   
    }
  
  
    /**
     * Save state
     **/
    saveState() {
       localStorage.setItem('store', JSON.stringify(this.state));
    }
  
    /**
     * Load state
     **/
    loadState() {
        this.state = JSON.parse(localStorage.getItem('store'));
    }
  
    async getDevices() {
  
    }
  
    async playPause() {
        await this.player.togglePlay();
    }
  
    seek(pos) {
        this.player.seek(pos * 1000).then(() => {});
    }
  
    /**
     * Set state for resource
     **/
    setState(uri, state) {
      this.state[uri] = state;
      this.emit('change');
      this.saveState();
    }
  
    play(context) { 
      return new Promise((resolve, fail) => {
        this.player._options.getOAuthToken(access_token => {
          fetch(`https://api.spotify.com/v1/me/player/play?device_id=${this.state.device_id}`, {
            method: 'PUT',
            body: JSON.stringify({ context_uri: context.uri }),
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${window.spotifyToken}`
            },
          });
        });
      })  ;  
    }
  
    playTrack(track, context) {
      return new Promise((resolve, fail) => {
        this.player._options.getOAuthToken(access_token => {
          fetch(`https://api.spotify.com/v1/me/player/play?device_id=${this.state.device_id}`, {
            method: 'PUT',
            body: JSON.stringify({ uris: [track.uri] }),
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${window.spotifyToken}`
            },
          });
        });
      });  
    }
  
    playTrackAtPosition(position, context) {
      
    }
  
    async getCurrentTrack() {
    
      return result;
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


export default new PlayerStore();


import { getPageIdentity } from '/js/util.js';
import EventEmitter from '/js/events.js';
import { getServiceFromPage } from '/js/util.js';
import { testBungalowUri } from '/js/util.js';


/**
 * Data store for application
 **/
class Store extends EventEmitter {
  constructor() {
    super(); 
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
          this.state.player = await this.service.getCurrentTrack();
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
  
  playTrack(track, context) {
    this.service.playTrack({
        context_uri: context.uri,
        uris: [track.uri]
    });
  }
  playTrackAtPosition(position, context) {
    this.request('PUT', 'spotify:me:player:play', {}, {
        context_uri: context.uri,
        position: {
            offset: position
        }
    });
  }
  setState(newState) {
    this.state = Object.assign(this.state, newState);
  }
  async request(method, uri, params, data) { 
    if (!this.service) {
      this.service = getServiceFromPage()
    }

    if (testBungalowUri(/library(:track)?$/, uri)) {
      return await this.service.getTracksInLibrary()
    }
    if (testBungalowUri(/user:(.*)$/, uri)) {
      return await this.service.getUser(uri.split(":")[2]);
    }
    if (testBungalowUri(/playlist:(.*)$/, uri)) {
      return await this.service.getPlaylist(uri.split(":")[3]);
    }
    if (testBungalowUri(/artist:(.*)/, uri)) {
      return await this.service.getArtist(uri.split(":")[2]);
    }
    if (testBungalowUri(/artist:(.*):(release|album)/, uri)) {
      return await this.service.getReleasesByArtist(uri.split(":")[2]);
    }
    if (testBungalowUri(/(release|album):(.*)/, uri)) {
      return await this.service.getAlbum(uri.split(":")[2]);
    }
    if (testBungalowUri(/(release|album):(.*):track/, uri)) {
      return await this.service.getTracksInAlbum(uri.split(":")[2]);
    }
    if (testBungalowUri(/playlist:(.*):track/, uri)) {
      return await this.service.getTracksInPlaylist(uri.split(":")[2]);
    }
    if (testBungalowUri(/track:(.*)/, uri)) {
      return await this.service.getTrackById(uri.split(":")[2]);
    }
    if (testBungalowUri(/isrc:(.*)/, uri)) {
      return await this.service.getRecordingByISRC(uri.split(":")[2]);
    }
    if (testBungalowUri(/upc:(.*)/, uri)) {
      return await this.service.getReleaseByUPC(uri.split(":")[2]);
    }
    if (testBungalowUri(/isni:(.*)/, uri)) {
      return await this.service.getCreatorByISNI(uri.split(":"));
    }
    if (testBungalowUri(/search:(.*):track/, uri)) {
      return await this.service.searchFor(decodeURIComponent(uri.split(":")[2]), 'track');
    }
    if (testBungalowUri(/search:(.*):artist/, uri)) {
      return await this.service.searchFor(decodeURIComponent(uri.split(":")[2]), 'artist');
    }
    if (testBungalowUri(/search:(.*):release/, uri)) {
      return await this.service.searchFor(decodeURIComponent(uri.split(":")[2]), 'release');
    }
  }
}

export default new Store();


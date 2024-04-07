import EventEmitter from '/js/events.js';

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
  uriRequest(method, uri, params, data) {
    if (/^music:user:(.*)$/.test(uri)) {
      return this.service.getUser(uri.split(":")[2]);
    }
    if (/^music:playlist:(.*)$/.test(uri)) {
      return this.service.getPlaylist(uri.split(":")[2]);
    }
    if (/^music:artist:(.*)/.test(uri)) {
      return this.service.getArtist(uri.split(":")[2]);
    }
    if (/^music:artist:(.*):(release|album)/.test(uri)) {
      return this.service.getReleasesByArtist(uri.split(":")[2]);
    }
    if (/^music:(release|album):(.*)/.test(uri)) {
      return this.service.getAlbum(uri.split(":")[2]);
    }
    if (/^music:(release|album):(.*):track/.test(uri)) {
      return this.service.getTracksInAlbum(uri.split(":")[2]);
    }
    if (/^music::playlist:(.*):track/.test(uri)) {
      return this.service.getTracksInPlaylist(uri.split(":")[2],);
    }
    if (/^music:track:(.*)/.test(uri)) {
      return this.service.getTrackById(uri.split(":"));
    }
    if (/^music:isrc:(.*)/.test(uri)) {
      return this.service.getRecordingByISRC(uri.split(":"));
    }
    if (/^music:upc:(.*)/.test(uri)) {
      return this.service.getReleaseByUPC(uri.split(":"));
    }
    if (/^music:isni:(.*)/.test(uri)) {
      return this.service.getCreatorByISNI(uri.split(":"));
    }
  }
 
}

export default new Store();


import EventEmitter from '/js/events.js';
import SpotifyService from '/js/plugins/spotify/service.js';
import { serializeObject } from '/js/util/string.js'

let formatObject = (payload = {}) => {
    return
}

window.objects = {};

class PlayerStore extends EventEmitter {

    constructor() {
        super();
        this.state = {};
        this.initPlayer();

    }
}


export default new PlayerStore();
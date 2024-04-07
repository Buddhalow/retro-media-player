import EventEmitter from '/js/events.js';

let formatObject = (payload = {}) => {
    return
}

window.objects = {};

class PlayerStore extends EventEmitter {

    constructor() {
        super();
        this.state = {};

    }
}


export default new PlayerStore();
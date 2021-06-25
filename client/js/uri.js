export default class Uri {
    constructor(uri) {
        this.parts = uri.split(/\:/);
        this.user = this.parts[2];
        this.playlist = this.parts[4];
        this.id = this.parts[3];
    }
}

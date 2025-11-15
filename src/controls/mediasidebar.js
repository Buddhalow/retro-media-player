export default class MediaSideBarElement extends HTMLElement {
    constructor() {
        super();
    }
    connectedCallback() {
        this.render();
    }
    render() {
        this.innerHTML = `
            <sp-mediasidebaritem uri="bungalow:player">Now Playing</sp-mediasidebaritem>
        `;
    }
}
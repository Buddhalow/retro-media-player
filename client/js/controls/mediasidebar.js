export default class MediaSideBarElement extends HTMLElement {
    constructor() {
        super();
    }
    connectedCallback() {
        super.connectedCallback(); 
        this.render();
        debugger;
    }
    render() {
        debugger
        this.innerHTML = `
            <sp-mediasidebaritem uri="bungalow:player">Now Playing</sp-mediasidebaritem>
        `;
    }
}
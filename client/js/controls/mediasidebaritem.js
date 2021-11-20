export default class MediaSideBarItem extends HTMLElement {
    connectedCallback() {
        super.connectedCallback();
        this.render();
        this.addEventListener('click', (e) => {
            GlobalViewStack.navigate(e.target.getAttribute('uri'));
        })
    }
    render() {
        this.innerHTML = `
            <sp-mediasidebaritem uri="bungalow:player">Player</sp-mediasidebaritem>
        `;
    }
}
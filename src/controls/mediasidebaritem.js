export default class MediaSideBarItem extends HTMLElement {
    connectedCallback() {
        this.render();
        this.addEventListener('click', (e) => {
            GlobalViewStack.navigate(e.target.getAttribute('uri'));
        })
    }
    render() {
        this.innerHTML = `
            <sp-link uri="bungalow:player">Player</sp-link>
        `;
    }
}
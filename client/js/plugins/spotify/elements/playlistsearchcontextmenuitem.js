class SPSpotifyPlaylistSearchContextMenuItemElement extends HTMLElement {
    connectedCallback() {
        if (!this.created) {
            this.innerHTML = '<input type="search">';
            let input = this.querySelector('input');
            input.addEventListener('change', (e) => {

            })
        }
    }
}
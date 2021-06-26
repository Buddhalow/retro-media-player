
    export default class SPNowPlayingElement extends HTMLElement {
        connectedCallback() {
            this.addEventListener('click', this.onClick);

            this.audio = document.createElement('audio')
            this.appendChild(this.audio)
            this.audio.addEventListener('timeupdated', (e) => {
                let event = new CustomEvent('trackprogress')
                event.data = {
                    
                }
            })
            if (!this.created) {
                this.footerHook = document.createElement('sp-hook');
                this.footerHook.setAttribute('data-hook-id', 'player');
                this.appendChild(this.footerHook);

                this.created = true
                this.innerHTML = '<div class="nowplayingheader"><div class="nowplayingtitle"><sp-link class="title"></sp-link><p class="artists"></p></div><div class="nowplayingbutton"><button class="fas fa-arrow-down"></button></div></div><div class="nowplayingimage"></div>'
                this.querySelector('#nowplayingimage').addEventListener('click', (e) => {
                    GlobalViewStack.navigate(e.target.getAttribute('uri'));
                });
            }
        }
        load(url) {
            this.audio.setAttribute('src', url)

        }
        resize() {
            this.querySelector('.nowplayingimage').style.height = this.getBoundingClientRect().width;
        }
        play() {
            this.audio.play()
        }
        stop() {
            this.audio.stop()
        }
        onClick(e) {
            if (store.state.player) {
                if (store.state.player.context instanceof Object) {
                    GlobalViewStack.navigate(store.state.player.context.uri);
                }
                if (store.state.player.item.album instanceof Object) {
                    GlobalViewStack.navigate(store.state.player.item.album.uri);
                }
            }
        }
        disconnectedCallback() {
            this.removeEventListener('click', this.onClick);

        }
    }

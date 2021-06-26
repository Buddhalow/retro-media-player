import store from '/js/plugins/spotify/store.js';

export default class SPTrackControls extends HTMLElement {
    connectedCallback() {
        this.playerControls = document.createElement('sp-appfootersection');

        this.previousButton = document.createElement('button');
        this.previousButton.classList.add('fa');
        this.previousButton.classList.add('fa-step-backward');
         this.previousButton.addEventListener('click', (e) => {
            store.skipBack();
        })
        this.playerControls.appendChild(this.previousButton);
        this.appendChild(this.playerControls);
        this.playButton = document.createElement('button');
        this.playButton.classList.add('fa');
        this.playButton.setAttribute('id', 'playButton');
        this.playButton.classList.add('fa-play');
        this.playerControls.appendChild(this.playButton);
        this.playButton.addEventListener('click', (e) => {
            store.playPause();
        })
        this.playButton.style.transform = 'scale(1.2)';
        this.nextButton = document.createElement('button');
        this.nextButton.classList.add('fa');
        this.nextButton.classList.add('fa-step-forward');
        this.playerControls.appendChild(this.nextButton);
        this.nextButton.addEventListener('click', (e) => {
            store.skipNext();
        }); 
        this.volumethumb = document.createElement('input');
        this.volumethumb.setAttribute('type', 'range');
        this.volumethumb.setAttribute('id', 'volumethumb');
        this.volumethumb.style.flex = '5';
        this.volumethumb.addEventListener('change', (e) => {
            let value = e.target.value;
   //         store.setVolume(value);
        })
        this.playerControls.appendChild(this.volumethumb);

        this.player = document.createElement('sp-appfootersection');
        this.player.style.flex = '1';
        this.playthumb = document.createElement('input');
        this.playthumb.setAttribute('type', 'range');
        this.playthumb.setAttribute('id', 'playthumb');
        this.playthumb.style.flex = '5';
        this.playthumb.addEventListener('change', (e) => {
            let value = e.target.value;
            store.seek(value);
        })
        this.player.appendChild(this.playthumb); 
        this.appendChild(this.player);
        this.rightSection = document.createElement('sp-appfootersection');
        
        this.rightSection.innerHTML = `<img src="/images/oldify.svg" height="50pt" width="80pt" style="transform: rotate(-5deg); opacity: 1; filter: drop-shadow(0 1pt 0pt rgba(255, 255, 255, .3))">`;
        this.devicesButton = document.createElement('button');
        this.devicesButton.innerHTML = `<img src="/images/speakers.svg" height="30pt" width="30pt" style="opacity: 1; filter: drop-shadow(0 1pt 0pt rgba(255, 255, 255, .3))">`;
        this.devicesButton.addEventListener('click', (event) => {
            let contextMenu = document.createElement('sp-contextmenu');
            if (window.spotifyStore) {
                window.spotifyStore.getDevices().then((devices) => {
                    contextMenu.show(this.devicesButton.getBoundingClientRect(), {}, devices.map(device => ({
                        name: device.name,
                        id: device.id,
                        onCommand: ({ item, event, object, obj }) => {
                            window.spotifyStore.setDevice(obj.id).then(() => { 
                            });
                        }
                    })));
                });
            }
        });  
        // this.rightSection.appendChild(this.devicesButton);
        this.rightSection.style.flex = '0 0 80pt';
        this.appendChild(this.rightSection);
        /*let btn = document.createElement('button');
        btn.classList.add('fa');
        btn.classList.add('fa-paint-brush');
        this.appendChild(btn);
        btn.style.cssFloat = 'right';
        btn.addEventListener('click', (e) => {
            let hue = store.hue;
            if (hue > 360) {
                hue = 0;
            }
            hue += 2;
            store.hue = hue;
        });
        this.created = true;
        */
        store.on('change', (e) => {
            let trackItems = document.querySelectorAll('.sp-track');
            let playButton = document.querySelector('#playButton');
            if (store.state.player && store.state.player.item) {
                let playThumb = document.querySelector('#playthumb');
                if (playThumb) {
                    playThumb.setAttribute('min', 0);
                    playThumb.setAttribute('max', store.state.player.item.duration_ms);
                    playThumb.value = (store.state.player.progress_ms);
                    console.log('max', store.state.player.item.duration_ms)
                }
            
                playButton.classList.remove('fa-play');
                playButton.classList.add('fa-pause');
                let imageUrl = store.state.player.item.album.images[0].url;
                let img = document.createElement('img');
                img.crossOrigin = '';
                img.src = imageUrl;
                img.onload = function () {
                
                    var vibrant = new Vibrant(img);
                    let color = vibrant.swatches()['Vibrant'];
                //       document.documentElement.style.setProperty('--now-playing-accent-color', 'rgba(' + color.rgb[0] + ',' + color.rgb[1] + ',' + color.rgb[2] + ', 1)');
                }
                document.querySelector('sp-nowplaying').style.backgroundImage = 'url("' + store.state.player.item.album.images[0].url + '")';
                
                document.querySelector('sp-nowplaying').setAttribute('uri', store.state.context_uri);
                for(var tr of trackItems) {
                    if (tr.getAttribute('data-uri') === store.state.player.item.uri) {
                        tr.classList.add('sp-current-track');
                        
                    } else {
                        tr.classList.remove('sp-current-track');
                    }
                }
            } else {
                
                playButton.classList.remove('fa-pause');
                playButton.classList.add('fa-play');
            }
        });
    }
}

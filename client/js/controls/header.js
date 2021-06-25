import { loadTemplate } from '/js/util/template.js'
import SPResourceElement from '/js/controls/resource.js';

export default class SPHeaderElement extends SPResourceElement {
    connectedCallback() {
        super.connectedCallback();
        if (!this.created5) {
            this.innerHTML = '';
            this.created5 = true;
            this.classList.add('header');
            window.GlobalTabBar.titleVisible = false;

            this.tabBar = document.createElement('sp-tabbar');
            this.tabBar.classList.add('sp-2014');
            this.tabBar.classList.add('sp-2013');
            this.created = true;

            this.attributeChangedCallback('uri', null, this.getAttribute('uri'));
            this.topSpace = document.createElement('div')
            this.appendChild(this.topSpace);
        }
    }
    scroll() {
        let theme = JSON.parse(localStorage.getItem('theme'))
        if (!theme) {
            theme = {
                stylesheet: 'spotify-2018'
            }
        }
        if (theme.stylesheet === 'spotify-2018') {
            var scrollTop = this.parentNode.scrollTop;
            var transparency = 1;
            var scrollRange = 15;
            transparency = 0.28 - ((scrollTop / 165) * 0.28)
            let color = '255,255,255'
            if (document.documentElement.vibrant) {

                color = document.documentElement.style.getPropertyValue('--vibrant-rgb')
            }
            let backgroundColor =  'rgba(' + color + ', ' + transparency + ')'
            document.documentElement.style.setProperty('--vibrant-header-color', 'rgba(' + color + ', 0.28)');
            document.documentElement.style.setProperty('--vibrant-header-color-transparent', 'rgba(' + color + ', 0)');

            document.querySelector('sp-floatingbar').style.backgroundColor = backgroundColor;

        } else {

        }
    }
    activate() {
        scroll()
    }
    deactivate() {
        document.querySelector('sp-floatingbar').style.backgroundColor = 'transparent'
    }
    attachedCallback() {
        alert("A")
        this.parentNode.addEventListener('scroll', (e) => {
            this.scroll()
        })
        this.scroll()

        this.vibrant();
    }
    checkBounds() {
        let headerBounds = this.getBoundingClientRect();
        let viewBounds = this.parentNode.getBoundingClientRect();
        window.GlobalTabBar.titleVisible = (headerBounds.top < viewBounds.top - (headerBounds.height * 0.5));
        console.log(headerBounds.top, viewBounds.top);
        if (this.parentNode.scrollTop > headerBounds.height / 2) {
            this.classList.add('sp-fixed-top');
            /*this.style.left = viewBounds.left + 'px';
            this.style.width = viewBounds.width + 'px';
            */
        } else {
            this.style.left = 0;
            this.style.width = 'auto';
            this.classList.remove('sp-fixed-top');

        }
    }
    attachedCallback() {
            this.parentNode.addEventListener('scroll', (e) => {
            this.checkBounds();
            this.scroll()
        });
        this.scroll()
        this.checkBounds();
        insertAfter(this.tabBar, this);

        if (localStorage.getItem('showHeaders') !== 'true') {
            this.style = 'display: none';
        } else {

            this.style = 'display: block';
        }
    }
    get size() {
        return this.getAttribute('size')
    }
    set size(value) {
        this.setAttribute('size', value)
    }
    get template() {
        return  parseInt(this.getAttribute('template'))
    }
    set template(value) {
        this.setAttribute('template', value)
    }
    async render() {
        if (!this.state) return;
        if (!this.state.object) return;
        let major = this.state.major
        let object = this.state.object;
        let size = this.size ? this.size : getComputedStyle(document.body).getPropertyValue("--image-size");
        let width = size;
        let height = size;
        let titleElement = document.createElement('sp-title');
        titleElement.setState(object);

        if (object.images instanceof Array )
        object.image_url = object.images && object.images.length > 0 && object.images[0].url ? object.images[0].url : '';
        let strFollowers = '';
        if ('followers' in object) {
            strFollowers = numeral(object.followers.total).format('0,0') + ' followers';
        }
        let theme = JSON.parse(localStorage.getItem('theme')) || {
            stylesheet: 'spotify-2018'
        }
        let templateName = this.template ? this.template : '/views/generic_header.ejs'
        let templ = await loadTemplate(templateName)

        this.innerHTML = templ({
            object: object,
            size: size,
            major: major,
            width: width,
            type: object.type,
            modern: theme.stylesheet === 'spotify-2018',
            height: height,
            title: titleElement.innerHTML,
            strFollowers: strFollowers
        });
        if (!major) {

            let image = this.querySelector('sp-image');
            if (!!image)
                image.setState(object);


            if (object.type == 'audiobook') {
                image.style.height = parseInt(image.style.width) * 1.8 + 'px'
            }
            /* if ('followers' in object) {
                let pop = '';
                if (object.popularity) {
                    pop = '<hr><h3>#' + numeral( TOTAL_ARTISTS_ON_SPOTIFY - (TOTAL_ARTISTS_ON_SPOTIFY * ((object.popularity) / 100))).format('0,0') + '</h3><br>' + _('In he world');
                }
                this.innerHTML += '<div style="flex: 0 0 50pt;"> <h3>' + numeral(object.followers.total).format('0,0') + '</h3><br> ' + _('followers') + '<br> ' + pop + ' </div>';

            } */
            if (object.buttons instanceof Array)
            object.buttons.map((btn, i) => {
                if (btn == null) return;
                let button = document.createElement('button');
                button.classList.add('btn');
                if (i == 0)
                button.classList.add('btn-tool');
                button.addEventListener('click', btn.onClick);
                button.innerHTML = btn.label;
                this.querySelector('sp-toolbar').appendChild(button);


            })
            let followButton = document.createElement('button');
            followButton.classList.add('btn');
            followButton.innerHTML = _e('Follow');
            let playButton = document.createElement('button');
            playButton.classList.add('btn');
            playButton.classList.add('btn-tool');
            playButton.innerHTML = _e('Play');
            let menuButton = document.createElement('button');
            menuButton.innerHTML = '...';
            menuButton.classList.add('btn');
            menuButton.classList.add('btn-tool');
            this.querySelector('sp-toolbar').appendChild(playButton);
            this.querySelector('sp-toolbar').appendChild(menuButton);
            this.object = object;
        }
        this.vibrant();
        document.documentElement.style.setProperty('--model-image-url', 'transparent');
        document.documentElement.style.setProperty('--model-header-background', 'transparent');
        if (object.images instanceof Array && object.images.length > 0) {
            document.documentElement.style.setProperty('--model-image-url', 'url("' + object.images[0].url + '")');
            document.documentElement.style.setProperty('--model-header-image', 'url("' + object.images[0].url + '")');
        }
    }
    vibrant() {
        document.documentElement.vibrant = false;
        let object = this.object;
        if (!this.object) return;

        if (object.images instanceof Array && object.images.length > 0) {
            document.documentElement.vibrant = true;
            let imageUrl = object.images[0].url;
            let img = document.createElement('img');
            img.crossOrigin = '';
            img.src = imageUrl;
            document.documentElement.style.setProperty('--vibrant-color', '#eee');
            document.documentElement.style.setProperty('--vibrant-rgb', '255,255,255');
            img.onload = () => {

                var v = new Vibrant(img);
                let vibrant = v.swatches()['Vibrant'];
                let muted = v.swatches()['Muted'];
                let primaryColor  = vibrant.getHex();
                let mutedColor  = muted.getHex();
                    let secondaryColor  = invertColor(primaryColor);

                //  this.parentNode.style.backgroundColor = bg;
                //window.GlobalTabBar.style.backgroundColor = bg;
                document.documentElement.style.setProperty('--vibrant-color', primaryColor);
                document.documentElement.style.setProperty('--vibrant-rgb', vibrant.getRgb()[0] + ',' + vibrant.getRgb()[1] + ',' + vibrant.getRgb()[2]);
                document.documentElement.style.setProperty('--muted-color', mutedColor);
                if (window.GlobalChromeElement.theme.flavor == 'light') {
                    document.documentElement.style.setProperty('--primary-color', secondaryColor);
                    document.documentElement.style.setProperty('--secondary-color',  primaryColor);
            //       document.documentElement.style.setProperty('--foreground-color', muted.getBodyTextColor());
                } else {
                document.documentElement.style.setProperty('--primary-color',  primaryColor);
                document.documentElement.style.setProperty('--secondary-color', secondaryColor);
        //         document.documentElement.style.setProperty('--foreground-color', vibrant.getBodyTextColor());
                }

            }
        }
    }
}
function invertColor(hex) {
    if (hex.indexOf('#') === 0) {
        hex = hex.slice(1);
    }
    // convert 3-digit hex to 6-digits.
    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    if (hex.length !== 6) {
        throw new Error('Invalid HEX color.');
    }
    // invert color components
    var r = (255 - parseInt(hex.slice(0, 2), 16)).toString(16),
        g = (255 - parseInt(hex.slice(2, 4), 16)).toString(16),
        b = (255 - parseInt(hex.slice(4, 6), 16)).toString(16);
    // pad each with zeros and return
    return '#' + padZero(r) + padZero(g) + padZero(b);
}

function padZero(str, len) {
    len = len || 2;
    var zeros = new Array(len).join('0');
    return (zeros + str).slice(-len);
}



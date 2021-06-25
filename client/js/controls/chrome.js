export default class SPChromeElement extends HTMLElement {

    get theme() {
        return this._theme;
    }
    set theme(value) {
        this._theme = value;
        this.applyTheme(value);

    }
    saveTheme(value) {
        localStorage.setItem('theme', JSON.stringify(value));
    }
    loadTheme() {
        let theme = JSON.parse(localStorage.getItem('theme')    );
        if (theme != null) {
            return theme;
        }
        return {
            stylesheet: 'spotify-2009',
            saturation: 100,
            flavor: 'dark',
            hue: 100,
            colors: ['#0077ff', '#ff8800', '#00ff00']
        }
    }
    applyTheme(value) {

        document.documentElement.style.setProperty('--primary-saturation', value.saturation + '%');
        document.documentElement.style.setProperty('--primary-hue', value.hue + 'deg');
        document.documentElement.style.setProperty('--primary-color', value.colors[0]);
        document.documentElement.style.setProperty('--secondary-color', value.colors[1]);
        document.documentElement.style.setProperty('--tertiary-color', value.colors[2]);

        this.applyStylesheet(value.stylesheet, value.flavor);
    }
    applyStylesheet(theme, flavor='light') {
        let link = document.querySelector('link[id="theme"]');
        if (!link) {
            link = document.createElement('link');
            link.setAttribute('id', 'theme');
            document.head.appendChild(link);
            link.setAttribute('rel', 'stylesheet');
        }
        let link2 = document.querySelector('link[id="theme_variant"]');
        if (!link2) {
            link2 = document.createElement('link');
            link2.setAttribute('id', 'theme_variant');
            document.head.appendChild(link2);
            link2.setAttribute('rel', 'stylesheet');
        }
        link.setAttribute('href', '/themes/' + theme + '/css/' + theme + '.css');
        link2.setAttribute('href', '/themes/' + theme + '/css/' + flavor + '.css');
    }

    login(service) {
        sessionStorage.setItem('logging_into', service);

        return new Promise((resolve, reject) => {
            setTimeout(() => {
                var loginWindow = window.open('/api/' + service + '/login');
                var t = setInterval(() => {
                    if (!loginWindow) {
                        clearInterval(t);

                        resolve(true);
                    }
                });
            });
        });
    }

    connectedCallback() {
        window.GlobalChromeElement = this;
        this.theme = this.loadTheme();
        this.hooks = [];
        this.appHeader = document.createElement('sp-appheader');
        this.appendChild(this.appHeader);
        this.appToolbar = document.createElement('sp-apptoolbar');
        this.appendChild(this.appToolbar);
        this.infoBar = document.createElement('sp-infobar');
        this.appendChild(this.infoBar);
        this.main = document.createElement('main');
        this.appendChild(this.main);
        this.sidebar = document.createElement('sp-sidebar');
        this.main.appendChild(this.sidebar);
        this.mainView = document.createElement('sp-main');
        this.main.appendChild(this.mainView);
        this.rightsidebar = document.createElement('sp-rightsidebar');
        this.main.appendChild(this.rightsidebar);
        this.rightsidebar.style.display = 'none';
        this.appFooter = document.createElement('sp-appfooter');
        this.appendChild(this.appFooter);
        setInterval(this.checkConnectivity.bind(this), 1000);
        window.chrome = this;
    }
    checkConnectivity() {
        this.onLine = navigator.onLine;

    }
    get onLine() {
        return this._onLine;
    }
    set onLine(val) {
        this._onLine = val;
        if (!this.onLine) {
            this.classList.add('offline');
        } else {
            this.classList.remove('offline');
        }
    }
    alert(obj) {
        this.infoBar.show();
        this.infoBar.setState(obj);
        this.infoBar.flash()
    }
}

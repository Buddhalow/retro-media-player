import { getPageIdentity } from "/js/util.js";

Parse.initialize(
  "yvZbizRiIpJ3O1Q6Va0urSMkeg6AMRwzx0Sk6Sqo",
  "yaBh9ill6i0ktvvTb7WDPmoSg8QSxoGCFZ0yuYQY"
);

Parse.serverURL = "https://parseapi.back4app.com/";
moment.locale("set");
Parse.User.logIn("drsounds", "123", {
  success: () => {
    resolve(user);
  },
  error: () => {
    reject();
  },
});

function printTime(time) {
  time = moment(time);
  let now = new Date().getTime();
  let then = time.toDate().getTime();
  if (
    new Date().getTime() - time.toDate().getTime() >
    1000 * 60 * 60 * 24 * 16
  ) {
    return time.format("YYYY-MM-DD");
  } else {
    return time.fromNow();
  }
}

class EventEmitter {
  constructor() {
    this.listeners = [];
  }
  on(event, cb) {
    this.listeners.push({
      type: event,
      callback: cb,
    });
  }
  emit(event) {
    let callbacks = this.listeners
      .filter((e) => e.type == event)
      .forEach((event) => {
        event.callback.apply(this, arguments);
      });
  }
}

function applyTheme(theme, flavor = "light") {
  let link = document.querySelector('link[id="theme"]');
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("id", "theme");
    document.head.appendChild(link);
    link.setAttribute("rel", "stylesheet");
  }
  let link2 = document.querySelector('link[id="theme_variant"]');
  if (!link2) {
    link2 = document.createElement("link");
    link2.setAttribute("id", "theme_variant");
    document.head.appendChild(link2);
    link2.setAttribute("rel", "stylesheet");
  }
  link2.setAttribute("href", "/themes/" + theme + "/css/" + flavor + ".css");
  link.setAttribute("href", "/themes/" + theme + "/css/" + theme + ".css");
}

applyTheme("chromify", "light");

/**
 * Data store for application
 **/
class Store extends EventEmitter {
  constructor() {
    super();
    this.state = {};
    this.hue = this.hue;
    this.saturation = this.saturation;
    this.flavor = this.flavor;
    this.stylesheet = this.stylesheet;
    this.discoveredTracks = JSON.parse(
      localStorage.getItem("discoveredTracks")
    ) || {
      objects: [],
    };
  }

  getDiscoveredTracks(track, playlist = null) {
    let results = this.discoveredTracks.objects.filter(
      (t) => t.uri == track.uri
    );
    if (playlist != null)
      results = results.filter((t) => {
        return t.playlists.filter((o) => o.uri == playlist.uri).length > 0;
      });
    return results;
  }
  hasDiscoveredTrack(track, playlist = null) {
    return this.getDiscoveredTracks(track, playlist).length > 0;
  }
  discoverTrack(track, playlist = null, position = -1, played = false) {
    track.playlists = [];
    track.played = played;
    if (playlist != null) {
      if (!playlist.positions) {
        playlist.positions = [];
      }
      playlist.positions.push({
        position: position,
        time: new Date(),
      });
      track.playlists.push(playlist);
    }
    this.discoveredTracks.objects.push(track);
    //    localStorage.setItem('discoveredTracks', JSON.stringify(this.discoveredTracks));
  }
  get stylesheet() {
    let stylesheet = localStorage.getItem("stylesheet");
    if (!stylesheet) {
      stylesheet = "chromify";
    }
    return stylesheet;
  }
  set stylesheet(value) {
    applyTheme(value, this.flavor);
    localStorage.setItem("stylesheet", value);
  }
  get flavor() {
    let flavor = localStorage.getItem("flavor");
    if (!flavor) {
      flavor = "light";
    }
    return flavor;
  }
  set flavor(value) {
    applyTheme(this.stylesheet, value);
    localStorage.setItem("flavor", value);
  }
  get hue() {
    let hue = localStorage.getItem("hue");
    if (!hue) return 0;
    return hue;
  }

  /**
   * Sets app global hue
   **/
  set saturation(value) {
    document.documentElement.style.setProperty(
      "--primary-saturation",
      value + "%"
    );
    localStorage.setItem("saturation", value);
  }

  get saturation() {
    let saturation = localStorage.getItem("saturation");
    if (!saturation) return 0;
    return saturation;
  }

  /**
   * Sets app global hue
   **/
  set hue(value) {
    document.documentElement.style.setProperty("--primary-hue", value + "deg");
    localStorage.setItem("hue", value);
  }

  /**
   * Save state
   **/
  saveState() {
    //   localStorage.setItem('store', JSON.stringify(this.state));
  }

  /**
   * Load state
   **/
  loadState() {
    if (!localStorage.getItem("store")) return {};

    return JSON.parse(localStorage.getItem("store"));
  }

  playPause() {
    this.state.player = this.getCurrentTrack();
    let result = null;
    if (this.state.player.is_playing) {
      result = this.request("PUT", "spotify:me:player:pause");
    } else {
      result = this.request("PUT", "spotify:me:player:play");
    }
    this.state.player = this.getCurrentTrack();
    this.emit("change");
  }

  /**
   * Set state for resource
   **/
  setState(uri, state) {
    this.state[uri] = state;
    this.emit("change");
    this.saveState();
  }
  play(context) {
    let result = this.request(
      "PUT",
      "spotify:me:player:play",
      {},
      context,
      false
    );
    this.state.player = this.getCurrentTrack();
    this.emit("change");
  }
  playTrack(track, context) {
    this.request(
      "PUT",
      "spotify:me:player:play",
      {},
      {
        context_uri: context.uri,
        position: {
          uri: track.uri,
        },
      }
    );
  }
  playTrackAtPosition(position, context) {
    this.request(
      "PUT",
      "spotify:me:player:play",
      {},
      {
        context_uri: context.uri,
        position: {
          offset: position,
        },
      }
    );
  }
  getCurrentTrack() {
    let result = this.request(
      "GET",
      "spotify:me:player:currently-playing",
      null,
      null,
      false
    );

    return result;
  }
  request(method, uri, params, payload, cache = true) {
    if (uri in this.state && method == "GET" && cache) return this.state[uri];
    try {
      let esc = encodeURIComponent;
      let query = params
        ? Object.keys(params)
            .map((k) => esc(k) + "=" + esc(params[k]))
            .join("&")
        : "";

      if (uri == null) return;
      var url = uri;
      if (uri.indexOf("bungalow:") == 0 || uri.indexOf("spotify:") == 0) {
        url = "/api/" + url.split(":").slice(1).join("/") + "?" + query;
        if (uri in this.state && method == "GET" && cache)
          return this.state[uri];
        let result;
        if (method === "GET") {
          result = fetch(url, {
            credentials: "include",
            mode: "cors",
            headers: {
              "Content-Type": "application/json",
            },
            method: "GET",
          }).then((e) => e.json());
        } else {
          result = fetch(url, {
            credentials: "include",
            mode: "cors",
            headers: {
              "Content-Type": "application/json",
            },
            method: method,
            body: JSON.stringify(payload),
          }).then((e) => e.json());
        }
        this.setState(uri, result);

        return result;
      }
      if (uri in this.state) return this.state[uri];

      let result = fetch(url, { credentials: "include", mode: "cors" }).then(
        (e) => e.json()
      );
      this.setState(uri, result);

      return result;
    } catch (e) {
      alert("An error occured");
    }
  }

  /**
   * Get album by ID
   **/
  getAlbumById(id) {
    let uri = "spotify:album:" + id;
    let result = fetch("/api/album/" + id, {
      credentials: "include",
      mode: "cors",
    }).then((e) => e.json());
    this.setState(uri, result);
    return result;
  }
  getArtistById(id) {
    let uri = "spotify:artist:" + id;
    let result = fetch("/api/artist/" + id, {
      credentials: "include",
      mode: "cors",
    }).then((e) => e.json());
    this.setState(uri, result);
    return result;
  }
  login() {
    return new Promise((resolve, reject) => {});
  }
}

var store = new Store();

class SPThemeEditorElement extends HTMLElement {
  attachedCallback() {
    if (!this.created) {
      this.colorChooser = document.createElement("input");
      this.colorChooser.setAttribute("type", "range");
      this.innerHTML += "<label>" + _("Accent color") + "</label>";
      this.appendChild(this.colorChooser);
      this.colorChooser.setAttribute("max", 360);
      this.colorChooser.addEventListener("change", this.hueSlider);
      this.colorChooser.addEventListener("mousemove", this.hueSlider);
      this.saturationChooser = document.createElement("input");
      this.saturationChooser.setAttribute("type", "range");
      this.label = document.createElement("label");
      this.saturationChooser.addEventListener("change", this.saturationSider);
      this.saturationChooser.addEventListener(
        "mousemove",
        this.saturationSlider
      );
      this.label.innerHTML = _("Saturation");
      this.appendChild(this.saturationChooser);
      this.appendChild(this.label);
      this.saturationChooser.setAttribute("max", 360);
      this.saturationChooser.value = store.saturation;
      this.styleselect = document.createElement("select");
      this.styleselect.innerHTML +=
        '<option value="xp">XP</option><option value="google">Google</option><option value="bungalow">Bungalow</option><option value="maestro">Maestro</option><option value="obama">Obama</option><option value="zos">Z/OS</option><option value="i386">i386</option><option value="spotify-2010">Obama 2010</option><option value="spotify-flat">Obama (flat)</option><option value="chromify">Chromify</option><option value="wmp_11">Windows Media Player 11</option><option value="wmp_11_beta">Windows Media Player 11</option><option value="wmp_10">Windows Media Player 10</option><option value="wmp_9">Windows Media Player 9</option>';
      this.appendChild(this.styleselect);
      this.flavorselect = document.createElement("select");
      this.flavorselect.innerHTML +=
        '<option value="dark">' +
        _("Dark") +
        '</option><option value="light">' +
        _("Light") +
        "</option>";
      this.appendChild(this.flavorselect);
      this.flavorselect.addEventListener("change", (e) => {
        store.flavor = e.target.options[e.target.selectedIndex].value;
      });
      this.styleselect.addEventListener("change", (e) => {
        store.stylesheet = e.target.options[e.target.selectedIndex].value;
      });
      this.created = true;
    }
  }
  hueSlider(e) {
    let value = e.target.value;
    store.hue = value;
  }
  saturationSlider(e) {
    let value = e.target.value;
    store.saturation = value;
  }
}

customElements.define("sp-themeeditor", SPThemeEditorElement);

class SPAppHeaderElement extends HTMLElement {
  attachedCallback() {
    if (!this.created) {
      this.innerHTML =
        '<button id="btnBack" class="fa fa-arrow-left" onclick="history.back()"><button class="fa fa-arrow-right" onclick="history.forward()"></button>';
      if (!this.searchForm) {
        this.searchForm = document.createElement("sp-searchform");
        this.appendChild(this.searchForm);
        this.searchForm.style.marginLeft = "15pt";
      }
      let flex = document.createElement("div");
      flex.style.flex = "5";
      this.appendChild(flex);
      this.loginButton = document.createElement("button");
      this.loginButton.innerHTML = _("Log in");
      this.loginButton.addEventListener("click", (e) => {
        GlobalViewStack.navigate("bungalow:internal:login");
      });
      this.appendChild(this.loginButton);
      this.created = true;
    }
  }
}

class SPInfoBarElement extends HTMLElement {
  hide() {
    this.style.display = "none";
  }
  show() {
    this.style.display = "block";
  }
  setState(obj) {
    this.innerHTML = "";
    this.innerHTML = '<i class="fa fa-info"></i> ' + obj.name;
    this.closeButton = document.createElement("a");
    this.appendChild(this.closeButton);
    this.closeButton.classList.add("fa");
    this.closeButton.classList.add("fa-times");
    this.closeButton.style = "float: right";
    this.closeButton.addEventListener("click", (e) => {
      this.hide();
    });
  }
}

customElements.define("sp-infobar", SPInfoBarElement);

customElements.define("sp-appheader", SPAppHeaderElement);

window.addEventListener("error", (e) => {});

class SPAppFooterElement extends HTMLElement {
  attachedCallback() {
    if (!this.created) {
      this.previousButton = document.createElement("button");
      this.previousButton.classList.add("fa");
      this.previousButton.classList.add("fa-step-backward");
      this.appendChild(this.previousButton);
      this.previousButton.addEventListener("click", (e) => {
        store.skipBack();
      });
      this.playButton = document.createElement("button");
      this.playButton.classList.add("fa");
      this.playButton.setAttribute("id", "playButton");
      this.playButton.classList.add("fa-play");
      this.appendChild(this.playButton);
      this.playButton.addEventListener("click", (e) => {
        store.playPause();
      });
      this.nextButton = document.createElement("button");
      this.nextButton.classList.add("fa");
      this.nextButton.classList.add("fa-step-forward");
      this.appendChild(this.nextButton);
      this.nextButton.addEventListener("click", (e) => {
        store.skipNext();
      });
      this.playthumb = document.createElement("input");
      this.playthumb.setAttribute("type", "range");
      this.playthumb.setAttribute("id", "playthumb");
      this.playthumb.style.flex = "5";
      this.appendChild(this.playthumb);
      let btn = document.createElement("button");
      btn.classList.add("fa");
      btn.classList.add("fa-paint-brush");
      this.appendChild(btn);
      btn.style.cssFloat = "right";
      btn.addEventListener("click", (e) => {
        let hue = store.hue;
        if (hue > 360) {
          hue = 0;
        }
        hue += 2;
        store.hue = hue;
      });
      this.created = true;
      store.on("change", (e) => {
        let trackItems = document.querySelectorAll(".sp-track");
        let playButton = document.querySelector("#playButton");
        if (store.state.player && store.state.player.item) {
          let playThumb = document.querySelector("#playthumb");
          if (playThumb) {
            playThumb.setAttribute("min", 0);
            playThumb.setAttribute("max", store.state.player.item.duration_ms);
            playThumb.value = store.state.player.progress_ms;
          }

          playButton.classList.remove("fa-play");
          playButton.classList.add("fa-pause");
          let imageUrl = store.state.player.item.album.images[0].url;
          let img = document.createElement("img");
          img.crossOrigin = "";
          img.src = imageUrl;
          img.onload = function () {
            var vibrant = new Vibrant(img);
            let color = vibrant.swatches()["Vibrant"];
            //       document.documentElement.style.setProperty('--now-playing-accent-color', 'rgba(' + color.rgb[0] + ',' + color.rgb[1] + ',' + color.rgb[2] + ', 1)');
          };
          document.querySelector("sp-nowplaying").style.backgroundImage =
            'url("' + store.state.player.item.album.images[0].url + '")';

          document
            .querySelector("sp-nowplaying")
            .setAttribute("uri", store.state.context_uri);
          for (var tr of trackItems) {
            if (tr.getAttribute("data-uri") === store.state.player.item.uri) {
              tr.classList.add("sp-current-track");
            } else {
              tr.classList.remove("sp-current-track");
            }
          }
        } else {
          playButton.classList.remove("fa-pause");
          playButton.classList.add("fa-play");
        }
      });
    }
  }
}

window.alert = function (message) {
  document.querySelector("sp-chrome").alert({
    type: "info",
    name: message,
    uri: "bungalow:error:0x00",
  });
  let x = 0; /*
    var i = setInterval(() => {
        x++;
        $('sp-infobar').animate({
            opacity: 0.1
        }, 50, () => {
             $('sp-infobar').animate({
                 opacity: 1
             }, 50);
        });
        clearInterval(i);
        
    }, 100);*/
};

customElements.define("sp-appfooter", SPAppFooterElement);

class SPChromeElement extends HTMLElement {
  attachedCallback() {
    this.appHeader = document.createElement("sp-appheader");
    this.appendChild(this.appHeader);
    this.infoBar = document.createElement("sp-infobar");
    this.appendChild(this.infoBar);
    this.main = document.createElement("main");
    this.appendChild(this.main);
    this.sidebar = document.createElement("sp-sidebar");
    this.main.appendChild(this.sidebar);
    this.mainView = document.createElement("sp-main");
    this.main.appendChild(this.mainView);
    this.appFooter = document.createElement("sp-appfooter");
    this.appendChild(this.appFooter);

    this.rightSideBar = document.createElement("sp-rightsidebar");
    //        this.main.appendChild(this.rightSideBar);
    this.playlist = document.createElement("sp-trackcontext");
    this.rightSideBar.appendChild(this.playlist);
    this.playlist.uri = "spotify:internal:library";
  }
  alert(obj) {
    this.infoBar.show();
    this.infoBar.setState(obj);
  }
}

GlobalViewStack = null;

customElements.define("sp-chrome", SPChromeElement);

class SPResourceElement extends HTMLElement {
  attributeChangedCallback(attrName, oldVal, newVal) {
    if (!newVal) return;
    if (attrName === "uri") {
      let state = null;
      if (newVal in store.state) {
        state = store.state[newVal];
        this.setState(state);
        return;
      }
      state = store.request("GET", newVal);
      this.setState(state);
    }
  }
  vibrance() {
    let img = document.createElement("img");
    img.crossOrigin = "";
    img.src = this.object.images[0].url;
    img.onload = () => {
      var vibrant = new Vibrant(img);
      let color = vibrant.swatches()["Vibrant"];
      let light = vibrant.swatches()["LightVibrant"];
      let muted = vibrant.swatches()["Muted"];

      let bgColor = swatchToColor(color);

      //    this.view.style.backgroundColor = bgColor;
      let background =
        "linear-gradient(-90deg, " +
        swatchToColor(color) +
        ", " +
        swatchToColor(muted) +
        ")";
      this.view.style.background = background;
    };
  }
  setState(obj) {
    this.obj = obj;
    this.innerHTML =
      '<sp-link uri="' + obj.uri + '">' + obj.name + "</sp-link>";
  }
}

var GlobalTabBar = null;

class SPMainElement extends HTMLElement {
  attachedCallback() {
    if (!this.viewStack) {
      this.tabBar = document.createElement("sp-tabbar");
      this.appendChild(this.tabBar);
      GlobalTabBar = this.tabBar;
      this.viewStack = document.createElement("sp-viewstack");
      GlobalViewStack = this.viewStack;
      this.appendChild(this.viewStack);
      document.dispatchEvent(new CustomEvent("viewstackloaded"));
    }
  }
}
customElements.define("sp-main", SPMainElement);

/**
 * Viewstack element
 **/
class SPViewStackElement extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    this.registeredViews = [];
  }

  attachedCallback() {
    this.views = {};
    let path = window.location.pathname.substr(1);
    let uri = "bungalow:" + path.split("/").join(":");
    this.navigate(uri, true);

    window.addEventListener("popstate", (event) => {
      let path = window.location.pathname.substr(1);
      let uri = "bungalow:" + path.split("/").join(":");
      this.navigate(uri, true);
    });
  }
  /**
   * Navigates the view stack
   * @param {String} uri The URI to navigate to
   * @returns void
   **/
  navigate(uri, dontPush = false) {
    if (this.uri === uri) return;
    let evt = new CustomEvent("beforenavigate");
    this.dispatchEvent(evt);

    let menuItems = document.querySelectorAll("sp-menuitem");
    for (let item of menuItems) {
      item.classList.remove("active");

      //if (uri.indexOf(item.getAttribute('uri')) == 0) {
      if (uri == item.getAttribute("uri")) {
        item.classList.add("active");
      }
    }

    let newUri = uri;
    if (uri === "bungalow:login") {
      store.login().then(() => {});
      return;
    }

    if (newUri === "bungalow:") {
      newUri == "bungalow:internal:start";
    }

    if (newUri.indexOf("bungalow:") != 0) {
      const identity = getPageIdentity();
      newUri = `bungalow:@${identity.user}@${identity.hostname}:search:${encodeURIComponent(uri)}`;
      uri = newUri;
    }

    let view = document.createElement("sp-settingsview");
    let externalViews = this.registeredViews.filter((v) => v.regex.test(uri));

    if (
      GlobalViewStack.currentView != null &&
      newUri === GlobalViewStack.currentView.getAttribute("uri")
    )
      return;
    if (newUri in this.views) {
      view = this.views[newUri];

      this.setView(view);
    } else if (externalViews.length > 0) {
      view = externalViews[0].tag;
    } else {
      view = document.createElement("sp-settingsview");
      this.addView(newUri, view);
      view.setAttribute("uri", newUri);
    }
    let url = uri.substr("bungalow:".length).split(":").join("/");

    this.uri = uri;

    if (!dontPush) {
      history.pushState(uri, uri, "/" + url);
    }
  }
  addView(uri, view) {
    this.views[uri] = view;
    this.setView(view);
  }
  setView(view) {
    try {
      if (this.firstChild != null) this.removeChild(this.firstChild);

      this.appendChild(view);

      GlobalViewStack.currentView = view;

      if (view.activate instanceof Function) {
        view.activate();
        onHashChanged();
      }
    } catch (e) {
      throw e;
    }
  }
}

customElements.define("sp-viewstack", SPViewStackElement);

const TOTAL_ARTISTS_ON_SPOTIFY = 2000000;

class SPImageElement extends HTMLElement {
  attachedCallback() {
    this.attributeChangedCallback("src", null, this.getAttribute("src"));
    this.addEventListener("click", (e) => {});
  }
  attributeChangedCallback(attrName, oldVal, newVal) {
    if (!newVal) return;
    if (attrName === "src") {
      this.setState(newVal);
    }
  }
  setState(state) {
    if (state instanceof Object) {
      this.setState(state.uri);
      return;
    }
    this.style.backgroundImage = "url(" + state + ")";
    this.style.width = this.getAttribute("width") + "px";
    this.style.height = this.getAttribute("height") + "px";
  }
}
customElements.define("sp-image", SPImageElement);

const VERIFIED_PROFILES = [
  "drsounds",
  "alexanderforselius",
  "daniel",
  "spotify",
];

class SPTitleElement extends HTMLElement {
  attachedCallback() {}
  setState(object) {
    if (!object) return;
    let title = _(object.name);

    if (VERIFIED_PROFILES.filter((o) => object.id === o).length > 0) {
      title += ' <i class="fa fa-check-circle new"></i>';
    }
    let titleHTML =
      '<sp-link uri="' + object.uri + '">' + _(title) + "</sp-link>";
    if (object.artists instanceof Array) {
      titleHTML +=
        ' <span style="opacity: 0.5">' +
        _("by") +
        " " +
        object.artists
          .map((a) => {
            return '<sp-link uri="' + a.uri + '">' + a.name + "</sp-link>";
          })
          .join(", ") +
        "</span>";
    }
    if (object.owner) {
      titleHTML +=
        ' <span style="opacity: 0.7"> ' +
        _("by") +
        ' <sp-link uri="' +
        object.owner.uri +
        '">' +
        _(object.owner.name) +
        "</sp-link></span>";
    }
    if (object.for) {
      titleHTML +=
        ' <span style="opacity: 0.7"> ' +
        _("for") +
        ' <sp-link uri="' +
        object.for.uri +
        '">' +
        _(object.for.name) +
        "</sp-link></span>";
    }
    if (object.in) {
      titleHTML +=
        ' <span style="opacity: 0.7"> ' +
        _("in") +
        ' <sp-link uri="' +
        object.in.uri +
        '">' +
        _(object.in.name) +
        "</sp-link></span>";
    }
    this.innerHTML = titleHTML;
  }
}

customElements.define("sp-title", SPTitleElement);

class SPItemDataSource {
  constructor() {
    this.object = null;
  }
  get(id) {}
}

Parse.Object.prototype.simplify = function (level = 0) {
  let newObj = {};
  Object.keys(this.attributes).forEach((field) => {
    let val = this.attributes[field];
    if (val instanceof Parse.Relation) {
      return;
    }
    if (val instanceof Parse.Object && field != "parseObject" && level < 4) {
      val = val.simplify(level++);
    }
    newObj[field] = val;
    val.parseObject = this;
  });
  return newObj;
};

class SPParseItemDataSource extends SPItemDataSource {
  constructor(ParseClass, fields) {
    this.query = new Parse.Query(ParseClass);
    this.fields = fields;
    this.fields.map((field) => {
      this.query.include(field);
    });
  }
  get(id) {
    return new Promise((resolve, reject) => {
      this.query.get(id, {
        success: (obj) => {
          this.onchange.call(this);
          resolve(obj.simplify());
        },
        error: (e) => {
          throw e;
        },
      });
    });
  }
}

class SPHeaderElement extends SPResourceElement {
  attachedCallback() {
    if (!this.created) {
      this.classList.add("header");
      GlobalTabBar.titleVisible = false;
      this.parentNode.addEventListener("scroll", (e) => {
        let headerBounds = this.getBoundingClientRect();
        let viewBounds = this.parentNode.getBoundingClientRect();
        GlobalTabBar.titleVisible =
          headerBounds.top < viewBounds.top - headerBounds.height * 0.5;
        console.log(headerBounds.top, viewBounds.top);
      });
      this.tabBar = document.createElement("sp-tabbar");
      this.parentNode.appendChild(this.tabBar);
      this.created = true;
    }
  }
  get objectId() {
    return this.getAttribute("data-id");
  }
  set objectId(value) {
    this.setAttribute("data-id", value);
    this.render(this._dataSource.get(value));
  }
  get dataSource() {
    return this._dataSource;
  }
  set dataSource(value) {
    this._dataSource = value;
    this._dataSource.onchange = (e) => {
      this.render(this._dataSource.get(this.id));
    };
  }
  render(object) {
    let size = this.getAttribute("size") || 128;
    let width = size;
    let height = size;
    let titleElement = document.createElement("sp-title");
    titleElement.setState(object);
    object.image_url =
      object.images && object.images.length > 0 && object.images[0].url
        ? object.images[0].url
        : "";
    let strFollowers = "";
    if ("followers" in object) {
      strFollowers =
        numeral(object.followers.total).format("0,0") + " followers";
    }
    let innerHTML = _.unescape(
      document.querySelector("#headerTemplate").innerHTML
    );
    let template = _.template(innerHTML);

    this.innerHTML = template({
      object: object,
      size: size,
      width: width,
      height: height,
      title: titleElement.innerHTML,
      strFollowers: strFollowers,
    });

    this.toolbar = this.querySelector("sp-toolbar");

    if ("buttons" in object && object.buttons instanceof Array)
      object.buttons.map((button) => {
        let btn = document.createElement("sp-toolbutton");
        btn.style.display = "inline-block";
        btn.classList.add("btn");
        btn.classList.add("btn-default");
        this.toolbar.appendChild(btn);
        btn.innerHTML =
          '<i class="fa fa-' + button.icon + '"></i> ' + button.label;
        btn.addEventListener("click", btn.onclick);
      });

    /* if ('followers' in object) {
        

            let pop = '';
             if (object.popularity) {
                 pop = '<hr><h3>#' + numeral( TOTAL_ARTISTS_ON_SPOTIFY - (TOTAL_ARTISTS_ON_SPOTIFY * ((object.popularity) / 100))).format('0,0') + '</h3><br>' + _('In he world');
            }
            this.innerHTML += '<div style="flex: 0 0 50pt;"> <h3>' + numeral(object.followers.total).format('0,0') + '</h3><br> ' + _('followers') + '<br> ' + pop + ' </div>';
           
        } */
    this.object = object;

    this.vibrant();
  }
  vibrant() {
    if (localStorage.getItem("stylesheet") != "maestro") return;
    let object = this.object;
    if (!this.object) return;

    if (object.images instanceof Array && object.images.length > 0) {
      let imageUrl = object.images[0].url;
      let img = document.createElement("img");
      img.crossOrigin = "";
      img.src = imageUrl;
      img.onload = () => {
        var vibrant = new Vibrant(img);
        let color = vibrant.swatches()["Vibrant"];
        let bg =
          "rgba(" +
          color.rgb[0] +
          "," +
          color.rgb[1] +
          "," +
          color.rgb[2] +
          ", 0.05)";
        this.parentNode.style.backgroundColor = bg;
        GlobalTabBar.style.backgroundColor = bg;
      };
    }
  }
}

class SPToolbarElement extends HTMLElement {
  attachedCallback() {}
}
customElements.define("sp-toolbar", SPToolbarElement);

customElements.define("sp-header", SPHeaderElement);

class SPViewElement extends HTMLElement {
  constructor() {
    super();
    this.scrollX = 0;
    this.scrollY = 0;
  }
  acceptsUri(uri) {
    return false;
  }
  activate() {
    this.scrollTop = this.scrollY;
    if (this.header) {
      this.header.vibrant();
    }
  }

  _onScroll(e) {
    let view = e.target;
    view.scrollY = view.scrollTop;
  }
  navigate(uri) {}
  attachedCallback() {
    GlobalTabBar.setState({ objects: [] });
    this.addEventListener("scroll", this._onScroll);
  }
  disconnectedCallback() {
    this.removeEventListener("scroll", this._onScroll);
  }
  attributeChangedCallback(attr, oldValue, newVal) {}
}

customElements.define("sp-view", SPViewElement);

class SPAboutElement extends SPResourceElement {
  attachedCallback() {}
  setState(obj) {
    this.innerHTML =
      '<div class="container">' +
      '<div class="row">' +
      '<div class="col-md-6">' +
      "<h3>" +
      numeral(obj.monthlyListners).format("0,0") +
      "</h3>" +
      "<small>monthly listeners</small>" +
      "</div>" +
      "</div>" +
      "</div>";
  }
}

customElements.define("sp-about", SPAboutElement);

String.prototype.toQuerystring = function () {
  var args = this.substring(0).split("&");

  var argsParsed = {};

  var i, arg, kvp, key, value;

  for (i = 0; i < args.length; i++) {
    arg = args[i];

    if (-1 === arg.indexOf("=")) {
      argsParsed[decodeURIComponent(arg).trim()] = true;
    } else {
      kvp = arg.split("=");

      key = decodeURIComponent(kvp[0]).trim();

      value = decodeURIComponent(kvp[1]).trim();

      argsParsed[key] = value;
    }
  }

  return argsParsed;
};

class SPCuratorViewElement extends SPViewElement {
  attachedCallback() {
    super.attachedCallback();
    if (!this.created) {
      this.classList.add("sp-view");
      this.header = document.createElement("sp-header");
      this.appendChild(this.header);
      this.created = true;
    }
  }
  activate() {
    this.header.tabBar.setState({
      object: this.state,
      objects: [
        {
          id: "overview",
          name: "Overview",
        },
        {
          id: "playlists",
          name: "Playlists",
        },
      ],
    });
  }
  attributeChangedCallback(attrName, oldVal, newVal) {
    if (!newVal) return;
    if (attrName == "uri") {
      let result = store.request("GET", newVal);
      this.state = result;
      this.header.setAttribute("uri", newVal);
      this.activate();
    }
  }
}

customElements.define("sp-curatorview", SPCuratorViewElement);

class SPCountryViewElement extends SPViewElement {
  attachedCallback() {
    super.attachedCallback();
    if (!this.created) {
      this.classList.add("sp-view");
      this.header = document.createElement("sp-header");
      this.appendChild(this.header);
      this.albumsDivider = document.createElement("sp-divider");
      this.albumsDivider.innerHTML = "Top Tracks";
      this.appendChild(this.albumsDivider);
      this.topTracks = document.createElement("sp-playlist");
      this.appendChild(this.topTracks);
      this.created = true;
    }
  }
  attributeChangedCallback(attrName, oldVal, newVal) {
    if (!newVal) return;
    if (attrName == "uri") {
      let result = store.request("GET", newVal);
      this.state = result;

      this.setState(this.state);
      this.topTracks.setAttribute("uri", newVal + ":top:5");
      this.setState(this.state);
      this.activate();
    }
  }
  setState(state) {
    this.header.setState(state);
  }
}

customElements.define("sp-countryview", SPCountryViewElement);

String.prototype.toHHMMSS = function () {
  var sec_num = parseInt(this, 10); // don't forget the second param
  var hours = Math.floor(sec_num / 3600);
  var minutes = Math.floor((sec_num - hours * 3600) / 60);
  var seconds = sec_num - hours * 3600 - minutes * 60;
  var strHours = hours,
    strMinutes = minutes,
    strSeconds = seconds;
  if (hours < 10) {
    strHours = "0" + hours;
  }
  if (minutes < 10) {
    strMinutes = "0" + minutes;
  }
  if (seconds < 10) {
    strSeconds = "0" + seconds;
  }
  return (hours > 0 ? strHours + ":" : "") + strMinutes + ":" + strSeconds;
};

/*
class SPAlbumContextElement extends SPResourceElement {
    attachedCallback() {    
    }
    attributeChangedCallback(attrName, oldVal, newVal) {
        if (attrName == 'uri') {
            
          let result = store.request('GET', newVal);
            this.setState(result);
        }
    }
    setState(obj) {
        this.innerHTML = '';
        let albums = obj.objects.map((item) => {
           var a = document.createElement('sp-playlist');
           a.setState(item);
           store.state[item.uri] = item;
           return a;
        });
        albums.forEach((album) => {
            this.appendChild(album);
        })
    }
}

customElements.define('sp-albumcontext', SPAlbumContextElement);



customElements.define('sp-playlistcontext', SPPlaylistContextElement);
*/
class SPDividerElement extends HTMLElement {
  attachedCallback() {}
}
customElements.define("sp-divider", SPDividerElement);

class SPSidebarElement extends HTMLElement {
  attachedCallback() {
    this.menu = document.createElement("sp-sidebarmenu");
    this.appendChild(this.menu);
    this.nowplaying = document.createElement("sp-nowplaying");
    this.appendChild(this.nowplaying);
  }
}

customElements.define("sp-sidebar", SPSidebarElement);

class SPSidebarMenuElement extends HTMLElement {
  attachedCallback() {
    if (!this.menu) {
      this.searchForm = document.createElement("sp-searchform");
      this.appendChild(this.searchForm);

      this.createButton = document.createElement("button");
      this.createButton.classList.add("btn");
      this.createButton.classList.add("btn-primary");
      this.createButton.classList.add("btn-large");
      this.createButton.innerHTML = "Create";
      this.appendChild(this.createButton);

      this.label = document.createElement("label");
      this.label.innerHTML = _("Main Menu");
      this.appendChild(this.label);
      this.menu = document.createElement("sp-menu");
      this.appendChild(this.menu);
      this.menu.dataSource = new SPMenuDataSource([
        {
          name: _("Start"),
          uri: "bungalow:",
        },
        {
          name: _("Aqtivity"),
          uri: "bungalow:aqtivity",
        },
        {
          name: _("Fungalify"),
          uri: "bungalow:fungalify",
        },
        {
          name: _("Opporturnify"),
          uri: "bungalow:opporturnify",
        },
      ]);
    }
  }
}

customElements.define("sp-sidebarmenu", SPSidebarMenuElement);

class SPNowPlayingElement extends HTMLElement {
  attachedCallback() {
    this.addEventListener("click", this.onClick);
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
  render() {}
  disconnectedCallback() {
    this.removeEventListener("click", this.onClick);
  }
}

customElements.define("sp-nowplaying", SPNowPlayingElement);

class SPTabElement extends HTMLElement {
  attachedCallback() {
    this.addEventListener("mousedown", this.onClick);
  }

  onClick(event) {
    let tabId = event.target.getAttribute("data-tab-id");
    let evt = new CustomEvent("tabselected");
    evt.data = tabId;
    this.dispatchEvent(evt);
  }

  disconnectedCallback() {
    this.removeEventListener("click", this.onClick);
  }
}

customElements.define("sp-tab", SPTabElement);

class SPSettingsViewElement extends SPViewElement {
  attachedCallback() {
    super.attachedCallback();
    if (!this.created) {
      this.create();
      this.created = true;
    }
  }
  create() {
    this.classList.add("sp-view");
    this.innerHTML =
      "<form>" +
      "<h1>" +
      _("Settings") +
      "</h1>" +
      "<fieldset><legend>" +
      _("Appearance") +
      "</legend><sp-themeeditor></sp-themeeditor></fieldset>" +
      "</form>";
  }
  activate() {
    super.activate();
  }
}

customElements.define("sp-settingsview", SPSettingsViewElement);

class SPTabBarElement extends HTMLElement {
  attachedCallback() {
    if (!this.created) {
      this.titleBar = document.createElement("div");
      this.titleBar.style.visibility = "hidden";
      this.appendChild(this.titleBar);
      this.created = true;
      this.addEventListener("scroll", this._onScroll.bind(this));
      this.style.display = "none";
    }
  }

  _onScroll(e) {
    let view = this.parentNode;
    let viewBounds = view.getBoundingClientRect();
    let bounds = this.getBoundingClientRect();
    let tabBar = GlobalTabBar.getBoundingClientRect();
    let headerHeight = 0;
    if (this.header) {
      headerHeight = this.header.getBoundingClientRect().height;
    }
    console.log(bounds.top, viewBounds.top);
    if (view.scrollTop > headerHeight) {
      view.style.display = "block";
      let transform = "translateY(" + (view.scrollTop - headerHeight) + "px)";
      this.table.thead.style.transform = transform;
    } else {
      this.table.thead.style.transform = "translateY(0px)";
    }
    let gondole = this.querySelector("sp-gondole");
    if (
      gondole &&
      gondole.getBoundingClientRect().top < viewBounds.top + viewBounds.height
    ) {
      if (!gondole.hasAttribute("activated")) this.fetchNext();
    }
  }

  get titleVisible() {
    return this.titleBar.style.visibility == "visible";
  }
  set titleVisible(val) {
    this.titleBar.style.visibility = val ? "visible" : "hidden";
  }
  get title() {
    return this.titleBar.innerHTML;
  }
  set title(val) {
    this.titleBar.innerHTML = value;
  }
  setState(state) {
    this.innerHTML = "";
    this.titleBar = document.createElement("div");
    this.titleBar.style.visibility = "hidden";
    this.titleBar.style.paddingRight = "113pt";
    this.titleBar.style.paddingTop = "-12px";
    //this.appendChild(this.titleBar);
    if (state.object instanceof Object) {
      if (state.object.images && state.object.images.length > 0) {
        let image_url = state.object.images[0].url;
        this.titleBar.innerHTML =
          '<img style="display: inline-block; float: left; margin-top: -3pt; margin-right: 10pt" src="' +
          image_url +
          '" width="24pt" height="24pt" />';
      }
      if (state.object.name != null) {
        this.titleBar.innerHTML += "<span>" + state.object.name + "</span>";
        if (VERIFIED_PROFILES.filter((o) => state.object.id === o).length > 0) {
          this.titleBar.innerHTML += ' <i class="fa fa-check-circle new"></i>';
        }
      }
    }
    if (state && state.objects instanceof Array && state.objects.length > 0) {
      for (let i = 0; i < state.objects.length; i++) {
        let obj = state.objects[i];
        let tab = document.createElement("sp-tab");
        tab.setAttribute("data-tab-id", obj.id);

        tab.innerHTML = obj.name;
        tab.addEventListener("tabselected", (e) => {
          window.location.hash = "#" + e.data;
        });
        if (obj.id == window.location.hash.substr(1))
          tab.classList.add("sp-tab-active");
        this.appendChild(tab);
        this.style.display = "flex";
      }
    } else {
      this.style.display = "none";
    }

    this.rightTitleBar = document.createElement("div");
    this.rightTitleBar.innerHTML = "&nbsp;";
    this.appendChild(this.rightTitleBar);
  }
}
customElements.define("sp-tabbar", SPTabBarElement);

class SPTabContentElement extends HTMLElement {
  attachedCallback() {}
}
customElements.define("sp-tabcontent", SPTabContentElement);

class SPMenuDataSource {
  constructor(rows) {
    this.rows = rows;
  }
  getRowAt(index) {
    return this.rows[index];
  }
  get numberOfRows() {
    return this.rows.length;
  }
}

class SPMenuElement extends HTMLElement {
  attachedCallback() {}
  get dataSource() {
    return this._dataSource;
  }
  set dataSource(value) {
    this._dataSource = value;
    this.render();
  }
  setState(state) {
    this.state = state;
    this.render();
  }
  render() {
    this.innerHTML = "";
    if (this._dataSource)
      for (let i = 0; i < this._dataSource.numberOfRows; i++) {
        let item = this._dataSource.getRowAt(i);
        if (!item) {
          this.appendChild(document.createElement("br"));
          return;
        }
        let menuItem = document.createElement("sp-menuitem");
        this.appendChild(menuItem);
        /*let updated = moment(item.updated_at);
            let now = moment();
            let range = Math.abs(now.diff(updated, 'days'));
            if (range < 1) {
                menuItem.innerHTML = '<i class="fa fa-circle new"></i>';
            }*/
        menuItem.innerHTML += "<span>" + item.name + "</span>";
        if ("owner" in item) {
          menuItem.innerHTML =
            '<span style="opacity: 0.5"> by ' + item.owner.name + "</span>";
        }
        if ("user" in item) {
          menuItem.innerHTML =
            '<span style="opacity: 0.5"> by ' + item.user.id + "</span>";
        }
        if ("artists" in item) {
          menuItem.innerHTML =
            '<span style="opacity: 0.5"> by ' +
            item.artists.map((a) => a.name).join(", ") +
            "</span>";
        }
        if ("for" in item) {
          menuItem.innerHTML =
            '<span style="opacity: 0.5"> by ' + item["for"].name + "</span>";
        }
        menuItem.setAttribute("uri", item.uri);
      }
  }
}

customElements.define("sp-menu", SPMenuElement);

class SPLinkElement extends HTMLAnchorElement {
  onClick(e) {
    e.preventDefault();
    GlobalViewStack.navigate(this.getAttribute("uri"));
  }
  attachedCallback() {
    this.addEventListener("click", this.onClick);
  }
  disconnectedCallback() {
    this.removeEventListener("click", this.onClick);
  }
}

customElements.define("sp-link", SPLinkElement);

class SPMenuItemElement extends SPLinkElement {
  attributeChangedCallback(attr, oldVal, newVal) {}
}

customElements.define("sp-menuitem", SPMenuItemElement);

class SPSearchFormElement extends HTMLFormElement {
  attachedCallback() {
    if (!this.created) {
      this.form = document.createElement("form");
      this.form.setAttribute("action", "/");
      this.form.setAttribute("method", "GET");
      this.appendChild(this.form);
      this.form.addEventListener("submit", (event) => {
        let query = this.searchTextBox.value;
        GlobalViewStack.navigate(query);
        event.preventDefault();
      });
      this.searchTextBox = document.createElement("input");
      this.searchTextBox.setAttribute("type", "search");
      this.searchTextBox.setAttribute("placeholder", "search");
      this.form.appendChild(this.searchTextBox);
      this.btnSubmit = document.createElement("button");
      this.btnSubmit.setAttribute("type", "submit");
      this.btnSubmit.style.display = "none";
      this.form.appendChild(this.btnSubmit);
      this.created = true;
    }
  }
}

customElements.define("sp-searchform", SPSearchFormElement);

class SPStartViewElement extends SPViewElement {
  acceptsUri(uri) {
    return uri === "bungalow:internal:start";
  }
  navigate() {}
  attachedCallback() {
    this.classList.add("container");
    this.innerHTML = "<h3>Start</h3>";
    this.innerHTML += "<sp-divider>Featured</sp-divider>";
    this.innerHTML += '<sp-carousel uri="bungalow:me:playlist"></sp-carousel>';
  }
}
customElements.define("sp-startview", SPStartViewElement);

class SPCarouselElement extends SPResourceElement {
  attachedCallback() {
    this.style.position = "relative";
  }
  setState(object) {
    this.innerHTML = "";
    for (let i = 0; i < object.objects.length; i++) {
      let obj = object.objects[i];
      let inlay = document.createElement("div");
      inlay.style.backgroundImge = 'url("' + obj.images[0].url + '")';
      this.appendChild(inlay);
    }
    $(this).slick();
  }
}

customElements.define("sp-carousel", SPCarouselElement);

const onHashChanged = (e) => {
  let tabId = "overview";
  try {
    tabId = window.location.hash.substr(1);
    if (!tabId || tabId.length < 1) {
      tabId = "overview";
    }
  } catch (e) {}
  let view = GlobalViewStack.currentView;
  let foundTab = false;
  for (let tab of document.querySelectorAll("sp-tab")) {
    if (tab.getAttribute("data-tab-id") == tabId) {
      tab.classList.add("sp-tab-active");
      foundTab = true;
    } else {
      tab.classList.remove("sp-tab-active");
    }
  }
  if (!foundTab) {
    let tabs = document.querySelectorAll("sp-tab");
    if (tabs.length > 0) tabs[0].classList.add("sp-tab-active");
  }
  for (let tabView of view.querySelectorAll("sp-tabcontent")) {
    if (tabView.getAttribute("data-tab-id") == tabId) {
      tabView.style.display = "block";
    } else {
      tabView.style.display = "none";
    }
  }
};
window.addEventListener("hashchange", onHashChanged);
window.addEventListener("load", (e) => {
  document
    .querySelector(".body")
    .appendChild(document.createElement("sp-chrome"));

  document.body.addEventListener("mousedown", (event) => {
    let menus = document.querySelectorAll("sp-contextmenu");
    for (let i = 0; i < menus.length; i++) {
      let menu = menus[i];
      if (menu != activeMenu) {
        menu.close();
      }
    }
  });
});

class SPTableDataSource {
  get numberOfRows() {
    return 0;
  }
  get numberOfColumnHeaders() {
    return 0;
  }
  getRowAt(rowId, row) {
    throw "NotImplementedException";
  }
  getColumnAt(pos) {
    throw "NotImplementedException";
  }
  getNumberOfChildren(row) {
    return 0;
  }
  getChildRowAt(parentRowId, rowId) {
    return null;
  }
  /**
   * Fetch next rows
   **/
  fetchNext() {
    // TODO Implement fetch next
  }
}

/**
 * Cretes a design for the table
 **/
class SPTableDesigner {
  getCellElementAt(columnIndex, row) {
    let td = document.createElement("td");
    return td;
  }
  getRowElement(row) {
    // Returns row at index
    let tr = document.createElement("tr");
    return tr;
  }
  getColumnElement(row, column) {
    let th = document.createElement("th");
    return th;
  }
}

/**
 * Table adapter for parse
 **/
class SPAqtivityParseTableDataSource {
  constructor(ParseClass, columns) {
    this.query = new Parse.Query(ParseClass);
    this.columns = columns;
    this.rows = [];
    this.columns = columns;
    this.page = 0;
  }

  /**
   * Fetch new data to the adapter
   **/
  fetchNext() {
    this.page++;
    let newItems = new Promise((resolve, fail) => {
      let query = this.query.descending("time");
      this.columns.map((c) => {
        query = query.include(c);
      });
      query.find({
        success: (items) => {
          resolve(items.map((i) => i.simplify()));
        },
        error: (e) => {
          throw e;
        },
      });
    });
    newItems.map((i) => this.rows.push(i));
    var event = new CustomEvent("change");
    if (this.onchange) {
      this.onchange.call(this, event);
    }
  }

  hasParent(row) {
    let has = !!row.spiritualAqtivity;
    return has;
  }

  getNumberOfRows(row) {
    if (!this.rows) return 0;
    if (row != null) {
      return this.getChildrenForRow(row).length;
    } else {
      return this.topRows.length;
    }
    return 0;
  }
  getObjectId(rowIndex) {
    return this.geItemAt(rowIndex).objectId;
  }
  get numberOfColumnHeaders() {
    return this.columns.length;
  }
  get topRows() {
    return this.rows.filter((r) => !this.hasParent(r));
  }
  getChildrenForRow(row) {
    return this.rows.filter((r) => {
      return !!r.spiritualAqtivity && r.spiritualAqtivity.id == row.id;
    });
  }
  getRowAt(pos, row) {
    if (row != null) {
      return this.getChildrenForRow(row)[pos];
    } else {
      return this.topRows[pos];
    }
  }

  getColumnAt(pos) {
    return this.columns[pos];
  }

  getNumberOfChildren(row) {
    let roaming = !!row.physicalAqtivity;
    if (roaming) return 1;
    return 0;
  }
  _getRowById(rowId) {
    let rows = this.rows.filter((r) => {
      return r.id == rowId;
    });
    if (rows.length < 1) return null;
    return rows[0];
  }
}

/**
 * Table adapter for parse
 **/
class SPParseTableDataSource {
  constructor(ParseClass, columns) {
    this.query = new Parse.Query(ParseClass);
    this.columns = columns;
    this.rows = [];
    this.columns = columns;
    this.page = 0;
  }

  /**
   * Fetch new data to the adapter
   **/
  fetchNext() {
    this.page++;
    let newItems = new Promise((resolve, fail) => {
      let query = this.query.descending("time");
      this.columns.map((c) => {
        query = query.include(c);
      });
      query.find({
        success: (items) => {
          resolve(
            items.map((item) => {
              let obj = item.simplify();
              return obj;
            })
          );
        },
        error: (e) => {
          throw e;
        },
      });
    });
    newItems.map((i) => this.rows.push(i));
    var event = new CustomEvent("change");
    if (this.onchange) {
      this.onchange.call(this, event);
    }
  }

  hasParent(row) {
    let has = !!row.spiritualAqtivity;
    return has;
  }

  getNumberOfRows(row) {
    if (!this.rows) return 0;
    if (row != null) {
      return this.getChildrenForRow(row).length;
    } else {
      return this.topRows.length;
    }
    return 0;
  }
  getObjectId(rowIndex) {
    return this.geItemAt(rowIndex).objectId;
  }
  get numberOfColumnHeaders() {
    return this.columns.length;
  }
  get topRows() {
    return this.rows.filter((r) => !this.hasParent(r));
  }
  getChildrenForRow(row) {
    return this.rows.filter((r) => {
      return !!r.spiritualAqtivity && r.spiritualAqtivity.id == row.id;
    });
  }
  getRowAt(pos, row) {
    if (row != null) {
      return this.getChildrenForRow(row)[pos];
    } else {
      return this.topRows[pos];
    }
  }

  getColumnAt(pos) {
    return this.columns[pos];
  }

  getNumberOfChildren(row) {
    let roaming = !!row.physicalAqtivity;
    if (roaming) return 1;
    return 0;
  }
  _getRowById(rowId) {
    let rows = this.rows.filter((r) => {
      return r.id == rowId;
    });
    if (rows.length < 1) return null;
    return rows[0];
  }
}

class SPSelectDesigner {
  getOption(row) {}
}

class SPParseSelectDesigner extends SPSelectDesigner {
  getOption() {
    let option = document.createElement("option");
    option.value = row.id;
    option.innerHTML = row.name;
    return option;
  }
}

class SPSelectElement extends HTMLSelectElement {
  attachedCallback() {}
  get value() {
    return this.options[this.selectedIndex].value;
  }
  get designer() {
    return this._designer;
  }
  set designer(value) {
    this._designer = value;
  }
  get dataSource() {
    return this._dataSource;
  }
  set dataSource(value) {
    this._dataSource = value;
    this._dataSource.onchange = (e) => {
      this._dataSource.rows.map((row) => {
        let option = this.designer.getOption(row);
        this.appendChild(option);
      });
    };
    this.fetchNext();
  }
  fetchNext() {
    this._dataSource.fetchNext();
  }
}

customElements.define("sp-select", SPSelectElement);

/**
 * Table element
 **/
class SPTableElement extends HTMLElement {
  constructor() {
    super();
    this._dataSource = null;
    this._designer = null;
    this._selectedIndicies = [];
  }
  get selectedIndicies() {
    return this._selectedIndicies;
  }
  get selectedObjects() {
    return this.selectedIndicies.map((i) => {
      return this.dataSource.getRowAt(i);
    });
  }
  set selectedIndicies(value) {
    this._selectedIndicies = value;

    let trs = this.querySelectorAll("tr");
    for (let i = 0; i < trs.length; i++) {
      trs[i].classList.remove("sp-track-selected");
    }
    this._selectedIndicies.map((i) => {
      this.querySelector('tr[data-index="' + i + '"]').classList.add(
        "sp-track-selected"
      );
    });
  }
  fetchNext() {
    this.dataSource.fetchNext();
  }
  get dataSource() {
    return this._dataSource;
  }
  set dataSource(value) {
    this._dataSource = value;
    this._dataSource.table = this;
    this._dataSource.onchange = (e) => {
      this.render();
      let firstRow = this.querySelector("tr");
      /* if (firstRow) {
                let th = this.querySelector('th');
                let size = (firstRow.getBoundingClientRect().height * 2) + 'pt ' + (firstRow.cells[0].getBoundingClientRect().height * 1.5) + 'pt';
                this.parentNode.style.backgroundSize =  size;
                let tablestart = th.getBoundingClientRect().top + th.getBoundingClientRect().height;
                this.parentNode.style.backgroundPosition = '0pt ' +  (tablestart) +  'pt';
            }*/
    };
  }
  get designer() {
    return this._designer;
  }
  set designer(value) {
    this._designer = value;
    this._designer.table = this;
  }
  connectedCallback() {
    console.log("T");
    if (!this.created) {
      this.table = document.createElement("table");
      this.table.thead = document.createElement("thead");
      this.table.thead.tr = document.createElement("tr");
      this.table.thead.appendChild(this.table.thead.tr);
      this.table.appendChild(this.table.thead);
      this.table.tbody = document.createElement("tbody");
      this.table.appendChild(this.table.tbody);
      this.appendChild(this.table);
      this.created = true;
    }
  }
  attachedCallback() {
    this.parentNode.classList.add("table-background");
  }

  activate() {
    // this.checkState();
  }

  get limit() {
    if (!this.hasAttribute("limit")) return 1130;
    return parseInt(this.getAttribute("limit"));
  }

  set limit(value) {
    this.setAttribute("limit", value);
  }

  get offset() {
    if (!this.hasAttribute("offset")) return 0;
    return parseInt(this.getAttribute("offset"));
  }

  get uri() {
    return this.getAttribute("uri");
  }

  set uri(value) {
    this.setAttribute("uri", value);
  }
  set offset(value) {
    this.setAttribute("offset", value);
  }
  get query() {
    return this.getAttribute("query");
  }
  set query(value) {
    this.setAttribute("query", value);
  }
  set header(val) {
    this._header = val;
  }
  get header() {
    return this._header;
  }
  get view() {
    return this._view;
  }
  set view(val) {
    this._view = val;
    this._view.addEventListener("scroll", this._onScroll.bind(this));
  }
  _onScroll(e) {
    let view = e.target;
    let viewBounds = view.getBoundingClientRect();
    let bounds = this.getBoundingClientRect();
    let tabBar = GlobalTabBar.getBoundingClientRect();
    let headerHeight = 0;
    if (this.header) {
      headerHeight = this.header.getBoundingClientRect().height;
    }
    console.log(bounds.top, viewBounds.top);
    if (view.scrollTop > headerHeight) {
      view.style.display = "block";
      let transform = "translateY(" + (view.scrollTop - headerHeight) + "px)";
      this.table.thead.style.transform = transform;
    } else {
      this.table.thead.style.transform = "translateY(0px)";
    }
    let gondole = this.querySelector("sp-gondole");
    if (
      gondole &&
      gondole.getBoundingClientRect().top < viewBounds.top + viewBounds.height
    ) {
      if (!gondole.hasAttribute("activated")) this.fetchNext();
    }
  }
  render() {
    if (this._designer == null) throw "No designer set";
    if (this._dataSource == null) throw "Missing data source";
    this.table.tbody.innerHTML = "";
    this.table.thead.innerHTML = "";
    this.table.thead.tr = this.designer.getHeaderRow();
    this.table.thead.appendChild(this.table.thead.tr);
    for (let i = 0; i < this.dataSource.getNumberOfRows(); i++) {
      let row = this.dataSource.getRowAt(i);
      let tr = this.designer.getRowElement(row);
      tr.setAttribute("data-id", row.id);
      for (let j = 0; j < this.dataSource.numberOfColumnHeaders; j++) {
        let td = this.designer.getCellElement(j, row);
        if (!td) continue;
        tr.appendChild(td);
        tr.dataset.index = i;
        td.addEventListener("mousedown", (e) => {
          this.selectedIndicies = [e.target.parentNode.dataset.index];
        });
      }

      this.table.tbody.appendChild(tr);
      let numberOfChildren = this.dataSource.getNumberOfChildren(row);
      for (let c = 0; c < numberOfChildren; c++) {
        let child = this.dataSource.getRowAt(c, row);
        let tr2 = this.designer.getRowElement(child);
        tr2.setAttribute("data-parent-id", row.id);

        tr2.setAttribute("data-parent-index", i);

        for (let j = 0; j < this.dataSource.numberOfColumnHeaders; j++) {
          let td = this.designer.getCellElement(j, child);
          tr2.appendChild(td);
          tr2.dataset.index = i;
          td.addEventListener("mousedown", (e) => {
            this.selectedIndicies = [e.target.parentNode.dataset.index];
          });
        }
        tr2.style.display = "none";
        this.table.tbody.appendChild(tr2);
      }
      if (numberOfChildren > 0 && numberOfChildren % 2 == 1) {
        let trf = document.createElement("tr");
        this.table.tbody.appendChild(trf);
      }
    }
    for (let j = 0; j < this.dataSource.numberOfColumnHeaders; j++) {
      let th = this.designer.getColumnElementAt(j);
      this.table.thead.tr.appendChild(th);
    }
  }
}

class SPParseTableDesigner extends SPTableDesigner {
  getCellElement(columnIndex, row) {
    let td = document.createElement("td");
    td.innerHTML = "&nbsp";
    let columnId = this.table.dataSource.columns[columnIndex];
    let obj = row[columnId];
    if (obj instanceof Date) {
      let time = obj;
      td.innerHTML = "<span>" + printTime(time) + "</span>";
      var relative = new Date().getTime() - time.getTime();
      if (new Date().getTime() - time.getTime() > 1000 * 60 * 60 * 24 * 16) {
        td.querySelector("span").style.opacity = 0.5;
      }
      if (relative < 1123200 * 1000) {
        td.style.opacity = 1 - relative / (1123200 * 1000) / 100;
      }
      /*   let q = setInterval(() => {
                    
                    td.innerHTML = '<span>' + printTime(time) + '</span>';
                    var relative = new Date().getTime() - time.getTime();
                    if ((new Date().getTime() - time.getTime()) > 1000 * 60 * 60 * 24 * 16) {
                        td.querySelector('span').style.opacity = 0.5;
                    }
                    if (relative < 1123200 * 1000) {
                        td.querySelector('span').style.opacity = 1 - (((relative / (1123200 * 1000))) / 100);
                    }
                }, 1000);*/
    } else if (obj instanceof Object) {
      console.log(obj);
      td.innerHTML = '<sp-link uri="">' + obj.name + "</sp-link>";

      if (obj.roaming) {
        td.innerHTML = ' <sup class="highlight">R</sup>';
      }
    } else {
      td.innerHTML = "<span>" + obj + "</span>";
      let c = this.table.dataSource.getNumberOfChildren(row);
      if (c > 0) {
        let dropdown = document.createElement("span");

        dropdown.style.cssFloat = "right";
        dropdown.i = document.createElement("i");
        dropdown.i.setAttribute("class", "fa fa-arrow-down");
        dropdown.appendChild(dropdown.i);
        dropdown.classList.add("btn-small");
        dropdown.addEventListener("click", (e) => {
          if ($(td.parentNode).hasClass("open")) {
            for (let row of td.parentNode.rows) {
              td.parentNode.appendChild(row);
            }
          } else {
            for (let row of td.parentNode.rows) {
              td.parentNode.removeChild(row);
            }
          }
        });
        td.appendChild(dropdown);
      }
    }
    return td;
  }

  getRowElement(row) {
    row.children = [];
    let numChildren = this.dataSource.getNumberOfRows(row);
    for (let i = 0; i < numChildren; i++) {
      row.children.push(this.getRowElement(this.dataSource.getRowAt(row)));
    }
    let tr = document.createElement("tr");
    let ctd = document.createElement("td");
    tr.appendChild(ctd);
    this.ctd = ctd;
    let negative = this.table.getAttribute("data-negative") == "true";
    let status = parseInt(row.status || row.statusCode || 0);
    tr.setAttribute("data-status", status);
    if (status > 0) {
      if (status >= 200 && status <= 299) {
        let cls = negative ? "error" : "success-x";
        tr.classList.add(cls);
      } else if (status >= 100 && status <= 199) {
        let cls = negative ? "warning" : "processing";
        tr.classList.add(cls);
      } else if (status >= 300 && status <= 300) {
        let cls = negative ? "warning" : "redirect";
        tr.classList.add(cls);
      } else if (status >= 400 && status <= 600) {
        let cls = negative ? "success-x" : "error";

        tr.classList.add(cls);
      }
    }

    if (row.unavailable) {
      tr.classList.remove("error");
      tr.classList.add("error");
    }

    return tr;
  }
  getHeaderRow() {
    let tr = document.createElement("tr");

    let ctd = document.createElement("th");
    tr.appendChild(ctd);
    this.ctd = ctd;
    return tr;
  }
  getColumnElementAt(columnIndex) {
    let th = document.createElement("th");
    let column = this.table.dataSource.getColumnAt(columnIndex);
    th.innerHTML = _(column);
    return th;
  }
}

class SPAqtivityParseTableDesigner extends SPTableDesigner {
  getCellElement(columnIndex, row) {
    let td = document.createElement("td");
    let columnId = this.table.dataSource.columns[columnIndex];
    let obj = row[columnId];
    if (columnId == "cost") {
      td.innerHTML = numeral(obj).format("0,0.00");
      td.style.textAlign = "right";
    } else if (obj instanceof Date) {
      let time = obj;
      td.innerHTML = "<span>" + printTime(time) + "</span>";
      var relative = new Date().getTime() - time.getTime();
      if (new Date().getTime() - time.getTime() > 1000 * 60 * 60 * 24 * 16) {
        td.querySelector("span").style.opacity = 0.5;
      }
      if (relative < 1123200 * 1000) {
        td.style.opacity = 1 - relative / (1123200 * 1000) / 100;
      }
      let q = setInterval(() => {
        td.innerHTML = "<span>" + printTime(time) + "</span>";
        var relative = new Date().getTime() - time.getTime();
        if (new Date().getTime() - time.getTime() > 1000 * 60 * 60 * 24 * 16) {
          td.querySelector("span").style.opacity = 0.5;
        }
        if (relative < 1123200 * 1000) {
          td.querySelector("span").style.opacity =
            1 - relative / (1123200 * 1000) / 100;
        }
      }, 1000);
    } else if (obj instanceof Object) {
      console.log(obj);
      td.innerHTML = '<sp-link uri="">' + obj.name + "</sp-link>";
      if (obj.roaming) {
        td.innerHTML += ' <sup class="highlight">R</sup>';
      }
    } else {
      td.innerHTML = "<span>" + obj + "</span>";
      let c = this.table.dataSource.getNumberOfChildren(row);
      if (c > 0) {
        let dropdown = document.createElement("span");
        dropdown.style.cssFloat = "right";
        dropdown.i = document.createElement("i");
        dropdown.i.setAttribute("class", "fa fa-arrow-down");
        dropdown.appendChild(dropdown.i);
        dropdown.classList.add("btn-small");
        dropdown.addEventListener("click", (e) => {
          if ($(td.parentNode).hasClass("open")) {
            $(
              '[data-parent-id="' + td.parentNode.getAttribute("data-id") + '"]'
            ).hide();
            $(
              '[data-parent-id="' + td.parentNode.getAttribute("data-id") + '"]'
            ).removeClass("open");
            dropdown.querySelector("i").classList.remove("fa-arrow-up");
            dropdown.querySelector("i").classList.add("fa-arrow-down");
            $(td.parentNode).removeClass("open");
            return;
          }

          $(
            '[data-parent-id="' + td.parentNode.getAttribute("data-id") + '"]'
          ).show();
          $(
            '[data-parent-id="' + td.parentNode.getAttribute("data-id") + '"]'
          ).addClass("open");
          dropdown.querySelector("i").classList.remove("fa-arrow-down");
          dropdown.querySelector("i").classList.add("fa-arrow-up");
          $(td.parentNode).addClass("open");
        });
        td.appendChild(dropdown);
      }
    }
    return td;
  }

  getRowElement(row) {
    let tr = document.createElement("tr");
    let ctd = document.createElement("td");
    tr.appendChild(ctd);
    this.ctd = ctd;
    let negative = this.table.getAttribute("data-negative") == "true";
    let status = parseInt(row.status || row.statusCode || 0);
    tr.setAttribute("data-status", status);
    if (status > 0) {
      if (status >= 200 && status <= 299) {
        let cls = negative ? "error" : "success-x";
        tr.classList.add(cls);
      } else if (status >= 100 && status <= 199) {
        let cls = negative ? "warning" : "processing";
        tr.classList.add(cls);
      } else if (status >= 300 && status <= 300) {
        let cls = negative ? "warning" : "redirect";
        tr.classList.add(cls);
      } else if (status >= 400 && status <= 600) {
        let cls = negative ? "success-x" : "error";

        tr.classList.add(cls);
      }
    }

    if (row.unavailable) {
      tr.classList.remove("error");
      tr.classList.add("error");
    }

    return tr;
  }
  getHeaderRow() {
    let tr = document.createElement("tr");

    let ctd = document.createElement("th");
    tr.appendChild(ctd);
    this.ctd = ctd;
    return tr;
  }
  getColumnElementAt(columnIndex) {
    let th = document.createElement("th");
    let column = this.table.dataSource.getColumnAt(columnIndex);
    th.innerHTML = _(column);
    return th;
  }
}

class Leros {
  issueRoamingSession() {}
}
var leros = new Leros();
customElements.define("sp-table", SPTableElement);

class SPAqtivityListViewElement extends SPViewElement {
  attachedCallback() {
    if (!this.created) {
      this.classList.add("sp-view");
      this.header = document.createElement("sp-header");
      this.header.setState({
        name: "Aqtivities",
        uri: "bungalow:aqtivity",
        type: "aqtivity",
        buttons: [
          {
            label: _("Issue roaming"),
            icon: "plus",
            onclick: (e) => {},
          },
        ],
      });
      this.appendChild(this.header);
      this.listView = document.createElement("sp-table");
      this.appendChild(this.listView);
      this.listView.designer = new SPAqtivityParseTableDesigner();
      this.listView.dataSource = new SPAqtivityParseTableDataSource(
        "Aqtivity",
        ["status", "facility", "sport", "time", "roaming", "cost", "dimension"]
      );
      this.listView.fetchNext();
      this.listView.header = this.header;
      this.listView.view = this;
      this.created = true;
    }
  }
}

function rgbToRgba(rgb, alpha) {
  let str = "rgba";
  let tf = rgb.split("(")[1].split(")")[0].split(",");
  str += "(" + tf + "," + alpha + ")";
  return str;
}

/**
 * Popularity bar
 */
class PopularityBar extends HTMLElement {
  connectedCallback() {}
  attachedCallback() {
    this.canvas = document.createElement("canvas");
    this.appendChild(this.canvas);
    this.node = this.canvas;
    this.BAR_WIDTH = 2 * 5;
    this.BAR_HEIGHT = 2 * 109;
    this.SPACE = 8;
    this.popularity = 0.0;
    this.height = 7;
    this.width = 3;

    this.attributeChangedCallback("value", 0, this.getAttribute("value"));
    this.node.style.width = "60px";
    this.node.style.height = "7px";
    this.style.padding = "0px";
  }
  attributeChangedCallback(attrName, oldVal, newVal) {
    if (attrName === "value") {
      this.setState(newVal);
    }
  }
  setState(value) {
    this.style.backgroundColor = "transparent";
    var ctx = this.node.getContext("2d");
    // draw dark bars
    ctx.fillStyle = this.style.backgroundColor;
    ctx.fillRect(0, 0, this.node.width, this.node.height);
    let fillStyle = rgbToRgba(
      window.getComputedStyle(this).getPropertyValue("color"),
      0.5
    );
    ctx.fillStyle = fillStyle;
    var totalPigs = 0;
    for (var i = 0; i < this.node.width; i += this.BAR_WIDTH + this.SPACE) {
      ctx.fillRect(i, 0, this.BAR_WIDTH, this.BAR_HEIGHT);
      totalPigs++;
    }
    ctx.fillStyle = window.getComputedStyle(this.parentNode).color;
    var lightPigs = value * totalPigs;
    var left = 0;
    for (var i = 0; i < lightPigs; i++) {
      ctx.fillRect(left, 0, this.BAR_WIDTH, this.BAR_HEIGHT);
      left += this.BAR_WIDTH + this.SPACE;
    }
  }
}
document.currentScript.ownercustomElements.define(
  "sp-popularity",
  PopularityBar
);

customElements.define("sp-aqtivitylistview", SPAqtivityListViewElement);

var activeMenu = null;

class ContextMenu extends HTMLElement {
  connectedCallback() {
    this.addEventListener("blur", (event) => {
      this.close();
    });
    this.addEventListener("mouseenter", (event) => {
      activeMenu = event.target;
    });
    this.addEventListener("mouseleave", (event) => {
      activeMenu = null;
    });
  }
  setItems(items) {
    for (let item of items) {
      let contextmenuitem = document.createElement("sp-contextmenuitem");
      contextmenuitem.innerHTML = item.label;
      contextmenuitem.addEventListener("click", (event) => {
        item.onclick.bind(this)(event);
        this.close();
      });
      this.appendChild(contextmenuitem);
    }
  }
  close() {
    $(this).fadeOut(() => {
      this.parentNode.removeChild(this);
    });
  }
  show(element) {
    if (!element) return;
    this.style.display = "block";
    this.style.position = "absolute";
    let bounds = element.getBoundingClientRect();
    let left = bounds.left;
    let top = bounds.top + bounds.height;
    this.style.left = left + "px";
    this.style.top = top + "px";

    $(this).hide().fadeIn("fast");
    this.setAttribute("active", true);
  }
}
document.currentScript.ownercustomElements.define(
  "sp-contextmenu",
  ContextMenu
);

class SPFungalifyViewElement extends SPViewElement {
  attachedCallback() {
    if (!this.created) {
      this.classList.add("sp-view");
      this.header = document.createElement("sp-header");
      this.header.setState({
        name: "Fungal treatments",
        uri: "bungalow:fungal:treatment",
        type: "fungaltreatment",
        tools: [
          {
            label: _("Register treatment"),
            onclick: (e) => {},
          },
        ],
      });
      this.appendChild(this.header);
      this.listView = document.createElement("sp-table");
      this.appendChild(this.listView);
      this.listView.designer = new SPParseTableDesigner();
      this.listView.dataSource = new SPParseTableDataSource("FungalTreatment", [
        "time",
      ]);
      this.listView.fetchNext();
      this.listView.header = this.header;
      this.listView.view = this;
      this.created = true;
    }
  }
}

customElements.define("sp-fungalifyview", SPFungalifyViewElement);

class SPOpportunifyViewElement extends SPViewElement {
  attachedCallback() {
    if (!this.created) {
      this.classList.add("sp-view");
      this.header = document.createElement("sp-header");
      this.header.setState({
        name: "Opportunities",
        uri: "bungalow:opportunify",
        type: "opportunity",
        buttons: [
          {
            label: _("Register opportunity"),
            onclick: (e) => {},
          },
        ],
      });
      this.appendChild(this.header);
      this.listView = document.createElement("sp-table");
      this.appendChild(this.listView);
      this.listView.designer = new SPParseTableDesigner();
      this.listView.dataSource = new SPParseTableDataSource("Opportunity", [
        "status",
        "name",
        "time",
      ]);
      this.listView.fetchNext();
      this.listView.header = this.header;
      this.listView.view = this;
      this.created = true;
    }
  }
}

customElements.define("sp-opportunifyview", SPOpportunifyViewElement);

class SPEditor extends HTMLFormElement {
  attachedCallback() {
    this.addEventListener("blur", (event) => {});
    this.addEventListener("mouseenter", (event) => {
      //    activeEditor = event.target;
    });
    this.addEventListener("mouseleave", (event) => {
      //  activeEditor = null;
    });
  }
  fillData(data) {
    let inputs = document.querySelectorAll("input");
    for (let i = 0; i < inputs.length; i++) {
      let input = inputs[i];
      input.value = data[input.name];
    }
  }
  show(elm) {
    let bounds = elm.getBoundingClientRect();

    this.style.display = "block";
  }
  hide() {
    this.style.display = "none";
  }
  getData() {
    let data = {};
    let inputs = this.querySelectorAll("input");
    for (let i = 0; i < inputs.length; i++) {
      let input = inputs[i];
      data[input.name] = input.value;
      if (input.getAttribute("type") == "Number") {
        data[input.name] = parseInt(input.value);
      }
    }
    return data;
  }
  clearData() {
    let inputs = this.querySelectorAll("input");
    for (let i = 0; i < inputs.length; i++) {
      let input = inputs[i];
      input.value = "";
    }
  }
  connectedCallback() {
    this.inputs = {};
    this.addEventListener("submit", (event) => {
      event.preventDefault();
      let data = this.getData();
      Ocean.request(
        this.getAttribute("method"),
        this.getAttribute("data-href"),
        data
      ).then((result) => {
        let evt = new CustomEvent("saved");
        evt.data = result;
        this.dispatchEvent(evt);
      });
    });
    this.attributeChangedCallback("fields", null, this.getAttribute("fields"));
    this.attributeChangedCallback("uri", null, this.getAttribute("uri"));
    this.attributeChangedCallback("method", null, this.getAttribute("method"));
  }
  attributeChangedCallback(attrName, oldVal, newVal) {
    if (attrName === "uri") {
      let uri = new Uri(newVal);
      this.clearData();
      if (uri.id) {
        this.setAttribute("method", "PUT");

        Ocean.get(newVal).then((result) => {
          this.fillData(result);
        });
      } else {
        this.setAttribute("method", "POST");
      }
    }
    if (attrName === "fields") {
      this.innerHTML = "";
      let fields = newVal.split(",").map((f) => new Field(f));
      for (let i = 0; i < fields.length; i++) {
        let field = fields[i];
        if (field.id.indexOf("time") !== -1 || field.id.indexOf("At") !== -1)
          continue;
        let label = document.createElement("label");
        label.innerHTML = field.id;
        let input = document.createElement("input");
        input.name = field.id;
        input.placeholder = field.id;
        input.type = field.type;
        input.classList.add("form-control");
        this.appendChild(label);
        this.appendChild(input);
      }
      let btn = document.createElement("button");
      btn.classList.add("btn");
      btn.classList.add("btn-primary");
      btn.setAttribute("type", "submit");
      btn.innerHTML = "submit";
      btn.addEventListener("click", (event) => {
        event.preventDefault();
        let data = this.getData();
        let method = this.getAttribute("method");
        Ocean.request(method, this.getAttribute("uri"), data).then((result) => {
          let evt = new CustomEvent("saved");
          evt.data = result;
          this.dispatchEvent(evt);
          let table = document.querySelector("sp-table");
          if (table) table.refresh();
          let editor = document.querySelector("s-editor");
          if (editor != null) editor.hide();
        });
      });
      this.appendChild(btn);
    }
  }
  setState(state) {
    this.fillData(state);
  }
}
document.currentScript.ownercustomElements.define("sp-editor", SPEditor);

class SPParseTableElement extends SPTableElement {
  connectedCallback() {}
  attributeChangedCallback(attrName, oldVal, newVal) {}
}

customElements.define("parse-tableview", SPParseTableViewElement);

class SPEditorViewElement extends SPViewElement {
  get dataSource() {
    return this._dataSource;
  }
  set dataSource(value) {
    this._dataSource = value;
  }
  get model() {
    return this._model;
  }
  set fields(value) {
    this._fields = value;
  }
  get fields() {
    return this._fields;
  }
  get value() {
    let obj = {};
    let fields = this.form.querySelector("sp-field");
    for (let i = 0; i < fields.length; i++) {
      let field = fields[i];
      let key = field.getAttribute("data-field");
      if (field instanceof HTMLInputElement) {
        let value = field.value;
        obj[key] = value;
      }
      if (field instanceof SPEditorViewElement) {
        obj[key] = field.value;
      }
    }
  }
  set model(value) {
    this._model = value;
    this.classList.add("sp-view");
    this.form = document.createElement("form");
    let numberOfFields = this.dataSource.getNumberOfFields();
    for (let i = 0; i < numberOfFields; i++) {
      let field = this.dataSource.getFieldAt(i);
      let label = document.createElement("label");
      label.innerHTML = _(id);
      this.form.appendChild(label);
      let input = document.createElement("input");
      input.setAttribute("type", field.type);
      input.setAttribute("data-field", field.id);
      input.classList.add("sp-field");
      input.classList.add("form-control");
      this.form.appendChild(input);
    }
  }
}

customElements.define("sp-sportview", SPSportView);

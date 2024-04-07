import Uri from "/js/models/uri.js";

/**
 * Viewstack element
 * The viewstack organises the view of elements
 **/
export default class SPViewStackElement extends HTMLElement {
  constructor() {
    super();

    this.registeredViews = [];
  }
  registerPlugin(appId) {
    require(["plugins/" + appId + "/" + appId], function (plugin) {
      plugin();
    });
  }
  registerView(regExp, viewClass) {
    this.views.push({
      regExp: regExp,
      view: viewClass,
    });
  }
  navigateFromPathname(pathname, search) {
    let path = pathname.substr(1);

    let qs = new URLSearchParams(window.location.search);

    let uri = "bungalow:" + path.split("/").join(":") + "?" + qs.toString();

    debugger
    this.navigate(uri, true);
  }
  connectedCallback() {
    this.views = {};
    this.history = [];
    this.future = [];
    this.views = {};
    if (this.parentNode && this.parentNode.tagName == "SP-MAIN") {
      this.navigateFromPathname(
        window.location.pathname,
        window.location.search
      );
      window.addEventListener("popstate", (event) => {
        this.navigateFromPathname(
          window.location.pathname,
          window.location.search
        );
      });
    }
  }

  isLinkValid(uri) {
    return (
      uri &&
      this.registeredViews.filter((v) =>
        v.regex.test(uri.replace("spotify:", "bungalow:"))
      ).length > 0
    );
  }

  /**
   * Navigates the view stack
   * @param {String} uri The URI to navigate to
   * @returns void
   **/
  navigate(url, dontPush = false) {
    if (this.uri === url) return;
    if (url === "bungalow:?service=bungalow") {
      url = "bungalow:internal:start";
    }

    let uri = new Uri(url);
    let evt = new CustomEvent("beforenavigate");
    this.dispatchEvent(evt);

    let menuItems = document.querySelectorAll("sp-menuitem");
    if (this === GlobalViewStack) {
      for (let item of menuItems) {
        item.classList.remove("active");

        //if (uri.indexOf(item.getAttribute('uri')) == 0) {
        if (uri == item.getAttribute("uri")) {
          item.classList.add("active");
        }
      }
    }
    let newUri = uri.toUri().trimRight(":");

    if (
      window.GlobalViewStack.currentView != null &&
      newUri === window.GlobalViewStack.currentView.getAttribute("uri") &&
      window.GlobalViewStack === this
    )
      return;
    let view = null;
    console.log(newUri);

    console.log(window.GlobalViewStack.registeredViews);

    let externalViews = window.GlobalViewStack.registeredViews.filter((v) => {
      console.log(v.regex);
      console.log(newUri);
      let result = v.regex.test(newUri);
      console.log(result);
      return result;
    });
    console.log(externalViews);
    var viewInfo = {};
    viewInfo = externalViews[0];
    if (newUri in this.views) {
      view = this.views[newUri];
    } else if (externalViews.length > 0) {
      view = document.createElement(externalViews[0].tag);
      this.addView(newUri, view);
    } else {
      alert("The link could not be found");
    }
    $("sp-mediasidebaritem").removeClass("active");
    $('sp-mediasidebaritem[uri^="' + newUri + '"]').addClass("active");
    if (!view) {
      return;
    }

    let path = uri.pathname + "?" + uri.querystring;

    this.uri = uri;

    if (!dontPush) {
      history.pushState(
        {
          uri: newUri,
          query: uri.query,
          position: window.navPosition,
          count: window.navPosition,
        },
        uri,
        uri.pathname + "?" + uri.querystring
      );
    } else {
    }
    $("#uribar").val(newUri);
    $("sp-menuitem").removeClass("active");
    $('sp-menuitem[uri^="' + newUri + '"]').addClass("active");
    if (viewInfo.hidesSideBar) {
      $("sp-sidebar").hide();
    } else {
      $("sp-sidebar").show();
    }
    setTimeout(() => {
      this.setView(view);
    }, 100);
  }

  postToUri(uri, data) {
    let view = null;
    let externalViews = window.GlobalViewStack.registeredViews.filter((v) => {
      console.log(v.regex);
      console.log(uri);
      let result = v.regex.test(uri);
      console.log(result);
      return result;
    });
    if (uri in this.views) {
      view = this.views[uri];
    } else if (externalViews.length > 0) {
      view = document.createElement(externalViews[0].tag);
      this.views[uri] = view;
    }
    if (view != null) {
      view.setUri(uri);

      view.insertUri(uri, data);
    }
    view.refresh();
  }

  addView(uri, view) {
    this.views[uri] = view;
    this.setView(view);

    view.setUri(uri);
  }
  setView(view) {
    if (this.firstChild != null && this.firstChild !== view) {
      this.removeChild(this.firstChild);
    }
    this.appendChild(view);
    if (this === window.GlobalViewStack)
      window.GlobalViewStack.currentView = view;

    if (view.activate instanceof Function) {
      view.activate();
      var event = new CustomEvent("hashchange");
      window.dispatchEvent(event);
    }
  }
}

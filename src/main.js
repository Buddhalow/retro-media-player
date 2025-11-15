import $ from 'jquery'
import moment from 'moment'

import i18n from 'i18next'

import Store from "@/core/store.js";
import BrowserStorage from "@/core/storages/browser.js";
import SPFlowElement from "@/controls/flow.js";
import SPMediaSidebarElement from "@/controls/mediasidebar.js";
import SPMediaSidebarItemElement from "@/controls/mediasidebaritem.js";
import SPStatusIconElement from "@/controls/statusicon.js";
import SPItemElement from "@/controls/item.js";
import SPButtonElement from "@/controls/button.js";
import SPDragElement from "@/controls/dragelement.js";
import SPBottomTabBarElement from "@/controls/bottomtabbar.js";
import SPThrobberElement from "@/controls/throbber.js";
import SPAttachmentElement from "@/controls/attachment.js";
import SPEmbeddedResourceElement from "@/controls/embeddedresource.js";
import SPSplitterElement from "@/controls/splitter.js";
import SPHookElement from "@/controls/hook.js";
import SPExpanderElement from "@/controls/expander.js";
import SPAboutElement from "@/controls/about.js";
import SPDateTimeElement from "@/controls/datetime.js";
import SPToolButtonElement from "@/controls/toolbutton.js";
import SPContextMenuElement from "@/controls/contextmenu.js";
import SPContextMenuItemElement from "@/controls/contextmenuitem.js";
import SPAppToolbarElement from "@/controls/apptoolbar.js";
import SPAppHeaderElement from "@/controls/appheader.js";
import SPAppFooterElement from "@/controls/appfooter.js";
import SPCarouselElement from "@/controls/carousel.js";
import SPChromeElement from "@/controls/chrome.js";
import SPDividerElement from "@/controls/divider.js";
import SPGondoleElement from "@/controls/gondole.js";
import SPHeaderElement from "@/controls/header.js";
import SPImageElement from "@/controls/image.js";
import SPInfoBarElement from "@/controls/infobar.js";
import SPLinkElement from "@/controls/link.js";
import SPMainElement from "@/controls/main.js";
import SPMenuElement from "@/controls/menu.js";
import SPMenuItemElement from "@/controls/menuitem.js";
import SPNowPlayingElement from "@/controls/nowplaying.js";
import SPUriFormElement from "@/controls/uriform.js";
import SPPopularityElement from "@/controls/popularity.js";
import SPResourceElement from "@/controls/resource.js";
import SPSearchFormElement from "@/controls/searchform.js";
import SPSidebarElement from "@/controls/sidebar.js";
import SPSidebarMenuElement from "@/controls/sidebarmenu.js";
import SPTabElement from "@/controls/tab.js";
import SPTabBarElement from "@/controls/tabbar.js";
import SPTabContentElement from "@/controls/tabcontent.js";
import SPTableElement from "@/controls/table.js";
import SPThemeElement from "@/controls/theme.js";
import SPTitleElement from "@/controls/title.js";
import SPToolbarElement from "@/controls/toolbar.js";
import SPViewElement from "@/controls/view.js";
import SPViewStackElement from "@/controls/viewstack.js";
import SPTagInputElement from "@/controls/taginput.js";
import SPFormFieldElement from "@/controls/formfield.js";
import SPRelationFieldElement from "@/controls/relationfield.js";
import SPFormElement from "@/controls/form.js";
import SPModalElement from "@/controls/modal.js";
import SPDialogElement from "@/controls/dialog.js";
import SPListElement from "@/controls/list.js";
import SPPostElement from "@/controls/post.js";
import SPAppElement from "@/controls/app.js";
import SPNewAppHeaderElement from "@/controls/newappheader.js";
import SPSelectElement from "@/controls/select.js";
import SPFloatingBarElement from "@/controls/floatingbar.js";
import SPSpiderElement from "@/controls/spider.js";
import SPRightSidebarElement from "@/controls/rightsidebar.js";

window.resources = {};

function insertAfter(newNode, referenceNode) {
  referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

moment.locale("se");
function ago(val) {
  let date = moment(val);
  let now = moment();
  let dr = Math.abs(date.diff(now, "days"));
  let fresh = Math.abs(date.diff(now, "days"));
  let tooOld = dr > 1;
  return dr ? date.format("YYYY-MM-DD") : date.fromNow();
}
window.infectedResources = ["spotify:track:7gpL5CorPuYBthvZkPPFGd"];

String.prototype.getUrl = function () {
  let httpStart = this.indexOf("http");
  return this.substr(httpStart, this.indexOf(" ", httpStart));
};

Array.prototype.move = function (from, to) {
  this.splice(to, 0, this.splice(from, 1)[0]);
};

Array.prototype.contains = function (obj) {
  var i = this.length;
  while (i--) {
    if (this[i] == obj) {
      return true;
    }
  }
  return false;
};

Array.prototype.insertArray = function (new_values, insert_index) {
  for (var i = 0; i < new_values.length; i++) {
    this.splice(insert_index + i, 0, new_values[i]);
  }
  return this;
};

String.prototype.hashtagify = function () {
  return this.replace(
    /#(\S*)/,
    '<sp-link uri="buddhalow:hashtag:$1">#$1</sp-link>'
  ).replace(
    '<sp-link uri="buddhalow:hashtag:#',
    '<sp-link uri="buddhalow:hashtag:'
  );
};

String.prototype.userify = function () {
  return this.replace(
    /@(\S*)/,
    '<sp-link uri="buddhalow:user:$1">#$1</sp-link>'
  ).replace('<sp-link uri="buddhalow:user:@', '<sp-link uri="buddhalow:user:');
};

Array.prototype.insert = function (index, item) {
  this.splice(index, 0, item);
};
/**
 * https://stackoverflow.com/questions/6982692/html5-input-type-date-default-value-to-today
 **/
Date.prototype.toDateInputValue = function () {
  var local = new Date(this);
  local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
  return local.toJSON().slice(0, 10);
};

//i18_registerLang("sv");

String.prototype.trimRight = function (charToTrim) {
  var regExp = new RegExp(charToTrim + "+$");
  var result = this.replace(regExp, "");

  return result;
};

window.hooks = {};

window.store = {};
window.setObject = (prop, object, store = window.store) => {
  if (store[prop] !== undefined) {
    store[prop] = Object.assign(store[prop], object);
  } else {
    store[prop] = object;
  }
};

window.onHashChanged = (e) => {
  let tabId = "overview";
  let theme = JSON.parse(localStorage.getItem("theme"));

  try {
    tabId = window.location.hash.substr(1);
    if (!tabId || tabId.length < 1) {
      tabId = "overview";
    }
  } catch (e) {}
  let display = window.getComputedStyle(GlobalTabBar).display;
  if (display === "flex") {
    if (tabId != "overview") {
      $("sp-header").hide();
    } else {
      $("sp-header").show();
    }
  }
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
  let tabViews = view.querySelectorAll("sp-tabcontent");
  for (let tabView of tabViews) {
    if (tabView.getAttribute("data-tab-id") == tabId) {
      tabView.style.display = "block";
    } else {
      tabView.style.display = "none";
    }
  }
  try {
    var viewHeader = tabViews[0].parentNode.querySelector("sp-header");
    if (viewHeader != null) {
      if (tabId != "overview") {
        viewHeader.classList.add("overview-hidden");
      } else {
        viewHeader.classList.remove("overview-hidden");
      }
    }
  } catch (e) {}
  if (GlobalViewStack && GlobalViewStack.currentView) {
    if (GlobalViewStack.currentView.setHash instanceof Function)
      GlobalViewStack.currentView.setHash(tabId);
  }
};
window.addEventListener("hashchange", window.onHashChanged);

window.resolvers = [];

window.registerResolver = function (resolver) {
  window.resolvers.push(resolver);
};

window.services = [];

window.registerService = function (service) {
  window.services.push(service.module.getDefaultInstance());
};

window.getServiceByDomain = function(domain) {
  return window.services.find((s) => {
    return s.acceptsDomain(domain) || (s.id === domain)
  });
}

window.resolve = function (method, uri, query, headers, data) {};

window.store = new Store(new BrowserStorage());

localStorage.setItem("showHeaders", true);
customElements.define("sp-bottomtabbar", SPBottomTabBarElement);
customElements.define("sp-button", SPButtonElement);
customElements.define("sp-splitter", SPSplitterElement);
customElements.define("sp-uriform", SPUriFormElement);
customElements.define("sp-flow", SPFlowElement);
customElements.define("sp-item", SPItemElement);
customElements.define("sp-viewstack", SPViewStackElement);
customElements.define("sp-throbber", SPThrobberElement);
customElements.define("sp-attachment", SPAttachmentElement);
customElements.define("sp-embeddedresource", SPEmbeddedResourceElement);
customElements.define("sp-hook", SPHookElement);
customElements.define("sp-expander", SPExpanderElement);
customElements.define("sp-datetime", SPDateTimeElement);
customElements.define("sp-toolbutton", SPToolButtonElement);
customElements.define("sp-apptoolbar", SPAppToolbarElement);
customElements.define("sp-mediasidebar", SPMediaSidebarElement);
customElements.define("sp-mediasidebaritem", SPMediaSidebarItemElement);
customElements.define("sp-taginput", SPTagInputElement);
customElements.define("sp-contextmenu", SPContextMenuElement);
customElements.define("sp-contextmenuitem", SPContextMenuItemElement);
customElements.define("sp-chrome", SPChromeElement);
customElements.define("sp-view", SPViewElement);
customElements.define("sp-about", SPAboutElement);
customElements.define("sp-appheader", SPAppHeaderElement);
customElements.define("sp-appfooter", SPAppFooterElement);
customElements.define("sp-carousel", SPCarouselElement);
customElements.define("sp-divider", SPDividerElement);
customElements.define("sp-gondole", SPGondoleElement);
customElements.define("sp-header", SPHeaderElement);
customElements.define("sp-image", SPImageElement);
customElements.define("sp-infobar", SPInfoBarElement);
customElements.define("sp-link", SPLinkElement);
customElements.define("sp-main", SPMainElement);
customElements.define("sp-menu", SPMenuElement);
customElements.define("sp-menuitem", SPMenuItemElement);
customElements.define("sp-nowplaying", SPNowPlayingElement);
customElements.define("sp-popularity", SPPopularityElement);
customElements.define("sp-resource", SPResourceElement);
customElements.define("sp-searchform", SPSearchFormElement);
customElements.define("sp-sidebar", SPSidebarElement);
customElements.define("sp-rightsidebar", SPRightSidebarElement);
customElements.define("sp-sidebarmenu", SPSidebarMenuElement);
customElements.define("sp-tab", SPTabElement);
customElements.define("sp-tabbar", SPTabBarElement);
customElements.define("sp-tabcontent", SPTabContentElement);
customElements.define("sp-table", SPTableElement);
customElements.define("sp-theme", SPThemeElement);
customElements.define("sp-title", SPTitleElement);
customElements.define("sp-toolbar", SPToolbarElement);
customElements.define("sp-formfield", SPFormFieldElement);
customElements.define("sp-relationfield", SPRelationFieldElement);
customElements.define("sp-form", SPFormElement);
customElements.define("sp-modal", SPModalElement);
customElements.define("sp-dialog", SPDialogElement);
customElements.define("sp-list", SPListElement);
customElements.define("sp-post", SPPostElement);
customElements.define("sp-app", SPAppElement);
customElements.define("sp-select", SPSelectElement);
customElements.define("sp-newappheader", SPNewAppHeaderElement);
customElements.define("sp-floatingbar", SPFloatingBarElement);
customElements.define("sp-spider", SPSpiderElement);
customElements.define("sp-statusicon", SPStatusIconElement);
customElements.define("sp-dragelement", SPDragElement);

async function loadExtensions(extensionType) {
  const objects = {
    "service": [
      {
        "id": "musickit",
        "type": "service"
      }
    ],
    "plugin": [
      {
        "id": "bungalow",
        "type": "plugin"
      },
      {
        "id": "media",
        "type": "plugin"
      }
    ]
  }
  const extensions = objects[extensionType]

  return await Promise.all(
    extensions.map(async (extension) => {
      if ((localStorage.getItem(`${extensionType}.${extension.id}.enabled`) == "true") || true) {
        let module = await import(
          `./${extensionType}s/${extension.id}/index.js`
        );
        console.log(`./${extensionType}s/${extension.id}/manifest.json`)
        let manifest = await import(`./${extensionType}s/${extension.id}/manifest.json`)
        return {
          module,
          manifest,
          loaded: true,
          ...extension,
        };
      } else {
        return {
          loaded: false,
          ...extension
        }
      } 
    })
  );
}

const init = async () => {
  const plugins = await loadExtensions("plugin");
  for (let plugin of plugins) {
    if (plugin.manifest.elements) {
      await Promise.all(
        Object.keys(plugin.manifest.elements).map(async (elementId) => {
          let view = plugin.manifest.elements[elementId];
          let z = await import(
            `./plugins/${plugin.id}/elements/${elementId}.js`
          );
          let XElement = z.default;
          let tagName = plugin.id + "-" + elementId;
          customElements.define(tagName, XElement);
        })
      );
    }
    if (plugin.manifest.views) {
      let viewIds = Object.keys(plugin.manifest.views);
      await Promise.all(
        viewIds.map(async (viewId) => {
          let view = plugin.manifest.views[viewId];
          let z = await import(`./plugins/${plugin.id}/views/${viewId}.js`);
          let XViewElement = z.default;
          let tagName = plugin.id + "-" + viewId + "view";
          console.log(tagName);
          customElements.define(tagName, XViewElement);
          console.log(tagName, XViewElement);
          document.addEventListener("viewstackloaded", () => {
            window.GlobalViewStack.registeredViews.push({
              tag: tagName,
              hidesSideBar: view.hidesSidebar,
              regex: new RegExp("bungalow:@(?P<user_id>\w+)@(?P<domain>[a-z\.\-]+):" + view.regexp),
            });
          });
        })
      );
    }
  }
  const services = await loadExtensions("service");
  for (let service of services) {
    if (service.loaded) {
      window.registerService(service);
    }
  }
  window.services.media = window.services.spotify;
 
  $("#loading").fadeOut(function () {
    document
      .querySelector(".body")
      .appendChild(document.createElement("sp-chrome"));
  });
};

init().then(() => {
  let e = new CustomEvent("mainmenuload");
  document.dispatchEvent(e);
}).catch(e => {
  throw e;
});

window.addEventListener('mousemove', (e) => {
  window.mousePosition = {
    x: e.pageX,
    y: e.pageY,
  }
});
window.clearContextMenus = function (contextMenu) {
  $('sp-contextmenu').each(function (i) {
    if (this !== contextMenu) {
      $(this).remove();
    }
  })
}
window.addEventListener('mousedown', (e) => {
  window.clearContextMenus();
})
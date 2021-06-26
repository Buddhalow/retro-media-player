import Store from '/js/core/store.js';
import BrowserStorage from '/js/core/storages/browser.js';
import SPFlowElement from '/js/controls/flow.js';
import SPStatusIconElement from '/js/controls/statusicon.js';
import SPItemElement from '/js/controls/item.js';
import SPButtonElement from '/js/controls/button.js';
import SPDragElement from '/js/controls/dragelement.js';
import SPThrobberElement from '/js/controls/throbber.js';
import SPAttachmentElement from '/js/controls/attachment.js';
import SPEmbeddedResourceElement from '/js/controls/embeddedresource.js';
import SPSplitterElement from '/js/controls/splitter.js';
import SPHookElement from '/js/controls/hook.js';
import SPExpanderElement from '/js/controls/expander.js';
import SPAboutElement from '/js/controls/about.js';
import SPDateTimeElement from '/js/controls/datetime.js';
import SPToolButtonElement from '/js/controls/toolbutton.js';
import SPContextMenuElement from '/js/controls/contextmenu.js';
import SPContextMenuItemElement from '/js/controls/contextmenuitem.js';
import SPAppToolbarElement from '/js/controls/apptoolbar.js';
import SPAppHeaderElement from '/js/controls/appheader.js';
import SPAppFooterElement from '/js/controls/appfooter.js';
import SPCarouselElement from '/js/controls/carousel.js';
import SPChromeElement from '/js/controls/chrome.js';
import SPDividerElement from '/js/controls/divider.js';
import SPGondoleElement from '/js/controls/gondole.js';
import SPHeaderElement from '/js/controls/header.js';
import SPImageElement from '/js/controls/image.js';
import SPInfoBarElement from '/js/controls/infobar.js';
import SPLinkElement from '/js/controls/link.js';
import SPMainElement from '/js/controls/main.js';
import SPMenuElement from '/js/controls/menu.js';
import SPMenuItemElement from '/js/controls/menuitem.js';
import SPNowPlayingElement from '/js/controls/nowplaying.js';
import SPUriFormElement from '/js/controls/uriform.js';
import SPPopularityElement from '/js/controls/popularity.js';
import SPResourceElement from '/js/controls/resource.js';
import SPSearchFormElement from '/js/controls/searchform.js';
import SPSidebarElement from '/js/controls/sidebar.js';
import SPSidebarMenuElement from '/js/controls/sidebarmenu.js';
import SPTabElement from '/js/controls/tab.js';
import SPTabBarElement from '/js/controls/tabbar.js';
import SPTabContentElement from '/js/controls/tabcontent.js';
import SPTableElement from '/js/controls/table.js';
import SPThemeElement from '/js/controls/theme.js';
import SPTitleElement from '/js/controls/title.js';
import SPToolbarElement from '/js/controls/toolbar.js';
import SPViewElement from '/js/controls/view.js';
import SPViewStackElement from '/js/controls/viewstack.js';
import SPTagInputElement from '/js/controls/taginput.js';
import SPFormFieldElement from '/js/controls/formfield.js';
import SPRelationFieldElement from '/js/controls/relationfield.js';
import SPFormElement from '/js/controls/form.js';
import SPModalElement from '/js/controls/modal.js';
import SPDialogElement from '/js/controls/dialog.js';
import SPListElement from '/js/controls/list.js';
import SPPostElement from '/js/controls/post.js';
import SPAppElement from '/js/controls/app.js';
import SPNewAppHeaderElement from '/js/controls/newappheader.js';
import SPSelectElement from '/js/controls/select.js';
import SPFloatingBarElement from '/js/controls/floatingbar.js';
import SPSpiderElement from '/js/controls/spider.js';
import SPRightSidebarElement from '/js/controls/rightsidebar.js';

window.resources = {};

function insertAfter(newNode, referenceNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

moment.locale('se');
function ago(val) {
    let date = moment(val);
    let now = moment();
    let dr = Math.abs(date.diff(now, 'days'));
    let fresh = Math.abs(date.diff(now, 'days'));
    let tooOld = dr > 1;
    return dr ? date.format('YYYY-MM-DD') : date.fromNow();
}
window.infectedResources = [
    'spotify:track:7gpL5CorPuYBthvZkPPFGd'
]

String.prototype.getUrl = function () {
    let httpStart = this.indexOf('http');
    return this.substr(httpStart, this.indexOf(' ', httpStart));
}


Array.prototype.move = function (from, to) {
  this.splice(to, 0, this.splice(from, 1)[0]);
};


Array.prototype.contains = function(obj) {
    var i = this.length;
    while (i--) {
        if (this[i] == obj) {
            return true;
        }
    }
    return false;
}


Array.prototype.insertArray = function (new_values, insert_index) {
    for (var i=0; i<new_values.length; i++) {
        this.splice((insert_index + i), 0, new_values[i]);
    }
    return this;
}


String.prototype.hashtagify = function() {
    return this.replace(/#(\S*)/, '<sp-link uri="buddhalow:hashtag:$1">#$1</sp-link>').replace('<sp-link uri="buddhalow:hashtag:#', '<sp-link uri="buddhalow:hashtag:');
}


String.prototype.userify = function( ){
    return this.replace(/@(\S*)/, '<sp-link uri="buddhalow:user:$1">#$1</sp-link>').replace('<sp-link uri="buddhalow:user:@', '<sp-link uri="buddhalow:user:');
}


Array.prototype.insert = function ( index, item ) {
    this.splice( index, 0, item );
};
/**
 * https://stackoverflow.com/questions/6982692/html5-input-type-date-default-value-to-today
 **/
Date.prototype.toDateInputValue = (function() {
    var local = new Date(this);
    local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
    return local.toJSON().slice(0,10);
});

i18_registerLang('sv');


String.prototype.trimRight = function (charToTrim) {
  var regExp = new RegExp(charToTrim + "+$");
  var result = this.replace(regExp, "");

  return result;
}


window.hooks = {};

window.store = {};
window.setObject = (prop, object, store=window.store) => {
  
    if (store[prop] !== undefined) {
        store[prop] = Object.assign(store[prop], object)
    } else {
        store[prop] = object
    }
}

window.prompt = function (text, defval) {

}

Parse.Object.prototype.simplify = function (level = 0) {
    try {
        let newObj = {};

        newObj.id = this.id;
        newObj.uri = "buddhalow:" + this.className.toLowerCase() + ":" + this.id;
        Object.keys(this.attributes).forEach((field) => {
            let val = this.attributes[field];
            if (val instanceof Parse.Relation) {
                return;
            }
            if (val instanceof Parse.Object && field != 'parseObject' && level < 4) {
                val = val.simplify(level++);
            }
            newObj[field] = val;
            if (val != null)
            val.parseObject = this;
        });

        return newObj;
    } catch (e) {
    }
}

window.onHashChanged = (e) => {
    let tabId = 'overview';
    let theme = JSON.parse(localStorage.getItem('theme'));

    try {
        tabId = window.location.hash.substr(1);
        if (!tabId || tabId.length < 1) {
            tabId = 'overview'
        };;

    } catch (e) {
    }
    let display = window.getComputedStyle(GlobalTabBar).display
    if (display === 'flex') {

        if (tabId != 'overview') {
            $('sp-header').hide()
        } else {

            $('sp-header').show()
        }
    }
    let view = GlobalViewStack.currentView;
    let foundTab = false;
    for (let tab of document.querySelectorAll('sp-tab')) {
        if (tab.getAttribute('data-tab-id') == tabId) {
            tab.classList.add('sp-tab-active');
            foundTab = true;
        } else {
            tab.classList.remove('sp-tab-active');

        }
    }
    if (!foundTab) {
        let tabs = document.querySelectorAll('sp-tab');
        if (tabs.length > 0)
            tabs[0].classList.add('sp-tab-active');
    }
    let tabViews = view.querySelectorAll('sp-tabcontent');
    for (let tabView of tabViews) {
        if (tabView.getAttribute('data-tab-id') == tabId) {
            tabView.style.display = 'block';
        } else {
            tabView.style.display = 'none';
        }

    }
    try {
        var viewHeader = tabViews[0].parentNode.querySelector('sp-header');
        if (viewHeader != null) {
            if (tabId != 'overview') {
                viewHeader.classList.add('overview-hidden')
            } else {
                viewHeader.classList.remove('overview-hidden');
            }
        }
    } catch (e) {
    }
    if (GlobalViewStack && GlobalViewStack.currentView) {
        if (GlobalViewStack.currentView.setHash instanceof Function)
            GlobalViewStack.currentView.setHash(tabId);
    }
};
window.addEventListener('hashchange', window.onHashChanged);


window.resolvers = [];

window.registerResolver = function (resolver) {
    window.resolvers.push(resolver);
}


window.resolve = function (method, uri, query, headers, data) {

}

window.store = new Store(new BrowserStorage())
localStorage.setItem("showHeaders", true);
customElements.define('sp-button', SPButtonElement);
customElements.define('sp-splitter', SPSplitterElement);
customElements.define('sp-uriform', SPUriFormElement);
customElements.define('sp-flow', SPFlowElement);
customElements.define('sp-item', SPItemElement);
customElements.define('sp-viewstack', SPViewStackElement);
customElements.define('sp-throbber', SPThrobberElement);
customElements.define('sp-attachment', SPAttachmentElement);
customElements.define('sp-embeddedresource', SPEmbeddedResourceElement);
customElements.define('sp-hook', SPHookElement);
customElements.define('sp-expander', SPExpanderElement);
customElements.define('sp-datetime', SPDateTimeElement);
customElements.define('sp-toolbutton', SPToolButtonElement);
customElements.define('sp-apptoolbar', SPAppToolbarElement);
customElements.define('sp-taginput', SPTagInputElement);
customElements.define('sp-contextmenu', SPContextMenuElement);
customElements.define('sp-contextmenuitem', SPContextMenuItemElement);
customElements.define('sp-chrome', SPChromeElement);
customElements.define('sp-view', SPViewElement);
customElements.define('sp-about', SPAboutElement);
customElements.define('sp-appheader', SPAppHeaderElement);
customElements.define('sp-appfooter', SPAppFooterElement);
customElements.define('sp-carousel', SPCarouselElement);
customElements.define('sp-divider', SPDividerElement);
customElements.define('sp-gondole', SPGondoleElement);
customElements.define('sp-header', SPHeaderElement);
customElements.define('sp-image', SPImageElement);
customElements.define('sp-infobar', SPInfoBarElement);
customElements.define('sp-link', SPLinkElement);
customElements.define('sp-main', SPMainElement);
customElements.define('sp-menu', SPMenuElement);
customElements.define('sp-menuitem', SPMenuItemElement);
customElements.define('sp-nowplaying', SPNowPlayingElement);
customElements.define('sp-popularity', SPPopularityElement);
customElements.define('sp-resource', SPResourceElement);
customElements.define('sp-searchform', SPSearchFormElement);
customElements.define('sp-sidebar', SPSidebarElement);
customElements.define('sp-rightsidebar', SPRightSidebarElement);
customElements.define('sp-sidebarmenu', SPSidebarMenuElement)
customElements.define('sp-tab', SPTabElement);
customElements.define('sp-tabbar', SPTabBarElement);
customElements.define('sp-tabcontent', SPTabContentElement);
customElements.define('sp-table', SPTableElement);
customElements.define('sp-theme', SPThemeElement);
customElements.define('sp-title', SPTitleElement);
customElements.define('sp-toolbar', SPToolbarElement);
customElements.define('sp-formfield', SPFormFieldElement);
customElements.define('sp-relationfield', SPRelationFieldElement);
customElements.define('sp-form', SPFormElement);
customElements.define('sp-modal', SPModalElement);
customElements.define('sp-dialog', SPDialogElement);
customElements.define('sp-list', SPListElement);
customElements.define('sp-post', SPPostElement);
customElements.define('sp-app', SPAppElement);
customElements.define('sp-select', SPSelectElement);
customElements.define('sp-newappheader', SPNewAppHeaderElement);
customElements.define('sp-floatingbar', SPFloatingBarElement);
customElements.define('sp-spider', SPSpiderElement);
customElements.define('sp-statusicon', SPStatusIconElement);
customElements.define('sp-dragelement', SPDragElement);
const init = async () => {

    await new Promise(async (resolve, fail) => {
        let result = await fetch('/api/plugin', {
            credentials: 'include',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            },
        }).then((r) => r.json());

        let plugins = result.objects.filter(
            t => {
                return localStorage.getItem('service.' + t.id + '.enabled') == 'true' || t.id == 'bungalow';
            }
        )
        await Promise.all(
            plugins.map(async (plugin) => {

                let module = await import('/js/plugins/' + plugin.id + '/' + plugin.id + '.js')

                if (plugin.elements) {

                    await Promise.all(Object.keys(plugin.elements).map(async elementId => {
                        let view = plugin.elements[elementId]
                        let z = await import('/js/plugins/' + plugin.id + '/elements/' + elementId + '.js')
                        let XElement = z.default
                        let tagName = plugin.id + '-' + elementId
                        customElements.define(tagName, XElement)
                    }))
                }
                if (plugin.views) {
                    let viewIds =  Object.keys(plugin.views)
                    await Promise.all(viewIds.map(async (viewId) => {
                        let view = plugin.views[viewId]
                        let z = await import('/js/plugins/' + plugin.id + '/views/' + viewId + '.js')
                        let XViewElement = z.default
                        let tagName = plugin.id + '-' + viewId + 'view'
                        console.log(tagName);
                        customElements.define(tagName, XViewElement)
                        console.log(tagName, XViewElement)
                        document.addEventListener('viewstackloaded', () => {
                            window.GlobalViewStack.registeredViews.push({
                                tag: tagName,
                                regex: new RegExp(view.regexp)
                            });
                        })

                    }))
                }

            })
        )
        resolve()


    });
    $('#loading').fadeOut(function () {
        document.querySelector('.body').appendChild(document.createElement('sp-chrome'));        
    });
    
};

function login(service) {
    sessionStorage.setItem('logging_into', service);

    return new Promise((resolve, reject) => {
        setTimeout(() => {
            var loginWindow = window.open('/api/' + service + '/login');
            var t = setInterval(() => {
                if (!loginWindow || loginWindow.closed) {
                    clearInterval(t);

                    resolve(true);
                }
            });
        });
    });
}
login('spotify').then((result) => {
    init().then(() => {
        console.log("Loaded");
    });
})







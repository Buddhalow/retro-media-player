import SPViewElement from '/js/controls/view.js';
    export default class SPConfigViewElement extends SPViewElement {
        connectedCallback() {
            super.connectedCallback();
            if (!this.created2) {
                this.create();
                this.created2 = true;
            }
        }
        create() {
            this.classList.add('sp-view');
            this.innerHTML = '<form>' +
                '<h1>' + _('Settings') + '</h1>' +
                '<fieldset><legend>' + _('Appearance') + '</legend><sp-theme></sp-theme></fieldset>' +
                '<button type="submit">Apply</button>' +
                '</form>';
                this.querySelector('form').addEventListener('submit', (e) => {
                    e.preventDefault();
                    GlobalChromeElement.theme = this.querySelector('sp-theme').theme;   
                    GlobalChromeElement.saveTheme(GlobalChromeElement.theme);
                    return false;
                })
                this.querySelector('sp-theme').theme = GlobalChromeElement.theme;   
                
        }
        activate() {
            super.activate();
        }
    }

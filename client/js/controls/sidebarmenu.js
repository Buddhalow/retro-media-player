
    export default class SPSidebarMenuElement extends HTMLElement {
        connectedCallback() {
            if (!this.created) {
                let e = new CustomEvent('mainmenuload');
                document.dispatchEvent(e);
                this.created = new Date();
            }
        }

    }

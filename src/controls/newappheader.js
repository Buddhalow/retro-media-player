
    export default class SPNewAppHeaderElement extends HTMLElement {
        connectedCallback() {
            if (!this.searchForm) {
                this.searchForm = document.createElement('sp-searchform');
                if (localStorage.getItem("stylesheet") === 'spotify-2017') {
                    document.body.appendChild(this.searchForm);
                } else {
                    this.appendChild(this.searchForm);
                }
                this.searchForm.style.marginRight = '5pt';
            }
            
            this.created = true;
        }

    }

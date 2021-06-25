
    export default class SPAppHeaderElement extends HTMLElement {
        connectedCallback() {
            this.style.display = 'flex';
            this.style.flexDirection = 'row';

            this.buttons = document.createElement('div');
            this.buttons.innerHTML = '<span class="btn-group"><a id="btnBack" class="btn btn-navigation fa fa-caret-left" onclick="history.back()"></a><a class="btn btn-navigation fa fa-caret-right"  id="btnForward" onclick="history.forward()"></a></span>';
            this.appendChild(this.buttons);
            this.spacer = document.createElement('div');
            this.spacer.style.flex = 1;
            if (!this.searchForm) {
                this.searchForm = document.createElement('sp-searchform');
                if (localStorage.getItem("stylesheet") === 'spotify-2017') {
                    document.body.appendChild(this.searchForm);
                } else {
                    this.appendChild(this.searchForm);
                }
                this.searchForm.style.marginRight = '5pt';
            }
            if (!this.uriForm) {
                this.uriForm = document.createElement('sp-uriform');
                this.uriForm.style.flex = '1';
                this.appendChild(this.uriForm);
                this.searchForm.style.marginRight = '5pt';
            }

            let infoDiv =document.createElement('div');
            infoDiv.style.display = 'flex';
            infoDiv.style.flexDirection ='row';
            infoDiv.style.alignItems = 'center';
            infoDiv.style.justifyContent = 'row-reverse';
            this.appendChild(infoDiv);
            infoDiv.innerHTML = `<sp-statusicon uri="buddhalow:internal:feed" icon="bullhorn" badge="5"></sp-statusicon>`;

            let accountDiv =document.createElement('div');
            accountDiv.style.display = 'flex';
            accountDiv.style.flexDirection ='row';
            accountDiv.style.alignItems = 'center';
            accountDiv.style.justifyContent = 'row-reverse';
            this.appendChild( accountDiv);
            accountDiv.innerHTML = '<sp-statusicon uri="buddhalow:user:@" icon="user"></sp-statusicon>';
            this.created = true;

        }

    }

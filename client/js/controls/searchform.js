
    export default class SPSearchFormElement extends HTMLElement {

        connectedCallback() {
            this.form = document.createElement('form');

            this.form.setAttribute('action', '/');
            this.form.setAttribute('method', 'GET');
            this.form.addEventListener('submit', (event) => {
                event.preventDefault();
                let query = this.form.searchTextBox.value;
                 if (query.indexOf(':') == -1) {
                    query = 'media:search:' + encodeURIComponent(query);
                }
                GlobalViewStack.navigate(query);
                return false;
            });
            this.form.searchDiv = document.createElement('div');
            this.form.searchDiv.style.display = 'inline-block';
            this.form.searchDiv.innerHTML = '<i style="opacity: 0.5; color: black; text-shadow: none; margin-right: 5pt; margin-left: 5pt" class="fa fa-search"></i>';
            this.form.searchDiv.classList.add('form-control');
            this.form.searchTextBox = document.createElement('input');
            this.form.searchTextBox.setAttribute('type', 'search');
            this.form.searchTextBox.setAttribute('spellcheck', 'false');

            this.form.searchTextBox.setAttribute('placeholder', 'search');
            this.form.appendChild(this.form.searchDiv);
            this.form.searchDiv.appendChild(this.form.searchTextBox);
            this.form.searchTextBox.style.width = '228pt'
            this.form.btnSubmit = document.createElement('sp-button');

            this.form.btnSubmit.classList.add('fa');
            this.form.btnSubmit.classList.add('fa-arrow-right');
            this.form.btnSubmit.setAttribute('type', 'submit');
            this.form.btnSubmit.style.display = 'none';
            this.form.appendChild(this.form.btnSubmit);
            this.created = true;
            this.appendChild(this.form);


        }
    }

import SPLinkElement from '/js/controls/link.js';
    export default class SPMenuItemElement extends SPLinkElement {
        connectedCallback() {
            super.connectedCallback();
            this.subitems = [];
            this.addEventListener('dragover', (e) => {
                e.preventDefault();
                var data = e.dataTransfer.getData('text');
                e.target.classList.add('dragover');
            })
            this.addEventListener('drop', (e) => {
                e.preventDefault();
          
                var uri = e.dataTransfer.getData('text');
                GlobalViewStack.postToUri(e.target.getAttribute('uri'), uri);
                e.target.classList.remove('dragover');
            })
            this.addEventListener('dragleave', (e) => {
                e.preventDefault();
                e.target.classList.remove('dragover');
            })
        }
        attributeChangedCallback(attrName, oldVal, newVal) {
           
        }
        setState(object) {
            this.state = object;
            this.render();
        }
        render() {
            if (this.state != null) {
                let item = this.state;
                this.innerHTML += '<i class="fa fa-' + (item.icon || 'home') + '" style="margin-right: 5pt"></i>';
                this.innerHTML += '<span>' + _e(item.name) + '</span>';
                if ('owner' in item) {
                    this.innerHTML += '<span style="opacity: 0.5"> by ' + '<sp-link uri="' + item.owner.uri + '">' + item.owner.name + '</sp-link>' + '</span>';
                }
                if ('user' in item) {
                    this.innerHTML += '<span style="opacity: 0.5"> by ' + '<sp-link uri="' + item.user.uri + '">' + item.user.name + '</sp-link>' + '</span>';
                }
                if ('artists' in item) {
                    this.innerHTML += '<span style="opacity: 0.5"> by ' + item.artists.map((a) => '<sp-link uri="' + a.uri + '">' + a.name + '</sp-link>').join(', ') + '</span>';
                }
                if ('authors' in item) {
                    this.innerHTML += '<span style="opacity: 0.5"> by ' + item.authors.map((a) => '<sp-link uri="' + a.uri + '">' + a.name + '</sp-link>').join(', ') + '</span>';
                }
                if ('for' in item) {
                    this.innerHTML += '<span style="opacity: 0.5"> by ' + '<sp-link uri="' + item['for'].uri + '">' + item['for'].name + '</sp-link>' + '</span>';
                }
                
                this.ul = document.createElement('ul');
                this.appendChild(this.ul);
                this.ul.style.display = 'none';
                this.setAttribute('uri', this.state.uri);
                if ('rows' in item) {
                    this.expander = document.createElement('sp-expander');
                    this.expander.setAttribute('data-uri', item.uri);
                    this.appendChild(this.expander);
                }
                if (item.rows != null) {
                    for (let j = 0; j < this.parentNode._dataSource.getNumberOfRows(item); j++) {
                        let subMenuItem = document.createElement('sp-menuitem');
                        subMenuItem.setAttribute('data-parent-uri', item.uri);
                        subMenuItem.style.paddingLeft = '20pt';
                        let subItem = this.parentNode._dataSource.getRowAt(j, item);
                        subMenuItem.setState(subItem);
                        this.subitems.push(subMenuItem);
                    }
                }
            }
        }
        get open() {
            return this.getAttribute('open') == 'true';
        }
        set open(val) {
            this.setAttribute('open', val ? 'true' : 'false');
        }
        attributeChangedCallback(attrName, oldVal, newVal) {
            if (attrName === 'open') {
                if (newVal == 'true') {
                    this.showChildren();
                } else {
                    this.hideChildren();
                }
            }
        }
        showChildren() {
            let prevItem = this;
            for (let subItem of this.subitems) {
                insertAfter(subItem, prevItem);
                prevItem = subItem;
            }
        }
        hideChildren() {
            for (let subitem of this.subitems) {
                this.parentNode.removeChild(subitem);
            }
        }
        addChild(item) {
            this.ul.style.display = 'block';
            let li = document.createElement('li');
            this.ul.appendChild(li);
            li.appendChild(item);
        }
    }


function insertAfter(newNode, referenceNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}
export default class SPDialogElement extends HTMLElement {
    connectedCallback() {
        this._warned = false;
        this.header = document.createElement('div');
        this.appendChild(this.header);
        this.header.classList.add('header');
        this.header.innerHTML = this.label;
        this.header.style.paddingTop = "5pt";
        this.header.style.textAlign = 'center';
        this.content = document.createElement('sp-viewstack');
        this.content.style.flex = "2";
        this.content.style.padding= "3pt";
        this.appendChild(this.content);
        this.infoBar = document.createElement('sp-infobar');
        this.infoBar.innerHTML = _e("Don't you want to save your changes?");
        this.appendChild(this.infoBar);
        this.footer = document.createElement('div');
        this.footer.style.textAlign = 'center';
        this.appendChild(this.footer);
        this.header.style.flex ="0 0 28pt";
        this.content.style.flex = "2";
        this.infoBar.style.display = 'none';
        this.footer.style.flex = "0 0 28pt";
        this.footer.classList.add('footer');
        this.submitButton = document.createElement('button');
        this.submitButton.classList.add('btn');
        this.submitButton.classList.add('btn-primary');
        this.submitButton.setAttribute('type', 'submit');
        this.submitButton.innerHTML = 'Submit';
        this.submitButton.addEventListener('click', (e) => {
            this.querySelector('sp-form').save().then((obj) => {
                this.close(true);
                setTimeout(function () {
                }, 1000);
                
            }, (e) => {
                console.log(e);
            });
        })
        this.addEventListener('mousedown', (e) => {
            if (e.target == this)
            this.warned = false;
        });
        this.footer.appendChild(this.submitButton);
        $(this).css({top: '-100%'});
        this.cancelButton = document.createElement('button');
        this.cancelButton.innerHTML = 'Cancel';
        this.cancelButton.addEventListener('click', () => {
            this.close();
            
        })
        this.cancelButton.style.display = 'inline-block';
        this.footer.appendChild(this.cancelButton);
        
    }
    get warned() {
        return this._warned;
    }
    set warned(value) {
        this._warned = value;
        this.infoBar.style.display = value ? 'block' : 'none';
    }
    get label() {
        return this.header.innerHTML;
    }
    set label(value) {
        this.header.innerHTML = value;
    }
    show() {
        $(this).animate({
            'top': '50%',
            'opacity': 1
        }, 1000, () => {
            
        });
        
    }
    close(force=false) {
        if (!this.warned && !force) {
            this.warned = true;
            return false;
        }
        $(this).animate({
            'top': '-100%',
            'opacity': 0
        }, 1000, () => {
            if (this.parentNode)
        this.parentNode.removeChild(this);
        });
        if (this.onclose != null) {
            this.onclose(force)
        }
        return true;
    }
    navigate(uri) {
        this.content.navigate(uri, true);
    }
    attributeChangedCallback(attrName, oldVal, newVal) {
        if (attrName === 'uri') {
            this.navigate(newVal);
        }
    }
}    
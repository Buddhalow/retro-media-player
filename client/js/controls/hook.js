
/**
 * An hook element is a placeholder that allows other
 * plugins to hook into these and place custom components into other components
 **/
export default class SPHookElement extends HTMLElement {

    get chrome() {
        return document.querySelector('sp-chrome');
    }
    set id(value) {
        this.setAttribute('data-hook-id', value);
    }
    get id() {
        return this.getAttribute('data-hook-id');
    }
    setState(state) {
        this.innerHTML = '';
        let e = new CustomEvent('hook_' + this.getAttribute('data-hook-id'));
        e.data = state;
        document.dispatchEvent(e);
        this.attributeChangedCallback('uri', null, this.getAttribute('uri'));
    }
    attributeChangedCallback(attrName, oldVal, newVal) {
        if (attrName === 'uri') {
            let controls = this.querySelectorAll('.sp-view');
            for (let control of controls) {
                control.setAttribute('uri', newVal);
            }
        }
    }
    connectedCallback() {
        if (!this.created) {
            for (let i = 0 ; i < 5; i++) {
                let e = new CustomEvent('hook_' + this.getAttribute('data-hook-id'));
                e.view = this.view;
                e.priority = i;
                document.dispatchEvent(e);
                this.created = true;
            }
        }
    }
    render() {
    }
}

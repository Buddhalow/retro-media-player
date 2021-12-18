import { getParentElementByTagName } from '/js/util/dom.js'
import SPContextMenuElement from "/js/controls/contextmenu.js";

export default class SPLinkElement extends HTMLElement {
    onClick(e) {
        e.preventDefault();
        if (this.getAttribute('uri').indexOf('http') == 0) {
            window.open(this.getAttribute('uri'));
        }
        GlobalViewStack.navigate(this.getAttribute('uri'));
    }
    connectedCallback() {
        this.addEventListener('click', this.onClick);
        this.attributeChangedCallback('uri', null, this.getAttribute('uri'));
        this.setAttribute('draggable', true);
        this.addEventListener('dragstart', (e) => {
            let text = e.target.getAttribute('uri');
            try {
                event.dataTransfer.setData("Text", text);
                let dragElement = document.createElement('sp-dragelement');
                dragElement.innerHTML = this.innerHTML;
                document.body.appendChild(dragElement);
                event.dataTransfer.setDragImage(dragElement, 2, 2);
            } catch (e) {
                console.log(e);
            }
        })
        this.addEventListener('contextmenu', (e) => {

            let menu = SPContextMenuElement.show({x: e.pageX, y: e.pageY}, {
                uri: this.getAttribute('uri')
            }, [
                {
                    label: _('Goto'),
                    onCommand(e) {
                        window.GlobalViewStack.navigate(e.object.uri)
                        console.log(e);
                    }
                },
                {
                    label: _('Copy URI'),
                    onCommand(e) {
                        let uri = e.object.uri;
                        navigator.permissions.query({name: "clipboard-write"}).then(result => {
                            if (result.state === "granted" || result.state === "prompt") {
                                navigator.clipboard.writeText(uri);
                            }
                        });
                    }
                },
                {
                    label: _('-'),
                    onCommand(e) {
                        console.log(e);
                    }
                },
                {
                    label: _('Share to'),
                    onCommand(e) {
                        console.log(e);
                    },
                }
            ])
        })
    }
    attributeChangedCallback(attrName, oldVal, newVal) {
        if (attrName === 'uri') {
            let viewstack = getParentElementByTagName(this, "sp-viewstack");
            try {
                if (!!viewstack && viewstack.isLinkValid(newVal)) {

                    this.classList.add('sp-invalid-link');
                } else {
                    this.classList.remove('sp-invalid-link');
                }
            } catch (e) {

            }
        }

    }
    disconnectedCallback() {
        this.removeEventListener('click', this.onClick);
    }
}

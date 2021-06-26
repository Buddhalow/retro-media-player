import SPContextMenuElement from "/js/controls/contextmenu.js";


class SPContextMenuItemElement extends HTMLElement {
    connectedCallback() {
        if (!this.created) {
            this.created = new Date();
            var enterTimeout = null;
            this.addEventListener('mouseenter', (e) => {
                if (this.subMenu instanceof SPContextMenuElement) {
                    enterTimeout = setTimeout(
                        () => {
                            $(this.subMenu).fadeIn();
                        }, 500
                    )
                }
            })
            this.addEventListener('mouseleave', (e) => {
                if (this.subMenu instanceof SPContextMenuElement) {
                    clearTimeout(enterTimeout);
                    if (!(e.pageX > this.subMenu.getBoundingClientRect().left && e.pageX < this.subMenu.getBoundingClientRect().right &&
                        e.pageY > this.subMenu.getBoundingClientRect().top && e.pageY < this.subMenu.getBoundingClientRect().bottom
                    )) {
                        $(this.subMenu).fadeOut();
                    }
                }
            })
            this.addEventListener('mouseup', (e) => {
                if (this.item && this.item.onCommand instanceof Function) {
                    this.item.onCommand({
                        target: e.target,
                        targetEvent: e,
                        object: this.object,
                        obj: this.obj
                    })
                }
            });

        }
    }
    render() {
        if ('menuItems' in this.item && this.item.menuItems.length > 0) {
            let subMenu = document.createElement('sp-contextmenu');
            subMenu.object = this.object;
            setTimeout(() => {
                subMenu.style.left = (this.parentNode.getBoundingClientRect().right - 3) + 'px';


                subMenu.style.top = this.getBoundingClientRect().top + 'px';
            }, 100);
            this.subMenu = subMenu;
            this.subMenu.setMenuItems(this.item.menuItems);
            document.body.appendChild(subMenu);


        }
    }
}
export default SPContextMenuItemElement;

export default class SPRightSidebarElement extends HTMLElement {
     connectedCallback() {
        
        this.tabBar = document.createElement('sp-tabbar');
        this.tabBar.classList.add('sp-2009')
        this.tabBar.innerHTML = '&nbsp;';
        this.tabBar.style.height = '16pt';
        this.appendChild(this.tabBar);
        this.menu = document.createElement('sp-hook');
        this.menu.setAttribute('data-hook-id', 'rightsidebar');
        this.appendChild(this.menu);
    }
}

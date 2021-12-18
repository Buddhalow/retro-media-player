export default class SPMainElement extends HTMLElement {
    connectedCallback() {
        this.floatingBar =  document.createElement('sp-floatingbar');
        this.appendChild(this.floatingBar)
        this.tabBar = document.createElement('sp-tabbar');
        this.tabBar.classList.add('sp-2013-hidden');
        this.tabBar.classList.add('sp-2014-hidden');
        this.appendChild(this.tabBar);
        this.tabBar.classList.add('global')
        window.GlobalTabBar = this.tabBar;
        this.viewStack = document.createElement('sp-viewstack');
        
        window.GlobalViewStack = this.viewStack;
        document.dispatchEvent(new CustomEvent('viewstackloaded')); 
        this.appendChild(this.viewStack);
        var $body = $('.mainbody');
        $body.fadeIn("slow");    
    
    }
}

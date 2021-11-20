import { VERIFIED_PROFILES } from '/js/constants.js'

	export default class SPTabBarElement extends HTMLElement {
	    connectedCallback() {
            this.titleBar = document.createElement('div');
            this.appendChild(this.titleBar);
			this.created = true;
			this.classList.add('container')
	    }
	    attachedCallback() {

            $(this.parentNode).scroll(this._onScroll.bind(this));
	    }
	    _onScroll(e) {
	        let view = this.parentNode;
	        let viewBounds = view.getBoundingClientRect();
	        let bounds = this.getBoundingClientRect();
	        let tabBar = window.GlobalTabBar.getBoundingClientRect();
	        let headerHeight = 0;
	        this.headers = this.parentNode.getElementsByTagName('sp-header');
	        if (this.headers.length > 0) {
	        	this.header = this.headers[0];
	        }
	        if (this.header) {
	            headerHeight = this.header.getBoundingClientRect().height;
	        } else {
	        	headerHeight = 0;
	        }

	        if (view.scrollTop > headerHeight ) {

	            view.style.display = 'block';
	            let transform = 'translateY(' + ( view.scrollTop - headerHeight) + 'px)';
	            this.style.transform = transform;
	        } else {
	            this.style.transform = 'translateY(0px)';
	        }
	        let gondole = this.querySelector('sp-gondole');
	        if (gondole && gondole.getBoundingClientRect().top < viewBounds.top + viewBounds.height) {
	            if (!gondole.hasAttribute('activated'))
	            this.fetchNext();
	        }

	    }

	    get titleVisible() {
	        return this.titleBar.style.visibility == 'visible';
	    }
	    set titleVisible(val) {
	        this.titleBar.style.visibility = val ? 'visible': 'hidden';

	    }
	    get title() {
	        return this.titleBar.innerHTML;
	    }
	    set title(value) {
	        this.titleBar.innerHTML = value;
	    }
	    setState(state, g=false) {
			if (this.parentNode && this.parentNode.tagName != 'SP-MAIN') {
				GlobalTabBar.setState(state, true)
			}

	        this.innerHTML = '';
	        this.titleBar = document.createElement('div');
	        this.titleBar.style.visibility = 'hidden';
	        this.titleBar.style.paddingRight = '113pt';
	        this.titleBar.style.paddingTop = '-12px';
	        this.innerHTML = '<div class="sp-2012"></div>';
	        //this.appendChild(this.titleBar);
	        if (state.object instanceof Object) {
				if (state.object.images && state.object.images.length > 0) {
					let image_url = state.object.images[0].url;
					this.titleBar.innerHTML = '<img style="display: inline-block; float: left; margin-top: -3pt; margin-right: 10pt" src="' + image_url + '" width="24pt" height="24pt" />';
				}
				if (state.object.name != null) {
					this.titleBar.innerHTML += '<span>' + state.object.name + '</span>';
					if (VERIFIED_PROFILES.filter((o) => (state.object.id === o)).length > 0) {
						this.titleBar.innerHTML += ' <i class="fa fa-check-circle new"></i>';
					}

				}
			}
	        var view = window.GlobalViewStack.currentView;
	        var extraTabs = view.extraTabs;
	        if (extraTabs instanceof Array) {
	        	extraTabs.map((tab) => {
					tab.addon = true
	        		state.objects.push(tab);
	        	});
	        }

	        if (state && state.objects instanceof Array && state.objects.length > 0) {
	            for (let i = 0; i < state.objects.length; i++) {
	            	let currentId = window.location.hash.substr(1);
	            	if (!currentId) currentId = 'overview';
	                let obj = state.objects[i];
	                let tab = document.createElement('sp-tab');
	                tab.setAttribute('data-tab-id', obj.id);

	                tab.innerHTML = _e(obj.name);
	                tab.addEventListener('tabselected', (e) => {
	                    window.location.hash = '#' + e.data;
	                });
	                if (obj.id == currentId) tab.classList.add('sp-tab-active');
					this.appendChild(tab);
					if (obj.addon) tab.classList.add('addon')
	                this.setAttribute('hidden', false);
	            }
	        } else {
	                this.setAttribute('hidden', true);
	        }
	    	this.spacer = document.createElement('div');
	    	this.appendChild(this.spacer);
	    	this.spacer.style.flex = '5';
	    	if (!!state && !!state.object) {
	    		this.objectLink = document.createElement('div');
	    		this.objectLink.style.paddingRight = '3pt';
	    		this.objectLink.classList.add('sp-2009');
	    		let extended = false;
	    		for (let k of ['artist', 'album', 'artists', 'user', 'owner', 'playlist', 'context']) {
		    		if (k in state.object && !!state.object[k]) {
		    			let objs = state.object[k];
		    			if (objs instanceof Array) {

		    			} else {
		    				objs = [objs];
		    			}
		    			this.objectLink.innerHTML += objs.map((obj) => '<sp-link style="font-weight: bold" uri="' + obj.uri + '">' + obj.name + '</sp-link>').join(', ');
		    			this.objectLink.innerHTML += '<span style="padding-left: 5pt; padding-right: 5pt">&raquo;</span>';
		    			this.objectLink.innerHTML += '<sp-link style="font-weight: bold" uri="' + state.object.uri + '">' + state.object.name + '</sp-link>';
		    			extended = true;
		    		}
	    		}
	    		if (!extended) {
	    			this.objectLink.innerHTML += '<sp-link style="font-weight: bold" uri="' + state.object.uri + '">' + state.object.name + '</sp-link>'
	    		}
	    		this.appendChild(this.objectLink);
	    	}


	    	if (!!state && !!state.add) {
	    		this.addTab = document.createElement('sp-tab');
	    		this.appendChild(this.addTab);
	    		this.addTab.style.cssFloat = 'right';
	    		this.addTab.innerHTML = _e('Add ') + ' ';
	    		this.addTab.addEventListener('click', (e) => {
	    			let dialog = document.createElement('sp-modal');
    				dialog.label = _e('Add ') + ' ' + this.model;
	                document.body.appendChild(dialog);
                	dialog.show();
	                dialog.navigate(state.add.uri);
	    		})

	    	} else {
	    		try {
	    		if (!!this.addTab) {
	    			this.addTab.parentNode.removeChild(this.addTab);
	    		}
	    		} catch (e) {

	    		}
	    	}
    		this.toggleSidebar = document.createElement('sp-tab');
	    	this.toggleSidebar.cssFloat = 'right';
	    	this.toggleSidebar.innerHTML = '<i class="fa fa-info"></i>';
	    	this.toggleSidebar.addEventListener('click', (e) => {
	    		$('sp-rightsidebar').css({display: $('sp-rightsidebar').css('display') === 'block' ? 'none' : 'block'})
	    	})
	 		this.appendChild(this.toggleSidebar);

	        var spacing = document.createElement('div');
	        spacing.classList.add('sp-2012');
	        this.appendChild(spacing);

	    }
	}

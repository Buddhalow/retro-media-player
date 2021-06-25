
    export default class SPToolButtonElement extends HTMLElement {
        connectedCallback() {
            this.addEventListener('click', (e) => {
                GlobalViewStack.navigate(this.state.uri);
            });
        
        }
        setState(state) {
            this.state = state;
            this.render();
        }
        render() {
            if (this.state.image_url instanceof String) {
                this.innerHTML = '<img src="' + this.state.image_url + '" width="16pt">';
                return;
            }
            this.innerHTML = '<i class="fa fa-' + this.state.icon + '">&nbsp;</i>';
            
        }
    }    

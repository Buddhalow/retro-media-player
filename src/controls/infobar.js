
    export default class SPInfoBarElement extends HTMLElement {
        hide() {
            this.style.display = 'none';
        }
        show() {
            this.style.display = 'block';
        }
        flash() {
            this.classList.add('flashing')
            setTimeout(() => {
                this.classList.remove('flashing')
            }, 1000)
        }
        setState(obj) {
            this.innerHTML = '';
            this.innerHTML = '<i class="fa fa-flag" style="color: #aa1100"></i> ' + obj.name;
            this.closeButton = document.createElement('a');
            this.appendChild(this.closeButton);
            this.closeButton.classList.add('fa');
            this.closeButton.classList.add('fa-times');
            this.closeButton.style = 'float: right';
            this.closeButton.style.backgroundColor = '#888';
            this.closeButton.style.padding = '2pt'
            this.closeButton.style.borderRadius = '12pt'
            this.closeButton.addEventListener('click', (e) => {
                this.hide();
            });
        }
    }

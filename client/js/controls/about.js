export default class SPAboutElement extends HTMLElement {
    attachedCallback() {
        
    }
    setState(obj) {
        this.innerHTML = 
            '<div class="container">' + 
                '<div class="row">' +
                    '<div class="col-md-6">' + 
                        '<h3>' + numeral(obj.monthlyListners).format('0,0') + '</h3>' +
                        '<small>monthly listeners</small>' + 
                    '</div>' +
                '</div>' +
            '</div>';
                    
    }
}


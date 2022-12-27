import SPResourceElement from '/js/controls/resource.js';
import { loadTemplate } from '/js/util/template.js'

function swatchToColor(color) {
    return 'rgba(' + color.rgb[0] + ',' + color.rgb[1] + ',' + color.rgb[2] + ', 0.3)';
}


function rgbToRgba(rgb, alpha) {
    let str = 'rgba';
    let tf = rgb.split('(')[1].split(')')[0].split(',');
    str += '(' + tf + ',' + alpha + ')';
    return str;

}

export default class SPPlaylistElement extends SPResourceElement {
    
    get columnheaders() {
        if (!this.table)    
            return this._columnheaders;
        return this.table.columnheaders;
    }
    set columnheaders(value) {
        if (!this.table) {
            this._columnheaders = value;
            return; 
        }
        this.table.columnheaders = value;
    }
    async render() {
        if (!this?.state?.object) {

            return;
        }
        let obj = this?.state?.object;
        let strReleaseDate = '';
        if (obj.release_date instanceof String) {
            strReleaseDate = obj.release_date;
            let releaseDate = moment(obj.release_date);
            if (Math.abs(releaseDate.diff(moment(), 'days')) < 15) {
                strReleaseDate = releaseDate.fromNow();
            }
        }
        let titleElement = document.createElement('sp-title');
        titleElement.setState(obj);
        let dataContextUri = this.getAttribute('data-context-artist-uri') || null;
        let maxRows = this.getAttribute("data-max-rows");

        this.innerHTML = '';
        let fields =  this.getAttribute('fields');
        this.object = obj;
        let template = await loadTemplate('/js/plugins/spotify/templates/playlist.ejs')
        let html = template({
            title: titleElement.innerHTML,
            strReleaseDate: strReleaseDate,
            fields: fields,
            maxRows: maxRows,
            limit: this.limit || 50,
            width: getComputedStyle(document.body).getPropertyValue('--image-size'),
            height: getComputedStyle(document.body).getPropertyValue('--image-size'),
            obj: obj,
            dataContextUri: dataContextUri
        });
        this.innerHTML = html
        console.log(html)
        this.trackcontext = this.querySelector('sp-trackcontext') 
        if (obj.type == 'audiobook') {
            let img  = this.querySelector('sp-image')
            img.style.height = parseInt(img.style.width) * 1.8 + 'px'
        }
        if (this.view != null && localStorage.getItem('vibrance') == 'true') {
            this.vibrance();
        }
    }
    vibrance() {
        let img = document.createElement('img');
        img.crossOrigin = '';
        img.src = this.object.images[0].url;
        img.onload = () => {

            var vibrant = new Vibrant(img);
            let color = vibrant.swatches()['Vibrant'];
            let light = vibrant.swatches()['LightVibrant'];
            let muted = vibrant.swatches()['Muted'];

            let bgColor = swatchToColor(color);

            //    this.view.style.backgroundColor = bgColor;
            let background = 'linear-gradient(-90deg, ' + swatchToColor(color) + ' 0%, ' + swatchToColor(muted) + ' 10%)';
            this.view.style.background = background;
        }
    }
}


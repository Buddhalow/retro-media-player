import SPTableDesigner from '/js/controls/tabledesigner.js';
import { stringToHHMMSS } from '/js/util/string.js'

export default class SPResourceTableDesigner extends SPTableDesigner {
  getHeaderRow() {
      let tr = document.createElement('tr');

      return tr;
  }
  getColumnElementAt(index) {
      let th = document.createElement('th');
      th.innerHTML = this.table.columnheaders[index];
      return th;
  }

  getRowElement(row) {
      let tr = document.createElement('tr');
      tr.setAttribute('data-uri', row.uri);
      tr.created = true;
      if (window.infectedResources.indexOf(row.uri) != -1) {
          tr.classList.add('sp-infected')
      }
      return tr;

  }
  getCellElement(columnIndex, track) {
      var td = document.createElement('td');
        let val = '';
        let field = this.table.columnheaders[columnIndex];
        val = track[field];
        if (field === 'icon') {
            td.width = '10pt';
            td.innerHTML = '<i class="fa fa-list"></i>';
          
        
        } else if (field === 'p' || field === 'position') {
            td.width = '31pt';
            if (parseInt(val) < 10) {
                val = '0' + val;
            }
            td.innerHTML = '<span style="text-align: right; opacity: 0.5">' + val + '</span>';
        } else if (field === 'duration') {
            td.innerHTML = '<span style="opacity: 0.5">' + stringToHHMMSS(val + '') + '</span>';
            td.width = '10pt';
        } else if (field === 'popularity') {
            td.innerHTML = '<sp-popularitybar value="' + (track.popularity || 0) + '"></sp-popularitybar>';
        } else if (field === 'discovered') {
            let discoverLevel = 0;
            td.width = "10pt";
            td.classList.add('discovered');
            let discovered = store.hasDiscoveredTrack(track, this.playlist);
              
            if (!discovered) {
                store.discoverTrack(track, this.playlist);
                val = ''; // '<i class="fa fa-circle new"></i>';
            } else {
                val = "";
            }
            td.innerHTML = val;
        } else if ((field === 'time' || field == 'added_at') && !!val) {
            let date = moment(val);
            let now = moment();
          let dr = Math.abs(date.diff(now, 'days'));
          let fresh = Math.abs(date.diff(now, 'days'));
          let tooOld = dr > 1;
            let strTime = dr ? date.format('YYYY-MM-DD') : date.fromNow();
            td.innerHTML = '<span>' + strTime + '</span>';
            if (tooOld) {
                td.querySelector('span').style.opacity = 0.5;
            }
      
            
        } else if (typeof(val) === 'string') {
          td.innerHTML = '<span>' + val + '</span>';
        } else if (val instanceof Array) {
           td.innerHTML = val.filter(o => {
              if (!this.table.hasAttribute('data-context-artist-uri'))
                  return true;
              return o.uri != this.table.getAttribute('data-context-artist-uri')
               
           }).map((v, i) => {
              
               return '<sp-link uri="' + v.uri + '">' + v.name + '</sp-link>'
          }).join(', '); 
        } else if (val instanceof Object) {
            if (val) {
            td.innerHTML = '<sp-link uri="' + val.uri + '">' + val.name + '</sp-link>'; 
            } else {
                td.innerHTML = '&nbsp;';
            }
        } else {
          td.innerHTML = '';
        }
        if (field === 'name') {
          td.width = '500pt';
      }
     
        var event = new CustomEvent('cellcreated', {field: field, track: track, cell: td});
        document.dispatchEvent(event);
        return td;
  }
}

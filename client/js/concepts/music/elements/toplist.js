import SPResourceElement from '/js/controls/resource.js';
import store from '/js/concepts/music/store.js';
export default class SPTopListElement extends SPResourceElement {
  connectedCallback() {
    if (!this.created) {
      this.innerHTML = `
        <table style="width: 100%" border="0">
          <tbody>
            <tr>
              <td>
                  <sp-trackcontext expands="true" showcolumnheaders="false" style="width: 100%" fields="name" type="toplist" uri="music:country:se:top:5:track"></sp-trackcontext>
              </td>
              <td>
                  <sp-trackcontext expands="true" showcolumnheaders="false" style="width: 100%" fields="name" type="toplist" uri="music:country:se:top:5:track"></sp-trackcontext>
              </td>
            </tr>
          </tbody>
        </table>
      `
      this.contexts = document.querySelectorAll('sp-trackcontext');
      this.contexts[0].setAttribute('zebra', "true");
      this.contexts[1].setAttribute('zebra', "true");
      this.created = new Date();
    }
  }
}
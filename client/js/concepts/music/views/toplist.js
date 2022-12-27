import SPViewElement from '/js/controls/view.js';
import store from '/js/concepts/music/store.js';
export default class SPTopListViewElement extends SPViewElement {
  connectedCallback() {
    if (!this.created) {
      this.classList.add('sp-view');
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
  render() {

  }
}
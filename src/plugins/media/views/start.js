import SPViewElement from "@/controls/view.js";
import { testBungalowUri } from "@/util.js";
import store from "@/plugins/media/store.js";

export default class SPSpotifyStartViewElement extends SPViewElement {
  acceptsUri(uri) {
    return testBungalowUri(/start/, uri);
  }
  navigate() {}
  connectedCallback() {
    let featured = store.request("GET", "spotify:featured:playlist");
    console.log("featured", featured);
    this.innerHTML += `<sp-tabcontent data-tab-id="overview"><div class="container"><sp-divider>${_e(
      featured.message
    )}</sp-divider><sp-flow uri="spotify:featured:playlist" limit="6"></sp-flow><sp-divider>${_e(
      "categories"
    )}</sp-divider><sp-flow uri="spotify:category"></sp-flow></div></sp-tabcontent>`;
  }
}

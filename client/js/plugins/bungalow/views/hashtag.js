import SPViewElement from "/js/controls/view.js";
import { testBungalowUri } from "/js/util.js";

class SPHashtagViewElement extends SPViewElement {
  acceptsUri(uri) {
    return testBungalowUri(/hashtag:([a-zA-Z0-9]+)$/, uri);
  }
  attributeChangedCallback(attrName, oldVal, newVal) {
    super.attributeChangedCallback(attrName, oldVal, newVal);
    if (attrName === "uri") {
      let hashtag = newVal.split(":")[2];
      this.header.setState({
        type: "hashtag",
        name: "#" + hashtag,
        id: "hashtag",
        uri: "bungalow:hashtag:" + hashtag,
        images: [
          {
            url: "",
          },
        ],
      });
    }
  }
  connectedCallback() {
    this.classList.add("sp-view");
    this.header = document.createElement("sp-header");
    this.appendChild(this.header);
    this.hook = document.createElement("sp-hook");
    this.hook.setAttribute("data-hook-id", "hashtag_view");
    this.hook.view = this;
    this.appendChild(this.hook);
  }
}
export default SPHashtagViewElement;

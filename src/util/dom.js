export function getParentElementByTagName (elm, tagName) {
    while (elm && elm.tagName !== tagName) {
        elm = elm.parentNode;
    }
    return elm;
}

export function getParentElementByClass (elm, tagName) {
    try {
        while (!!elm && !elm.classList.contains(tagName)) {
            elm = elm.parentNode;
        }
    } catch (e) {
        
    }
    return elm;
}

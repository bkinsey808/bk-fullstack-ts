/* */ 
"format cjs";
import { BaseException, isBlank } from 'angular2/src/facade/lang';
export var DOM;
export function setRootDomAdapter(adapter) {
    if (isBlank(DOM)) {
        DOM = adapter;
    }
}
function _abstract() {
    return new BaseException('This method is abstract');
}
/* tslint:disable:requireParameterType */
/**
 * Provides DOM operations in an environment-agnostic way.
 */
export class DomAdapter {
    hasProperty(element, name) { throw _abstract(); }
    setProperty(el, name, value) { throw _abstract(); }
    getProperty(el, name) { throw _abstract(); }
    invoke(el, methodName, args) { throw _abstract(); }
    logError(error) { throw _abstract(); }
    log(error) { throw _abstract(); }
    logGroup(error) { throw _abstract(); }
    logGroupEnd() { throw _abstract(); }
    /**
     * Maps attribute names to their corresponding property names for cases
     * where attribute name doesn't match property name.
     */
    get attrToPropMap() { throw _abstract(); }
    parse(templateHtml) { throw _abstract(); }
    query(selector) { throw _abstract(); }
    querySelector(el, selector) { throw _abstract(); }
    querySelectorAll(el, selector) { throw _abstract(); }
    on(el, evt, listener) { throw _abstract(); }
    onAndCancel(el, evt, listener) { throw _abstract(); }
    dispatchEvent(el, evt) { throw _abstract(); }
    createMouseEvent(eventType) { throw _abstract(); }
    createEvent(eventType) { throw _abstract(); }
    preventDefault(evt) { throw _abstract(); }
    isPrevented(evt) { throw _abstract(); }
    getInnerHTML(el) { throw _abstract(); }
    getOuterHTML(el) { throw _abstract(); }
    nodeName(node) { throw _abstract(); }
    nodeValue(node) { throw _abstract(); }
    type(node) { throw _abstract(); }
    content(node) { throw _abstract(); }
    firstChild(el) { throw _abstract(); }
    nextSibling(el) { throw _abstract(); }
    parentElement(el) { throw _abstract(); }
    childNodes(el) { throw _abstract(); }
    childNodesAsList(el) { throw _abstract(); }
    clearNodes(el) { throw _abstract(); }
    appendChild(el, node) { throw _abstract(); }
    removeChild(el, node) { throw _abstract(); }
    replaceChild(el, newNode, oldNode) { throw _abstract(); }
    remove(el) { throw _abstract(); }
    insertBefore(el, node) { throw _abstract(); }
    insertAllBefore(el, nodes) { throw _abstract(); }
    insertAfter(el, node) { throw _abstract(); }
    setInnerHTML(el, value) { throw _abstract(); }
    getText(el) { throw _abstract(); }
    setText(el, value) { throw _abstract(); }
    getValue(el) { throw _abstract(); }
    setValue(el, value) { throw _abstract(); }
    getChecked(el) { throw _abstract(); }
    setChecked(el, value) { throw _abstract(); }
    createComment(text) { throw _abstract(); }
    createTemplate(html) { throw _abstract(); }
    createElement(tagName, doc = null) { throw _abstract(); }
    createTextNode(text, doc = null) { throw _abstract(); }
    createScriptTag(attrName, attrValue, doc = null) {
        throw _abstract();
    }
    createStyleElement(css, doc = null) { throw _abstract(); }
    createShadowRoot(el) { throw _abstract(); }
    getShadowRoot(el) { throw _abstract(); }
    getHost(el) { throw _abstract(); }
    getDistributedNodes(el) { throw _abstract(); }
    clone /*<T extends Node>*/(node /*T*/) { throw _abstract(); }
    getElementsByClassName(element, name) { throw _abstract(); }
    getElementsByTagName(element, name) { throw _abstract(); }
    classList(element) { throw _abstract(); }
    addClass(element, classname) { throw _abstract(); }
    removeClass(element, classname) { throw _abstract(); }
    hasClass(element, classname) { throw _abstract(); }
    setStyle(element, stylename, stylevalue) { throw _abstract(); }
    removeStyle(element, stylename) { throw _abstract(); }
    getStyle(element, stylename) { throw _abstract(); }
    tagName(element) { throw _abstract(); }
    attributeMap(element) { throw _abstract(); }
    hasAttribute(element, attribute) { throw _abstract(); }
    getAttribute(element, attribute) { throw _abstract(); }
    setAttribute(element, name, value) { throw _abstract(); }
    removeAttribute(element, attribute) { throw _abstract(); }
    templateAwareRoot(el) { throw _abstract(); }
    createHtmlDocument() { throw _abstract(); }
    defaultDoc() { throw _abstract(); }
    getBoundingClientRect(el) { throw _abstract(); }
    getTitle() { throw _abstract(); }
    setTitle(newTitle) { throw _abstract(); }
    elementMatches(n, selector) { throw _abstract(); }
    isTemplateElement(el) { throw _abstract(); }
    isTextNode(node) { throw _abstract(); }
    isCommentNode(node) { throw _abstract(); }
    isElementNode(node) { throw _abstract(); }
    hasShadowRoot(node) { throw _abstract(); }
    isShadowRoot(node) { throw _abstract(); }
    importIntoDoc /*<T extends Node>*/(node /*T*/) { throw _abstract(); }
    adoptNode /*<T extends Node>*/(node /*T*/) { throw _abstract(); }
    isPageRule(rule) { throw _abstract(); }
    isStyleRule(rule) { throw _abstract(); }
    isMediaRule(rule) { throw _abstract(); }
    isKeyframesRule(rule) { throw _abstract(); }
    getHref(element) { throw _abstract(); }
    getEventKey(event) { throw _abstract(); }
    resolveAndSetHref(element, baseUrl, href) { throw _abstract(); }
    cssToRules(css) { throw _abstract(); }
    supportsDOMEvents() { throw _abstract(); }
    supportsNativeShadowDOM() { throw _abstract(); }
    getGlobalEventTarget(target) { throw _abstract(); }
    getHistory() { throw _abstract(); }
    getLocation() { throw _abstract(); }
    getBaseHref() { throw _abstract(); }
    resetBaseElement() { throw _abstract(); }
    getUserAgent() { throw _abstract(); }
    setData(element, name, value) { throw _abstract(); }
    getData(element, name) { throw _abstract(); }
    setGlobalVar(name, value) { throw _abstract(); }
}
//# sourceMappingURL=dom_adapter.js.map
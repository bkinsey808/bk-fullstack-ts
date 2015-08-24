/* */ 
"format cjs";
import { StringWrapper, isPresent, isBlank } from 'angular2/src/facade/lang';
import { DOM } from 'angular2/src/dom/dom_adapter';
import { ListWrapper } from 'angular2/src/facade/collection';
export const NG_BINDING_CLASS_SELECTOR = '.ng-binding';
export const NG_BINDING_CLASS = 'ng-binding';
export const EVENT_TARGET_SEPARATOR = ':';
export const NG_CONTENT_ELEMENT_NAME = 'ng-content';
export const NG_SHADOW_ROOT_ELEMENT_NAME = 'shadow-root';
const MAX_IN_MEMORY_ELEMENTS_PER_TEMPLATE = 20;
var CAMEL_CASE_REGEXP = /([A-Z])/g;
var DASH_CASE_REGEXP = /-([a-z])/g;
export function camelCaseToDashCase(input) {
    return StringWrapper.replaceAllMapped(input, CAMEL_CASE_REGEXP, (m) => { return '-' + m[1].toLowerCase(); });
}
export function dashCaseToCamelCase(input) {
    return StringWrapper.replaceAllMapped(input, DASH_CASE_REGEXP, (m) => { return m[1].toUpperCase(); });
}
// Attention: This is on the hot path, so don't use closures or default values!
export function queryBoundElements(templateContent, isSingleElementChild) {
    var result;
    var dynamicElementList;
    var elementIdx = 0;
    if (isSingleElementChild) {
        var rootElement = DOM.firstChild(templateContent);
        var rootHasBinding = DOM.hasClass(rootElement, NG_BINDING_CLASS);
        dynamicElementList = DOM.getElementsByClassName(rootElement, NG_BINDING_CLASS);
        result = ListWrapper.createFixedSize(dynamicElementList.length + (rootHasBinding ? 1 : 0));
        if (rootHasBinding) {
            result[elementIdx++] = rootElement;
        }
    }
    else {
        dynamicElementList = DOM.querySelectorAll(templateContent, NG_BINDING_CLASS_SELECTOR);
        result = ListWrapper.createFixedSize(dynamicElementList.length);
    }
    for (var i = 0; i < dynamicElementList.length; i++) {
        result[elementIdx++] = dynamicElementList[i];
    }
    return result;
}
export class ClonedProtoView {
    constructor(original, fragments, boundElements, boundTextNodes) {
        this.original = original;
        this.fragments = fragments;
        this.boundElements = boundElements;
        this.boundTextNodes = boundTextNodes;
    }
}
export function cloneAndQueryProtoView(templateCloner, pv, importIntoDocument) {
    var templateContent = templateCloner.cloneContent(pv.cloneableTemplate, importIntoDocument);
    var boundElements = queryBoundElements(templateContent, pv.isSingleElementFragment);
    var boundTextNodes = queryBoundTextNodes(templateContent, pv.rootTextNodeIndices, boundElements, pv.elementBinders, pv.boundTextNodeCount);
    var fragments = queryFragments(templateContent, pv.fragmentsRootNodeCount);
    return new ClonedProtoView(pv, fragments, boundElements, boundTextNodes);
}
function queryFragments(templateContent, fragmentsRootNodeCount) {
    var fragments = ListWrapper.createGrowableSize(fragmentsRootNodeCount.length);
    // Note: An explicit loop is the fastest way to convert a DOM array into a JS array!
    var childNode = DOM.firstChild(templateContent);
    for (var fragmentIndex = 0; fragmentIndex < fragments.length; fragmentIndex++) {
        var fragment = ListWrapper.createFixedSize(fragmentsRootNodeCount[fragmentIndex]);
        fragments[fragmentIndex] = fragment;
        // Note: the 2nd, 3rd, ... fragments are separated by each other via a '|'
        if (fragmentIndex >= 1) {
            childNode = DOM.nextSibling(childNode);
        }
        for (var i = 0; i < fragment.length; i++) {
            fragment[i] = childNode;
            childNode = DOM.nextSibling(childNode);
        }
    }
    return fragments;
}
function queryBoundTextNodes(templateContent, rootTextNodeIndices, boundElements, elementBinders, boundTextNodeCount) {
    var boundTextNodes = ListWrapper.createFixedSize(boundTextNodeCount);
    var textNodeIndex = 0;
    if (rootTextNodeIndices.length > 0) {
        var rootChildNodes = DOM.childNodes(templateContent);
        for (var i = 0; i < rootTextNodeIndices.length; i++) {
            boundTextNodes[textNodeIndex++] = rootChildNodes[rootTextNodeIndices[i]];
        }
    }
    for (var i = 0; i < elementBinders.length; i++) {
        var binder = elementBinders[i];
        var element = boundElements[i];
        if (binder.textNodeIndices.length > 0) {
            var childNodes = DOM.childNodes(element);
            for (var j = 0; j < binder.textNodeIndices.length; j++) {
                boundTextNodes[textNodeIndex++] = childNodes[binder.textNodeIndices[j]];
            }
        }
    }
    return boundTextNodes;
}
export function isElementWithTag(node, elementName) {
    return DOM.isElementNode(node) && DOM.tagName(node).toLowerCase() == elementName.toLowerCase();
}
export function queryBoundTextNodeIndices(parentNode, boundTextNodes, resultCallback) {
    var childNodes = DOM.childNodes(parentNode);
    for (var j = 0; j < childNodes.length; j++) {
        var node = childNodes[j];
        if (boundTextNodes.has(node)) {
            resultCallback(node, j, boundTextNodes.get(node));
        }
    }
}
export function prependAll(parentNode, nodes) {
    var lastInsertedNode = null;
    nodes.forEach(node => {
        if (isBlank(lastInsertedNode)) {
            var firstChild = DOM.firstChild(parentNode);
            if (isPresent(firstChild)) {
                DOM.insertBefore(firstChild, node);
            }
            else {
                DOM.appendChild(parentNode, node);
            }
        }
        else {
            DOM.insertAfter(lastInsertedNode, node);
        }
        lastInsertedNode = node;
    });
}
//# sourceMappingURL=util.js.map
/* */ 
'use strict';
var __extends = (this && this.__extends) || function(d, b) {
  for (var p in b)
    if (b.hasOwnProperty(p))
      d[p] = b[p];
  function __() {
    this.constructor = d;
  }
  __.prototype = b.prototype;
  d.prototype = new __();
};
var collection_1 = require("../facade/collection");
var lang_1 = require("../facade/lang");
var dom_adapter_1 = require("./dom_adapter");
var generic_browser_adapter_1 = require("./generic_browser_adapter");
var _attrToPropMap = {
  'class': 'className',
  'innerHtml': 'innerHTML',
  'readonly': 'readOnly',
  'tabindex': 'tabIndex'
};
var DOM_KEY_LOCATION_NUMPAD = 3;
var _keyMap = {
  '\b': 'Backspace',
  '\t': 'Tab',
  '\x7F': 'Delete',
  '\x1B': 'Escape',
  'Del': 'Delete',
  'Esc': 'Escape',
  'Left': 'ArrowLeft',
  'Right': 'ArrowRight',
  'Up': 'ArrowUp',
  'Down': 'ArrowDown',
  'Menu': 'ContextMenu',
  'Scroll': 'ScrollLock',
  'Win': 'OS'
};
var _chromeNumKeyPadMap = {
  'A': '1',
  'B': '2',
  'C': '3',
  'D': '4',
  'E': '5',
  'F': '6',
  'G': '7',
  'H': '8',
  'I': '9',
  'J': '*',
  'K': '+',
  'M': '-',
  'N': '.',
  'O': '/',
  '\x60': '0',
  '\x90': 'NumLock'
};
var BrowserDomAdapter = (function(_super) {
  __extends(BrowserDomAdapter, _super);
  function BrowserDomAdapter() {
    _super.apply(this, arguments);
  }
  BrowserDomAdapter.makeCurrent = function() {
    dom_adapter_1.setRootDomAdapter(new BrowserDomAdapter());
  };
  BrowserDomAdapter.prototype.hasProperty = function(element, name) {
    return name in element;
  };
  BrowserDomAdapter.prototype.setProperty = function(el, name, value) {
    el[name] = value;
  };
  BrowserDomAdapter.prototype.getProperty = function(el, name) {
    return el[name];
  };
  BrowserDomAdapter.prototype.invoke = function(el, methodName, args) {
    el[methodName].apply(el, args);
  };
  BrowserDomAdapter.prototype.logError = function(error) {
    window.console.error(error);
  };
  BrowserDomAdapter.prototype.log = function(error) {
    window.console.log(error);
  };
  BrowserDomAdapter.prototype.logGroup = function(error) {
    if (window.console.group) {
      window.console.group(error);
    } else {
      window.console.log(error);
    }
  };
  BrowserDomAdapter.prototype.logGroupEnd = function() {
    if (window.console.groupEnd) {
      window.console.groupEnd();
    }
  };
  Object.defineProperty(BrowserDomAdapter.prototype, "attrToPropMap", {
    get: function() {
      return _attrToPropMap;
    },
    enumerable: true,
    configurable: true
  });
  BrowserDomAdapter.prototype.query = function(selector) {
    return document.querySelector(selector);
  };
  BrowserDomAdapter.prototype.querySelector = function(el, selector) {
    return el.querySelector(selector);
  };
  BrowserDomAdapter.prototype.querySelectorAll = function(el, selector) {
    return el.querySelectorAll(selector);
  };
  BrowserDomAdapter.prototype.on = function(el, evt, listener) {
    el.addEventListener(evt, listener, false);
  };
  BrowserDomAdapter.prototype.onAndCancel = function(el, evt, listener) {
    el.addEventListener(evt, listener, false);
    return function() {
      el.removeEventListener(evt, listener, false);
    };
  };
  BrowserDomAdapter.prototype.dispatchEvent = function(el, evt) {
    el.dispatchEvent(evt);
  };
  BrowserDomAdapter.prototype.createMouseEvent = function(eventType) {
    var evt = document.createEvent('MouseEvent');
    evt.initEvent(eventType, true, true);
    return evt;
  };
  BrowserDomAdapter.prototype.createEvent = function(eventType) {
    var evt = document.createEvent('Event');
    evt.initEvent(eventType, true, true);
    return evt;
  };
  BrowserDomAdapter.prototype.preventDefault = function(evt) {
    evt.preventDefault();
    evt.returnValue = false;
  };
  BrowserDomAdapter.prototype.isPrevented = function(evt) {
    return evt.defaultPrevented || lang_1.isPresent(evt.returnValue) && !evt.returnValue;
  };
  BrowserDomAdapter.prototype.getInnerHTML = function(el) {
    return el.innerHTML;
  };
  BrowserDomAdapter.prototype.getOuterHTML = function(el) {
    return el.outerHTML;
  };
  BrowserDomAdapter.prototype.nodeName = function(node) {
    return node.nodeName;
  };
  BrowserDomAdapter.prototype.nodeValue = function(node) {
    return node.nodeValue;
  };
  BrowserDomAdapter.prototype.type = function(node) {
    return node.type;
  };
  BrowserDomAdapter.prototype.content = function(node) {
    if (this.hasProperty(node, "content")) {
      return node.content;
    } else {
      return node;
    }
  };
  BrowserDomAdapter.prototype.firstChild = function(el) {
    return el.firstChild;
  };
  BrowserDomAdapter.prototype.nextSibling = function(el) {
    return el.nextSibling;
  };
  BrowserDomAdapter.prototype.parentElement = function(el) {
    return el.parentNode;
  };
  BrowserDomAdapter.prototype.childNodes = function(el) {
    return el.childNodes;
  };
  BrowserDomAdapter.prototype.childNodesAsList = function(el) {
    var childNodes = el.childNodes;
    var res = collection_1.ListWrapper.createFixedSize(childNodes.length);
    for (var i = 0; i < childNodes.length; i++) {
      res[i] = childNodes[i];
    }
    return res;
  };
  BrowserDomAdapter.prototype.clearNodes = function(el) {
    while (el.firstChild) {
      el.removeChild(el.firstChild);
    }
  };
  BrowserDomAdapter.prototype.appendChild = function(el, node) {
    el.appendChild(node);
  };
  BrowserDomAdapter.prototype.removeChild = function(el, node) {
    el.removeChild(node);
  };
  BrowserDomAdapter.prototype.replaceChild = function(el, newChild, oldChild) {
    el.replaceChild(newChild, oldChild);
  };
  BrowserDomAdapter.prototype.remove = function(node) {
    node.parentNode.removeChild(node);
    return node;
  };
  BrowserDomAdapter.prototype.insertBefore = function(el, node) {
    el.parentNode.insertBefore(node, el);
  };
  BrowserDomAdapter.prototype.insertAllBefore = function(el, nodes) {
    collection_1.ListWrapper.forEach(nodes, function(n) {
      el.parentNode.insertBefore(n, el);
    });
  };
  BrowserDomAdapter.prototype.insertAfter = function(el, node) {
    el.parentNode.insertBefore(node, el.nextSibling);
  };
  BrowserDomAdapter.prototype.setInnerHTML = function(el, value) {
    el.innerHTML = value;
  };
  BrowserDomAdapter.prototype.getText = function(el) {
    return el.textContent;
  };
  BrowserDomAdapter.prototype.setText = function(el, value) {
    el.textContent = value;
  };
  BrowserDomAdapter.prototype.getValue = function(el) {
    return el.value;
  };
  BrowserDomAdapter.prototype.setValue = function(el, value) {
    el.value = value;
  };
  BrowserDomAdapter.prototype.getChecked = function(el) {
    return el.checked;
  };
  BrowserDomAdapter.prototype.setChecked = function(el, value) {
    el.checked = value;
  };
  BrowserDomAdapter.prototype.createComment = function(text) {
    return document.createComment(text);
  };
  BrowserDomAdapter.prototype.createTemplate = function(html) {
    var t = document.createElement('template');
    t.innerHTML = html;
    return t;
  };
  BrowserDomAdapter.prototype.createElement = function(tagName, doc) {
    if (doc === void 0) {
      doc = document;
    }
    return doc.createElement(tagName);
  };
  BrowserDomAdapter.prototype.createTextNode = function(text, doc) {
    if (doc === void 0) {
      doc = document;
    }
    return doc.createTextNode(text);
  };
  BrowserDomAdapter.prototype.createScriptTag = function(attrName, attrValue, doc) {
    if (doc === void 0) {
      doc = document;
    }
    var el = doc.createElement('SCRIPT');
    el.setAttribute(attrName, attrValue);
    return el;
  };
  BrowserDomAdapter.prototype.createStyleElement = function(css, doc) {
    if (doc === void 0) {
      doc = document;
    }
    var style = doc.createElement('style');
    this.appendChild(style, this.createTextNode(css));
    return style;
  };
  BrowserDomAdapter.prototype.createShadowRoot = function(el) {
    return el.createShadowRoot();
  };
  BrowserDomAdapter.prototype.getShadowRoot = function(el) {
    return el.shadowRoot;
  };
  BrowserDomAdapter.prototype.getHost = function(el) {
    return el.host;
  };
  BrowserDomAdapter.prototype.clone = function(node) {
    return node.cloneNode(true);
  };
  BrowserDomAdapter.prototype.getElementsByClassName = function(element, name) {
    return element.getElementsByClassName(name);
  };
  BrowserDomAdapter.prototype.getElementsByTagName = function(element, name) {
    return element.getElementsByTagName(name);
  };
  BrowserDomAdapter.prototype.classList = function(element) {
    return Array.prototype.slice.call(element.classList, 0);
  };
  BrowserDomAdapter.prototype.addClass = function(element, classname) {
    element.classList.add(classname);
  };
  BrowserDomAdapter.prototype.removeClass = function(element, classname) {
    element.classList.remove(classname);
  };
  BrowserDomAdapter.prototype.hasClass = function(element, classname) {
    return element.classList.contains(classname);
  };
  BrowserDomAdapter.prototype.setStyle = function(element, stylename, stylevalue) {
    element.style[stylename] = stylevalue;
  };
  BrowserDomAdapter.prototype.removeStyle = function(element, stylename) {
    element.style[stylename] = null;
  };
  BrowserDomAdapter.prototype.getStyle = function(element, stylename) {
    return element.style[stylename];
  };
  BrowserDomAdapter.prototype.tagName = function(element) {
    return element.tagName;
  };
  BrowserDomAdapter.prototype.attributeMap = function(element) {
    var res = new Map();
    var elAttrs = element.attributes;
    for (var i = 0; i < elAttrs.length; i++) {
      var attrib = elAttrs[i];
      res.set(attrib.name, attrib.value);
    }
    return res;
  };
  BrowserDomAdapter.prototype.hasAttribute = function(element, attribute) {
    return element.hasAttribute(attribute);
  };
  BrowserDomAdapter.prototype.getAttribute = function(element, attribute) {
    return element.getAttribute(attribute);
  };
  BrowserDomAdapter.prototype.setAttribute = function(element, name, value) {
    element.setAttribute(name, value);
  };
  BrowserDomAdapter.prototype.removeAttribute = function(element, attribute) {
    element.removeAttribute(attribute);
  };
  BrowserDomAdapter.prototype.templateAwareRoot = function(el) {
    return this.isTemplateElement(el) ? this.content(el) : el;
  };
  BrowserDomAdapter.prototype.createHtmlDocument = function() {
    return document.implementation.createHTMLDocument('fakeTitle');
  };
  BrowserDomAdapter.prototype.defaultDoc = function() {
    return document;
  };
  BrowserDomAdapter.prototype.getBoundingClientRect = function(el) {
    try {
      return el.getBoundingClientRect();
    } catch (e) {
      return {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        width: 0,
        height: 0
      };
    }
  };
  BrowserDomAdapter.prototype.getTitle = function() {
    return document.title;
  };
  BrowserDomAdapter.prototype.setTitle = function(newTitle) {
    document.title = newTitle || '';
  };
  BrowserDomAdapter.prototype.elementMatches = function(n, selector) {
    return n instanceof HTMLElement && n.matches ? n.matches(selector) : n.msMatchesSelector(selector);
  };
  BrowserDomAdapter.prototype.isTemplateElement = function(el) {
    return el instanceof HTMLElement && el.nodeName == "TEMPLATE";
  };
  BrowserDomAdapter.prototype.isTextNode = function(node) {
    return node.nodeType === Node.TEXT_NODE;
  };
  BrowserDomAdapter.prototype.isCommentNode = function(node) {
    return node.nodeType === Node.COMMENT_NODE;
  };
  BrowserDomAdapter.prototype.isElementNode = function(node) {
    return node.nodeType === Node.ELEMENT_NODE;
  };
  BrowserDomAdapter.prototype.hasShadowRoot = function(node) {
    return node instanceof HTMLElement && lang_1.isPresent(node.shadowRoot);
  };
  BrowserDomAdapter.prototype.isShadowRoot = function(node) {
    return node instanceof DocumentFragment;
  };
  BrowserDomAdapter.prototype.importIntoDoc = function(node) {
    var toImport = node;
    if (this.isTemplateElement(node)) {
      toImport = this.content(node);
    }
    return document.importNode(toImport, true);
  };
  BrowserDomAdapter.prototype.adoptNode = function(node) {
    return document.adoptNode(node);
  };
  BrowserDomAdapter.prototype.isPageRule = function(rule) {
    return rule.type === CSSRule.PAGE_RULE;
  };
  BrowserDomAdapter.prototype.isStyleRule = function(rule) {
    return rule.type === CSSRule.STYLE_RULE;
  };
  BrowserDomAdapter.prototype.isMediaRule = function(rule) {
    return rule.type === CSSRule.MEDIA_RULE;
  };
  BrowserDomAdapter.prototype.isKeyframesRule = function(rule) {
    return rule.type === CSSRule.KEYFRAMES_RULE;
  };
  BrowserDomAdapter.prototype.getHref = function(el) {
    return el.href;
  };
  BrowserDomAdapter.prototype.getEventKey = function(event) {
    var key = event.key;
    if (lang_1.isBlank(key)) {
      key = event.keyIdentifier;
      if (lang_1.isBlank(key)) {
        return 'Unidentified';
      }
      if (key.startsWith('U+')) {
        key = String.fromCharCode(parseInt(key.substring(2), 16));
        if (event.location === DOM_KEY_LOCATION_NUMPAD && _chromeNumKeyPadMap.hasOwnProperty(key)) {
          key = _chromeNumKeyPadMap[key];
        }
      }
    }
    if (_keyMap.hasOwnProperty(key)) {
      key = _keyMap[key];
    }
    return key;
  };
  BrowserDomAdapter.prototype.getGlobalEventTarget = function(target) {
    if (target == "window") {
      return window;
    } else if (target == "document") {
      return document;
    } else if (target == "body") {
      return document.body;
    }
  };
  BrowserDomAdapter.prototype.getHistory = function() {
    return window.history;
  };
  BrowserDomAdapter.prototype.getLocation = function() {
    return window.location;
  };
  BrowserDomAdapter.prototype.getBaseHref = function() {
    var href = getBaseElementHref();
    if (lang_1.isBlank(href)) {
      return null;
    }
    return relativePath(href);
  };
  BrowserDomAdapter.prototype.resetBaseElement = function() {
    baseElement = null;
  };
  BrowserDomAdapter.prototype.getUserAgent = function() {
    return window.navigator.userAgent;
  };
  BrowserDomAdapter.prototype.setData = function(element, name, value) {
    element.dataset[name] = value;
  };
  BrowserDomAdapter.prototype.getData = function(element, name) {
    return element.dataset[name];
  };
  BrowserDomAdapter.prototype.setGlobalVar = function(name, value) {
    lang_1.global[name] = value;
  };
  return BrowserDomAdapter;
})(generic_browser_adapter_1.GenericBrowserDomAdapter);
exports.BrowserDomAdapter = BrowserDomAdapter;
var baseElement = null;
function getBaseElementHref() {
  if (lang_1.isBlank(baseElement)) {
    baseElement = document.querySelector('base');
    if (lang_1.isBlank(baseElement)) {
      return null;
    }
  }
  return baseElement.getAttribute('href');
}
var urlParsingNode = null;
function relativePath(url) {
  if (lang_1.isBlank(urlParsingNode)) {
    urlParsingNode = document.createElement("a");
  }
  urlParsingNode.setAttribute('href', url);
  return (urlParsingNode.pathname.charAt(0) === '/') ? urlParsingNode.pathname : '/' + urlParsingNode.pathname;
}

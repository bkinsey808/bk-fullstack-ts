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
var GenericBrowserDomAdapter = (function(_super) {
  __extends(GenericBrowserDomAdapter, _super);
  function GenericBrowserDomAdapter() {
    _super.apply(this, arguments);
  }
  GenericBrowserDomAdapter.prototype.getDistributedNodes = function(el) {
    return el.getDistributedNodes();
  };
  GenericBrowserDomAdapter.prototype.resolveAndSetHref = function(el, baseUrl, href) {
    el.href = href == null ? baseUrl : baseUrl + '/../' + href;
  };
  GenericBrowserDomAdapter.prototype.cssToRules = function(css) {
    var style = this.createStyleElement(css);
    this.appendChild(this.defaultDoc().head, style);
    var rules = [];
    if (lang_1.isPresent(style.sheet)) {
      try {
        var rawRules = style.sheet.cssRules;
        rules = collection_1.ListWrapper.createFixedSize(rawRules.length);
        for (var i = 0; i < rawRules.length; i++) {
          rules[i] = rawRules[i];
        }
      } catch (e) {}
    } else {}
    this.remove(style);
    return rules;
  };
  GenericBrowserDomAdapter.prototype.supportsDOMEvents = function() {
    return true;
  };
  GenericBrowserDomAdapter.prototype.supportsNativeShadowDOM = function() {
    return lang_1.isFunction(this.defaultDoc().body.createShadowRoot);
  };
  return GenericBrowserDomAdapter;
})(dom_adapter_1.DomAdapter);
exports.GenericBrowserDomAdapter = GenericBrowserDomAdapter;

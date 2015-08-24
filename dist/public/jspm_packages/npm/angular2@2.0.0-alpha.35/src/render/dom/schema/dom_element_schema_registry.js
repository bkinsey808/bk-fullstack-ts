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
var lang_1 = require("../../../facade/lang");
var collection_1 = require("../../../facade/collection");
var dom_adapter_1 = require("../../../dom/dom_adapter");
var element_schema_registry_1 = require("./element_schema_registry");
var DomElementSchemaRegistry = (function(_super) {
  __extends(DomElementSchemaRegistry, _super);
  function DomElementSchemaRegistry() {
    _super.apply(this, arguments);
  }
  DomElementSchemaRegistry.prototype.hasProperty = function(elm, propName) {
    var tagName = dom_adapter_1.DOM.tagName(elm);
    if (tagName.indexOf('-') !== -1) {
      return true;
    } else {
      return dom_adapter_1.DOM.hasProperty(elm, propName);
    }
  };
  DomElementSchemaRegistry.prototype.getMappedPropName = function(propName) {
    var mappedPropName = collection_1.StringMapWrapper.get(dom_adapter_1.DOM.attrToPropMap, propName);
    return lang_1.isPresent(mappedPropName) ? mappedPropName : propName;
  };
  return DomElementSchemaRegistry;
})(element_schema_registry_1.ElementSchemaRegistry);
exports.DomElementSchemaRegistry = DomElementSchemaRegistry;

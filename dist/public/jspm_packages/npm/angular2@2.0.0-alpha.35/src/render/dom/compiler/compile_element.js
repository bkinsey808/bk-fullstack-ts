/* */ 
(function(process) {
  'use strict';
  var collection_1 = require("../../../facade/collection");
  var dom_adapter_1 = require("../../../dom/dom_adapter");
  var lang_1 = require("../../../facade/lang");
  var CompileElement = (function() {
    function CompileElement(element, compilationUnit) {
      if (compilationUnit === void 0) {
        compilationUnit = '';
      }
      this.element = element;
      this._attrs = null;
      this._classList = null;
      this.isViewRoot = false;
      this.inheritedProtoView = null;
      this.distanceToInheritedBinder = 0;
      this.inheritedElementBinder = null;
      this.compileChildren = true;
      var tplDesc = lang_1.assertionsEnabled() ? getElementDescription(element) : null;
      if (compilationUnit !== '') {
        this.elementDescription = compilationUnit;
        if (lang_1.isPresent(tplDesc))
          this.elementDescription += ": " + tplDesc;
      } else {
        this.elementDescription = tplDesc;
      }
    }
    CompileElement.prototype.isBound = function() {
      return lang_1.isPresent(this.inheritedElementBinder) && this.distanceToInheritedBinder === 0;
    };
    CompileElement.prototype.bindElement = function() {
      if (!this.isBound()) {
        var parentBinder = this.inheritedElementBinder;
        this.inheritedElementBinder = this.inheritedProtoView.bindElement(this.element, this.elementDescription);
        if (lang_1.isPresent(parentBinder)) {
          this.inheritedElementBinder.setParent(parentBinder, this.distanceToInheritedBinder);
        }
        this.distanceToInheritedBinder = 0;
      }
      return this.inheritedElementBinder;
    };
    CompileElement.prototype.attrs = function() {
      if (lang_1.isBlank(this._attrs)) {
        this._attrs = dom_adapter_1.DOM.attributeMap(this.element);
      }
      return this._attrs;
    };
    CompileElement.prototype.classList = function() {
      if (lang_1.isBlank(this._classList)) {
        this._classList = [];
        var elClassList = dom_adapter_1.DOM.classList(this.element);
        for (var i = 0; i < elClassList.length; i++) {
          this._classList.push(elClassList[i]);
        }
      }
      return this._classList;
    };
    return CompileElement;
  })();
  exports.CompileElement = CompileElement;
  function getElementDescription(domElement) {
    var buf = new lang_1.StringJoiner();
    var atts = dom_adapter_1.DOM.attributeMap(domElement);
    buf.add("<");
    buf.add(dom_adapter_1.DOM.tagName(domElement).toLowerCase());
    addDescriptionAttribute(buf, "id", atts.get("id"));
    addDescriptionAttribute(buf, "class", atts.get("class"));
    collection_1.MapWrapper.forEach(atts, function(attValue, attName) {
      if (attName !== "id" && attName !== "class") {
        addDescriptionAttribute(buf, attName, attValue);
      }
    });
    buf.add(">");
    return buf.toString();
  }
  function addDescriptionAttribute(buffer, attName, attValue) {
    if (lang_1.isPresent(attValue)) {
      if (attValue.length === 0) {
        buffer.add(' ' + attName);
      } else {
        buffer.add(' ' + attName + '="' + attValue + '"');
      }
    }
  }
})(require("process"));

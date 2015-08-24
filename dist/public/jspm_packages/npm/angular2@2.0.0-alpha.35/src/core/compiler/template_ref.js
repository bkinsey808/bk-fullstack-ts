/* */ 
'use strict';
var view_ref_1 = require("./view_ref");
var TemplateRef = (function() {
  function TemplateRef(elementRef) {
    this.elementRef = elementRef;
  }
  TemplateRef.prototype._getProtoView = function() {
    var parentView = view_ref_1.internalView(this.elementRef.parentView);
    return parentView.proto.elementBinders[this.elementRef.boundElementIndex - parentView.elementOffset].nestedProtoView;
  };
  Object.defineProperty(TemplateRef.prototype, "protoViewRef", {
    get: function() {
      return this._getProtoView().ref;
    },
    enumerable: true,
    configurable: true
  });
  TemplateRef.prototype.hasLocal = function(name) {
    return this._getProtoView().variableBindings.has(name);
  };
  return TemplateRef;
})();
exports.TemplateRef = TemplateRef;

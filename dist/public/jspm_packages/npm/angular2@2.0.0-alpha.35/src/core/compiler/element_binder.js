/* */ 
'use strict';
var lang_1 = require("../../facade/lang");
var ElementBinder = (function() {
  function ElementBinder(index, parent, distanceToParent, protoElementInjector, componentDirective) {
    this.index = index;
    this.parent = parent;
    this.distanceToParent = distanceToParent;
    this.protoElementInjector = protoElementInjector;
    this.componentDirective = componentDirective;
    this.nestedProtoView = null;
    if (lang_1.isBlank(index)) {
      throw new lang_1.BaseException('null index not allowed.');
    }
  }
  ElementBinder.prototype.hasStaticComponent = function() {
    return lang_1.isPresent(this.componentDirective) && lang_1.isPresent(this.nestedProtoView);
  };
  ElementBinder.prototype.hasEmbeddedProtoView = function() {
    return !lang_1.isPresent(this.componentDirective) && lang_1.isPresent(this.nestedProtoView);
  };
  return ElementBinder;
})();
exports.ElementBinder = ElementBinder;

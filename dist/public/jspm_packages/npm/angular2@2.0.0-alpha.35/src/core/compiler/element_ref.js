/* */ 
'use strict';
var lang_1 = require("../../facade/lang");
var ElementRef = (function() {
  function ElementRef(parentView, boundElementIndex, renderBoundElementIndex, _renderer) {
    this._renderer = _renderer;
    this.parentView = parentView;
    this.boundElementIndex = boundElementIndex;
    this.renderBoundElementIndex = renderBoundElementIndex;
  }
  Object.defineProperty(ElementRef.prototype, "renderView", {
    get: function() {
      return this.parentView.render;
    },
    set: function(viewRef) {
      throw new lang_1.BaseException('Abstract setter');
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(ElementRef.prototype, "nativeElement", {
    get: function() {
      return this._renderer.getNativeElementSync(this);
    },
    enumerable: true,
    configurable: true
  });
  return ElementRef;
})();
exports.ElementRef = ElementRef;

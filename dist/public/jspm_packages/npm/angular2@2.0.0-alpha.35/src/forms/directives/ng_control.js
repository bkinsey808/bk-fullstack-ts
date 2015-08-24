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
var abstract_control_directive_1 = require("./abstract_control_directive");
var NgControl = (function(_super) {
  __extends(NgControl, _super);
  function NgControl() {
    _super.apply(this, arguments);
    this.name = null;
    this.valueAccessor = null;
  }
  Object.defineProperty(NgControl.prototype, "validator", {
    get: function() {
      return null;
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(NgControl.prototype, "path", {
    get: function() {
      return null;
    },
    enumerable: true,
    configurable: true
  });
  NgControl.prototype.viewToModelUpdate = function(newValue) {};
  return NgControl;
})(abstract_control_directive_1.AbstractControlDirective);
exports.NgControl = NgControl;

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
var lang_1 = require("../facade/lang");
var InvalidPipeArgumentException = (function(_super) {
  __extends(InvalidPipeArgumentException, _super);
  function InvalidPipeArgumentException(type, value) {
    _super.call(this, "Invalid argument '" + value + "' for pipe '" + type + "'");
  }
  return InvalidPipeArgumentException;
})(lang_1.BaseException);
exports.InvalidPipeArgumentException = InvalidPipeArgumentException;

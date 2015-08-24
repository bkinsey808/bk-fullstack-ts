/* */ 
'use strict';
var constants_1 = require("./constants");
var ChangeDetectorRef = (function() {
  function ChangeDetectorRef(_cd) {
    this._cd = _cd;
  }
  ChangeDetectorRef.prototype.requestCheck = function() {
    this._cd.markPathToRootAsCheckOnce();
  };
  ChangeDetectorRef.prototype.detach = function() {
    this._cd.mode = constants_1.DETACHED;
  };
  ChangeDetectorRef.prototype.reattach = function() {
    this._cd.mode = constants_1.CHECK_ALWAYS;
    this.requestCheck();
  };
  return ChangeDetectorRef;
})();
exports.ChangeDetectorRef = ChangeDetectorRef;

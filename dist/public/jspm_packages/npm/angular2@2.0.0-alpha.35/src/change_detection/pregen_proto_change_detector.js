/* */ 
'use strict';
var lang_1 = require("../facade/lang");
var PregenProtoChangeDetector = (function() {
  function PregenProtoChangeDetector() {}
  PregenProtoChangeDetector.isSupported = function() {
    return false;
  };
  PregenProtoChangeDetector.prototype.instantiate = function(dispatcher) {
    throw new lang_1.BaseException('Pregen change detection not supported in Js');
  };
  return PregenProtoChangeDetector;
})();
exports.PregenProtoChangeDetector = PregenProtoChangeDetector;

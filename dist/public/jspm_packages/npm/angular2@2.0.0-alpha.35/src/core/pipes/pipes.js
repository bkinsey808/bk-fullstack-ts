/* */ 
'use strict';
var lang_1 = require("../../facade/lang");
var ProtoPipes = (function() {
  function ProtoPipes(bindings) {
    var _this = this;
    this.config = {};
    bindings.forEach(function(b) {
      return _this.config[b.name] = b;
    });
  }
  ProtoPipes.prototype.get = function(name) {
    var binding = this.config[name];
    if (lang_1.isBlank(binding))
      throw new lang_1.BaseException("Cannot find pipe '" + name + "'.");
    return binding;
  };
  return ProtoPipes;
})();
exports.ProtoPipes = ProtoPipes;
var Pipes = (function() {
  function Pipes(proto, injector) {
    this.proto = proto;
    this.injector = injector;
  }
  Pipes.prototype.get = function(name) {
    var b = this.proto.get(name);
    return this.injector.instantiateResolved(b);
  };
  return Pipes;
})();
exports.Pipes = Pipes;

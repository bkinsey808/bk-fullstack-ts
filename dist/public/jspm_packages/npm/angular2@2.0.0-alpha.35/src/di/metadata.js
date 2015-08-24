/* */ 
'use strict';
var __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
    return Reflect.decorate(decorators, target, key, desc);
  switch (arguments.length) {
    case 2:
      return decorators.reduceRight(function(o, d) {
        return (d && d(o)) || o;
      }, target);
    case 3:
      return decorators.reduceRight(function(o, d) {
        return (d && d(target, key)), void 0;
      }, void 0);
    case 4:
      return decorators.reduceRight(function(o, d) {
        return (d && d(target, key, o)) || o;
      }, desc);
  }
};
var __metadata = (this && this.__metadata) || function(k, v) {
  if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
    return Reflect.metadata(k, v);
};
var lang_1 = require("../facade/lang");
var InjectMetadata = (function() {
  function InjectMetadata(token) {
    this.token = token;
  }
  InjectMetadata.prototype.toString = function() {
    return "@Inject(" + lang_1.stringify(this.token) + ")";
  };
  InjectMetadata = __decorate([lang_1.CONST(), __metadata('design:paramtypes', [Object])], InjectMetadata);
  return InjectMetadata;
})();
exports.InjectMetadata = InjectMetadata;
var OptionalMetadata = (function() {
  function OptionalMetadata() {}
  OptionalMetadata.prototype.toString = function() {
    return "@Optional()";
  };
  OptionalMetadata = __decorate([lang_1.CONST(), __metadata('design:paramtypes', [])], OptionalMetadata);
  return OptionalMetadata;
})();
exports.OptionalMetadata = OptionalMetadata;
var DependencyMetadata = (function() {
  function DependencyMetadata() {}
  Object.defineProperty(DependencyMetadata.prototype, "token", {
    get: function() {
      return null;
    },
    enumerable: true,
    configurable: true
  });
  DependencyMetadata = __decorate([lang_1.CONST(), __metadata('design:paramtypes', [])], DependencyMetadata);
  return DependencyMetadata;
})();
exports.DependencyMetadata = DependencyMetadata;
var InjectableMetadata = (function() {
  function InjectableMetadata() {}
  InjectableMetadata = __decorate([lang_1.CONST(), __metadata('design:paramtypes', [])], InjectableMetadata);
  return InjectableMetadata;
})();
exports.InjectableMetadata = InjectableMetadata;
var SelfMetadata = (function() {
  function SelfMetadata() {}
  SelfMetadata.prototype.toString = function() {
    return "@Self()";
  };
  SelfMetadata = __decorate([lang_1.CONST(), __metadata('design:paramtypes', [])], SelfMetadata);
  return SelfMetadata;
})();
exports.SelfMetadata = SelfMetadata;
var SkipSelfMetadata = (function() {
  function SkipSelfMetadata() {}
  SkipSelfMetadata.prototype.toString = function() {
    return "@SkipSelf()";
  };
  SkipSelfMetadata = __decorate([lang_1.CONST(), __metadata('design:paramtypes', [])], SkipSelfMetadata);
  return SkipSelfMetadata;
})();
exports.SkipSelfMetadata = SkipSelfMetadata;
var HostMetadata = (function() {
  function HostMetadata() {}
  HostMetadata.prototype.toString = function() {
    return "@Host()";
  };
  HostMetadata = __decorate([lang_1.CONST(), __metadata('design:paramtypes', [])], HostMetadata);
  return HostMetadata;
})();
exports.HostMetadata = HostMetadata;

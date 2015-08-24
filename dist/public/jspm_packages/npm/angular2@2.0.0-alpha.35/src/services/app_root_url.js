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
var di_1 = require("../../di");
var AppRootUrl = (function() {
  function AppRootUrl(value) {
    this._value = value;
  }
  Object.defineProperty(AppRootUrl.prototype, "value", {
    get: function() {
      return this._value;
    },
    set: function(value) {
      this._value = value;
    },
    enumerable: true,
    configurable: true
  });
  AppRootUrl = __decorate([di_1.Injectable(), __metadata('design:paramtypes', [String])], AppRootUrl);
  return AppRootUrl;
})();
exports.AppRootUrl = AppRootUrl;

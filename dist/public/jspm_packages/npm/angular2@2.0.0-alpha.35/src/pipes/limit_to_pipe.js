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
var collection_1 = require("../facade/collection");
var math_1 = require("../facade/math");
var di_1 = require("../../di");
var invalid_pipe_argument_exception_1 = require("./invalid_pipe_argument_exception");
var metadata_1 = require("../core/metadata");
var LimitToPipe = (function() {
  function LimitToPipe() {}
  LimitToPipe.prototype.supports = function(obj) {
    return lang_1.isString(obj) || lang_1.isArray(obj);
  };
  LimitToPipe.prototype.transform = function(value, args) {
    if (args === void 0) {
      args = null;
    }
    if (lang_1.isBlank(args) || args.length == 0) {
      throw new lang_1.BaseException('limitTo pipe requires one argument');
    }
    if (!this.supports(value)) {
      throw new invalid_pipe_argument_exception_1.InvalidPipeArgumentException(LimitToPipe, value);
    }
    if (lang_1.isBlank(value))
      return value;
    var limit = args[0];
    var left = 0,
        right = math_1.Math.min(limit, value.length);
    if (limit < 0) {
      left = math_1.Math.max(0, value.length + limit);
      right = value.length;
    }
    if (lang_1.isString(value)) {
      return lang_1.StringWrapper.substring(value, left, right);
    }
    return collection_1.ListWrapper.slice(value, left, right);
  };
  LimitToPipe = __decorate([metadata_1.Pipe({name: 'limitTo'}), di_1.Injectable(), __metadata('design:paramtypes', [])], LimitToPipe);
  return LimitToPipe;
})();
exports.LimitToPipe = LimitToPipe;

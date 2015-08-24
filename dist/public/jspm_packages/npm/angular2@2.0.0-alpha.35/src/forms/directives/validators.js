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
var di_1 = require("../../../di");
var lang_1 = require("../../facade/lang");
var metadata_1 = require("../../../metadata");
var validators_1 = require("../validators");
var NgValidator = (function() {
  function NgValidator() {}
  Object.defineProperty(NgValidator.prototype, "validator", {
    get: function() {
      throw "Is not implemented";
    },
    enumerable: true,
    configurable: true
  });
  return NgValidator;
})();
exports.NgValidator = NgValidator;
var requiredValidatorBinding = lang_1.CONST_EXPR(new di_1.Binding(NgValidator, {toAlias: di_1.forwardRef(function() {
    return NgRequiredValidator;
  })}));
var NgRequiredValidator = (function(_super) {
  __extends(NgRequiredValidator, _super);
  function NgRequiredValidator() {
    _super.apply(this, arguments);
  }
  Object.defineProperty(NgRequiredValidator.prototype, "validator", {
    get: function() {
      return validators_1.Validators.required;
    },
    enumerable: true,
    configurable: true
  });
  NgRequiredValidator = __decorate([metadata_1.Directive({
    selector: '[required][ng-control],[required][ng-form-control],[required][ng-model]',
    bindings: [requiredValidatorBinding]
  }), __metadata('design:paramtypes', [])], NgRequiredValidator);
  return NgRequiredValidator;
})(NgValidator);
exports.NgRequiredValidator = NgRequiredValidator;

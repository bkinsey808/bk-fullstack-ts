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
var __param = (this && this.__param) || function(paramIndex, decorator) {
  return function(target, key) {
    decorator(target, key, paramIndex);
  };
};
var render_1 = require("../../../render");
var metadata_1 = require("../../../metadata");
var core_1 = require("../../../core");
var di_1 = require("../../../di");
var ng_control_1 = require("./ng_control");
var lang_1 = require("../../facade/lang");
var shared_1 = require("./shared");
var DefaultValueAccessor = (function() {
  function DefaultValueAccessor(cd, renderer, elementRef) {
    this.renderer = renderer;
    this.elementRef = elementRef;
    this.onChange = function(_) {};
    this.onTouched = function() {};
    this.cd = cd;
    cd.valueAccessor = this;
  }
  DefaultValueAccessor.prototype.writeValue = function(value) {
    var normalizedValue = lang_1.isBlank(value) ? '' : value;
    shared_1.setProperty(this.renderer, this.elementRef, 'value', normalizedValue);
  };
  Object.defineProperty(DefaultValueAccessor.prototype, "ngClassUntouched", {
    get: function() {
      return lang_1.isPresent(this.cd.control) ? this.cd.control.untouched : false;
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(DefaultValueAccessor.prototype, "ngClassTouched", {
    get: function() {
      return lang_1.isPresent(this.cd.control) ? this.cd.control.touched : false;
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(DefaultValueAccessor.prototype, "ngClassPristine", {
    get: function() {
      return lang_1.isPresent(this.cd.control) ? this.cd.control.pristine : false;
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(DefaultValueAccessor.prototype, "ngClassDirty", {
    get: function() {
      return lang_1.isPresent(this.cd.control) ? this.cd.control.dirty : false;
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(DefaultValueAccessor.prototype, "ngClassValid", {
    get: function() {
      return lang_1.isPresent(this.cd.control) ? this.cd.control.valid : false;
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(DefaultValueAccessor.prototype, "ngClassInvalid", {
    get: function() {
      return lang_1.isPresent(this.cd.control) ? !this.cd.control.valid : false;
    },
    enumerable: true,
    configurable: true
  });
  DefaultValueAccessor.prototype.registerOnChange = function(fn) {
    this.onChange = fn;
  };
  DefaultValueAccessor.prototype.registerOnTouched = function(fn) {
    this.onTouched = fn;
  };
  DefaultValueAccessor = __decorate([metadata_1.Directive({
    selector: 'input:not([type=checkbox])[ng-control],textarea[ng-control],input:not([type=checkbox])[ng-form-control],textarea[ng-form-control],input:not([type=checkbox])[ng-model],textarea[ng-model]',
    host: {
      '(change)': 'onChange($event.target.value)',
      '(input)': 'onChange($event.target.value)',
      '(blur)': 'onTouched()',
      '[class.ng-untouched]': 'ngClassUntouched',
      '[class.ng-touched]': 'ngClassTouched',
      '[class.ng-pristine]': 'ngClassPristine',
      '[class.ng-dirty]': 'ngClassDirty',
      '[class.ng-valid]': 'ngClassValid',
      '[class.ng-invalid]': 'ngClassInvalid'
    }
  }), __param(0, di_1.Self()), __metadata('design:paramtypes', [ng_control_1.NgControl, render_1.Renderer, core_1.ElementRef])], DefaultValueAccessor);
  return DefaultValueAccessor;
})();
exports.DefaultValueAccessor = DefaultValueAccessor;

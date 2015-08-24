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
var CheckboxControlValueAccessor = (function() {
  function CheckboxControlValueAccessor(cd, renderer, elementRef) {
    this.renderer = renderer;
    this.elementRef = elementRef;
    this.onChange = function(_) {};
    this.onTouched = function() {};
    this.cd = cd;
    cd.valueAccessor = this;
  }
  CheckboxControlValueAccessor.prototype.writeValue = function(value) {
    shared_1.setProperty(this.renderer, this.elementRef, "checked", value);
  };
  Object.defineProperty(CheckboxControlValueAccessor.prototype, "ngClassUntouched", {
    get: function() {
      return lang_1.isPresent(this.cd.control) ? this.cd.control.untouched : false;
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(CheckboxControlValueAccessor.prototype, "ngClassTouched", {
    get: function() {
      return lang_1.isPresent(this.cd.control) ? this.cd.control.touched : false;
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(CheckboxControlValueAccessor.prototype, "ngClassPristine", {
    get: function() {
      return lang_1.isPresent(this.cd.control) ? this.cd.control.pristine : false;
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(CheckboxControlValueAccessor.prototype, "ngClassDirty", {
    get: function() {
      return lang_1.isPresent(this.cd.control) ? this.cd.control.dirty : false;
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(CheckboxControlValueAccessor.prototype, "ngClassValid", {
    get: function() {
      return lang_1.isPresent(this.cd.control) ? this.cd.control.valid : false;
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(CheckboxControlValueAccessor.prototype, "ngClassInvalid", {
    get: function() {
      return lang_1.isPresent(this.cd.control) ? !this.cd.control.valid : false;
    },
    enumerable: true,
    configurable: true
  });
  CheckboxControlValueAccessor.prototype.registerOnChange = function(fn) {
    this.onChange = fn;
  };
  CheckboxControlValueAccessor.prototype.registerOnTouched = function(fn) {
    this.onTouched = fn;
  };
  CheckboxControlValueAccessor = __decorate([metadata_1.Directive({
    selector: 'input[type=checkbox][ng-control],input[type=checkbox][ng-form-control],input[type=checkbox][ng-model]',
    host: {
      '(change)': 'onChange($event.target.checked)',
      '(blur)': 'onTouched()',
      '[class.ng-untouched]': 'ngClassUntouched',
      '[class.ng-touched]': 'ngClassTouched',
      '[class.ng-pristine]': 'ngClassPristine',
      '[class.ng-dirty]': 'ngClassDirty',
      '[class.ng-valid]': 'ngClassValid',
      '[class.ng-invalid]': 'ngClassInvalid'
    }
  }), __param(0, di_1.Self()), __metadata('design:paramtypes', [ng_control_1.NgControl, render_1.Renderer, core_1.ElementRef])], CheckboxControlValueAccessor);
  return CheckboxControlValueAccessor;
})();
exports.CheckboxControlValueAccessor = CheckboxControlValueAccessor;

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
var core_1 = require("../../../core");
var di_1 = require("../../../di");
var metadata_1 = require("../../../metadata");
var ng_control_1 = require("./ng_control");
var lang_1 = require("../../facade/lang");
var shared_1 = require("./shared");
var NgSelectOption = (function() {
  function NgSelectOption() {}
  NgSelectOption = __decorate([metadata_1.Directive({selector: 'option'}), __metadata('design:paramtypes', [])], NgSelectOption);
  return NgSelectOption;
})();
exports.NgSelectOption = NgSelectOption;
var SelectControlValueAccessor = (function() {
  function SelectControlValueAccessor(cd, renderer, elementRef, query) {
    this.renderer = renderer;
    this.elementRef = elementRef;
    this.onChange = function(_) {};
    this.onTouched = function() {};
    this.cd = cd;
    cd.valueAccessor = this;
    this._updateValueWhenListOfOptionsChanges(query);
  }
  SelectControlValueAccessor.prototype.writeValue = function(value) {
    this.value = value;
    shared_1.setProperty(this.renderer, this.elementRef, "value", value);
  };
  Object.defineProperty(SelectControlValueAccessor.prototype, "ngClassUntouched", {
    get: function() {
      return lang_1.isPresent(this.cd.control) ? this.cd.control.untouched : false;
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(SelectControlValueAccessor.prototype, "ngClassTouched", {
    get: function() {
      return lang_1.isPresent(this.cd.control) ? this.cd.control.touched : false;
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(SelectControlValueAccessor.prototype, "ngClassPristine", {
    get: function() {
      return lang_1.isPresent(this.cd.control) ? this.cd.control.pristine : false;
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(SelectControlValueAccessor.prototype, "ngClassDirty", {
    get: function() {
      return lang_1.isPresent(this.cd.control) ? this.cd.control.dirty : false;
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(SelectControlValueAccessor.prototype, "ngClassValid", {
    get: function() {
      return lang_1.isPresent(this.cd.control) ? this.cd.control.valid : false;
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(SelectControlValueAccessor.prototype, "ngClassInvalid", {
    get: function() {
      return lang_1.isPresent(this.cd.control) ? !this.cd.control.valid : false;
    },
    enumerable: true,
    configurable: true
  });
  SelectControlValueAccessor.prototype.registerOnChange = function(fn) {
    this.onChange = fn;
  };
  SelectControlValueAccessor.prototype.registerOnTouched = function(fn) {
    this.onTouched = fn;
  };
  SelectControlValueAccessor.prototype._updateValueWhenListOfOptionsChanges = function(query) {
    var _this = this;
    query.onChange(function() {
      return _this.writeValue(_this.value);
    });
  };
  SelectControlValueAccessor = __decorate([metadata_1.Directive({
    selector: 'select[ng-control],select[ng-form-control],select[ng-model]',
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
  }), __param(0, di_1.Self()), __param(3, metadata_1.Query(NgSelectOption, {descendants: true})), __metadata('design:paramtypes', [ng_control_1.NgControl, render_1.Renderer, core_1.ElementRef, core_1.QueryList])], SelectControlValueAccessor);
  return SelectControlValueAccessor;
})();
exports.SelectControlValueAccessor = SelectControlValueAccessor;

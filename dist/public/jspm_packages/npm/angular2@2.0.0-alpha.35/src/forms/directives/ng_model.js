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
var __param = (this && this.__param) || function(paramIndex, decorator) {
  return function(target, key) {
    decorator(target, key, paramIndex);
  };
};
var lang_1 = require("../../facade/lang");
var async_1 = require("../../facade/async");
var core_1 = require("../../../core");
var metadata_1 = require("../../../metadata");
var di_1 = require("../../../di");
var ng_control_1 = require("./ng_control");
var model_1 = require("../model");
var validators_1 = require("./validators");
var shared_1 = require("./shared");
var formControlBinding = lang_1.CONST_EXPR(new di_1.Binding(ng_control_1.NgControl, {toAlias: di_1.forwardRef(function() {
    return NgModel;
  })}));
var NgModel = (function(_super) {
  __extends(NgModel, _super);
  function NgModel(ngValidators) {
    _super.call(this);
    this._control = new model_1.Control();
    this._added = false;
    this.update = new async_1.EventEmitter();
    this.ngValidators = ngValidators;
  }
  NgModel.prototype.onChange = function(c) {
    if (!this._added) {
      shared_1.setUpControl(this._control, this);
      this._control.updateValidity();
      this._added = true;
    }
    if (shared_1.isPropertyUpdated(c, this.viewModel)) {
      this._control.updateValue(this.model);
    }
  };
  Object.defineProperty(NgModel.prototype, "control", {
    get: function() {
      return this._control;
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(NgModel.prototype, "path", {
    get: function() {
      return [];
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(NgModel.prototype, "validator", {
    get: function() {
      return shared_1.composeNgValidator(this.ngValidators);
    },
    enumerable: true,
    configurable: true
  });
  NgModel.prototype.viewToModelUpdate = function(newValue) {
    this.viewModel = newValue;
    async_1.ObservableWrapper.callNext(this.update, newValue);
  };
  NgModel = __decorate([metadata_1.Directive({
    selector: '[ng-model]:not([ng-control]):not([ng-form-control])',
    bindings: [formControlBinding],
    properties: ['model: ngModel'],
    events: ['update: ngModel'],
    lifecycle: [metadata_1.LifecycleEvent.onChange],
    exportAs: 'form'
  }), __param(0, metadata_1.Query(validators_1.NgValidator)), __metadata('design:paramtypes', [core_1.QueryList])], NgModel);
  return NgModel;
})(ng_control_1.NgControl);
exports.NgModel = NgModel;

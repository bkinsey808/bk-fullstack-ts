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
var control_container_1 = require("./control_container");
var ng_control_1 = require("./ng_control");
var validators_1 = require("./validators");
var shared_1 = require("./shared");
var controlNameBinding = lang_1.CONST_EXPR(new di_1.Binding(ng_control_1.NgControl, {toAlias: di_1.forwardRef(function() {
    return NgControlName;
  })}));
var NgControlName = (function(_super) {
  __extends(NgControlName, _super);
  function NgControlName(parent, ngValidators) {
    _super.call(this);
    this.update = new async_1.EventEmitter();
    this._added = false;
    this._parent = parent;
    this.ngValidators = ngValidators;
  }
  NgControlName.prototype.onChange = function(c) {
    if (!this._added) {
      this.formDirective.addControl(this);
      this._added = true;
    }
    if (shared_1.isPropertyUpdated(c, this.viewModel)) {
      this.viewModel = this.model;
      this.formDirective.updateModel(this, this.model);
    }
  };
  NgControlName.prototype.onDestroy = function() {
    this.formDirective.removeControl(this);
  };
  NgControlName.prototype.viewToModelUpdate = function(newValue) {
    this.viewModel = newValue;
    async_1.ObservableWrapper.callNext(this.update, newValue);
  };
  Object.defineProperty(NgControlName.prototype, "path", {
    get: function() {
      return shared_1.controlPath(this.name, this._parent);
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(NgControlName.prototype, "formDirective", {
    get: function() {
      return this._parent.formDirective;
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(NgControlName.prototype, "control", {
    get: function() {
      return this.formDirective.getControl(this);
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(NgControlName.prototype, "validator", {
    get: function() {
      return shared_1.composeNgValidator(this.ngValidators);
    },
    enumerable: true,
    configurable: true
  });
  NgControlName = __decorate([metadata_1.Directive({
    selector: '[ng-control]',
    bindings: [controlNameBinding],
    properties: ['name: ngControl', 'model: ngModel'],
    events: ['update: ngModel'],
    lifecycle: [metadata_1.LifecycleEvent.onDestroy, metadata_1.LifecycleEvent.onChange],
    exportAs: 'form'
  }), __param(0, di_1.Host()), __param(0, di_1.SkipSelf()), __param(1, metadata_1.Query(validators_1.NgValidator)), __metadata('design:paramtypes', [control_container_1.ControlContainer, core_1.QueryList])], NgControlName);
  return NgControlName;
})(ng_control_1.NgControl);
exports.NgControlName = NgControlName;

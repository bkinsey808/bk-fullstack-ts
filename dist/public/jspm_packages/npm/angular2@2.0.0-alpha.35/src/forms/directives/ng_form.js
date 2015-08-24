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
var async_1 = require("../../facade/async");
var collection_1 = require("../../facade/collection");
var lang_1 = require("../../facade/lang");
var metadata_1 = require("../../../metadata");
var di_1 = require("../../../di");
var control_container_1 = require("./control_container");
var model_1 = require("../model");
var shared_1 = require("./shared");
var formDirectiveBinding = lang_1.CONST_EXPR(new di_1.Binding(control_container_1.ControlContainer, {toAlias: di_1.forwardRef(function() {
    return NgForm;
  })}));
var NgForm = (function(_super) {
  __extends(NgForm, _super);
  function NgForm() {
    _super.call(this);
    this.ngSubmit = new async_1.EventEmitter();
    this.form = new model_1.ControlGroup({});
  }
  Object.defineProperty(NgForm.prototype, "formDirective", {
    get: function() {
      return this;
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(NgForm.prototype, "control", {
    get: function() {
      return this.form;
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(NgForm.prototype, "path", {
    get: function() {
      return [];
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(NgForm.prototype, "controls", {
    get: function() {
      return this.form.controls;
    },
    enumerable: true,
    configurable: true
  });
  NgForm.prototype.addControl = function(dir) {
    var _this = this;
    this._later(function(_) {
      var container = _this._findContainer(dir.path);
      var c = new model_1.Control();
      shared_1.setUpControl(c, dir);
      container.addControl(dir.name, c);
      c.updateValidity();
    });
  };
  NgForm.prototype.getControl = function(dir) {
    return this.form.find(dir.path);
  };
  NgForm.prototype.removeControl = function(dir) {
    var _this = this;
    this._later(function(_) {
      var container = _this._findContainer(dir.path);
      if (lang_1.isPresent(container)) {
        container.removeControl(dir.name);
        container.updateValidity();
      }
    });
  };
  NgForm.prototype.addControlGroup = function(dir) {
    var _this = this;
    this._later(function(_) {
      var container = _this._findContainer(dir.path);
      var c = new model_1.ControlGroup({});
      container.addControl(dir.name, c);
      c.updateValidity();
    });
  };
  NgForm.prototype.removeControlGroup = function(dir) {
    var _this = this;
    this._later(function(_) {
      var container = _this._findContainer(dir.path);
      if (lang_1.isPresent(container)) {
        container.removeControl(dir.name);
        container.updateValidity();
      }
    });
  };
  NgForm.prototype.getControlGroup = function(dir) {
    return this.form.find(dir.path);
  };
  NgForm.prototype.updateModel = function(dir, value) {
    var _this = this;
    this._later(function(_) {
      var c = _this.form.find(dir.path);
      c.updateValue(value);
    });
  };
  NgForm.prototype.onSubmit = function() {
    async_1.ObservableWrapper.callNext(this.ngSubmit, null);
    return false;
  };
  NgForm.prototype._findContainer = function(path) {
    collection_1.ListWrapper.removeLast(path);
    return collection_1.ListWrapper.isEmpty(path) ? this.form : this.form.find(path);
  };
  NgForm.prototype._later = function(fn) {
    var c = async_1.PromiseWrapper.completer();
    async_1.PromiseWrapper.then(c.promise, fn, function(_) {});
    c.resolve(null);
  };
  NgForm = __decorate([metadata_1.Directive({
    selector: 'form:not([ng-no-form]):not([ng-form-model]),ng-form,[ng-form]',
    bindings: [formDirectiveBinding],
    host: {'(submit)': 'onSubmit()'},
    events: ['ngSubmit'],
    exportAs: 'form'
  }), __metadata('design:paramtypes', [])], NgForm);
  return NgForm;
})(control_container_1.ControlContainer);
exports.NgForm = NgForm;

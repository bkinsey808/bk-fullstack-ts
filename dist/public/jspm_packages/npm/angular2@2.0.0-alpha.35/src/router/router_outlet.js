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
var async_1 = require("../facade/async");
var collection_1 = require("../facade/collection");
var lang_1 = require("../facade/lang");
var metadata_1 = require("../core/metadata");
var core_1 = require("../../core");
var di_1 = require("../../di");
var routerMod = require("./router");
var instruction_1 = require("./instruction");
var route_config_impl_1 = require("./route_config_impl");
var hookMod = require("./lifecycle_annotations");
var route_lifecycle_reflector_1 = require("./route_lifecycle_reflector");
var RouterOutlet = (function() {
  function RouterOutlet(_elementRef, _loader, _parentRouter, nameAttr) {
    this._elementRef = _elementRef;
    this._loader = _loader;
    this._parentRouter = _parentRouter;
    this.childRouter = null;
    this.name = null;
    this._componentRef = null;
    this._currentInstruction = null;
    if (lang_1.isPresent(nameAttr)) {
      this.name = nameAttr;
    }
    this._parentRouter.registerOutlet(this);
  }
  RouterOutlet.prototype.commit = function(instruction) {
    var _this = this;
    instruction = this._getInstruction(instruction);
    var componentInstruction = instruction.component;
    if (lang_1.isBlank(componentInstruction)) {
      return async_1.PromiseWrapper.resolve(true);
    }
    var next;
    if (componentInstruction.reuse) {
      next = this._reuse(componentInstruction);
    } else {
      next = this.deactivate(instruction).then(function(_) {
        return _this._activate(componentInstruction);
      });
    }
    return next.then(function(_) {
      return _this._commitChild(instruction);
    });
  };
  RouterOutlet.prototype._getInstruction = function(instruction) {
    if (lang_1.isPresent(this.name)) {
      return instruction.auxInstruction[this.name];
    } else {
      return instruction;
    }
  };
  RouterOutlet.prototype._commitChild = function(instruction) {
    if (lang_1.isPresent(this.childRouter)) {
      return this.childRouter.commit(instruction.child);
    } else {
      return async_1.PromiseWrapper.resolve(true);
    }
  };
  RouterOutlet.prototype._activate = function(instruction) {
    var _this = this;
    var previousInstruction = this._currentInstruction;
    this._currentInstruction = instruction;
    var componentType = instruction.componentType;
    this.childRouter = this._parentRouter.childRouter(componentType);
    var bindings = di_1.Injector.resolve([di_1.bind(route_config_impl_1.ROUTE_DATA).toValue(instruction.routeData()), di_1.bind(instruction_1.RouteParams).toValue(new instruction_1.RouteParams(instruction.params)), di_1.bind(routerMod.Router).toValue(this.childRouter)]);
    return this._loader.loadNextToLocation(componentType, this._elementRef, bindings).then(function(componentRef) {
      _this._componentRef = componentRef;
      if (route_lifecycle_reflector_1.hasLifecycleHook(hookMod.onActivate, componentType)) {
        return _this._componentRef.instance.onActivate(instruction, previousInstruction);
      }
    });
  };
  RouterOutlet.prototype.canDeactivate = function(nextInstruction) {
    if (lang_1.isBlank(this._currentInstruction)) {
      return async_1.PromiseWrapper.resolve(true);
    }
    var outletInstruction = this._getInstruction(nextInstruction);
    if (route_lifecycle_reflector_1.hasLifecycleHook(hookMod.canDeactivate, this._currentInstruction.componentType)) {
      return async_1.PromiseWrapper.resolve(this._componentRef.instance.canDeactivate(lang_1.isPresent(outletInstruction) ? outletInstruction.component : null, this._currentInstruction));
    }
    return async_1.PromiseWrapper.resolve(true);
  };
  RouterOutlet.prototype.canReuse = function(nextInstruction) {
    var result;
    var outletInstruction = this._getInstruction(nextInstruction);
    var componentInstruction = outletInstruction.component;
    if (lang_1.isBlank(this._currentInstruction) || this._currentInstruction.componentType != componentInstruction.componentType) {
      result = false;
    } else if (route_lifecycle_reflector_1.hasLifecycleHook(hookMod.canReuse, this._currentInstruction.componentType)) {
      result = this._componentRef.instance.canReuse(componentInstruction, this._currentInstruction);
    } else {
      result = componentInstruction == this._currentInstruction || (lang_1.isPresent(componentInstruction.params) && lang_1.isPresent(this._currentInstruction.params) && collection_1.StringMapWrapper.equals(componentInstruction.params, this._currentInstruction.params));
    }
    return async_1.PromiseWrapper.resolve(result).then(function(result) {
      componentInstruction.reuse = result;
      return result;
    });
  };
  RouterOutlet.prototype._reuse = function(instruction) {
    var previousInstruction = this._currentInstruction;
    this._currentInstruction = instruction;
    return async_1.PromiseWrapper.resolve(route_lifecycle_reflector_1.hasLifecycleHook(hookMod.onReuse, this._currentInstruction.componentType) ? this._componentRef.instance.onReuse(instruction, previousInstruction) : true);
  };
  RouterOutlet.prototype.deactivate = function(nextInstruction) {
    var _this = this;
    var outletInstruction = this._getInstruction(nextInstruction);
    var componentInstruction = lang_1.isPresent(outletInstruction) ? outletInstruction.component : null;
    return (lang_1.isPresent(this.childRouter) ? this.childRouter.deactivate(lang_1.isPresent(outletInstruction) ? outletInstruction.child : null) : async_1.PromiseWrapper.resolve(true)).then(function(_) {
      if (lang_1.isPresent(_this._componentRef) && lang_1.isPresent(_this._currentInstruction) && route_lifecycle_reflector_1.hasLifecycleHook(hookMod.onDeactivate, _this._currentInstruction.componentType)) {
        return _this._componentRef.instance.onDeactivate(componentInstruction, _this._currentInstruction);
      }
    }).then(function(_) {
      if (lang_1.isPresent(_this._componentRef)) {
        _this._componentRef.dispose();
        _this._componentRef = null;
      }
    });
  };
  RouterOutlet = __decorate([metadata_1.Directive({selector: 'router-outlet'}), __param(3, metadata_1.Attribute('name')), __metadata('design:paramtypes', [core_1.ElementRef, core_1.DynamicComponentLoader, routerMod.Router, String])], RouterOutlet);
  return RouterOutlet;
})();
exports.RouterOutlet = RouterOutlet;

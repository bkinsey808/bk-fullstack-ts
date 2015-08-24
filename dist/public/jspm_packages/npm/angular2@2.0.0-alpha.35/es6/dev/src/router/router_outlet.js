/* */ 
"format cjs";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") return Reflect.decorate(decorators, target, key, desc);
    switch (arguments.length) {
        case 2: return decorators.reduceRight(function(o, d) { return (d && d(o)) || o; }, target);
        case 3: return decorators.reduceRight(function(o, d) { return (d && d(target, key)), void 0; }, void 0);
        case 4: return decorators.reduceRight(function(o, d) { return (d && d(target, key, o)) || o; }, desc);
    }
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { PromiseWrapper } from 'angular2/src/facade/async';
import { StringMapWrapper } from 'angular2/src/facade/collection';
import { isBlank, isPresent } from 'angular2/src/facade/lang';
import { Directive, Attribute } from '../core/metadata';
import { DynamicComponentLoader, ElementRef } from 'angular2/core';
import { Injector, bind } from 'angular2/di';
import * as routerMod from './router';
import { RouteParams } from './instruction';
import { ROUTE_DATA } from './route_config_impl';
import * as hookMod from './lifecycle_annotations';
import { hasLifecycleHook } from './route_lifecycle_reflector';
/**
 * A router outlet is a placeholder that Angular dynamically fills based on the application's route.
 *
 * ## Use
 *
 * ```
 * <router-outlet></router-outlet>
 * ```
 */
export let RouterOutlet = class {
    constructor(_elementRef, _loader, _parentRouter, nameAttr) {
        this._elementRef = _elementRef;
        this._loader = _loader;
        this._parentRouter = _parentRouter;
        this.childRouter = null;
        this.name = null;
        this._componentRef = null;
        this._currentInstruction = null;
        if (isPresent(nameAttr)) {
            this.name = nameAttr;
        }
        this._parentRouter.registerOutlet(this);
    }
    /**
     * Given an instruction, update the contents of this outlet.
     */
    commit(instruction) {
        instruction = this._getInstruction(instruction);
        var componentInstruction = instruction.component;
        if (isBlank(componentInstruction)) {
            return PromiseWrapper.resolve(true);
        }
        var next;
        if (componentInstruction.reuse) {
            next = this._reuse(componentInstruction);
        }
        else {
            next = this.deactivate(instruction).then((_) => this._activate(componentInstruction));
        }
        return next.then((_) => this._commitChild(instruction));
    }
    _getInstruction(instruction) {
        if (isPresent(this.name)) {
            return instruction.auxInstruction[this.name];
        }
        else {
            return instruction;
        }
    }
    _commitChild(instruction) {
        if (isPresent(this.childRouter)) {
            return this.childRouter.commit(instruction.child);
        }
        else {
            return PromiseWrapper.resolve(true);
        }
    }
    _activate(instruction) {
        var previousInstruction = this._currentInstruction;
        this._currentInstruction = instruction;
        var componentType = instruction.componentType;
        this.childRouter = this._parentRouter.childRouter(componentType);
        var bindings = Injector.resolve([
            bind(ROUTE_DATA)
                .toValue(instruction.routeData()),
            bind(RouteParams).toValue(new RouteParams(instruction.params)),
            bind(routerMod.Router).toValue(this.childRouter)
        ]);
        return this._loader.loadNextToLocation(componentType, this._elementRef, bindings)
            .then((componentRef) => {
            this._componentRef = componentRef;
            if (hasLifecycleHook(hookMod.onActivate, componentType)) {
                return this._componentRef.instance.onActivate(instruction, previousInstruction);
            }
        });
    }
    /**
     * Called by Router during recognition phase
     */
    canDeactivate(nextInstruction) {
        if (isBlank(this._currentInstruction)) {
            return PromiseWrapper.resolve(true);
        }
        var outletInstruction = this._getInstruction(nextInstruction);
        if (hasLifecycleHook(hookMod.canDeactivate, this._currentInstruction.componentType)) {
            return PromiseWrapper.resolve(this._componentRef.instance.canDeactivate(isPresent(outletInstruction) ? outletInstruction.component : null, this._currentInstruction));
        }
        return PromiseWrapper.resolve(true);
    }
    /**
     * Called by Router during recognition phase
     */
    canReuse(nextInstruction) {
        var result;
        var outletInstruction = this._getInstruction(nextInstruction);
        var componentInstruction = outletInstruction.component;
        if (isBlank(this._currentInstruction) ||
            this._currentInstruction.componentType != componentInstruction.componentType) {
            result = false;
        }
        else if (hasLifecycleHook(hookMod.canReuse, this._currentInstruction.componentType)) {
            result = this._componentRef.instance.canReuse(componentInstruction, this._currentInstruction);
        }
        else {
            result =
                componentInstruction == this._currentInstruction ||
                    (isPresent(componentInstruction.params) && isPresent(this._currentInstruction.params) &&
                        StringMapWrapper.equals(componentInstruction.params, this._currentInstruction.params));
        }
        return PromiseWrapper.resolve(result).then((result) => {
            // TODO: this is a hack
            componentInstruction.reuse = result;
            return result;
        });
    }
    _reuse(instruction) {
        var previousInstruction = this._currentInstruction;
        this._currentInstruction = instruction;
        return PromiseWrapper.resolve(hasLifecycleHook(hookMod.onReuse, this._currentInstruction.componentType) ?
            this._componentRef.instance.onReuse(instruction, previousInstruction) :
            true);
    }
    deactivate(nextInstruction) {
        var outletInstruction = this._getInstruction(nextInstruction);
        var componentInstruction = isPresent(outletInstruction) ? outletInstruction.component : null;
        return (isPresent(this.childRouter) ?
            this.childRouter.deactivate(isPresent(outletInstruction) ? outletInstruction.child :
                null) :
            PromiseWrapper.resolve(true))
            .then((_) => {
            if (isPresent(this._componentRef) && isPresent(this._currentInstruction) &&
                hasLifecycleHook(hookMod.onDeactivate, this._currentInstruction.componentType)) {
                return this._componentRef.instance.onDeactivate(componentInstruction, this._currentInstruction);
            }
        })
            .then((_) => {
            if (isPresent(this._componentRef)) {
                this._componentRef.dispose();
                this._componentRef = null;
            }
        });
    }
};
RouterOutlet = __decorate([
    Directive({ selector: 'router-outlet' }),
    __param(3, Attribute('name')), 
    __metadata('design:paramtypes', [ElementRef, DynamicComponentLoader, routerMod.Router, String])
], RouterOutlet);
//# sourceMappingURL=router_outlet.js.map
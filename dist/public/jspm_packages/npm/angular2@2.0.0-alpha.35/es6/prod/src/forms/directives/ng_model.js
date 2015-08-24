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
import { CONST_EXPR } from 'angular2/src/facade/lang';
import { EventEmitter, ObservableWrapper } from 'angular2/src/facade/async';
import { QueryList } from 'angular2/core';
import { Query, Directive, LifecycleEvent } from 'angular2/metadata';
import { forwardRef, Binding } from 'angular2/di';
import { NgControl } from './ng_control';
import { Control } from '../model';
import { NgValidator } from './validators';
import { setUpControl, composeNgValidator, isPropertyUpdated } from './shared';
const formControlBinding = CONST_EXPR(new Binding(NgControl, { toAlias: forwardRef(() => NgModel) }));
/**
 * Binds a domain model to the form.
 *
 * # Example
 *  ```
 * @Component({selector: "search-comp"})
 * @View({
 *      directives: [FORM_DIRECTIVES],
 *      template: `
              <input type='text' [(ng-model)]="searchQuery">
 *      `})
 * class SearchComp {
 *  searchQuery: string;
 * }
 *  ```
 */
export let NgModel = class extends NgControl {
    // Scope the query once https://github.com/angular/angular/issues/2603 is fixed
    constructor(ngValidators) {
        super();
        this._control = new Control();
        this._added = false;
        this.update = new EventEmitter();
        this.ngValidators = ngValidators;
    }
    onChange(c) {
        if (!this._added) {
            setUpControl(this._control, this);
            this._control.updateValidity();
            this._added = true;
        }
        if (isPropertyUpdated(c, this.viewModel)) {
            this._control.updateValue(this.model);
        }
    }
    get control() { return this._control; }
    get path() { return []; }
    get validator() { return composeNgValidator(this.ngValidators); }
    viewToModelUpdate(newValue) {
        this.viewModel = newValue;
        ObservableWrapper.callNext(this.update, newValue);
    }
};
NgModel = __decorate([
    Directive({
        selector: '[ng-model]:not([ng-control]):not([ng-form-control])',
        bindings: [formControlBinding],
        properties: ['model: ngModel'],
        events: ['update: ngModel'],
        lifecycle: [LifecycleEvent.onChange],
        exportAs: 'form'
    }),
    __param(0, Query(NgValidator)), 
    __metadata('design:paramtypes', [QueryList])
], NgModel);
//# sourceMappingURL=ng_model.js.map
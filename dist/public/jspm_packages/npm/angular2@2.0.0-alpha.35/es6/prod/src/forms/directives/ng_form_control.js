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
import { NgValidator } from './validators';
import { setUpControl, composeNgValidator, isPropertyUpdated } from './shared';
const formControlBinding = CONST_EXPR(new Binding(NgControl, { toAlias: forwardRef(() => NgFormControl) }));
/**
 * Binds an existing control to a DOM element.
 *
 * # Example
 *
 * In this example, we bind the control to an input element. When the value of the input element
 * changes, the value of
 * the control will reflect that change. Likewise, if the value of the control changes, the input
 * element reflects that
 * change.
 *
 *  ```
 * @Component({selector: "login-comp"})
 * @View({
 *      directives: [FORM_DIRECTIVES],
 *      template: "<input type='text' [ng-form-control]='loginControl'>"
 *      })
 * class LoginComp {
 *  loginControl:Control;
 *
 *  constructor() {
 *    this.loginControl = new Control('');
 *  }
 * }
 *
 *  ```
 *
 * We can also use ng-model to bind a domain model to the form.
 *
 *  ```
 * @Component({selector: "login-comp"})
 * @View({
 *      directives: [FORM_DIRECTIVES],
 *      template: "<input type='text' [ng-form-control]='loginControl' [(ng-model)]='login'>"
 *      })
 * class LoginComp {
 *  loginControl:Control;
 *  login:string;
 *
 *  constructor() {
 *    this.loginControl = new Control('');
 *  }
 * }
 *  ```
 */
export let NgFormControl = class extends NgControl {
    // Scope the query once https://github.com/angular/angular/issues/2603 is fixed
    constructor(ngValidators) {
        super();
        this.update = new EventEmitter();
        this._added = false;
        this.ngValidators = ngValidators;
    }
    onChange(c) {
        if (!this._added) {
            setUpControl(this.form, this);
            this.form.updateValidity();
            this._added = true;
        }
        if (isPropertyUpdated(c, this.viewModel)) {
            this.form.updateValue(this.model);
        }
    }
    get path() { return []; }
    get control() { return this.form; }
    get validator() { return composeNgValidator(this.ngValidators); }
    viewToModelUpdate(newValue) {
        this.viewModel = newValue;
        ObservableWrapper.callNext(this.update, newValue);
    }
};
NgFormControl = __decorate([
    Directive({
        selector: '[ng-form-control]',
        bindings: [formControlBinding],
        properties: ['form: ngFormControl', 'model: ngModel'],
        events: ['update: ngModel'],
        lifecycle: [LifecycleEvent.onChange],
        exportAs: 'form'
    }),
    __param(0, Query(NgValidator)), 
    __metadata('design:paramtypes', [QueryList])
], NgFormControl);
//# sourceMappingURL=ng_form_control.js.map
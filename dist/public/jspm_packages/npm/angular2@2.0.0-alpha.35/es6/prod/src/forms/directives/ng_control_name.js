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
import { forwardRef, Host, SkipSelf, Binding } from 'angular2/di';
import { ControlContainer } from './control_container';
import { NgControl } from './ng_control';
import { NgValidator } from './validators';
import { controlPath, composeNgValidator, isPropertyUpdated } from './shared';
const controlNameBinding = CONST_EXPR(new Binding(NgControl, { toAlias: forwardRef(() => NgControlName) }));
/**
 * Creates and binds a control with a specified name to a DOM element.
 *
 * This directive can only be used as a child of {@link NgForm} or {@link NgFormModel}.

 * # Example
 *
 * In this example, we create the login and password controls.
 * We can work with each control separately: check its validity, get its value, listen to its
 changes.
 *
 *  ```
 * @Component({selector: "login-comp"})
 * @View({
 *      directives: [FORM_DIRECTIVES],
 *      template: `
 *              <form #f="form" (submit)='onLogIn(f.value)'>
 *                Login <input type='text' ng-control='login' #l="form">
 *                <div *ng-if="!l.valid">Login is invalid</div>
 *
 *                Password <input type='password' ng-control='password'>

 *                <button type='submit'>Log in!</button>
 *              </form>
 *      `})
 * class LoginComp {
 *  onLogIn(value) {
 *    // value === {login: 'some login', password: 'some password'}
 *  }
 * }
 *  ```
 *
 * We can also use ng-model to bind a domain model to the form.
 *
 *  ```
 * @Component({selector: "login-comp"})
 * @View({
 *      directives: [FORM_DIRECTIVES],
 *      template: `
 *              <form (submit)='onLogIn()'>
 *                Login <input type='text' ng-control='login' [(ng-model)]="credentials.login">
 *                Password <input type='password' ng-control='password'
 [(ng-model)]="credentials.password">
 *                <button type='submit'>Log in!</button>
 *              </form>
 *      `})
 * class LoginComp {
 *  credentials: {login:string, password:string};
 *
 *  onLogIn() {
 *    // this.credentials.login === "some login"
 *    // this.credentials.password === "some password"
 *  }
 * }
 *  ```
 */
export let NgControlName = class extends NgControl {
    // Scope the query once https://github.com/angular/angular/issues/2603 is fixed
    constructor(parent, ngValidators) {
        super();
        this.update = new EventEmitter();
        this._added = false;
        this._parent = parent;
        this.ngValidators = ngValidators;
    }
    onChange(c) {
        if (!this._added) {
            this.formDirective.addControl(this);
            this._added = true;
        }
        if (isPropertyUpdated(c, this.viewModel)) {
            this.viewModel = this.model;
            this.formDirective.updateModel(this, this.model);
        }
    }
    onDestroy() { this.formDirective.removeControl(this); }
    viewToModelUpdate(newValue) {
        this.viewModel = newValue;
        ObservableWrapper.callNext(this.update, newValue);
    }
    get path() { return controlPath(this.name, this._parent); }
    get formDirective() { return this._parent.formDirective; }
    get control() { return this.formDirective.getControl(this); }
    get validator() { return composeNgValidator(this.ngValidators); }
};
NgControlName = __decorate([
    Directive({
        selector: '[ng-control]',
        bindings: [controlNameBinding],
        properties: ['name: ngControl', 'model: ngModel'],
        events: ['update: ngModel'],
        lifecycle: [LifecycleEvent.onDestroy, LifecycleEvent.onChange],
        exportAs: 'form'
    }),
    __param(0, Host()),
    __param(0, SkipSelf()),
    __param(1, Query(NgValidator)), 
    __metadata('design:paramtypes', [ControlContainer, QueryList])
], NgControlName);
//# sourceMappingURL=ng_control_name.js.map
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
import { PromiseWrapper, ObservableWrapper, EventEmitter } from 'angular2/src/facade/async';
import { ListWrapper } from 'angular2/src/facade/collection';
import { isPresent, CONST_EXPR } from 'angular2/src/facade/lang';
import { Directive } from 'angular2/metadata';
import { forwardRef, Binding } from 'angular2/di';
import { ControlContainer } from './control_container';
import { ControlGroup, Control } from '../model';
import { setUpControl } from './shared';
const formDirectiveBinding = CONST_EXPR(new Binding(ControlContainer, { toAlias: forwardRef(() => NgForm) }));
/**
 * Creates and binds a form object to a DOM element.
 *
 * # Example
 *
 *  ```
 * @Component({selector: "signup-comp"})
 * @View({
 *      directives: [FORM_DIRECTIVES],
 *      template: `
 *              <form #f="form" (submit)='onSignUp(f.value)'>
 *                <div ng-control-group='credentials' #credentials="form">
 *                  Login <input type='text' ng-control='login'>
 *                  Password <input type='password' ng-control='password'>
 *                </div>
 *                <div *ng-if="!credentials.valid">Credentials are invalid</div>
 *
 *                <div ng-control-group='personal'>
 *                  Name <input type='text' ng-control='name'>
 *                </div>
 *                <button type='submit'>Sign Up!</button>
 *              </form>
 *      `})
 * class SignupComp {
 *  onSignUp(value) {
 *    // value === {personal: {name: 'some name'},
 *    //  credentials: {login: 'some login', password: 'some password'}}
 *  }
 * }
 *
 *  ```
 */
export let NgForm = class extends ControlContainer {
    constructor() {
        super();
        this.ngSubmit = new EventEmitter();
        this.form = new ControlGroup({});
    }
    get formDirective() { return this; }
    get control() { return this.form; }
    get path() { return []; }
    get controls() { return this.form.controls; }
    addControl(dir) {
        this._later(_ => {
            var container = this._findContainer(dir.path);
            var c = new Control();
            setUpControl(c, dir);
            container.addControl(dir.name, c);
            c.updateValidity();
        });
    }
    getControl(dir) { return this.form.find(dir.path); }
    removeControl(dir) {
        this._later(_ => {
            var container = this._findContainer(dir.path);
            if (isPresent(container)) {
                container.removeControl(dir.name);
                container.updateValidity();
            }
        });
    }
    addControlGroup(dir) {
        this._later(_ => {
            var container = this._findContainer(dir.path);
            var c = new ControlGroup({});
            container.addControl(dir.name, c);
            c.updateValidity();
        });
    }
    removeControlGroup(dir) {
        this._later(_ => {
            var container = this._findContainer(dir.path);
            if (isPresent(container)) {
                container.removeControl(dir.name);
                container.updateValidity();
            }
        });
    }
    getControlGroup(dir) {
        return this.form.find(dir.path);
    }
    updateModel(dir, value) {
        this._later(_ => {
            var c = this.form.find(dir.path);
            c.updateValue(value);
        });
    }
    onSubmit() {
        ObservableWrapper.callNext(this.ngSubmit, null);
        return false;
    }
    _findContainer(path) {
        ListWrapper.removeLast(path);
        return ListWrapper.isEmpty(path) ? this.form : this.form.find(path);
    }
    _later(fn) {
        var c = PromiseWrapper.completer();
        PromiseWrapper.then(c.promise, fn, (_) => { });
        c.resolve(null);
    }
};
NgForm = __decorate([
    Directive({
        selector: 'form:not([ng-no-form]):not([ng-form-model]),ng-form,[ng-form]',
        bindings: [formDirectiveBinding],
        host: {
            '(submit)': 'onSubmit()',
        },
        events: ['ngSubmit'],
        exportAs: 'form'
    }), 
    __metadata('design:paramtypes', [])
], NgForm);
//# sourceMappingURL=ng_form.js.map
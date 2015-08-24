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
import { Directive, LifecycleEvent } from 'angular2/metadata';
import { Host, SkipSelf, forwardRef, Binding } from 'angular2/di';
import { CONST_EXPR } from 'angular2/src/facade/lang';
import { ControlContainer } from './control_container';
import { controlPath } from './shared';
const controlGroupBinding = CONST_EXPR(new Binding(ControlContainer, { toAlias: forwardRef(() => NgControlGroup) }));
/**
 * Creates and binds a control group to a DOM element.
 *
 * This directive can only be used as a child of {@link NgForm} or {@link NgFormModel}.
 *
 * # Example
 *
 * In this example, we create the credentials and personal control groups.
 * We can work with each group separately: check its validity, get its value, listen to its changes.
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
export let NgControlGroup = class extends ControlContainer {
    constructor(_parent) {
        super();
        this._parent = _parent;
    }
    onInit() { this.formDirective.addControlGroup(this); }
    onDestroy() { this.formDirective.removeControlGroup(this); }
    get control() { return this.formDirective.getControlGroup(this); }
    get path() { return controlPath(this.name, this._parent); }
    get formDirective() { return this._parent.formDirective; }
};
NgControlGroup = __decorate([
    Directive({
        selector: '[ng-control-group]',
        bindings: [controlGroupBinding],
        properties: ['name: ng-control-group'],
        lifecycle: [LifecycleEvent.onInit, LifecycleEvent.onDestroy],
        exportAs: 'form'
    }),
    __param(0, Host()),
    __param(0, SkipSelf()), 
    __metadata('design:paramtypes', [ControlContainer])
], NgControlGroup);
//# sourceMappingURL=ng_control_group.js.map
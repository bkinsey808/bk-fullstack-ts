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
import { Renderer } from 'angular2/render';
import { Directive } from 'angular2/metadata';
import { ElementRef } from 'angular2/core';
import { Self } from 'angular2/di';
import { NgControl } from './ng_control';
import { isPresent } from 'angular2/src/facade/lang';
import { setProperty } from './shared';
/**
 * The accessor for writing a value and listening to changes on a checkbox input element.
 *
 *  # Example
 *  ```
 *  <input type="checkbox" [ng-control]="rememberLogin">
 *  ```
 */
export let CheckboxControlValueAccessor = class {
    constructor(cd, renderer, elementRef) {
        this.renderer = renderer;
        this.elementRef = elementRef;
        this.onChange = (_) => { };
        this.onTouched = () => { };
        this.cd = cd;
        cd.valueAccessor = this;
    }
    writeValue(value) { setProperty(this.renderer, this.elementRef, "checked", value); }
    get ngClassUntouched() {
        return isPresent(this.cd.control) ? this.cd.control.untouched : false;
    }
    get ngClassTouched() {
        return isPresent(this.cd.control) ? this.cd.control.touched : false;
    }
    get ngClassPristine() {
        return isPresent(this.cd.control) ? this.cd.control.pristine : false;
    }
    get ngClassDirty() { return isPresent(this.cd.control) ? this.cd.control.dirty : false; }
    get ngClassValid() { return isPresent(this.cd.control) ? this.cd.control.valid : false; }
    get ngClassInvalid() {
        return isPresent(this.cd.control) ? !this.cd.control.valid : false;
    }
    registerOnChange(fn) { this.onChange = fn; }
    registerOnTouched(fn) { this.onTouched = fn; }
};
CheckboxControlValueAccessor = __decorate([
    Directive({
        selector: 'input[type=checkbox][ng-control],input[type=checkbox][ng-form-control],input[type=checkbox][ng-model]',
        host: {
            '(change)': 'onChange($event.target.checked)',
            '(blur)': 'onTouched()',
            '[class.ng-untouched]': 'ngClassUntouched',
            '[class.ng-touched]': 'ngClassTouched',
            '[class.ng-pristine]': 'ngClassPristine',
            '[class.ng-dirty]': 'ngClassDirty',
            '[class.ng-valid]': 'ngClassValid',
            '[class.ng-invalid]': 'ngClassInvalid'
        }
    }),
    __param(0, Self()), 
    __metadata('design:paramtypes', [NgControl, Renderer, ElementRef])
], CheckboxControlValueAccessor);
//# sourceMappingURL=checkbox_value_accessor.js.map
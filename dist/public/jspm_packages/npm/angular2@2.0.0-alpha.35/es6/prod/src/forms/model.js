/* */ 
"format cjs";
import { StringWrapper, isPresent, isBlank } from 'angular2/src/facade/lang';
import { EventEmitter, ObservableWrapper } from 'angular2/src/facade/async';
import { StringMapWrapper, ListWrapper, List } from 'angular2/src/facade/collection';
import { Validators } from './validators';
/**
 * Indicates that a Control is valid, i.e. that no errors exist in the input value.
 */
export const VALID = "VALID";
/**
 * Indicates that a Control is invalid, i.e. that an error exists in the input value.
 */
export const INVALID = "INVALID";
export function isControl(c) {
    return c instanceof AbstractControl;
}
function _find(c, path) {
    if (isBlank(path))
        return null;
    if (!(path instanceof List)) {
        path = StringWrapper.split(path, new RegExp("/"));
    }
    if (path instanceof List && ListWrapper.isEmpty(path))
        return null;
    return ListWrapper.reduce(path, (v, name) => {
        if (v instanceof ControlGroup) {
            return isPresent(v.controls[name]) ? v.controls[name] : null;
        }
        else if (v instanceof ControlArray) {
            var index = name;
            return isPresent(v.at(index)) ? v.at(index) : null;
        }
        else {
            return null;
        }
    }, c);
}
/**
 * Omitting from external API doc as this is really an abstract internal concept.
 */
export class AbstractControl {
    constructor(validator) {
        this.validator = validator;
        this._pristine = true;
        this._touched = false;
    }
    get value() { return this._value; }
    get status() { return this._status; }
    get valid() { return this._status === VALID; }
    get errors() { return this._errors; }
    get pristine() { return this._pristine; }
    get dirty() { return !this.pristine; }
    get touched() { return this._touched; }
    get untouched() { return !this._touched; }
    get valueChanges() { return this._valueChanges; }
    markAsTouched() { this._touched = true; }
    markAsDirty({ onlySelf } = {}) {
        onlySelf = isPresent(onlySelf) ? onlySelf : false;
        this._pristine = false;
        if (isPresent(this._parent) && !onlySelf) {
            this._parent.markAsDirty({ onlySelf: onlySelf });
        }
    }
    setParent(parent) { this._parent = parent; }
    updateValidity({ onlySelf } = {}) {
        onlySelf = isPresent(onlySelf) ? onlySelf : false;
        this._errors = this.validator(this);
        this._status = isPresent(this._errors) ? INVALID : VALID;
        if (isPresent(this._parent) && !onlySelf) {
            this._parent.updateValidity({ onlySelf: onlySelf });
        }
    }
    updateValueAndValidity({ onlySelf, emitEvent } = {}) {
        onlySelf = isPresent(onlySelf) ? onlySelf : false;
        emitEvent = isPresent(emitEvent) ? emitEvent : true;
        this._updateValue();
        if (emitEvent) {
            ObservableWrapper.callNext(this._valueChanges, this._value);
        }
        this._errors = this.validator(this);
        this._status = isPresent(this._errors) ? INVALID : VALID;
        if (isPresent(this._parent) && !onlySelf) {
            this._parent.updateValueAndValidity({ onlySelf: onlySelf, emitEvent: emitEvent });
        }
    }
    find(path) { return _find(this, path); }
    getError(errorCode, path = null) {
        var c = isPresent(path) && !ListWrapper.isEmpty(path) ? this.find(path) : this;
        if (isPresent(c) && isPresent(c._errors)) {
            return StringMapWrapper.get(c._errors, errorCode);
        }
        else {
            return null;
        }
    }
    hasError(errorCode, path = null) {
        return isPresent(this.getError(errorCode, path));
    }
    _updateValue() { }
}
/**
 * Defines a part of a form that cannot be divided into other controls.
 *
 * `Control` is one of the three fundamental building blocks used to define forms in Angular, along
 * with
 * {@link ControlGroup} and {@link ControlArray}.
 */
export class Control extends AbstractControl {
    constructor(value = null, validator = Validators.nullValidator) {
        super(validator);
        this._value = value;
        this.updateValidity({ onlySelf: true });
        this._valueChanges = new EventEmitter();
    }
    updateValue(value, { onlySelf, emitEvent, emitModelToViewChange } = {}) {
        emitModelToViewChange = isPresent(emitModelToViewChange) ? emitModelToViewChange : true;
        this._value = value;
        if (isPresent(this._onChange) && emitModelToViewChange)
            this._onChange(this._value);
        this.updateValueAndValidity({ onlySelf: onlySelf, emitEvent: emitEvent });
    }
    registerOnChange(fn) { this._onChange = fn; }
}
/**
 * Defines a part of a form, of fixed length, that can contain other controls.
 *
 * A ControlGroup aggregates the values and errors of each {@link Control} in the group. Thus, if
 * one of the controls
 * in a group is invalid, the entire group is invalid. Similarly, if a control changes its value,
 * the entire group
 * changes as well.
 *
 * `ControlGroup` is one of the three fundamental building blocks used to define forms in Angular,
 * along with
 * {@link Control} and {@link ControlArray}. {@link ControlArray} can also contain other controls,
 * but is of variable
 * length.
 */
export class ControlGroup extends AbstractControl {
    constructor(controls, optionals = null, validator = Validators.group) {
        super(validator);
        this.controls = controls;
        this._optionals = isPresent(optionals) ? optionals : {};
        this._valueChanges = new EventEmitter();
        this._setParentForControls();
        this._value = this._reduceValue();
        this.updateValidity({ onlySelf: true });
    }
    addControl(name, c) {
        this.controls[name] = c;
        c.setParent(this);
    }
    removeControl(name) { StringMapWrapper.delete(this.controls, name); }
    include(controlName) {
        StringMapWrapper.set(this._optionals, controlName, true);
        this.updateValueAndValidity();
    }
    exclude(controlName) {
        StringMapWrapper.set(this._optionals, controlName, false);
        this.updateValueAndValidity();
    }
    contains(controlName) {
        var c = StringMapWrapper.contains(this.controls, controlName);
        return c && this._included(controlName);
    }
    _setParentForControls() {
        StringMapWrapper.forEach(this.controls, (control, name) => { control.setParent(this); });
    }
    _updateValue() { this._value = this._reduceValue(); }
    _reduceValue() {
        return this._reduceChildren({}, (acc, control, name) => {
            acc[name] = control.value;
            return acc;
        });
    }
    _reduceChildren(initValue, fn) {
        var res = initValue;
        StringMapWrapper.forEach(this.controls, (control, name) => {
            if (this._included(name)) {
                res = fn(res, control, name);
            }
        });
        return res;
    }
    _included(controlName) {
        var isOptional = StringMapWrapper.contains(this._optionals, controlName);
        return !isOptional || StringMapWrapper.get(this._optionals, controlName);
    }
}
/**
 * Defines a part of a form, of variable length, that can contain other controls.
 *
 * A `ControlArray` aggregates the values and errors of each {@link Control} in the group. Thus, if
 * one of the controls
 * in a group is invalid, the entire group is invalid. Similarly, if a control changes its value,
 * the entire group
 * changes as well.
 *
 * `ControlArray` is one of the three fundamental building blocks used to define forms in Angular,
 * along with {@link Control} and {@link ControlGroup}. {@link ControlGroup} can also contain
 * other controls, but is of fixed length.
 */
export class ControlArray extends AbstractControl {
    constructor(controls, validator = Validators.array) {
        super(validator);
        this.controls = controls;
        this._valueChanges = new EventEmitter();
        this._setParentForControls();
        this._updateValue();
        this.updateValidity({ onlySelf: true });
    }
    at(index) { return this.controls[index]; }
    push(control) {
        this.controls.push(control);
        control.setParent(this);
        this.updateValueAndValidity();
    }
    insert(index, control) {
        ListWrapper.insert(this.controls, index, control);
        control.setParent(this);
        this.updateValueAndValidity();
    }
    removeAt(index) {
        ListWrapper.removeAt(this.controls, index);
        this.updateValueAndValidity();
    }
    get length() { return this.controls.length; }
    _updateValue() { this._value = ListWrapper.map(this.controls, (c) => c.value); }
    _setParentForControls() {
        ListWrapper.forEach(this.controls, (control) => { control.setParent(this); });
    }
}
//# sourceMappingURL=model.js.map
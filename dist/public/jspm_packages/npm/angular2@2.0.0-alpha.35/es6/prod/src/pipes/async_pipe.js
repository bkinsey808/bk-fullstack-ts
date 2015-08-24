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
import { isBlank, isPresent, isPromise } from 'angular2/src/facade/lang';
import { ObservableWrapper } from 'angular2/src/facade/async';
import { Injectable } from 'angular2/di';
import { WrappedValue } from 'angular2/change_detection';
import { InvalidPipeArgumentException } from './invalid_pipe_argument_exception';
import { ChangeDetectorRef } from 'angular2/change_detection';
import { Pipe } from '../core/metadata';
class ObservableStrategy {
    createSubscription(async, updateLatestValue) {
        return ObservableWrapper.subscribe(async, updateLatestValue, e => { throw e; });
    }
    dispose(subscription) { ObservableWrapper.dispose(subscription); }
    onDestroy(subscription) { ObservableWrapper.dispose(subscription); }
}
class PromiseStrategy {
    createSubscription(async, updateLatestValue) {
        return async.then(updateLatestValue);
    }
    dispose(subscription) { }
    onDestroy(subscription) { }
}
var _promiseStrategy = new PromiseStrategy();
var _observableStrategy = new ObservableStrategy();
/**
 * Implements async bindings to Observable and Promise.
 *
 * # Example
 *
 * In this example we bind the description observable to the DOM. The async pipe will convert an
 *observable to the
 * latest value it emitted. It will also request a change detection check when a new value is
 *emitted.
 *
 *  ```
 * @Component({
 *   selector: "task-cmp",
 *   changeDetection: ON_PUSH
 * })
 * @View({
 *   template: "Task Description {{ description | async }}"
 * })
 * class Task {
 *  description:Observable<string>;
 * }
 *
 * ```
 */
export let AsyncPipe = class {
    constructor(_ref) {
        this._ref = _ref;
        this._latestValue = null;
        this._latestReturnedValue = null;
        this._subscription = null;
        this._obj = null;
        this._strategy = null;
    }
    onDestroy() {
        if (isPresent(this._subscription)) {
            this._dispose();
        }
    }
    transform(obj, args) {
        if (isBlank(this._obj)) {
            if (isPresent(obj)) {
                this._subscribe(obj);
            }
            return null;
        }
        if (obj !== this._obj) {
            this._dispose();
            return this.transform(obj);
        }
        if (this._latestValue === this._latestReturnedValue) {
            return this._latestReturnedValue;
        }
        else {
            this._latestReturnedValue = this._latestValue;
            return WrappedValue.wrap(this._latestValue);
        }
    }
    _subscribe(obj) {
        this._obj = obj;
        this._strategy = this._selectStrategy(obj);
        this._subscription =
            this._strategy.createSubscription(obj, value => this._updateLatestValue(obj, value));
    }
    _selectStrategy(obj) {
        if (isPromise(obj)) {
            return _promiseStrategy;
        }
        else if (ObservableWrapper.isObservable(obj)) {
            return _observableStrategy;
        }
        else {
            throw new InvalidPipeArgumentException(AsyncPipe, obj);
        }
    }
    _dispose() {
        this._strategy.dispose(this._subscription);
        this._latestValue = null;
        this._latestReturnedValue = null;
        this._subscription = null;
        this._obj = null;
    }
    _updateLatestValue(async, value) {
        if (async === this._obj) {
            this._latestValue = value;
            this._ref.requestCheck();
        }
    }
};
AsyncPipe = __decorate([
    Pipe({ name: 'async' }),
    Injectable(), 
    __metadata('design:paramtypes', [ChangeDetectorRef])
], AsyncPipe);
//# sourceMappingURL=async_pipe.js.map
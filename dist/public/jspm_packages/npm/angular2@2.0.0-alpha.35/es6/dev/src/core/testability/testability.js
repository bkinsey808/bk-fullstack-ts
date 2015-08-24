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
import { Injectable } from 'angular2/di';
import { DOM } from 'angular2/src/dom/dom_adapter';
import { Map, MapWrapper } from 'angular2/src/facade/collection';
import { BaseException } from 'angular2/src/facade/lang';
import * as getTestabilityModule from './get_testability';
import { NgZone } from '../zone/ng_zone';
import { PromiseWrapper } from 'angular2/src/facade/async';
/**
 * The Testability service provides testing hooks that can be accessed from
 * the browser and by services such as Protractor. Each bootstrapped Angular
 * application on the page will have an instance of Testability.
 */
export let Testability = class {
    constructor(_ngZone) {
        this._ngZone = _ngZone;
        this._pendingCount = 0;
        this._callbacks = [];
        this._isAngularEventPending = false;
        this._watchAngularEvents(_ngZone);
    }
    _watchAngularEvents(_ngZone) {
        _ngZone.overrideOnTurnStart(() => { this._isAngularEventPending = true; });
        _ngZone.overrideOnEventDone(() => {
            this._isAngularEventPending = false;
            this._runCallbacksIfReady();
        }, true);
    }
    increasePendingRequestCount() {
        this._pendingCount += 1;
        return this._pendingCount;
    }
    decreasePendingRequestCount() {
        this._pendingCount -= 1;
        if (this._pendingCount < 0) {
            throw new BaseException('pending async requests below zero');
        }
        this._runCallbacksIfReady();
        return this._pendingCount;
    }
    _runCallbacksIfReady() {
        if (this._pendingCount != 0 || this._isAngularEventPending) {
            return; // Not ready
        }
        // Schedules the call backs in a new frame so that it is always async.
        PromiseWrapper.resolve(null).then((_) => {
            while (this._callbacks.length !== 0) {
                (this._callbacks.pop())();
            }
        });
    }
    whenStable(callback) {
        this._callbacks.push(callback);
        this._runCallbacksIfReady();
    }
    getPendingRequestCount() { return this._pendingCount; }
    // This only accounts for ngZone, and not pending counts. Use `whenStable` to
    // check for stability.
    isAngularEventPending() { return this._isAngularEventPending; }
    findBindings(using, binding, exactMatch) {
        // TODO(juliemr): implement.
        return [];
    }
};
Testability = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [NgZone])
], Testability);
export let TestabilityRegistry = class {
    constructor() {
        this._applications = new Map();
        getTestabilityModule.GetTestability.addToWindow(this);
    }
    registerApplication(token, testability) {
        this._applications.set(token, testability);
    }
    getAllTestabilities() { return MapWrapper.values(this._applications); }
    findTestabilityInTree(elem, findInAncestors = true) {
        if (elem == null) {
            return null;
        }
        if (this._applications.has(elem)) {
            return this._applications.get(elem);
        }
        else if (!findInAncestors) {
            return null;
        }
        if (DOM.isShadowRoot(elem)) {
            return this.findTestabilityInTree(DOM.getHost(elem));
        }
        return this.findTestabilityInTree(DOM.parentElement(elem));
    }
};
TestabilityRegistry = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [])
], TestabilityRegistry);
//# sourceMappingURL=testability.js.map
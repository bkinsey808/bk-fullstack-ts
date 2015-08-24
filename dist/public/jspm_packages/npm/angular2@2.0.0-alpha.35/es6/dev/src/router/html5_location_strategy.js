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
import { DOM } from 'angular2/src/dom/dom_adapter';
import { Injectable } from 'angular2/di';
import { LocationStrategy } from './location_strategy';
export let HTML5LocationStrategy = class extends LocationStrategy {
    constructor() {
        super();
        this._location = DOM.getLocation();
        this._history = DOM.getHistory();
        this._baseHref = DOM.getBaseHref();
    }
    onPopState(fn) {
        DOM.getGlobalEventTarget('window').addEventListener('popstate', fn, false);
    }
    getBaseHref() { return this._baseHref; }
    path() { return this._location.pathname; }
    pushState(state, title, url) { this._history.pushState(state, title, url); }
    forward() { this._history.forward(); }
    back() { this._history.back(); }
};
HTML5LocationStrategy = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [])
], HTML5LocationStrategy);
//# sourceMappingURL=html5_location_strategy.js.map
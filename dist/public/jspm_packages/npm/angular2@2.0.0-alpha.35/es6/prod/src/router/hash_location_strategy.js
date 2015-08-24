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
export let HashLocationStrategy = class extends LocationStrategy {
    constructor() {
        super();
        this._location = DOM.getLocation();
        this._history = DOM.getHistory();
    }
    onPopState(fn) {
        DOM.getGlobalEventTarget('window').addEventListener('popstate', fn, false);
    }
    getBaseHref() { return ''; }
    path() {
        // the hash value is always prefixed with a `#`
        // and if it is empty then it will stay empty
        var path = this._location.hash;
        // Dart will complain if a call to substring is
        // executed with a position value that extends the
        // length of string.
        return path.length > 0 ? path.substring(1) : path;
    }
    pushState(state, title, url) {
        this._history.pushState(state, title, '#' + url);
    }
    forward() { this._history.forward(); }
    back() { this._history.back(); }
};
HashLocationStrategy = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [])
], HashLocationStrategy);
//# sourceMappingURL=hash_location_strategy.js.map
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
import { SpyObject, proxy } from 'angular2/test_lib';
import { IMPLEMENTS } from 'angular2/src/facade/lang';
import { EventEmitter, ObservableWrapper } from 'angular2/src/facade/async';
import { Location } from 'angular2/src/router/location';
export let SpyLocation = class extends SpyObject {
    constructor() {
        super();
        this._path = '';
        this.urlChanges = [];
        this._subject = new EventEmitter();
        this._baseHref = '';
    }
    setInitialPath(url) { this._path = url; }
    setBaseHref(url) { this._baseHref = url; }
    path() { return this._path; }
    simulateUrlPop(pathname) { ObservableWrapper.callNext(this._subject, { 'url': pathname }); }
    normalizeAbsolutely(url) { return this._baseHref + url; }
    go(url) {
        url = this.normalizeAbsolutely(url);
        if (this._path == url) {
            return;
        }
        this._path = url;
        this.urlChanges.push(url);
    }
    forward() {
        // TODO
    }
    back() {
        // TODO
    }
    subscribe(onNext, onThrow = null, onReturn = null) {
        ObservableWrapper.subscribe(this._subject, onNext, onThrow, onReturn);
    }
    noSuchMethod(m) { super.noSuchMethod(m); }
};
SpyLocation = __decorate([
    proxy,
    IMPLEMENTS(Location), 
    __metadata('design:paramtypes', [])
], SpyLocation);
//# sourceMappingURL=location_mock.js.map
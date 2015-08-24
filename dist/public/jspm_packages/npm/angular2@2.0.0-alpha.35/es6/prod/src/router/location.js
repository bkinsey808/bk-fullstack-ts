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
import { LocationStrategy } from './location_strategy';
import { isPresent, CONST_EXPR } from 'angular2/src/facade/lang';
import { EventEmitter, ObservableWrapper } from 'angular2/src/facade/async';
import { BaseException, isBlank } from 'angular2/src/facade/lang';
import { OpaqueToken, Injectable, Optional, Inject } from 'angular2/di';
export const APP_BASE_HREF = CONST_EXPR(new OpaqueToken('appBaseHref'));
/**
 * This is the service that an application developer will directly interact with.
 *
 * Responsible for normalizing the URL against the application's base href.
 * A normalized URL is absolute from the URL host, includes the application's base href, and has no
 * trailing slash:
 * - `/my/app/user/123` is normalized
 * - `my/app/user/123` **is not** normalized
 * - `/my/app/user/123/` **is not** normalized
 */
export let Location = class {
    constructor(_platformStrategy, href) {
        this._platformStrategy = _platformStrategy;
        this._subject = new EventEmitter();
        var browserBaseHref = isPresent(href) ? href : this._platformStrategy.getBaseHref();
        if (isBlank(browserBaseHref)) {
            throw new BaseException(`No base href set. Either provide a binding to "appBaseHrefToken" or add a base element.`);
        }
        this._baseHref = stripTrailingSlash(stripIndexHtml(browserBaseHref));
        this._platformStrategy.onPopState((_) => this._onPopState(_));
    }
    _onPopState(_) {
        ObservableWrapper.callNext(this._subject, { 'url': this.path(), 'pop': true });
    }
    path() { return this.normalize(this._platformStrategy.path()); }
    normalize(url) {
        return stripTrailingSlash(this._stripBaseHref(stripIndexHtml(url)));
    }
    normalizeAbsolutely(url) {
        if (!url.startsWith('/')) {
            url = '/' + url;
        }
        return stripTrailingSlash(this._addBaseHref(url));
    }
    _stripBaseHref(url) {
        if (this._baseHref.length > 0 && url.startsWith(this._baseHref)) {
            return url.substring(this._baseHref.length);
        }
        return url;
    }
    _addBaseHref(url) {
        if (!url.startsWith(this._baseHref)) {
            return this._baseHref + url;
        }
        return url;
    }
    go(url) {
        var finalUrl = this.normalizeAbsolutely(url);
        this._platformStrategy.pushState(null, '', finalUrl);
    }
    forward() { this._platformStrategy.forward(); }
    back() { this._platformStrategy.back(); }
    subscribe(onNext, onThrow = null, onReturn = null) {
        ObservableWrapper.subscribe(this._subject, onNext, onThrow, onReturn);
    }
};
Location = __decorate([
    Injectable(),
    __param(1, Optional()),
    __param(1, Inject(APP_BASE_HREF)), 
    __metadata('design:paramtypes', [LocationStrategy, String])
], Location);
function stripIndexHtml(url) {
    if (/\/index.html$/g.test(url)) {
        // '/index.html'.length == 11
        return url.substring(0, url.length - 11);
    }
    return url;
}
function stripTrailingSlash(url) {
    if (/\/$/g.test(url)) {
        url = url.substring(0, url.length - 1);
    }
    return url;
}
//# sourceMappingURL=location.js.map
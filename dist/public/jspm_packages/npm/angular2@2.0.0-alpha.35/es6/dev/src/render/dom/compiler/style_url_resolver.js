/* */ 
"format cjs";
// Some of the code comes from WebComponents.JS
// https://github.com/webcomponents/webcomponentsjs/blob/master/src/HTMLImports/path.js
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
import { RegExpWrapper, StringWrapper } from 'angular2/src/facade/lang';
import { UrlResolver } from 'angular2/src/services/url_resolver';
/**
 * Rewrites URLs by resolving '@import' and 'url()' URLs from the given base URL.
 */
export let StyleUrlResolver = class {
    constructor(_resolver) {
        this._resolver = _resolver;
    }
    resolveUrls(cssText, baseUrl) {
        cssText = this._replaceUrls(cssText, _cssUrlRe, baseUrl);
        cssText = this._replaceUrls(cssText, _cssImportRe, baseUrl);
        return cssText;
    }
    _replaceUrls(cssText, re, baseUrl) {
        return StringWrapper.replaceAllMapped(cssText, re, (m) => {
            var pre = m[1];
            var originalUrl = m[2];
            if (RegExpWrapper.test(_dataUrlRe, originalUrl)) {
                // Do not attempt to resolve data: URLs
                return m[0];
            }
            var url = StringWrapper.replaceAll(originalUrl, _quoteRe, '');
            var post = m[3];
            var resolvedUrl = this._resolver.resolve(baseUrl, url);
            return pre + "'" + resolvedUrl + "'" + post;
        });
    }
};
StyleUrlResolver = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [UrlResolver])
], StyleUrlResolver);
var _cssUrlRe = /(url\()([^)]*)(\))/g;
var _cssImportRe = /(@import[\s]+(?!url\())['"]([^'"]*)['"](.*;)/g;
var _quoteRe = /['"]/g;
var _dataUrlRe = /^['"]?data:/g;
//# sourceMappingURL=style_url_resolver.js.map
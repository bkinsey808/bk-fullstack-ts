/* */ 
'use strict';
var __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
    return Reflect.decorate(decorators, target, key, desc);
  switch (arguments.length) {
    case 2:
      return decorators.reduceRight(function(o, d) {
        return (d && d(o)) || o;
      }, target);
    case 3:
      return decorators.reduceRight(function(o, d) {
        return (d && d(target, key)), void 0;
      }, void 0);
    case 4:
      return decorators.reduceRight(function(o, d) {
        return (d && d(target, key, o)) || o;
      }, desc);
  }
};
var __metadata = (this && this.__metadata) || function(k, v) {
  if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
    return Reflect.metadata(k, v);
};
var di_1 = require("../../../../di");
var lang_1 = require("../../../facade/lang");
var url_resolver_1 = require("../../../services/url_resolver");
var StyleUrlResolver = (function() {
  function StyleUrlResolver(_resolver) {
    this._resolver = _resolver;
  }
  StyleUrlResolver.prototype.resolveUrls = function(cssText, baseUrl) {
    cssText = this._replaceUrls(cssText, _cssUrlRe, baseUrl);
    cssText = this._replaceUrls(cssText, _cssImportRe, baseUrl);
    return cssText;
  };
  StyleUrlResolver.prototype._replaceUrls = function(cssText, re, baseUrl) {
    var _this = this;
    return lang_1.StringWrapper.replaceAllMapped(cssText, re, function(m) {
      var pre = m[1];
      var originalUrl = m[2];
      if (lang_1.RegExpWrapper.test(_dataUrlRe, originalUrl)) {
        return m[0];
      }
      var url = lang_1.StringWrapper.replaceAll(originalUrl, _quoteRe, '');
      var post = m[3];
      var resolvedUrl = _this._resolver.resolve(baseUrl, url);
      return pre + "'" + resolvedUrl + "'" + post;
    });
  };
  StyleUrlResolver = __decorate([di_1.Injectable(), __metadata('design:paramtypes', [url_resolver_1.UrlResolver])], StyleUrlResolver);
  return StyleUrlResolver;
})();
exports.StyleUrlResolver = StyleUrlResolver;
var _cssUrlRe = /(url\()([^)]*)(\))/g;
var _cssImportRe = /(@import[\s]+(?!url\())['"]([^'"]*)['"](.*;)/g;
var _quoteRe = /['"]/g;
var _dataUrlRe = /^['"]?data:/g;

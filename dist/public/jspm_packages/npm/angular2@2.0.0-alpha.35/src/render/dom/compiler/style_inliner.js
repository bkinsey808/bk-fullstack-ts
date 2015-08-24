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
var xhr_1 = require("../../xhr");
var collection_1 = require("../../../facade/collection");
var url_resolver_1 = require("../../../services/url_resolver");
var style_url_resolver_1 = require("./style_url_resolver");
var lang_1 = require("../../../facade/lang");
var async_1 = require("../../../facade/async");
var StyleInliner = (function() {
  function StyleInliner(_xhr, _styleUrlResolver, _urlResolver) {
    this._xhr = _xhr;
    this._styleUrlResolver = _styleUrlResolver;
    this._urlResolver = _urlResolver;
  }
  StyleInliner.prototype.inlineImports = function(cssText, baseUrl) {
    return this._inlineImports(cssText, baseUrl, []);
  };
  StyleInliner.prototype._inlineImports = function(cssText, baseUrl, inlinedUrls) {
    var _this = this;
    var partIndex = 0;
    var parts = lang_1.StringWrapper.split(cssText, _importRe);
    if (parts.length === 1) {
      return cssText;
    }
    var promises = [];
    while (partIndex < parts.length - 1) {
      var prefix = parts[partIndex];
      var rule = parts[partIndex + 1];
      var url = _extractUrl(rule);
      if (lang_1.isPresent(url)) {
        url = this._urlResolver.resolve(baseUrl, url);
      }
      var mediaQuery = _extractMediaQuery(rule);
      var promise;
      if (lang_1.isBlank(url)) {
        promise = async_1.PromiseWrapper.resolve("/* Invalid import rule: \"@import " + rule + ";\" */");
      } else if (collection_1.ListWrapper.contains(inlinedUrls, url)) {
        promise = async_1.PromiseWrapper.resolve(prefix);
      } else {
        inlinedUrls.push(url);
        promise = async_1.PromiseWrapper.then(this._xhr.get(url), function(rawCss) {
          var inlinedCss = _this._inlineImports(rawCss, url, inlinedUrls);
          if (lang_1.isPromise(inlinedCss)) {
            return inlinedCss.then(function(css) {
              return prefix + _this._transformImportedCss(css, mediaQuery, url) + '\n';
            });
          } else {
            return prefix + _this._transformImportedCss(inlinedCss, mediaQuery, url) + '\n';
          }
        }, function(error) {
          return ("/* failed to import " + url + " */\n");
        });
      }
      promises.push(promise);
      partIndex += 2;
    }
    return async_1.PromiseWrapper.all(promises).then(function(cssParts) {
      var cssText = cssParts.join('');
      if (partIndex < parts.length) {
        cssText += parts[partIndex];
      }
      return cssText;
    });
  };
  StyleInliner.prototype._transformImportedCss = function(css, mediaQuery, url) {
    css = this._styleUrlResolver.resolveUrls(css, url);
    return _wrapInMediaRule(css, mediaQuery);
  };
  StyleInliner = __decorate([di_1.Injectable(), __metadata('design:paramtypes', [xhr_1.XHR, style_url_resolver_1.StyleUrlResolver, url_resolver_1.UrlResolver])], StyleInliner);
  return StyleInliner;
})();
exports.StyleInliner = StyleInliner;
function _extractUrl(importRule) {
  var match = lang_1.RegExpWrapper.firstMatch(_urlRe, importRule);
  if (lang_1.isBlank(match))
    return null;
  return lang_1.isPresent(match[1]) ? match[1] : match[2];
}
function _extractMediaQuery(importRule) {
  var match = lang_1.RegExpWrapper.firstMatch(_mediaQueryRe, importRule);
  if (lang_1.isBlank(match))
    return null;
  var mediaQuery = match[1].trim();
  return (mediaQuery.length > 0) ? mediaQuery : null;
}
function _wrapInMediaRule(css, query) {
  return (lang_1.isBlank(query)) ? css : "@media " + query + " {\n" + css + "\n}";
}
var _importRe = /@import\s+([^;]+);/g;
var _urlRe = lang_1.RegExpWrapper.create('url\\(\\s*?[\'"]?([^\'")]+)[\'"]?|' + '[\'"]([^\'")]+)[\'"]');
var _mediaQueryRe = /['"][^'"]+['"]\s*\)?\s*(.*)/g;

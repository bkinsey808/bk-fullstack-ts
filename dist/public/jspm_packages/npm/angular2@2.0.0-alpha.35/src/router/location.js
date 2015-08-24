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
var __param = (this && this.__param) || function(paramIndex, decorator) {
  return function(target, key) {
    decorator(target, key, paramIndex);
  };
};
var location_strategy_1 = require("./location_strategy");
var lang_1 = require("../facade/lang");
var async_1 = require("../facade/async");
var lang_2 = require("../facade/lang");
var di_1 = require("../../di");
exports.APP_BASE_HREF = lang_1.CONST_EXPR(new di_1.OpaqueToken('appBaseHref'));
var Location = (function() {
  function Location(_platformStrategy, href) {
    var _this = this;
    this._platformStrategy = _platformStrategy;
    this._subject = new async_1.EventEmitter();
    var browserBaseHref = lang_1.isPresent(href) ? href : this._platformStrategy.getBaseHref();
    if (lang_2.isBlank(browserBaseHref)) {
      throw new lang_2.BaseException("No base href set. Either provide a binding to \"appBaseHrefToken\" or add a base element.");
    }
    this._baseHref = stripTrailingSlash(stripIndexHtml(browserBaseHref));
    this._platformStrategy.onPopState(function(_) {
      return _this._onPopState(_);
    });
  }
  Location.prototype._onPopState = function(_) {
    async_1.ObservableWrapper.callNext(this._subject, {
      'url': this.path(),
      'pop': true
    });
  };
  Location.prototype.path = function() {
    return this.normalize(this._platformStrategy.path());
  };
  Location.prototype.normalize = function(url) {
    return stripTrailingSlash(this._stripBaseHref(stripIndexHtml(url)));
  };
  Location.prototype.normalizeAbsolutely = function(url) {
    if (!url.startsWith('/')) {
      url = '/' + url;
    }
    return stripTrailingSlash(this._addBaseHref(url));
  };
  Location.prototype._stripBaseHref = function(url) {
    if (this._baseHref.length > 0 && url.startsWith(this._baseHref)) {
      return url.substring(this._baseHref.length);
    }
    return url;
  };
  Location.prototype._addBaseHref = function(url) {
    if (!url.startsWith(this._baseHref)) {
      return this._baseHref + url;
    }
    return url;
  };
  Location.prototype.go = function(url) {
    var finalUrl = this.normalizeAbsolutely(url);
    this._platformStrategy.pushState(null, '', finalUrl);
  };
  Location.prototype.forward = function() {
    this._platformStrategy.forward();
  };
  Location.prototype.back = function() {
    this._platformStrategy.back();
  };
  Location.prototype.subscribe = function(onNext, onThrow, onReturn) {
    if (onThrow === void 0) {
      onThrow = null;
    }
    if (onReturn === void 0) {
      onReturn = null;
    }
    async_1.ObservableWrapper.subscribe(this._subject, onNext, onThrow, onReturn);
  };
  Location = __decorate([di_1.Injectable(), __param(1, di_1.Optional()), __param(1, di_1.Inject(exports.APP_BASE_HREF)), __metadata('design:paramtypes', [location_strategy_1.LocationStrategy, String])], Location);
  return Location;
})();
exports.Location = Location;
function stripIndexHtml(url) {
  if (/\/index.html$/g.test(url)) {
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

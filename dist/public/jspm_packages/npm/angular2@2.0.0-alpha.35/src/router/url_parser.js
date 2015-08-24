/* */ 
'use strict';
var __extends = (this && this.__extends) || function(d, b) {
  for (var p in b)
    if (b.hasOwnProperty(p))
      d[p] = b[p];
  function __() {
    this.constructor = d;
  }
  __.prototype = b.prototype;
  d.prototype = new __();
};
var collection_1 = require("../facade/collection");
var lang_1 = require("../facade/lang");
var Url = (function() {
  function Url(path, child, auxiliary, params) {
    if (child === void 0) {
      child = null;
    }
    if (auxiliary === void 0) {
      auxiliary = lang_1.CONST_EXPR([]);
    }
    if (params === void 0) {
      params = null;
    }
    this.path = path;
    this.child = child;
    this.auxiliary = auxiliary;
    this.params = params;
  }
  Url.prototype.toString = function() {
    return this.path + this._matrixParamsToString() + this._auxToString() + this._childString();
  };
  Url.prototype.segmentToString = function() {
    return this.path + this._matrixParamsToString();
  };
  Url.prototype._auxToString = function() {
    return this.auxiliary.length > 0 ? ('(' + this.auxiliary.map(function(sibling) {
      return sibling.toString();
    }).join('//') + ')') : '';
  };
  Url.prototype._matrixParamsToString = function() {
    if (lang_1.isBlank(this.params)) {
      return '';
    }
    return ';' + serializeParams(this.params).join(';');
  };
  Url.prototype._childString = function() {
    return lang_1.isPresent(this.child) ? ('/' + this.child.toString()) : '';
  };
  return Url;
})();
exports.Url = Url;
var RootUrl = (function(_super) {
  __extends(RootUrl, _super);
  function RootUrl(path, child, auxiliary, params) {
    if (child === void 0) {
      child = null;
    }
    if (auxiliary === void 0) {
      auxiliary = lang_1.CONST_EXPR([]);
    }
    if (params === void 0) {
      params = null;
    }
    _super.call(this, path, child, auxiliary, params);
  }
  RootUrl.prototype.toString = function() {
    return this.path + this._auxToString() + this._childString() + this._queryParamsToString();
  };
  RootUrl.prototype.segmentToString = function() {
    return this.path + this._queryParamsToString();
  };
  RootUrl.prototype._queryParamsToString = function() {
    if (lang_1.isBlank(this.params)) {
      return '';
    }
    return '?' + serializeParams(this.params).join('&');
  };
  return RootUrl;
})(Url);
exports.RootUrl = RootUrl;
var SEGMENT_RE = lang_1.RegExpWrapper.create('^[^\\/\\(\\)\\?;=&]+');
function matchUrlSegment(str) {
  var match = lang_1.RegExpWrapper.firstMatch(SEGMENT_RE, str);
  return lang_1.isPresent(match) ? match[0] : null;
}
var UrlParser = (function() {
  function UrlParser() {}
  UrlParser.prototype.peekStartsWith = function(str) {
    return this.remaining.startsWith(str);
  };
  UrlParser.prototype.capture = function(str) {
    if (!this.remaining.startsWith(str)) {
      throw new lang_1.BaseException("Expected \"" + str + "\".");
    }
    this.remaining = this.remaining.substring(str.length);
  };
  UrlParser.prototype.parse = function(url) {
    this.remaining = url;
    if (url == '' || url == '/') {
      return new Url('');
    }
    return this.parseRoot();
  };
  UrlParser.prototype.parseRoot = function() {
    if (this.peekStartsWith('/')) {
      this.capture('/');
    }
    var path = matchUrlSegment(this.remaining);
    this.capture(path);
    var aux = [];
    if (this.peekStartsWith('(')) {
      aux = this.parseAuxiliaryRoutes();
    }
    if (this.peekStartsWith(';')) {
      this.parseMatrixParams();
    }
    var child = null;
    if (this.peekStartsWith('/') && !this.peekStartsWith('//')) {
      this.capture('/');
      child = this.parseSegment();
    }
    var queryParams = null;
    if (this.peekStartsWith('?')) {
      queryParams = this.parseQueryParams();
    }
    return new RootUrl(path, child, aux, queryParams);
  };
  UrlParser.prototype.parseSegment = function() {
    if (this.remaining.length == 0) {
      return null;
    }
    if (this.peekStartsWith('/')) {
      this.capture('/');
    }
    var path = matchUrlSegment(this.remaining);
    this.capture(path);
    var matrixParams = null;
    if (this.peekStartsWith(';')) {
      matrixParams = this.parseMatrixParams();
    }
    var aux = [];
    if (this.peekStartsWith('(')) {
      aux = this.parseAuxiliaryRoutes();
    }
    var child = null;
    if (this.peekStartsWith('/') && !this.peekStartsWith('//')) {
      this.capture('/');
      child = this.parseSegment();
    }
    return new Url(path, child, aux, matrixParams);
  };
  UrlParser.prototype.parseQueryParams = function() {
    var params = {};
    this.capture('?');
    this.parseParam(params);
    while (this.remaining.length > 0 && this.peekStartsWith('&')) {
      this.capture('&');
      this.parseParam(params);
    }
    return params;
  };
  UrlParser.prototype.parseMatrixParams = function() {
    var params = {};
    while (this.remaining.length > 0 && this.peekStartsWith(';')) {
      this.capture(';');
      this.parseParam(params);
    }
    return params;
  };
  UrlParser.prototype.parseParam = function(params) {
    var key = matchUrlSegment(this.remaining);
    if (lang_1.isBlank(key)) {
      return;
    }
    this.capture(key);
    var value = true;
    if (this.peekStartsWith('=')) {
      this.capture('=');
      var valueMatch = matchUrlSegment(this.remaining);
      if (lang_1.isPresent(valueMatch)) {
        value = valueMatch;
        this.capture(value);
      }
    }
    params[key] = value;
  };
  UrlParser.prototype.parseAuxiliaryRoutes = function() {
    var routes = [];
    this.capture('(');
    while (!this.peekStartsWith(')') && this.remaining.length > 0) {
      routes.push(this.parseSegment());
      if (this.peekStartsWith('//')) {
        this.capture('//');
      }
    }
    this.capture(')');
    return routes;
  };
  return UrlParser;
})();
exports.UrlParser = UrlParser;
exports.parser = new UrlParser();
function serializeParams(paramMap) {
  var params = [];
  if (lang_1.isPresent(paramMap)) {
    collection_1.StringMapWrapper.forEach(paramMap, function(value, key) {
      if (value == true) {
        params.push(key);
      } else {
        params.push(key + '=' + value);
      }
    });
  }
  return params;
}
exports.serializeParams = serializeParams;

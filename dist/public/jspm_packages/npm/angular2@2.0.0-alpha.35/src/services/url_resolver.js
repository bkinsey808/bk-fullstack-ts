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
var di_1 = require("../../di");
var lang_1 = require("../facade/lang");
var collection_1 = require("../facade/collection");
var UrlResolver = (function() {
  function UrlResolver() {}
  UrlResolver.prototype.resolve = function(baseUrl, url) {
    return _resolveUrl(baseUrl, url);
  };
  UrlResolver = __decorate([di_1.Injectable(), __metadata('design:paramtypes', [])], UrlResolver);
  return UrlResolver;
})();
exports.UrlResolver = UrlResolver;
function _buildFromEncodedParts(opt_scheme, opt_userInfo, opt_domain, opt_port, opt_path, opt_queryData, opt_fragment) {
  var out = [];
  if (lang_1.isPresent(opt_scheme)) {
    out.push(opt_scheme + ':');
  }
  if (lang_1.isPresent(opt_domain)) {
    out.push('//');
    if (lang_1.isPresent(opt_userInfo)) {
      out.push(opt_userInfo + '@');
    }
    out.push(opt_domain);
    if (lang_1.isPresent(opt_port)) {
      out.push(':' + opt_port);
    }
  }
  if (lang_1.isPresent(opt_path)) {
    out.push(opt_path);
  }
  if (lang_1.isPresent(opt_queryData)) {
    out.push('?' + opt_queryData);
  }
  if (lang_1.isPresent(opt_fragment)) {
    out.push('#' + opt_fragment);
  }
  return out.join('');
}
var _splitRe = lang_1.RegExpWrapper.create('^' + '(?:' + '([^:/?#.]+)' + ':)?' + '(?://' + '(?:([^/?#]*)@)?' + '([\\w\\d\\-\\u0100-\\uffff.%]*)' + '(?::([0-9]+))?' + ')?' + '([^?#]+)?' + '(?:\\?([^#]*))?' + '(?:#(.*))?' + '$');
var _ComponentIndex;
(function(_ComponentIndex) {
  _ComponentIndex[_ComponentIndex["SCHEME"] = 1] = "SCHEME";
  _ComponentIndex[_ComponentIndex["USER_INFO"] = 2] = "USER_INFO";
  _ComponentIndex[_ComponentIndex["DOMAIN"] = 3] = "DOMAIN";
  _ComponentIndex[_ComponentIndex["PORT"] = 4] = "PORT";
  _ComponentIndex[_ComponentIndex["PATH"] = 5] = "PATH";
  _ComponentIndex[_ComponentIndex["QUERY_DATA"] = 6] = "QUERY_DATA";
  _ComponentIndex[_ComponentIndex["FRAGMENT"] = 7] = "FRAGMENT";
})(_ComponentIndex || (_ComponentIndex = {}));
function _split(uri) {
  return lang_1.RegExpWrapper.firstMatch(_splitRe, uri);
}
function _removeDotSegments(path) {
  if (path == '/')
    return '/';
  var leadingSlash = path[0] == '/' ? '/' : '';
  var trailingSlash = path[path.length - 1] === '/' ? '/' : '';
  var segments = path.split('/');
  var out = [];
  var up = 0;
  for (var pos = 0; pos < segments.length; pos++) {
    var segment = segments[pos];
    switch (segment) {
      case '':
      case '.':
        break;
      case '..':
        if (out.length > 0) {
          collection_1.ListWrapper.removeAt(out, out.length - 1);
        } else {
          up++;
        }
        break;
      default:
        out.push(segment);
    }
  }
  if (leadingSlash == '') {
    while (up-- > 0) {
      collection_1.ListWrapper.insert(out, 0, '..');
    }
    if (out.length === 0)
      out.push('.');
  }
  return leadingSlash + out.join('/') + trailingSlash;
}
function _joinAndCanonicalizePath(parts) {
  var path = parts[_ComponentIndex.PATH];
  path = lang_1.isBlank(path) ? '' : _removeDotSegments(path);
  parts[_ComponentIndex.PATH] = path;
  return _buildFromEncodedParts(parts[_ComponentIndex.SCHEME], parts[_ComponentIndex.USER_INFO], parts[_ComponentIndex.DOMAIN], parts[_ComponentIndex.PORT], path, parts[_ComponentIndex.QUERY_DATA], parts[_ComponentIndex.FRAGMENT]);
}
function _resolveUrl(base, url) {
  var parts = _split(encodeURI(url));
  var baseParts = _split(base);
  if (lang_1.isPresent(parts[_ComponentIndex.SCHEME])) {
    return _joinAndCanonicalizePath(parts);
  } else {
    parts[_ComponentIndex.SCHEME] = baseParts[_ComponentIndex.SCHEME];
  }
  for (var i = _ComponentIndex.SCHEME; i <= _ComponentIndex.PORT; i++) {
    if (lang_1.isBlank(parts[i])) {
      parts[i] = baseParts[i];
    }
  }
  if (parts[_ComponentIndex.PATH][0] == '/') {
    return _joinAndCanonicalizePath(parts);
  }
  var path = baseParts[_ComponentIndex.PATH];
  if (lang_1.isBlank(path))
    path = '/';
  var index = path.lastIndexOf('/');
  path = path.substring(0, index + 1) + parts[_ComponentIndex.PATH];
  parts[_ComponentIndex.PATH] = path;
  return _joinAndCanonicalizePath(parts);
}

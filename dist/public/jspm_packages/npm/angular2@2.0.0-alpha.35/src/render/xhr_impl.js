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
var async_1 = require("../facade/async");
var lang_1 = require("../facade/lang");
var xhr_1 = require("./xhr");
var XHRImpl = (function(_super) {
  __extends(XHRImpl, _super);
  function XHRImpl() {
    _super.apply(this, arguments);
  }
  XHRImpl.prototype.get = function(url) {
    var completer = async_1.PromiseWrapper.completer();
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'text';
    xhr.onload = function() {
      var response = lang_1.isPresent(xhr.response) ? xhr.response : xhr.responseText;
      var status = xhr.status === 1223 ? 204 : xhr.status;
      if (status === 0) {
        status = response ? 200 : 0;
      }
      if (200 <= status && status <= 300) {
        completer.resolve(response);
      } else {
        completer.reject("Failed to load " + url, null);
      }
    };
    xhr.onerror = function() {
      completer.reject("Failed to load " + url, null);
    };
    xhr.send();
    return completer.promise;
  };
  XHRImpl = __decorate([di_1.Injectable(), __metadata('design:paramtypes', [])], XHRImpl);
  return XHRImpl;
})(xhr_1.XHR);
exports.XHRImpl = XHRImpl;

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
var di_1 = require("../../../di");
var xhr_1 = require("../../render/xhr");
var broker_1 = require("./broker");
var WebWorkerXHRImpl = (function(_super) {
  __extends(WebWorkerXHRImpl, _super);
  function WebWorkerXHRImpl(_messageBroker) {
    _super.call(this);
    this._messageBroker = _messageBroker;
  }
  WebWorkerXHRImpl.prototype.get = function(url) {
    var fnArgs = [new broker_1.FnArg(url, null)];
    var args = new broker_1.UiArguments("xhr", "get", fnArgs);
    return this._messageBroker.runOnUiThread(args, String);
  };
  WebWorkerXHRImpl = __decorate([di_1.Injectable(), __metadata('design:paramtypes', [broker_1.MessageBroker])], WebWorkerXHRImpl);
  return WebWorkerXHRImpl;
})(xhr_1.XHR);
exports.WebWorkerXHRImpl = WebWorkerXHRImpl;

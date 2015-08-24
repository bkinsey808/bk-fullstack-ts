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
var async_1 = require("../facade/async");
var location_strategy_1 = require("../router/location_strategy");
var MockLocationStrategy = (function(_super) {
  __extends(MockLocationStrategy, _super);
  function MockLocationStrategy() {
    _super.call(this);
    this.internalBaseHref = '/';
    this.internalPath = '/';
    this.internalTitle = '';
    this.urlChanges = [];
    this._subject = new async_1.EventEmitter();
  }
  MockLocationStrategy.prototype.simulatePopState = function(url) {
    this.internalPath = url;
    async_1.ObservableWrapper.callNext(this._subject, null);
  };
  MockLocationStrategy.prototype.path = function() {
    return this.internalPath;
  };
  MockLocationStrategy.prototype.simulateUrlPop = function(pathname) {
    async_1.ObservableWrapper.callNext(this._subject, {'url': pathname});
  };
  MockLocationStrategy.prototype.pushState = function(ctx, title, url) {
    this.internalTitle = title;
    this.internalPath = url;
    this.urlChanges.push(url);
  };
  MockLocationStrategy.prototype.onPopState = function(fn) {
    async_1.ObservableWrapper.subscribe(this._subject, fn);
  };
  MockLocationStrategy.prototype.getBaseHref = function() {
    return this.internalBaseHref;
  };
  MockLocationStrategy.prototype.back = function() {
    if (this.urlChanges.length > 0) {
      this.urlChanges.pop();
      var nextUrl = this.urlChanges.length > 0 ? this.urlChanges[this.urlChanges.length - 1] : '';
      this.simulatePopState(nextUrl);
    }
  };
  return MockLocationStrategy;
})(location_strategy_1.LocationStrategy);
exports.MockLocationStrategy = MockLocationStrategy;

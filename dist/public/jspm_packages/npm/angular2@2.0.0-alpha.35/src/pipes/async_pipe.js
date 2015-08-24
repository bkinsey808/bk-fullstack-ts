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
var lang_1 = require("../facade/lang");
var async_1 = require("../facade/async");
var di_1 = require("../../di");
var change_detection_1 = require("../../change_detection");
var invalid_pipe_argument_exception_1 = require("./invalid_pipe_argument_exception");
var change_detection_2 = require("../../change_detection");
var metadata_1 = require("../core/metadata");
var ObservableStrategy = (function() {
  function ObservableStrategy() {}
  ObservableStrategy.prototype.createSubscription = function(async, updateLatestValue) {
    return async_1.ObservableWrapper.subscribe(async, updateLatestValue, function(e) {
      throw e;
    });
  };
  ObservableStrategy.prototype.dispose = function(subscription) {
    async_1.ObservableWrapper.dispose(subscription);
  };
  ObservableStrategy.prototype.onDestroy = function(subscription) {
    async_1.ObservableWrapper.dispose(subscription);
  };
  return ObservableStrategy;
})();
var PromiseStrategy = (function() {
  function PromiseStrategy() {}
  PromiseStrategy.prototype.createSubscription = function(async, updateLatestValue) {
    return async.then(updateLatestValue);
  };
  PromiseStrategy.prototype.dispose = function(subscription) {};
  PromiseStrategy.prototype.onDestroy = function(subscription) {};
  return PromiseStrategy;
})();
var _promiseStrategy = new PromiseStrategy();
var _observableStrategy = new ObservableStrategy();
var AsyncPipe = (function() {
  function AsyncPipe(_ref) {
    this._ref = _ref;
    this._latestValue = null;
    this._latestReturnedValue = null;
    this._subscription = null;
    this._obj = null;
    this._strategy = null;
  }
  AsyncPipe.prototype.onDestroy = function() {
    if (lang_1.isPresent(this._subscription)) {
      this._dispose();
    }
  };
  AsyncPipe.prototype.transform = function(obj, args) {
    if (lang_1.isBlank(this._obj)) {
      if (lang_1.isPresent(obj)) {
        this._subscribe(obj);
      }
      return null;
    }
    if (obj !== this._obj) {
      this._dispose();
      return this.transform(obj);
    }
    if (this._latestValue === this._latestReturnedValue) {
      return this._latestReturnedValue;
    } else {
      this._latestReturnedValue = this._latestValue;
      return change_detection_1.WrappedValue.wrap(this._latestValue);
    }
  };
  AsyncPipe.prototype._subscribe = function(obj) {
    var _this = this;
    this._obj = obj;
    this._strategy = this._selectStrategy(obj);
    this._subscription = this._strategy.createSubscription(obj, function(value) {
      return _this._updateLatestValue(obj, value);
    });
  };
  AsyncPipe.prototype._selectStrategy = function(obj) {
    if (lang_1.isPromise(obj)) {
      return _promiseStrategy;
    } else if (async_1.ObservableWrapper.isObservable(obj)) {
      return _observableStrategy;
    } else {
      throw new invalid_pipe_argument_exception_1.InvalidPipeArgumentException(AsyncPipe, obj);
    }
  };
  AsyncPipe.prototype._dispose = function() {
    this._strategy.dispose(this._subscription);
    this._latestValue = null;
    this._latestReturnedValue = null;
    this._subscription = null;
    this._obj = null;
  };
  AsyncPipe.prototype._updateLatestValue = function(async, value) {
    if (async === this._obj) {
      this._latestValue = value;
      this._ref.requestCheck();
    }
  };
  AsyncPipe = __decorate([metadata_1.Pipe({name: 'async'}), di_1.Injectable(), __metadata('design:paramtypes', [change_detection_2.ChangeDetectorRef])], AsyncPipe);
  return AsyncPipe;
})();
exports.AsyncPipe = AsyncPipe;

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
var di_1 = require("../../../di");
var dom_adapter_1 = require("../../dom/dom_adapter");
var collection_1 = require("../../facade/collection");
var lang_1 = require("../../facade/lang");
var getTestabilityModule = require("./get_testability");
var ng_zone_1 = require("../zone/ng_zone");
var async_1 = require("../../facade/async");
var Testability = (function() {
  function Testability(_ngZone) {
    this._ngZone = _ngZone;
    this._pendingCount = 0;
    this._callbacks = [];
    this._isAngularEventPending = false;
    this._watchAngularEvents(_ngZone);
  }
  Testability.prototype._watchAngularEvents = function(_ngZone) {
    var _this = this;
    _ngZone.overrideOnTurnStart(function() {
      _this._isAngularEventPending = true;
    });
    _ngZone.overrideOnEventDone(function() {
      _this._isAngularEventPending = false;
      _this._runCallbacksIfReady();
    }, true);
  };
  Testability.prototype.increasePendingRequestCount = function() {
    this._pendingCount += 1;
    return this._pendingCount;
  };
  Testability.prototype.decreasePendingRequestCount = function() {
    this._pendingCount -= 1;
    if (this._pendingCount < 0) {
      throw new lang_1.BaseException('pending async requests below zero');
    }
    this._runCallbacksIfReady();
    return this._pendingCount;
  };
  Testability.prototype._runCallbacksIfReady = function() {
    var _this = this;
    if (this._pendingCount != 0 || this._isAngularEventPending) {
      return;
    }
    async_1.PromiseWrapper.resolve(null).then(function(_) {
      while (_this._callbacks.length !== 0) {
        (_this._callbacks.pop())();
      }
    });
  };
  Testability.prototype.whenStable = function(callback) {
    this._callbacks.push(callback);
    this._runCallbacksIfReady();
  };
  Testability.prototype.getPendingRequestCount = function() {
    return this._pendingCount;
  };
  Testability.prototype.isAngularEventPending = function() {
    return this._isAngularEventPending;
  };
  Testability.prototype.findBindings = function(using, binding, exactMatch) {
    return [];
  };
  Testability = __decorate([di_1.Injectable(), __metadata('design:paramtypes', [ng_zone_1.NgZone])], Testability);
  return Testability;
})();
exports.Testability = Testability;
var TestabilityRegistry = (function() {
  function TestabilityRegistry() {
    this._applications = new collection_1.Map();
    getTestabilityModule.GetTestability.addToWindow(this);
  }
  TestabilityRegistry.prototype.registerApplication = function(token, testability) {
    this._applications.set(token, testability);
  };
  TestabilityRegistry.prototype.getAllTestabilities = function() {
    return collection_1.MapWrapper.values(this._applications);
  };
  TestabilityRegistry.prototype.findTestabilityInTree = function(elem, findInAncestors) {
    if (findInAncestors === void 0) {
      findInAncestors = true;
    }
    if (elem == null) {
      return null;
    }
    if (this._applications.has(elem)) {
      return this._applications.get(elem);
    } else if (!findInAncestors) {
      return null;
    }
    if (dom_adapter_1.DOM.isShadowRoot(elem)) {
      return this.findTestabilityInTree(dom_adapter_1.DOM.getHost(elem));
    }
    return this.findTestabilityInTree(dom_adapter_1.DOM.parentElement(elem));
  };
  TestabilityRegistry = __decorate([di_1.Injectable(), __metadata('design:paramtypes', [])], TestabilityRegistry);
  return TestabilityRegistry;
})();
exports.TestabilityRegistry = TestabilityRegistry;

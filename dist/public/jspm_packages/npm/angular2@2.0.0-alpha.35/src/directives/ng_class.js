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
var metadata_1 = require("../../metadata");
var core_1 = require("../../core");
var api_1 = require("../render/api");
var change_detection_1 = require("../../change_detection");
var collection_1 = require("../facade/collection");
var NgClass = (function() {
  function NgClass(_iterableDiffers, _keyValueDiffers, _ngEl, _renderer) {
    this._iterableDiffers = _iterableDiffers;
    this._keyValueDiffers = _keyValueDiffers;
    this._ngEl = _ngEl;
    this._renderer = _renderer;
    this._initialClasses = [];
  }
  Object.defineProperty(NgClass.prototype, "initialClasses", {
    set: function(v) {
      this._applyInitialClasses(true);
      this._initialClasses = lang_1.isPresent(v) && lang_1.isString(v) ? v.split(' ') : [];
      this._applyInitialClasses(false);
      this._applyClasses(this._rawClass, false);
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(NgClass.prototype, "rawClass", {
    set: function(v) {
      this._cleanupClasses(this._rawClass);
      if (lang_1.isString(v)) {
        v = v.split(' ');
      }
      this._rawClass = v;
      if (lang_1.isPresent(v)) {
        if (collection_1.isListLikeIterable(v)) {
          this._differ = this._iterableDiffers.find(v).create(null);
          this._mode = 'iterable';
        } else {
          this._differ = this._keyValueDiffers.find(v).create(null);
          this._mode = 'keyValue';
        }
      } else {
        this._differ = null;
      }
    },
    enumerable: true,
    configurable: true
  });
  NgClass.prototype.onCheck = function() {
    if (lang_1.isPresent(this._differ)) {
      var changes = this._differ.diff(this._rawClass);
      if (lang_1.isPresent(changes)) {
        if (this._mode == 'iterable') {
          this._applyIterableChanges(changes);
        } else {
          this._applyKeyValueChanges(changes);
        }
      }
    }
  };
  NgClass.prototype.onDestroy = function() {
    this._cleanupClasses(this._rawClass);
  };
  NgClass.prototype._cleanupClasses = function(rawClassVal) {
    this._applyClasses(rawClassVal, true);
    this._applyInitialClasses(false);
  };
  NgClass.prototype._applyKeyValueChanges = function(changes) {
    var _this = this;
    changes.forEachAddedItem(function(record) {
      _this._toggleClass(record.key, record.currentValue);
    });
    changes.forEachChangedItem(function(record) {
      _this._toggleClass(record.key, record.currentValue);
    });
    changes.forEachRemovedItem(function(record) {
      if (record.previousValue) {
        _this._toggleClass(record.key, false);
      }
    });
  };
  NgClass.prototype._applyIterableChanges = function(changes) {
    var _this = this;
    changes.forEachAddedItem(function(record) {
      _this._toggleClass(record.item, true);
    });
    changes.forEachRemovedItem(function(record) {
      _this._toggleClass(record.item, false);
    });
  };
  NgClass.prototype._applyInitialClasses = function(isCleanup) {
    var _this = this;
    collection_1.ListWrapper.forEach(this._initialClasses, function(className) {
      _this._toggleClass(className, !isCleanup);
    });
  };
  NgClass.prototype._applyClasses = function(rawClassVal, isCleanup) {
    var _this = this;
    if (lang_1.isPresent(rawClassVal)) {
      if (collection_1.isListLikeIterable(rawClassVal)) {
        collection_1.ListWrapper.forEach(rawClassVal, function(className) {
          return _this._toggleClass(className, !isCleanup);
        });
      } else {
        collection_1.StringMapWrapper.forEach(rawClassVal, function(expVal, className) {
          if (expVal)
            _this._toggleClass(className, !isCleanup);
        });
      }
    }
  };
  NgClass.prototype._toggleClass = function(className, enabled) {
    this._renderer.setElementClass(this._ngEl, className, enabled);
  };
  NgClass = __decorate([metadata_1.Directive({
    selector: '[ng-class]',
    lifecycle: [metadata_1.LifecycleEvent.onCheck, metadata_1.LifecycleEvent.onDestroy],
    properties: ['rawClass: ng-class', 'initialClasses: class']
  }), __metadata('design:paramtypes', [change_detection_1.IterableDiffers, change_detection_1.KeyValueDiffers, core_1.ElementRef, api_1.Renderer])], NgClass);
  return NgClass;
})();
exports.NgClass = NgClass;

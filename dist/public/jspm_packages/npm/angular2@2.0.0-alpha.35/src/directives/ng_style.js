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
var metadata_1 = require("../../metadata");
var core_1 = require("../../core");
var change_detection_1 = require("../../change_detection");
var lang_1 = require("../facade/lang");
var api_1 = require("../render/api");
var NgStyle = (function() {
  function NgStyle(_differs, _ngEl, _renderer) {
    this._differs = _differs;
    this._ngEl = _ngEl;
    this._renderer = _renderer;
  }
  Object.defineProperty(NgStyle.prototype, "rawStyle", {
    set: function(v) {
      this._rawStyle = v;
      if (lang_1.isBlank(this._differ) && lang_1.isPresent(v)) {
        this._differ = this._differs.find(this._rawStyle).create(null);
      }
    },
    enumerable: true,
    configurable: true
  });
  NgStyle.prototype.onCheck = function() {
    if (lang_1.isPresent(this._differ)) {
      var changes = this._differ.diff(this._rawStyle);
      if (lang_1.isPresent(changes)) {
        this._applyChanges(changes);
      }
    }
  };
  NgStyle.prototype._applyChanges = function(changes) {
    var _this = this;
    changes.forEachAddedItem(function(record) {
      _this._setStyle(record.key, record.currentValue);
    });
    changes.forEachChangedItem(function(record) {
      _this._setStyle(record.key, record.currentValue);
    });
    changes.forEachRemovedItem(function(record) {
      _this._setStyle(record.key, null);
    });
  };
  NgStyle.prototype._setStyle = function(name, val) {
    this._renderer.setElementStyle(this._ngEl, name, val);
  };
  NgStyle = __decorate([metadata_1.Directive({
    selector: '[ng-style]',
    lifecycle: [metadata_1.LifecycleEvent.onCheck],
    properties: ['rawStyle: ng-style']
  }), __metadata('design:paramtypes', [change_detection_1.KeyValueDiffers, core_1.ElementRef, api_1.Renderer])], NgStyle);
  return NgStyle;
})();
exports.NgStyle = NgStyle;

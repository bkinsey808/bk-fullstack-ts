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
var lang_1 = require("../facade/lang");
var NgIf = (function() {
  function NgIf(_viewContainer, _templateRef) {
    this._viewContainer = _viewContainer;
    this._templateRef = _templateRef;
    this._prevCondition = null;
  }
  Object.defineProperty(NgIf.prototype, "ngIf", {
    set: function(newCondition) {
      if (newCondition && (lang_1.isBlank(this._prevCondition) || !this._prevCondition)) {
        this._prevCondition = true;
        this._viewContainer.createEmbeddedView(this._templateRef);
      } else if (!newCondition && (lang_1.isBlank(this._prevCondition) || this._prevCondition)) {
        this._prevCondition = false;
        this._viewContainer.clear();
      }
    },
    enumerable: true,
    configurable: true
  });
  NgIf = __decorate([metadata_1.Directive({
    selector: '[ng-if]',
    properties: ['ngIf']
  }), __metadata('design:paramtypes', [core_1.ViewContainerRef, core_1.TemplateRef])], NgIf);
  return NgIf;
})();
exports.NgIf = NgIf;

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
var view_1 = require("../metadata/view");
var lang_1 = require("../../facade/lang");
var collection_1 = require("../../facade/collection");
var reflection_1 = require("../../reflection/reflection");
var ViewResolver = (function() {
  function ViewResolver() {
    this._cache = new collection_1.Map();
  }
  ViewResolver.prototype.resolve = function(component) {
    var view = this._cache.get(component);
    if (lang_1.isBlank(view)) {
      view = this._resolve(component);
      this._cache.set(component, view);
    }
    return view;
  };
  ViewResolver.prototype._resolve = function(component) {
    var annotations = reflection_1.reflector.annotations(component);
    for (var i = 0; i < annotations.length; i++) {
      var annotation = annotations[i];
      if (annotation instanceof view_1.ViewMetadata) {
        return annotation;
      }
    }
    throw new lang_1.BaseException("No View annotation found on component " + lang_1.stringify(component));
  };
  ViewResolver = __decorate([di_1.Injectable(), __metadata('design:paramtypes', [])], ViewResolver);
  return ViewResolver;
})();
exports.ViewResolver = ViewResolver;

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
var lang_1 = require("../../facade/lang");
var collection_1 = require("../../facade/collection");
var di_1 = require("../../../di");
var IterableDiffers = (function() {
  function IterableDiffers(factories) {
    this.factories = factories;
  }
  IterableDiffers.create = function(factories, parent) {
    if (lang_1.isPresent(parent)) {
      var copied = collection_1.ListWrapper.clone(parent.factories);
      factories = factories.concat(copied);
      return new IterableDiffers(factories);
    } else {
      return new IterableDiffers(factories);
    }
  };
  IterableDiffers.extend = function(factories) {
    return new di_1.Binding(IterableDiffers, {
      toFactory: function(parent) {
        if (lang_1.isBlank(parent)) {
          throw new lang_1.BaseException('Cannot extend IterableDiffers without a parent injector');
        }
        return IterableDiffers.create(factories, parent);
      },
      deps: [[IterableDiffers, new di_1.SkipSelfMetadata(), new di_1.OptionalMetadata()]]
    });
  };
  IterableDiffers.prototype.find = function(iterable) {
    var factory = collection_1.ListWrapper.find(this.factories, function(f) {
      return f.supports(iterable);
    });
    if (lang_1.isPresent(factory)) {
      return factory;
    } else {
      throw new lang_1.BaseException("Cannot find a differ supporting object '" + iterable + "'");
    }
  };
  IterableDiffers = __decorate([di_1.Injectable(), lang_1.CONST(), __metadata('design:paramtypes', [Array])], IterableDiffers);
  return IterableDiffers;
})();
exports.IterableDiffers = IterableDiffers;

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
var lang_1 = require("../../facade/lang");
var metadata_1 = require("../../di/metadata");
var di_1 = require("../../../di");
var AttributeMetadata = (function(_super) {
  __extends(AttributeMetadata, _super);
  function AttributeMetadata(attributeName) {
    _super.call(this);
    this.attributeName = attributeName;
  }
  Object.defineProperty(AttributeMetadata.prototype, "token", {
    get: function() {
      return this;
    },
    enumerable: true,
    configurable: true
  });
  AttributeMetadata.prototype.toString = function() {
    return "@Attribute(" + lang_1.stringify(this.attributeName) + ")";
  };
  AttributeMetadata = __decorate([lang_1.CONST(), __metadata('design:paramtypes', [String])], AttributeMetadata);
  return AttributeMetadata;
})(metadata_1.DependencyMetadata);
exports.AttributeMetadata = AttributeMetadata;
var QueryMetadata = (function(_super) {
  __extends(QueryMetadata, _super);
  function QueryMetadata(_selector, _a) {
    var _b = (_a === void 0 ? {} : _a).descendants,
        descendants = _b === void 0 ? false : _b;
    _super.call(this);
    this._selector = _selector;
    this.descendants = descendants;
  }
  Object.defineProperty(QueryMetadata.prototype, "isViewQuery", {
    get: function() {
      return false;
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(QueryMetadata.prototype, "selector", {
    get: function() {
      return di_1.resolveForwardRef(this._selector);
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(QueryMetadata.prototype, "isVarBindingQuery", {
    get: function() {
      return lang_1.isString(this.selector);
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(QueryMetadata.prototype, "varBindings", {
    get: function() {
      return lang_1.StringWrapper.split(this.selector, new RegExp(","));
    },
    enumerable: true,
    configurable: true
  });
  QueryMetadata.prototype.toString = function() {
    return "@Query(" + lang_1.stringify(this.selector) + ")";
  };
  QueryMetadata = __decorate([lang_1.CONST(), __metadata('design:paramtypes', [Object, Object])], QueryMetadata);
  return QueryMetadata;
})(metadata_1.DependencyMetadata);
exports.QueryMetadata = QueryMetadata;
var ViewQueryMetadata = (function(_super) {
  __extends(ViewQueryMetadata, _super);
  function ViewQueryMetadata(_selector, _a) {
    var _b = (_a === void 0 ? {} : _a).descendants,
        descendants = _b === void 0 ? false : _b;
    _super.call(this, _selector, {descendants: descendants});
  }
  Object.defineProperty(ViewQueryMetadata.prototype, "isViewQuery", {
    get: function() {
      return true;
    },
    enumerable: true,
    configurable: true
  });
  ViewQueryMetadata.prototype.toString = function() {
    return "@ViewQuery(" + lang_1.stringify(this.selector) + ")";
  };
  ViewQueryMetadata = __decorate([lang_1.CONST(), __metadata('design:paramtypes', [Object, Object])], ViewQueryMetadata);
  return ViewQueryMetadata;
})(QueryMetadata);
exports.ViewQueryMetadata = ViewQueryMetadata;

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
var change_detection_1 = require("../../../change_detection");
var DirectiveMetadata = (function(_super) {
  __extends(DirectiveMetadata, _super);
  function DirectiveMetadata(_a) {
    var _b = _a === void 0 ? {} : _a,
        selector = _b.selector,
        properties = _b.properties,
        events = _b.events,
        host = _b.host,
        lifecycle = _b.lifecycle,
        bindings = _b.bindings,
        exportAs = _b.exportAs,
        _c = _b.compileChildren,
        compileChildren = _c === void 0 ? true : _c;
    _super.call(this);
    this.selector = selector;
    this.properties = properties;
    this.events = events;
    this.host = host;
    this.exportAs = exportAs;
    this.lifecycle = lifecycle;
    this.compileChildren = compileChildren;
    this.bindings = bindings;
  }
  DirectiveMetadata = __decorate([lang_1.CONST(), __metadata('design:paramtypes', [Object])], DirectiveMetadata);
  return DirectiveMetadata;
})(metadata_1.InjectableMetadata);
exports.DirectiveMetadata = DirectiveMetadata;
var ComponentMetadata = (function(_super) {
  __extends(ComponentMetadata, _super);
  function ComponentMetadata(_a) {
    var _b = _a === void 0 ? {} : _a,
        selector = _b.selector,
        properties = _b.properties,
        events = _b.events,
        host = _b.host,
        exportAs = _b.exportAs,
        lifecycle = _b.lifecycle,
        bindings = _b.bindings,
        viewBindings = _b.viewBindings,
        _c = _b.changeDetection,
        changeDetection = _c === void 0 ? change_detection_1.DEFAULT : _c,
        _d = _b.compileChildren,
        compileChildren = _d === void 0 ? true : _d;
    _super.call(this, {
      selector: selector,
      properties: properties,
      events: events,
      host: host,
      exportAs: exportAs,
      bindings: bindings,
      lifecycle: lifecycle,
      compileChildren: compileChildren
    });
    this.changeDetection = changeDetection;
    this.viewBindings = viewBindings;
  }
  ComponentMetadata = __decorate([lang_1.CONST(), __metadata('design:paramtypes', [Object])], ComponentMetadata);
  return ComponentMetadata;
})(DirectiveMetadata);
exports.ComponentMetadata = ComponentMetadata;
(function(LifecycleEvent) {
  LifecycleEvent[LifecycleEvent["onDestroy"] = 0] = "onDestroy";
  LifecycleEvent[LifecycleEvent["onChange"] = 1] = "onChange";
  LifecycleEvent[LifecycleEvent["onCheck"] = 2] = "onCheck";
  LifecycleEvent[LifecycleEvent["onInit"] = 3] = "onInit";
  LifecycleEvent[LifecycleEvent["onAllChangesDone"] = 4] = "onAllChangesDone";
})(exports.LifecycleEvent || (exports.LifecycleEvent = {}));
var LifecycleEvent = exports.LifecycleEvent;
var PipeMetadata = (function(_super) {
  __extends(PipeMetadata, _super);
  function PipeMetadata(_a) {
    var name = _a.name;
    _super.call(this);
    this.name = name;
  }
  PipeMetadata = __decorate([lang_1.CONST(), __metadata('design:paramtypes', [Object])], PipeMetadata);
  return PipeMetadata;
})(metadata_1.InjectableMetadata);
exports.PipeMetadata = PipeMetadata;

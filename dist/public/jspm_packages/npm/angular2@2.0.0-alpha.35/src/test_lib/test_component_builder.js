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
var di_1 = require("../../di");
var lang_1 = require("../facade/lang");
var collection_1 = require("../facade/collection");
var view_resolver_1 = require("../core/compiler/view_resolver");
var view_ref_1 = require("../core/compiler/view_ref");
var dynamic_component_loader_1 = require("../core/compiler/dynamic_component_loader");
var utils_1 = require("./utils");
var render_1 = require("../render/render");
var dom_adapter_1 = require("../dom/dom_adapter");
var debug_element_1 = require("../debug/debug_element");
var RootTestComponent = (function(_super) {
  __extends(RootTestComponent, _super);
  function RootTestComponent(componentRef) {
    _super.call(this, view_ref_1.internalView(componentRef.hostView), 0);
    this._componentParentView = view_ref_1.internalView(componentRef.hostView);
    this._componentRef = componentRef;
  }
  RootTestComponent.prototype.detectChanges = function() {
    this._componentParentView.changeDetector.detectChanges();
    this._componentParentView.changeDetector.checkNoChanges();
  };
  RootTestComponent.prototype.destroy = function() {
    this._componentRef.dispose();
  };
  return RootTestComponent;
})(debug_element_1.DebugElement);
exports.RootTestComponent = RootTestComponent;
var _nextRootElementId = 0;
var TestComponentBuilder = (function() {
  function TestComponentBuilder(injector) {
    this._injector = injector;
    this._viewOverrides = new Map();
    this._directiveOverrides = new Map();
    this._templateOverrides = new Map();
  }
  TestComponentBuilder.prototype._clone = function() {
    var clone = new TestComponentBuilder(this._injector);
    clone._viewOverrides = collection_1.MapWrapper.clone(this._viewOverrides);
    clone._directiveOverrides = collection_1.MapWrapper.clone(this._directiveOverrides);
    clone._templateOverrides = collection_1.MapWrapper.clone(this._templateOverrides);
    return clone;
  };
  TestComponentBuilder.prototype.overrideTemplate = function(componentType, template) {
    var clone = this._clone();
    clone._templateOverrides.set(componentType, template);
    return clone;
  };
  TestComponentBuilder.prototype.overrideView = function(componentType, view) {
    var clone = this._clone();
    clone._viewOverrides.set(componentType, view);
    return clone;
  };
  TestComponentBuilder.prototype.overrideDirective = function(componentType, from, to) {
    var clone = this._clone();
    var overridesForComponent = clone._directiveOverrides.get(componentType);
    if (!lang_1.isPresent(overridesForComponent)) {
      clone._directiveOverrides.set(componentType, new Map());
      overridesForComponent = clone._directiveOverrides.get(componentType);
    }
    overridesForComponent.set(from, to);
    return clone;
  };
  TestComponentBuilder.prototype.createAsync = function(rootComponentType) {
    var mockViewResolver = this._injector.get(view_resolver_1.ViewResolver);
    collection_1.MapWrapper.forEach(this._viewOverrides, function(view, type) {
      mockViewResolver.setView(type, view);
    });
    collection_1.MapWrapper.forEach(this._templateOverrides, function(template, type) {
      mockViewResolver.setInlineTemplate(type, template);
    });
    collection_1.MapWrapper.forEach(this._directiveOverrides, function(overrides, component) {
      collection_1.MapWrapper.forEach(overrides, function(to, from) {
        mockViewResolver.overrideViewDirective(component, from, to);
      });
    });
    var rootElId = "root" + _nextRootElementId++;
    var rootEl = utils_1.el("<div id=\"" + rootElId + "\"></div>");
    var doc = this._injector.get(render_1.DOCUMENT);
    var oldRoots = dom_adapter_1.DOM.querySelectorAll(doc, '[id^=root]');
    for (var i = 0; i < oldRoots.length; i++) {
      dom_adapter_1.DOM.remove(oldRoots[i]);
    }
    dom_adapter_1.DOM.appendChild(doc.body, rootEl);
    return this._injector.get(dynamic_component_loader_1.DynamicComponentLoader).loadAsRoot(rootComponentType, "#" + rootElId, this._injector).then(function(componentRef) {
      return new RootTestComponent(componentRef);
    });
  };
  TestComponentBuilder = __decorate([di_1.Injectable(), __metadata('design:paramtypes', [di_1.Injector])], TestComponentBuilder);
  return TestComponentBuilder;
})();
exports.TestComponentBuilder = TestComponentBuilder;

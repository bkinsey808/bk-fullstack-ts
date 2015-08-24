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
var collection_1 = require("../facade/collection");
var lang_1 = require("../facade/lang");
var metadata_1 = require("../core/metadata");
var view_resolver_1 = require("../core/compiler/view_resolver");
var MockViewResolver = (function(_super) {
  __extends(MockViewResolver, _super);
  function MockViewResolver() {
    _super.call(this);
    this._views = new collection_1.Map();
    this._inlineTemplates = new collection_1.Map();
    this._viewCache = new collection_1.Map();
    this._directiveOverrides = new collection_1.Map();
  }
  MockViewResolver.prototype.setView = function(component, view) {
    this._checkOverrideable(component);
    this._views.set(component, view);
  };
  MockViewResolver.prototype.setInlineTemplate = function(component, template) {
    this._checkOverrideable(component);
    this._inlineTemplates.set(component, template);
  };
  MockViewResolver.prototype.overrideViewDirective = function(component, from, to) {
    this._checkOverrideable(component);
    var overrides = this._directiveOverrides.get(component);
    if (lang_1.isBlank(overrides)) {
      overrides = new collection_1.Map();
      this._directiveOverrides.set(component, overrides);
    }
    overrides.set(from, to);
  };
  MockViewResolver.prototype.resolve = function(component) {
    var view = this._viewCache.get(component);
    if (lang_1.isPresent(view))
      return view;
    view = this._views.get(component);
    if (lang_1.isBlank(view)) {
      view = _super.prototype.resolve.call(this, component);
    }
    var directives = view.directives;
    var overrides = this._directiveOverrides.get(component);
    if (lang_1.isPresent(overrides) && lang_1.isPresent(directives)) {
      directives = collection_1.ListWrapper.clone(view.directives);
      collection_1.MapWrapper.forEach(overrides, function(to, from) {
        var srcIndex = directives.indexOf(from);
        if (srcIndex == -1) {
          throw new lang_1.BaseException("Overriden directive " + lang_1.stringify(from) + " not found in the template of " + lang_1.stringify(component));
        }
        directives[srcIndex] = to;
      });
      view = new metadata_1.ViewMetadata({
        template: view.template,
        templateUrl: view.templateUrl,
        directives: directives
      });
    }
    var inlineTemplate = this._inlineTemplates.get(component);
    if (lang_1.isPresent(inlineTemplate)) {
      view = new metadata_1.ViewMetadata({
        template: inlineTemplate,
        templateUrl: null,
        directives: view.directives
      });
    }
    this._viewCache.set(component, view);
    return view;
  };
  MockViewResolver.prototype._checkOverrideable = function(component) {
    var cached = this._viewCache.get(component);
    if (lang_1.isPresent(cached)) {
      throw new lang_1.BaseException("The component " + lang_1.stringify(component) + " has already been compiled, its configuration can not be changed");
    }
  };
  return MockViewResolver;
})(view_resolver_1.ViewResolver);
exports.MockViewResolver = MockViewResolver;

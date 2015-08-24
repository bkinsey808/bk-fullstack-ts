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
var __param = (this && this.__param) || function(paramIndex, decorator) {
  return function(target, key) {
    decorator(target, key, paramIndex);
  };
};
var di_1 = require("../../../di");
var lang_1 = require("../../facade/lang");
var async_1 = require("../../facade/async");
var collection_1 = require("../../facade/collection");
var directive_resolver_1 = require("./directive_resolver");
var view_1 = require("./view");
var element_injector_1 = require("./element_injector");
var view_resolver_1 = require("./view_resolver");
var pipe_resolver_1 = require("./pipe_resolver");
var component_url_mapper_1 = require("./component_url_mapper");
var proto_view_factory_1 = require("./proto_view_factory");
var url_resolver_1 = require("../../services/url_resolver");
var app_root_url_1 = require("../../services/app_root_url");
var profile_1 = require("../../profile/profile");
var pipe_binding_1 = require("../pipes/pipe_binding");
var pipes_1 = require("../../../pipes");
var api_1 = require("../../render/api");
var CompilerCache = (function() {
  function CompilerCache() {
    this._cache = new collection_1.Map();
    this._hostCache = new collection_1.Map();
  }
  CompilerCache.prototype.set = function(component, protoView) {
    this._cache.set(component, protoView);
  };
  CompilerCache.prototype.get = function(component) {
    var result = this._cache.get(component);
    return lang_1.normalizeBlank(result);
  };
  CompilerCache.prototype.setHost = function(component, protoView) {
    this._hostCache.set(component, protoView);
  };
  CompilerCache.prototype.getHost = function(component) {
    var result = this._hostCache.get(component);
    return lang_1.normalizeBlank(result);
  };
  CompilerCache.prototype.clear = function() {
    this._cache.clear();
    this._hostCache.clear();
  };
  CompilerCache = __decorate([di_1.Injectable(), __metadata('design:paramtypes', [])], CompilerCache);
  return CompilerCache;
})();
exports.CompilerCache = CompilerCache;
var Compiler = (function() {
  function Compiler(_directiveResolver, _pipeResolver, _defaultPipes, _compilerCache, _viewResolver, _componentUrlMapper, _urlResolver, _render, _protoViewFactory, appUrl) {
    this._directiveResolver = _directiveResolver;
    this._pipeResolver = _pipeResolver;
    this._compilerCache = _compilerCache;
    this._viewResolver = _viewResolver;
    this._componentUrlMapper = _componentUrlMapper;
    this._urlResolver = _urlResolver;
    this._render = _render;
    this._protoViewFactory = _protoViewFactory;
    this._compiling = new collection_1.Map();
    this._defaultPipes = _defaultPipes;
    this._appUrl = appUrl.value;
  }
  Compiler.prototype._bindDirective = function(directiveTypeOrBinding) {
    if (directiveTypeOrBinding instanceof element_injector_1.DirectiveBinding) {
      return directiveTypeOrBinding;
    } else if (directiveTypeOrBinding instanceof di_1.Binding) {
      var annotation = this._directiveResolver.resolve(directiveTypeOrBinding.token);
      return element_injector_1.DirectiveBinding.createFromBinding(directiveTypeOrBinding, annotation);
    } else {
      var annotation = this._directiveResolver.resolve(directiveTypeOrBinding);
      return element_injector_1.DirectiveBinding.createFromType(directiveTypeOrBinding, annotation);
    }
  };
  Compiler.prototype._bindPipe = function(typeOrBinding) {
    var meta = this._pipeResolver.resolve(typeOrBinding);
    return pipe_binding_1.PipeBinding.createFromType(typeOrBinding, meta);
  };
  Compiler.prototype.compileInHost = function(componentTypeOrBinding) {
    var _this = this;
    var componentType = lang_1.isType(componentTypeOrBinding) ? componentTypeOrBinding : componentTypeOrBinding.token;
    var r = profile_1.wtfStartTimeRange('Compiler#compile()', lang_1.stringify(componentType));
    var hostAppProtoView = this._compilerCache.getHost(componentType);
    var hostPvPromise;
    if (lang_1.isPresent(hostAppProtoView)) {
      hostPvPromise = async_1.PromiseWrapper.resolve(hostAppProtoView);
    } else {
      var componentBinding = this._bindDirective(componentTypeOrBinding);
      Compiler._assertTypeIsComponent(componentBinding);
      var directiveMetadata = componentBinding.metadata;
      hostPvPromise = this._render.compileHost(directiveMetadata).then(function(hostRenderPv) {
        var protoViews = _this._protoViewFactory.createAppProtoViews(componentBinding, hostRenderPv, [componentBinding], []);
        return _this._compileNestedProtoViews(protoViews, componentType, new collection_1.Map());
      }).then(function(appProtoView) {
        _this._compilerCache.setHost(componentType, appProtoView);
        return appProtoView;
      });
    }
    return hostPvPromise.then(function(hostAppProtoView) {
      profile_1.wtfEndTimeRange(r);
      return hostAppProtoView.ref;
    });
  };
  Compiler.prototype._compile = function(componentBinding, componentPath) {
    var _this = this;
    var component = componentBinding.key.token;
    var protoView = this._compilerCache.get(component);
    if (lang_1.isPresent(protoView)) {
      return protoView;
    }
    var resultPromise = this._compiling.get(component);
    if (lang_1.isPresent(resultPromise)) {
      return resultPromise;
    }
    var view = this._viewResolver.resolve(component);
    var directives = this._flattenDirectives(view);
    for (var i = 0; i < directives.length; i++) {
      if (!Compiler._isValidDirective(directives[i])) {
        throw new lang_1.BaseException("Unexpected directive value '" + lang_1.stringify(directives[i]) + "' on the View of component '" + lang_1.stringify(component) + "'");
      }
    }
    var boundDirectives = this._removeDuplicatedDirectives(directives.map(function(directive) {
      return _this._bindDirective(directive);
    }));
    var pipes = this._flattenPipes(view);
    var boundPipes = pipes.map(function(pipe) {
      return _this._bindPipe(pipe);
    });
    var renderTemplate = this._buildRenderTemplate(component, view, boundDirectives);
    resultPromise = this._render.compile(renderTemplate).then(function(renderPv) {
      var protoViews = _this._protoViewFactory.createAppProtoViews(componentBinding, renderPv, boundDirectives, boundPipes);
      return _this._compileNestedProtoViews(protoViews, component, componentPath);
    }).then(function(appProtoView) {
      _this._compilerCache.set(component, appProtoView);
      collection_1.MapWrapper.delete(_this._compiling, component);
      return appProtoView;
    });
    this._compiling.set(component, resultPromise);
    return resultPromise;
  };
  Compiler.prototype._removeDuplicatedDirectives = function(directives) {
    var directivesMap = new collection_1.Map();
    directives.forEach(function(dirBinding) {
      directivesMap.set(dirBinding.key.id, dirBinding);
    });
    return collection_1.MapWrapper.values(directivesMap);
  };
  Compiler.prototype._compileNestedProtoViews = function(appProtoViews, componentType, componentPath) {
    var _this = this;
    var nestedPVPromises = [];
    componentPath = collection_1.MapWrapper.clone(componentPath);
    if (appProtoViews[0].type === api_1.ViewType.COMPONENT) {
      componentPath.set(componentType, appProtoViews[0]);
    }
    appProtoViews.forEach(function(appProtoView) {
      _this._collectComponentElementBinders(appProtoView).forEach(function(elementBinder) {
        var nestedComponent = elementBinder.componentDirective;
        var nestedComponentType = nestedComponent.key.token;
        var elementBinderDone = function(nestedPv) {
          elementBinder.nestedProtoView = nestedPv;
        };
        if (componentPath.has(nestedComponentType)) {
          if (appProtoView.isEmbeddedFragment) {
            throw new lang_1.BaseException("<ng-content> is used within the recursive path of " + lang_1.stringify(nestedComponentType));
          } else if (appProtoView.type === api_1.ViewType.COMPONENT) {
            throw new lang_1.BaseException("Unconditional component cycle in " + lang_1.stringify(nestedComponentType));
          } else {
            elementBinderDone(componentPath.get(nestedComponentType));
          }
        } else {
          var nestedCall = _this._compile(nestedComponent, componentPath);
          if (lang_1.isPromise(nestedCall)) {
            nestedPVPromises.push(nestedCall.then(elementBinderDone));
          } else {
            elementBinderDone(nestedCall);
          }
        }
      });
    });
    return async_1.PromiseWrapper.all(nestedPVPromises).then(function(_) {
      return async_1.PromiseWrapper.all(appProtoViews.map(function(appProtoView) {
        return _this._mergeProtoView(appProtoView);
      }));
    }).then(function(_) {
      return appProtoViews[0];
    });
  };
  Compiler.prototype._mergeProtoView = function(appProtoView) {
    if (appProtoView.type !== api_1.ViewType.HOST && appProtoView.type !== api_1.ViewType.EMBEDDED) {
      return null;
    }
    return this._render.mergeProtoViewsRecursively(this._collectMergeRenderProtoViews(appProtoView)).then(function(mergeResult) {
      appProtoView.mergeMapping = new view_1.AppProtoViewMergeMapping(mergeResult);
    });
  };
  Compiler.prototype._collectMergeRenderProtoViews = function(appProtoView) {
    var result = [appProtoView.render];
    for (var i = 0; i < appProtoView.elementBinders.length; i++) {
      var binder = appProtoView.elementBinders[i];
      if (lang_1.isPresent(binder.nestedProtoView)) {
        if (binder.hasStaticComponent() || (binder.hasEmbeddedProtoView() && binder.nestedProtoView.isEmbeddedFragment)) {
          result.push(this._collectMergeRenderProtoViews(binder.nestedProtoView));
        } else {
          result.push(null);
        }
      }
    }
    return result;
  };
  Compiler.prototype._collectComponentElementBinders = function(appProtoView) {
    var componentElementBinders = [];
    appProtoView.elementBinders.forEach(function(elementBinder) {
      if (lang_1.isPresent(elementBinder.componentDirective)) {
        componentElementBinders.push(elementBinder);
      }
    });
    return componentElementBinders;
  };
  Compiler.prototype._buildRenderTemplate = function(component, view, directives) {
    var _this = this;
    var componentUrl = this._urlResolver.resolve(this._appUrl, this._componentUrlMapper.getUrl(component));
    var templateAbsUrl = null;
    var styleAbsUrls = null;
    if (lang_1.isPresent(view.templateUrl)) {
      templateAbsUrl = this._urlResolver.resolve(componentUrl, view.templateUrl);
    } else if (lang_1.isPresent(view.template)) {
      templateAbsUrl = componentUrl;
    }
    if (lang_1.isPresent(view.styleUrls)) {
      styleAbsUrls = collection_1.ListWrapper.map(view.styleUrls, function(url) {
        return _this._urlResolver.resolve(componentUrl, url);
      });
    }
    return new api_1.ViewDefinition({
      componentId: lang_1.stringify(component),
      templateAbsUrl: templateAbsUrl,
      template: view.template,
      styleAbsUrls: styleAbsUrls,
      styles: view.styles,
      directives: collection_1.ListWrapper.map(directives, function(directiveBinding) {
        return directiveBinding.metadata;
      }),
      encapsulation: view.encapsulation
    });
  };
  Compiler.prototype._flattenPipes = function(view) {
    if (lang_1.isBlank(view.pipes))
      return this._defaultPipes;
    var pipes = collection_1.ListWrapper.clone(this._defaultPipes);
    this._flattenList(view.pipes, pipes);
    return pipes;
  };
  Compiler.prototype._flattenDirectives = function(view) {
    if (lang_1.isBlank(view.directives))
      return [];
    var directives = [];
    this._flattenList(view.directives, directives);
    return directives;
  };
  Compiler.prototype._flattenList = function(tree, out) {
    for (var i = 0; i < tree.length; i++) {
      var item = di_1.resolveForwardRef(tree[i]);
      if (lang_1.isArray(item)) {
        this._flattenList(item, out);
      } else {
        out.push(item);
      }
    }
  };
  Compiler._isValidDirective = function(value) {
    return lang_1.isPresent(value) && (value instanceof lang_1.Type || value instanceof di_1.Binding);
  };
  Compiler._assertTypeIsComponent = function(directiveBinding) {
    if (directiveBinding.metadata.type !== api_1.RenderDirectiveMetadata.COMPONENT_TYPE) {
      throw new lang_1.BaseException("Could not load '" + lang_1.stringify(directiveBinding.key.token) + "' because it is not a component.");
    }
  };
  Compiler = __decorate([di_1.Injectable(), __param(2, di_1.Inject(pipes_1.DEFAULT_PIPES_TOKEN)), __metadata('design:paramtypes', [directive_resolver_1.DirectiveResolver, pipe_resolver_1.PipeResolver, Array, CompilerCache, view_resolver_1.ViewResolver, component_url_mapper_1.ComponentUrlMapper, url_resolver_1.UrlResolver, api_1.RenderCompiler, proto_view_factory_1.ProtoViewFactory, app_root_url_1.AppRootUrl])], Compiler);
  return Compiler;
})();
exports.Compiler = Compiler;

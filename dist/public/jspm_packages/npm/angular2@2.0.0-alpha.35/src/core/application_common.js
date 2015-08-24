/* */ 
(function(process) {
  'use strict';
  var di_1 = require("../../di");
  var lang_1 = require("../facade/lang");
  var browser_adapter_1 = require("../dom/browser_adapter");
  var dom_adapter_1 = require("../dom/dom_adapter");
  var compiler_1 = require("./compiler/compiler");
  var reflection_1 = require("../reflection/reflection");
  var change_detection_1 = require("../change_detection/change_detection");
  var pipes_1 = require("../../pipes");
  var exception_handler_1 = require("./exception_handler");
  var view_loader_1 = require("../render/dom/compiler/view_loader");
  var style_url_resolver_1 = require("../render/dom/compiler/style_url_resolver");
  var style_inliner_1 = require("../render/dom/compiler/style_inliner");
  var view_resolver_1 = require("./compiler/view_resolver");
  var directive_resolver_1 = require("./compiler/directive_resolver");
  var pipe_resolver_1 = require("./compiler/pipe_resolver");
  var collection_1 = require("../facade/collection");
  var async_1 = require("../facade/async");
  var ng_zone_1 = require("./zone/ng_zone");
  var life_cycle_1 = require("./life_cycle/life_cycle");
  var xhr_1 = require("../render/xhr");
  var xhr_impl_1 = require("../render/xhr_impl");
  var event_manager_1 = require("../render/dom/events/event_manager");
  var key_events_1 = require("../render/dom/events/key_events");
  var hammer_gestures_1 = require("../render/dom/events/hammer_gestures");
  var component_url_mapper_1 = require("./compiler/component_url_mapper");
  var url_resolver_1 = require("../services/url_resolver");
  var app_root_url_1 = require("../services/app_root_url");
  var anchor_based_app_root_url_1 = require("../services/anchor_based_app_root_url");
  var dynamic_component_loader_1 = require("./compiler/dynamic_component_loader");
  var testability_1 = require("./testability/testability");
  var view_pool_1 = require("./compiler/view_pool");
  var view_manager_1 = require("./compiler/view_manager");
  var view_manager_utils_1 = require("./compiler/view_manager_utils");
  var view_listener_1 = require("./compiler/view_listener");
  var proto_view_factory_1 = require("./compiler/proto_view_factory");
  var api_1 = require("../render/api");
  var render_1 = require("../render/render");
  var element_schema_registry_1 = require("../render/dom/schema/element_schema_registry");
  var dom_element_schema_registry_1 = require("../render/dom/schema/dom_element_schema_registry");
  var shared_styles_host_1 = require("../render/dom/view/shared_styles_host");
  var view_ref_1 = require("./compiler/view_ref");
  var application_tokens_1 = require("./application_tokens");
  var wtf_init_1 = require("../profile/wtf_init");
  var platform_bindings_1 = require("./platform_bindings");
  var _rootInjector;
  var _rootBindings = [di_1.bind(reflection_1.Reflector).toValue(reflection_1.reflector), testability_1.TestabilityRegistry];
  function _injectorBindings(appComponentType) {
    var bestChangeDetection = change_detection_1.DynamicChangeDetection;
    if (change_detection_1.PreGeneratedChangeDetection.isSupported()) {
      bestChangeDetection = change_detection_1.PreGeneratedChangeDetection;
    } else if (change_detection_1.JitChangeDetection.isSupported()) {
      bestChangeDetection = change_detection_1.JitChangeDetection;
    }
    return [di_1.bind(render_1.DOCUMENT).toValue(dom_adapter_1.DOM.defaultDoc()), di_1.bind(render_1.DOM_REFLECT_PROPERTIES_AS_ATTRIBUTES).toValue(false), di_1.bind(application_tokens_1.APP_COMPONENT).toValue(appComponentType), di_1.bind(application_tokens_1.APP_COMPONENT_REF_PROMISE).toFactory(function(dynamicComponentLoader, injector, testability, registry) {
      return dynamicComponentLoader.loadAsRoot(appComponentType, null, injector).then(function(componentRef) {
        registry.registerApplication(componentRef.location.nativeElement, testability);
        return componentRef;
      });
    }, [dynamic_component_loader_1.DynamicComponentLoader, di_1.Injector, testability_1.Testability, testability_1.TestabilityRegistry]), di_1.bind(appComponentType).toFactory(function(p) {
      return p.then(function(ref) {
        return ref.instance;
      });
    }, [application_tokens_1.APP_COMPONENT_REF_PROMISE]), di_1.bind(life_cycle_1.LifeCycle).toFactory(function(exceptionHandler) {
      return new life_cycle_1.LifeCycle(null, lang_1.assertionsEnabled());
    }, [exception_handler_1.ExceptionHandler]), di_1.bind(event_manager_1.EventManager).toFactory(function(ngZone) {
      var plugins = [new hammer_gestures_1.HammerGesturesPlugin(), new key_events_1.KeyEventsPlugin(), new event_manager_1.DomEventsPlugin()];
      return new event_manager_1.EventManager(plugins, ngZone);
    }, [ng_zone_1.NgZone]), render_1.DomRenderer, di_1.bind(api_1.Renderer).toAlias(render_1.DomRenderer), render_1.APP_ID_RANDOM_BINDING, render_1.TemplateCloner, di_1.bind(render_1.MAX_IN_MEMORY_ELEMENTS_PER_TEMPLATE).toValue(20), render_1.DefaultDomCompiler, di_1.bind(element_schema_registry_1.ElementSchemaRegistry).toValue(new dom_element_schema_registry_1.DomElementSchemaRegistry()), di_1.bind(api_1.RenderCompiler).toAlias(render_1.DefaultDomCompiler), shared_styles_host_1.DomSharedStylesHost, di_1.bind(shared_styles_host_1.SharedStylesHost).toAlias(shared_styles_host_1.DomSharedStylesHost), proto_view_factory_1.ProtoViewFactory, view_pool_1.AppViewPool, di_1.bind(view_pool_1.APP_VIEW_POOL_CAPACITY).toValue(10000), view_manager_1.AppViewManager, view_manager_utils_1.AppViewManagerUtils, view_listener_1.AppViewListener, compiler_1.Compiler, compiler_1.CompilerCache, view_resolver_1.ViewResolver, pipes_1.DEFAULT_PIPES, di_1.bind(change_detection_1.IterableDiffers).toValue(change_detection_1.defaultIterableDiffers), di_1.bind(change_detection_1.KeyValueDiffers).toValue(change_detection_1.defaultKeyValueDiffers), di_1.bind(change_detection_1.ChangeDetection).toClass(bestChangeDetection), view_loader_1.ViewLoader, directive_resolver_1.DirectiveResolver, pipe_resolver_1.PipeResolver, change_detection_1.Parser, change_detection_1.Lexer, platform_bindings_1.EXCEPTION_BINDING, di_1.bind(xhr_1.XHR).toValue(new xhr_impl_1.XHRImpl()), component_url_mapper_1.ComponentUrlMapper, url_resolver_1.UrlResolver, style_url_resolver_1.StyleUrlResolver, style_inliner_1.StyleInliner, dynamic_component_loader_1.DynamicComponentLoader, testability_1.Testability, anchor_based_app_root_url_1.AnchorBasedAppRootUrl, di_1.bind(app_root_url_1.AppRootUrl).toAlias(anchor_based_app_root_url_1.AnchorBasedAppRootUrl)];
  }
  function createNgZone() {
    return new ng_zone_1.NgZone({enableLongStackTrace: lang_1.assertionsEnabled()});
  }
  exports.createNgZone = createNgZone;
  function commonBootstrap(appComponentType, componentInjectableBindings) {
    if (componentInjectableBindings === void 0) {
      componentInjectableBindings = null;
    }
    browser_adapter_1.BrowserDomAdapter.makeCurrent();
    wtf_init_1.wtfInit();
    var bootstrapProcess = async_1.PromiseWrapper.completer();
    var zone = createNgZone();
    zone.run(function() {
      var exceptionHandler;
      try {
        var appInjector = _createAppInjector(appComponentType, componentInjectableBindings, zone);
        exceptionHandler = appInjector.get(exception_handler_1.ExceptionHandler);
        zone.overrideOnErrorHandler(function(e, s) {
          return exceptionHandler.call(e, s);
        });
        var compRefToken = appInjector.get(application_tokens_1.APP_COMPONENT_REF_PROMISE);
        var tick = function(componentRef) {
          var appChangeDetector = view_ref_1.internalView(componentRef.hostView).changeDetector;
          var lc = appInjector.get(life_cycle_1.LifeCycle);
          lc.registerWith(zone, appChangeDetector);
          lc.tick();
          bootstrapProcess.resolve(new ApplicationRef(componentRef, appComponentType, appInjector));
        };
        var tickResult = async_1.PromiseWrapper.then(compRefToken, tick);
        async_1.PromiseWrapper.then(tickResult, function(_) {});
        async_1.PromiseWrapper.then(tickResult, null, function(err, stackTrace) {
          bootstrapProcess.reject(err, stackTrace);
        });
      } catch (e) {
        if (lang_1.isPresent(exceptionHandler)) {
          exceptionHandler.call(e, e.stack);
        } else {
          dom_adapter_1.DOM.logError(e);
        }
        bootstrapProcess.reject(e, e.stack);
      }
    });
    return bootstrapProcess.promise;
  }
  exports.commonBootstrap = commonBootstrap;
  var ApplicationRef = (function() {
    function ApplicationRef(hostComponent, hostComponentType, injector) {
      this._hostComponent = hostComponent;
      this._injector = injector;
      this._hostComponentType = hostComponentType;
    }
    Object.defineProperty(ApplicationRef.prototype, "hostComponentType", {
      get: function() {
        return this._hostComponentType;
      },
      enumerable: true,
      configurable: true
    });
    Object.defineProperty(ApplicationRef.prototype, "hostComponent", {
      get: function() {
        return this._hostComponent.instance;
      },
      enumerable: true,
      configurable: true
    });
    ApplicationRef.prototype.dispose = function() {
      this._hostComponent.dispose();
    };
    Object.defineProperty(ApplicationRef.prototype, "injector", {
      get: function() {
        return this._injector;
      },
      enumerable: true,
      configurable: true
    });
    return ApplicationRef;
  })();
  exports.ApplicationRef = ApplicationRef;
  function _createAppInjector(appComponentType, bindings, zone) {
    if (lang_1.isBlank(_rootInjector))
      _rootInjector = di_1.Injector.resolveAndCreate(_rootBindings);
    var mergedBindings = lang_1.isPresent(bindings) ? collection_1.ListWrapper.concat(_injectorBindings(appComponentType), bindings) : _injectorBindings(appComponentType);
    mergedBindings.push(di_1.bind(ng_zone_1.NgZone).toValue(zone));
    return _rootInjector.resolveAndCreateChild(mergedBindings);
  }
})(require("process"));

/* */ 
'use strict';
var di_1 = require("../../../di");
var lang_1 = require("../../facade/lang");
var compiler_1 = require("../../core/compiler/compiler");
var reflection_1 = require("../../reflection/reflection");
var change_detection_1 = require("../../change_detection/change_detection");
var pipes_1 = require("../../../pipes");
var style_url_resolver_1 = require("../../render/dom/compiler/style_url_resolver");
var exception_handler_1 = require("../../core/exception_handler");
var directive_resolver_1 = require("../../core/compiler/directive_resolver");
var pipe_resolver_1 = require("../../core/compiler/pipe_resolver");
var view_resolver_1 = require("../../core/compiler/view_resolver");
var collection_1 = require("../../facade/collection");
var async_1 = require("../../facade/async");
var ng_zone_1 = require("../../core/zone/ng_zone");
var life_cycle_1 = require("../../core/life_cycle/life_cycle");
var xhr_1 = require("../../render/xhr");
var xhr_impl_1 = require("./xhr_impl");
var component_url_mapper_1 = require("../../core/compiler/component_url_mapper");
var url_resolver_1 = require("../../services/url_resolver");
var app_root_url_1 = require("../../services/app_root_url");
var dynamic_component_loader_1 = require("../../core/compiler/dynamic_component_loader");
var testability_1 = require("../../core/testability/testability");
var view_pool_1 = require("../../core/compiler/view_pool");
var view_manager_1 = require("../../core/compiler/view_manager");
var view_manager_utils_1 = require("../../core/compiler/view_manager_utils");
var view_listener_1 = require("../../core/compiler/view_listener");
var proto_view_factory_1 = require("../../core/compiler/proto_view_factory");
var renderer_1 = require("./renderer");
var api_1 = require("../../render/api");
var view_ref_1 = require("../../core/compiler/view_ref");
var broker_1 = require("./broker");
var application_1 = require("./application");
var application_tokens_1 = require("../../core/application_tokens");
var application_2 = require("../../core/application");
var application_common_1 = require("../../core/application_common");
var serializer_1 = require("../shared/serializer");
var api_2 = require("../shared/api");
var render_proto_view_ref_store_1 = require("../shared/render_proto_view_ref_store");
var render_view_with_fragments_store_1 = require("../shared/render_view_with_fragments_store");
var _rootInjector;
var _rootBindings = [di_1.bind(reflection_1.Reflector).toValue(reflection_1.reflector)];
var PrintLogger = (function() {
  function PrintLogger() {
    this.log = lang_1.print;
    this.logGroup = lang_1.print;
  }
  PrintLogger.prototype.logGroupEnd = function() {};
  return PrintLogger;
})();
function _injectorBindings(appComponentType, bus, initData) {
  var bestChangeDetection = change_detection_1.DynamicChangeDetection;
  if (change_detection_1.PreGeneratedChangeDetection.isSupported()) {
    bestChangeDetection = change_detection_1.PreGeneratedChangeDetection;
  } else if (change_detection_1.JitChangeDetection.isSupported()) {
    bestChangeDetection = change_detection_1.JitChangeDetection;
  }
  return [di_1.bind(application_tokens_1.APP_COMPONENT).toValue(appComponentType), di_1.bind(application_tokens_1.APP_COMPONENT_REF_PROMISE).toFactory(function(dynamicComponentLoader, injector) {
    return dynamicComponentLoader.loadAsRoot(appComponentType, null, injector).then(function(componentRef) {
      return componentRef;
    });
  }, [dynamic_component_loader_1.DynamicComponentLoader, di_1.Injector]), di_1.bind(appComponentType).toFactory(function(ref) {
    return ref.instance;
  }, [application_tokens_1.APP_COMPONENT_REF_PROMISE]), di_1.bind(life_cycle_1.LifeCycle).toFactory(function(exceptionHandler) {
    return new life_cycle_1.LifeCycle(null, lang_1.assertionsEnabled());
  }, [exception_handler_1.ExceptionHandler]), serializer_1.Serializer, di_1.bind(application_1.WebWorkerMessageBus).toValue(bus), di_1.bind(broker_1.MessageBroker).toFactory(function(a, b, c) {
    return new broker_1.MessageBroker(a, b, c);
  }, [application_1.WebWorkerMessageBus, serializer_1.Serializer, ng_zone_1.NgZone]), renderer_1.WebWorkerRenderer, di_1.bind(api_1.Renderer).toAlias(renderer_1.WebWorkerRenderer), renderer_1.WebWorkerCompiler, di_1.bind(api_1.RenderCompiler).toAlias(renderer_1.WebWorkerCompiler), di_1.bind(api_2.ON_WEB_WORKER).toValue(true), render_view_with_fragments_store_1.RenderViewWithFragmentsStore, render_proto_view_ref_store_1.RenderProtoViewRefStore, proto_view_factory_1.ProtoViewFactory, view_pool_1.AppViewPool, di_1.bind(view_pool_1.APP_VIEW_POOL_CAPACITY).toValue(10000), view_manager_1.AppViewManager, view_manager_utils_1.AppViewManagerUtils, view_listener_1.AppViewListener, compiler_1.Compiler, compiler_1.CompilerCache, view_resolver_1.ViewResolver, pipes_1.DEFAULT_PIPES, di_1.bind(change_detection_1.IterableDiffers).toValue(change_detection_1.defaultIterableDiffers), di_1.bind(change_detection_1.KeyValueDiffers).toValue(change_detection_1.defaultKeyValueDiffers), di_1.bind(change_detection_1.ChangeDetection).toClass(bestChangeDetection), directive_resolver_1.DirectiveResolver, pipe_resolver_1.PipeResolver, change_detection_1.Parser, change_detection_1.Lexer, di_1.bind(exception_handler_1.ExceptionHandler).toFactory(function() {
    return new exception_handler_1.ExceptionHandler(new PrintLogger());
  }, []), xhr_impl_1.WebWorkerXHRImpl, di_1.bind(xhr_1.XHR).toAlias(xhr_impl_1.WebWorkerXHRImpl), component_url_mapper_1.ComponentUrlMapper, url_resolver_1.UrlResolver, style_url_resolver_1.StyleUrlResolver, dynamic_component_loader_1.DynamicComponentLoader, testability_1.Testability, di_1.bind(app_root_url_1.AppRootUrl).toValue(new app_root_url_1.AppRootUrl(initData['rootUrl']))];
}
function bootstrapWebWorkerCommon(appComponentType, bus, componentInjectableBindings) {
  if (componentInjectableBindings === void 0) {
    componentInjectableBindings = null;
  }
  var bootstrapProcess = async_1.PromiseWrapper.completer();
  var zone = application_common_1.createNgZone();
  zone.run(function() {
    var listenerId;
    listenerId = bus.source.addListener(function(message) {
      if (message["data"]["type"] !== "init") {
        return;
      }
      var appInjector = _createAppInjector(appComponentType, componentInjectableBindings, zone, bus, message["data"]["value"]);
      var compRefToken = async_1.PromiseWrapper.wrap(function() {
        try {
          return appInjector.get(application_tokens_1.APP_COMPONENT_REF_PROMISE);
        } catch (e) {
          throw e;
        }
      });
      var tick = function(componentRef) {
        var appChangeDetector = view_ref_1.internalView(componentRef.hostView).changeDetector;
        var lc = appInjector.get(life_cycle_1.LifeCycle);
        lc.registerWith(zone, appChangeDetector);
        lc.tick();
        bootstrapProcess.resolve(new application_2.ApplicationRef(componentRef, appComponentType, appInjector));
      };
      async_1.PromiseWrapper.then(compRefToken, tick, function(err, stackTrace) {
        bootstrapProcess.reject(err, stackTrace);
      });
      bus.source.removeListener(listenerId);
    });
    bus.sink.send({'type': "ready"});
  });
  return bootstrapProcess.promise;
}
exports.bootstrapWebWorkerCommon = bootstrapWebWorkerCommon;
function _createAppInjector(appComponentType, bindings, zone, bus, initData) {
  if (lang_1.isBlank(_rootInjector))
    _rootInjector = di_1.Injector.resolveAndCreate(_rootBindings);
  var mergedBindings = lang_1.isPresent(bindings) ? collection_1.ListWrapper.concat(_injectorBindings(appComponentType, bus, initData), bindings) : _injectorBindings(appComponentType, bus, initData);
  mergedBindings.push(di_1.bind(ng_zone_1.NgZone).toValue(zone));
  return _rootInjector.resolveAndCreateChild(mergedBindings);
}

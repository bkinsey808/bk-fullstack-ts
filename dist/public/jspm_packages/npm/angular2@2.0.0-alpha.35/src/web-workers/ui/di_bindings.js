/* */ 
'use strict';
var di_1 = require("../../../di");
var reflection_1 = require("../../reflection/reflection");
var change_detection_1 = require("../../change_detection/change_detection");
var pipes_1 = require("../../../pipes");
var event_manager_1 = require("../../render/dom/events/event_manager");
var compiler_1 = require("../../core/compiler/compiler");
var browser_adapter_1 = require("../../dom/browser_adapter");
var key_events_1 = require("../../render/dom/events/key_events");
var hammer_gestures_1 = require("../../render/dom/events/hammer_gestures");
var view_pool_1 = require("../../core/compiler/view_pool");
var api_1 = require("../../render/api");
var app_root_url_1 = require("../../services/app_root_url");
var render_1 = require("../../render/render");
var element_schema_registry_1 = require("../../render/dom/schema/element_schema_registry");
var dom_element_schema_registry_1 = require("../../render/dom/schema/dom_element_schema_registry");
var shared_styles_host_1 = require("../../render/dom/view/shared_styles_host");
var dom_adapter_1 = require("../../dom/dom_adapter");
var ng_zone_1 = require("../../core/zone/ng_zone");
var view_manager_1 = require("../../core/compiler/view_manager");
var view_manager_utils_1 = require("../../core/compiler/view_manager_utils");
var view_listener_1 = require("../../core/compiler/view_listener");
var proto_view_factory_1 = require("../../core/compiler/proto_view_factory");
var view_resolver_1 = require("../../core/compiler/view_resolver");
var view_loader_1 = require("../../render/dom/compiler/view_loader");
var directive_resolver_1 = require("../../core/compiler/directive_resolver");
var exception_handler_1 = require("../../core/exception_handler");
var component_url_mapper_1 = require("../../core/compiler/component_url_mapper");
var style_inliner_1 = require("../../render/dom/compiler/style_inliner");
var dynamic_component_loader_1 = require("../../core/compiler/dynamic_component_loader");
var style_url_resolver_1 = require("../../render/dom/compiler/style_url_resolver");
var url_resolver_1 = require("../../services/url_resolver");
var testability_1 = require("../../core/testability/testability");
var xhr_1 = require("../../render/xhr");
var xhr_impl_1 = require("../../render/xhr_impl");
var serializer_1 = require("../shared/serializer");
var api_2 = require("../shared/api");
var render_proto_view_ref_store_1 = require("../shared/render_proto_view_ref_store");
var render_view_with_fragments_store_1 = require("../shared/render_view_with_fragments_store");
var anchor_based_app_root_url_1 = require("../../services/anchor_based_app_root_url");
var impl_1 = require("./impl");
var _rootInjector;
var _rootBindings = [di_1.bind(reflection_1.Reflector).toValue(reflection_1.reflector)];
function _injectorBindings() {
  var bestChangeDetection = change_detection_1.DynamicChangeDetection;
  if (change_detection_1.PreGeneratedChangeDetection.isSupported()) {
    bestChangeDetection = change_detection_1.PreGeneratedChangeDetection;
  } else if (change_detection_1.JitChangeDetection.isSupported()) {
    bestChangeDetection = change_detection_1.JitChangeDetection;
  }
  return [di_1.bind(render_1.DOCUMENT).toValue(dom_adapter_1.DOM.defaultDoc()), di_1.bind(event_manager_1.EventManager).toFactory(function(ngZone) {
    var plugins = [new hammer_gestures_1.HammerGesturesPlugin(), new key_events_1.KeyEventsPlugin(), new event_manager_1.DomEventsPlugin()];
    return new event_manager_1.EventManager(plugins, ngZone);
  }, [ng_zone_1.NgZone]), di_1.bind(render_1.DOM_REFLECT_PROPERTIES_AS_ATTRIBUTES).toValue(false), render_1.DomRenderer, di_1.bind(api_1.Renderer).toAlias(render_1.DomRenderer), render_1.APP_ID_RANDOM_BINDING, render_1.TemplateCloner, di_1.bind(render_1.MAX_IN_MEMORY_ELEMENTS_PER_TEMPLATE).toValue(20), render_1.DefaultDomCompiler, di_1.bind(api_1.RenderCompiler).toAlias(render_1.DefaultDomCompiler), shared_styles_host_1.DomSharedStylesHost, di_1.bind(shared_styles_host_1.SharedStylesHost).toAlias(shared_styles_host_1.DomSharedStylesHost), serializer_1.Serializer, di_1.bind(api_2.ON_WEB_WORKER).toValue(false), di_1.bind(element_schema_registry_1.ElementSchemaRegistry).toValue(new dom_element_schema_registry_1.DomElementSchemaRegistry()), render_view_with_fragments_store_1.RenderViewWithFragmentsStore, render_proto_view_ref_store_1.RenderProtoViewRefStore, proto_view_factory_1.ProtoViewFactory, view_pool_1.AppViewPool, di_1.bind(view_pool_1.APP_VIEW_POOL_CAPACITY).toValue(10000), view_manager_1.AppViewManager, view_manager_utils_1.AppViewManagerUtils, view_listener_1.AppViewListener, compiler_1.Compiler, compiler_1.CompilerCache, view_resolver_1.ViewResolver, pipes_1.DEFAULT_PIPES, di_1.bind(change_detection_1.ChangeDetection).toClass(bestChangeDetection), view_loader_1.ViewLoader, directive_resolver_1.DirectiveResolver, change_detection_1.Parser, change_detection_1.Lexer, di_1.bind(exception_handler_1.ExceptionHandler).toFactory(function() {
    return new exception_handler_1.ExceptionHandler(dom_adapter_1.DOM);
  }, []), di_1.bind(xhr_1.XHR).toValue(new xhr_impl_1.XHRImpl()), component_url_mapper_1.ComponentUrlMapper, url_resolver_1.UrlResolver, style_url_resolver_1.StyleUrlResolver, style_inliner_1.StyleInliner, dynamic_component_loader_1.DynamicComponentLoader, testability_1.Testability, anchor_based_app_root_url_1.AnchorBasedAppRootUrl, di_1.bind(app_root_url_1.AppRootUrl).toAlias(anchor_based_app_root_url_1.AnchorBasedAppRootUrl), impl_1.WebWorkerMain];
}
function createInjector(zone) {
  browser_adapter_1.BrowserDomAdapter.makeCurrent();
  _rootBindings.push(di_1.bind(ng_zone_1.NgZone).toValue(zone));
  var injector = di_1.Injector.resolveAndCreate(_rootBindings);
  return injector.resolveAndCreateChild(_injectorBindings());
}
exports.createInjector = createInjector;

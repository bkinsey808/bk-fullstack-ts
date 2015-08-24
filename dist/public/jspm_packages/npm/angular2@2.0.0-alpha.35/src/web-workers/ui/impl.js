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
var di_bindings_1 = require("./di_bindings");
var api_1 = require("../../render/api");
var lang_1 = require("../../facade/lang");
var async_1 = require("../../facade/async");
var collection_1 = require("../../facade/collection");
var serializer_1 = require("../shared/serializer");
var render_view_with_fragments_store_1 = require("../shared/render_view_with_fragments_store");
var application_common_1 = require("../../core/application_common");
var api_2 = require("../shared/api");
var anchor_based_app_root_url_1 = require("../../services/anchor_based_app_root_url");
var di_1 = require("../../../di");
var browser_adapter_1 = require("../../dom/browser_adapter");
var xhr_1 = require("../../render/xhr");
var event_serializer_1 = require("./event_serializer");
var wtf_init_1 = require("../../profile/wtf_init");
function bootstrapUICommon(bus) {
  browser_adapter_1.BrowserDomAdapter.makeCurrent();
  var zone = application_common_1.createNgZone();
  wtf_init_1.wtfInit();
  zone.run(function() {
    var injector = di_bindings_1.createInjector(zone);
    var webWorkerMain = injector.get(WebWorkerMain);
    webWorkerMain.attachToWebWorker(bus);
  });
}
exports.bootstrapUICommon = bootstrapUICommon;
var WebWorkerMain = (function() {
  function WebWorkerMain(_renderCompiler, _renderer, _renderViewWithFragmentsStore, _serializer, rootUrl, _xhr) {
    this._renderCompiler = _renderCompiler;
    this._renderer = _renderer;
    this._renderViewWithFragmentsStore = _renderViewWithFragmentsStore;
    this._serializer = _serializer;
    this._xhr = _xhr;
    this._rootUrl = rootUrl.value;
  }
  WebWorkerMain.prototype.attachToWebWorker = function(bus) {
    var _this = this;
    this._bus = bus;
    this._bus.source.addListener(function(message) {
      _this._handleWebWorkerMessage(message);
    });
  };
  WebWorkerMain.prototype._sendInitMessage = function() {
    this._sendWebWorkerMessage("init", {"rootUrl": this._rootUrl});
  };
  WebWorkerMain.prototype._sendWebWorkerError = function(id, error) {
    this._sendWebWorkerMessage("error", {"error": error}, id);
  };
  WebWorkerMain.prototype._sendWebWorkerMessage = function(type, value, id) {
    this._bus.sink.send({
      'type': type,
      'id': id,
      'value': value
    });
  };
  WebWorkerMain.prototype._handleCompilerMessage = function(data) {
    var promise;
    switch (data.method) {
      case "compileHost":
        var directiveMetadata = this._serializer.deserialize(data.args[0], api_1.RenderDirectiveMetadata);
        promise = this._renderCompiler.compileHost(directiveMetadata);
        this._wrapWebWorkerPromise(data.id, promise, api_1.ProtoViewDto);
        break;
      case "compile":
        var view = this._serializer.deserialize(data.args[0], api_1.ViewDefinition);
        promise = this._renderCompiler.compile(view);
        this._wrapWebWorkerPromise(data.id, promise, api_1.ProtoViewDto);
        break;
      case "mergeProtoViewsRecursively":
        var views = this._serializer.deserialize(data.args[0], api_1.RenderProtoViewRef);
        promise = this._renderCompiler.mergeProtoViewsRecursively(views);
        this._wrapWebWorkerPromise(data.id, promise, api_1.RenderProtoViewMergeMapping);
        break;
      default:
        throw new lang_1.BaseException("not implemented");
    }
  };
  WebWorkerMain.prototype._createViewHelper = function(args, method) {
    var hostProtoView = this._serializer.deserialize(args[0], api_1.RenderProtoViewRef);
    var fragmentCount = args[1];
    var startIndex,
        renderViewWithFragments;
    if (method == "createView") {
      startIndex = args[2];
      renderViewWithFragments = this._renderer.createView(hostProtoView, fragmentCount);
    } else {
      var selector = args[2];
      startIndex = args[3];
      renderViewWithFragments = this._renderer.createRootHostView(hostProtoView, fragmentCount, selector);
    }
    this._renderViewWithFragmentsStore.store(renderViewWithFragments, startIndex);
  };
  WebWorkerMain.prototype._handleRendererMessage = function(data) {
    var args = data.args;
    switch (data.method) {
      case "createRootHostView":
      case "createView":
        this._createViewHelper(args, data.method);
        break;
      case "destroyView":
        var viewRef = this._serializer.deserialize(args[0], api_1.RenderViewRef);
        this._renderer.destroyView(viewRef);
        break;
      case "attachFragmentAfterFragment":
        var previousFragment = this._serializer.deserialize(args[0], api_1.RenderFragmentRef);
        var fragment = this._serializer.deserialize(args[1], api_1.RenderFragmentRef);
        this._renderer.attachFragmentAfterFragment(previousFragment, fragment);
        break;
      case "attachFragmentAfterElement":
        var element = this._serializer.deserialize(args[0], api_2.WebWorkerElementRef);
        var fragment = this._serializer.deserialize(args[1], api_1.RenderFragmentRef);
        this._renderer.attachFragmentAfterElement(element, fragment);
        break;
      case "detachFragment":
        var fragment = this._serializer.deserialize(args[0], api_1.RenderFragmentRef);
        this._renderer.detachFragment(fragment);
        break;
      case "hydrateView":
        var viewRef = this._serializer.deserialize(args[0], api_1.RenderViewRef);
        this._renderer.hydrateView(viewRef);
        break;
      case "dehydrateView":
        var viewRef = this._serializer.deserialize(args[0], api_1.RenderViewRef);
        this._renderer.dehydrateView(viewRef);
        break;
      case "setText":
        var viewRef = this._serializer.deserialize(args[0], api_1.RenderViewRef);
        var textNodeIndex = args[1];
        var text = args[2];
        this._renderer.setText(viewRef, textNodeIndex, text);
        break;
      case "setElementProperty":
        var elementRef = this._serializer.deserialize(args[0], api_2.WebWorkerElementRef);
        var propName = args[1];
        var propValue = args[2];
        this._renderer.setElementProperty(elementRef, propName, propValue);
        break;
      case "setElementAttribute":
        var elementRef = this._serializer.deserialize(args[0], api_2.WebWorkerElementRef);
        var attributeName = args[1];
        var attributeValue = args[2];
        this._renderer.setElementAttribute(elementRef, attributeName, attributeValue);
        break;
      case "setElementClass":
        var elementRef = this._serializer.deserialize(args[0], api_2.WebWorkerElementRef);
        var className = args[1];
        var isAdd = args[2];
        this._renderer.setElementClass(elementRef, className, isAdd);
        break;
      case "setElementStyle":
        var elementRef = this._serializer.deserialize(args[0], api_2.WebWorkerElementRef);
        var styleName = args[1];
        var styleValue = args[2];
        this._renderer.setElementStyle(elementRef, styleName, styleValue);
        break;
      case "invokeElementMethod":
        var elementRef = this._serializer.deserialize(args[0], api_2.WebWorkerElementRef);
        var methodName = args[1];
        var methodArgs = args[2];
        this._renderer.invokeElementMethod(elementRef, methodName, methodArgs);
        break;
      case "setEventDispatcher":
        var viewRef = this._serializer.deserialize(args[0], api_1.RenderViewRef);
        var dispatcher = new EventDispatcher(viewRef, this._bus.sink, this._serializer);
        this._renderer.setEventDispatcher(viewRef, dispatcher);
        break;
      default:
        throw new lang_1.BaseException("Not Implemented");
    }
  };
  WebWorkerMain.prototype._handleXhrMessage = function(data) {
    var args = data.args;
    switch (data.method) {
      case "get":
        var url = args[0];
        var promise = this._xhr.get(url);
        this._wrapWebWorkerPromise(data.id, promise, String);
        break;
      default:
        throw new lang_1.BaseException(data.method + " Not Implemented");
    }
  };
  WebWorkerMain.prototype._handleWebWorkerMessage = function(message) {
    var data = new ReceivedMessage(message['data']);
    switch (data.type) {
      case "ready":
        return this._sendInitMessage();
      case "compiler":
        return this._handleCompilerMessage(data);
      case "renderer":
        return this._handleRendererMessage(data);
      case "xhr":
        return this._handleXhrMessage(data);
    }
  };
  WebWorkerMain.prototype._wrapWebWorkerPromise = function(id, promise, type) {
    var _this = this;
    async_1.PromiseWrapper.then(promise, function(result) {
      try {
        _this._sendWebWorkerMessage("result", _this._serializer.serialize(result, type), id);
      } catch (e) {
        lang_1.print(e);
      }
    }, function(error) {
      _this._sendWebWorkerError(id, error);
    });
  };
  WebWorkerMain = __decorate([di_1.Injectable(), __metadata('design:paramtypes', [api_1.RenderCompiler, api_1.Renderer, render_view_with_fragments_store_1.RenderViewWithFragmentsStore, serializer_1.Serializer, anchor_based_app_root_url_1.AnchorBasedAppRootUrl, xhr_1.XHR])], WebWorkerMain);
  return WebWorkerMain;
})();
exports.WebWorkerMain = WebWorkerMain;
var EventDispatcher = (function() {
  function EventDispatcher(_viewRef, _sink, _serializer) {
    this._viewRef = _viewRef;
    this._sink = _sink;
    this._serializer = _serializer;
  }
  EventDispatcher.prototype.dispatchRenderEvent = function(elementIndex, eventName, locals) {
    var e = locals.get('$event');
    var serializedEvent;
    switch (e.type) {
      case "click":
      case "mouseup":
      case "mousedown":
      case "dblclick":
      case "contextmenu":
      case "mouseenter":
      case "mouseleave":
      case "mousemove":
      case "mouseout":
      case "mouseover":
      case "show":
        serializedEvent = event_serializer_1.serializeMouseEvent(e);
        break;
      case "keydown":
      case "keypress":
      case "keyup":
        serializedEvent = event_serializer_1.serializeKeyboardEvent(e);
        break;
      case "input":
      case "change":
      case "blur":
        serializedEvent = event_serializer_1.serializeEventWithTarget(e);
        break;
      case "abort":
      case "afterprint":
      case "beforeprint":
      case "cached":
      case "canplay":
      case "canplaythrough":
      case "chargingchange":
      case "chargingtimechange":
      case "close":
      case "dischargingtimechange":
      case "DOMContentLoaded":
      case "downloading":
      case "durationchange":
      case "emptied":
      case "ended":
      case "error":
      case "fullscreenchange":
      case "fullscreenerror":
      case "invalid":
      case "languagechange":
      case "levelfchange":
      case "loadeddata":
      case "loadedmetadata":
      case "obsolete":
      case "offline":
      case "online":
      case "open":
      case "orientatoinchange":
      case "pause":
      case "pointerlockchange":
      case "pointerlockerror":
      case "play":
      case "playing":
      case "ratechange":
      case "readystatechange":
      case "reset":
      case "seeked":
      case "seeking":
      case "stalled":
      case "submit":
      case "success":
      case "suspend":
      case "timeupdate":
      case "updateready":
      case "visibilitychange":
      case "volumechange":
      case "waiting":
        serializedEvent = event_serializer_1.serializeGenericEvent(e);
        break;
      default:
        throw new lang_1.BaseException(eventName + " not supported on WebWorkers");
    }
    var serializedLocals = collection_1.StringMapWrapper.create();
    collection_1.StringMapWrapper.set(serializedLocals, '$event', serializedEvent);
    this._sink.send({
      "type": "event",
      "value": {
        "viewRef": this._serializer.serialize(this._viewRef, api_1.RenderViewRef),
        "elementIndex": elementIndex,
        "eventName": eventName,
        "locals": serializedLocals
      }
    });
  };
  return EventDispatcher;
})();
var ReceivedMessage = (function() {
  function ReceivedMessage(data) {
    this.method = data['method'];
    this.args = data['args'];
    this.id = data['id'];
    this.type = data['type'];
  }
  return ReceivedMessage;
})();

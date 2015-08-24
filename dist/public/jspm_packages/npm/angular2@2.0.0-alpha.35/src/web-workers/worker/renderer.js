/* */ 
(function(process) {
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
  var api_1 = require("../../render/api");
  var broker_1 = require("./broker");
  var lang_1 = require("../../facade/lang");
  var di_1 = require("../../../di");
  var render_view_with_fragments_store_1 = require("../shared/render_view_with_fragments_store");
  var api_2 = require("../shared/api");
  var WebWorkerCompiler = (function() {
    function WebWorkerCompiler(_messageBroker) {
      this._messageBroker = _messageBroker;
    }
    WebWorkerCompiler.prototype.compileHost = function(directiveMetadata) {
      var fnArgs = [new broker_1.FnArg(directiveMetadata, api_1.RenderDirectiveMetadata)];
      var args = new broker_1.UiArguments("compiler", "compileHost", fnArgs);
      return this._messageBroker.runOnUiThread(args, api_1.ProtoViewDto);
    };
    WebWorkerCompiler.prototype.compile = function(view) {
      var fnArgs = [new broker_1.FnArg(view, api_1.ViewDefinition)];
      var args = new broker_1.UiArguments("compiler", "compile", fnArgs);
      return this._messageBroker.runOnUiThread(args, api_1.ProtoViewDto);
    };
    WebWorkerCompiler.prototype.mergeProtoViewsRecursively = function(protoViewRefs) {
      var fnArgs = [new broker_1.FnArg(protoViewRefs, api_1.RenderProtoViewRef)];
      var args = new broker_1.UiArguments("compiler", "mergeProtoViewsRecursively", fnArgs);
      return this._messageBroker.runOnUiThread(args, api_1.RenderProtoViewMergeMapping);
    };
    WebWorkerCompiler = __decorate([di_1.Injectable(), __metadata('design:paramtypes', [broker_1.MessageBroker])], WebWorkerCompiler);
    return WebWorkerCompiler;
  })();
  exports.WebWorkerCompiler = WebWorkerCompiler;
  var WebWorkerRenderer = (function() {
    function WebWorkerRenderer(_messageBroker, _renderViewStore) {
      this._messageBroker = _messageBroker;
      this._renderViewStore = _renderViewStore;
    }
    WebWorkerRenderer.prototype.createRootHostView = function(hostProtoViewRef, fragmentCount, hostElementSelector) {
      return this._createViewHelper(hostProtoViewRef, fragmentCount, hostElementSelector);
    };
    WebWorkerRenderer.prototype.createView = function(protoViewRef, fragmentCount) {
      return this._createViewHelper(protoViewRef, fragmentCount);
    };
    WebWorkerRenderer.prototype._createViewHelper = function(protoViewRef, fragmentCount, hostElementSelector) {
      var renderViewWithFragments = this._renderViewStore.allocate(fragmentCount);
      var startIndex = (renderViewWithFragments.viewRef).refNumber;
      var fnArgs = [new broker_1.FnArg(protoViewRef, api_1.RenderProtoViewRef), new broker_1.FnArg(fragmentCount, null)];
      var method = "createView";
      if (lang_1.isPresent(hostElementSelector) && hostElementSelector != null) {
        fnArgs.push(new broker_1.FnArg(hostElementSelector, null));
        method = "createRootHostView";
      }
      fnArgs.push(new broker_1.FnArg(startIndex, null));
      var args = new broker_1.UiArguments("renderer", method, fnArgs);
      this._messageBroker.runOnUiThread(args, null);
      return renderViewWithFragments;
    };
    WebWorkerRenderer.prototype.destroyView = function(viewRef) {
      var fnArgs = [new broker_1.FnArg(viewRef, api_1.RenderViewRef)];
      var args = new broker_1.UiArguments("renderer", "destroyView", fnArgs);
      this._messageBroker.runOnUiThread(args, null);
    };
    WebWorkerRenderer.prototype.attachFragmentAfterFragment = function(previousFragmentRef, fragmentRef) {
      var fnArgs = [new broker_1.FnArg(previousFragmentRef, api_1.RenderFragmentRef), new broker_1.FnArg(fragmentRef, api_1.RenderFragmentRef)];
      var args = new broker_1.UiArguments("renderer", "attachFragmentAfterFragment", fnArgs);
      this._messageBroker.runOnUiThread(args, null);
    };
    WebWorkerRenderer.prototype.attachFragmentAfterElement = function(elementRef, fragmentRef) {
      var fnArgs = [new broker_1.FnArg(elementRef, api_2.WebWorkerElementRef), new broker_1.FnArg(fragmentRef, api_1.RenderFragmentRef)];
      var args = new broker_1.UiArguments("renderer", "attachFragmentAfterElement", fnArgs);
      this._messageBroker.runOnUiThread(args, null);
    };
    WebWorkerRenderer.prototype.detachFragment = function(fragmentRef) {
      var fnArgs = [new broker_1.FnArg(fragmentRef, api_1.RenderFragmentRef)];
      var args = new broker_1.UiArguments("renderer", "detachFragment", fnArgs);
      this._messageBroker.runOnUiThread(args, null);
    };
    WebWorkerRenderer.prototype.hydrateView = function(viewRef) {
      var fnArgs = [new broker_1.FnArg(viewRef, api_1.RenderViewRef)];
      var args = new broker_1.UiArguments("renderer", "hydrateView", fnArgs);
      this._messageBroker.runOnUiThread(args, null);
    };
    WebWorkerRenderer.prototype.dehydrateView = function(viewRef) {
      var fnArgs = [new broker_1.FnArg(viewRef, api_1.RenderViewRef)];
      var args = new broker_1.UiArguments("renderer", "dehydrateView", fnArgs);
      this._messageBroker.runOnUiThread(args, null);
    };
    WebWorkerRenderer.prototype.getNativeElementSync = function(location) {
      return null;
    };
    WebWorkerRenderer.prototype.setElementProperty = function(location, propertyName, propertyValue) {
      var fnArgs = [new broker_1.FnArg(location, api_2.WebWorkerElementRef), new broker_1.FnArg(propertyName, null), new broker_1.FnArg(propertyValue, null)];
      var args = new broker_1.UiArguments("renderer", "setElementProperty", fnArgs);
      this._messageBroker.runOnUiThread(args, null);
    };
    WebWorkerRenderer.prototype.setElementAttribute = function(location, attributeName, attributeValue) {
      var fnArgs = [new broker_1.FnArg(location, api_2.WebWorkerElementRef), new broker_1.FnArg(attributeName, null), new broker_1.FnArg(attributeValue, null)];
      var args = new broker_1.UiArguments("renderer", "setElementAttribute", fnArgs);
      this._messageBroker.runOnUiThread(args, null);
    };
    WebWorkerRenderer.prototype.setElementClass = function(location, className, isAdd) {
      var fnArgs = [new broker_1.FnArg(location, api_2.WebWorkerElementRef), new broker_1.FnArg(className, null), new broker_1.FnArg(isAdd, null)];
      var args = new broker_1.UiArguments("renderer", "setElementClass", fnArgs);
      this._messageBroker.runOnUiThread(args, null);
    };
    WebWorkerRenderer.prototype.setElementStyle = function(location, styleName, styleValue) {
      var fnArgs = [new broker_1.FnArg(location, api_2.WebWorkerElementRef), new broker_1.FnArg(styleName, null), new broker_1.FnArg(styleValue, null)];
      var args = new broker_1.UiArguments("renderer", "setElementStyle", fnArgs);
      this._messageBroker.runOnUiThread(args, null);
    };
    WebWorkerRenderer.prototype.invokeElementMethod = function(location, methodName, args) {
      var fnArgs = [new broker_1.FnArg(location, api_2.WebWorkerElementRef), new broker_1.FnArg(methodName, null), new broker_1.FnArg(args, null)];
      var uiArgs = new broker_1.UiArguments("renderer", "invokeElementMethod", fnArgs);
      this._messageBroker.runOnUiThread(uiArgs, null);
    };
    WebWorkerRenderer.prototype.setText = function(viewRef, textNodeIndex, text) {
      var fnArgs = [new broker_1.FnArg(viewRef, api_1.RenderViewRef), new broker_1.FnArg(textNodeIndex, null), new broker_1.FnArg(text, null)];
      var args = new broker_1.UiArguments("renderer", "setText", fnArgs);
      this._messageBroker.runOnUiThread(args, null);
    };
    WebWorkerRenderer.prototype.setEventDispatcher = function(viewRef, dispatcher) {
      var fnArgs = [new broker_1.FnArg(viewRef, api_1.RenderViewRef)];
      var args = new broker_1.UiArguments("renderer", "setEventDispatcher", fnArgs);
      this._messageBroker.registerEventDispatcher(viewRef, dispatcher);
      this._messageBroker.runOnUiThread(args, null);
    };
    WebWorkerRenderer = __decorate([di_1.Injectable(), __metadata('design:paramtypes', [broker_1.MessageBroker, render_view_with_fragments_store_1.RenderViewWithFragmentsStore])], WebWorkerRenderer);
    return WebWorkerRenderer;
  })();
  exports.WebWorkerRenderer = WebWorkerRenderer;
})(require("process"));

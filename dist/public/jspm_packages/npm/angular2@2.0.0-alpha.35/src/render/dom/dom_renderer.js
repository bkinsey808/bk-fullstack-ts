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
var __param = (this && this.__param) || function(paramIndex, decorator) {
  return function(target, key) {
    decorator(target, key, paramIndex);
  };
};
var di_1 = require("../../../di");
var lang_1 = require("../../facade/lang");
var dom_adapter_1 = require("../../dom/dom_adapter");
var event_manager_1 = require("./events/event_manager");
var proto_view_1 = require("./view/proto_view");
var view_1 = require("./view/view");
var fragment_1 = require("./view/fragment");
var shared_styles_host_1 = require("./view/shared_styles_host");
var util_1 = require("./util");
var profile_1 = require("../../profile/profile");
var api_1 = require("../api");
var template_cloner_1 = require("./template_cloner");
var dom_tokens_1 = require("./dom_tokens");
var REFLECT_PREFIX = 'ng-reflect-';
var DomRenderer = (function(_super) {
  __extends(DomRenderer, _super);
  function DomRenderer(_eventManager, _domSharedStylesHost, _templateCloner, document, reflectPropertiesAsAttributes) {
    _super.call(this);
    this._eventManager = _eventManager;
    this._domSharedStylesHost = _domSharedStylesHost;
    this._templateCloner = _templateCloner;
    this._scope_createRootHostView = profile_1.wtfCreateScope('DomRenderer#createRootHostView()');
    this._scope_createView = profile_1.wtfCreateScope('DomRenderer#createView()');
    this._scope_detachFragment = profile_1.wtfCreateScope('DomRenderer#detachFragment()');
    this._scope_setEventDispatcher = profile_1.wtfCreateScope('DomRenderer#setEventDispatcher()');
    this._reflectPropertiesAsAttributes = reflectPropertiesAsAttributes;
    this._document = document;
  }
  DomRenderer.prototype.createRootHostView = function(hostProtoViewRef, fragmentCount, hostElementSelector) {
    var s = this._scope_createRootHostView();
    var hostProtoView = proto_view_1.resolveInternalDomProtoView(hostProtoViewRef);
    var element = dom_adapter_1.DOM.querySelector(this._document, hostElementSelector);
    if (lang_1.isBlank(element)) {
      profile_1.wtfLeave(s);
      throw new lang_1.BaseException("The selector \"" + hostElementSelector + "\" did not match any elements");
    }
    return profile_1.wtfLeave(s, this._createView(hostProtoView, element));
  };
  DomRenderer.prototype.createView = function(protoViewRef, fragmentCount) {
    var s = this._scope_createView();
    var protoView = proto_view_1.resolveInternalDomProtoView(protoViewRef);
    return profile_1.wtfLeave(s, this._createView(protoView, null));
  };
  DomRenderer.prototype.destroyView = function(viewRef) {
    var view = view_1.resolveInternalDomView(viewRef);
    var elementBinders = view.proto.elementBinders;
    for (var i = 0; i < elementBinders.length; i++) {
      var binder = elementBinders[i];
      if (binder.hasNativeShadowRoot) {
        this._domSharedStylesHost.removeHost(dom_adapter_1.DOM.getShadowRoot(view.boundElements[i]));
      }
    }
  };
  DomRenderer.prototype.getNativeElementSync = function(location) {
    if (lang_1.isBlank(location.renderBoundElementIndex)) {
      return null;
    }
    return view_1.resolveInternalDomView(location.renderView).boundElements[location.renderBoundElementIndex];
  };
  DomRenderer.prototype.getRootNodes = function(fragment) {
    return fragment_1.resolveInternalDomFragment(fragment);
  };
  DomRenderer.prototype.attachFragmentAfterFragment = function(previousFragmentRef, fragmentRef) {
    var previousFragmentNodes = fragment_1.resolveInternalDomFragment(previousFragmentRef);
    if (previousFragmentNodes.length > 0) {
      var sibling = previousFragmentNodes[previousFragmentNodes.length - 1];
      moveNodesAfterSibling(sibling, fragment_1.resolveInternalDomFragment(fragmentRef));
    }
  };
  DomRenderer.prototype.attachFragmentAfterElement = function(elementRef, fragmentRef) {
    if (lang_1.isBlank(elementRef.renderBoundElementIndex)) {
      return;
    }
    var parentView = view_1.resolveInternalDomView(elementRef.renderView);
    var element = parentView.boundElements[elementRef.renderBoundElementIndex];
    moveNodesAfterSibling(element, fragment_1.resolveInternalDomFragment(fragmentRef));
  };
  DomRenderer.prototype.detachFragment = function(fragmentRef) {
    var s = this._scope_detachFragment();
    var fragmentNodes = fragment_1.resolveInternalDomFragment(fragmentRef);
    for (var i = 0; i < fragmentNodes.length; i++) {
      dom_adapter_1.DOM.remove(fragmentNodes[i]);
    }
    profile_1.wtfLeave(s);
  };
  DomRenderer.prototype.hydrateView = function(viewRef) {
    var view = view_1.resolveInternalDomView(viewRef);
    if (view.hydrated)
      throw new lang_1.BaseException('The view is already hydrated.');
    view.hydrated = true;
    view.eventHandlerRemovers = [];
    var binders = view.proto.elementBinders;
    for (var binderIdx = 0; binderIdx < binders.length; binderIdx++) {
      var binder = binders[binderIdx];
      if (lang_1.isPresent(binder.globalEvents)) {
        for (var i = 0; i < binder.globalEvents.length; i++) {
          var globalEvent = binder.globalEvents[i];
          var remover = this._createGlobalEventListener(view, binderIdx, globalEvent.name, globalEvent.target, globalEvent.fullName);
          view.eventHandlerRemovers.push(remover);
        }
      }
    }
  };
  DomRenderer.prototype.dehydrateView = function(viewRef) {
    var view = view_1.resolveInternalDomView(viewRef);
    for (var i = 0; i < view.eventHandlerRemovers.length; i++) {
      view.eventHandlerRemovers[i]();
    }
    view.eventHandlerRemovers = null;
    view.hydrated = false;
  };
  DomRenderer.prototype.setElementProperty = function(location, propertyName, propertyValue) {
    if (lang_1.isBlank(location.renderBoundElementIndex)) {
      return;
    }
    var view = view_1.resolveInternalDomView(location.renderView);
    view.setElementProperty(location.renderBoundElementIndex, propertyName, propertyValue);
    if (this._reflectPropertiesAsAttributes) {
      this.setElementAttribute(location, "" + REFLECT_PREFIX + util_1.camelCaseToDashCase(propertyName), "" + propertyValue);
    }
  };
  DomRenderer.prototype.setElementAttribute = function(location, attributeName, attributeValue) {
    if (lang_1.isBlank(location.renderBoundElementIndex)) {
      return;
    }
    var view = view_1.resolveInternalDomView(location.renderView);
    view.setElementAttribute(location.renderBoundElementIndex, attributeName, attributeValue);
  };
  DomRenderer.prototype.setElementClass = function(location, className, isAdd) {
    if (lang_1.isBlank(location.renderBoundElementIndex)) {
      return;
    }
    var view = view_1.resolveInternalDomView(location.renderView);
    view.setElementClass(location.renderBoundElementIndex, className, isAdd);
  };
  DomRenderer.prototype.setElementStyle = function(location, styleName, styleValue) {
    if (lang_1.isBlank(location.renderBoundElementIndex)) {
      return;
    }
    var view = view_1.resolveInternalDomView(location.renderView);
    view.setElementStyle(location.renderBoundElementIndex, styleName, styleValue);
  };
  DomRenderer.prototype.invokeElementMethod = function(location, methodName, args) {
    if (lang_1.isBlank(location.renderBoundElementIndex)) {
      return;
    }
    var view = view_1.resolveInternalDomView(location.renderView);
    view.invokeElementMethod(location.renderBoundElementIndex, methodName, args);
  };
  DomRenderer.prototype.setText = function(viewRef, textNodeIndex, text) {
    if (lang_1.isBlank(textNodeIndex)) {
      return;
    }
    var view = view_1.resolveInternalDomView(viewRef);
    dom_adapter_1.DOM.setText(view.boundTextNodes[textNodeIndex], text);
  };
  DomRenderer.prototype.setEventDispatcher = function(viewRef, dispatcher) {
    var s = this._scope_setEventDispatcher();
    var view = view_1.resolveInternalDomView(viewRef);
    view.eventDispatcher = dispatcher;
    profile_1.wtfLeave(s);
  };
  DomRenderer.prototype._createView = function(protoView, inplaceElement) {
    var clonedProtoView = util_1.cloneAndQueryProtoView(this._templateCloner, protoView, true);
    var boundElements = clonedProtoView.boundElements;
    if (lang_1.isPresent(inplaceElement)) {
      if (protoView.fragmentsRootNodeCount[0] !== 1) {
        throw new lang_1.BaseException('Root proto views can only contain one element!');
      }
      dom_adapter_1.DOM.clearNodes(inplaceElement);
      var tempRoot = clonedProtoView.fragments[0][0];
      moveChildNodes(tempRoot, inplaceElement);
      if (boundElements.length > 0 && boundElements[0] === tempRoot) {
        boundElements[0] = inplaceElement;
      }
      clonedProtoView.fragments[0][0] = inplaceElement;
    }
    var view = new view_1.DomView(protoView, clonedProtoView.boundTextNodes, boundElements);
    var binders = protoView.elementBinders;
    for (var binderIdx = 0; binderIdx < binders.length; binderIdx++) {
      var binder = binders[binderIdx];
      var element = boundElements[binderIdx];
      if (binder.hasNativeShadowRoot) {
        var shadowRootWrapper = dom_adapter_1.DOM.firstChild(element);
        var shadowRoot = dom_adapter_1.DOM.createShadowRoot(element);
        this._domSharedStylesHost.addHost(shadowRoot);
        moveChildNodes(shadowRootWrapper, shadowRoot);
        dom_adapter_1.DOM.remove(shadowRootWrapper);
      }
      if (lang_1.isPresent(binder.eventLocals) && lang_1.isPresent(binder.localEvents)) {
        for (var i = 0; i < binder.localEvents.length; i++) {
          this._createEventListener(view, element, binderIdx, binder.localEvents[i].name, binder.eventLocals);
        }
      }
    }
    return new api_1.RenderViewWithFragments(new view_1.DomViewRef(view), clonedProtoView.fragments.map(function(nodes) {
      return new fragment_1.DomFragmentRef(nodes);
    }));
  };
  DomRenderer.prototype._createEventListener = function(view, element, elementIndex, eventName, eventLocals) {
    this._eventManager.addEventListener(element, eventName, function(event) {
      view.dispatchEvent(elementIndex, eventName, event);
    });
  };
  DomRenderer.prototype._createGlobalEventListener = function(view, elementIndex, eventName, eventTarget, fullName) {
    return this._eventManager.addGlobalEventListener(eventTarget, eventName, function(event) {
      view.dispatchEvent(elementIndex, fullName, event);
    });
  };
  DomRenderer = __decorate([di_1.Injectable(), __param(3, di_1.Inject(dom_tokens_1.DOCUMENT)), __param(4, di_1.Inject(dom_tokens_1.DOM_REFLECT_PROPERTIES_AS_ATTRIBUTES)), __metadata('design:paramtypes', [event_manager_1.EventManager, shared_styles_host_1.DomSharedStylesHost, template_cloner_1.TemplateCloner, Object, Boolean])], DomRenderer);
  return DomRenderer;
})(api_1.Renderer);
exports.DomRenderer = DomRenderer;
function moveNodesAfterSibling(sibling, nodes) {
  if (nodes.length > 0 && lang_1.isPresent(dom_adapter_1.DOM.parentElement(sibling))) {
    for (var i = 0; i < nodes.length; i++) {
      dom_adapter_1.DOM.insertBefore(sibling, nodes[i]);
    }
    dom_adapter_1.DOM.insertBefore(nodes[nodes.length - 1], sibling);
  }
}
function moveChildNodes(source, target) {
  var currChild = dom_adapter_1.DOM.firstChild(source);
  while (lang_1.isPresent(currChild)) {
    var nextChild = dom_adapter_1.DOM.nextSibling(currChild);
    dom_adapter_1.DOM.appendChild(target, currChild);
    currChild = nextChild;
  }
}

/* */ 
"format cjs";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") return Reflect.decorate(decorators, target, key, desc);
    switch (arguments.length) {
        case 2: return decorators.reduceRight(function(o, d) { return (d && d(o)) || o; }, target);
        case 3: return decorators.reduceRight(function(o, d) { return (d && d(target, key)), void 0; }, void 0);
        case 4: return decorators.reduceRight(function(o, d) { return (d && d(target, key, o)) || o; }, desc);
    }
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Inject, Injectable } from 'angular2/di';
import { isPresent, isBlank, BaseException } from 'angular2/src/facade/lang';
import { DOM } from 'angular2/src/dom/dom_adapter';
import { EventManager } from './events/event_manager';
import { resolveInternalDomProtoView } from './view/proto_view';
import { DomView, DomViewRef, resolveInternalDomView } from './view/view';
import { DomFragmentRef, resolveInternalDomFragment } from './view/fragment';
import { DomSharedStylesHost } from './view/shared_styles_host';
import { cloneAndQueryProtoView, camelCaseToDashCase } from './util';
import { wtfLeave, wtfCreateScope } from '../../profile/profile';
import { Renderer, RenderViewWithFragments } from '../api';
import { TemplateCloner } from './template_cloner';
import { DOCUMENT, DOM_REFLECT_PROPERTIES_AS_ATTRIBUTES } from './dom_tokens';
const REFLECT_PREFIX = 'ng-reflect-';
export let DomRenderer = class extends Renderer {
    constructor(_eventManager, _domSharedStylesHost, _templateCloner, document, reflectPropertiesAsAttributes) {
        super();
        this._eventManager = _eventManager;
        this._domSharedStylesHost = _domSharedStylesHost;
        this._templateCloner = _templateCloner;
        this._scope_createRootHostView = wtfCreateScope('DomRenderer#createRootHostView()');
        this._scope_createView = wtfCreateScope('DomRenderer#createView()');
        this._scope_detachFragment = wtfCreateScope('DomRenderer#detachFragment()');
        this._scope_setEventDispatcher = wtfCreateScope('DomRenderer#setEventDispatcher()');
        this._reflectPropertiesAsAttributes = reflectPropertiesAsAttributes;
        this._document = document;
    }
    createRootHostView(hostProtoViewRef, fragmentCount, hostElementSelector) {
        var s = this._scope_createRootHostView();
        var hostProtoView = resolveInternalDomProtoView(hostProtoViewRef);
        var element = DOM.querySelector(this._document, hostElementSelector);
        if (isBlank(element)) {
            wtfLeave(s);
            throw new BaseException(`The selector "${hostElementSelector}" did not match any elements`);
        }
        return wtfLeave(s, this._createView(hostProtoView, element));
    }
    createView(protoViewRef, fragmentCount) {
        var s = this._scope_createView();
        var protoView = resolveInternalDomProtoView(protoViewRef);
        return wtfLeave(s, this._createView(protoView, null));
    }
    destroyView(viewRef) {
        var view = resolveInternalDomView(viewRef);
        var elementBinders = view.proto.elementBinders;
        for (var i = 0; i < elementBinders.length; i++) {
            var binder = elementBinders[i];
            if (binder.hasNativeShadowRoot) {
                this._domSharedStylesHost.removeHost(DOM.getShadowRoot(view.boundElements[i]));
            }
        }
    }
    getNativeElementSync(location) {
        if (isBlank(location.renderBoundElementIndex)) {
            return null;
        }
        return resolveInternalDomView(location.renderView)
            .boundElements[location.renderBoundElementIndex];
    }
    getRootNodes(fragment) {
        return resolveInternalDomFragment(fragment);
    }
    attachFragmentAfterFragment(previousFragmentRef, fragmentRef) {
        var previousFragmentNodes = resolveInternalDomFragment(previousFragmentRef);
        if (previousFragmentNodes.length > 0) {
            var sibling = previousFragmentNodes[previousFragmentNodes.length - 1];
            moveNodesAfterSibling(sibling, resolveInternalDomFragment(fragmentRef));
        }
    }
    attachFragmentAfterElement(elementRef, fragmentRef) {
        if (isBlank(elementRef.renderBoundElementIndex)) {
            return;
        }
        var parentView = resolveInternalDomView(elementRef.renderView);
        var element = parentView.boundElements[elementRef.renderBoundElementIndex];
        moveNodesAfterSibling(element, resolveInternalDomFragment(fragmentRef));
    }
    detachFragment(fragmentRef) {
        var s = this._scope_detachFragment();
        var fragmentNodes = resolveInternalDomFragment(fragmentRef);
        for (var i = 0; i < fragmentNodes.length; i++) {
            DOM.remove(fragmentNodes[i]);
        }
        wtfLeave(s);
    }
    hydrateView(viewRef) {
        var view = resolveInternalDomView(viewRef);
        if (view.hydrated)
            throw new BaseException('The view is already hydrated.');
        view.hydrated = true;
        // add global events
        view.eventHandlerRemovers = [];
        var binders = view.proto.elementBinders;
        for (var binderIdx = 0; binderIdx < binders.length; binderIdx++) {
            var binder = binders[binderIdx];
            if (isPresent(binder.globalEvents)) {
                for (var i = 0; i < binder.globalEvents.length; i++) {
                    var globalEvent = binder.globalEvents[i];
                    var remover = this._createGlobalEventListener(view, binderIdx, globalEvent.name, globalEvent.target, globalEvent.fullName);
                    view.eventHandlerRemovers.push(remover);
                }
            }
        }
    }
    dehydrateView(viewRef) {
        var view = resolveInternalDomView(viewRef);
        // remove global events
        for (var i = 0; i < view.eventHandlerRemovers.length; i++) {
            view.eventHandlerRemovers[i]();
        }
        view.eventHandlerRemovers = null;
        view.hydrated = false;
    }
    setElementProperty(location, propertyName, propertyValue) {
        if (isBlank(location.renderBoundElementIndex)) {
            return;
        }
        var view = resolveInternalDomView(location.renderView);
        view.setElementProperty(location.renderBoundElementIndex, propertyName, propertyValue);
        // Reflect the property value as an attribute value with ng-reflect- prefix.
        if (this._reflectPropertiesAsAttributes) {
            this.setElementAttribute(location, `${REFLECT_PREFIX}${camelCaseToDashCase(propertyName)}`, `${propertyValue}`);
        }
    }
    setElementAttribute(location, attributeName, attributeValue) {
        if (isBlank(location.renderBoundElementIndex)) {
            return;
        }
        var view = resolveInternalDomView(location.renderView);
        view.setElementAttribute(location.renderBoundElementIndex, attributeName, attributeValue);
    }
    setElementClass(location, className, isAdd) {
        if (isBlank(location.renderBoundElementIndex)) {
            return;
        }
        var view = resolveInternalDomView(location.renderView);
        view.setElementClass(location.renderBoundElementIndex, className, isAdd);
    }
    setElementStyle(location, styleName, styleValue) {
        if (isBlank(location.renderBoundElementIndex)) {
            return;
        }
        var view = resolveInternalDomView(location.renderView);
        view.setElementStyle(location.renderBoundElementIndex, styleName, styleValue);
    }
    invokeElementMethod(location, methodName, args) {
        if (isBlank(location.renderBoundElementIndex)) {
            return;
        }
        var view = resolveInternalDomView(location.renderView);
        view.invokeElementMethod(location.renderBoundElementIndex, methodName, args);
    }
    setText(viewRef, textNodeIndex, text) {
        if (isBlank(textNodeIndex)) {
            return;
        }
        var view = resolveInternalDomView(viewRef);
        DOM.setText(view.boundTextNodes[textNodeIndex], text);
    }
    setEventDispatcher(viewRef, dispatcher /*api.EventDispatcher*/) {
        var s = this._scope_setEventDispatcher();
        var view = resolveInternalDomView(viewRef);
        view.eventDispatcher = dispatcher;
        wtfLeave(s);
    }
    _createView(protoView, inplaceElement) {
        var clonedProtoView = cloneAndQueryProtoView(this._templateCloner, protoView, true);
        var boundElements = clonedProtoView.boundElements;
        // adopt inplaceElement
        if (isPresent(inplaceElement)) {
            if (protoView.fragmentsRootNodeCount[0] !== 1) {
                throw new BaseException('Root proto views can only contain one element!');
            }
            DOM.clearNodes(inplaceElement);
            var tempRoot = clonedProtoView.fragments[0][0];
            moveChildNodes(tempRoot, inplaceElement);
            if (boundElements.length > 0 && boundElements[0] === tempRoot) {
                boundElements[0] = inplaceElement;
            }
            clonedProtoView.fragments[0][0] = inplaceElement;
        }
        var view = new DomView(protoView, clonedProtoView.boundTextNodes, boundElements);
        var binders = protoView.elementBinders;
        for (var binderIdx = 0; binderIdx < binders.length; binderIdx++) {
            var binder = binders[binderIdx];
            var element = boundElements[binderIdx];
            // native shadow DOM
            if (binder.hasNativeShadowRoot) {
                var shadowRootWrapper = DOM.firstChild(element);
                var shadowRoot = DOM.createShadowRoot(element);
                this._domSharedStylesHost.addHost(shadowRoot);
                moveChildNodes(shadowRootWrapper, shadowRoot);
                DOM.remove(shadowRootWrapper);
            }
            // events
            if (isPresent(binder.eventLocals) && isPresent(binder.localEvents)) {
                for (var i = 0; i < binder.localEvents.length; i++) {
                    this._createEventListener(view, element, binderIdx, binder.localEvents[i].name, binder.eventLocals);
                }
            }
        }
        return new RenderViewWithFragments(new DomViewRef(view), clonedProtoView.fragments.map(nodes => new DomFragmentRef(nodes)));
    }
    _createEventListener(view, element, elementIndex, eventName, eventLocals) {
        this._eventManager.addEventListener(element, eventName, (event) => { view.dispatchEvent(elementIndex, eventName, event); });
    }
    _createGlobalEventListener(view, elementIndex, eventName, eventTarget, fullName) {
        return this._eventManager.addGlobalEventListener(eventTarget, eventName, (event) => { view.dispatchEvent(elementIndex, fullName, event); });
    }
};
DomRenderer = __decorate([
    Injectable(),
    __param(3, Inject(DOCUMENT)),
    __param(4, Inject(DOM_REFLECT_PROPERTIES_AS_ATTRIBUTES)), 
    __metadata('design:paramtypes', [EventManager, DomSharedStylesHost, TemplateCloner, Object, Boolean])
], DomRenderer);
function moveNodesAfterSibling(sibling, nodes) {
    if (nodes.length > 0 && isPresent(DOM.parentElement(sibling))) {
        for (var i = 0; i < nodes.length; i++) {
            DOM.insertBefore(sibling, nodes[i]);
        }
        DOM.insertBefore(nodes[nodes.length - 1], sibling);
    }
}
function moveChildNodes(source, target) {
    var currChild = DOM.firstChild(source);
    while (isPresent(currChild)) {
        var nextChild = DOM.nextSibling(currChild);
        DOM.appendChild(target, currChild);
        currChild = nextChild;
    }
}
//# sourceMappingURL=dom_renderer.js.map
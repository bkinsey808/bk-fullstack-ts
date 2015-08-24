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
var di_1 = require("../../../di");
var collection_1 = require("../../facade/collection");
var eli = require("./element_injector");
var lang_1 = require("../../facade/lang");
var viewModule = require("./view");
var view_ref_1 = require("./view_ref");
var element_ref_1 = require("./element_ref");
var template_ref_1 = require("./template_ref");
var pipes_1 = require("../pipes/pipes");
var api_1 = require("../../render/api");
var AppViewManagerUtils = (function() {
  function AppViewManagerUtils() {}
  AppViewManagerUtils.prototype.getComponentInstance = function(parentView, boundElementIndex) {
    var eli = parentView.elementInjectors[boundElementIndex];
    return eli.getComponent();
  };
  AppViewManagerUtils.prototype.createView = function(mergedParentViewProto, renderViewWithFragments, viewManager, renderer) {
    var renderFragments = renderViewWithFragments.fragmentRefs;
    var renderView = renderViewWithFragments.viewRef;
    var elementCount = mergedParentViewProto.mergeMapping.renderElementIndices.length;
    var viewCount = mergedParentViewProto.mergeMapping.nestedViewCountByViewIndex[0] + 1;
    var elementRefs = collection_1.ListWrapper.createFixedSize(elementCount);
    var viewContainers = collection_1.ListWrapper.createFixedSize(elementCount);
    var preBuiltObjects = collection_1.ListWrapper.createFixedSize(elementCount);
    var elementInjectors = collection_1.ListWrapper.createFixedSize(elementCount);
    var views = collection_1.ListWrapper.createFixedSize(viewCount);
    var elementOffset = 0;
    var textOffset = 0;
    var fragmentIdx = 0;
    for (var viewOffset = 0; viewOffset < viewCount; viewOffset++) {
      var hostElementIndex = mergedParentViewProto.mergeMapping.hostElementIndicesByViewIndex[viewOffset];
      var parentView = lang_1.isPresent(hostElementIndex) ? view_ref_1.internalView(elementRefs[hostElementIndex].parentView) : null;
      var protoView = lang_1.isPresent(hostElementIndex) ? parentView.proto.elementBinders[hostElementIndex - parentView.elementOffset].nestedProtoView : mergedParentViewProto;
      var renderFragment = null;
      if (viewOffset === 0 || protoView.type === api_1.ViewType.EMBEDDED) {
        renderFragment = renderFragments[fragmentIdx++];
      }
      var currentView = new viewModule.AppView(renderer, protoView, mergedParentViewProto.mergeMapping, viewOffset, elementOffset, textOffset, protoView.protoLocals, renderView, renderFragment);
      views[viewOffset] = currentView;
      var rootElementInjectors = [];
      for (var binderIdx = 0; binderIdx < protoView.elementBinders.length; binderIdx++) {
        var binder = protoView.elementBinders[binderIdx];
        var boundElementIndex = elementOffset + binderIdx;
        var elementInjector = null;
        var protoElementInjector = binder.protoElementInjector;
        if (lang_1.isPresent(protoElementInjector)) {
          if (lang_1.isPresent(protoElementInjector.parent)) {
            var parentElementInjector = elementInjectors[elementOffset + protoElementInjector.parent.index];
            elementInjector = protoElementInjector.instantiate(parentElementInjector);
          } else {
            elementInjector = protoElementInjector.instantiate(null);
            rootElementInjectors.push(elementInjector);
          }
        }
        elementInjectors[boundElementIndex] = elementInjector;
        var el = new element_ref_1.ElementRef(currentView.ref, boundElementIndex, mergedParentViewProto.mergeMapping.renderElementIndices[boundElementIndex], renderer);
        elementRefs[el.boundElementIndex] = el;
        if (lang_1.isPresent(elementInjector)) {
          var templateRef = binder.hasEmbeddedProtoView() ? new template_ref_1.TemplateRef(el) : null;
          preBuiltObjects[boundElementIndex] = new eli.PreBuiltObjects(viewManager, currentView, el, templateRef);
        }
      }
      currentView.init(protoView.protoChangeDetector.instantiate(currentView), elementInjectors, rootElementInjectors, preBuiltObjects, views, elementRefs, viewContainers);
      if (lang_1.isPresent(parentView) && protoView.type === api_1.ViewType.COMPONENT) {
        parentView.changeDetector.addShadowDomChild(currentView.changeDetector);
      }
      elementOffset += protoView.elementBinders.length;
      textOffset += protoView.textBindingCount;
    }
    return views[0];
  };
  AppViewManagerUtils.prototype.hydrateRootHostView = function(hostView, injector) {
    this._hydrateView(hostView, injector, null, new Object(), null);
  };
  AppViewManagerUtils.prototype.attachViewInContainer = function(parentView, boundElementIndex, contextView, contextBoundElementIndex, atIndex, view) {
    if (lang_1.isBlank(contextView)) {
      contextView = parentView;
      contextBoundElementIndex = boundElementIndex;
    }
    parentView.changeDetector.addChild(view.changeDetector);
    var viewContainer = parentView.viewContainers[boundElementIndex];
    if (lang_1.isBlank(viewContainer)) {
      viewContainer = new viewModule.AppViewContainer();
      parentView.viewContainers[boundElementIndex] = viewContainer;
    }
    collection_1.ListWrapper.insert(viewContainer.views, atIndex, view);
    var elementInjector = contextView.elementInjectors[contextBoundElementIndex];
    var sibling;
    if (atIndex == 0) {
      sibling = elementInjector;
    } else {
      sibling = collection_1.ListWrapper.last(viewContainer.views[atIndex - 1].rootElementInjectors);
    }
    for (var i = view.rootElementInjectors.length - 1; i >= 0; i--) {
      if (lang_1.isPresent(elementInjector.parent)) {
        view.rootElementInjectors[i].linkAfter(elementInjector.parent, sibling);
      } else {
        contextView.rootElementInjectors.push(view.rootElementInjectors[i]);
      }
    }
  };
  AppViewManagerUtils.prototype.detachViewInContainer = function(parentView, boundElementIndex, atIndex) {
    var viewContainer = parentView.viewContainers[boundElementIndex];
    var view = viewContainer.views[atIndex];
    view.changeDetector.remove();
    collection_1.ListWrapper.removeAt(viewContainer.views, atIndex);
    for (var i = 0; i < view.rootElementInjectors.length; ++i) {
      var inj = view.rootElementInjectors[i];
      if (lang_1.isPresent(inj.parent)) {
        inj.unlink();
      } else {
        var removeIdx = collection_1.ListWrapper.indexOf(parentView.rootElementInjectors, inj);
        if (removeIdx >= 0) {
          collection_1.ListWrapper.removeAt(parentView.rootElementInjectors, removeIdx);
        }
      }
    }
  };
  AppViewManagerUtils.prototype.hydrateViewInContainer = function(parentView, boundElementIndex, contextView, contextBoundElementIndex, atIndex, imperativelyCreatedBindings) {
    if (lang_1.isBlank(contextView)) {
      contextView = parentView;
      contextBoundElementIndex = boundElementIndex;
    }
    var viewContainer = parentView.viewContainers[boundElementIndex];
    var view = viewContainer.views[atIndex];
    var elementInjector = contextView.elementInjectors[contextBoundElementIndex];
    var injector = lang_1.isPresent(imperativelyCreatedBindings) ? di_1.Injector.fromResolvedBindings(imperativelyCreatedBindings) : null;
    this._hydrateView(view, injector, elementInjector.getHost(), contextView.context, contextView.locals);
  };
  AppViewManagerUtils.prototype._hydrateView = function(initView, imperativelyCreatedInjector, hostElementInjector, context, parentLocals) {
    var viewIdx = initView.viewOffset;
    var endViewOffset = viewIdx + initView.mainMergeMapping.nestedViewCountByViewIndex[viewIdx];
    while (viewIdx <= endViewOffset) {
      var currView = initView.views[viewIdx];
      var currProtoView = currView.proto;
      if (currView !== initView && currView.proto.type === api_1.ViewType.EMBEDDED) {
        viewIdx += initView.mainMergeMapping.nestedViewCountByViewIndex[viewIdx] + 1;
      } else {
        if (currView !== initView) {
          imperativelyCreatedInjector = null;
          parentLocals = null;
          var hostElementIndex = initView.mainMergeMapping.hostElementIndicesByViewIndex[viewIdx];
          hostElementInjector = initView.elementInjectors[hostElementIndex];
          context = hostElementInjector.getComponent();
        }
        currView.context = context;
        currView.locals.parent = parentLocals;
        var binders = currProtoView.elementBinders;
        for (var binderIdx = 0; binderIdx < binders.length; binderIdx++) {
          var boundElementIndex = binderIdx + currView.elementOffset;
          var elementInjector = initView.elementInjectors[boundElementIndex];
          if (lang_1.isPresent(elementInjector)) {
            elementInjector.hydrate(imperativelyCreatedInjector, hostElementInjector, currView.preBuiltObjects[boundElementIndex]);
            this._populateViewLocals(currView, elementInjector, boundElementIndex);
            this._setUpEventEmitters(currView, elementInjector, boundElementIndex);
            this._setUpHostActions(currView, elementInjector, boundElementIndex);
          }
        }
        var pipes = lang_1.isPresent(hostElementInjector) ? new pipes_1.Pipes(currView.proto.pipes, hostElementInjector.getInjector()) : null;
        currView.changeDetector.hydrate(currView.context, currView.locals, currView, pipes);
        viewIdx++;
      }
    }
  };
  AppViewManagerUtils.prototype._populateViewLocals = function(view, elementInjector, boundElementIdx) {
    if (lang_1.isPresent(elementInjector.getDirectiveVariableBindings())) {
      collection_1.MapWrapper.forEach(elementInjector.getDirectiveVariableBindings(), function(directiveIndex, name) {
        if (lang_1.isBlank(directiveIndex)) {
          view.locals.set(name, view.elementRefs[boundElementIdx].nativeElement);
        } else {
          view.locals.set(name, elementInjector.getDirectiveAtIndex(directiveIndex));
        }
      });
    }
  };
  AppViewManagerUtils.prototype._setUpEventEmitters = function(view, elementInjector, boundElementIndex) {
    var emitters = elementInjector.getEventEmitterAccessors();
    for (var directiveIndex = 0; directiveIndex < emitters.length; ++directiveIndex) {
      var directiveEmitters = emitters[directiveIndex];
      var directive = elementInjector.getDirectiveAtIndex(directiveIndex);
      for (var eventIndex = 0; eventIndex < directiveEmitters.length; ++eventIndex) {
        var eventEmitterAccessor = directiveEmitters[eventIndex];
        eventEmitterAccessor.subscribe(view, boundElementIndex, directive);
      }
    }
  };
  AppViewManagerUtils.prototype._setUpHostActions = function(view, elementInjector, boundElementIndex) {
    var hostActions = elementInjector.getHostActionAccessors();
    for (var directiveIndex = 0; directiveIndex < hostActions.length; ++directiveIndex) {
      var directiveHostActions = hostActions[directiveIndex];
      var directive = elementInjector.getDirectiveAtIndex(directiveIndex);
      for (var index = 0; index < directiveHostActions.length; ++index) {
        var hostActionAccessor = directiveHostActions[index];
        hostActionAccessor.subscribe(view, boundElementIndex, directive);
      }
    }
  };
  AppViewManagerUtils.prototype.dehydrateView = function(initView) {
    var endViewOffset = initView.viewOffset + initView.mainMergeMapping.nestedViewCountByViewIndex[initView.viewOffset];
    for (var viewIdx = initView.viewOffset; viewIdx <= endViewOffset; viewIdx++) {
      var currView = initView.views[viewIdx];
      if (currView.hydrated()) {
        if (lang_1.isPresent(currView.locals)) {
          currView.locals.clearValues();
        }
        currView.context = null;
        currView.changeDetector.dehydrate();
        var binders = currView.proto.elementBinders;
        for (var binderIdx = 0; binderIdx < binders.length; binderIdx++) {
          var eli = initView.elementInjectors[currView.elementOffset + binderIdx];
          if (lang_1.isPresent(eli)) {
            eli.dehydrate();
          }
        }
      }
    }
  };
  AppViewManagerUtils = __decorate([di_1.Injectable(), __metadata('design:paramtypes', [])], AppViewManagerUtils);
  return AppViewManagerUtils;
})();
exports.AppViewManagerUtils = AppViewManagerUtils;

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
var collection_1 = require("../../facade/collection");
var change_detection_1 = require("../../change_detection/change_detection");
var interfaces_1 = require("../../change_detection/interfaces");
var element_binder_1 = require("./element_binder");
var lang_1 = require("../../facade/lang");
var view_ref_1 = require("./view_ref");
var interfaces_2 = require("../../change_detection/interfaces");
exports.DebugContext = interfaces_2.DebugContext;
var AppProtoViewMergeMapping = (function() {
  function AppProtoViewMergeMapping(renderProtoViewMergeMapping) {
    this.renderProtoViewRef = renderProtoViewMergeMapping.mergedProtoViewRef;
    this.renderFragmentCount = renderProtoViewMergeMapping.fragmentCount;
    this.renderElementIndices = renderProtoViewMergeMapping.mappedElementIndices;
    this.renderInverseElementIndices = inverseIndexMapping(this.renderElementIndices, renderProtoViewMergeMapping.mappedElementCount);
    this.renderTextIndices = renderProtoViewMergeMapping.mappedTextIndices;
    this.hostElementIndicesByViewIndex = renderProtoViewMergeMapping.hostElementIndicesByViewIndex;
    this.nestedViewIndicesByElementIndex = inverseIndexMapping(this.hostElementIndicesByViewIndex, this.renderElementIndices.length);
    this.nestedViewCountByViewIndex = renderProtoViewMergeMapping.nestedViewCountByViewIndex;
  }
  return AppProtoViewMergeMapping;
})();
exports.AppProtoViewMergeMapping = AppProtoViewMergeMapping;
function inverseIndexMapping(input, resultLength) {
  var result = collection_1.ListWrapper.createGrowableSize(resultLength);
  for (var i = 0; i < input.length; i++) {
    var value = input[i];
    if (lang_1.isPresent(value)) {
      result[input[i]] = i;
    }
  }
  return result;
}
var AppViewContainer = (function() {
  function AppViewContainer() {
    this.views = [];
  }
  return AppViewContainer;
})();
exports.AppViewContainer = AppViewContainer;
var AppView = (function() {
  function AppView(renderer, proto, mainMergeMapping, viewOffset, elementOffset, textOffset, protoLocals, render, renderFragment) {
    this.renderer = renderer;
    this.proto = proto;
    this.mainMergeMapping = mainMergeMapping;
    this.viewOffset = viewOffset;
    this.elementOffset = elementOffset;
    this.textOffset = textOffset;
    this.render = render;
    this.renderFragment = renderFragment;
    this.views = null;
    this.elementInjectors = null;
    this.viewContainers = null;
    this.preBuiltObjects = null;
    this.changeDetector = null;
    this.context = null;
    this.ref = new view_ref_1.ViewRef(this);
    this.locals = new change_detection_1.Locals(null, collection_1.MapWrapper.clone(protoLocals));
  }
  AppView.prototype.init = function(changeDetector, elementInjectors, rootElementInjectors, preBuiltObjects, views, elementRefs, viewContainers) {
    this.changeDetector = changeDetector;
    this.elementInjectors = elementInjectors;
    this.rootElementInjectors = rootElementInjectors;
    this.preBuiltObjects = preBuiltObjects;
    this.views = views;
    this.elementRefs = elementRefs;
    this.viewContainers = viewContainers;
  };
  AppView.prototype.setLocal = function(contextName, value) {
    if (!this.hydrated())
      throw new lang_1.BaseException('Cannot set locals on dehydrated view.');
    if (!this.proto.variableBindings.has(contextName)) {
      return;
    }
    var templateName = this.proto.variableBindings.get(contextName);
    this.locals.set(templateName, value);
  };
  AppView.prototype.hydrated = function() {
    return lang_1.isPresent(this.context);
  };
  AppView.prototype.triggerEventHandlers = function(eventName, eventObj, boundElementIndex) {
    var locals = new collection_1.Map();
    locals.set('$event', eventObj);
    this.dispatchEvent(boundElementIndex, eventName, locals);
  };
  AppView.prototype.notifyOnBinding = function(b, currentValue) {
    if (b.isTextNode()) {
      this.renderer.setText(this.render, this.mainMergeMapping.renderTextIndices[b.elementIndex + this.textOffset], currentValue);
    } else {
      var elementRef = this.elementRefs[this.elementOffset + b.elementIndex];
      if (b.isElementProperty()) {
        this.renderer.setElementProperty(elementRef, b.propertyName, currentValue);
      } else if (b.isElementAttribute()) {
        this.renderer.setElementAttribute(elementRef, b.propertyName, currentValue);
      } else if (b.isElementClass()) {
        this.renderer.setElementClass(elementRef, b.propertyName, currentValue);
      } else if (b.isElementStyle()) {
        var unit = lang_1.isPresent(b.propertyUnit) ? b.propertyUnit : '';
        this.renderer.setElementStyle(elementRef, b.propertyName, "" + currentValue + unit);
      } else {
        throw new lang_1.BaseException('Unsupported directive record');
      }
    }
  };
  AppView.prototype.notifyOnAllChangesDone = function() {
    var eiCount = this.proto.elementBinders.length;
    var ei = this.elementInjectors;
    for (var i = eiCount - 1; i >= 0; i--) {
      if (lang_1.isPresent(ei[i + this.elementOffset]))
        ei[i + this.elementOffset].onAllChangesDone();
    }
  };
  AppView.prototype.getDirectiveFor = function(directive) {
    var elementInjector = this.elementInjectors[this.elementOffset + directive.elementIndex];
    return elementInjector.getDirectiveAtIndex(directive.directiveIndex);
  };
  AppView.prototype.getNestedView = function(boundElementIndex) {
    var viewIndex = this.mainMergeMapping.nestedViewIndicesByElementIndex[boundElementIndex];
    return lang_1.isPresent(viewIndex) ? this.views[viewIndex] : null;
  };
  AppView.prototype.getHostElement = function() {
    var boundElementIndex = this.mainMergeMapping.hostElementIndicesByViewIndex[this.viewOffset];
    return lang_1.isPresent(boundElementIndex) ? this.elementRefs[boundElementIndex] : null;
  };
  AppView.prototype.getDebugContext = function(elementIndex, directiveIndex) {
    try {
      var offsettedIndex = this.elementOffset + elementIndex;
      var hasRefForIndex = offsettedIndex < this.elementRefs.length;
      var elementRef = hasRefForIndex ? this.elementRefs[this.elementOffset + elementIndex] : null;
      var host = this.getHostElement();
      var ei = hasRefForIndex ? this.elementInjectors[this.elementOffset + elementIndex] : null;
      var element = lang_1.isPresent(elementRef) ? elementRef.nativeElement : null;
      var componentElement = lang_1.isPresent(host) ? host.nativeElement : null;
      var directive = lang_1.isPresent(directiveIndex) ? this.getDirectiveFor(directiveIndex) : null;
      var injector = lang_1.isPresent(ei) ? ei.getInjector() : null;
      return new interfaces_1.DebugContext(element, componentElement, directive, this.context, _localsToStringMap(this.locals), injector);
    } catch (e) {
      return null;
    }
  };
  AppView.prototype.getDetectorFor = function(directive) {
    var childView = this.getNestedView(this.elementOffset + directive.elementIndex);
    return lang_1.isPresent(childView) ? childView.changeDetector : null;
  };
  AppView.prototype.invokeElementMethod = function(elementIndex, methodName, args) {
    this.renderer.invokeElementMethod(this.elementRefs[elementIndex], methodName, args);
  };
  AppView.prototype.dispatchRenderEvent = function(renderElementIndex, eventName, locals) {
    var elementRef = this.elementRefs[this.mainMergeMapping.renderInverseElementIndices[renderElementIndex]];
    var view = view_ref_1.internalView(elementRef.parentView);
    return view.dispatchEvent(elementRef.boundElementIndex, eventName, locals);
  };
  AppView.prototype.dispatchEvent = function(boundElementIndex, eventName, locals) {
    try {
      if (this.hydrated()) {
        return !this.changeDetector.handleEvent(eventName, boundElementIndex - this.elementOffset, new change_detection_1.Locals(this.locals, locals));
      } else {
        return true;
      }
    } catch (e) {
      var c = this.getDebugContext(boundElementIndex - this.elementOffset, null);
      var context = lang_1.isPresent(c) ? new _Context(c.element, c.componentElement, c.context, c.locals, c.injector) : null;
      throw new EventEvaluationError(eventName, e, e.stack, context);
    }
  };
  return AppView;
})();
exports.AppView = AppView;
function _localsToStringMap(locals) {
  var res = {};
  var c = locals;
  while (lang_1.isPresent(c)) {
    res = collection_1.StringMapWrapper.merge(res, collection_1.MapWrapper.toStringMap(c.current));
    c = c.parent;
  }
  return res;
}
var _Context = (function() {
  function _Context(element, componentElement, context, locals, injector) {
    this.element = element;
    this.componentElement = componentElement;
    this.context = context;
    this.locals = locals;
    this.injector = injector;
  }
  return _Context;
})();
var EventEvaluationError = (function(_super) {
  __extends(EventEvaluationError, _super);
  function EventEvaluationError(eventName, originalException, originalStack, context) {
    _super.call(this, "Error during evaluation of \"" + eventName + "\"", originalException, originalStack, context);
  }
  return EventEvaluationError;
})(lang_1.BaseException);
var AppProtoView = (function() {
  function AppProtoView(type, isEmbeddedFragment, render, protoChangeDetector, variableBindings, variableLocations, textBindingCount, pipes) {
    var _this = this;
    this.type = type;
    this.isEmbeddedFragment = isEmbeddedFragment;
    this.render = render;
    this.protoChangeDetector = protoChangeDetector;
    this.variableBindings = variableBindings;
    this.variableLocations = variableLocations;
    this.textBindingCount = textBindingCount;
    this.pipes = pipes;
    this.elementBinders = [];
    this.protoLocals = new collection_1.Map();
    this.ref = new view_ref_1.ProtoViewRef(this);
    if (lang_1.isPresent(variableBindings)) {
      collection_1.MapWrapper.forEach(variableBindings, function(templateName, _) {
        _this.protoLocals.set(templateName, null);
      });
    }
  }
  AppProtoView.prototype.bindElement = function(parent, distanceToParent, protoElementInjector, componentDirective) {
    if (componentDirective === void 0) {
      componentDirective = null;
    }
    var elBinder = new element_binder_1.ElementBinder(this.elementBinders.length, parent, distanceToParent, protoElementInjector, componentDirective);
    this.elementBinders.push(elBinder);
    return elBinder;
  };
  return AppProtoView;
})();
exports.AppProtoView = AppProtoView;

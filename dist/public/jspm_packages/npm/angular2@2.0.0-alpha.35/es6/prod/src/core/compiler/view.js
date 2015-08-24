/* */ 
"format cjs";
import { ListWrapper, MapWrapper, Map, StringMapWrapper } from 'angular2/src/facade/collection';
import { Locals } from 'angular2/src/change_detection/change_detection';
import { DebugContext } from 'angular2/src/change_detection/interfaces';
import { ElementBinder } from './element_binder';
import { isPresent, BaseException } from 'angular2/src/facade/lang';
import { ViewRef, ProtoViewRef, internalView } from './view_ref';
export { DebugContext } from 'angular2/src/change_detection/interfaces';
export class AppProtoViewMergeMapping {
    constructor(renderProtoViewMergeMapping) {
        this.renderProtoViewRef = renderProtoViewMergeMapping.mergedProtoViewRef;
        this.renderFragmentCount = renderProtoViewMergeMapping.fragmentCount;
        this.renderElementIndices = renderProtoViewMergeMapping.mappedElementIndices;
        this.renderInverseElementIndices = inverseIndexMapping(this.renderElementIndices, renderProtoViewMergeMapping.mappedElementCount);
        this.renderTextIndices = renderProtoViewMergeMapping.mappedTextIndices;
        this.hostElementIndicesByViewIndex = renderProtoViewMergeMapping.hostElementIndicesByViewIndex;
        this.nestedViewIndicesByElementIndex =
            inverseIndexMapping(this.hostElementIndicesByViewIndex, this.renderElementIndices.length);
        this.nestedViewCountByViewIndex = renderProtoViewMergeMapping.nestedViewCountByViewIndex;
    }
}
function inverseIndexMapping(input, resultLength) {
    var result = ListWrapper.createGrowableSize(resultLength);
    for (var i = 0; i < input.length; i++) {
        var value = input[i];
        if (isPresent(value)) {
            result[input[i]] = i;
        }
    }
    return result;
}
export class AppViewContainer {
    constructor() {
        // The order in this list matches the DOM order.
        this.views = [];
    }
}
/**
 * Cost of making objects: http://jsperf.com/instantiate-size-of-object
 *
 */
export class AppView {
    constructor(renderer, proto, mainMergeMapping, viewOffset, elementOffset, textOffset, protoLocals, render, renderFragment) {
        this.renderer = renderer;
        this.proto = proto;
        this.mainMergeMapping = mainMergeMapping;
        this.viewOffset = viewOffset;
        this.elementOffset = elementOffset;
        this.textOffset = textOffset;
        this.render = render;
        this.renderFragment = renderFragment;
        // AppViews that have been merged in depth first order.
        // This list is shared between all merged views. Use this.elementOffset to get the local
        // entries.
        this.views = null;
        // ElementInjectors of all AppViews in views grouped by view.
        // This list is shared between all merged views. Use this.elementOffset to get the local
        // entries.
        this.elementInjectors = null;
        // ViewContainers of all AppViews in views grouped by view.
        // This list is shared between all merged views. Use this.elementOffset to get the local
        // entries.
        this.viewContainers = null;
        // PreBuiltObjects of all AppViews in views grouped by view.
        // This list is shared between all merged views. Use this.elementOffset to get the local
        // entries.
        this.preBuiltObjects = null;
        this.changeDetector = null;
        /**
         * The context against which data-binding expressions in this view are evaluated against.
         * This is always a component instance.
         */
        this.context = null;
        this.ref = new ViewRef(this);
        this.locals = new Locals(null, MapWrapper.clone(protoLocals)); // TODO optimize this
    }
    init(changeDetector, elementInjectors, rootElementInjectors, preBuiltObjects, views, elementRefs, viewContainers) {
        this.changeDetector = changeDetector;
        this.elementInjectors = elementInjectors;
        this.rootElementInjectors = rootElementInjectors;
        this.preBuiltObjects = preBuiltObjects;
        this.views = views;
        this.elementRefs = elementRefs;
        this.viewContainers = viewContainers;
    }
    setLocal(contextName, value) {
        if (!this.hydrated())
            throw new BaseException('Cannot set locals on dehydrated view.');
        if (!this.proto.variableBindings.has(contextName)) {
            return;
        }
        var templateName = this.proto.variableBindings.get(contextName);
        this.locals.set(templateName, value);
    }
    hydrated() { return isPresent(this.context); }
    /**
     * Triggers the event handlers for the element and the directives.
     *
     * This method is intended to be called from directive EventEmitters.
     *
     * @param {string} eventName
     * @param {*} eventObj
     * @param {int} boundElementIndex
     */
    triggerEventHandlers(eventName, eventObj, boundElementIndex) {
        var locals = new Map();
        locals.set('$event', eventObj);
        this.dispatchEvent(boundElementIndex, eventName, locals);
    }
    // dispatch to element injector or text nodes based on context
    notifyOnBinding(b, currentValue) {
        if (b.isTextNode()) {
            this.renderer.setText(this.render, this.mainMergeMapping.renderTextIndices[b.elementIndex + this.textOffset], currentValue);
        }
        else {
            var elementRef = this.elementRefs[this.elementOffset + b.elementIndex];
            if (b.isElementProperty()) {
                this.renderer.setElementProperty(elementRef, b.propertyName, currentValue);
            }
            else if (b.isElementAttribute()) {
                this.renderer.setElementAttribute(elementRef, b.propertyName, currentValue);
            }
            else if (b.isElementClass()) {
                this.renderer.setElementClass(elementRef, b.propertyName, currentValue);
            }
            else if (b.isElementStyle()) {
                var unit = isPresent(b.propertyUnit) ? b.propertyUnit : '';
                this.renderer.setElementStyle(elementRef, b.propertyName, `${currentValue}${unit}`);
            }
            else {
                throw new BaseException('Unsupported directive record');
            }
        }
    }
    notifyOnAllChangesDone() {
        var eiCount = this.proto.elementBinders.length;
        var ei = this.elementInjectors;
        for (var i = eiCount - 1; i >= 0; i--) {
            if (isPresent(ei[i + this.elementOffset]))
                ei[i + this.elementOffset].onAllChangesDone();
        }
    }
    getDirectiveFor(directive) {
        var elementInjector = this.elementInjectors[this.elementOffset + directive.elementIndex];
        return elementInjector.getDirectiveAtIndex(directive.directiveIndex);
    }
    getNestedView(boundElementIndex) {
        var viewIndex = this.mainMergeMapping.nestedViewIndicesByElementIndex[boundElementIndex];
        return isPresent(viewIndex) ? this.views[viewIndex] : null;
    }
    getHostElement() {
        var boundElementIndex = this.mainMergeMapping.hostElementIndicesByViewIndex[this.viewOffset];
        return isPresent(boundElementIndex) ? this.elementRefs[boundElementIndex] : null;
    }
    getDebugContext(elementIndex, directiveIndex) {
        try {
            var offsettedIndex = this.elementOffset + elementIndex;
            var hasRefForIndex = offsettedIndex < this.elementRefs.length;
            var elementRef = hasRefForIndex ? this.elementRefs[this.elementOffset + elementIndex] : null;
            var host = this.getHostElement();
            var ei = hasRefForIndex ? this.elementInjectors[this.elementOffset + elementIndex] : null;
            var element = isPresent(elementRef) ? elementRef.nativeElement : null;
            var componentElement = isPresent(host) ? host.nativeElement : null;
            var directive = isPresent(directiveIndex) ? this.getDirectiveFor(directiveIndex) : null;
            var injector = isPresent(ei) ? ei.getInjector() : null;
            return new DebugContext(element, componentElement, directive, this.context, _localsToStringMap(this.locals), injector);
        }
        catch (e) {
            // TODO: vsavkin log the exception once we have a good way to log errors and warnings
            // if an error happens during getting the debug context, we return an empty map.
            return null;
        }
    }
    getDetectorFor(directive) {
        var childView = this.getNestedView(this.elementOffset + directive.elementIndex);
        return isPresent(childView) ? childView.changeDetector : null;
    }
    invokeElementMethod(elementIndex, methodName, args) {
        this.renderer.invokeElementMethod(this.elementRefs[elementIndex], methodName, args);
    }
    // implementation of RenderEventDispatcher#dispatchRenderEvent
    dispatchRenderEvent(renderElementIndex, eventName, locals) {
        var elementRef = this.elementRefs[this.mainMergeMapping.renderInverseElementIndices[renderElementIndex]];
        var view = internalView(elementRef.parentView);
        return view.dispatchEvent(elementRef.boundElementIndex, eventName, locals);
    }
    // returns false if preventDefault must be applied to the DOM event
    dispatchEvent(boundElementIndex, eventName, locals) {
        try {
            if (this.hydrated()) {
                return !this.changeDetector.handleEvent(eventName, boundElementIndex - this.elementOffset, new Locals(this.locals, locals));
            }
            else {
                return true;
            }
        }
        catch (e) {
            var c = this.getDebugContext(boundElementIndex - this.elementOffset, null);
            var context = isPresent(c) ? new _Context(c.element, c.componentElement, c.context, c.locals, c.injector) :
                null;
            throw new EventEvaluationError(eventName, e, e.stack, context);
        }
    }
}
function _localsToStringMap(locals) {
    var res = {};
    var c = locals;
    while (isPresent(c)) {
        res = StringMapWrapper.merge(res, MapWrapper.toStringMap(c.current));
        c = c.parent;
    }
    return res;
}
/**
 * Error context included when an event handler throws an exception.
 */
class _Context {
    constructor(element, componentElement, context, locals, injector) {
        this.element = element;
        this.componentElement = componentElement;
        this.context = context;
        this.locals = locals;
        this.injector = injector;
    }
}
/**
 * Wraps an exception thrown by an event handler.
 */
class EventEvaluationError extends BaseException {
    constructor(eventName, originalException, originalStack, context) {
        super(`Error during evaluation of "${eventName}"`, originalException, originalStack, context);
    }
}
/**
 *
 */
export class AppProtoView {
    constructor(type, isEmbeddedFragment, render, protoChangeDetector, variableBindings, variableLocations, textBindingCount, pipes) {
        this.type = type;
        this.isEmbeddedFragment = isEmbeddedFragment;
        this.render = render;
        this.protoChangeDetector = protoChangeDetector;
        this.variableBindings = variableBindings;
        this.variableLocations = variableLocations;
        this.textBindingCount = textBindingCount;
        this.pipes = pipes;
        this.elementBinders = [];
        this.protoLocals = new Map();
        this.ref = new ProtoViewRef(this);
        if (isPresent(variableBindings)) {
            MapWrapper.forEach(variableBindings, (templateName, _) => { this.protoLocals.set(templateName, null); });
        }
    }
    bindElement(parent, distanceToParent, protoElementInjector, componentDirective = null) {
        var elBinder = new ElementBinder(this.elementBinders.length, parent, distanceToParent, protoElementInjector, componentDirective);
        this.elementBinders.push(elBinder);
        return elBinder;
    }
}
//# sourceMappingURL=view.js.map
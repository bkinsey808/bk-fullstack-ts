/* */ 
"format cjs";
import { isPresent, isBlank, RegExpWrapper } from 'angular2/src/facade/lang';
import { Map, MapWrapper } from 'angular2/src/facade/collection';
/**
 * General notes:
 *
 * The methods for creating / destroying views in this API are used in the AppViewHydrator
 * and RenderViewHydrator as well.
 *
 * We are already parsing expressions on the render side:
 * - this makes the ElementBinders more compact
 *   (e.g. no need to distinguish interpolations from regular expressions from literals)
 * - allows to retrieve which properties should be accessed from the event
 *   by looking at the expression
 * - we need the parse at least for the `template` attribute to match
 *   directives in it
 * - render compiler is not on the critical path as
 *   its output will be stored in precompiled templates.
 */
export class EventBinding {
    constructor(fullName, source) {
        this.fullName = fullName;
        this.source = source;
    }
}
export var PropertyBindingType;
(function (PropertyBindingType) {
    PropertyBindingType[PropertyBindingType["PROPERTY"] = 0] = "PROPERTY";
    PropertyBindingType[PropertyBindingType["ATTRIBUTE"] = 1] = "ATTRIBUTE";
    PropertyBindingType[PropertyBindingType["CLASS"] = 2] = "CLASS";
    PropertyBindingType[PropertyBindingType["STYLE"] = 3] = "STYLE";
})(PropertyBindingType || (PropertyBindingType = {}));
export class ElementPropertyBinding {
    constructor(type, astWithSource, property, unit = null) {
        this.type = type;
        this.astWithSource = astWithSource;
        this.property = property;
        this.unit = unit;
    }
}
export class RenderElementBinder {
    constructor({ index, parentIndex, distanceToParent, directives, nestedProtoView, propertyBindings, variableBindings, eventBindings, readAttributes } = {}) {
        this.index = index;
        this.parentIndex = parentIndex;
        this.distanceToParent = distanceToParent;
        this.directives = directives;
        this.nestedProtoView = nestedProtoView;
        this.propertyBindings = propertyBindings;
        this.variableBindings = variableBindings;
        this.eventBindings = eventBindings;
        this.readAttributes = readAttributes;
    }
}
export class DirectiveBinder {
    constructor({ directiveIndex, propertyBindings, eventBindings, hostPropertyBindings }) {
        this.directiveIndex = directiveIndex;
        this.propertyBindings = propertyBindings;
        this.eventBindings = eventBindings;
        this.hostPropertyBindings = hostPropertyBindings;
    }
}
export var ViewType;
(function (ViewType) {
    // A view that contains the host element with bound component directive.
    // Contains a COMPONENT view
    ViewType[ViewType["HOST"] = 0] = "HOST";
    // The view of the component
    // Can contain 0 to n EMBEDDED views
    ViewType[ViewType["COMPONENT"] = 1] = "COMPONENT";
    // A view that is embedded into another View via a <template> element
    // inside of a COMPONENT view
    ViewType[ViewType["EMBEDDED"] = 2] = "EMBEDDED";
})(ViewType || (ViewType = {}));
export class ProtoViewDto {
    constructor({ render, elementBinders, variableBindings, type, textBindings, transitiveNgContentCount }) {
        this.render = render;
        this.elementBinders = elementBinders;
        this.variableBindings = variableBindings;
        this.type = type;
        this.textBindings = textBindings;
        this.transitiveNgContentCount = transitiveNgContentCount;
    }
}
export class RenderDirectiveMetadata {
    constructor({ id, selector, compileChildren, events, hostListeners, hostProperties, hostAttributes, hostActions, properties, readAttributes, type, callOnDestroy, callOnChange, callOnCheck, callOnInit, callOnAllChangesDone, changeDetection, exportAs }) {
        this.id = id;
        this.selector = selector;
        this.compileChildren = isPresent(compileChildren) ? compileChildren : true;
        this.events = events;
        this.hostListeners = hostListeners;
        this.hostAttributes = hostAttributes;
        this.hostProperties = hostProperties;
        this.hostActions = hostActions;
        this.properties = properties;
        this.readAttributes = readAttributes;
        this.type = type;
        this.callOnDestroy = callOnDestroy;
        this.callOnChange = callOnChange;
        this.callOnCheck = callOnCheck;
        this.callOnInit = callOnInit;
        this.callOnAllChangesDone = callOnAllChangesDone;
        this.changeDetection = changeDetection;
        this.exportAs = exportAs;
    }
    static get DIRECTIVE_TYPE() { return 0; }
    static get COMPONENT_TYPE() { return 1; }
    static create({ id, selector, compileChildren, events, host, properties, readAttributes, type, callOnDestroy, callOnChange, callOnCheck, callOnInit, callOnAllChangesDone, changeDetection, exportAs }) {
        let hostListeners = new Map();
        let hostProperties = new Map();
        let hostAttributes = new Map();
        let hostActions = new Map();
        if (isPresent(host)) {
            MapWrapper.forEach(host, (value, key) => {
                var matches = RegExpWrapper.firstMatch(RenderDirectiveMetadata._hostRegExp, key);
                if (isBlank(matches)) {
                    hostAttributes.set(key, value);
                }
                else if (isPresent(matches[1])) {
                    hostProperties.set(matches[1], value);
                }
                else if (isPresent(matches[2])) {
                    hostListeners.set(matches[2], value);
                }
                else if (isPresent(matches[3])) {
                    hostActions.set(matches[3], value);
                }
            });
        }
        return new RenderDirectiveMetadata({
            id: id,
            selector: selector,
            compileChildren: compileChildren,
            events: events,
            hostListeners: hostListeners,
            hostProperties: hostProperties,
            hostAttributes: hostAttributes,
            hostActions: hostActions,
            properties: properties,
            readAttributes: readAttributes,
            type: type,
            callOnDestroy: callOnDestroy,
            callOnChange: callOnChange,
            callOnCheck: callOnCheck,
            callOnInit: callOnInit,
            callOnAllChangesDone: callOnAllChangesDone,
            changeDetection: changeDetection,
            exportAs: exportAs
        });
    }
}
// group 1: "property" from "[property]"
// group 2: "event" from "(event)"
// group 3: "action" from "@action"
RenderDirectiveMetadata._hostRegExp = /^(?:(?:\[([^\]]+)\])|(?:\(([^\)]+)\))|(?:@(.+)))$/g;
// An opaque reference to a render proto ivew
export class RenderProtoViewRef {
}
// An opaque reference to a part of a view
export class RenderFragmentRef {
}
// An opaque reference to a view
export class RenderViewRef {
}
/**
 * How the template and styles of a view should be encapsulated.
 */
export var ViewEncapsulation;
(function (ViewEncapsulation) {
    /**
     * Emulate scoping of styles by preprocessing the style rules
     * and adding additional attributes to elements. This is the default.
     */
    ViewEncapsulation[ViewEncapsulation["EMULATED"] = 0] = "EMULATED";
    /**
     * Uses the native mechanism of the renderer. For the DOM this means creating a ShadowRoot.
     */
    ViewEncapsulation[ViewEncapsulation["NATIVE"] = 1] = "NATIVE";
    /**
     * Don't scope the template nor the styles.
     */
    ViewEncapsulation[ViewEncapsulation["NONE"] = 2] = "NONE";
})(ViewEncapsulation || (ViewEncapsulation = {}));
export class ViewDefinition {
    constructor({ componentId, templateAbsUrl, template, styleAbsUrls, styles, directives, encapsulation } = {}) {
        this.componentId = componentId;
        this.templateAbsUrl = templateAbsUrl;
        this.template = template;
        this.styleAbsUrls = styleAbsUrls;
        this.styles = styles;
        this.directives = directives;
        this.encapsulation = isPresent(encapsulation) ? encapsulation : ViewEncapsulation.EMULATED;
    }
}
export class RenderProtoViewMergeMapping {
    constructor(mergedProtoViewRef, 
        // Number of fragments in the merged ProtoView.
        // Fragments are stored in depth first order of nested ProtoViews.
        fragmentCount, 
        // Mapping from app element index to render element index.
        // Mappings of nested ProtoViews are in depth first order, with all
        // indices for one ProtoView in a consecuitve block.
        mappedElementIndices, 
        // Number of bound render element.
        // Note: This could be more than the original ones
        // as we might have bound a new element for projecting bound text nodes.
        mappedElementCount, 
        // Mapping from app text index to render text index.
        // Mappings of nested ProtoViews are in depth first order, with all
        // indices for one ProtoView in a consecuitve block.
        mappedTextIndices, 
        // Mapping from view index to app element index
        hostElementIndicesByViewIndex, 
        // Number of contained views by view index
        nestedViewCountByViewIndex) {
        this.mergedProtoViewRef = mergedProtoViewRef;
        this.fragmentCount = fragmentCount;
        this.mappedElementIndices = mappedElementIndices;
        this.mappedElementCount = mappedElementCount;
        this.mappedTextIndices = mappedTextIndices;
        this.hostElementIndicesByViewIndex = hostElementIndicesByViewIndex;
        this.nestedViewCountByViewIndex = nestedViewCountByViewIndex;
    }
}
export class RenderCompiler {
    /**
     * Creats a ProtoViewDto that contains a single nested component with the given componentId.
     */
    compileHost(directiveMetadata) { return null; }
    /**
     * Compiles a single DomProtoView. Non recursive so that
     * we don't need to serialize all possible components over the wire,
     * but only the needed ones based on previous calls.
     */
    compile(view) { return null; }
    /**
     * Merges ProtoViews.
     * The first entry of the array is the protoview into which all the other entries of the array
     * should be merged.
     * If the array contains other arrays, they will be merged before processing the parent array.
     * The array must contain an entry for every component and embedded ProtoView of the first entry.
     * @param protoViewRefs List of ProtoViewRefs or nested
     * @return the merge result
     */
    mergeProtoViewsRecursively(protoViewRefs) {
        return null;
    }
}
export class RenderViewWithFragments {
    constructor(viewRef, fragmentRefs) {
        this.viewRef = viewRef;
        this.fragmentRefs = fragmentRefs;
    }
}
export class Renderer {
    /**
     * Creates a root host view that includes the given element.
     * Note that the fragmentCount needs to be passed in so that we can create a result
     * synchronously even when dealing with webworkers!
     *
     * @param {RenderProtoViewRef} hostProtoViewRef a RenderProtoViewRef of type
     * ProtoViewDto.HOST_VIEW_TYPE
     * @param {any} hostElementSelector css selector for the host element (will be queried against the
     * main document)
     * @return {RenderViewWithFragments} the created view including fragments
     */
    createRootHostView(hostProtoViewRef, fragmentCount, hostElementSelector) {
        return null;
    }
    /**
     * Creates a regular view out of the given ProtoView.
     * Note that the fragmentCount needs to be passed in so that we can create a result
     * synchronously even when dealing with webworkers!
     */
    createView(protoViewRef, fragmentCount) {
        return null;
    }
    /**
     * Destroys the given view after it has been dehydrated and detached
     */
    destroyView(viewRef) { }
    /**
     * Attaches a fragment after another fragment.
     */
    attachFragmentAfterFragment(previousFragmentRef, fragmentRef) { }
    /**
     * Attaches a fragment after an element.
     */
    attachFragmentAfterElement(elementRef, fragmentRef) { }
    /**
     * Detaches a fragment.
     */
    detachFragment(fragmentRef) { }
    /**
     * Hydrates a view after it has been attached. Hydration/dehydration is used for reusing views
     * inside of the view pool.
     */
    hydrateView(viewRef) { }
    /**
     * Dehydrates a view after it has been attached. Hydration/dehydration is used for reusing views
     * inside of the view pool.
     */
    dehydrateView(viewRef) { }
    /**
     * Returns the native element at the given location.
     * Attention: In a WebWorker scenario, this should always return null!
     */
    getNativeElementSync(location) { return null; }
    /**
     * Sets a property on an element.
     */
    setElementProperty(location, propertyName, propertyValue) { }
    /**
     * Sets an attribute on an element.
     */
    setElementAttribute(location, attributeName, attributeValue) { }
    /**
     * Sets a class on an element.
     */
    setElementClass(location, className, isAdd) { }
    /**
     * Sets a style on an element.
     */
    setElementStyle(location, styleName, styleValue) { }
    /**
     * Calls a method on an element.
     */
    invokeElementMethod(location, methodName, args) { }
    /**
     * Sets the value of a text node.
     */
    setText(viewRef, textNodeIndex, text) { }
    /**
     * Sets the dispatcher for all events of the given view
     */
    setEventDispatcher(viewRef, dispatcher) { }
}
//# sourceMappingURL=api.js.map
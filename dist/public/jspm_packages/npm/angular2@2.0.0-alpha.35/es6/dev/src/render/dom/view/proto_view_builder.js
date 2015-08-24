/* */ 
"format cjs";
import { isPresent, isBlank, BaseException, StringWrapper } from 'angular2/src/facade/lang';
import { ListWrapper, MapWrapper, Set, SetWrapper } from 'angular2/src/facade/collection';
import { DOM } from 'angular2/src/dom/dom_adapter';
import { ASTWithSource, AstTransformer, PropertyRead, LiteralArray, ImplicitReceiver } from 'angular2/src/change_detection/change_detection';
import { DomProtoView, DomProtoViewRef } from './proto_view';
import { DomElementBinder, Event } from './element_binder';
import { ViewType, ViewEncapsulation, ProtoViewDto, DirectiveBinder, RenderElementBinder, EventBinding, ElementPropertyBinding, PropertyBindingType } from '../../api';
import { NG_BINDING_CLASS, EVENT_TARGET_SEPARATOR, queryBoundTextNodeIndices, camelCaseToDashCase } from '../util';
export class ProtoViewBuilder {
    constructor(rootElement, type, viewEncapsulation) {
        this.rootElement = rootElement;
        this.type = type;
        this.viewEncapsulation = viewEncapsulation;
        this.variableBindings = new Map();
        this.elements = [];
        this.rootTextBindings = new Map();
        this.ngContentCount = 0;
        this.hostAttributes = new Map();
    }
    bindElement(element, description = null) {
        var builder = new ElementBinderBuilder(this.elements.length, element, description);
        this.elements.push(builder);
        DOM.addClass(element, NG_BINDING_CLASS);
        return builder;
    }
    bindVariable(name, value) {
        // Store the variable map from value to variable, reflecting how it will be used later by
        // DomView. When a local is set to the view, a lookup for the variable name will take place
        // keyed
        // by the "value", or exported identifier. For example, ng-for sets a view local of "index".
        // When this occurs, a lookup keyed by "index" must occur to find if there is a var referencing
        // it.
        this.variableBindings.set(value, name);
    }
    // Note: We don't store the node index until the compilation is complete,
    // as the compiler might change the order of elements.
    bindRootText(textNode, expression) {
        this.rootTextBindings.set(textNode, expression);
    }
    bindNgContent() { this.ngContentCount++; }
    setHostAttribute(name, value) { this.hostAttributes.set(name, value); }
    build(schemaRegistry, templateCloner) {
        var domElementBinders = [];
        var apiElementBinders = [];
        var textNodeExpressions = [];
        var rootTextNodeIndices = [];
        var transitiveNgContentCount = this.ngContentCount;
        queryBoundTextNodeIndices(DOM.content(this.rootElement), this.rootTextBindings, (node, nodeIndex, expression) => {
            textNodeExpressions.push(expression);
            rootTextNodeIndices.push(nodeIndex);
        });
        ListWrapper.forEach(this.elements, (ebb) => {
            var directiveTemplatePropertyNames = new Set();
            var apiDirectiveBinders = ListWrapper.map(ebb.directives, (dbb) => {
                ebb.eventBuilder.merge(dbb.eventBuilder);
                ListWrapper.forEach(dbb.templatePropertyNames, (name) => directiveTemplatePropertyNames.add(name));
                return new DirectiveBinder({
                    directiveIndex: dbb.directiveIndex,
                    propertyBindings: dbb.propertyBindings,
                    eventBindings: dbb.eventBindings,
                    hostPropertyBindings: buildElementPropertyBindings(schemaRegistry, ebb.element, true, dbb.hostPropertyBindings, null)
                });
            });
            var nestedProtoView = isPresent(ebb.nestedProtoView) ?
                ebb.nestedProtoView.build(schemaRegistry, templateCloner) :
                null;
            if (isPresent(nestedProtoView)) {
                transitiveNgContentCount += nestedProtoView.transitiveNgContentCount;
            }
            var parentIndex = isPresent(ebb.parent) ? ebb.parent.index : -1;
            var textNodeIndices = [];
            queryBoundTextNodeIndices(ebb.element, ebb.textBindings, (node, nodeIndex, expression) => {
                textNodeExpressions.push(expression);
                textNodeIndices.push(nodeIndex);
            });
            apiElementBinders.push(new RenderElementBinder({
                index: ebb.index,
                parentIndex: parentIndex,
                distanceToParent: ebb.distanceToParent,
                directives: apiDirectiveBinders,
                nestedProtoView: nestedProtoView,
                propertyBindings: buildElementPropertyBindings(schemaRegistry, ebb.element, isPresent(ebb.componentId), ebb.propertyBindings, directiveTemplatePropertyNames),
                variableBindings: ebb.variableBindings,
                eventBindings: ebb.eventBindings,
                readAttributes: ebb.readAttributes
            }));
            domElementBinders.push(new DomElementBinder({
                textNodeIndices: textNodeIndices,
                hasNestedProtoView: isPresent(nestedProtoView) || isPresent(ebb.componentId),
                hasNativeShadowRoot: false,
                eventLocals: new LiteralArray(ebb.eventBuilder.buildEventLocals()),
                localEvents: ebb.eventBuilder.buildLocalEvents(),
                globalEvents: ebb.eventBuilder.buildGlobalEvents()
            }));
        });
        var rootNodeCount = DOM.childNodes(DOM.content(this.rootElement)).length;
        return new ProtoViewDto({
            render: new DomProtoViewRef(DomProtoView.create(templateCloner, this.type, this.rootElement, this.viewEncapsulation, [rootNodeCount], rootTextNodeIndices, domElementBinders, this.hostAttributes)),
            type: this.type,
            elementBinders: apiElementBinders,
            variableBindings: this.variableBindings,
            textBindings: textNodeExpressions,
            transitiveNgContentCount: transitiveNgContentCount
        });
    }
}
export class ElementBinderBuilder {
    constructor(index, element, description) {
        this.index = index;
        this.element = element;
        this.parent = null;
        this.distanceToParent = 0;
        this.directives = [];
        this.nestedProtoView = null;
        this.propertyBindings = new Map();
        this.variableBindings = new Map();
        this.eventBindings = [];
        this.eventBuilder = new EventBuilder();
        this.textBindings = new Map();
        this.readAttributes = new Map();
        this.componentId = null;
    }
    setParent(parent, distanceToParent) {
        this.parent = parent;
        if (isPresent(parent)) {
            this.distanceToParent = distanceToParent;
        }
        return this;
    }
    readAttribute(attrName) {
        if (isBlank(this.readAttributes.get(attrName))) {
            this.readAttributes.set(attrName, DOM.getAttribute(this.element, attrName));
        }
    }
    bindDirective(directiveIndex) {
        var directive = new DirectiveBuilder(directiveIndex);
        this.directives.push(directive);
        return directive;
    }
    bindNestedProtoView(rootElement) {
        if (isPresent(this.nestedProtoView)) {
            throw new BaseException('Only one nested view per element is allowed');
        }
        this.nestedProtoView =
            new ProtoViewBuilder(rootElement, ViewType.EMBEDDED, ViewEncapsulation.NONE);
        return this.nestedProtoView;
    }
    bindProperty(name, expression) {
        this.propertyBindings.set(name, expression);
    }
    bindVariable(name, value) {
        // When current is a view root, the variable bindings are set to the *nested* proto view.
        // The root view conceptually signifies a new "block scope" (the nested view), to which
        // the variables are bound.
        if (isPresent(this.nestedProtoView)) {
            this.nestedProtoView.bindVariable(name, value);
        }
        else {
            // Store the variable map from value to variable, reflecting how it will be used later by
            // DomView. When a local is set to the view, a lookup for the variable name will take place
            // keyed
            // by the "value", or exported identifier. For example, ng-for sets a view local of "index".
            // When this occurs, a lookup keyed by "index" must occur to find if there is a var
            // referencing
            // it.
            this.variableBindings.set(value, name);
        }
    }
    bindEvent(name, expression, target = null) {
        this.eventBindings.push(this.eventBuilder.add(name, expression, target));
    }
    // Note: We don't store the node index until the compilation is complete,
    // as the compiler might change the order of elements.
    bindText(textNode, expression) {
        this.textBindings.set(textNode, expression);
    }
    setComponentId(componentId) { this.componentId = componentId; }
}
export class DirectiveBuilder {
    constructor(directiveIndex) {
        this.directiveIndex = directiveIndex;
        // mapping from directive property name to AST for that directive
        this.propertyBindings = new Map();
        // property names used in the template
        this.templatePropertyNames = [];
        this.hostPropertyBindings = new Map();
        this.eventBindings = [];
        this.eventBuilder = new EventBuilder();
    }
    bindProperty(name, expression, elProp) {
        this.propertyBindings.set(name, expression);
        if (isPresent(elProp)) {
            // we are filling in a set of property names that are bound to a property
            // of at least one directive. This allows us to report "dangling" bindings.
            this.templatePropertyNames.push(elProp);
        }
    }
    bindHostProperty(name, expression) {
        this.hostPropertyBindings.set(name, expression);
    }
    bindEvent(name, expression, target = null) {
        this.eventBindings.push(this.eventBuilder.add(name, expression, target));
    }
}
export class EventBuilder extends AstTransformer {
    constructor() {
        super();
        this.locals = [];
        this.localEvents = [];
        this.globalEvents = [];
        this._implicitReceiver = new ImplicitReceiver();
    }
    add(name, source, target) {
        // TODO(tbosch): reenable this when we are parsing element properties
        // out of action expressions
        // var adjustedAst = astWithSource.ast.visit(this);
        var adjustedAst = source.ast;
        var fullName = isPresent(target) ? target + EVENT_TARGET_SEPARATOR + name : name;
        var result = new EventBinding(fullName, new ASTWithSource(adjustedAst, source.source, source.location));
        var event = new Event(name, target, fullName);
        if (isBlank(target)) {
            this.localEvents.push(event);
        }
        else {
            this.globalEvents.push(event);
        }
        return result;
    }
    visitPropertyRead(ast) {
        var isEventAccess = false;
        var current = ast;
        while (!isEventAccess && (current instanceof PropertyRead)) {
            var am = current;
            if (am.name == '$event') {
                isEventAccess = true;
            }
            current = am.receiver;
        }
        if (isEventAccess) {
            this.locals.push(ast);
            var index = this.locals.length - 1;
            return new PropertyRead(this._implicitReceiver, `${index}`, (arr) => arr[index]);
        }
        else {
            return ast;
        }
    }
    buildEventLocals() { return this.locals; }
    buildLocalEvents() { return this.localEvents; }
    buildGlobalEvents() { return this.globalEvents; }
    merge(eventBuilder) {
        this._merge(this.localEvents, eventBuilder.localEvents);
        this._merge(this.globalEvents, eventBuilder.globalEvents);
        ListWrapper.concat(this.locals, eventBuilder.locals);
    }
    _merge(host, tobeAdded) {
        var names = [];
        for (var i = 0; i < host.length; i++) {
            names.push(host[i].fullName);
        }
        for (var j = 0; j < tobeAdded.length; j++) {
            if (!ListWrapper.contains(names, tobeAdded[j].fullName)) {
                host.push(tobeAdded[j]);
            }
        }
    }
}
var PROPERTY_PARTS_SEPARATOR = new RegExp('\\.');
const ATTRIBUTE_PREFIX = 'attr';
const CLASS_PREFIX = 'class';
const STYLE_PREFIX = 'style';
function buildElementPropertyBindings(schemaRegistry, protoElement, isNgComponent, bindingsInTemplate, directiveTemplatePropertyNames) {
    var propertyBindings = [];
    MapWrapper.forEach(bindingsInTemplate, (ast, propertyNameInTemplate) => {
        var propertyBinding = createElementPropertyBinding(schemaRegistry, ast, propertyNameInTemplate);
        if (isPresent(directiveTemplatePropertyNames) &&
            SetWrapper.has(directiveTemplatePropertyNames, propertyNameInTemplate)) {
        }
        else if (isValidElementPropertyBinding(schemaRegistry, protoElement, isNgComponent, propertyBinding)) {
            propertyBindings.push(propertyBinding);
        }
        else {
            var exMsg = `Can't bind to '${propertyNameInTemplate}' since it isn't a known property of the '<${DOM.tagName(protoElement).toLowerCase()}>' element`;
            // directiveTemplatePropertyNames is null for host property bindings
            if (isPresent(directiveTemplatePropertyNames)) {
                exMsg += ' and there are no matching directives with a corresponding property';
            }
            throw new BaseException(exMsg);
        }
    });
    return propertyBindings;
}
function isValidElementPropertyBinding(schemaRegistry, protoElement, isNgComponent, binding) {
    if (binding.type === PropertyBindingType.PROPERTY) {
        if (!isNgComponent) {
            return schemaRegistry.hasProperty(protoElement, binding.property);
        }
        else {
            // TODO(pk): change this logic as soon as we can properly detect custom elements
            return DOM.hasProperty(protoElement, binding.property);
        }
    }
    return true;
}
function createElementPropertyBinding(schemaRegistry, ast, propertyNameInTemplate) {
    var parts = StringWrapper.split(propertyNameInTemplate, PROPERTY_PARTS_SEPARATOR);
    if (parts.length === 1) {
        var propName = schemaRegistry.getMappedPropName(parts[0]);
        return new ElementPropertyBinding(PropertyBindingType.PROPERTY, ast, propName);
    }
    else if (parts[0] == ATTRIBUTE_PREFIX) {
        return new ElementPropertyBinding(PropertyBindingType.ATTRIBUTE, ast, parts[1]);
    }
    else if (parts[0] == CLASS_PREFIX) {
        return new ElementPropertyBinding(PropertyBindingType.CLASS, ast, camelCaseToDashCase(parts[1]));
    }
    else if (parts[0] == STYLE_PREFIX) {
        var unit = parts.length > 2 ? parts[2] : null;
        return new ElementPropertyBinding(PropertyBindingType.STYLE, ast, parts[1], unit);
    }
    else {
        throw new BaseException(`Invalid property name ${propertyNameInTemplate}`);
    }
}
//# sourceMappingURL=proto_view_builder.js.map
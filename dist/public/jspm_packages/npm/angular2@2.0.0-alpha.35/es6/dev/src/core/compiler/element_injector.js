/* */ 
"format cjs";
import { isPresent, isBlank, BaseException, stringify, StringWrapper } from 'angular2/src/facade/lang';
import { ObservableWrapper } from 'angular2/src/facade/async';
import { ListWrapper, MapWrapper } from 'angular2/src/facade/collection';
import { Injector, ProtoInjector, Visibility, UNDEFINED, Key, Dependency, Binding, ResolvedBinding, NoBindingError } from 'angular2/di';
import { InjectorInlineStrategy, BindingWithVisibility } from 'angular2/src/di/injector';
import { AttributeMetadata, QueryMetadata } from '../metadata/di';
import * as avmModule from './view_manager';
import { ViewContainerRef } from './view_container_ref';
import { ElementRef } from './element_ref';
import { TemplateRef } from './template_ref';
import { DirectiveMetadata, ComponentMetadata, LifecycleEvent } from '../metadata/directives';
import { hasLifecycleHook } from './directive_lifecycle_reflector';
import { ChangeDetectorRef } from 'angular2/src/change_detection/change_detection';
import { QueryList } from './query_list';
import { reflector } from 'angular2/src/reflection/reflection';
import { RenderDirectiveMetadata } from 'angular2/src/render/api';
import { PipeBinding } from '../pipes/pipe_binding';
var _staticKeys;
export class StaticKeys {
    constructor() {
        this.viewManagerId = Key.get(avmModule.AppViewManager).id;
        this.templateRefId = Key.get(TemplateRef).id;
        this.viewContainerId = Key.get(ViewContainerRef).id;
        this.changeDetectorRefId = Key.get(ChangeDetectorRef).id;
        this.elementRefId = Key.get(ElementRef).id;
    }
    static instance() {
        if (isBlank(_staticKeys))
            _staticKeys = new StaticKeys();
        return _staticKeys;
    }
}
export class TreeNode {
    constructor(parent) {
        this._head = null;
        this._tail = null;
        this._next = null;
        if (isPresent(parent))
            parent.addChild(this);
    }
    /**
     * Adds a child to the parent node. The child MUST NOT be a part of a tree.
     */
    addChild(child) {
        if (isPresent(this._tail)) {
            this._tail._next = child;
            this._tail = child;
        }
        else {
            this._tail = this._head = child;
        }
        child._next = null;
        child._parent = this;
    }
    /**
     * Adds a child to the parent node after a given sibling.
     * The child MUST NOT be a part of a tree and the sibling must be present.
     */
    addChildAfter(child, prevSibling) {
        if (isBlank(prevSibling)) {
            var prevHead = this._head;
            this._head = child;
            child._next = prevHead;
            if (isBlank(this._tail))
                this._tail = child;
        }
        else if (isBlank(prevSibling._next)) {
            this.addChild(child);
            return;
        }
        else {
            child._next = prevSibling._next;
            prevSibling._next = child;
        }
        child._parent = this;
    }
    /**
     * Detaches a node from the parent's tree.
     */
    remove() {
        if (isBlank(this.parent))
            return;
        var nextSibling = this._next;
        var prevSibling = this._findPrev();
        if (isBlank(prevSibling)) {
            this.parent._head = this._next;
        }
        else {
            prevSibling._next = this._next;
        }
        if (isBlank(nextSibling)) {
            this._parent._tail = prevSibling;
        }
        this._parent = null;
        this._next = null;
    }
    /**
     * Finds a previous sibling or returns null if first child.
     * Assumes the node has a parent.
     * TODO(rado): replace with DoublyLinkedList to avoid O(n) here.
     */
    _findPrev() {
        var node = this.parent._head;
        if (node == this)
            return null;
        while (node._next !== this)
            node = node._next;
        return node;
    }
    get parent() { return this._parent; }
    // TODO(rado): replace with a function call, does too much work for a getter.
    get children() {
        var res = [];
        var child = this._head;
        while (child != null) {
            res.push(child);
            child = child._next;
        }
        return res;
    }
}
export class DirectiveDependency extends Dependency {
    constructor(key, optional, lowerBoundVisibility, upperBoundVisibility, properties, attributeName, queryDecorator) {
        super(key, optional, lowerBoundVisibility, upperBoundVisibility, properties);
        this.attributeName = attributeName;
        this.queryDecorator = queryDecorator;
        this._verify();
    }
    _verify() {
        var count = 0;
        if (isPresent(this.queryDecorator))
            count++;
        if (isPresent(this.attributeName))
            count++;
        if (count > 1)
            throw new BaseException('A directive injectable can contain only one of the following @Attribute or @Query.');
    }
    static createFrom(d) {
        return new DirectiveDependency(d.key, d.optional, d.lowerBoundVisibility, d.upperBoundVisibility, d.properties, DirectiveDependency._attributeName(d.properties), DirectiveDependency._query(d.properties));
    }
    static _attributeName(properties) {
        var p = ListWrapper.find(properties, (p) => p instanceof AttributeMetadata);
        return isPresent(p) ? p.attributeName : null;
    }
    static _query(properties) {
        return ListWrapper.find(properties, (p) => p instanceof QueryMetadata);
    }
}
export class DirectiveBinding extends ResolvedBinding {
    constructor(key, factory, dependencies, resolvedBindings, resolvedViewBindings, metadata) {
        super(key, factory, dependencies);
        this.resolvedBindings = resolvedBindings;
        this.resolvedViewBindings = resolvedViewBindings;
        this.metadata = metadata;
    }
    get callOnDestroy() { return this.metadata.callOnDestroy; }
    get callOnChange() { return this.metadata.callOnChange; }
    get callOnAllChangesDone() { return this.metadata.callOnAllChangesDone; }
    get displayName() { return this.key.displayName; }
    get eventEmitters() {
        return isPresent(this.metadata) && isPresent(this.metadata.events) ? this.metadata.events : [];
    }
    get hostActions() {
        return isPresent(this.metadata) && isPresent(this.metadata.hostActions) ?
            this.metadata.hostActions :
            new Map();
    }
    get changeDetection() { return this.metadata.changeDetection; }
    static createFromBinding(binding, ann) {
        if (isBlank(ann)) {
            ann = new DirectiveMetadata();
        }
        var rb = binding.resolve();
        var deps = ListWrapper.map(rb.dependencies, DirectiveDependency.createFrom);
        var resolvedBindings = isPresent(ann.bindings) ? Injector.resolve(ann.bindings) : [];
        var resolvedViewBindings = ann instanceof ComponentMetadata && isPresent(ann.viewBindings) ?
            Injector.resolve(ann.viewBindings) :
            [];
        var metadata = RenderDirectiveMetadata.create({
            id: stringify(rb.key.token),
            type: ann instanceof ComponentMetadata ? RenderDirectiveMetadata.COMPONENT_TYPE :
                RenderDirectiveMetadata.DIRECTIVE_TYPE,
            selector: ann.selector,
            compileChildren: ann.compileChildren,
            events: ann.events,
            host: isPresent(ann.host) ? MapWrapper.createFromStringMap(ann.host) : null,
            properties: ann.properties,
            readAttributes: DirectiveBinding._readAttributes(deps),
            callOnDestroy: hasLifecycleHook(LifecycleEvent.onDestroy, rb.key.token, ann),
            callOnChange: hasLifecycleHook(LifecycleEvent.onChange, rb.key.token, ann),
            callOnCheck: hasLifecycleHook(LifecycleEvent.onCheck, rb.key.token, ann),
            callOnInit: hasLifecycleHook(LifecycleEvent.onInit, rb.key.token, ann),
            callOnAllChangesDone: hasLifecycleHook(LifecycleEvent.onAllChangesDone, rb.key.token, ann),
            changeDetection: ann instanceof ComponentMetadata ? ann.changeDetection : null,
            exportAs: ann.exportAs
        });
        return new DirectiveBinding(rb.key, rb.factory, deps, resolvedBindings, resolvedViewBindings, metadata);
    }
    static _readAttributes(deps) {
        var readAttributes = [];
        ListWrapper.forEach(deps, (dep) => {
            if (isPresent(dep.attributeName)) {
                readAttributes.push(dep.attributeName);
            }
        });
        return readAttributes;
    }
    static createFromType(type, annotation) {
        var binding = new Binding(type, { toClass: type });
        return DirectiveBinding.createFromBinding(binding, annotation);
    }
}
// TODO(rado): benchmark and consider rolling in as ElementInjector fields.
export class PreBuiltObjects {
    constructor(viewManager, view, elementRef, templateRef) {
        this.viewManager = viewManager;
        this.view = view;
        this.elementRef = elementRef;
        this.templateRef = templateRef;
    }
}
export class EventEmitterAccessor {
    constructor(eventName, getter) {
        this.eventName = eventName;
        this.getter = getter;
    }
    subscribe(view, boundElementIndex, directive) {
        var eventEmitter = this.getter(directive);
        return ObservableWrapper.subscribe(eventEmitter, eventObj => view.triggerEventHandlers(this.eventName, eventObj, boundElementIndex));
    }
}
export class HostActionAccessor {
    constructor(methodName, getter) {
        this.methodName = methodName;
        this.getter = getter;
    }
    subscribe(view, boundElementIndex, directive) {
        var eventEmitter = this.getter(directive);
        return ObservableWrapper.subscribe(eventEmitter, actionArgs => view.invokeElementMethod(boundElementIndex, this.methodName, actionArgs));
    }
}
function _createEventEmitterAccessors(bwv) {
    var binding = bwv.binding;
    if (!(binding instanceof DirectiveBinding))
        return [];
    var db = binding;
    return ListWrapper.map(db.eventEmitters, eventConfig => {
        let fieldName;
        let eventName;
        var colonIdx = eventConfig.indexOf(':');
        if (colonIdx > -1) {
            // long format: 'fieldName: eventName'
            fieldName = StringWrapper.substring(eventConfig, 0, colonIdx).trim();
            eventName = StringWrapper.substring(eventConfig, colonIdx + 1).trim();
        }
        else {
            // short format: 'name' when fieldName and eventName are the same
            fieldName = eventName = eventConfig;
        }
        return new EventEmitterAccessor(eventName, reflector.getter(fieldName));
    });
}
function _createHostActionAccessors(bwv) {
    var binding = bwv.binding;
    if (!(binding instanceof DirectiveBinding))
        return [];
    var res = [];
    var db = binding;
    MapWrapper.forEach(db.hostActions, (actionExpression, actionName) => {
        res.push(new HostActionAccessor(actionExpression, reflector.getter(actionName)));
    });
    return res;
}
export class ProtoElementInjector {
    constructor(parent, index, bwv, distanceToParent, _firstBindingIsComponent, directiveVariableBindings) {
        this.parent = parent;
        this.index = index;
        this.distanceToParent = distanceToParent;
        this._firstBindingIsComponent = _firstBindingIsComponent;
        this.directiveVariableBindings = directiveVariableBindings;
        var length = bwv.length;
        this.protoInjector = new ProtoInjector(bwv);
        this.eventEmitterAccessors = ListWrapper.createFixedSize(length);
        this.hostActionAccessors = ListWrapper.createFixedSize(length);
        for (var i = 0; i < length; ++i) {
            this.eventEmitterAccessors[i] = _createEventEmitterAccessors(bwv[i]);
            this.hostActionAccessors[i] = _createHostActionAccessors(bwv[i]);
        }
    }
    static create(parent, index, bindings, firstBindingIsComponent, distanceToParent, directiveVariableBindings) {
        var bd = [];
        ProtoElementInjector._createDirectiveBindingWithVisibility(bindings, bd, firstBindingIsComponent);
        if (firstBindingIsComponent) {
            ProtoElementInjector._createViewBindingsWithVisibility(bindings, bd);
        }
        ProtoElementInjector._createBindingsWithVisibility(bindings, bd, firstBindingIsComponent);
        return new ProtoElementInjector(parent, index, bd, distanceToParent, firstBindingIsComponent, directiveVariableBindings);
    }
    static _createDirectiveBindingWithVisibility(dirBindings, bd, firstBindingIsComponent) {
        ListWrapper.forEach(dirBindings, dirBinding => {
            bd.push(ProtoElementInjector._createBindingWithVisibility(firstBindingIsComponent, dirBinding, dirBindings, dirBinding));
        });
    }
    static _createBindingsWithVisibility(dirBindings, bd, firstBindingIsComponent) {
        ListWrapper.forEach(dirBindings, dirBinding => {
            ListWrapper.forEach(dirBinding.resolvedBindings, b => {
                bd.push(ProtoElementInjector._createBindingWithVisibility(firstBindingIsComponent, dirBinding, dirBindings, b));
            });
        });
    }
    static _createBindingWithVisibility(firstBindingIsComponent, dirBinding, dirBindings, binding) {
        var isComponent = firstBindingIsComponent && dirBindings[0] === dirBinding;
        return new BindingWithVisibility(binding, isComponent ? Visibility.PublicAndPrivate : Visibility.Public);
    }
    static _createViewBindingsWithVisibility(bindings, bd) {
        var db = bindings[0];
        ListWrapper.forEach(db.resolvedViewBindings, b => bd.push(new BindingWithVisibility(b, Visibility.Private)));
    }
    instantiate(parent) {
        return new ElementInjector(this, parent);
    }
    directParent() { return this.distanceToParent < 2 ? this.parent : null; }
    get hasBindings() { return this.eventEmitterAccessors.length > 0; }
    getBindingAtIndex(index) { return this.protoInjector.getBindingAtIndex(index); }
}
class _Context {
    constructor(element, componentElement, injector) {
        this.element = element;
        this.componentElement = componentElement;
        this.injector = injector;
    }
}
export class ElementInjector extends TreeNode {
    constructor(_proto, parent) {
        super(parent);
        this._proto = _proto;
        this._preBuiltObjects = null;
        this._injector =
            new Injector(this._proto.protoInjector, null, this, () => this._debugContext());
        // we couple ourselves to the injector strategy to avoid polymoprhic calls
        var injectorStrategy = this._injector.internalStrategy;
        this._strategy = injectorStrategy instanceof InjectorInlineStrategy ?
            new ElementInjectorInlineStrategy(injectorStrategy, this) :
            new ElementInjectorDynamicStrategy(injectorStrategy, this);
        this.hydrated = false;
        this._buildQueries();
        this._addParentQueries();
    }
    dehydrate() {
        this.hydrated = false;
        this._host = null;
        this._preBuiltObjects = null;
        this._strategy.callOnDestroy();
        this._strategy.dehydrate();
    }
    onAllChangesDone() {
        if (isPresent(this._query0) && this._query0.originator === this) {
            this._query0.list.fireCallbacks();
        }
        if (isPresent(this._query1) && this._query1.originator === this) {
            this._query1.list.fireCallbacks();
        }
        if (isPresent(this._query2) && this._query2.originator === this) {
            this._query2.list.fireCallbacks();
        }
    }
    hydrate(imperativelyCreatedInjector, host, preBuiltObjects) {
        this._host = host;
        this._preBuiltObjects = preBuiltObjects;
        if (isPresent(host)) {
            this._addViewQueries(host);
        }
        this._reattachInjectors(imperativelyCreatedInjector);
        this._strategy.hydrate();
        this._addDirectivesToQueries();
        this._addVarBindingsToQueries();
        this.hydrated = true;
        // TODO(rado): optimize this call, if view queries are not moved around,
        // simply appending to the query list is faster than updating.
        this._updateViewQueries();
    }
    _updateViewQueries() {
        if (isPresent(this._query0) && this._query0.isViewQuery) {
            this._query0.update();
        }
        if (isPresent(this._query1) && this._query1.isViewQuery) {
            this._query1.update();
        }
        if (isPresent(this._query2) && this._query2.isViewQuery) {
            this._query2.update();
        }
    }
    _debugContext() {
        var p = this._preBuiltObjects;
        var index = p.elementRef.boundElementIndex - p.view.elementOffset;
        var c = this._preBuiltObjects.view.getDebugContext(index, null);
        return isPresent(c) ? new _Context(c.element, c.componentElement, c.injector) : null;
    }
    _reattachInjectors(imperativelyCreatedInjector) {
        // Dynamically-loaded component in the template. Not a root ElementInjector.
        if (isPresent(this._parent)) {
            if (isPresent(imperativelyCreatedInjector)) {
                // The imperative injector is similar to having an element between
                // the dynamic-loaded component and its parent => no boundaries.
                this._reattachInjector(this._injector, imperativelyCreatedInjector, false);
                this._reattachInjector(imperativelyCreatedInjector, this._parent._injector, false);
            }
            else {
                this._reattachInjector(this._injector, this._parent._injector, false);
            }
        }
        else if (isPresent(this._host)) {
            // The imperative injector is similar to having an element between
            // the dynamic-loaded component and its parent => no boundary between
            // the component and imperativelyCreatedInjector.
            // But since it is a root ElementInjector, we need to create a boundary
            // between imperativelyCreatedInjector and _host.
            if (isPresent(imperativelyCreatedInjector)) {
                this._reattachInjector(this._injector, imperativelyCreatedInjector, false);
                this._reattachInjector(imperativelyCreatedInjector, this._host._injector, true);
            }
            else {
                this._reattachInjector(this._injector, this._host._injector, true);
            }
        }
        else {
            if (isPresent(imperativelyCreatedInjector)) {
                this._reattachInjector(this._injector, imperativelyCreatedInjector, true);
            }
        }
    }
    _reattachInjector(injector, parentInjector, isBoundary) {
        injector.internalStrategy.attach(parentInjector, isBoundary);
    }
    hasVariableBinding(name) {
        var vb = this._proto.directiveVariableBindings;
        return isPresent(vb) && vb.has(name);
    }
    getVariableBinding(name) {
        var index = this._proto.directiveVariableBindings.get(name);
        return isPresent(index) ? this.getDirectiveAtIndex(index) : this.getElementRef();
    }
    get(token) { return this._injector.get(token); }
    hasDirective(type) { return isPresent(this._injector.getOptional(type)); }
    getEventEmitterAccessors() {
        return this._proto.eventEmitterAccessors;
    }
    getHostActionAccessors() {
        return this._proto.hostActionAccessors;
    }
    getDirectiveVariableBindings() {
        return this._proto.directiveVariableBindings;
    }
    getComponent() { return this._strategy.getComponent(); }
    getInjector() { return this._injector; }
    getElementRef() { return this._preBuiltObjects.elementRef; }
    getViewContainerRef() {
        return new ViewContainerRef(this._preBuiltObjects.viewManager, this.getElementRef());
    }
    directParent() { return this._proto.distanceToParent < 2 ? this.parent : null; }
    isComponentKey(key) { return this._strategy.isComponentKey(key); }
    getDependency(injector, binding, dep) {
        var key = dep.key;
        if (binding instanceof DirectiveBinding) {
            var dirDep = dep;
            var dirBin = binding;
            var staticKeys = StaticKeys.instance();
            if (key.id === staticKeys.viewManagerId)
                return this._preBuiltObjects.viewManager;
            if (isPresent(dirDep.attributeName))
                return this._buildAttribute(dirDep);
            if (isPresent(dirDep.queryDecorator))
                return this._findQuery(dirDep.queryDecorator).list;
            if (dirDep.key.id === StaticKeys.instance().changeDetectorRefId) {
                // We provide the component's view change detector to components and
                // the surrounding component's change detector to directives.
                if (dirBin.metadata.type === RenderDirectiveMetadata.COMPONENT_TYPE) {
                    var componentView = this._preBuiltObjects.view.getNestedView(this._preBuiltObjects.elementRef.boundElementIndex);
                    return componentView.changeDetector.ref;
                }
                else {
                    return this._preBuiltObjects.view.changeDetector.ref;
                }
            }
            if (dirDep.key.id === StaticKeys.instance().elementRefId) {
                return this.getElementRef();
            }
            if (dirDep.key.id === StaticKeys.instance().viewContainerId) {
                return this.getViewContainerRef();
            }
            if (dirDep.key.id === StaticKeys.instance().templateRefId) {
                if (isBlank(this._preBuiltObjects.templateRef)) {
                    if (dirDep.optional) {
                        return null;
                    }
                    throw new NoBindingError(null, dirDep.key);
                }
                return this._preBuiltObjects.templateRef;
            }
        }
        else if (binding instanceof PipeBinding) {
            if (dep.key.id === StaticKeys.instance().changeDetectorRefId) {
                var componentView = this._preBuiltObjects.view.getNestedView(this._preBuiltObjects.elementRef.boundElementIndex);
                return componentView.changeDetector.ref;
            }
        }
        return UNDEFINED;
    }
    _buildAttribute(dep) {
        var attributes = this._proto.attributes;
        if (isPresent(attributes) && attributes.has(dep.attributeName)) {
            return attributes.get(dep.attributeName);
        }
        else {
            return null;
        }
    }
    _buildQueriesForDeps(deps) {
        for (var i = 0; i < deps.length; i++) {
            var dep = deps[i];
            if (isPresent(dep.queryDecorator)) {
                this._createQueryRef(dep.queryDecorator);
            }
        }
    }
    _addViewQueries(host) {
        this._addViewQuery(host._query0, host);
        this._addViewQuery(host._query1, host);
        this._addViewQuery(host._query2, host);
    }
    _addViewQuery(queryRef, host) {
        if (isBlank(queryRef) || !queryRef.isViewQuery || this._hasQuery(queryRef))
            return;
        if (host._query0.originator == host) {
            // TODO(rado): Replace this.parent check with distanceToParent = 1 when
            // https://github.com/angular/angular/issues/2707 is fixed.
            if (!queryRef.query.descendants && isPresent(this.parent))
                return;
            this._assignQueryRef(queryRef);
        }
    }
    _addVarBindingsToQueries() {
        this._addVarBindingsToQuery(this._query0);
        this._addVarBindingsToQuery(this._query1);
        this._addVarBindingsToQuery(this._query2);
    }
    _addDirectivesToQueries() {
        this._addDirectivesToQuery(this._query0);
        this._addDirectivesToQuery(this._query1);
        this._addDirectivesToQuery(this._query2);
    }
    _addVarBindingsToQuery(queryRef) {
        if (isBlank(queryRef) || !queryRef.query.isVarBindingQuery)
            return;
        var vb = queryRef.query.varBindings;
        for (var i = 0; i < vb.length; ++i) {
            if (this.hasVariableBinding(vb[i])) {
                queryRef.list.add(this.getVariableBinding(vb[i]));
            }
        }
    }
    _addDirectivesToQuery(queryRef) {
        if (isBlank(queryRef) || queryRef.query.isVarBindingQuery)
            return;
        if (queryRef.isViewQuery && queryRef.originator == this)
            return;
        var matched = [];
        this.addDirectivesMatchingQuery(queryRef.query, matched);
        matched.forEach(s => queryRef.list.add(s));
    }
    _createQueryRef(query) {
        var queryList = new QueryList();
        if (isBlank(this._query0)) {
            this._query0 = new QueryRef(query, queryList, this);
        }
        else if (isBlank(this._query1)) {
            this._query1 = new QueryRef(query, queryList, this);
        }
        else if (isBlank(this._query2)) {
            this._query2 = new QueryRef(query, queryList, this);
        }
        else {
            throw new QueryError();
        }
    }
    addDirectivesMatchingQuery(query, list) {
        var templateRef = this._preBuiltObjects.templateRef;
        if (query.selector === TemplateRef && isPresent(templateRef)) {
            list.push(templateRef);
        }
        this._strategy.addDirectivesMatchingQuery(query, list);
    }
    _buildQueries() {
        if (isPresent(this._proto)) {
            this._strategy.buildQueries();
        }
    }
    _findQuery(query) {
        if (isPresent(this._query0) && this._query0.query === query) {
            return this._query0;
        }
        if (isPresent(this._query1) && this._query1.query === query) {
            return this._query1;
        }
        if (isPresent(this._query2) && this._query2.query === query) {
            return this._query2;
        }
        throw new BaseException(`Cannot find query for directive ${query}.`);
    }
    _hasQuery(query) {
        return this._query0 == query || this._query1 == query || this._query2 == query;
    }
    link(parent) {
        parent.addChild(this);
        this._addParentQueries();
    }
    linkAfter(parent, prevSibling) {
        parent.addChildAfter(this, prevSibling);
        this._addParentQueries();
    }
    unlink() {
        var parent = this.parent;
        this.remove();
        this._removeParentQueries(parent);
    }
    _addParentQueries() {
        if (isBlank(this.parent))
            return;
        this._addParentQuery(this.parent._query0);
        this._addParentQuery(this.parent._query1);
        this._addParentQuery(this.parent._query2);
    }
    _addParentQuery(query) {
        if (isPresent(query) && !this._hasQuery(query)) {
            this._addQueryToTree(query);
            if (this.hydrated)
                query.update();
        }
    }
    _removeParentQueries(parent) {
        this._removeParentQuery(parent._query0);
        this._removeParentQuery(parent._query1);
        this._removeParentQuery(parent._query2);
    }
    _removeParentQuery(query) {
        if (isPresent(query)) {
            this._pruneQueryFromTree(query);
            query.update();
        }
    }
    _pruneQueryFromTree(query) {
        this._removeQueryRef(query);
        var child = this._head;
        while (isPresent(child)) {
            child._pruneQueryFromTree(query);
            child = child._next;
        }
    }
    _addQueryToTree(queryRef) {
        if (queryRef.query.descendants == false) {
            if (this == queryRef.originator) {
                this._addQueryToTreeSelfAndRecurse(queryRef);
            }
            else if (this.parent == queryRef.originator) {
                this._assignQueryRef(queryRef);
            }
        }
        else {
            this._addQueryToTreeSelfAndRecurse(queryRef);
        }
    }
    _addQueryToTreeSelfAndRecurse(queryRef) {
        this._assignQueryRef(queryRef);
        var child = this._head;
        while (isPresent(child)) {
            child._addQueryToTree(queryRef);
            child = child._next;
        }
    }
    _assignQueryRef(query) {
        if (isBlank(this._query0)) {
            this._query0 = query;
            return;
        }
        else if (isBlank(this._query1)) {
            this._query1 = query;
            return;
        }
        else if (isBlank(this._query2)) {
            this._query2 = query;
            return;
        }
        throw new QueryError();
    }
    _removeQueryRef(query) {
        if (this._query0 == query)
            this._query0 = null;
        if (this._query1 == query)
            this._query1 = null;
        if (this._query2 == query)
            this._query2 = null;
    }
    getDirectiveAtIndex(index) { return this._injector.getAt(index); }
    hasInstances() { return this._proto.hasBindings && this.hydrated; }
    getHost() { return this._host; }
    getBoundElementIndex() { return this._proto.index; }
    getRootViewInjectors() {
        var view = this._preBuiltObjects.view;
        return view.getNestedView(view.elementOffset + this.getBoundElementIndex())
            .rootElementInjectors;
    }
}
/**
 * Strategy used by the `ElementInjector` when the number of bindings is 10 or less.
 * In such a case, inlining fields is benefitial for performances.
 */
class ElementInjectorInlineStrategy {
    constructor(injectorStrategy, _ei) {
        this.injectorStrategy = injectorStrategy;
        this._ei = _ei;
    }
    hydrate() {
        var i = this.injectorStrategy;
        var p = i.protoStrategy;
        i.resetConstructionCounter();
        if (p.binding0 instanceof DirectiveBinding && isPresent(p.keyId0) && i.obj0 === UNDEFINED)
            i.obj0 = i.instantiateBinding(p.binding0, p.visibility0);
        if (p.binding1 instanceof DirectiveBinding && isPresent(p.keyId1) && i.obj1 === UNDEFINED)
            i.obj1 = i.instantiateBinding(p.binding1, p.visibility1);
        if (p.binding2 instanceof DirectiveBinding && isPresent(p.keyId2) && i.obj2 === UNDEFINED)
            i.obj2 = i.instantiateBinding(p.binding2, p.visibility2);
        if (p.binding3 instanceof DirectiveBinding && isPresent(p.keyId3) && i.obj3 === UNDEFINED)
            i.obj3 = i.instantiateBinding(p.binding3, p.visibility3);
        if (p.binding4 instanceof DirectiveBinding && isPresent(p.keyId4) && i.obj4 === UNDEFINED)
            i.obj4 = i.instantiateBinding(p.binding4, p.visibility4);
        if (p.binding5 instanceof DirectiveBinding && isPresent(p.keyId5) && i.obj5 === UNDEFINED)
            i.obj5 = i.instantiateBinding(p.binding5, p.visibility5);
        if (p.binding6 instanceof DirectiveBinding && isPresent(p.keyId6) && i.obj6 === UNDEFINED)
            i.obj6 = i.instantiateBinding(p.binding6, p.visibility6);
        if (p.binding7 instanceof DirectiveBinding && isPresent(p.keyId7) && i.obj7 === UNDEFINED)
            i.obj7 = i.instantiateBinding(p.binding7, p.visibility7);
        if (p.binding8 instanceof DirectiveBinding && isPresent(p.keyId8) && i.obj8 === UNDEFINED)
            i.obj8 = i.instantiateBinding(p.binding8, p.visibility8);
        if (p.binding9 instanceof DirectiveBinding && isPresent(p.keyId9) && i.obj9 === UNDEFINED)
            i.obj9 = i.instantiateBinding(p.binding9, p.visibility9);
    }
    dehydrate() {
        var i = this.injectorStrategy;
        i.obj0 = UNDEFINED;
        i.obj1 = UNDEFINED;
        i.obj2 = UNDEFINED;
        i.obj3 = UNDEFINED;
        i.obj4 = UNDEFINED;
        i.obj5 = UNDEFINED;
        i.obj6 = UNDEFINED;
        i.obj7 = UNDEFINED;
        i.obj8 = UNDEFINED;
        i.obj9 = UNDEFINED;
    }
    callOnDestroy() {
        var i = this.injectorStrategy;
        var p = i.protoStrategy;
        if (p.binding0 instanceof DirectiveBinding && p.binding0.callOnDestroy) {
            i.obj0.onDestroy();
        }
        if (p.binding1 instanceof DirectiveBinding && p.binding1.callOnDestroy) {
            i.obj1.onDestroy();
        }
        if (p.binding2 instanceof DirectiveBinding && p.binding2.callOnDestroy) {
            i.obj2.onDestroy();
        }
        if (p.binding3 instanceof DirectiveBinding && p.binding3.callOnDestroy) {
            i.obj3.onDestroy();
        }
        if (p.binding4 instanceof DirectiveBinding && p.binding4.callOnDestroy) {
            i.obj4.onDestroy();
        }
        if (p.binding5 instanceof DirectiveBinding && p.binding5.callOnDestroy) {
            i.obj5.onDestroy();
        }
        if (p.binding6 instanceof DirectiveBinding && p.binding6.callOnDestroy) {
            i.obj6.onDestroy();
        }
        if (p.binding7 instanceof DirectiveBinding && p.binding7.callOnDestroy) {
            i.obj7.onDestroy();
        }
        if (p.binding8 instanceof DirectiveBinding && p.binding8.callOnDestroy) {
            i.obj8.onDestroy();
        }
        if (p.binding9 instanceof DirectiveBinding && p.binding9.callOnDestroy) {
            i.obj9.onDestroy();
        }
    }
    getComponent() { return this.injectorStrategy.obj0; }
    isComponentKey(key) {
        return this._ei._proto._firstBindingIsComponent && isPresent(key) &&
            key.id === this.injectorStrategy.protoStrategy.keyId0;
    }
    buildQueries() {
        var p = this.injectorStrategy.protoStrategy;
        if (p.binding0 instanceof DirectiveBinding) {
            this._ei._buildQueriesForDeps(p.binding0.dependencies);
        }
        if (p.binding1 instanceof DirectiveBinding) {
            this._ei._buildQueriesForDeps(p.binding1.dependencies);
        }
        if (p.binding2 instanceof DirectiveBinding) {
            this._ei._buildQueriesForDeps(p.binding2.dependencies);
        }
        if (p.binding3 instanceof DirectiveBinding) {
            this._ei._buildQueriesForDeps(p.binding3.dependencies);
        }
        if (p.binding4 instanceof DirectiveBinding) {
            this._ei._buildQueriesForDeps(p.binding4.dependencies);
        }
        if (p.binding5 instanceof DirectiveBinding) {
            this._ei._buildQueriesForDeps(p.binding5.dependencies);
        }
        if (p.binding6 instanceof DirectiveBinding) {
            this._ei._buildQueriesForDeps(p.binding6.dependencies);
        }
        if (p.binding7 instanceof DirectiveBinding) {
            this._ei._buildQueriesForDeps(p.binding7.dependencies);
        }
        if (p.binding8 instanceof DirectiveBinding) {
            this._ei._buildQueriesForDeps(p.binding8.dependencies);
        }
        if (p.binding9 instanceof DirectiveBinding) {
            this._ei._buildQueriesForDeps(p.binding9.dependencies);
        }
    }
    addDirectivesMatchingQuery(query, list) {
        var i = this.injectorStrategy;
        var p = i.protoStrategy;
        if (isPresent(p.binding0) && p.binding0.key.token === query.selector) {
            if (i.obj0 === UNDEFINED)
                i.obj0 = i.instantiateBinding(p.binding0, p.visibility0);
            list.push(i.obj0);
        }
        if (isPresent(p.binding1) && p.binding1.key.token === query.selector) {
            if (i.obj1 === UNDEFINED)
                i.obj1 = i.instantiateBinding(p.binding1, p.visibility1);
            list.push(i.obj1);
        }
        if (isPresent(p.binding2) && p.binding2.key.token === query.selector) {
            if (i.obj2 === UNDEFINED)
                i.obj2 = i.instantiateBinding(p.binding2, p.visibility2);
            list.push(i.obj2);
        }
        if (isPresent(p.binding3) && p.binding3.key.token === query.selector) {
            if (i.obj3 === UNDEFINED)
                i.obj3 = i.instantiateBinding(p.binding3, p.visibility3);
            list.push(i.obj3);
        }
        if (isPresent(p.binding4) && p.binding4.key.token === query.selector) {
            if (i.obj4 === UNDEFINED)
                i.obj4 = i.instantiateBinding(p.binding4, p.visibility4);
            list.push(i.obj4);
        }
        if (isPresent(p.binding5) && p.binding5.key.token === query.selector) {
            if (i.obj5 === UNDEFINED)
                i.obj5 = i.instantiateBinding(p.binding5, p.visibility5);
            list.push(i.obj5);
        }
        if (isPresent(p.binding6) && p.binding6.key.token === query.selector) {
            if (i.obj6 === UNDEFINED)
                i.obj6 = i.instantiateBinding(p.binding6, p.visibility6);
            list.push(i.obj6);
        }
        if (isPresent(p.binding7) && p.binding7.key.token === query.selector) {
            if (i.obj7 === UNDEFINED)
                i.obj7 = i.instantiateBinding(p.binding7, p.visibility7);
            list.push(i.obj7);
        }
        if (isPresent(p.binding8) && p.binding8.key.token === query.selector) {
            if (i.obj8 === UNDEFINED)
                i.obj8 = i.instantiateBinding(p.binding8, p.visibility8);
            list.push(i.obj8);
        }
        if (isPresent(p.binding9) && p.binding9.key.token === query.selector) {
            if (i.obj9 === UNDEFINED)
                i.obj9 = i.instantiateBinding(p.binding9, p.visibility9);
            list.push(i.obj9);
        }
    }
    getComponentBinding() {
        var p = this.injectorStrategy.protoStrategy;
        return p.binding0;
    }
}
/**
 * Strategy used by the `ElementInjector` when the number of bindings is 10 or less.
 * In such a case, inlining fields is benefitial for performances.
 */
class ElementInjectorDynamicStrategy {
    constructor(injectorStrategy, _ei) {
        this.injectorStrategy = injectorStrategy;
        this._ei = _ei;
    }
    hydrate() {
        var inj = this.injectorStrategy;
        var p = inj.protoStrategy;
        for (var i = 0; i < p.keyIds.length; i++) {
            if (p.bindings[i] instanceof DirectiveBinding && isPresent(p.keyIds[i]) &&
                inj.objs[i] === UNDEFINED) {
                inj.objs[i] = inj.instantiateBinding(p.bindings[i], p.visibilities[i]);
            }
        }
    }
    dehydrate() {
        var inj = this.injectorStrategy;
        ListWrapper.fill(inj.objs, UNDEFINED);
    }
    callOnDestroy() {
        var ist = this.injectorStrategy;
        var p = ist.protoStrategy;
        for (var i = 0; i < p.bindings.length; i++) {
            if (p.bindings[i] instanceof DirectiveBinding &&
                p.bindings[i].callOnDestroy) {
                ist.objs[i].onDestroy();
            }
        }
    }
    getComponent() { return this.injectorStrategy.objs[0]; }
    isComponentKey(key) {
        var p = this.injectorStrategy.protoStrategy;
        return this._ei._proto._firstBindingIsComponent && isPresent(key) && key.id === p.keyIds[0];
    }
    buildQueries() {
        var inj = this.injectorStrategy;
        var p = inj.protoStrategy;
        for (var i = 0; i < p.bindings.length; i++) {
            if (p.bindings[i] instanceof DirectiveBinding) {
                this._ei._buildQueriesForDeps(p.bindings[i].dependencies);
            }
        }
    }
    addDirectivesMatchingQuery(query, list) {
        var ist = this.injectorStrategy;
        var p = ist.protoStrategy;
        for (var i = 0; i < p.bindings.length; i++) {
            if (p.bindings[i].key.token === query.selector) {
                if (ist.objs[i] === UNDEFINED) {
                    ist.objs[i] = ist.instantiateBinding(p.bindings[i], p.visibilities[i]);
                }
                list.push(ist.objs[i]);
            }
        }
    }
    getComponentBinding() {
        var p = this.injectorStrategy.protoStrategy;
        return p.bindings[0];
    }
}
export class QueryError extends BaseException {
    // TODO(rado): pass the names of the active directives.
    constructor() {
        super();
        this.message = 'Only 3 queries can be concurrently active in a template.';
    }
    toString() { return this.message; }
}
export class QueryRef {
    constructor(query, list, originator) {
        this.query = query;
        this.list = list;
        this.originator = originator;
    }
    get isViewQuery() { return this.query.isViewQuery; }
    update() {
        var aggregator = [];
        if (this.query.isViewQuery) {
            // intentionally skipping originator for view queries.
            var rootViewInjectors = this.originator.getRootViewInjectors();
            for (var i = 0; i < rootViewInjectors.length; i++) {
                this.visit(rootViewInjectors[i], aggregator);
            }
        }
        else {
            this.visit(this.originator, aggregator);
        }
        this.list.reset(aggregator);
    }
    visit(inj, aggregator) {
        if (isBlank(inj) || !inj._hasQuery(this) || !inj.hydrated)
            return;
        if (this.query.isVarBindingQuery) {
            this._aggregateVariableBindings(inj, aggregator);
        }
        else {
            this._aggregateDirective(inj, aggregator);
        }
        var child = inj._head;
        while (isPresent(child)) {
            this.visit(child, aggregator);
            child = child._next;
        }
    }
    _aggregateVariableBindings(inj, aggregator) {
        var vb = this.query.varBindings;
        for (var i = 0; i < vb.length; ++i) {
            if (inj.hasVariableBinding(vb[i])) {
                aggregator.push(inj.getVariableBinding(vb[i]));
            }
        }
    }
    _aggregateDirective(inj, aggregator) {
        inj.addDirectivesMatchingQuery(this.query, aggregator);
    }
}
//# sourceMappingURL=element_injector.js.map
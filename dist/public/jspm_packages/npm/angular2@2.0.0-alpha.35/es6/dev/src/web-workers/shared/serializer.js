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
import { isArray, isPresent, serializeEnum, deserializeEnum, BaseException } from "angular2/src/facade/lang";
import { List, ListWrapper, Map, StringMapWrapper, MapWrapper } from "angular2/src/facade/collection";
import { ProtoViewDto, RenderDirectiveMetadata, RenderElementBinder, DirectiveBinder, ElementPropertyBinding, EventBinding, ViewDefinition, RenderProtoViewRef, RenderProtoViewMergeMapping, RenderViewRef, RenderFragmentRef, ViewType, ViewEncapsulation, PropertyBindingType } from "angular2/src/render/api";
import { WebWorkerElementRef } from 'angular2/src/web-workers/shared/api';
import { ASTWithSource } from 'angular2/src/change_detection/change_detection';
import { Parser } from "angular2/src/change_detection/parser/parser";
import { Injectable } from "angular2/di";
import { RenderProtoViewRefStore } from 'angular2/src/web-workers/shared/render_proto_view_ref_store';
import { RenderViewWithFragmentsStore } from 'angular2/src/web-workers/shared/render_view_with_fragments_store';
export let Serializer = class {
    constructor(_parser, _protoViewStore, _renderViewStore) {
        this._parser = _parser;
        this._protoViewStore = _protoViewStore;
        this._renderViewStore = _renderViewStore;
        this._enumRegistry = new Map();
        var viewTypeMap = new Map();
        viewTypeMap[0] = ViewType.HOST;
        viewTypeMap[1] = ViewType.COMPONENT;
        viewTypeMap[2] = ViewType.EMBEDDED;
        this._enumRegistry.set(ViewType, viewTypeMap);
        var viewEncapsulationMap = new Map();
        viewEncapsulationMap[0] = ViewEncapsulation.EMULATED;
        viewEncapsulationMap[1] = ViewEncapsulation.NATIVE;
        viewEncapsulationMap[2] = ViewEncapsulation.NONE;
        this._enumRegistry.set(ViewEncapsulation, viewEncapsulationMap);
        var propertyBindingTypeMap = new Map();
        propertyBindingTypeMap[0] = PropertyBindingType.PROPERTY;
        propertyBindingTypeMap[1] = PropertyBindingType.ATTRIBUTE;
        propertyBindingTypeMap[2] = PropertyBindingType.CLASS;
        propertyBindingTypeMap[3] = PropertyBindingType.STYLE;
        this._enumRegistry.set(PropertyBindingType, propertyBindingTypeMap);
    }
    serialize(obj, type) {
        if (!isPresent(obj)) {
            return null;
        }
        if (isArray(obj)) {
            var serializedObj = [];
            ListWrapper.forEach(obj, (val) => { serializedObj.push(this.serialize(val, type)); });
            return serializedObj;
        }
        if (type == String) {
            return obj;
        }
        if (type == ViewDefinition) {
            return this._serializeViewDefinition(obj);
        }
        else if (type == DirectiveBinder) {
            return this._serializeDirectiveBinder(obj);
        }
        else if (type == ProtoViewDto) {
            return this._serializeProtoViewDto(obj);
        }
        else if (type == RenderElementBinder) {
            return this._serializeElementBinder(obj);
        }
        else if (type == RenderDirectiveMetadata) {
            return this._serializeDirectiveMetadata(obj);
        }
        else if (type == ASTWithSource) {
            return this._serializeASTWithSource(obj);
        }
        else if (type == RenderProtoViewRef) {
            return this._protoViewStore.serialize(obj);
        }
        else if (type == RenderProtoViewMergeMapping) {
            return this._serializeRenderProtoViewMergeMapping(obj);
        }
        else if (type == RenderViewRef) {
            return this._renderViewStore.serializeRenderViewRef(obj);
        }
        else if (type == RenderFragmentRef) {
            return this._renderViewStore.serializeRenderFragmentRef(obj);
        }
        else if (type == WebWorkerElementRef) {
            return this._serializeWorkerElementRef(obj);
        }
        else if (type == ElementPropertyBinding) {
            return this._serializeElementPropertyBinding(obj);
        }
        else if (type == EventBinding) {
            return this._serializeEventBinding(obj);
        }
        else {
            throw new BaseException("No serializer for " + type.toString());
        }
    }
    deserialize(map, type, data) {
        if (!isPresent(map)) {
            return null;
        }
        if (isArray(map)) {
            var obj = new List();
            ListWrapper.forEach(map, (val) => { obj.push(this.deserialize(val, type, data)); });
            return obj;
        }
        if (type == String) {
            return map;
        }
        if (type == ViewDefinition) {
            return this._deserializeViewDefinition(map);
        }
        else if (type == DirectiveBinder) {
            return this._deserializeDirectiveBinder(map);
        }
        else if (type == ProtoViewDto) {
            return this._deserializeProtoViewDto(map);
        }
        else if (type == RenderDirectiveMetadata) {
            return this._deserializeDirectiveMetadata(map);
        }
        else if (type == RenderElementBinder) {
            return this._deserializeElementBinder(map);
        }
        else if (type == ASTWithSource) {
            return this._deserializeASTWithSource(map, data);
        }
        else if (type == RenderProtoViewRef) {
            return this._protoViewStore.deserialize(map);
        }
        else if (type == RenderProtoViewMergeMapping) {
            return this._deserializeRenderProtoViewMergeMapping(map);
        }
        else if (type == RenderViewRef) {
            return this._renderViewStore.deserializeRenderViewRef(map);
        }
        else if (type == RenderFragmentRef) {
            return this._renderViewStore.deserializeRenderFragmentRef(map);
        }
        else if (type == WebWorkerElementRef) {
            return this._deserializeWorkerElementRef(map);
        }
        else if (type == EventBinding) {
            return this._deserializeEventBinding(map);
        }
        else if (type == ElementPropertyBinding) {
            return this._deserializeElementPropertyBinding(map);
        }
        else {
            throw new BaseException("No deserializer for " + type.toString());
        }
    }
    mapToObject(map, type) {
        var object = {};
        var serialize = isPresent(type);
        MapWrapper.forEach(map, (value, key) => {
            if (serialize) {
                object[key] = this.serialize(value, type);
            }
            else {
                object[key] = value;
            }
        });
        return object;
    }
    /*
     * Transforms a Javascript object (StringMap) into a Map<string, V>
     * If the values need to be deserialized pass in their type
     * and they will be deserialized before being placed in the map
     */
    objectToMap(obj, type, data) {
        if (isPresent(type)) {
            var map = new Map();
            StringMapWrapper.forEach(obj, (val, key) => { map.set(key, this.deserialize(val, type, data)); });
            return map;
        }
        else {
            return MapWrapper.createFromStringMap(obj);
        }
    }
    allocateRenderViews(fragmentCount) { this._renderViewStore.allocate(fragmentCount); }
    _serializeElementPropertyBinding(binding) {
        return {
            'type': serializeEnum(binding.type),
            'astWithSource': this.serialize(binding.astWithSource, ASTWithSource),
            'property': binding.property,
            'unit': binding.unit
        };
    }
    _deserializeElementPropertyBinding(map) {
        var type = deserializeEnum(map['type'], this._enumRegistry.get(PropertyBindingType));
        var ast = this.deserialize(map['astWithSource'], ASTWithSource, "binding");
        return new ElementPropertyBinding(type, ast, map['property'], map['unit']);
    }
    _serializeEventBinding(binding) {
        return { 'fullName': binding.fullName, 'source': this.serialize(binding.source, ASTWithSource) };
    }
    _deserializeEventBinding(map) {
        return new EventBinding(map['fullName'], this.deserialize(map['source'], ASTWithSource, "action"));
    }
    _serializeWorkerElementRef(elementRef) {
        return {
            'renderView': this.serialize(elementRef.renderView, RenderViewRef),
            'renderBoundElementIndex': elementRef.renderBoundElementIndex
        };
    }
    _deserializeWorkerElementRef(map) {
        return new WebWorkerElementRef(this.deserialize(map['renderView'], RenderViewRef), map['renderBoundElementIndex']);
    }
    _serializeRenderProtoViewMergeMapping(mapping) {
        return {
            'mergedProtoViewRef': this._protoViewStore.serialize(mapping.mergedProtoViewRef),
            'fragmentCount': mapping.fragmentCount,
            'mappedElementIndices': mapping.mappedElementIndices,
            'mappedElementCount': mapping.mappedElementCount,
            'mappedTextIndices': mapping.mappedTextIndices,
            'hostElementIndicesByViewIndex': mapping.hostElementIndicesByViewIndex,
            'nestedViewCountByViewIndex': mapping.nestedViewCountByViewIndex
        };
    }
    _deserializeRenderProtoViewMergeMapping(obj) {
        return new RenderProtoViewMergeMapping(this._protoViewStore.deserialize(obj['mergedProtoViewRef']), obj['fragmentCount'], obj['mappedElementIndices'], obj['mappedElementCount'], obj['mappedTextIndices'], obj['hostElementIndicesByViewIndex'], obj['nestedViewCountByViewIndex']);
    }
    _serializeASTWithSource(tree) {
        return { 'input': tree.source, 'location': tree.location };
    }
    _deserializeASTWithSource(obj, data) {
        // TODO: make ASTs serializable
        var ast;
        switch (data) {
            case "action":
                ast = this._parser.parseAction(obj['input'], obj['location']);
                break;
            case "binding":
                ast = this._parser.parseBinding(obj['input'], obj['location']);
                break;
            case "interpolation":
                ast = this._parser.parseInterpolation(obj['input'], obj['location']);
                break;
            default:
                throw "No AST deserializer for " + data;
        }
        return ast;
    }
    _serializeViewDefinition(view) {
        return {
            'componentId': view.componentId,
            'templateAbsUrl': view.templateAbsUrl,
            'template': view.template,
            'directives': this.serialize(view.directives, RenderDirectiveMetadata),
            'styleAbsUrls': view.styleAbsUrls,
            'styles': view.styles,
            'encapsulation': serializeEnum(view.encapsulation)
        };
    }
    _deserializeViewDefinition(obj) {
        return new ViewDefinition({
            componentId: obj['componentId'],
            templateAbsUrl: obj['templateAbsUrl'], template: obj['template'],
            directives: this.deserialize(obj['directives'], RenderDirectiveMetadata),
            styleAbsUrls: obj['styleAbsUrls'],
            styles: obj['styles'],
            encapsulation: deserializeEnum(obj['encapsulation'], this._enumRegistry.get(ViewEncapsulation))
        });
    }
    _serializeDirectiveBinder(binder) {
        return {
            'directiveIndex': binder.directiveIndex,
            'propertyBindings': this.mapToObject(binder.propertyBindings, ASTWithSource),
            'eventBindings': this.serialize(binder.eventBindings, EventBinding),
            'hostPropertyBindings': this.serialize(binder.hostPropertyBindings, ElementPropertyBinding)
        };
    }
    _deserializeDirectiveBinder(obj) {
        return new DirectiveBinder({
            directiveIndex: obj['directiveIndex'],
            propertyBindings: this.objectToMap(obj['propertyBindings'], ASTWithSource, "binding"),
            eventBindings: this.deserialize(obj['eventBindings'], EventBinding),
            hostPropertyBindings: this.deserialize(obj['hostPropertyBindings'], ElementPropertyBinding)
        });
    }
    _serializeElementBinder(binder) {
        return {
            'index': binder.index,
            'parentIndex': binder.parentIndex,
            'distanceToParent': binder.distanceToParent,
            'directives': this.serialize(binder.directives, DirectiveBinder),
            'nestedProtoView': this.serialize(binder.nestedProtoView, ProtoViewDto),
            'propertyBindings': this.serialize(binder.propertyBindings, ElementPropertyBinding),
            'variableBindings': this.mapToObject(binder.variableBindings),
            'eventBindings': this.serialize(binder.eventBindings, EventBinding),
            'readAttributes': this.mapToObject(binder.readAttributes)
        };
    }
    _deserializeElementBinder(obj) {
        return new RenderElementBinder({
            index: obj['index'],
            parentIndex: obj['parentIndex'],
            distanceToParent: obj['distanceToParent'],
            directives: this.deserialize(obj['directives'], DirectiveBinder),
            nestedProtoView: this.deserialize(obj['nestedProtoView'], ProtoViewDto),
            propertyBindings: this.deserialize(obj['propertyBindings'], ElementPropertyBinding),
            variableBindings: this.objectToMap(obj['variableBindings']),
            eventBindings: this.deserialize(obj['eventBindings'], EventBinding),
            readAttributes: this.objectToMap(obj['readAttributes'])
        });
    }
    _serializeProtoViewDto(view) {
        return {
            'render': this._protoViewStore.serialize(view.render),
            'elementBinders': this.serialize(view.elementBinders, RenderElementBinder),
            'variableBindings': this.mapToObject(view.variableBindings),
            'type': serializeEnum(view.type),
            'textBindings': this.serialize(view.textBindings, ASTWithSource),
            'transitiveNgContentCount': view.transitiveNgContentCount
        };
    }
    _deserializeProtoViewDto(obj) {
        return new ProtoViewDto({
            render: this._protoViewStore.deserialize(obj["render"]),
            elementBinders: this.deserialize(obj['elementBinders'], RenderElementBinder),
            variableBindings: this.objectToMap(obj['variableBindings']),
            textBindings: this.deserialize(obj['textBindings'], ASTWithSource, "interpolation"),
            type: deserializeEnum(obj['type'], this._enumRegistry.get(ViewType)),
            transitiveNgContentCount: obj['transitiveNgContentCount']
        });
    }
    _serializeDirectiveMetadata(meta) {
        var obj = {
            'id': meta.id,
            'selector': meta.selector,
            'compileChildren': meta.compileChildren,
            'events': meta.events,
            'properties': meta.properties,
            'readAttributes': meta.readAttributes,
            'type': meta.type,
            'callOnDestroy': meta.callOnDestroy,
            'callOnChange': meta.callOnChange,
            'callOnCheck': meta.callOnCheck,
            'callOnInit': meta.callOnInit,
            'callOnAllChangesDone': meta.callOnAllChangesDone,
            'changeDetection': meta.changeDetection,
            'exportAs': meta.exportAs,
            'hostProperties': this.mapToObject(meta.hostProperties),
            'hostListeners': this.mapToObject(meta.hostListeners),
            'hostActions': this.mapToObject(meta.hostActions),
            'hostAttributes': this.mapToObject(meta.hostAttributes)
        };
        return obj;
    }
    _deserializeDirectiveMetadata(obj) {
        return new RenderDirectiveMetadata({
            id: obj['id'],
            selector: obj['selector'],
            compileChildren: obj['compileChildren'],
            hostProperties: this.objectToMap(obj['hostProperties']),
            hostListeners: this.objectToMap(obj['hostListeners']),
            hostActions: this.objectToMap(obj['hostActions']),
            hostAttributes: this.objectToMap(obj['hostAttributes']),
            properties: obj['properties'],
            readAttributes: obj['readAttributes'],
            type: obj['type'],
            exportAs: obj['exportAs'],
            callOnDestroy: obj['callOnDestroy'],
            callOnChange: obj['callOnChange'],
            callOnCheck: obj['callOnCheck'],
            callOnInit: obj['callOnInit'],
            callOnAllChangesDone: obj['callOnAllChangesDone'],
            changeDetection: obj['changeDetection'],
            events: obj['events']
        });
    }
};
Serializer = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [Parser, RenderProtoViewRefStore, RenderViewWithFragmentsStore])
], Serializer);
//# sourceMappingURL=serializer.js.map
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
var lang_1 = require("../../facade/lang");
var collection_1 = require("../../facade/collection");
var api_1 = require("../../render/api");
var api_2 = require("./api");
var change_detection_1 = require("../../change_detection/change_detection");
var parser_1 = require("../../change_detection/parser/parser");
var di_1 = require("../../../di");
var render_proto_view_ref_store_1 = require("./render_proto_view_ref_store");
var render_view_with_fragments_store_1 = require("./render_view_with_fragments_store");
var Serializer = (function() {
  function Serializer(_parser, _protoViewStore, _renderViewStore) {
    this._parser = _parser;
    this._protoViewStore = _protoViewStore;
    this._renderViewStore = _renderViewStore;
    this._enumRegistry = new collection_1.Map();
    var viewTypeMap = new collection_1.Map();
    viewTypeMap[0] = api_1.ViewType.HOST;
    viewTypeMap[1] = api_1.ViewType.COMPONENT;
    viewTypeMap[2] = api_1.ViewType.EMBEDDED;
    this._enumRegistry.set(api_1.ViewType, viewTypeMap);
    var viewEncapsulationMap = new collection_1.Map();
    viewEncapsulationMap[0] = api_1.ViewEncapsulation.EMULATED;
    viewEncapsulationMap[1] = api_1.ViewEncapsulation.NATIVE;
    viewEncapsulationMap[2] = api_1.ViewEncapsulation.NONE;
    this._enumRegistry.set(api_1.ViewEncapsulation, viewEncapsulationMap);
    var propertyBindingTypeMap = new collection_1.Map();
    propertyBindingTypeMap[0] = api_1.PropertyBindingType.PROPERTY;
    propertyBindingTypeMap[1] = api_1.PropertyBindingType.ATTRIBUTE;
    propertyBindingTypeMap[2] = api_1.PropertyBindingType.CLASS;
    propertyBindingTypeMap[3] = api_1.PropertyBindingType.STYLE;
    this._enumRegistry.set(api_1.PropertyBindingType, propertyBindingTypeMap);
  }
  Serializer.prototype.serialize = function(obj, type) {
    var _this = this;
    if (!lang_1.isPresent(obj)) {
      return null;
    }
    if (lang_1.isArray(obj)) {
      var serializedObj = [];
      collection_1.ListWrapper.forEach(obj, function(val) {
        serializedObj.push(_this.serialize(val, type));
      });
      return serializedObj;
    }
    if (type == String) {
      return obj;
    }
    if (type == api_1.ViewDefinition) {
      return this._serializeViewDefinition(obj);
    } else if (type == api_1.DirectiveBinder) {
      return this._serializeDirectiveBinder(obj);
    } else if (type == api_1.ProtoViewDto) {
      return this._serializeProtoViewDto(obj);
    } else if (type == api_1.RenderElementBinder) {
      return this._serializeElementBinder(obj);
    } else if (type == api_1.RenderDirectiveMetadata) {
      return this._serializeDirectiveMetadata(obj);
    } else if (type == change_detection_1.ASTWithSource) {
      return this._serializeASTWithSource(obj);
    } else if (type == api_1.RenderProtoViewRef) {
      return this._protoViewStore.serialize(obj);
    } else if (type == api_1.RenderProtoViewMergeMapping) {
      return this._serializeRenderProtoViewMergeMapping(obj);
    } else if (type == api_1.RenderViewRef) {
      return this._renderViewStore.serializeRenderViewRef(obj);
    } else if (type == api_1.RenderFragmentRef) {
      return this._renderViewStore.serializeRenderFragmentRef(obj);
    } else if (type == api_2.WebWorkerElementRef) {
      return this._serializeWorkerElementRef(obj);
    } else if (type == api_1.ElementPropertyBinding) {
      return this._serializeElementPropertyBinding(obj);
    } else if (type == api_1.EventBinding) {
      return this._serializeEventBinding(obj);
    } else {
      throw new lang_1.BaseException("No serializer for " + type.toString());
    }
  };
  Serializer.prototype.deserialize = function(map, type, data) {
    var _this = this;
    if (!lang_1.isPresent(map)) {
      return null;
    }
    if (lang_1.isArray(map)) {
      var obj = new collection_1.List();
      collection_1.ListWrapper.forEach(map, function(val) {
        obj.push(_this.deserialize(val, type, data));
      });
      return obj;
    }
    if (type == String) {
      return map;
    }
    if (type == api_1.ViewDefinition) {
      return this._deserializeViewDefinition(map);
    } else if (type == api_1.DirectiveBinder) {
      return this._deserializeDirectiveBinder(map);
    } else if (type == api_1.ProtoViewDto) {
      return this._deserializeProtoViewDto(map);
    } else if (type == api_1.RenderDirectiveMetadata) {
      return this._deserializeDirectiveMetadata(map);
    } else if (type == api_1.RenderElementBinder) {
      return this._deserializeElementBinder(map);
    } else if (type == change_detection_1.ASTWithSource) {
      return this._deserializeASTWithSource(map, data);
    } else if (type == api_1.RenderProtoViewRef) {
      return this._protoViewStore.deserialize(map);
    } else if (type == api_1.RenderProtoViewMergeMapping) {
      return this._deserializeRenderProtoViewMergeMapping(map);
    } else if (type == api_1.RenderViewRef) {
      return this._renderViewStore.deserializeRenderViewRef(map);
    } else if (type == api_1.RenderFragmentRef) {
      return this._renderViewStore.deserializeRenderFragmentRef(map);
    } else if (type == api_2.WebWorkerElementRef) {
      return this._deserializeWorkerElementRef(map);
    } else if (type == api_1.EventBinding) {
      return this._deserializeEventBinding(map);
    } else if (type == api_1.ElementPropertyBinding) {
      return this._deserializeElementPropertyBinding(map);
    } else {
      throw new lang_1.BaseException("No deserializer for " + type.toString());
    }
  };
  Serializer.prototype.mapToObject = function(map, type) {
    var _this = this;
    var object = {};
    var serialize = lang_1.isPresent(type);
    collection_1.MapWrapper.forEach(map, function(value, key) {
      if (serialize) {
        object[key] = _this.serialize(value, type);
      } else {
        object[key] = value;
      }
    });
    return object;
  };
  Serializer.prototype.objectToMap = function(obj, type, data) {
    var _this = this;
    if (lang_1.isPresent(type)) {
      var map = new collection_1.Map();
      collection_1.StringMapWrapper.forEach(obj, function(val, key) {
        map.set(key, _this.deserialize(val, type, data));
      });
      return map;
    } else {
      return collection_1.MapWrapper.createFromStringMap(obj);
    }
  };
  Serializer.prototype.allocateRenderViews = function(fragmentCount) {
    this._renderViewStore.allocate(fragmentCount);
  };
  Serializer.prototype._serializeElementPropertyBinding = function(binding) {
    return {
      'type': lang_1.serializeEnum(binding.type),
      'astWithSource': this.serialize(binding.astWithSource, change_detection_1.ASTWithSource),
      'property': binding.property,
      'unit': binding.unit
    };
  };
  Serializer.prototype._deserializeElementPropertyBinding = function(map) {
    var type = lang_1.deserializeEnum(map['type'], this._enumRegistry.get(api_1.PropertyBindingType));
    var ast = this.deserialize(map['astWithSource'], change_detection_1.ASTWithSource, "binding");
    return new api_1.ElementPropertyBinding(type, ast, map['property'], map['unit']);
  };
  Serializer.prototype._serializeEventBinding = function(binding) {
    return {
      'fullName': binding.fullName,
      'source': this.serialize(binding.source, change_detection_1.ASTWithSource)
    };
  };
  Serializer.prototype._deserializeEventBinding = function(map) {
    return new api_1.EventBinding(map['fullName'], this.deserialize(map['source'], change_detection_1.ASTWithSource, "action"));
  };
  Serializer.prototype._serializeWorkerElementRef = function(elementRef) {
    return {
      'renderView': this.serialize(elementRef.renderView, api_1.RenderViewRef),
      'renderBoundElementIndex': elementRef.renderBoundElementIndex
    };
  };
  Serializer.prototype._deserializeWorkerElementRef = function(map) {
    return new api_2.WebWorkerElementRef(this.deserialize(map['renderView'], api_1.RenderViewRef), map['renderBoundElementIndex']);
  };
  Serializer.prototype._serializeRenderProtoViewMergeMapping = function(mapping) {
    return {
      'mergedProtoViewRef': this._protoViewStore.serialize(mapping.mergedProtoViewRef),
      'fragmentCount': mapping.fragmentCount,
      'mappedElementIndices': mapping.mappedElementIndices,
      'mappedElementCount': mapping.mappedElementCount,
      'mappedTextIndices': mapping.mappedTextIndices,
      'hostElementIndicesByViewIndex': mapping.hostElementIndicesByViewIndex,
      'nestedViewCountByViewIndex': mapping.nestedViewCountByViewIndex
    };
  };
  Serializer.prototype._deserializeRenderProtoViewMergeMapping = function(obj) {
    return new api_1.RenderProtoViewMergeMapping(this._protoViewStore.deserialize(obj['mergedProtoViewRef']), obj['fragmentCount'], obj['mappedElementIndices'], obj['mappedElementCount'], obj['mappedTextIndices'], obj['hostElementIndicesByViewIndex'], obj['nestedViewCountByViewIndex']);
  };
  Serializer.prototype._serializeASTWithSource = function(tree) {
    return {
      'input': tree.source,
      'location': tree.location
    };
  };
  Serializer.prototype._deserializeASTWithSource = function(obj, data) {
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
  };
  Serializer.prototype._serializeViewDefinition = function(view) {
    return {
      'componentId': view.componentId,
      'templateAbsUrl': view.templateAbsUrl,
      'template': view.template,
      'directives': this.serialize(view.directives, api_1.RenderDirectiveMetadata),
      'styleAbsUrls': view.styleAbsUrls,
      'styles': view.styles,
      'encapsulation': lang_1.serializeEnum(view.encapsulation)
    };
  };
  Serializer.prototype._deserializeViewDefinition = function(obj) {
    return new api_1.ViewDefinition({
      componentId: obj['componentId'],
      templateAbsUrl: obj['templateAbsUrl'],
      template: obj['template'],
      directives: this.deserialize(obj['directives'], api_1.RenderDirectiveMetadata),
      styleAbsUrls: obj['styleAbsUrls'],
      styles: obj['styles'],
      encapsulation: lang_1.deserializeEnum(obj['encapsulation'], this._enumRegistry.get(api_1.ViewEncapsulation))
    });
  };
  Serializer.prototype._serializeDirectiveBinder = function(binder) {
    return {
      'directiveIndex': binder.directiveIndex,
      'propertyBindings': this.mapToObject(binder.propertyBindings, change_detection_1.ASTWithSource),
      'eventBindings': this.serialize(binder.eventBindings, api_1.EventBinding),
      'hostPropertyBindings': this.serialize(binder.hostPropertyBindings, api_1.ElementPropertyBinding)
    };
  };
  Serializer.prototype._deserializeDirectiveBinder = function(obj) {
    return new api_1.DirectiveBinder({
      directiveIndex: obj['directiveIndex'],
      propertyBindings: this.objectToMap(obj['propertyBindings'], change_detection_1.ASTWithSource, "binding"),
      eventBindings: this.deserialize(obj['eventBindings'], api_1.EventBinding),
      hostPropertyBindings: this.deserialize(obj['hostPropertyBindings'], api_1.ElementPropertyBinding)
    });
  };
  Serializer.prototype._serializeElementBinder = function(binder) {
    return {
      'index': binder.index,
      'parentIndex': binder.parentIndex,
      'distanceToParent': binder.distanceToParent,
      'directives': this.serialize(binder.directives, api_1.DirectiveBinder),
      'nestedProtoView': this.serialize(binder.nestedProtoView, api_1.ProtoViewDto),
      'propertyBindings': this.serialize(binder.propertyBindings, api_1.ElementPropertyBinding),
      'variableBindings': this.mapToObject(binder.variableBindings),
      'eventBindings': this.serialize(binder.eventBindings, api_1.EventBinding),
      'readAttributes': this.mapToObject(binder.readAttributes)
    };
  };
  Serializer.prototype._deserializeElementBinder = function(obj) {
    return new api_1.RenderElementBinder({
      index: obj['index'],
      parentIndex: obj['parentIndex'],
      distanceToParent: obj['distanceToParent'],
      directives: this.deserialize(obj['directives'], api_1.DirectiveBinder),
      nestedProtoView: this.deserialize(obj['nestedProtoView'], api_1.ProtoViewDto),
      propertyBindings: this.deserialize(obj['propertyBindings'], api_1.ElementPropertyBinding),
      variableBindings: this.objectToMap(obj['variableBindings']),
      eventBindings: this.deserialize(obj['eventBindings'], api_1.EventBinding),
      readAttributes: this.objectToMap(obj['readAttributes'])
    });
  };
  Serializer.prototype._serializeProtoViewDto = function(view) {
    return {
      'render': this._protoViewStore.serialize(view.render),
      'elementBinders': this.serialize(view.elementBinders, api_1.RenderElementBinder),
      'variableBindings': this.mapToObject(view.variableBindings),
      'type': lang_1.serializeEnum(view.type),
      'textBindings': this.serialize(view.textBindings, change_detection_1.ASTWithSource),
      'transitiveNgContentCount': view.transitiveNgContentCount
    };
  };
  Serializer.prototype._deserializeProtoViewDto = function(obj) {
    return new api_1.ProtoViewDto({
      render: this._protoViewStore.deserialize(obj["render"]),
      elementBinders: this.deserialize(obj['elementBinders'], api_1.RenderElementBinder),
      variableBindings: this.objectToMap(obj['variableBindings']),
      textBindings: this.deserialize(obj['textBindings'], change_detection_1.ASTWithSource, "interpolation"),
      type: lang_1.deserializeEnum(obj['type'], this._enumRegistry.get(api_1.ViewType)),
      transitiveNgContentCount: obj['transitiveNgContentCount']
    });
  };
  Serializer.prototype._serializeDirectiveMetadata = function(meta) {
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
  };
  Serializer.prototype._deserializeDirectiveMetadata = function(obj) {
    return new api_1.RenderDirectiveMetadata({
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
  };
  Serializer = __decorate([di_1.Injectable(), __metadata('design:paramtypes', [parser_1.Parser, render_proto_view_ref_store_1.RenderProtoViewRefStore, render_view_with_fragments_store_1.RenderViewWithFragmentsStore])], Serializer);
  return Serializer;
})();
exports.Serializer = Serializer;

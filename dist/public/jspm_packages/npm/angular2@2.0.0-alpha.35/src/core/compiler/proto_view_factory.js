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
var lang_1 = require("../../facade/lang");
var reflection_1 = require("../../reflection/reflection");
var change_detection_1 = require("../../change_detection/change_detection");
var pipes_1 = require("../pipes/pipes");
var api_1 = require("../../render/api");
var view_1 = require("./view");
var element_injector_1 = require("./element_injector");
var BindingRecordsCreator = (function() {
  function BindingRecordsCreator() {
    this._directiveRecordsMap = new Map();
  }
  BindingRecordsCreator.prototype.getEventBindingRecords = function(elementBinders, allDirectiveMetadatas) {
    var res = [];
    for (var boundElementIndex = 0; boundElementIndex < elementBinders.length; boundElementIndex++) {
      var renderElementBinder = elementBinders[boundElementIndex];
      this._createTemplateEventRecords(res, renderElementBinder, boundElementIndex);
      this._createHostEventRecords(res, renderElementBinder, allDirectiveMetadatas, boundElementIndex);
    }
    return res;
  };
  BindingRecordsCreator.prototype._createTemplateEventRecords = function(res, renderElementBinder, boundElementIndex) {
    renderElementBinder.eventBindings.forEach(function(eb) {
      res.push(change_detection_1.BindingRecord.createForEvent(eb.source, eb.fullName, boundElementIndex));
    });
  };
  BindingRecordsCreator.prototype._createHostEventRecords = function(res, renderElementBinder, allDirectiveMetadatas, boundElementIndex) {
    for (var i = 0; i < renderElementBinder.directives.length; ++i) {
      var dir = renderElementBinder.directives[i];
      var directiveMetadata = allDirectiveMetadatas[dir.directiveIndex];
      var dirRecord = this._getDirectiveRecord(boundElementIndex, i, directiveMetadata);
      dir.eventBindings.forEach(function(heb) {
        res.push(change_detection_1.BindingRecord.createForHostEvent(heb.source, heb.fullName, dirRecord));
      });
    }
  };
  BindingRecordsCreator.prototype.getPropertyBindingRecords = function(textBindings, elementBinders, allDirectiveMetadatas) {
    var bindings = [];
    this._createTextNodeRecords(bindings, textBindings);
    for (var boundElementIndex = 0; boundElementIndex < elementBinders.length; boundElementIndex++) {
      var renderElementBinder = elementBinders[boundElementIndex];
      this._createElementPropertyRecords(bindings, boundElementIndex, renderElementBinder);
      this._createDirectiveRecords(bindings, boundElementIndex, renderElementBinder.directives, allDirectiveMetadatas);
    }
    return bindings;
  };
  BindingRecordsCreator.prototype.getDirectiveRecords = function(elementBinders, allDirectiveMetadatas) {
    var directiveRecords = [];
    for (var elementIndex = 0; elementIndex < elementBinders.length; ++elementIndex) {
      var dirs = elementBinders[elementIndex].directives;
      for (var dirIndex = 0; dirIndex < dirs.length; ++dirIndex) {
        directiveRecords.push(this._getDirectiveRecord(elementIndex, dirIndex, allDirectiveMetadatas[dirs[dirIndex].directiveIndex]));
      }
    }
    return directiveRecords;
  };
  BindingRecordsCreator.prototype._createTextNodeRecords = function(bindings, textBindings) {
    for (var i = 0; i < textBindings.length; i++) {
      bindings.push(change_detection_1.BindingRecord.createForTextNode(textBindings[i], i));
    }
  };
  BindingRecordsCreator.prototype._createElementPropertyRecords = function(bindings, boundElementIndex, renderElementBinder) {
    collection_1.ListWrapper.forEach(renderElementBinder.propertyBindings, function(binding) {
      if (binding.type === api_1.PropertyBindingType.PROPERTY) {
        bindings.push(change_detection_1.BindingRecord.createForElementProperty(binding.astWithSource, boundElementIndex, binding.property));
      } else if (binding.type === api_1.PropertyBindingType.ATTRIBUTE) {
        bindings.push(change_detection_1.BindingRecord.createForElementAttribute(binding.astWithSource, boundElementIndex, binding.property));
      } else if (binding.type === api_1.PropertyBindingType.CLASS) {
        bindings.push(change_detection_1.BindingRecord.createForElementClass(binding.astWithSource, boundElementIndex, binding.property));
      } else if (binding.type === api_1.PropertyBindingType.STYLE) {
        bindings.push(change_detection_1.BindingRecord.createForElementStyle(binding.astWithSource, boundElementIndex, binding.property, binding.unit));
      }
    });
  };
  BindingRecordsCreator.prototype._createDirectiveRecords = function(bindings, boundElementIndex, directiveBinders, allDirectiveMetadatas) {
    for (var i = 0; i < directiveBinders.length; i++) {
      var directiveBinder = directiveBinders[i];
      var directiveMetadata = allDirectiveMetadatas[directiveBinder.directiveIndex];
      var directiveRecord = this._getDirectiveRecord(boundElementIndex, i, directiveMetadata);
      collection_1.MapWrapper.forEach(directiveBinder.propertyBindings, function(astWithSource, propertyName) {
        var setter = reflection_1.reflector.setter(propertyName);
        bindings.push(change_detection_1.BindingRecord.createForDirective(astWithSource, propertyName, setter, directiveRecord));
      });
      if (directiveRecord.callOnChange) {
        bindings.push(change_detection_1.BindingRecord.createDirectiveOnChange(directiveRecord));
      }
      if (directiveRecord.callOnInit) {
        bindings.push(change_detection_1.BindingRecord.createDirectiveOnInit(directiveRecord));
      }
      if (directiveRecord.callOnCheck) {
        bindings.push(change_detection_1.BindingRecord.createDirectiveOnCheck(directiveRecord));
      }
    }
    for (var i = 0; i < directiveBinders.length; i++) {
      var directiveBinder = directiveBinders[i];
      collection_1.ListWrapper.forEach(directiveBinder.hostPropertyBindings, function(binding) {
        var dirIndex = new change_detection_1.DirectiveIndex(boundElementIndex, i);
        if (binding.type === api_1.PropertyBindingType.PROPERTY) {
          bindings.push(change_detection_1.BindingRecord.createForHostProperty(dirIndex, binding.astWithSource, binding.property));
        } else if (binding.type === api_1.PropertyBindingType.ATTRIBUTE) {
          bindings.push(change_detection_1.BindingRecord.createForHostAttribute(dirIndex, binding.astWithSource, binding.property));
        } else if (binding.type === api_1.PropertyBindingType.CLASS) {
          bindings.push(change_detection_1.BindingRecord.createForHostClass(dirIndex, binding.astWithSource, binding.property));
        } else if (binding.type === api_1.PropertyBindingType.STYLE) {
          bindings.push(change_detection_1.BindingRecord.createForHostStyle(dirIndex, binding.astWithSource, binding.property, binding.unit));
        }
      });
    }
  };
  BindingRecordsCreator.prototype._getDirectiveRecord = function(boundElementIndex, directiveIndex, directiveMetadata) {
    var id = boundElementIndex * 100 + directiveIndex;
    if (!this._directiveRecordsMap.has(id)) {
      this._directiveRecordsMap.set(id, new change_detection_1.DirectiveRecord({
        directiveIndex: new change_detection_1.DirectiveIndex(boundElementIndex, directiveIndex),
        callOnAllChangesDone: directiveMetadata.callOnAllChangesDone,
        callOnChange: directiveMetadata.callOnChange,
        callOnCheck: directiveMetadata.callOnCheck,
        callOnInit: directiveMetadata.callOnInit,
        changeDetection: directiveMetadata.changeDetection
      }));
    }
    return this._directiveRecordsMap.get(id);
  };
  return BindingRecordsCreator;
})();
exports.BindingRecordsCreator = BindingRecordsCreator;
var ProtoViewFactory = (function() {
  function ProtoViewFactory(_changeDetection) {
    this._changeDetection = _changeDetection;
  }
  ProtoViewFactory.prototype.createAppProtoViews = function(hostComponentBinding, rootRenderProtoView, allDirectives, pipes) {
    var _this = this;
    var allRenderDirectiveMetadata = collection_1.ListWrapper.map(allDirectives, function(directiveBinding) {
      return directiveBinding.metadata;
    });
    var nestedPvsWithIndex = _collectNestedProtoViews(rootRenderProtoView);
    var nestedPvVariableBindings = _collectNestedProtoViewsVariableBindings(nestedPvsWithIndex);
    var nestedPvVariableNames = _collectNestedProtoViewsVariableNames(nestedPvsWithIndex);
    var changeDetectorDefs = _getChangeDetectorDefinitions(hostComponentBinding.metadata, nestedPvsWithIndex, nestedPvVariableNames, allRenderDirectiveMetadata);
    var protoChangeDetectors = collection_1.ListWrapper.map(changeDetectorDefs, function(changeDetectorDef) {
      return _this._changeDetection.createProtoChangeDetector(changeDetectorDef);
    });
    var appProtoViews = collection_1.ListWrapper.createFixedSize(nestedPvsWithIndex.length);
    collection_1.ListWrapper.forEach(nestedPvsWithIndex, function(pvWithIndex) {
      var appProtoView = _createAppProtoView(pvWithIndex.renderProtoView, protoChangeDetectors[pvWithIndex.index], nestedPvVariableBindings[pvWithIndex.index], allDirectives, pipes);
      if (lang_1.isPresent(pvWithIndex.parentIndex)) {
        var parentView = appProtoViews[pvWithIndex.parentIndex];
        parentView.elementBinders[pvWithIndex.boundElementIndex].nestedProtoView = appProtoView;
      }
      appProtoViews[pvWithIndex.index] = appProtoView;
    });
    return appProtoViews;
  };
  ProtoViewFactory = __decorate([di_1.Injectable(), __metadata('design:paramtypes', [change_detection_1.ChangeDetection])], ProtoViewFactory);
  return ProtoViewFactory;
})();
exports.ProtoViewFactory = ProtoViewFactory;
function getChangeDetectorDefinitions(hostComponentMetadata, rootRenderProtoView, allRenderDirectiveMetadata) {
  var nestedPvsWithIndex = _collectNestedProtoViews(rootRenderProtoView);
  var nestedPvVariableNames = _collectNestedProtoViewsVariableNames(nestedPvsWithIndex);
  return _getChangeDetectorDefinitions(hostComponentMetadata, nestedPvsWithIndex, nestedPvVariableNames, allRenderDirectiveMetadata);
}
exports.getChangeDetectorDefinitions = getChangeDetectorDefinitions;
function _collectNestedProtoViews(renderProtoView, parentIndex, boundElementIndex, result) {
  if (parentIndex === void 0) {
    parentIndex = null;
  }
  if (boundElementIndex === void 0) {
    boundElementIndex = null;
  }
  if (result === void 0) {
    result = null;
  }
  if (lang_1.isBlank(result)) {
    result = [];
  }
  result.push(new RenderProtoViewWithIndex(renderProtoView, result.length, parentIndex, boundElementIndex));
  var currentIndex = result.length - 1;
  var childBoundElementIndex = 0;
  collection_1.ListWrapper.forEach(renderProtoView.elementBinders, function(elementBinder) {
    if (lang_1.isPresent(elementBinder.nestedProtoView)) {
      _collectNestedProtoViews(elementBinder.nestedProtoView, currentIndex, childBoundElementIndex, result);
    }
    childBoundElementIndex++;
  });
  return result;
}
function _getChangeDetectorDefinitions(hostComponentMetadata, nestedPvsWithIndex, nestedPvVariableNames, allRenderDirectiveMetadata) {
  return collection_1.ListWrapper.map(nestedPvsWithIndex, function(pvWithIndex) {
    var elementBinders = pvWithIndex.renderProtoView.elementBinders;
    var bindingRecordsCreator = new BindingRecordsCreator();
    var propBindingRecords = bindingRecordsCreator.getPropertyBindingRecords(pvWithIndex.renderProtoView.textBindings, elementBinders, allRenderDirectiveMetadata);
    var eventBindingRecords = bindingRecordsCreator.getEventBindingRecords(elementBinders, allRenderDirectiveMetadata);
    var directiveRecords = bindingRecordsCreator.getDirectiveRecords(elementBinders, allRenderDirectiveMetadata);
    var strategyName = change_detection_1.DEFAULT;
    var typeString;
    if (pvWithIndex.renderProtoView.type === api_1.ViewType.COMPONENT) {
      strategyName = hostComponentMetadata.changeDetection;
      typeString = 'comp';
    } else if (pvWithIndex.renderProtoView.type === api_1.ViewType.HOST) {
      typeString = 'host';
    } else {
      typeString = 'embedded';
    }
    var id = hostComponentMetadata.id + "_" + typeString + "_" + pvWithIndex.index;
    var variableNames = nestedPvVariableNames[pvWithIndex.index];
    return new change_detection_1.ChangeDetectorDefinition(id, strategyName, variableNames, propBindingRecords, eventBindingRecords, directiveRecords, lang_1.assertionsEnabled());
  });
}
function _createAppProtoView(renderProtoView, protoChangeDetector, variableBindings, allDirectives, pipes) {
  var elementBinders = renderProtoView.elementBinders;
  var protoPipes = new pipes_1.ProtoPipes(pipes);
  var protoView = new view_1.AppProtoView(renderProtoView.type, renderProtoView.transitiveNgContentCount > 0, renderProtoView.render, protoChangeDetector, variableBindings, createVariableLocations(elementBinders), renderProtoView.textBindings.length, protoPipes);
  _createElementBinders(protoView, elementBinders, allDirectives);
  return protoView;
}
function _collectNestedProtoViewsVariableBindings(nestedPvsWithIndex) {
  return collection_1.ListWrapper.map(nestedPvsWithIndex, function(pvWithIndex) {
    return _createVariableBindings(pvWithIndex.renderProtoView);
  });
}
function _createVariableBindings(renderProtoView) {
  var variableBindings = new Map();
  collection_1.MapWrapper.forEach(renderProtoView.variableBindings, function(mappedName, varName) {
    variableBindings.set(varName, mappedName);
  });
  return variableBindings;
}
function _collectNestedProtoViewsVariableNames(nestedPvsWithIndex) {
  var nestedPvVariableNames = collection_1.ListWrapper.createFixedSize(nestedPvsWithIndex.length);
  collection_1.ListWrapper.forEach(nestedPvsWithIndex, function(pvWithIndex) {
    var parentVariableNames = lang_1.isPresent(pvWithIndex.parentIndex) ? nestedPvVariableNames[pvWithIndex.parentIndex] : null;
    nestedPvVariableNames[pvWithIndex.index] = _createVariableNames(parentVariableNames, pvWithIndex.renderProtoView);
  });
  return nestedPvVariableNames;
}
function _createVariableNames(parentVariableNames, renderProtoView) {
  var res = lang_1.isBlank(parentVariableNames) ? [] : collection_1.ListWrapper.clone(parentVariableNames);
  collection_1.MapWrapper.forEach(renderProtoView.variableBindings, function(mappedName, varName) {
    res.push(mappedName);
  });
  collection_1.ListWrapper.forEach(renderProtoView.elementBinders, function(binder) {
    collection_1.MapWrapper.forEach(binder.variableBindings, function(mappedName, varName) {
      res.push(mappedName);
    });
  });
  return res;
}
function createVariableLocations(elementBinders) {
  var variableLocations = new Map();
  for (var i = 0; i < elementBinders.length; i++) {
    var binder = elementBinders[i];
    collection_1.MapWrapper.forEach(binder.variableBindings, function(mappedName, varName) {
      variableLocations.set(mappedName, i);
    });
  }
  return variableLocations;
}
exports.createVariableLocations = createVariableLocations;
function _createElementBinders(protoView, elementBinders, allDirectiveBindings) {
  for (var i = 0; i < elementBinders.length; i++) {
    var renderElementBinder = elementBinders[i];
    var dirs = elementBinders[i].directives;
    var parentPeiWithDistance = _findParentProtoElementInjectorWithDistance(i, protoView.elementBinders, elementBinders);
    var directiveBindings = collection_1.ListWrapper.map(dirs, function(dir) {
      return allDirectiveBindings[dir.directiveIndex];
    });
    var componentDirectiveBinding = null;
    if (directiveBindings.length > 0) {
      if (directiveBindings[0].metadata.type === api_1.RenderDirectiveMetadata.COMPONENT_TYPE) {
        componentDirectiveBinding = directiveBindings[0];
      }
    }
    var protoElementInjector = _createProtoElementInjector(i, parentPeiWithDistance, renderElementBinder, componentDirectiveBinding, directiveBindings);
    _createElementBinder(protoView, i, renderElementBinder, protoElementInjector, componentDirectiveBinding, directiveBindings);
  }
}
function _findParentProtoElementInjectorWithDistance(binderIndex, elementBinders, renderElementBinders) {
  var distance = 0;
  do {
    var renderElementBinder = renderElementBinders[binderIndex];
    binderIndex = renderElementBinder.parentIndex;
    if (binderIndex !== -1) {
      distance += renderElementBinder.distanceToParent;
      var elementBinder = elementBinders[binderIndex];
      if (lang_1.isPresent(elementBinder.protoElementInjector)) {
        return new ParentProtoElementInjectorWithDistance(elementBinder.protoElementInjector, distance);
      }
    }
  } while (binderIndex !== -1);
  return new ParentProtoElementInjectorWithDistance(null, 0);
}
function _createProtoElementInjector(binderIndex, parentPeiWithDistance, renderElementBinder, componentDirectiveBinding, directiveBindings) {
  var protoElementInjector = null;
  var hasVariables = collection_1.MapWrapper.size(renderElementBinder.variableBindings) > 0;
  if (directiveBindings.length > 0 || hasVariables || lang_1.isPresent(renderElementBinder.nestedProtoView)) {
    var directiveVariableBindings = createDirectiveVariableBindings(renderElementBinder, directiveBindings);
    protoElementInjector = element_injector_1.ProtoElementInjector.create(parentPeiWithDistance.protoElementInjector, binderIndex, directiveBindings, lang_1.isPresent(componentDirectiveBinding), parentPeiWithDistance.distance, directiveVariableBindings);
    protoElementInjector.attributes = renderElementBinder.readAttributes;
  }
  return protoElementInjector;
}
function _createElementBinder(protoView, boundElementIndex, renderElementBinder, protoElementInjector, componentDirectiveBinding, directiveBindings) {
  var parent = null;
  if (renderElementBinder.parentIndex !== -1) {
    parent = protoView.elementBinders[renderElementBinder.parentIndex];
  }
  var elBinder = protoView.bindElement(parent, renderElementBinder.distanceToParent, protoElementInjector, componentDirectiveBinding);
  collection_1.MapWrapper.forEach(renderElementBinder.variableBindings, function(mappedName, varName) {
    protoView.protoLocals.set(mappedName, null);
  });
  return elBinder;
}
function createDirectiveVariableBindings(renderElementBinder, directiveBindings) {
  var directiveVariableBindings = new Map();
  collection_1.MapWrapper.forEach(renderElementBinder.variableBindings, function(templateName, exportAs) {
    var dirIndex = _findDirectiveIndexByExportAs(renderElementBinder, directiveBindings, exportAs);
    directiveVariableBindings.set(templateName, dirIndex);
  });
  return directiveVariableBindings;
}
exports.createDirectiveVariableBindings = createDirectiveVariableBindings;
function _findDirectiveIndexByExportAs(renderElementBinder, directiveBindings, exportAs) {
  var matchedDirectiveIndex = null;
  var matchedDirective;
  for (var i = 0; i < directiveBindings.length; ++i) {
    var directive = directiveBindings[i];
    if (_directiveExportAs(directive) == exportAs) {
      if (lang_1.isPresent(matchedDirective)) {
        throw new lang_1.BaseException("More than one directive have exportAs = '" + exportAs + "'. Directives: [" + matchedDirective.displayName + ", " + directive.displayName + "]");
      }
      matchedDirectiveIndex = i;
      matchedDirective = directive;
    }
  }
  if (lang_1.isBlank(matchedDirective) && exportAs !== "$implicit") {
    throw new lang_1.BaseException("Cannot find directive with exportAs = '" + exportAs + "'");
  }
  return matchedDirectiveIndex;
}
function _directiveExportAs(directive) {
  var directiveExportAs = directive.metadata.exportAs;
  if (lang_1.isBlank(directiveExportAs) && directive.metadata.type === api_1.RenderDirectiveMetadata.COMPONENT_TYPE) {
    return "$implicit";
  } else {
    return directiveExportAs;
  }
}
var RenderProtoViewWithIndex = (function() {
  function RenderProtoViewWithIndex(renderProtoView, index, parentIndex, boundElementIndex) {
    this.renderProtoView = renderProtoView;
    this.index = index;
    this.parentIndex = parentIndex;
    this.boundElementIndex = boundElementIndex;
  }
  return RenderProtoViewWithIndex;
})();
var ParentProtoElementInjectorWithDistance = (function() {
  function ParentProtoElementInjectorWithDistance(protoElementInjector, distance) {
    this.protoElementInjector = protoElementInjector;
    this.distance = distance;
  }
  return ParentProtoElementInjectorWithDistance;
})();

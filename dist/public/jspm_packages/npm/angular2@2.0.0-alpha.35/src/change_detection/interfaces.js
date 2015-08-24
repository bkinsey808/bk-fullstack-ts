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
var lang_1 = require("../facade/lang");
var ChangeDetection = (function() {
  function ChangeDetection() {}
  ChangeDetection.prototype.createProtoChangeDetector = function(definition) {
    return null;
  };
  ChangeDetection = __decorate([lang_1.CONST(), __metadata('design:paramtypes', [])], ChangeDetection);
  return ChangeDetection;
})();
exports.ChangeDetection = ChangeDetection;
var DebugContext = (function() {
  function DebugContext(element, componentElement, directive, context, locals, injector) {
    this.element = element;
    this.componentElement = componentElement;
    this.directive = directive;
    this.context = context;
    this.locals = locals;
    this.injector = injector;
  }
  return DebugContext;
})();
exports.DebugContext = DebugContext;
var ChangeDetectorDefinition = (function() {
  function ChangeDetectorDefinition(id, strategy, variableNames, bindingRecords, eventRecords, directiveRecords, generateCheckNoChanges) {
    this.id = id;
    this.strategy = strategy;
    this.variableNames = variableNames;
    this.bindingRecords = bindingRecords;
    this.eventRecords = eventRecords;
    this.directiveRecords = directiveRecords;
    this.generateCheckNoChanges = generateCheckNoChanges;
  }
  return ChangeDetectorDefinition;
})();
exports.ChangeDetectorDefinition = ChangeDetectorDefinition;

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
var __param = (this && this.__param) || function(paramIndex, decorator) {
  return function(target, key) {
    decorator(target, key, paramIndex);
  };
};
var lang_1 = require("../../facade/lang");
var di_1 = require("../../../di");
var dom_adapter_1 = require("../../dom/dom_adapter");
var dom_tokens_1 = require("./dom_tokens");
var TemplateCloner = (function() {
  function TemplateCloner(maxInMemoryElementsPerTemplate) {
    this.maxInMemoryElementsPerTemplate = maxInMemoryElementsPerTemplate;
  }
  TemplateCloner.prototype.prepareForClone = function(templateRoot) {
    var elementCount = dom_adapter_1.DOM.querySelectorAll(dom_adapter_1.DOM.content(templateRoot), '*').length;
    if (this.maxInMemoryElementsPerTemplate >= 0 && elementCount >= this.maxInMemoryElementsPerTemplate) {
      return dom_adapter_1.DOM.getInnerHTML(templateRoot);
    } else {
      return templateRoot;
    }
  };
  TemplateCloner.prototype.cloneContent = function(preparedTemplateRoot, importNode) {
    var templateContent;
    if (lang_1.isString(preparedTemplateRoot)) {
      templateContent = dom_adapter_1.DOM.content(dom_adapter_1.DOM.createTemplate(preparedTemplateRoot));
      if (importNode) {
        templateContent = dom_adapter_1.DOM.importIntoDoc(templateContent);
      }
    } else {
      templateContent = dom_adapter_1.DOM.content(preparedTemplateRoot);
      if (importNode) {
        templateContent = dom_adapter_1.DOM.importIntoDoc(templateContent);
      } else {
        templateContent = dom_adapter_1.DOM.clone(templateContent);
      }
    }
    return templateContent;
  };
  TemplateCloner = __decorate([di_1.Injectable(), __param(0, di_1.Inject(dom_tokens_1.MAX_IN_MEMORY_ELEMENTS_PER_TEMPLATE)), __metadata('design:paramtypes', [Object])], TemplateCloner);
  return TemplateCloner;
})();
exports.TemplateCloner = TemplateCloner;

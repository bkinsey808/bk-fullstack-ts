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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { isString } from 'angular2/src/facade/lang';
import { Injectable, Inject } from 'angular2/di';
import { DOM } from 'angular2/src/dom/dom_adapter';
import { MAX_IN_MEMORY_ELEMENTS_PER_TEMPLATE } from './dom_tokens';
export let TemplateCloner = class {
    constructor(maxInMemoryElementsPerTemplate) {
        this.maxInMemoryElementsPerTemplate = maxInMemoryElementsPerTemplate;
    }
    prepareForClone(templateRoot) {
        var elementCount = DOM.querySelectorAll(DOM.content(templateRoot), '*').length;
        if (this.maxInMemoryElementsPerTemplate >= 0 &&
            elementCount >= this.maxInMemoryElementsPerTemplate) {
            return DOM.getInnerHTML(templateRoot);
        }
        else {
            return templateRoot;
        }
    }
    cloneContent(preparedTemplateRoot, importNode) {
        var templateContent;
        if (isString(preparedTemplateRoot)) {
            templateContent = DOM.content(DOM.createTemplate(preparedTemplateRoot));
            if (importNode) {
                // Attention: We can't use document.adoptNode here
                // as this does NOT wake up custom elements in Chrome 43
                // TODO: Use div.innerHTML instead of template.innerHTML when we
                // have code to support the various special cases and
                // don't use importNode additionally (e.g. for <tr>, svg elements, ...)
                // see https://github.com/angular/angular/issues/3364
                templateContent = DOM.importIntoDoc(templateContent);
            }
        }
        else {
            templateContent = DOM.content(preparedTemplateRoot);
            if (importNode) {
                templateContent = DOM.importIntoDoc(templateContent);
            }
            else {
                templateContent = DOM.clone(templateContent);
            }
        }
        return templateContent;
    }
};
TemplateCloner = __decorate([
    Injectable(),
    __param(0, Inject(MAX_IN_MEMORY_ELEMENTS_PER_TEMPLATE)), 
    __metadata('design:paramtypes', [Object])
], TemplateCloner);
//# sourceMappingURL=template_cloner.js.map
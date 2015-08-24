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
import { Injectable } from 'angular2/di';
import { PromiseWrapper } from 'angular2/src/facade/async';
import { BaseException } from 'angular2/src/facade/lang';
import { DOM } from 'angular2/src/dom/dom_adapter';
import { ViewDefinition, ViewType, RenderCompiler, ViewEncapsulation } from '../../api';
import { CompilePipeline } from './compile_pipeline';
import { ViewLoader, TemplateAndStyles } from 'angular2/src/render/dom/compiler/view_loader';
import { DefaultStepFactory } from './compile_step_factory';
import { ElementSchemaRegistry } from '../schema/element_schema_registry';
import { Parser } from 'angular2/src/change_detection/change_detection';
import * as pvm from '../view/proto_view_merger';
import { CssSelector } from './selector';
import { APP_ID } from '../dom_tokens';
import { Inject } from 'angular2/di';
import { SharedStylesHost } from '../view/shared_styles_host';
import { prependAll } from '../util';
import { TemplateCloner } from '../template_cloner';
/**
 * The compiler loads and translates the html templates of components into
 * nested ProtoViews. To decompose its functionality it uses
 * the CompilePipeline and the CompileSteps.
 */
export class DomCompiler extends RenderCompiler {
    constructor(_schemaRegistry, _templateCloner, _stepFactory, _viewLoader, _sharedStylesHost) {
        super();
        this._schemaRegistry = _schemaRegistry;
        this._templateCloner = _templateCloner;
        this._stepFactory = _stepFactory;
        this._viewLoader = _viewLoader;
        this._sharedStylesHost = _sharedStylesHost;
    }
    compile(view) {
        var tplPromise = this._viewLoader.load(view);
        return PromiseWrapper.then(tplPromise, (tplAndStyles) => this._compileView(view, tplAndStyles, ViewType.COMPONENT), (e) => {
            throw new BaseException(`Failed to load the template for "${view.componentId}" : ${e}`);
            return null;
        });
    }
    compileHost(directiveMetadata) {
        let hostViewDef = new ViewDefinition({
            componentId: directiveMetadata.id,
            templateAbsUrl: null, template: null,
            styles: null,
            styleAbsUrls: null,
            directives: [directiveMetadata],
            encapsulation: ViewEncapsulation.NONE
        });
        let selector = CssSelector.parse(directiveMetadata.selector)[0];
        let hostTemplate = selector.getMatchingElementTemplate();
        let templateAndStyles = new TemplateAndStyles(hostTemplate, []);
        return this._compileView(hostViewDef, templateAndStyles, ViewType.HOST);
    }
    mergeProtoViewsRecursively(protoViewRefs) {
        return PromiseWrapper.resolve(pvm.mergeProtoViewsRecursively(this._templateCloner, protoViewRefs));
    }
    _compileView(viewDef, templateAndStyles, protoViewType) {
        if (viewDef.encapsulation === ViewEncapsulation.EMULATED &&
            templateAndStyles.styles.length === 0) {
            viewDef = this._normalizeViewEncapsulationIfThereAreNoStyles(viewDef);
        }
        var pipeline = new CompilePipeline(this._stepFactory.createSteps(viewDef));
        var compiledStyles = pipeline.processStyles(templateAndStyles.styles);
        var compileElements = pipeline.processElements(this._createTemplateElm(templateAndStyles.template), protoViewType, viewDef);
        if (viewDef.encapsulation === ViewEncapsulation.NATIVE) {
            prependAll(DOM.content(compileElements[0].element), compiledStyles.map(style => DOM.createStyleElement(style)));
        }
        else {
            this._sharedStylesHost.addStyles(compiledStyles);
        }
        return PromiseWrapper.resolve(compileElements[0].inheritedProtoView.build(this._schemaRegistry, this._templateCloner));
    }
    _createTemplateElm(template) {
        var templateElm = DOM.createTemplate(template);
        var scriptTags = DOM.querySelectorAll(DOM.templateAwareRoot(templateElm), 'script');
        for (var i = 0; i < scriptTags.length; i++) {
            DOM.remove(scriptTags[i]);
        }
        return templateElm;
    }
    _normalizeViewEncapsulationIfThereAreNoStyles(viewDef) {
        if (viewDef.encapsulation === ViewEncapsulation.EMULATED) {
            return new ViewDefinition({
                componentId: viewDef.componentId,
                templateAbsUrl: viewDef.templateAbsUrl, template: viewDef.template,
                styleAbsUrls: viewDef.styleAbsUrls,
                styles: viewDef.styles,
                directives: viewDef.directives,
                encapsulation: ViewEncapsulation.NONE
            });
        }
        else {
            return viewDef;
        }
    }
}
export let DefaultDomCompiler = class extends DomCompiler {
    constructor(schemaRegistry, templateCloner, parser, viewLoader, sharedStylesHost, appId) {
        super(schemaRegistry, templateCloner, new DefaultStepFactory(parser, appId), viewLoader, sharedStylesHost);
    }
};
DefaultDomCompiler = __decorate([
    Injectable(),
    __param(5, Inject(APP_ID)), 
    __metadata('design:paramtypes', [ElementSchemaRegistry, TemplateCloner, Parser, ViewLoader, SharedStylesHost, Object])
], DefaultDomCompiler);
//# sourceMappingURL=compiler.js.map
/* */ 
'use strict';
var __extends = (this && this.__extends) || function(d, b) {
  for (var p in b)
    if (b.hasOwnProperty(p))
      d[p] = b[p];
  function __() {
    this.constructor = d;
  }
  __.prototype = b.prototype;
  d.prototype = new __();
};
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
var di_1 = require("../../../../di");
var async_1 = require("../../../facade/async");
var lang_1 = require("../../../facade/lang");
var dom_adapter_1 = require("../../../dom/dom_adapter");
var api_1 = require("../../api");
var compile_pipeline_1 = require("./compile_pipeline");
var view_loader_1 = require("./view_loader");
var compile_step_factory_1 = require("./compile_step_factory");
var element_schema_registry_1 = require("../schema/element_schema_registry");
var change_detection_1 = require("../../../change_detection/change_detection");
var pvm = require("../view/proto_view_merger");
var selector_1 = require("./selector");
var dom_tokens_1 = require("../dom_tokens");
var di_2 = require("../../../../di");
var shared_styles_host_1 = require("../view/shared_styles_host");
var util_1 = require("../util");
var template_cloner_1 = require("../template_cloner");
var DomCompiler = (function(_super) {
  __extends(DomCompiler, _super);
  function DomCompiler(_schemaRegistry, _templateCloner, _stepFactory, _viewLoader, _sharedStylesHost) {
    _super.call(this);
    this._schemaRegistry = _schemaRegistry;
    this._templateCloner = _templateCloner;
    this._stepFactory = _stepFactory;
    this._viewLoader = _viewLoader;
    this._sharedStylesHost = _sharedStylesHost;
  }
  DomCompiler.prototype.compile = function(view) {
    var _this = this;
    var tplPromise = this._viewLoader.load(view);
    return async_1.PromiseWrapper.then(tplPromise, function(tplAndStyles) {
      return _this._compileView(view, tplAndStyles, api_1.ViewType.COMPONENT);
    }, function(e) {
      throw new lang_1.BaseException("Failed to load the template for \"" + view.componentId + "\" : " + e);
      return null;
    });
  };
  DomCompiler.prototype.compileHost = function(directiveMetadata) {
    var hostViewDef = new api_1.ViewDefinition({
      componentId: directiveMetadata.id,
      templateAbsUrl: null,
      template: null,
      styles: null,
      styleAbsUrls: null,
      directives: [directiveMetadata],
      encapsulation: api_1.ViewEncapsulation.NONE
    });
    var selector = selector_1.CssSelector.parse(directiveMetadata.selector)[0];
    var hostTemplate = selector.getMatchingElementTemplate();
    var templateAndStyles = new view_loader_1.TemplateAndStyles(hostTemplate, []);
    return this._compileView(hostViewDef, templateAndStyles, api_1.ViewType.HOST);
  };
  DomCompiler.prototype.mergeProtoViewsRecursively = function(protoViewRefs) {
    return async_1.PromiseWrapper.resolve(pvm.mergeProtoViewsRecursively(this._templateCloner, protoViewRefs));
  };
  DomCompiler.prototype._compileView = function(viewDef, templateAndStyles, protoViewType) {
    if (viewDef.encapsulation === api_1.ViewEncapsulation.EMULATED && templateAndStyles.styles.length === 0) {
      viewDef = this._normalizeViewEncapsulationIfThereAreNoStyles(viewDef);
    }
    var pipeline = new compile_pipeline_1.CompilePipeline(this._stepFactory.createSteps(viewDef));
    var compiledStyles = pipeline.processStyles(templateAndStyles.styles);
    var compileElements = pipeline.processElements(this._createTemplateElm(templateAndStyles.template), protoViewType, viewDef);
    if (viewDef.encapsulation === api_1.ViewEncapsulation.NATIVE) {
      util_1.prependAll(dom_adapter_1.DOM.content(compileElements[0].element), compiledStyles.map(function(style) {
        return dom_adapter_1.DOM.createStyleElement(style);
      }));
    } else {
      this._sharedStylesHost.addStyles(compiledStyles);
    }
    return async_1.PromiseWrapper.resolve(compileElements[0].inheritedProtoView.build(this._schemaRegistry, this._templateCloner));
  };
  DomCompiler.prototype._createTemplateElm = function(template) {
    var templateElm = dom_adapter_1.DOM.createTemplate(template);
    var scriptTags = dom_adapter_1.DOM.querySelectorAll(dom_adapter_1.DOM.templateAwareRoot(templateElm), 'script');
    for (var i = 0; i < scriptTags.length; i++) {
      dom_adapter_1.DOM.remove(scriptTags[i]);
    }
    return templateElm;
  };
  DomCompiler.prototype._normalizeViewEncapsulationIfThereAreNoStyles = function(viewDef) {
    if (viewDef.encapsulation === api_1.ViewEncapsulation.EMULATED) {
      return new api_1.ViewDefinition({
        componentId: viewDef.componentId,
        templateAbsUrl: viewDef.templateAbsUrl,
        template: viewDef.template,
        styleAbsUrls: viewDef.styleAbsUrls,
        styles: viewDef.styles,
        directives: viewDef.directives,
        encapsulation: api_1.ViewEncapsulation.NONE
      });
    } else {
      return viewDef;
    }
  };
  return DomCompiler;
})(api_1.RenderCompiler);
exports.DomCompiler = DomCompiler;
var DefaultDomCompiler = (function(_super) {
  __extends(DefaultDomCompiler, _super);
  function DefaultDomCompiler(schemaRegistry, templateCloner, parser, viewLoader, sharedStylesHost, appId) {
    _super.call(this, schemaRegistry, templateCloner, new compile_step_factory_1.DefaultStepFactory(parser, appId), viewLoader, sharedStylesHost);
  }
  DefaultDomCompiler = __decorate([di_1.Injectable(), __param(5, di_2.Inject(dom_tokens_1.APP_ID)), __metadata('design:paramtypes', [element_schema_registry_1.ElementSchemaRegistry, template_cloner_1.TemplateCloner, change_detection_1.Parser, view_loader_1.ViewLoader, shared_styles_host_1.SharedStylesHost, Object])], DefaultDomCompiler);
  return DefaultDomCompiler;
})(DomCompiler);
exports.DefaultDomCompiler = DefaultDomCompiler;

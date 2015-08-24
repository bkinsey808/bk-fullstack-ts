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
import { Injectable } from 'angular2/di';
import { isBlank, isPresent, BaseException, stringify, isPromise, StringWrapper } from 'angular2/src/facade/lang';
import { Map, MapWrapper, ListWrapper } from 'angular2/src/facade/collection';
import { PromiseWrapper } from 'angular2/src/facade/async';
import { DOM } from 'angular2/src/dom/dom_adapter';
import { XHR } from 'angular2/src/render/xhr';
import { StyleInliner } from './style_inliner';
import { StyleUrlResolver } from './style_url_resolver';
import { wtfStartTimeRange, wtfEndTimeRange } from '../../../profile/profile';
export class TemplateAndStyles {
    constructor(template, styles) {
        this.template = template;
        this.styles = styles;
    }
}
/**
 * Strategy to load component views.
 * TODO: Make public API once we are more confident in this approach.
 */
export let ViewLoader = class {
    constructor(_xhr, _styleInliner, _styleUrlResolver) {
        this._xhr = _xhr;
        this._styleInliner = _styleInliner;
        this._styleUrlResolver = _styleUrlResolver;
        this._cache = new Map();
    }
    load(viewDef) {
        var r = wtfStartTimeRange('ViewLoader#load()', stringify(viewDef.componentId));
        let tplAndStyles = [this._loadHtml(viewDef.template, viewDef.templateAbsUrl)];
        if (isPresent(viewDef.styles)) {
            viewDef.styles.forEach((cssText) => {
                let textOrPromise = this._resolveAndInlineCssText(cssText, viewDef.templateAbsUrl);
                tplAndStyles.push(textOrPromise);
            });
        }
        if (isPresent(viewDef.styleAbsUrls)) {
            viewDef.styleAbsUrls.forEach(url => {
                let promise = this._loadText(url).then(cssText => this._resolveAndInlineCssText(cssText, viewDef.templateAbsUrl));
                tplAndStyles.push(promise);
            });
        }
        // Inline the styles from the @View annotation
        return PromiseWrapper.all(tplAndStyles)
            .then((res) => {
            let loadedTplAndStyles = res[0];
            let styles = ListWrapper.slice(res, 1);
            var templateAndStyles = new TemplateAndStyles(loadedTplAndStyles.template, loadedTplAndStyles.styles.concat(styles));
            wtfEndTimeRange(r);
            return templateAndStyles;
        });
    }
    _loadText(url) {
        var response = this._cache.get(url);
        if (isBlank(response)) {
            // TODO(vicb): change error when TS gets fixed
            // https://github.com/angular/angular/issues/2280
            // throw new BaseException(`Failed to fetch url "${url}"`);
            response = PromiseWrapper.catchError(this._xhr.get(url), _ => PromiseWrapper.reject(new BaseException(`Failed to fetch url "${url}"`), null));
            this._cache.set(url, response);
        }
        return response;
    }
    // Load the html and inline any style tags
    _loadHtml(template, templateAbsUrl) {
        let html;
        // Load the HTML
        if (isPresent(template)) {
            html = PromiseWrapper.resolve(template);
        }
        else if (isPresent(templateAbsUrl)) {
            html = this._loadText(templateAbsUrl);
        }
        else {
            throw new BaseException('View should have either the templateUrl or template property set');
        }
        return html.then(html => {
            var tplEl = DOM.createTemplate(html);
            // Replace $baseUrl with the base url for the template
            if (isPresent(templateAbsUrl) && templateAbsUrl.indexOf("/") >= 0) {
                let baseUrl = templateAbsUrl.substring(0, templateAbsUrl.lastIndexOf("/"));
                this._substituteBaseUrl(DOM.content(tplEl), baseUrl);
            }
            let styleEls = DOM.querySelectorAll(DOM.content(tplEl), 'STYLE');
            let unresolvedStyles = [];
            for (let i = 0; i < styleEls.length; i++) {
                var styleEl = styleEls[i];
                unresolvedStyles.push(DOM.getText(styleEl));
                DOM.remove(styleEl);
            }
            let syncStyles = [];
            let asyncStyles = [];
            // Inline the style tags from the html
            for (let i = 0; i < styleEls.length; i++) {
                let styleEl = styleEls[i];
                let resolvedStyled = this._resolveAndInlineCssText(DOM.getText(styleEl), templateAbsUrl);
                if (isPromise(resolvedStyled)) {
                    asyncStyles.push(resolvedStyled);
                }
                else {
                    syncStyles.push(resolvedStyled);
                }
            }
            if (asyncStyles.length === 0) {
                return PromiseWrapper.resolve(new TemplateAndStyles(DOM.getInnerHTML(tplEl), syncStyles));
            }
            else {
                return PromiseWrapper.all(asyncStyles)
                    .then(loadedStyles => new TemplateAndStyles(DOM.getInnerHTML(tplEl), syncStyles.concat(loadedStyles)));
            }
        });
    }
    /**
     * Replace all occurrences of $baseUrl in the attributes of an element and its
     * children with the base URL of the template.
     *
     * @param element The element to process
     * @param baseUrl The base URL of the template.
     * @private
     */
    _substituteBaseUrl(element, baseUrl) {
        if (DOM.isElementNode(element)) {
            var attrs = DOM.attributeMap(element);
            MapWrapper.forEach(attrs, (v, k) => {
                if (isPresent(v) && v.indexOf('$baseUrl') >= 0) {
                    DOM.setAttribute(element, k, StringWrapper.replaceAll(v, /\$baseUrl/g, baseUrl));
                }
            });
        }
        let children = DOM.childNodes(element);
        for (let i = 0; i < children.length; i++) {
            if (DOM.isElementNode(children[i])) {
                this._substituteBaseUrl(children[i], baseUrl);
            }
        }
    }
    _resolveAndInlineCssText(cssText, baseUrl) {
        cssText = this._styleUrlResolver.resolveUrls(cssText, baseUrl);
        return this._styleInliner.inlineImports(cssText, baseUrl);
    }
};
ViewLoader = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [XHR, StyleInliner, StyleUrlResolver])
], ViewLoader);
//# sourceMappingURL=view_loader.js.map
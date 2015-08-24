/* */ 
"format cjs";
import { ViewEncapsulation, ViewType } from '../../api';
import { NG_CONTENT_ELEMENT_NAME, isElementWithTag } from '../util';
import { DOM } from 'angular2/src/dom/dom_adapter';
import { isBlank, isPresent } from 'angular2/src/facade/lang';
import { ShadowCss } from './shadow_css';
export class StyleEncapsulator {
    constructor(_appId, _view, _componentUIDsCache) {
        this._appId = _appId;
        this._view = _view;
        this._componentUIDsCache = _componentUIDsCache;
    }
    processElement(parent, current, control) {
        if (isElementWithTag(current.element, NG_CONTENT_ELEMENT_NAME)) {
            current.inheritedProtoView.bindNgContent();
        }
        else {
            if (this._view.encapsulation === ViewEncapsulation.EMULATED) {
                this._processEmulatedScopedElement(current, parent);
            }
        }
    }
    processStyle(style) {
        var encapsulation = this._view.encapsulation;
        if (encapsulation === ViewEncapsulation.EMULATED) {
            return this._shimCssForComponent(style, this._view.componentId);
        }
        else {
            return style;
        }
    }
    _processEmulatedScopedElement(current, parent) {
        var element = current.element;
        var hostComponentId = this._view.componentId;
        var viewType = current.inheritedProtoView.type;
        // Shim the element as a child of the compiled component
        if (viewType !== ViewType.HOST && isPresent(hostComponentId)) {
            var contentAttribute = getContentAttribute(this._getComponentId(hostComponentId));
            DOM.setAttribute(element, contentAttribute, '');
            // also shim the host
            if (isBlank(parent) && viewType == ViewType.COMPONENT) {
                var hostAttribute = getHostAttribute(this._getComponentId(hostComponentId));
                current.inheritedProtoView.setHostAttribute(hostAttribute, '');
            }
        }
    }
    _shimCssForComponent(cssText, componentId) {
        var id = this._getComponentId(componentId);
        var shadowCss = new ShadowCss();
        return shadowCss.shimCssText(cssText, getContentAttribute(id), getHostAttribute(id));
    }
    _getComponentId(componentStringId) {
        var id = this._componentUIDsCache.get(componentStringId);
        if (isBlank(id)) {
            id = `${this._appId}-${this._componentUIDsCache.size}`;
            this._componentUIDsCache.set(componentStringId, id);
        }
        return id;
    }
}
// Return the attribute to be added to the component
function getHostAttribute(compId) {
    return `_nghost-${compId}`;
}
// Returns the attribute to be added on every single element nodes in the component
function getContentAttribute(compId) {
    return `_ngcontent-${compId}`;
}
//# sourceMappingURL=style_encapsulator.js.map
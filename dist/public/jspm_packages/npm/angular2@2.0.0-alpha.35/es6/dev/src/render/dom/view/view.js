/* */ 
"format cjs";
import { DOM } from 'angular2/src/dom/dom_adapter';
import { Map } from 'angular2/src/facade/collection';
import { isPresent, stringify } from 'angular2/src/facade/lang';
import { RenderViewRef } from '../../api';
import { camelCaseToDashCase } from '../util';
export function resolveInternalDomView(viewRef) {
    return viewRef._view;
}
export class DomViewRef extends RenderViewRef {
    constructor(_view) {
        super();
        this._view = _view;
    }
}
/**
 * Const of making objects: http://jsperf.com/instantiate-size-of-object
 */
export class DomView {
    constructor(proto, boundTextNodes, boundElements) {
        this.proto = proto;
        this.boundTextNodes = boundTextNodes;
        this.boundElements = boundElements;
        this.hydrated = false;
        this.eventDispatcher = null;
        this.eventHandlerRemovers = [];
    }
    setElementProperty(elementIndex, propertyName, value) {
        DOM.setProperty(this.boundElements[elementIndex], propertyName, value);
    }
    setElementAttribute(elementIndex, attributeName, value) {
        var element = this.boundElements[elementIndex];
        var dashCasedAttributeName = camelCaseToDashCase(attributeName);
        if (isPresent(value)) {
            DOM.setAttribute(element, dashCasedAttributeName, stringify(value));
        }
        else {
            DOM.removeAttribute(element, dashCasedAttributeName);
        }
    }
    setElementClass(elementIndex, className, isAdd) {
        var element = this.boundElements[elementIndex];
        if (isAdd) {
            DOM.addClass(element, className);
        }
        else {
            DOM.removeClass(element, className);
        }
    }
    setElementStyle(elementIndex, styleName, value) {
        var element = this.boundElements[elementIndex];
        var dashCasedStyleName = camelCaseToDashCase(styleName);
        if (isPresent(value)) {
            DOM.setStyle(element, dashCasedStyleName, stringify(value));
        }
        else {
            DOM.removeStyle(element, dashCasedStyleName);
        }
    }
    invokeElementMethod(elementIndex, methodName, args) {
        var element = this.boundElements[elementIndex];
        DOM.invoke(element, methodName, args);
    }
    setText(textIndex, value) { DOM.setText(this.boundTextNodes[textIndex], value); }
    dispatchEvent(elementIndex, eventName, event) {
        var allowDefaultBehavior = true;
        if (isPresent(this.eventDispatcher)) {
            var evalLocals = new Map();
            evalLocals.set('$event', event);
            // TODO(tbosch): reenable this when we are parsing element properties
            // out of action expressions
            // var localValues = this.proto.elementBinders[elementIndex].eventLocals.eval(null, new
            // Locals(null, evalLocals));
            // this.eventDispatcher.dispatchEvent(elementIndex, eventName, localValues);
            allowDefaultBehavior =
                this.eventDispatcher.dispatchRenderEvent(elementIndex, eventName, evalLocals);
            if (!allowDefaultBehavior) {
                DOM.preventDefault(event);
            }
        }
        return allowDefaultBehavior;
    }
}
//# sourceMappingURL=view.js.map
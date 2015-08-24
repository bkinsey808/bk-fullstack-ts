/* */ 
"format cjs";
import { MapWrapper } from 'angular2/src/facade/collection';
import { DOM } from 'angular2/src/dom/dom_adapter';
import { isBlank, isPresent, StringJoiner, assertionsEnabled } from 'angular2/src/facade/lang';
/**
 * Collects all data that is needed to process an element
 * in the compile process. Fields are filled
 * by the CompileSteps starting out with the pure HTMLElement.
 */
export class CompileElement {
    // error
    constructor(element, compilationUnit = '') {
        this.element = element;
        this._attrs = null;
        this._classList = null;
        this.isViewRoot = false;
        // inherited down to children if they don't have an own protoView
        this.inheritedProtoView = null;
        this.distanceToInheritedBinder = 0;
        // inherited down to children if they don't have an own elementBinder
        this.inheritedElementBinder = null;
        this.compileChildren = true;
        // description is calculated here as compilation steps may change the element
        var tplDesc = assertionsEnabled() ? getElementDescription(element) : null;
        if (compilationUnit !== '') {
            this.elementDescription = compilationUnit;
            if (isPresent(tplDesc))
                this.elementDescription += ": " + tplDesc;
        }
        else {
            this.elementDescription = tplDesc;
        }
    }
    isBound() {
        return isPresent(this.inheritedElementBinder) && this.distanceToInheritedBinder === 0;
    }
    bindElement() {
        if (!this.isBound()) {
            var parentBinder = this.inheritedElementBinder;
            this.inheritedElementBinder =
                this.inheritedProtoView.bindElement(this.element, this.elementDescription);
            if (isPresent(parentBinder)) {
                this.inheritedElementBinder.setParent(parentBinder, this.distanceToInheritedBinder);
            }
            this.distanceToInheritedBinder = 0;
        }
        return this.inheritedElementBinder;
    }
    attrs() {
        if (isBlank(this._attrs)) {
            this._attrs = DOM.attributeMap(this.element);
        }
        return this._attrs;
    }
    classList() {
        if (isBlank(this._classList)) {
            this._classList = [];
            var elClassList = DOM.classList(this.element);
            for (var i = 0; i < elClassList.length; i++) {
                this._classList.push(elClassList[i]);
            }
        }
        return this._classList;
    }
}
// return an HTML representation of an element start tag - without its content
// this is used to give contextual information in case of errors
function getElementDescription(domElement) {
    var buf = new StringJoiner();
    var atts = DOM.attributeMap(domElement);
    buf.add("<");
    buf.add(DOM.tagName(domElement).toLowerCase());
    // show id and class first to ease element identification
    addDescriptionAttribute(buf, "id", atts.get("id"));
    addDescriptionAttribute(buf, "class", atts.get("class"));
    MapWrapper.forEach(atts, (attValue, attName) => {
        if (attName !== "id" && attName !== "class") {
            addDescriptionAttribute(buf, attName, attValue);
        }
    });
    buf.add(">");
    return buf.toString();
}
function addDescriptionAttribute(buffer, attName, attValue) {
    if (isPresent(attValue)) {
        if (attValue.length === 0) {
            buffer.add(' ' + attName);
        }
        else {
            buffer.add(' ' + attName + '="' + attValue + '"');
        }
    }
}
//# sourceMappingURL=compile_element.js.map
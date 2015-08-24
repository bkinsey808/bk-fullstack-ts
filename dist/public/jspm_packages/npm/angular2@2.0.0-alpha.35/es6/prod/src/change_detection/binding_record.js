/* */ 
"format cjs";
import { isPresent, isBlank } from 'angular2/src/facade/lang';
const DIRECTIVE = "directive";
const DIRECTIVE_LIFECYCLE = "directiveLifecycle";
const ELEMENT_PROPERTY = "elementProperty";
const ELEMENT_ATTRIBUTE = "elementAttribute";
const ELEMENT_CLASS = "elementClass";
const ELEMENT_STYLE = "elementStyle";
const TEXT_NODE = "textNode";
const EVENT = "event";
const HOST_EVENT = "hostEvent";
export class BindingRecord {
    constructor(mode, implicitReceiver, ast, elementIndex, propertyName, propertyUnit, eventName, setter, lifecycleEvent, directiveRecord) {
        this.mode = mode;
        this.implicitReceiver = implicitReceiver;
        this.ast = ast;
        this.elementIndex = elementIndex;
        this.propertyName = propertyName;
        this.propertyUnit = propertyUnit;
        this.eventName = eventName;
        this.setter = setter;
        this.lifecycleEvent = lifecycleEvent;
        this.directiveRecord = directiveRecord;
    }
    callOnChange() {
        return isPresent(this.directiveRecord) && this.directiveRecord.callOnChange;
    }
    isDefaultChangeDetection() {
        return isBlank(this.directiveRecord) || this.directiveRecord.isDefaultChangeDetection();
    }
    isDirective() { return this.mode === DIRECTIVE; }
    isDirectiveLifecycle() { return this.mode === DIRECTIVE_LIFECYCLE; }
    isElementProperty() { return this.mode === ELEMENT_PROPERTY; }
    isElementAttribute() { return this.mode === ELEMENT_ATTRIBUTE; }
    isElementClass() { return this.mode === ELEMENT_CLASS; }
    isElementStyle() { return this.mode === ELEMENT_STYLE; }
    isTextNode() { return this.mode === TEXT_NODE; }
    static createForDirective(ast, propertyName, setter, directiveRecord) {
        return new BindingRecord(DIRECTIVE, 0, ast, 0, propertyName, null, null, setter, null, directiveRecord);
    }
    static createDirectiveOnCheck(directiveRecord) {
        return new BindingRecord(DIRECTIVE_LIFECYCLE, 0, null, 0, null, null, null, null, "onCheck", directiveRecord);
    }
    static createDirectiveOnInit(directiveRecord) {
        return new BindingRecord(DIRECTIVE_LIFECYCLE, 0, null, 0, null, null, null, null, "onInit", directiveRecord);
    }
    static createDirectiveOnChange(directiveRecord) {
        return new BindingRecord(DIRECTIVE_LIFECYCLE, 0, null, 0, null, null, null, null, "onChange", directiveRecord);
    }
    static createForElementProperty(ast, elementIndex, propertyName) {
        return new BindingRecord(ELEMENT_PROPERTY, 0, ast, elementIndex, propertyName, null, null, null, null, null);
    }
    static createForElementAttribute(ast, elementIndex, attributeName) {
        return new BindingRecord(ELEMENT_ATTRIBUTE, 0, ast, elementIndex, attributeName, null, null, null, null, null);
    }
    static createForElementClass(ast, elementIndex, className) {
        return new BindingRecord(ELEMENT_CLASS, 0, ast, elementIndex, className, null, null, null, null, null);
    }
    static createForElementStyle(ast, elementIndex, styleName, unit) {
        return new BindingRecord(ELEMENT_STYLE, 0, ast, elementIndex, styleName, unit, null, null, null, null);
    }
    static createForHostProperty(directiveIndex, ast, propertyName) {
        return new BindingRecord(ELEMENT_PROPERTY, directiveIndex, ast, directiveIndex.elementIndex, propertyName, null, null, null, null, null);
    }
    static createForHostAttribute(directiveIndex, ast, attributeName) {
        return new BindingRecord(ELEMENT_ATTRIBUTE, directiveIndex, ast, directiveIndex.elementIndex, attributeName, null, null, null, null, null);
    }
    static createForHostClass(directiveIndex, ast, className) {
        return new BindingRecord(ELEMENT_CLASS, directiveIndex, ast, directiveIndex.elementIndex, className, null, null, null, null, null);
    }
    static createForHostStyle(directiveIndex, ast, styleName, unit) {
        return new BindingRecord(ELEMENT_STYLE, directiveIndex, ast, directiveIndex.elementIndex, styleName, unit, null, null, null, null);
    }
    static createForTextNode(ast, elementIndex) {
        return new BindingRecord(TEXT_NODE, 0, ast, elementIndex, null, null, null, null, null, null);
    }
    static createForEvent(ast, eventName, elementIndex) {
        return new BindingRecord(EVENT, 0, ast, elementIndex, null, null, eventName, null, null, null);
    }
    static createForHostEvent(ast, eventName, directiveRecord) {
        var directiveIndex = directiveRecord.directiveIndex;
        return new BindingRecord(EVENT, directiveIndex, ast, directiveIndex.elementIndex, null, null, eventName, null, null, directiveRecord);
    }
}
//# sourceMappingURL=binding_record.js.map
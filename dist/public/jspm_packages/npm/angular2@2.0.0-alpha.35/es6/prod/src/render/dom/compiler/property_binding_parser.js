/* */ 
"format cjs";
import { isPresent, RegExpWrapper, StringWrapper } from 'angular2/src/facade/lang';
import { MapWrapper } from 'angular2/src/facade/collection';
import { dashCaseToCamelCase } from '../util';
// Group 1 = "bind-"
// Group 2 = "var-" or "#"
// Group 3 = "on-"
// Group 4 = "onbubble-"
// Group 5 = "bindon-"
// Group 6 = the identifier after "bind-", "var-/#", or "on-"
// Group 7 = idenitifer inside [()]
// Group 8 = idenitifer inside []
// Group 9 = identifier inside ()
var BIND_NAME_REGEXP = /^(?:(?:(?:(bind-)|(var-|#)|(on-)|(onbubble-)|(bindon-))(.+))|\[\(([^\)]+)\)\]|\[([^\]]+)\]|\(([^\)]+)\))$/g;
/**
 * Parses the property bindings on a single element.
 */
export class PropertyBindingParser {
    constructor(_parser) {
        this._parser = _parser;
    }
    processStyle(style) { return style; }
    processElement(parent, current, control) {
        var attrs = current.attrs();
        var newAttrs = new Map();
        MapWrapper.forEach(attrs, (attrValue, attrName) => {
            attrName = this._normalizeAttributeName(attrName);
            var bindParts = RegExpWrapper.firstMatch(BIND_NAME_REGEXP, attrName);
            if (isPresent(bindParts)) {
                if (isPresent(bindParts[1])) {
                    this._bindProperty(bindParts[6], attrValue, current, newAttrs);
                }
                else if (isPresent(bindParts[2])) {
                    var identifier = bindParts[6];
                    var value = attrValue == '' ? '\$implicit' : attrValue;
                    this._bindVariable(identifier, value, current, newAttrs);
                }
                else if (isPresent(bindParts[3])) {
                    this._bindEvent(bindParts[6], attrValue, current, newAttrs);
                }
                else if (isPresent(bindParts[4])) {
                    this._bindEvent('^' + bindParts[6], attrValue, current, newAttrs);
                }
                else if (isPresent(bindParts[5])) {
                    this._bindProperty(bindParts[6], attrValue, current, newAttrs);
                    this._bindAssignmentEvent(bindParts[6], attrValue, current, newAttrs);
                }
                else if (isPresent(bindParts[7])) {
                    this._bindProperty(bindParts[7], attrValue, current, newAttrs);
                    this._bindAssignmentEvent(bindParts[7], attrValue, current, newAttrs);
                }
                else if (isPresent(bindParts[8])) {
                    this._bindProperty(bindParts[8], attrValue, current, newAttrs);
                }
                else if (isPresent(bindParts[9])) {
                    this._bindEvent(bindParts[9], attrValue, current, newAttrs);
                }
            }
            else {
                var expr = this._parser.parseInterpolation(attrValue, current.elementDescription);
                if (isPresent(expr)) {
                    this._bindPropertyAst(attrName, expr, current, newAttrs);
                }
            }
        });
        MapWrapper.forEach(newAttrs, (attrValue, attrName) => { attrs.set(attrName, attrValue); });
    }
    _normalizeAttributeName(attrName) {
        return StringWrapper.startsWith(attrName, 'data-') ? StringWrapper.substring(attrName, 5) :
            attrName;
    }
    _bindVariable(identifier, value, current, newAttrs) {
        current.bindElement().bindVariable(dashCaseToCamelCase(identifier), value);
        newAttrs.set(identifier, value);
    }
    _bindProperty(name, expression, current, newAttrs) {
        this._bindPropertyAst(name, this._parser.parseBinding(expression, current.elementDescription), current, newAttrs);
    }
    _bindPropertyAst(name, ast, current, newAttrs) {
        var binder = current.bindElement();
        binder.bindProperty(dashCaseToCamelCase(name), ast);
        newAttrs.set(name, ast.source);
    }
    _bindAssignmentEvent(name, expression, current, newAttrs) {
        this._bindEvent(name, `${expression}=$event`, current, newAttrs);
    }
    _bindEvent(name, expression, current, newAttrs) {
        current.bindElement().bindEvent(dashCaseToCamelCase(name), this._parser.parseAction(expression, current.elementDescription));
        // Don't detect directives for event names for now,
        // so don't add the event name to the CompileElement.attrs
    }
}
//# sourceMappingURL=property_binding_parser.js.map
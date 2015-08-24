/* */ 
"format cjs";
import { isPresent, isBlank, BaseException, StringWrapper } from 'angular2/src/facade/lang';
import { MapWrapper, ListWrapper } from 'angular2/src/facade/collection';
import { DOM } from 'angular2/src/dom/dom_adapter';
import { SelectorMatcher, CssSelector } from 'angular2/src/render/dom/compiler/selector';
import { RenderDirectiveMetadata } from '../../api';
import { dashCaseToCamelCase, camelCaseToDashCase, EVENT_TARGET_SEPARATOR } from '../util';
/**
 * Parses the directives on a single element. Assumes ViewSplitter has already created
 * <template> elements for template directives.
 */
export class DirectiveParser {
    constructor(_parser, _directives) {
        this._parser = _parser;
        this._directives = _directives;
        this._selectorMatcher = new SelectorMatcher();
        for (var i = 0; i < _directives.length; i++) {
            var directive = _directives[i];
            var selector = CssSelector.parse(directive.selector);
            this._selectorMatcher.addSelectables(selector, i);
        }
    }
    processStyle(style) { return style; }
    processElement(parent, current, control) {
        var attrs = current.attrs();
        var classList = current.classList();
        var cssSelector = new CssSelector();
        var foundDirectiveIndices = [];
        var elementBinder = null;
        cssSelector.setElement(DOM.nodeName(current.element));
        for (var i = 0; i < classList.length; i++) {
            cssSelector.addClassName(classList[i]);
        }
        MapWrapper.forEach(attrs, (attrValue, attrName) => { cssSelector.addAttribute(attrName, attrValue); });
        this._selectorMatcher.match(cssSelector, (selector, directiveIndex) => {
            var directive = this._directives[directiveIndex];
            elementBinder = current.bindElement();
            if (directive.type === RenderDirectiveMetadata.COMPONENT_TYPE) {
                this._ensureHasOnlyOneComponent(elementBinder, current.elementDescription);
                // components need to go first, so it is easier to locate them in the result.
                ListWrapper.insert(foundDirectiveIndices, 0, directiveIndex);
                elementBinder.setComponentId(directive.id);
            }
            else {
                foundDirectiveIndices.push(directiveIndex);
            }
        });
        ListWrapper.forEach(foundDirectiveIndices, (directiveIndex) => {
            var dirMetadata = this._directives[directiveIndex];
            var directiveBinderBuilder = elementBinder.bindDirective(directiveIndex);
            current.compileChildren = current.compileChildren && dirMetadata.compileChildren;
            if (isPresent(dirMetadata.properties)) {
                ListWrapper.forEach(dirMetadata.properties, (bindConfig) => {
                    this._bindDirectiveProperty(bindConfig, current, directiveBinderBuilder);
                });
            }
            if (isPresent(dirMetadata.hostListeners)) {
                this._sortedKeysForEach(dirMetadata.hostListeners, (action, eventName) => {
                    this._bindDirectiveEvent(eventName, action, current, directiveBinderBuilder);
                });
            }
            if (isPresent(dirMetadata.hostProperties)) {
                this._sortedKeysForEach(dirMetadata.hostProperties, (expression, hostPropertyName) => {
                    this._bindHostProperty(hostPropertyName, expression, current, directiveBinderBuilder);
                });
            }
            if (isPresent(dirMetadata.hostAttributes)) {
                this._sortedKeysForEach(dirMetadata.hostAttributes, (hostAttrValue, hostAttrName) => {
                    this._addHostAttribute(hostAttrName, hostAttrValue, current);
                });
            }
            if (isPresent(dirMetadata.readAttributes)) {
                ListWrapper.forEach(dirMetadata.readAttributes, (attrName) => { elementBinder.readAttribute(attrName); });
            }
        });
    }
    _sortedKeysForEach(map, fn) {
        var keys = MapWrapper.keys(map);
        ListWrapper.sort(keys, (a, b) => {
            // Ensure a stable sort.
            var compareVal = StringWrapper.compare(a, b);
            return compareVal == 0 ? -1 : compareVal;
        });
        ListWrapper.forEach(keys, (key) => { fn(MapWrapper.get(map, key), key); });
    }
    _ensureHasOnlyOneComponent(elementBinder, elDescription) {
        if (isPresent(elementBinder.componentId)) {
            throw new BaseException(`Only one component directive is allowed per element - check ${elDescription}`);
        }
    }
    _bindDirectiveProperty(bindConfig, compileElement, directiveBinderBuilder) {
        // Name of the property on the directive
        let dirProperty;
        // Name of the property on the element
        let elProp;
        let pipes;
        let assignIndex = bindConfig.indexOf(':');
        if (assignIndex > -1) {
            // canonical syntax: `dirProp: elProp | pipe0 | ... | pipeN`
            dirProperty = StringWrapper.substring(bindConfig, 0, assignIndex).trim();
            pipes = this._splitBindConfig(StringWrapper.substring(bindConfig, assignIndex + 1));
            elProp = ListWrapper.removeAt(pipes, 0);
        }
        else {
            // shorthand syntax when the name of the property on the directive and on the element is the
            // same, ie `property`
            dirProperty = bindConfig;
            elProp = bindConfig;
            pipes = [];
        }
        elProp = dashCaseToCamelCase(elProp);
        var bindingAst = compileElement.bindElement().propertyBindings.get(elProp);
        if (isBlank(bindingAst)) {
            var attributeValue = compileElement.attrs().get(camelCaseToDashCase(elProp));
            if (isPresent(attributeValue)) {
                bindingAst =
                    this._parser.wrapLiteralPrimitive(attributeValue, compileElement.elementDescription);
            }
        }
        // Bindings are optional, so this binding only needs to be set up if an expression is given.
        if (isPresent(bindingAst)) {
            directiveBinderBuilder.bindProperty(dirProperty, bindingAst, elProp);
        }
    }
    _bindDirectiveEvent(eventName, action, compileElement, directiveBinderBuilder) {
        var ast = this._parser.parseAction(action, compileElement.elementDescription);
        if (StringWrapper.contains(eventName, EVENT_TARGET_SEPARATOR)) {
            var parts = eventName.split(EVENT_TARGET_SEPARATOR);
            directiveBinderBuilder.bindEvent(parts[1], ast, parts[0]);
        }
        else {
            directiveBinderBuilder.bindEvent(eventName, ast);
        }
    }
    _bindHostProperty(hostPropertyName, expression, compileElement, directiveBinderBuilder) {
        var ast = this._parser.parseSimpleBinding(expression, `hostProperties of ${compileElement.elementDescription}`);
        directiveBinderBuilder.bindHostProperty(hostPropertyName, ast);
    }
    _addHostAttribute(attrName, attrValue, compileElement) {
        if (StringWrapper.equals(attrName, 'class')) {
            ListWrapper.forEach(attrValue.split(' '), (className) => { DOM.addClass(compileElement.element, className); });
        }
        else if (!DOM.hasAttribute(compileElement.element, attrName)) {
            DOM.setAttribute(compileElement.element, attrName, attrValue);
        }
    }
    _splitBindConfig(bindConfig) {
        return ListWrapper.map(bindConfig.split('|'), (s) => s.trim());
    }
}
//# sourceMappingURL=directive_parser.js.map
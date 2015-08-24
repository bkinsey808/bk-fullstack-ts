/* */ 
"format cjs";
import { isPresent } from 'angular2/src/facade/lang';
import { DOM } from 'angular2/src/dom/dom_adapter';
/**
 * Parses interpolations in direct text child nodes of the current element.
 */
export class TextInterpolationParser {
    constructor(_parser) {
        this._parser = _parser;
    }
    processStyle(style) { return style; }
    processElement(parent, current, control) {
        if (!current.compileChildren) {
            return;
        }
        var element = current.element;
        var childNodes = DOM.childNodes(DOM.templateAwareRoot(element));
        for (var i = 0; i < childNodes.length; i++) {
            var node = childNodes[i];
            if (DOM.isTextNode(node)) {
                var textNode = node;
                var text = DOM.nodeValue(textNode);
                var expr = this._parser.parseInterpolation(text, current.elementDescription);
                if (isPresent(expr)) {
                    DOM.setText(textNode, ' ');
                    if (current.element === current.inheritedProtoView.rootElement) {
                        current.inheritedProtoView.bindRootText(textNode, expr);
                    }
                    else {
                        current.bindElement().bindText(textNode, expr);
                    }
                }
            }
        }
    }
}
//# sourceMappingURL=text_interpolation_parser.js.map
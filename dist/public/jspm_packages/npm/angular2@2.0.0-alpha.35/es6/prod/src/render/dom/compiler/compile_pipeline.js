/* */ 
"format cjs";
import { isPresent } from 'angular2/src/facade/lang';
import { DOM } from 'angular2/src/dom/dom_adapter';
import { CompileElement } from './compile_element';
import { CompileControl } from './compile_control';
import { ProtoViewBuilder } from '../view/proto_view_builder';
/**
 * CompilePipeline for executing CompileSteps recursively for
 * all elements in a template.
 */
export class CompilePipeline {
    constructor(steps) {
        this.steps = steps;
        this._control = new CompileControl(steps);
    }
    processStyles(styles) {
        return styles.map(style => {
            this.steps.forEach(step => { style = step.processStyle(style); });
            return style;
        });
    }
    processElements(rootElement, protoViewType, viewDef) {
        var results = [];
        var compilationCtxtDescription = viewDef.componentId;
        var rootCompileElement = new CompileElement(rootElement, compilationCtxtDescription);
        rootCompileElement.inheritedProtoView =
            new ProtoViewBuilder(rootElement, protoViewType, viewDef.encapsulation);
        rootCompileElement.isViewRoot = true;
        this._processElement(results, null, rootCompileElement, compilationCtxtDescription);
        return results;
    }
    _processElement(results, parent, current, compilationCtxtDescription = '') {
        var additionalChildren = this._control.internalProcess(results, 0, parent, current);
        if (current.compileChildren) {
            var node = DOM.firstChild(DOM.templateAwareRoot(current.element));
            while (isPresent(node)) {
                // compiliation can potentially move the node, so we need to store the
                // next sibling before recursing.
                var nextNode = DOM.nextSibling(node);
                if (DOM.isElementNode(node)) {
                    var childCompileElement = new CompileElement(node, compilationCtxtDescription);
                    childCompileElement.inheritedProtoView = current.inheritedProtoView;
                    childCompileElement.inheritedElementBinder = current.inheritedElementBinder;
                    childCompileElement.distanceToInheritedBinder = current.distanceToInheritedBinder + 1;
                    this._processElement(results, current, childCompileElement);
                }
                node = nextNode;
            }
        }
        if (isPresent(additionalChildren)) {
            for (var i = 0; i < additionalChildren.length; i++) {
                this._processElement(results, current, additionalChildren[i]);
            }
        }
    }
}
//# sourceMappingURL=compile_pipeline.js.map
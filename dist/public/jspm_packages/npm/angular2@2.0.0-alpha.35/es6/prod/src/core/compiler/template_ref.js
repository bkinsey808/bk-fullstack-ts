/* */ 
"format cjs";
import { internalView } from './view_ref';
/**
 * Reference to a template within a component.
 *
 * Represents an opaque reference to the underlying template that can
 * be instantiated using the {@link ViewContainerRef}.
 */
export class TemplateRef {
    constructor(elementRef) {
        this.elementRef = elementRef;
    }
    _getProtoView() {
        var parentView = internalView(this.elementRef.parentView);
        return parentView.proto
            .elementBinders[this.elementRef.boundElementIndex - parentView.elementOffset]
            .nestedProtoView;
    }
    get protoViewRef() { return this._getProtoView().ref; }
    /**
     * Whether this template has a local variable with the given name
     */
    hasLocal(name) { return this._getProtoView().variableBindings.has(name); }
}
//# sourceMappingURL=template_ref.js.map
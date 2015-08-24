/* */ 
"format cjs";
import { RenderProtoViewRef } from '../../api';
import { DOM } from 'angular2/src/dom/dom_adapter';
export function resolveInternalDomProtoView(protoViewRef) {
    return protoViewRef._protoView;
}
export class DomProtoViewRef extends RenderProtoViewRef {
    constructor(_protoView) {
        super();
        this._protoView = _protoView;
    }
}
export class DomProtoView {
    // Note: fragments are separated by a comment node that is not counted in fragmentsRootNodeCount!
    constructor(type, cloneableTemplate, encapsulation, elementBinders, hostAttributes, rootTextNodeIndices, boundTextNodeCount, fragmentsRootNodeCount, isSingleElementFragment) {
        this.type = type;
        this.cloneableTemplate = cloneableTemplate;
        this.encapsulation = encapsulation;
        this.elementBinders = elementBinders;
        this.hostAttributes = hostAttributes;
        this.rootTextNodeIndices = rootTextNodeIndices;
        this.boundTextNodeCount = boundTextNodeCount;
        this.fragmentsRootNodeCount = fragmentsRootNodeCount;
        this.isSingleElementFragment = isSingleElementFragment;
    }
    static create(templateCloner, type, rootElement, viewEncapsulation, fragmentsRootNodeCount, rootTextNodeIndices, elementBinders, hostAttributes) {
        var boundTextNodeCount = rootTextNodeIndices.length;
        for (var i = 0; i < elementBinders.length; i++) {
            boundTextNodeCount += elementBinders[i].textNodeIndices.length;
        }
        var isSingleElementFragment = fragmentsRootNodeCount.length === 1 &&
            fragmentsRootNodeCount[0] === 1 &&
            DOM.isElementNode(DOM.firstChild(DOM.content(rootElement)));
        return new DomProtoView(type, templateCloner.prepareForClone(rootElement), viewEncapsulation, elementBinders, hostAttributes, rootTextNodeIndices, boundTextNodeCount, fragmentsRootNodeCount, isSingleElementFragment);
    }
}
//# sourceMappingURL=proto_view.js.map
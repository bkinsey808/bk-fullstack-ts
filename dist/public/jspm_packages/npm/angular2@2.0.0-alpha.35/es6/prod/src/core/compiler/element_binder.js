/* */ 
"format cjs";
import { isBlank, isPresent, BaseException } from 'angular2/src/facade/lang';
export class ElementBinder {
    constructor(index, parent, distanceToParent, protoElementInjector, componentDirective) {
        this.index = index;
        this.parent = parent;
        this.distanceToParent = distanceToParent;
        this.protoElementInjector = protoElementInjector;
        this.componentDirective = componentDirective;
        // updated later, so we are able to resolve cycles
        this.nestedProtoView = null;
        if (isBlank(index)) {
            throw new BaseException('null index not allowed.');
        }
    }
    hasStaticComponent() {
        return isPresent(this.componentDirective) && isPresent(this.nestedProtoView);
    }
    hasEmbeddedProtoView() {
        return !isPresent(this.componentDirective) && isPresent(this.nestedProtoView);
    }
}
//# sourceMappingURL=element_binder.js.map
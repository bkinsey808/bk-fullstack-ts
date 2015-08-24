/* */ 
"format cjs";
import { isPresent } from 'angular2/src/facade/lang';
export class DomElementBinder {
    constructor({ textNodeIndices, hasNestedProtoView, eventLocals, localEvents, globalEvents, hasNativeShadowRoot } = {}) {
        this.textNodeIndices = textNodeIndices;
        this.hasNestedProtoView = hasNestedProtoView;
        this.eventLocals = eventLocals;
        this.localEvents = localEvents;
        this.globalEvents = globalEvents;
        this.hasNativeShadowRoot = isPresent(hasNativeShadowRoot) ? hasNativeShadowRoot : false;
    }
}
export class Event {
    constructor(name, target, fullName) {
        this.name = name;
        this.target = target;
        this.fullName = fullName;
    }
}
export class HostAction {
    constructor(actionName, actionExpression, expression) {
        this.actionName = actionName;
        this.actionExpression = actionExpression;
        this.expression = expression;
    }
}
//# sourceMappingURL=element_binder.js.map
/* */ 
"format cjs";
import { isPresent } from 'angular2/src/facade/lang';
import { ListWrapper } from 'angular2/src/facade/collection';
import { DOM } from 'angular2/src/dom/dom_adapter';
import { internalView } from 'angular2/src/core/compiler/view_ref';
/**
 * A DebugElement contains information from the Angular compiler about an
 * element and provides access to the corresponding ElementInjector and
 * underlying dom Element, as well as a way to query for children.
 */
export class DebugElement {
    constructor(_parentView, _boundElementIndex) {
        this._parentView = _parentView;
        this._boundElementIndex = _boundElementIndex;
        this._elementInjector = this._parentView.elementInjectors[this._boundElementIndex];
    }
    static create(elementRef) {
        return new DebugElement(internalView(elementRef.parentView), elementRef.boundElementIndex);
    }
    get componentInstance() {
        if (!isPresent(this._elementInjector)) {
            return null;
        }
        return this._elementInjector.getComponent();
    }
    get nativeElement() { return this.elementRef.nativeElement; }
    get elementRef() { return this._parentView.elementRefs[this._boundElementIndex]; }
    getDirectiveInstance(directiveIndex) {
        return this._elementInjector.getDirectiveAtIndex(directiveIndex);
    }
    /**
     * Get child DebugElements from within the Light DOM.
     *
     * @return {List<DebugElement>}
     */
    get children() {
        return this._getChildElements(this._parentView, this._boundElementIndex);
    }
    /**
     * Get the root DebugElement children of a component. Returns an empty
     * list if the current DebugElement is not a component root.
     *
     * @return {List<DebugElement>}
     */
    get componentViewChildren() {
        var shadowView = this._parentView.getNestedView(this._boundElementIndex);
        if (!isPresent(shadowView)) {
            // The current element is not a component.
            return [];
        }
        return this._getChildElements(shadowView, null);
    }
    triggerEventHandler(eventName, eventObj) {
        this._parentView.triggerEventHandlers(eventName, eventObj, this._boundElementIndex);
    }
    hasDirective(type) {
        if (!isPresent(this._elementInjector)) {
            return false;
        }
        return this._elementInjector.hasDirective(type);
    }
    inject(type) {
        if (!isPresent(this._elementInjector)) {
            return null;
        }
        return this._elementInjector.get(type);
    }
    getLocal(name) { return this._parentView.locals.get(name); }
    /**
     * Return the first descendant TestElement matching the given predicate
     * and scope.
     *
     * @param {Function: boolean} predicate
     * @param {Scope} scope
     *
     * @return {DebugElement}
     */
    query(predicate, scope = Scope.all) {
        var results = this.queryAll(predicate, scope);
        return results.length > 0 ? results[0] : null;
    }
    /**
     * Return descendant TestElememts matching the given predicate
     * and scope.
     *
     * @param {Function: boolean} predicate
     * @param {Scope} scope
     *
     * @return {List<DebugElement>}
     */
    queryAll(predicate, scope = Scope.all) {
        var elementsInScope = scope(this);
        return ListWrapper.filter(elementsInScope, predicate);
    }
    _getChildElements(view, parentBoundElementIndex) {
        var els = [];
        var parentElementBinder = null;
        if (isPresent(parentBoundElementIndex)) {
            parentElementBinder = view.proto.elementBinders[parentBoundElementIndex - view.elementOffset];
        }
        for (var i = 0; i < view.proto.elementBinders.length; ++i) {
            var binder = view.proto.elementBinders[i];
            if (binder.parent == parentElementBinder) {
                els.push(new DebugElement(view, view.elementOffset + i));
                var views = view.viewContainers[view.elementOffset + i];
                if (isPresent(views)) {
                    ListWrapper.forEach(views.views, (nextView) => {
                        els = ListWrapper.concat(els, this._getChildElements(nextView, null));
                    });
                }
            }
        }
        return els;
    }
}
export function inspectElement(elementRef) {
    return DebugElement.create(elementRef);
}
export function asNativeElements(arr) {
    return arr.map((debugEl) => debugEl.nativeElement);
}
export class Scope {
    static all(debugElement) {
        var scope = [];
        scope.push(debugElement);
        ListWrapper.forEach(debugElement.children, (child) => { scope = ListWrapper.concat(scope, Scope.all(child)); });
        ListWrapper.forEach(debugElement.componentViewChildren, (child) => { scope = ListWrapper.concat(scope, Scope.all(child)); });
        return scope;
    }
    static light(debugElement) {
        var scope = [];
        ListWrapper.forEach(debugElement.children, (child) => {
            scope.push(child);
            scope = ListWrapper.concat(scope, Scope.light(child));
        });
        return scope;
    }
    static view(debugElement) {
        var scope = [];
        ListWrapper.forEach(debugElement.componentViewChildren, (child) => {
            scope.push(child);
            scope = ListWrapper.concat(scope, Scope.light(child));
        });
        return scope;
    }
}
export class By {
    static all() { return (debugElement) => true; }
    static css(selector) {
        return (debugElement) => {
            return isPresent(debugElement.nativeElement) ?
                DOM.elementMatches(debugElement.nativeElement, selector) :
                false;
        };
    }
    static directive(type) {
        return (debugElement) => { return debugElement.hasDirective(type); };
    }
}
//# sourceMappingURL=debug_element.js.map
/* */ 
"format cjs";
import { BaseException } from 'angular2/src/facade/lang';
/**
 * Reference to the element.
 *
 * Represents an opaque reference to the underlying element. The element is a DOM ELement in
 * a Browser, but may represent other types on other rendering platforms. In the browser the
 * `ElementRef` can be sent to the web-worker. Web Workers can not have references to the
 * DOM Elements.
 */
export class ElementRef {
    constructor(parentView, boundElementIndex, renderBoundElementIndex, _renderer) {
        this._renderer = _renderer;
        this.parentView = parentView;
        this.boundElementIndex = boundElementIndex;
        this.renderBoundElementIndex = renderBoundElementIndex;
    }
    /**
     *
     */
    get renderView() { return this.parentView.render; }
    // TODO(tbosch): remove this once Typescript supports declaring interfaces
    // that contain getters
    // https://github.com/Microsoft/TypeScript/issues/3745
    set renderView(viewRef) { throw new BaseException('Abstract setter'); }
    /**
     * Returns the native Element implementation.
     *
     * In the browser this represents the DOM Element.
     *
     * The `nativeElement` can be used as an escape hatch when direct DOM manipulation is needed. Use
     * this with caution, as it creates tight coupling between your application and the Browser, which
     * will not work in WebWorkers.
     *
     * NOTE: This method will return null in the webworker scenario!
     */
    get nativeElement() { return this._renderer.getNativeElementSync(this); }
}
//# sourceMappingURL=element_ref.js.map
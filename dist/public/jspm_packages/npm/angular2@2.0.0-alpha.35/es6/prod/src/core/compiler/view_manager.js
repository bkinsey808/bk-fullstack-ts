/* */ 
"format cjs";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") return Reflect.decorate(decorators, target, key, desc);
    switch (arguments.length) {
        case 2: return decorators.reduceRight(function(o, d) { return (d && d(o)) || o; }, target);
        case 3: return decorators.reduceRight(function(o, d) { return (d && d(target, key)), void 0; }, void 0);
        case 4: return decorators.reduceRight(function(o, d) { return (d && d(target, key, o)) || o; }, desc);
    }
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from 'angular2/di';
import { isPresent, isBlank, BaseException } from 'angular2/src/facade/lang';
import { internalView, internalProtoView } from './view_ref';
import { Renderer, ViewType } from 'angular2/src/render/api';
import { AppViewManagerUtils } from './view_manager_utils';
import { AppViewPool } from './view_pool';
import { AppViewListener } from './view_listener';
import { wtfCreateScope, wtfLeave } from '../../profile/profile';
/**
 * Entry point for creating, moving views in the view hierarchy and destroying views.
 * This manager contains all recursion and delegates to helper methods
 * in AppViewManagerUtils and the Renderer, so unit tests get simpler.
 */
export let AppViewManager = class {
    /**
     * @private
     */
    constructor(_viewPool, _viewListener, _utils, _renderer) {
        this._viewPool = _viewPool;
        this._viewListener = _viewListener;
        this._utils = _utils;
        this._renderer = _renderer;
        this._scope_createRootHostView = wtfCreateScope('AppViewManager#createRootHostView()');
        this._scope_destroyRootHostView = wtfCreateScope('AppViewManager#destroyRootHostView()');
        this._scope_createEmbeddedViewInContainer = wtfCreateScope('AppViewManager#createEmbeddedViewInContainer()');
        this._scope_createHostViewInContainer = wtfCreateScope('AppViewManager#createHostViewInContainer()');
        this._scope_destroyViewInContainer = wtfCreateScope('AppViewMananger#destroyViewInContainer()');
        this._scope_attachViewInContainer = wtfCreateScope('AppViewMananger#attachViewInContainer()');
        this._scope_detachViewInContainer = wtfCreateScope('AppViewMananger#detachViewInContainer()');
    }
    /**
     * Returns a {@link ViewContainerRef} at the {@link ElementRef} location.
     */
    getViewContainer(location) {
        var hostView = internalView(location.parentView);
        return hostView.elementInjectors[location.boundElementIndex].getViewContainerRef();
    }
    /**
     * Return the first child element of the host element view.
     */
    getHostElement(hostViewRef) {
        var hostView = internalView(hostViewRef);
        if (hostView.proto.type !== ViewType.HOST) {
            throw new BaseException('This operation is only allowed on host views');
        }
        return hostView.elementRefs[hostView.elementOffset];
    }
    /**
     * Returns an ElementRef for the element with the given variable name
     * in the current view.
     *
     * - `hostLocation`: {@link ElementRef} of any element in the View which defines the scope of
     *   search.
     * - `variableName`: Name of the variable to locate.
     * - Returns {@link ElementRef} of the found element or null. (Throws if not found.)
     */
    getNamedElementInComponentView(hostLocation, variableName) {
        var hostView = internalView(hostLocation.parentView);
        var boundElementIndex = hostLocation.boundElementIndex;
        var componentView = hostView.getNestedView(boundElementIndex);
        if (isBlank(componentView)) {
            throw new BaseException(`There is no component directive at element ${boundElementIndex}`);
        }
        var binderIdx = componentView.proto.variableLocations.get(variableName);
        if (isBlank(binderIdx)) {
            throw new BaseException(`Could not find variable ${variableName}`);
        }
        return componentView.elementRefs[componentView.elementOffset + binderIdx];
    }
    /**
     * Returns the component instance for a given element.
     *
     * The component is the execution context as seen by an expression at that {@link ElementRef}
     * location.
     */
    getComponent(hostLocation) {
        var hostView = internalView(hostLocation.parentView);
        var boundElementIndex = hostLocation.boundElementIndex;
        return this._utils.getComponentInstance(hostView, boundElementIndex);
    }
    /**
     * Load component view into existing element.
     *
     * Use this if a host element is already in the DOM and it is necessary to upgrade
     * the element into Angular component by attaching a view but reusing the existing element.
     *
     * - `hostProtoViewRef`: {@link ProtoViewRef} Proto view to use in creating a view for this
     *   component.
     * - `overrideSelector`: (optional) selector to use in locating the existing element to load
     *   the view into. If not specified use the selector in the component definition of the
     *   `hostProtoView`.
     * - injector: {@link Injector} to use as parent injector for the view.
     *
     * See {@link AppViewManager#destroyRootHostView}.
     *
     * ## Example
     *
     * ```
     * @ng.Component({
     *   selector: 'child-component'
     * })
     * @ng.View({
     *   template: 'Child'
     * })
     * class ChildComponent {
     *
     * }
     *
     * @ng.Component({
     *   selector: 'my-app'
     * })
     * @ng.View({
     *   template: `
     *     Parent (<some-component></some-component>)
     *   `
     * })
     * class MyApp {
     *   viewRef: ng.ViewRef;
     *
     *   constructor(public appViewManager: ng.AppViewManager, compiler: ng.Compiler) {
     *     compiler.compileInHost(ChildComponent).then((protoView: ng.ProtoViewRef) => {
     *       this.viewRef = appViewManager.createRootHostView(protoView, 'some-component', null);
     *     })
     *   }
     *
     *   onDestroy() {
     *     this.appViewManager.destroyRootHostView(this.viewRef);
     *     this.viewRef = null;
     *   }
     * }
     *
     * ng.bootstrap(MyApp);
     * ```
     */
    createRootHostView(hostProtoViewRef, overrideSelector, injector) {
        var s = this._scope_createRootHostView();
        var hostProtoView = internalProtoView(hostProtoViewRef);
        var hostElementSelector = overrideSelector;
        if (isBlank(hostElementSelector)) {
            hostElementSelector = hostProtoView.elementBinders[0].componentDirective.metadata.selector;
        }
        var renderViewWithFragments = this._renderer.createRootHostView(hostProtoView.mergeMapping.renderProtoViewRef, hostProtoView.mergeMapping.renderFragmentCount, hostElementSelector);
        var hostView = this._createMainView(hostProtoView, renderViewWithFragments);
        this._renderer.hydrateView(hostView.render);
        this._utils.hydrateRootHostView(hostView, injector);
        return wtfLeave(s, hostView.ref);
    }
    /**
     * Remove the View created with {@link AppViewManager#createRootHostView}.
     */
    destroyRootHostView(hostViewRef) {
        // Note: Don't put the hostView into the view pool
        // as it is depending on the element for which it was created.
        var s = this._scope_destroyRootHostView();
        var hostView = internalView(hostViewRef);
        this._renderer.detachFragment(hostView.renderFragment);
        this._renderer.dehydrateView(hostView.render);
        this._viewDehydrateRecurse(hostView);
        this._viewListener.viewDestroyed(hostView);
        this._renderer.destroyView(hostView.render);
        wtfLeave(s);
    }
    /**
     *
     * See {@link AppViewManager#destroyViewInContainer}.
     */
    createEmbeddedViewInContainer(viewContainerLocation, atIndex, templateRef) {
        var s = this._scope_createEmbeddedViewInContainer();
        var protoView = internalProtoView(templateRef.protoViewRef);
        if (protoView.type !== ViewType.EMBEDDED) {
            throw new BaseException('This method can only be called with embedded ProtoViews!');
        }
        return wtfLeave(s, this._createViewInContainer(viewContainerLocation, atIndex, protoView, templateRef.elementRef, null));
    }
    /**
     *
     * See {@link AppViewManager#destroyViewInContainer}.
     */
    createHostViewInContainer(viewContainerLocation, atIndex, protoViewRef, imperativelyCreatedInjector) {
        var s = this._scope_createHostViewInContainer();
        var protoView = internalProtoView(protoViewRef);
        if (protoView.type !== ViewType.HOST) {
            throw new BaseException('This method can only be called with host ProtoViews!');
        }
        return wtfLeave(s, this._createViewInContainer(viewContainerLocation, atIndex, protoView, viewContainerLocation, imperativelyCreatedInjector));
    }
    /**
     *
     * See {@link AppViewManager#destroyViewInContainer}.
     */
    _createViewInContainer(viewContainerLocation, atIndex, protoView, context, imperativelyCreatedInjector) {
        var parentView = internalView(viewContainerLocation.parentView);
        var boundElementIndex = viewContainerLocation.boundElementIndex;
        var contextView = internalView(context.parentView);
        var contextBoundElementIndex = context.boundElementIndex;
        var embeddedFragmentView = contextView.getNestedView(contextBoundElementIndex);
        var view;
        if (protoView.type === ViewType.EMBEDDED && isPresent(embeddedFragmentView) &&
            !embeddedFragmentView.hydrated()) {
            // Case 1: instantiate the first view of a template that has been merged into a parent
            view = embeddedFragmentView;
            this._attachRenderView(parentView, boundElementIndex, atIndex, view);
        }
        else {
            // Case 2: instantiate another copy of the template or a host ProtoView.
            // This is a separate case
            // as we only inline one copy of the template into the parent view.
            view = this._createPooledView(protoView);
            this._attachRenderView(parentView, boundElementIndex, atIndex, view);
            this._renderer.hydrateView(view.render);
        }
        this._utils.attachViewInContainer(parentView, boundElementIndex, contextView, contextBoundElementIndex, atIndex, view);
        this._utils.hydrateViewInContainer(parentView, boundElementIndex, contextView, contextBoundElementIndex, atIndex, imperativelyCreatedInjector);
        return view.ref;
    }
    _attachRenderView(parentView, boundElementIndex, atIndex, view) {
        var elementRef = parentView.elementRefs[boundElementIndex];
        if (atIndex === 0) {
            this._renderer.attachFragmentAfterElement(elementRef, view.renderFragment);
        }
        else {
            var prevView = parentView.viewContainers[boundElementIndex].views[atIndex - 1];
            this._renderer.attachFragmentAfterFragment(prevView.renderFragment, view.renderFragment);
        }
    }
    /**
     *
     * See {@link AppViewManager#createViewInContainer}.
     */
    destroyViewInContainer(viewContainerLocation, atIndex) {
        var s = this._scope_destroyViewInContainer();
        var parentView = internalView(viewContainerLocation.parentView);
        var boundElementIndex = viewContainerLocation.boundElementIndex;
        this._destroyViewInContainer(parentView, boundElementIndex, atIndex);
        wtfLeave(s);
    }
    /**
     *
     * See {@link AppViewManager#detachViewInContainer}.
     */
    attachViewInContainer(viewContainerLocation, atIndex, viewRef) {
        var s = this._scope_attachViewInContainer();
        var view = internalView(viewRef);
        var parentView = internalView(viewContainerLocation.parentView);
        var boundElementIndex = viewContainerLocation.boundElementIndex;
        // TODO(tbosch): the public methods attachViewInContainer/detachViewInContainer
        // are used for moving elements without the same container.
        // We will change this into an atomic `move` operation, which should preserve the
        // previous parent injector (see https://github.com/angular/angular/issues/1377).
        // Right now we are destroying any special
        // context view that might have been used.
        this._utils.attachViewInContainer(parentView, boundElementIndex, null, null, atIndex, view);
        this._attachRenderView(parentView, boundElementIndex, atIndex, view);
        return wtfLeave(s, viewRef);
    }
    /**
     *
     * See {@link AppViewManager#attachViewInContainer}.
     */
    detachViewInContainer(viewContainerLocation, atIndex) {
        var s = this._scope_detachViewInContainer();
        var parentView = internalView(viewContainerLocation.parentView);
        var boundElementIndex = viewContainerLocation.boundElementIndex;
        var viewContainer = parentView.viewContainers[boundElementIndex];
        var view = viewContainer.views[atIndex];
        this._utils.detachViewInContainer(parentView, boundElementIndex, atIndex);
        this._renderer.detachFragment(view.renderFragment);
        return wtfLeave(s, view.ref);
    }
    _createMainView(protoView, renderViewWithFragments) {
        var mergedParentView = this._utils.createView(protoView, renderViewWithFragments, this, this._renderer);
        this._renderer.setEventDispatcher(mergedParentView.render, mergedParentView);
        this._viewListener.viewCreated(mergedParentView);
        return mergedParentView;
    }
    _createPooledView(protoView) {
        var view = this._viewPool.getView(protoView);
        if (isBlank(view)) {
            view = this._createMainView(protoView, this._renderer.createView(protoView.mergeMapping.renderProtoViewRef, protoView.mergeMapping.renderFragmentCount));
        }
        return view;
    }
    _destroyPooledView(view) {
        var wasReturned = this._viewPool.returnView(view);
        if (!wasReturned) {
            this._viewListener.viewDestroyed(view);
            this._renderer.destroyView(view.render);
        }
    }
    _destroyViewInContainer(parentView, boundElementIndex, atIndex) {
        var viewContainer = parentView.viewContainers[boundElementIndex];
        var view = viewContainer.views[atIndex];
        this._viewDehydrateRecurse(view);
        this._utils.detachViewInContainer(parentView, boundElementIndex, atIndex);
        if (view.viewOffset > 0) {
            // Case 1: a view that is part of another view.
            // Just detach the fragment
            this._renderer.detachFragment(view.renderFragment);
        }
        else {
            // Case 2: a view that is not part of another view.
            // dehydrate and destroy it.
            this._renderer.dehydrateView(view.render);
            this._renderer.detachFragment(view.renderFragment);
            this._destroyPooledView(view);
        }
    }
    _viewDehydrateRecurse(view) {
        if (view.hydrated()) {
            this._utils.dehydrateView(view);
        }
        var viewContainers = view.viewContainers;
        var startViewOffset = view.viewOffset;
        var endViewOffset = view.viewOffset + view.mainMergeMapping.nestedViewCountByViewIndex[view.viewOffset];
        var elementOffset = view.elementOffset;
        for (var viewIdx = startViewOffset; viewIdx <= endViewOffset; viewIdx++) {
            var currView = view.views[viewIdx];
            for (var binderIdx = 0; binderIdx < currView.proto.elementBinders.length; binderIdx++, elementOffset++) {
                var vc = viewContainers[elementOffset];
                if (isPresent(vc)) {
                    for (var j = vc.views.length - 1; j >= 0; j--) {
                        this._destroyViewInContainer(currView, elementOffset, j);
                    }
                }
            }
        }
    }
};
AppViewManager = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [AppViewPool, AppViewListener, AppViewManagerUtils, Renderer])
], AppViewManager);
//# sourceMappingURL=view_manager.js.map
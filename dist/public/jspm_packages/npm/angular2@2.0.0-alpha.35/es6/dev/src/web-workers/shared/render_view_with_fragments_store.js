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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Injectable, Inject } from "angular2/di";
import { RenderViewRef, RenderFragmentRef, RenderViewWithFragments } from "angular2/src/render/api";
import { ON_WEB_WORKER } from "angular2/src/web-workers/shared/api";
import { ListWrapper } from "angular2/src/facade/collection";
export let RenderViewWithFragmentsStore = class {
    constructor(onWebWorker) {
        this._nextIndex = 0;
        this._onWebWorker = onWebWorker;
        this._lookupByIndex = new Map();
        this._lookupByView = new Map();
    }
    allocate(fragmentCount) {
        var initialIndex = this._nextIndex;
        var viewRef = new WebWorkerRenderViewRef(this._nextIndex++);
        var fragmentRefs = ListWrapper.createGrowableSize(fragmentCount);
        for (var i = 0; i < fragmentCount; i++) {
            fragmentRefs[i] = new WebWorkerRenderFragmentRef(this._nextIndex++);
        }
        var renderViewWithFragments = new RenderViewWithFragments(viewRef, fragmentRefs);
        this.store(renderViewWithFragments, initialIndex);
        return renderViewWithFragments;
    }
    store(view, startIndex) {
        this._lookupByIndex.set(startIndex, view.viewRef);
        this._lookupByView.set(view.viewRef, startIndex);
        startIndex++;
        ListWrapper.forEach(view.fragmentRefs, (ref) => {
            this._lookupByIndex.set(startIndex, ref);
            this._lookupByView.set(ref, startIndex);
            startIndex++;
        });
    }
    retreive(ref) {
        if (ref == null) {
            return null;
        }
        return this._lookupByIndex.get(ref);
    }
    serializeRenderViewRef(viewRef) {
        return this._serializeRenderFragmentOrViewRef(viewRef);
    }
    serializeRenderFragmentRef(fragmentRef) {
        return this._serializeRenderFragmentOrViewRef(fragmentRef);
    }
    deserializeRenderViewRef(ref) {
        if (ref == null) {
            return null;
        }
        return this.retreive(ref);
    }
    deserializeRenderFragmentRef(ref) {
        if (ref == null) {
            return null;
        }
        return this.retreive(ref);
    }
    _serializeRenderFragmentOrViewRef(ref) {
        if (ref == null) {
            return null;
        }
        if (this._onWebWorker) {
            return ref.serialize();
        }
        else {
            return this._lookupByView.get(ref);
        }
    }
    serializeViewWithFragments(view) {
        if (view == null) {
            return null;
        }
        if (this._onWebWorker) {
            return {
                'viewRef': view.viewRef.serialize(),
                'fragmentRefs': ListWrapper.map(view.fragmentRefs, (val) => val.serialize())
            };
        }
        else {
            return {
                'viewRef': this._lookupByView.get(view.viewRef),
                'fragmentRefs': ListWrapper.map(view.fragmentRefs, (val) => this._lookupByView.get(val))
            };
        }
    }
    deserializeViewWithFragments(obj) {
        if (obj == null) {
            return null;
        }
        var viewRef = this.deserializeRenderViewRef(obj['viewRef']);
        var fragments = ListWrapper.map(obj['fragmentRefs'], (val) => this.deserializeRenderFragmentRef(val));
        return new RenderViewWithFragments(viewRef, fragments);
    }
};
RenderViewWithFragmentsStore = __decorate([
    Injectable(),
    __param(0, Inject(ON_WEB_WORKER)), 
    __metadata('design:paramtypes', [Object])
], RenderViewWithFragmentsStore);
export class WebWorkerRenderViewRef extends RenderViewRef {
    constructor(refNumber) {
        super();
        this.refNumber = refNumber;
    }
    serialize() { return this.refNumber; }
    static deserialize(ref) {
        return new WebWorkerRenderViewRef(ref);
    }
}
export class WebWorkerRenderFragmentRef extends RenderFragmentRef {
    constructor(refNumber) {
        super();
        this.refNumber = refNumber;
    }
    serialize() { return this.refNumber; }
    static deserialize(ref) {
        return new WebWorkerRenderFragmentRef(ref);
    }
}
//# sourceMappingURL=render_view_with_fragments_store.js.map
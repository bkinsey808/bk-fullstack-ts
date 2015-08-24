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
import { RenderProtoViewRef } from "angular2/src/render/api";
import { ON_WEB_WORKER } from "angular2/src/web-workers/shared/api";
export let RenderProtoViewRefStore = class {
    constructor(onWebworker) {
        this._lookupByIndex = new Map();
        this._lookupByProtoView = new Map();
        this._nextIndex = 0;
        this._onWebworker = onWebworker;
    }
    storeRenderProtoViewRef(ref) {
        if (this._lookupByProtoView.has(ref)) {
            return this._lookupByProtoView.get(ref);
        }
        else {
            this._lookupByIndex.set(this._nextIndex, ref);
            this._lookupByProtoView.set(ref, this._nextIndex);
            return this._nextIndex++;
        }
    }
    retreiveRenderProtoViewRef(index) {
        return this._lookupByIndex.get(index);
    }
    deserialize(index) {
        if (index == null) {
            return null;
        }
        if (this._onWebworker) {
            return new WebWorkerRenderProtoViewRef(index);
        }
        else {
            return this.retreiveRenderProtoViewRef(index);
        }
    }
    serialize(ref) {
        if (ref == null) {
            return null;
        }
        if (this._onWebworker) {
            return ref.refNumber;
        }
        else {
            return this.storeRenderProtoViewRef(ref);
        }
    }
};
RenderProtoViewRefStore = __decorate([
    Injectable(),
    __param(0, Inject(ON_WEB_WORKER)), 
    __metadata('design:paramtypes', [Object])
], RenderProtoViewRefStore);
export class WebWorkerRenderProtoViewRef extends RenderProtoViewRef {
    constructor(refNumber) {
        super();
        this.refNumber = refNumber;
    }
}
//# sourceMappingURL=render_proto_view_ref_store.js.map
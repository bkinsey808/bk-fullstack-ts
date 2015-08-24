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
import { XHR } from 'angular2/src/render/xhr';
import { FnArg, UiArguments, MessageBroker } from 'angular2/src/web-workers/worker/broker';
/**
 * Implementation of render/xhr that relays XHR requests to the UI side where they are sent
 * and the result is proxied back to the worker
 */
export let WebWorkerXHRImpl = class extends XHR {
    constructor(_messageBroker) {
        super();
        this._messageBroker = _messageBroker;
    }
    get(url) {
        var fnArgs = [new FnArg(url, null)];
        var args = new UiArguments("xhr", "get", fnArgs);
        return this._messageBroker.runOnUiThread(args, String);
    }
};
WebWorkerXHRImpl = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [MessageBroker])
], WebWorkerXHRImpl);
//# sourceMappingURL=xhr_impl.js.map
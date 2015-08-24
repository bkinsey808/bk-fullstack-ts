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
import { ViewMetadata } from '../metadata/view';
import { stringify, isBlank, BaseException } from 'angular2/src/facade/lang';
import { Map } from 'angular2/src/facade/collection';
import { reflector } from 'angular2/src/reflection/reflection';
export let ViewResolver = class {
    constructor() {
        this._cache = new Map();
    }
    resolve(component) {
        var view = this._cache.get(component);
        if (isBlank(view)) {
            view = this._resolve(component);
            this._cache.set(component, view);
        }
        return view;
    }
    _resolve(component) {
        var annotations = reflector.annotations(component);
        for (var i = 0; i < annotations.length; i++) {
            var annotation = annotations[i];
            if (annotation instanceof ViewMetadata) {
                return annotation;
            }
        }
        throw new BaseException(`No View annotation found on component ${stringify(component)}`);
    }
};
ViewResolver = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [])
], ViewResolver);
//# sourceMappingURL=view_resolver.js.map
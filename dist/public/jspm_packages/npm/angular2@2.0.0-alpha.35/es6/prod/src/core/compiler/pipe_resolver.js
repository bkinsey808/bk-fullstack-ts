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
import { resolveForwardRef, Injectable } from 'angular2/di';
import { isPresent, BaseException, stringify } from 'angular2/src/facade/lang';
import { PipeMetadata } from '../metadata/directives';
import { reflector } from 'angular2/src/reflection/reflection';
/**
 * Resolve a `Type` for {@link PipeMetadata}.
 *
 * This interface can be overridden by the application developer to create custom behavior.
 *
 * See {@link Compiler}
 */
export let PipeResolver = class {
    /**
     * Return {@link PipeMetadata} for a given `Type`.
     */
    resolve(type) {
        var metas = reflector.annotations(resolveForwardRef(type));
        if (isPresent(metas)) {
            for (var i = 0; i < metas.length; i++) {
                var annotation = metas[i];
                if (annotation instanceof PipeMetadata) {
                    return annotation;
                }
            }
        }
        throw new BaseException(`No Pipe decorator found on ${stringify(type)}`);
    }
};
PipeResolver = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [])
], PipeResolver);
//# sourceMappingURL=pipe_resolver.js.map
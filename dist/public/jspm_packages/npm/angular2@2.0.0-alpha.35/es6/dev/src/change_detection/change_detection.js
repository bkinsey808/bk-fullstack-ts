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
import { JitProtoChangeDetector } from './jit_proto_change_detector';
import { PregenProtoChangeDetector } from './pregen_proto_change_detector';
import { DynamicProtoChangeDetector } from './proto_change_detector';
import { IterableDiffers } from './differs/iterable_differs';
import { DefaultIterableDifferFactory } from './differs/default_iterable_differ';
import { KeyValueDiffers } from './differs/keyvalue_differs';
import { DefaultKeyValueDifferFactory } from './differs/default_keyvalue_differ';
import { ChangeDetection } from './interfaces';
import { Inject, Injectable, OpaqueToken, Optional } from 'angular2/di';
import { StringMapWrapper } from 'angular2/src/facade/collection';
import { CONST, CONST_EXPR, isPresent } from 'angular2/src/facade/lang';
export { ASTWithSource, AST, AstTransformer, PropertyRead, LiteralArray, ImplicitReceiver } from './parser/ast';
export { Lexer } from './parser/lexer';
export { Parser } from './parser/parser';
export { Locals } from './parser/locals';
export { DehydratedException, ExpressionChangedAfterItHasBeenCheckedException, ChangeDetectionError } from './exceptions';
export { ChangeDetection, ChangeDetectorDefinition, DebugContext } from './interfaces';
export { CHECK_ONCE, CHECK_ALWAYS, DETACHED, CHECKED, ON_PUSH, DEFAULT } from './constants';
export { DynamicProtoChangeDetector } from './proto_change_detector';
export { BindingRecord } from './binding_record';
export { DirectiveIndex, DirectiveRecord } from './directive_record';
export { DynamicChangeDetector } from './dynamic_change_detector';
export { ChangeDetectorRef } from './change_detector_ref';
export { IterableDiffers } from './differs/iterable_differs';
export { KeyValueDiffers } from './differs/keyvalue_differs';
export { WrappedValue } from './change_detection_util';
/**
 * Structural diffing for `Object`s and `Map`s.
 */
export const keyValDiff = CONST_EXPR([CONST_EXPR(new DefaultKeyValueDifferFactory())]);
/**
 * Structural diffing for `Iterable` types such as `Array`s.
 */
export const iterableDiff = CONST_EXPR([CONST_EXPR(new DefaultIterableDifferFactory())]);
export const defaultIterableDiffers = CONST_EXPR(new IterableDiffers(iterableDiff));
export const defaultKeyValueDiffers = CONST_EXPR(new KeyValueDiffers(keyValDiff));
/**
 * Map from {@link ChangeDetectorDefinition#id} to a factory method which takes a
 * {@link Pipes} and a {@link ChangeDetectorDefinition} and generates a
 * {@link ProtoChangeDetector} associated with the definition.
 */
// TODO(kegluneq): Use PregenProtoChangeDetectorFactory rather than Function once possible in
// dart2js. See https://github.com/dart-lang/sdk/issues/23630 for details.
export var preGeneratedProtoDetectors = {};
export const PROTO_CHANGE_DETECTOR = CONST_EXPR(new OpaqueToken('ProtoChangeDetectors'));
/**
 * Implements change detection using a map of pregenerated proto detectors.
 */
export let PreGeneratedChangeDetection = class extends ChangeDetection {
    constructor(protoChangeDetectorsForTest) {
        super();
        this._dynamicChangeDetection = new DynamicChangeDetection();
        this._protoChangeDetectorFactories = isPresent(protoChangeDetectorsForTest) ?
            protoChangeDetectorsForTest :
            preGeneratedProtoDetectors;
    }
    static isSupported() { return PregenProtoChangeDetector.isSupported(); }
    createProtoChangeDetector(definition) {
        var id = definition.id;
        if (StringMapWrapper.contains(this._protoChangeDetectorFactories, id)) {
            return StringMapWrapper.get(this._protoChangeDetectorFactories, id)(definition);
        }
        return this._dynamicChangeDetection.createProtoChangeDetector(definition);
    }
};
PreGeneratedChangeDetection = __decorate([
    Injectable(),
    __param(0, Inject(PROTO_CHANGE_DETECTOR)),
    __param(0, Optional()), 
    __metadata('design:paramtypes', [Object])
], PreGeneratedChangeDetection);
/**
 * Implements change detection that does not require `eval()`.
 *
 * This is slower than {@link JitChangeDetection}.
 */
export let DynamicChangeDetection = class extends ChangeDetection {
    createProtoChangeDetector(definition) {
        return new DynamicProtoChangeDetector(definition);
    }
};
DynamicChangeDetection = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [])
], DynamicChangeDetection);
/**
 * Implements faster change detection by generating source code.
 *
 * This requires `eval()`. For change detection that does not require `eval()`, see
 * {@link DynamicChangeDetection} and {@link PreGeneratedChangeDetection}.
 */
export let JitChangeDetection = class extends ChangeDetection {
    static isSupported() { return JitProtoChangeDetector.isSupported(); }
    createProtoChangeDetector(definition) {
        return new JitProtoChangeDetector(definition);
    }
};
JitChangeDetection = __decorate([
    Injectable(),
    CONST(), 
    __metadata('design:paramtypes', [])
], JitChangeDetection);
//# sourceMappingURL=change_detection.js.map
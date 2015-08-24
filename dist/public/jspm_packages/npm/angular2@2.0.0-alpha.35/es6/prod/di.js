/* */ 
"format cjs";
/**
 * @module
 * @description
 * The `di` module provides dependency injection container services.
 */
export { InjectMetadata, OptionalMetadata, InjectableMetadata, SelfMetadata, HostMetadata, SkipSelfMetadata, DependencyMetadata } from './src/di/metadata';
// we have to reexport * because Dart and TS export two different sets of types
export * from './src/di/decorators';
export { forwardRef, resolveForwardRef } from './src/di/forward_ref';
export { Injector, ProtoInjector, BindingWithVisibility, Visibility, UNDEFINED } from './src/di/injector';
export { Binding, BindingBuilder, ResolvedBinding, Dependency, bind } from './src/di/binding';
export { Key, KeyRegistry, TypeLiteral } from './src/di/key';
export { NoBindingError, AbstractBindingError, CyclicDependencyError, InstantiationError, InvalidBindingError, NoAnnotationError, OutOfBoundsError } from './src/di/exceptions';
export { OpaqueToken } from './src/di/opaque_token';
//# sourceMappingURL=di.js.map
/* */ 
"format cjs";
/**
 * This indirection is needed to free up Component, etc symbols in the public API
 * to be used by the decorator versions of these annotations.
 */
export { QueryMetadata, ViewQueryMetadata, AttributeMetadata } from './metadata/di';
export { ComponentMetadata, DirectiveMetadata, PipeMetadata, LifecycleEvent } from './metadata/directives';
export { ViewMetadata, ViewEncapsulation } from './metadata/view';
import { QueryMetadata, ViewQueryMetadata, AttributeMetadata } from './metadata/di';
import { ComponentMetadata, DirectiveMetadata, PipeMetadata } from './metadata/directives';
import { ViewMetadata } from './metadata/view';
import { makeDecorator, makeParamDecorator } from '../util/decorators';
/**
 * {@link ComponentMetadata} factory function.
 */
export var Component = makeDecorator(ComponentMetadata, (fn) => fn.View = View);
/**
 * {@link DirectiveMetadata} factory function.
 */
export var Directive = makeDecorator(DirectiveMetadata);
/**
 * {@link ViewMetadata} factory function.
 */
export var View = makeDecorator(ViewMetadata, (fn) => fn.View = View);
/**
 * {@link AttributeMetadata} factory function.
 */
export var Attribute = makeParamDecorator(AttributeMetadata);
/**
 * {@link QueryMetadata} factory function.
 */
export var Query = makeParamDecorator(QueryMetadata);
/**
 * {@link ViewQueryMetadata} factory function.
 */
export var ViewQuery = makeParamDecorator(ViewQueryMetadata);
/**
 * {@link PipeMetadata} factory function.
 */
export var Pipe = makeDecorator(PipeMetadata);
//# sourceMappingURL=metadata.js.map
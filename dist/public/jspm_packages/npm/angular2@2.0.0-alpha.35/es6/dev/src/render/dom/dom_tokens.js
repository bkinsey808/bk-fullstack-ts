/* */ 
"format cjs";
import { OpaqueToken, Binding } from 'angular2/di';
import { CONST_EXPR, StringWrapper, Math } from 'angular2/src/facade/lang';
export const DOCUMENT = CONST_EXPR(new OpaqueToken('DocumentToken'));
export const DOM_REFLECT_PROPERTIES_AS_ATTRIBUTES = CONST_EXPR(new OpaqueToken('DomReflectPropertiesAsAttributes'));
/**
 * A unique id (string) for an angular application.
 */
export const APP_ID = CONST_EXPR(new OpaqueToken('AppId'));
function _appIdRandomBindingFactory() {
    return `${randomChar()}${randomChar()}${randomChar()}`;
}
/**
 * Bindings that will generate a random APP_ID_TOKEN.
 */
export const APP_ID_RANDOM_BINDING = CONST_EXPR(new Binding(APP_ID, { toFactory: _appIdRandomBindingFactory, deps: [] }));
/**
 * Defines when a compiled template should be stored as a string
 * rather than keeping its Nodes to preserve memory.
 */
export const MAX_IN_MEMORY_ELEMENTS_PER_TEMPLATE = CONST_EXPR(new OpaqueToken('MaxInMemoryElementsPerTemplate'));
function randomChar() {
    return StringWrapper.fromCharCode(97 + Math.floor(Math.random() * 25));
}
//# sourceMappingURL=dom_tokens.js.map
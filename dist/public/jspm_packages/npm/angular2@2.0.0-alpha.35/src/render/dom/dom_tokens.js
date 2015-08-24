/* */ 
'use strict';
var di_1 = require("../../../di");
var lang_1 = require("../../facade/lang");
exports.DOCUMENT = lang_1.CONST_EXPR(new di_1.OpaqueToken('DocumentToken'));
exports.DOM_REFLECT_PROPERTIES_AS_ATTRIBUTES = lang_1.CONST_EXPR(new di_1.OpaqueToken('DomReflectPropertiesAsAttributes'));
exports.APP_ID = lang_1.CONST_EXPR(new di_1.OpaqueToken('AppId'));
function _appIdRandomBindingFactory() {
  return "" + randomChar() + randomChar() + randomChar();
}
exports.APP_ID_RANDOM_BINDING = lang_1.CONST_EXPR(new di_1.Binding(exports.APP_ID, {
  toFactory: _appIdRandomBindingFactory,
  deps: []
}));
exports.MAX_IN_MEMORY_ELEMENTS_PER_TEMPLATE = lang_1.CONST_EXPR(new di_1.OpaqueToken('MaxInMemoryElementsPerTemplate'));
function randomChar() {
  return lang_1.StringWrapper.fromCharCode(97 + lang_1.Math.floor(lang_1.Math.random() * 25));
}

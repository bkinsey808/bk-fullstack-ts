/* */ 
'use strict';
var di_1 = require("../../di");
var lang_1 = require("../facade/lang");
exports.APP_COMPONENT_REF_PROMISE = lang_1.CONST_EXPR(new di_1.OpaqueToken('Promise<ComponentRef>'));
exports.APP_COMPONENT = lang_1.CONST_EXPR(new di_1.OpaqueToken('AppComponent'));

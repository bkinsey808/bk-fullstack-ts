/* */ 
'use strict';
function __export(m) {
  for (var p in m)
    if (!exports.hasOwnProperty(p))
      exports[p] = m[p];
}
var lang_1 = require("./src/facade/lang");
var ng_class_1 = require("./src/directives/ng_class");
var ng_for_1 = require("./src/directives/ng_for");
var ng_if_1 = require("./src/directives/ng_if");
var ng_non_bindable_1 = require("./src/directives/ng_non_bindable");
var ng_switch_1 = require("./src/directives/ng_switch");
__export(require("./src/directives/ng_class"));
__export(require("./src/directives/ng_for"));
__export(require("./src/directives/ng_if"));
__export(require("./src/directives/ng_non_bindable"));
__export(require("./src/directives/ng_style"));
__export(require("./src/directives/ng_switch"));
exports.CORE_DIRECTIVES = lang_1.CONST_EXPR([ng_class_1.NgClass, ng_for_1.NgFor, ng_if_1.NgIf, ng_non_bindable_1.NgNonBindable, ng_switch_1.NgSwitch, ng_switch_1.NgSwitchWhen, ng_switch_1.NgSwitchDefault]);

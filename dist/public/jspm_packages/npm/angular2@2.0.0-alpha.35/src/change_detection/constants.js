/* */ 
'use strict';
var lang_1 = require("../facade/lang");
exports.CHECK_ONCE = "CHECK_ONCE";
exports.CHECKED = "CHECKED";
exports.CHECK_ALWAYS = "ALWAYS_CHECK";
exports.DETACHED = "DETACHED";
exports.ON_PUSH = "ON_PUSH";
exports.DEFAULT = "DEFAULT";
function isDefaultChangeDetectionStrategy(changeDetectionStrategy) {
  return lang_1.isBlank(changeDetectionStrategy) || lang_1.StringWrapper.equals(changeDetectionStrategy, exports.DEFAULT);
}
exports.isDefaultChangeDetectionStrategy = isDefaultChangeDetectionStrategy;

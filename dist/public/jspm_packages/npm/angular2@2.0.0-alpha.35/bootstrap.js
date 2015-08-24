/* */ 
'use strict';
function __export(m) {
  for (var p in m)
    if (!exports.hasOwnProperty(p))
      exports[p] = m[p];
}
var application_1 = require("./src/core/application");
exports.bootstrap = application_1.bootstrap;
__export(require("./metadata"));
__export(require("./change_detection"));
__export(require("./core"));
__export(require("./di"));
__export(require("./directives"));
__export(require("./forms"));
__export(require("./render"));

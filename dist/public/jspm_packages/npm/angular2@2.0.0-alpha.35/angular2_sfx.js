/* */ 
'use strict';
var ng = require("./angular2");
var router = require("./router");
var _prevNg = window.ng;
window.ng = ng;
window.ngRouter = router;
ng.noConflict = function() {
  window.ng = _prevNg;
  return ng;
};

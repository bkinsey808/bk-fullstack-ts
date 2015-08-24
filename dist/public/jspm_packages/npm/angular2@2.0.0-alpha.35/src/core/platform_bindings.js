/* */ 
'use strict';
var di_1 = require("../../di");
var exception_handler_1 = require("./exception_handler");
var dom_adapter_1 = require("../dom/dom_adapter");
exports.EXCEPTION_BINDING = di_1.bind(exception_handler_1.ExceptionHandler).toFactory(function() {
  return new exception_handler_1.ExceptionHandler(dom_adapter_1.DOM, false);
}, []);

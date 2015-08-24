/* */ 
'use strict';
var di_1 = require("./metadata/di");
exports.QueryMetadata = di_1.QueryMetadata;
exports.ViewQueryMetadata = di_1.ViewQueryMetadata;
exports.AttributeMetadata = di_1.AttributeMetadata;
var directives_1 = require("./metadata/directives");
exports.ComponentMetadata = directives_1.ComponentMetadata;
exports.DirectiveMetadata = directives_1.DirectiveMetadata;
exports.PipeMetadata = directives_1.PipeMetadata;
exports.LifecycleEvent = directives_1.LifecycleEvent;
var view_1 = require("./metadata/view");
exports.ViewMetadata = view_1.ViewMetadata;
exports.ViewEncapsulation = view_1.ViewEncapsulation;
var di_2 = require("./metadata/di");
var directives_2 = require("./metadata/directives");
var view_2 = require("./metadata/view");
var decorators_1 = require("../util/decorators");
exports.Component = decorators_1.makeDecorator(directives_2.ComponentMetadata, function(fn) {
  return fn.View = exports.View;
});
exports.Directive = decorators_1.makeDecorator(directives_2.DirectiveMetadata);
exports.View = decorators_1.makeDecorator(view_2.ViewMetadata, function(fn) {
  return fn.View = exports.View;
});
exports.Attribute = decorators_1.makeParamDecorator(di_2.AttributeMetadata);
exports.Query = decorators_1.makeParamDecorator(di_2.QueryMetadata);
exports.ViewQuery = decorators_1.makeParamDecorator(di_2.ViewQueryMetadata);
exports.Pipe = decorators_1.makeDecorator(directives_2.PipeMetadata);

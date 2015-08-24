/* */ 
'use strict';
var route_config_impl_1 = require("./route_config_impl");
var decorators_1 = require("../util/decorators");
var route_config_impl_2 = require("./route_config_impl");
exports.Route = route_config_impl_2.Route;
exports.Redirect = route_config_impl_2.Redirect;
exports.AuxRoute = route_config_impl_2.AuxRoute;
exports.AsyncRoute = route_config_impl_2.AsyncRoute;
exports.ROUTE_DATA = route_config_impl_2.ROUTE_DATA;
exports.RouteConfig = decorators_1.makeDecorator(route_config_impl_1.RouteConfig);

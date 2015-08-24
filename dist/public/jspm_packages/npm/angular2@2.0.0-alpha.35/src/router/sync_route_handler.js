/* */ 
'use strict';
var async_1 = require("../facade/async");
var SyncRouteHandler = (function() {
  function SyncRouteHandler(componentType, data) {
    this.componentType = componentType;
    this.data = data;
    this._resolvedComponent = null;
    this._resolvedComponent = async_1.PromiseWrapper.resolve(componentType);
  }
  SyncRouteHandler.prototype.resolveComponentType = function() {
    return this._resolvedComponent;
  };
  return SyncRouteHandler;
})();
exports.SyncRouteHandler = SyncRouteHandler;

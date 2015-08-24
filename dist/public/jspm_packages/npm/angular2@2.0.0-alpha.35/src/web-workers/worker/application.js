/* */ 
'use strict';
var __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
    return Reflect.decorate(decorators, target, key, desc);
  switch (arguments.length) {
    case 2:
      return decorators.reduceRight(function(o, d) {
        return (d && d(o)) || o;
      }, target);
    case 3:
      return decorators.reduceRight(function(o, d) {
        return (d && d(target, key)), void 0;
      }, void 0);
    case 4:
      return decorators.reduceRight(function(o, d) {
        return (d && d(target, key, o)) || o;
      }, desc);
  }
};
var __metadata = (this && this.__metadata) || function(k, v) {
  if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
    return Reflect.metadata(k, v);
};
var application_common_1 = require("./application_common");
var di_1 = require("../../../di");
var _postMessage = postMessage;
function bootstrapWebWorker(appComponentType, componentInjectableBindings) {
  if (componentInjectableBindings === void 0) {
    componentInjectableBindings = null;
  }
  var bus = new WebWorkerMessageBus(new WebWorkerMessageBusSink(), new WebWorkerMessageBusSource());
  return application_common_1.bootstrapWebWorkerCommon(appComponentType, bus, componentInjectableBindings);
}
exports.bootstrapWebWorker = bootstrapWebWorker;
var WebWorkerMessageBus = (function() {
  function WebWorkerMessageBus(sink, source) {
    this.sink = sink;
    this.source = source;
  }
  WebWorkerMessageBus = __decorate([di_1.Injectable(), __metadata('design:paramtypes', [WebWorkerMessageBusSink, WebWorkerMessageBusSource])], WebWorkerMessageBus);
  return WebWorkerMessageBus;
})();
exports.WebWorkerMessageBus = WebWorkerMessageBus;
var WebWorkerMessageBusSink = (function() {
  function WebWorkerMessageBusSink() {}
  WebWorkerMessageBusSink.prototype.send = function(message) {
    _postMessage(message);
  };
  return WebWorkerMessageBusSink;
})();
exports.WebWorkerMessageBusSink = WebWorkerMessageBusSink;
var WebWorkerMessageBusSource = (function() {
  function WebWorkerMessageBusSource() {
    this.numListeners = 0;
    this.listenerStore = new Map();
  }
  WebWorkerMessageBusSource.prototype.addListener = function(fn) {
    addEventListener("message", fn);
    this.listenerStore[++this.numListeners] = fn;
    return this.numListeners;
  };
  WebWorkerMessageBusSource.prototype.removeListener = function(index) {
    removeEventListener("message", this.listenerStore[index]);
    this.listenerStore.delete(index);
  };
  return WebWorkerMessageBusSource;
})();
exports.WebWorkerMessageBusSource = WebWorkerMessageBusSource;

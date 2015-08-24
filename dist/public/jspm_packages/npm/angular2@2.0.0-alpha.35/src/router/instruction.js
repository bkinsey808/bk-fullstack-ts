/* */ 
'use strict';
var collection_1 = require("../facade/collection");
var lang_1 = require("../facade/lang");
var RouteParams = (function() {
  function RouteParams(params) {
    this.params = params;
  }
  RouteParams.prototype.get = function(param) {
    return lang_1.normalizeBlank(collection_1.StringMapWrapper.get(this.params, param));
  };
  return RouteParams;
})();
exports.RouteParams = RouteParams;
var Instruction = (function() {
  function Instruction(component, child, auxInstruction) {
    this.component = component;
    this.child = child;
    this.auxInstruction = auxInstruction;
  }
  Instruction.prototype.replaceChild = function(child) {
    return new Instruction(this.component, child, this.auxInstruction);
  };
  return Instruction;
})();
exports.Instruction = Instruction;
var PrimaryInstruction = (function() {
  function PrimaryInstruction(component, child, auxUrls) {
    this.component = component;
    this.child = child;
    this.auxUrls = auxUrls;
  }
  return PrimaryInstruction;
})();
exports.PrimaryInstruction = PrimaryInstruction;
function stringifyInstruction(instruction) {
  var params = instruction.component.urlParams.length > 0 ? ('?' + instruction.component.urlParams.join('&')) : '';
  return instruction.component.urlPath + stringifyAux(instruction) + stringifyPrimary(instruction.child) + params;
}
exports.stringifyInstruction = stringifyInstruction;
function stringifyPrimary(instruction) {
  if (lang_1.isBlank(instruction)) {
    return '';
  }
  var params = instruction.component.urlParams.length > 0 ? (';' + instruction.component.urlParams.join(';')) : '';
  return '/' + instruction.component.urlPath + params + stringifyAux(instruction) + stringifyPrimary(instruction.child);
}
function stringifyAux(instruction) {
  var routes = [];
  collection_1.StringMapWrapper.forEach(instruction.auxInstruction, function(auxInstruction, _) {
    routes.push(stringifyPrimary(auxInstruction));
  });
  if (routes.length > 0) {
    return '(' + routes.join('//') + ')';
  }
  return '';
}
var ComponentInstruction = (function() {
  function ComponentInstruction(urlPath, urlParams, _recognizer, params) {
    if (params === void 0) {
      params = null;
    }
    this.urlPath = urlPath;
    this.urlParams = urlParams;
    this._recognizer = _recognizer;
    this.params = params;
    this.reuse = false;
  }
  Object.defineProperty(ComponentInstruction.prototype, "componentType", {
    get: function() {
      return this._recognizer.handler.componentType;
    },
    enumerable: true,
    configurable: true
  });
  ComponentInstruction.prototype.resolveComponentType = function() {
    return this._recognizer.handler.resolveComponentType();
  };
  Object.defineProperty(ComponentInstruction.prototype, "specificity", {
    get: function() {
      return this._recognizer.specificity;
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(ComponentInstruction.prototype, "terminal", {
    get: function() {
      return this._recognizer.terminal;
    },
    enumerable: true,
    configurable: true
  });
  ComponentInstruction.prototype.routeData = function() {
    return this._recognizer.handler.data;
  };
  return ComponentInstruction;
})();
exports.ComponentInstruction = ComponentInstruction;

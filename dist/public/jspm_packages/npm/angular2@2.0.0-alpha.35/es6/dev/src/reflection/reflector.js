/* */ 
"format cjs";
import { isPresent } from 'angular2/src/facade/lang';
import { Map, StringMapWrapper } from 'angular2/src/facade/collection';
export class ReflectionInfo {
    constructor(annotations, parameters, factory, interfaces) {
        this._annotations = annotations;
        this._parameters = parameters;
        this._factory = factory;
        this._interfaces = interfaces;
    }
}
export class Reflector {
    constructor(reflectionCapabilities) {
        this._injectableInfo = new Map();
        this._getters = new Map();
        this._setters = new Map();
        this._methods = new Map();
        this.reflectionCapabilities = reflectionCapabilities;
    }
    isReflectionEnabled() { return this.reflectionCapabilities.isReflectionEnabled(); }
    registerFunction(func, funcInfo) {
        this._injectableInfo.set(func, funcInfo);
    }
    registerType(type, typeInfo) {
        this._injectableInfo.set(type, typeInfo);
    }
    registerGetters(getters) {
        _mergeMaps(this._getters, getters);
    }
    registerSetters(setters) {
        _mergeMaps(this._setters, setters);
    }
    registerMethods(methods) {
        _mergeMaps(this._methods, methods);
    }
    factory(type) {
        if (this._containsReflectionInfo(type)) {
            var res = this._injectableInfo.get(type)._factory;
            return isPresent(res) ? res : null;
        }
        else {
            return this.reflectionCapabilities.factory(type);
        }
    }
    parameters(typeOrFunc) {
        if (this._injectableInfo.has(typeOrFunc)) {
            var res = this._injectableInfo.get(typeOrFunc)._parameters;
            return isPresent(res) ? res : [];
        }
        else {
            return this.reflectionCapabilities.parameters(typeOrFunc);
        }
    }
    annotations(typeOrFunc) {
        if (this._injectableInfo.has(typeOrFunc)) {
            var res = this._injectableInfo.get(typeOrFunc)._annotations;
            return isPresent(res) ? res : [];
        }
        else {
            return this.reflectionCapabilities.annotations(typeOrFunc);
        }
    }
    interfaces(type) {
        if (this._injectableInfo.has(type)) {
            var res = this._injectableInfo.get(type)._interfaces;
            return isPresent(res) ? res : [];
        }
        else {
            return this.reflectionCapabilities.interfaces(type);
        }
    }
    getter(name) {
        if (this._getters.has(name)) {
            return this._getters.get(name);
        }
        else {
            return this.reflectionCapabilities.getter(name);
        }
    }
    setter(name) {
        if (this._setters.has(name)) {
            return this._setters.get(name);
        }
        else {
            return this.reflectionCapabilities.setter(name);
        }
    }
    method(name) {
        if (this._methods.has(name)) {
            return this._methods.get(name);
        }
        else {
            return this.reflectionCapabilities.method(name);
        }
    }
    _containsReflectionInfo(typeOrFunc) { return this._injectableInfo.has(typeOrFunc); }
}
function _mergeMaps(target, config) {
    StringMapWrapper.forEach(config, (v, k) => target.set(k, v));
}
//# sourceMappingURL=reflector.js.map
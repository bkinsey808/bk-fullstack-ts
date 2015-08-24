/* */ 
'use strict';
var collection_1 = require("../../facade/collection");
var QueryList = (function() {
  function QueryList() {
    this._results = [];
    this._callbacks = [];
    this._dirty = false;
  }
  QueryList.prototype.reset = function(newList) {
    this._results = newList;
    this._dirty = true;
  };
  QueryList.prototype.add = function(obj) {
    this._results.push(obj);
    this._dirty = true;
  };
  QueryList.prototype.fireCallbacks = function() {
    if (this._dirty) {
      collection_1.ListWrapper.forEach(this._callbacks, function(c) {
        return c();
      });
      this._dirty = false;
    }
  };
  QueryList.prototype.onChange = function(callback) {
    this._callbacks.push(callback);
  };
  QueryList.prototype.removeCallback = function(callback) {
    collection_1.ListWrapper.remove(this._callbacks, callback);
  };
  QueryList.prototype.toString = function() {
    return this._results.toString();
  };
  Object.defineProperty(QueryList.prototype, "length", {
    get: function() {
      return this._results.length;
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(QueryList.prototype, "first", {
    get: function() {
      return collection_1.ListWrapper.first(this._results);
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(QueryList.prototype, "last", {
    get: function() {
      return collection_1.ListWrapper.last(this._results);
    },
    enumerable: true,
    configurable: true
  });
  QueryList.prototype.map = function(fn) {
    return this._results.map(fn);
  };
  QueryList.prototype[Symbol.iterator] = function() {
    return this._results[Symbol.iterator]();
  };
  return QueryList;
})();
exports.QueryList = QueryList;

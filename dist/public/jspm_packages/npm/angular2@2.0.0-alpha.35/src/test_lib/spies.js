/* */ 
'use strict';
var __extends = (this && this.__extends) || function(d, b) {
  for (var p in b)
    if (b.hasOwnProperty(p))
      d[p] = b[p];
  function __() {
    this.constructor = d;
  }
  __.prototype = b.prototype;
  d.prototype = new __();
};
var change_detection_1 = require("../change_detection/change_detection");
var test_lib_1 = require("./test_lib");
var SpyChangeDetector = (function(_super) {
  __extends(SpyChangeDetector, _super);
  function SpyChangeDetector() {
    _super.call(this, change_detection_1.DynamicChangeDetector);
  }
  return SpyChangeDetector;
})(test_lib_1.SpyObject);
exports.SpyChangeDetector = SpyChangeDetector;
var SpyProtoChangeDetector = (function(_super) {
  __extends(SpyProtoChangeDetector, _super);
  function SpyProtoChangeDetector() {
    _super.call(this, change_detection_1.DynamicChangeDetector);
  }
  return SpyProtoChangeDetector;
})(test_lib_1.SpyObject);
exports.SpyProtoChangeDetector = SpyProtoChangeDetector;
var SpyDependencyProvider = (function(_super) {
  __extends(SpyDependencyProvider, _super);
  function SpyDependencyProvider() {
    _super.apply(this, arguments);
  }
  return SpyDependencyProvider;
})(test_lib_1.SpyObject);
exports.SpyDependencyProvider = SpyDependencyProvider;
var SpyIterableDifferFactory = (function(_super) {
  __extends(SpyIterableDifferFactory, _super);
  function SpyIterableDifferFactory() {
    _super.apply(this, arguments);
  }
  return SpyIterableDifferFactory;
})(test_lib_1.SpyObject);
exports.SpyIterableDifferFactory = SpyIterableDifferFactory;
var SpyInjector = (function(_super) {
  __extends(SpyInjector, _super);
  function SpyInjector() {
    _super.apply(this, arguments);
  }
  return SpyInjector;
})(test_lib_1.SpyObject);
exports.SpyInjector = SpyInjector;
var SpyChangeDetectorRef = (function(_super) {
  __extends(SpyChangeDetectorRef, _super);
  function SpyChangeDetectorRef() {
    _super.call(this, change_detection_1.ChangeDetectorRef);
  }
  return SpyChangeDetectorRef;
})(test_lib_1.SpyObject);
exports.SpyChangeDetectorRef = SpyChangeDetectorRef;

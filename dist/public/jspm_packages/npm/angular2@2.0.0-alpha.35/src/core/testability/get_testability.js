/* */ 
'use strict';
var lang_1 = require("../../facade/lang");
var PublicTestability = (function() {
  function PublicTestability(testability) {
    this._testability = testability;
  }
  PublicTestability.prototype.whenStable = function(callback) {
    this._testability.whenStable(callback);
  };
  PublicTestability.prototype.findBindings = function(using, binding, exactMatch) {
    return this._testability.findBindings(using, binding, exactMatch);
  };
  return PublicTestability;
})();
var GetTestability = (function() {
  function GetTestability() {}
  GetTestability.addToWindow = function(registry) {
    lang_1.global.getAngularTestability = function(elem, findInAncestors) {
      if (findInAncestors === void 0) {
        findInAncestors = true;
      }
      var testability = registry.findTestabilityInTree(elem, findInAncestors);
      if (testability == null) {
        throw new Error('Could not find testability for element.');
      }
      return new PublicTestability(testability);
    };
    lang_1.global.getAllAngularTestabilities = function() {
      var testabilities = registry.getAllTestabilities();
      return testabilities.map(function(testability) {
        return new PublicTestability(testability);
      });
    };
  };
  return GetTestability;
})();
exports.GetTestability = GetTestability;

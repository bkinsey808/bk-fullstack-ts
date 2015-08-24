/* */ 
'use strict';
var lang_1 = require("../facade/lang");
var constants_1 = require("./constants");
var DirectiveIndex = (function() {
  function DirectiveIndex(elementIndex, directiveIndex) {
    this.elementIndex = elementIndex;
    this.directiveIndex = directiveIndex;
  }
  Object.defineProperty(DirectiveIndex.prototype, "name", {
    get: function() {
      return this.elementIndex + "_" + this.directiveIndex;
    },
    enumerable: true,
    configurable: true
  });
  return DirectiveIndex;
})();
exports.DirectiveIndex = DirectiveIndex;
var DirectiveRecord = (function() {
  function DirectiveRecord(_a) {
    var _b = _a === void 0 ? {} : _a,
        directiveIndex = _b.directiveIndex,
        callOnAllChangesDone = _b.callOnAllChangesDone,
        callOnChange = _b.callOnChange,
        callOnCheck = _b.callOnCheck,
        callOnInit = _b.callOnInit,
        changeDetection = _b.changeDetection;
    this.directiveIndex = directiveIndex;
    this.callOnAllChangesDone = lang_1.normalizeBool(callOnAllChangesDone);
    this.callOnChange = lang_1.normalizeBool(callOnChange);
    this.callOnCheck = lang_1.normalizeBool(callOnCheck);
    this.callOnInit = lang_1.normalizeBool(callOnInit);
    this.changeDetection = changeDetection;
  }
  DirectiveRecord.prototype.isDefaultChangeDetection = function() {
    return constants_1.isDefaultChangeDetectionStrategy(this.changeDetection);
  };
  return DirectiveRecord;
})();
exports.DirectiveRecord = DirectiveRecord;

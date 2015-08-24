/* */ 
(function(process) {
  'use strict';
  var lang_1 = require("../../../facade/lang");
  var CompileControl = (function() {
    function CompileControl(_steps) {
      this._steps = _steps;
      this._currentStepIndex = 0;
      this._parent = null;
      this._results = null;
      this._additionalChildren = null;
    }
    CompileControl.prototype.internalProcess = function(results, startStepIndex, parent, current) {
      this._results = results;
      var previousStepIndex = this._currentStepIndex;
      var previousParent = this._parent;
      this._ignoreCurrentElement = false;
      for (var i = startStepIndex; i < this._steps.length && !this._ignoreCurrentElement; i++) {
        var step = this._steps[i];
        this._parent = parent;
        this._currentStepIndex = i;
        step.processElement(parent, current, this);
        parent = this._parent;
      }
      if (!this._ignoreCurrentElement) {
        results.push(current);
      }
      this._currentStepIndex = previousStepIndex;
      this._parent = previousParent;
      var localAdditionalChildren = this._additionalChildren;
      this._additionalChildren = null;
      return localAdditionalChildren;
    };
    CompileControl.prototype.addParent = function(newElement) {
      this.internalProcess(this._results, this._currentStepIndex + 1, this._parent, newElement);
      this._parent = newElement;
    };
    CompileControl.prototype.addChild = function(element) {
      if (lang_1.isBlank(this._additionalChildren)) {
        this._additionalChildren = [];
      }
      this._additionalChildren.push(element);
    };
    CompileControl.prototype.ignoreCurrentElement = function() {
      this._ignoreCurrentElement = true;
    };
    return CompileControl;
  })();
  exports.CompileControl = CompileControl;
})(require("process"));

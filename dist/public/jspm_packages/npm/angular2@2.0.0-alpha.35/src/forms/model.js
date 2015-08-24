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
var lang_1 = require("../facade/lang");
var async_1 = require("../facade/async");
var collection_1 = require("../facade/collection");
var validators_1 = require("./validators");
exports.VALID = "VALID";
exports.INVALID = "INVALID";
function isControl(c) {
  return c instanceof AbstractControl;
}
exports.isControl = isControl;
function _find(c, path) {
  if (lang_1.isBlank(path))
    return null;
  if (!(path instanceof collection_1.List)) {
    path = lang_1.StringWrapper.split(path, new RegExp("/"));
  }
  if (path instanceof collection_1.List && collection_1.ListWrapper.isEmpty(path))
    return null;
  return collection_1.ListWrapper.reduce(path, function(v, name) {
    if (v instanceof ControlGroup) {
      return lang_1.isPresent(v.controls[name]) ? v.controls[name] : null;
    } else if (v instanceof ControlArray) {
      var index = name;
      return lang_1.isPresent(v.at(index)) ? v.at(index) : null;
    } else {
      return null;
    }
  }, c);
}
var AbstractControl = (function() {
  function AbstractControl(validator) {
    this.validator = validator;
    this._pristine = true;
    this._touched = false;
  }
  Object.defineProperty(AbstractControl.prototype, "value", {
    get: function() {
      return this._value;
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(AbstractControl.prototype, "status", {
    get: function() {
      return this._status;
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(AbstractControl.prototype, "valid", {
    get: function() {
      return this._status === exports.VALID;
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(AbstractControl.prototype, "errors", {
    get: function() {
      return this._errors;
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(AbstractControl.prototype, "pristine", {
    get: function() {
      return this._pristine;
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(AbstractControl.prototype, "dirty", {
    get: function() {
      return !this.pristine;
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(AbstractControl.prototype, "touched", {
    get: function() {
      return this._touched;
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(AbstractControl.prototype, "untouched", {
    get: function() {
      return !this._touched;
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(AbstractControl.prototype, "valueChanges", {
    get: function() {
      return this._valueChanges;
    },
    enumerable: true,
    configurable: true
  });
  AbstractControl.prototype.markAsTouched = function() {
    this._touched = true;
  };
  AbstractControl.prototype.markAsDirty = function(_a) {
    var onlySelf = (_a === void 0 ? {} : _a).onlySelf;
    onlySelf = lang_1.isPresent(onlySelf) ? onlySelf : false;
    this._pristine = false;
    if (lang_1.isPresent(this._parent) && !onlySelf) {
      this._parent.markAsDirty({onlySelf: onlySelf});
    }
  };
  AbstractControl.prototype.setParent = function(parent) {
    this._parent = parent;
  };
  AbstractControl.prototype.updateValidity = function(_a) {
    var onlySelf = (_a === void 0 ? {} : _a).onlySelf;
    onlySelf = lang_1.isPresent(onlySelf) ? onlySelf : false;
    this._errors = this.validator(this);
    this._status = lang_1.isPresent(this._errors) ? exports.INVALID : exports.VALID;
    if (lang_1.isPresent(this._parent) && !onlySelf) {
      this._parent.updateValidity({onlySelf: onlySelf});
    }
  };
  AbstractControl.prototype.updateValueAndValidity = function(_a) {
    var _b = _a === void 0 ? {} : _a,
        onlySelf = _b.onlySelf,
        emitEvent = _b.emitEvent;
    onlySelf = lang_1.isPresent(onlySelf) ? onlySelf : false;
    emitEvent = lang_1.isPresent(emitEvent) ? emitEvent : true;
    this._updateValue();
    if (emitEvent) {
      async_1.ObservableWrapper.callNext(this._valueChanges, this._value);
    }
    this._errors = this.validator(this);
    this._status = lang_1.isPresent(this._errors) ? exports.INVALID : exports.VALID;
    if (lang_1.isPresent(this._parent) && !onlySelf) {
      this._parent.updateValueAndValidity({
        onlySelf: onlySelf,
        emitEvent: emitEvent
      });
    }
  };
  AbstractControl.prototype.find = function(path) {
    return _find(this, path);
  };
  AbstractControl.prototype.getError = function(errorCode, path) {
    if (path === void 0) {
      path = null;
    }
    var c = lang_1.isPresent(path) && !collection_1.ListWrapper.isEmpty(path) ? this.find(path) : this;
    if (lang_1.isPresent(c) && lang_1.isPresent(c._errors)) {
      return collection_1.StringMapWrapper.get(c._errors, errorCode);
    } else {
      return null;
    }
  };
  AbstractControl.prototype.hasError = function(errorCode, path) {
    if (path === void 0) {
      path = null;
    }
    return lang_1.isPresent(this.getError(errorCode, path));
  };
  AbstractControl.prototype._updateValue = function() {};
  return AbstractControl;
})();
exports.AbstractControl = AbstractControl;
var Control = (function(_super) {
  __extends(Control, _super);
  function Control(value, validator) {
    if (value === void 0) {
      value = null;
    }
    if (validator === void 0) {
      validator = validators_1.Validators.nullValidator;
    }
    _super.call(this, validator);
    this._value = value;
    this.updateValidity({onlySelf: true});
    this._valueChanges = new async_1.EventEmitter();
  }
  Control.prototype.updateValue = function(value, _a) {
    var _b = _a === void 0 ? {} : _a,
        onlySelf = _b.onlySelf,
        emitEvent = _b.emitEvent,
        emitModelToViewChange = _b.emitModelToViewChange;
    emitModelToViewChange = lang_1.isPresent(emitModelToViewChange) ? emitModelToViewChange : true;
    this._value = value;
    if (lang_1.isPresent(this._onChange) && emitModelToViewChange)
      this._onChange(this._value);
    this.updateValueAndValidity({
      onlySelf: onlySelf,
      emitEvent: emitEvent
    });
  };
  Control.prototype.registerOnChange = function(fn) {
    this._onChange = fn;
  };
  return Control;
})(AbstractControl);
exports.Control = Control;
var ControlGroup = (function(_super) {
  __extends(ControlGroup, _super);
  function ControlGroup(controls, optionals, validator) {
    if (optionals === void 0) {
      optionals = null;
    }
    if (validator === void 0) {
      validator = validators_1.Validators.group;
    }
    _super.call(this, validator);
    this.controls = controls;
    this._optionals = lang_1.isPresent(optionals) ? optionals : {};
    this._valueChanges = new async_1.EventEmitter();
    this._setParentForControls();
    this._value = this._reduceValue();
    this.updateValidity({onlySelf: true});
  }
  ControlGroup.prototype.addControl = function(name, c) {
    this.controls[name] = c;
    c.setParent(this);
  };
  ControlGroup.prototype.removeControl = function(name) {
    collection_1.StringMapWrapper.delete(this.controls, name);
  };
  ControlGroup.prototype.include = function(controlName) {
    collection_1.StringMapWrapper.set(this._optionals, controlName, true);
    this.updateValueAndValidity();
  };
  ControlGroup.prototype.exclude = function(controlName) {
    collection_1.StringMapWrapper.set(this._optionals, controlName, false);
    this.updateValueAndValidity();
  };
  ControlGroup.prototype.contains = function(controlName) {
    var c = collection_1.StringMapWrapper.contains(this.controls, controlName);
    return c && this._included(controlName);
  };
  ControlGroup.prototype._setParentForControls = function() {
    var _this = this;
    collection_1.StringMapWrapper.forEach(this.controls, function(control, name) {
      control.setParent(_this);
    });
  };
  ControlGroup.prototype._updateValue = function() {
    this._value = this._reduceValue();
  };
  ControlGroup.prototype._reduceValue = function() {
    return this._reduceChildren({}, function(acc, control, name) {
      acc[name] = control.value;
      return acc;
    });
  };
  ControlGroup.prototype._reduceChildren = function(initValue, fn) {
    var _this = this;
    var res = initValue;
    collection_1.StringMapWrapper.forEach(this.controls, function(control, name) {
      if (_this._included(name)) {
        res = fn(res, control, name);
      }
    });
    return res;
  };
  ControlGroup.prototype._included = function(controlName) {
    var isOptional = collection_1.StringMapWrapper.contains(this._optionals, controlName);
    return !isOptional || collection_1.StringMapWrapper.get(this._optionals, controlName);
  };
  return ControlGroup;
})(AbstractControl);
exports.ControlGroup = ControlGroup;
var ControlArray = (function(_super) {
  __extends(ControlArray, _super);
  function ControlArray(controls, validator) {
    if (validator === void 0) {
      validator = validators_1.Validators.array;
    }
    _super.call(this, validator);
    this.controls = controls;
    this._valueChanges = new async_1.EventEmitter();
    this._setParentForControls();
    this._updateValue();
    this.updateValidity({onlySelf: true});
  }
  ControlArray.prototype.at = function(index) {
    return this.controls[index];
  };
  ControlArray.prototype.push = function(control) {
    this.controls.push(control);
    control.setParent(this);
    this.updateValueAndValidity();
  };
  ControlArray.prototype.insert = function(index, control) {
    collection_1.ListWrapper.insert(this.controls, index, control);
    control.setParent(this);
    this.updateValueAndValidity();
  };
  ControlArray.prototype.removeAt = function(index) {
    collection_1.ListWrapper.removeAt(this.controls, index);
    this.updateValueAndValidity();
  };
  Object.defineProperty(ControlArray.prototype, "length", {
    get: function() {
      return this.controls.length;
    },
    enumerable: true,
    configurable: true
  });
  ControlArray.prototype._updateValue = function() {
    this._value = collection_1.ListWrapper.map(this.controls, function(c) {
      return c.value;
    });
  };
  ControlArray.prototype._setParentForControls = function() {
    var _this = this;
    collection_1.ListWrapper.forEach(this.controls, function(control) {
      control.setParent(_this);
    });
  };
  return ControlArray;
})(AbstractControl);
exports.ControlArray = ControlArray;

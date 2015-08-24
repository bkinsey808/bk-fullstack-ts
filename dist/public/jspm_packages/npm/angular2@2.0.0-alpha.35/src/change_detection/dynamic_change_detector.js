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
var collection_1 = require("../facade/collection");
var abstract_change_detector_1 = require("./abstract_change_detector");
var change_detection_util_1 = require("./change_detection_util");
var proto_record_1 = require("./proto_record");
var DynamicChangeDetector = (function(_super) {
  __extends(DynamicChangeDetector, _super);
  function DynamicChangeDetector(id, changeDetectionStrategy, dispatcher, protos, eventBindings, directiveRecords) {
    _super.call(this, id, dispatcher, protos, directiveRecords, change_detection_util_1.ChangeDetectionUtil.changeDetectionMode(changeDetectionStrategy));
    this.eventBindings = eventBindings;
    this.directives = null;
    var len = protos.length + 1;
    this.values = collection_1.ListWrapper.createFixedSize(len);
    this.localPipes = collection_1.ListWrapper.createFixedSize(len);
    this.prevContexts = collection_1.ListWrapper.createFixedSize(len);
    this.changes = collection_1.ListWrapper.createFixedSize(len);
    this.dehydrateDirectives(false);
  }
  DynamicChangeDetector.prototype.handleEventInternal = function(eventName, elIndex, locals) {
    var _this = this;
    var preventDefault = false;
    this._matchingEventBindings(eventName, elIndex).forEach(function(rec) {
      var res = _this._processEventBinding(rec, locals);
      if (res === false) {
        preventDefault = true;
      }
    });
    return preventDefault;
  };
  DynamicChangeDetector.prototype._processEventBinding = function(eb, locals) {
    var values = collection_1.ListWrapper.createFixedSize(eb.records.length);
    values[0] = this.values[0];
    for (var i = 0; i < eb.records.length; ++i) {
      var proto = eb.records[i];
      var res = this._calculateCurrValue(proto, values, locals);
      if (proto.lastInBinding) {
        this._markPathAsCheckOnce(proto);
        return res;
      } else {
        this._writeSelf(proto, res, values);
      }
    }
    throw new lang_1.BaseException("Cannot be reached");
  };
  DynamicChangeDetector.prototype._markPathAsCheckOnce = function(proto) {
    if (!proto.bindingRecord.isDefaultChangeDetection()) {
      var dir = proto.bindingRecord.directiveRecord;
      this._getDetectorFor(dir.directiveIndex).markPathToRootAsCheckOnce();
    }
  };
  DynamicChangeDetector.prototype._matchingEventBindings = function(eventName, elIndex) {
    return collection_1.ListWrapper.filter(this.eventBindings, function(eb) {
      return eb.eventName == eventName && eb.elIndex === elIndex;
    });
  };
  DynamicChangeDetector.prototype.hydrateDirectives = function(directives) {
    this.values[0] = this.context;
    this.directives = directives;
  };
  DynamicChangeDetector.prototype.dehydrateDirectives = function(destroyPipes) {
    if (destroyPipes) {
      this._destroyPipes();
    }
    this.values[0] = null;
    this.directives = null;
    collection_1.ListWrapper.fill(this.values, change_detection_util_1.ChangeDetectionUtil.uninitialized, 1);
    collection_1.ListWrapper.fill(this.changes, false);
    collection_1.ListWrapper.fill(this.localPipes, null);
    collection_1.ListWrapper.fill(this.prevContexts, change_detection_util_1.ChangeDetectionUtil.uninitialized);
  };
  DynamicChangeDetector.prototype._destroyPipes = function() {
    for (var i = 0; i < this.localPipes.length; ++i) {
      if (lang_1.isPresent(this.localPipes[i])) {
        change_detection_util_1.ChangeDetectionUtil.callPipeOnDestroy(this.localPipes[i]);
      }
    }
  };
  DynamicChangeDetector.prototype.checkNoChanges = function() {
    this.runDetectChanges(true);
  };
  DynamicChangeDetector.prototype.detectChangesInRecordsInternal = function(throwOnChange) {
    var protos = this.protos;
    var changes = null;
    var isChanged = false;
    for (var i = 0; i < protos.length; ++i) {
      var proto = protos[i];
      var bindingRecord = proto.bindingRecord;
      var directiveRecord = bindingRecord.directiveRecord;
      if (this._firstInBinding(proto)) {
        this.firstProtoInCurrentBinding = proto.selfIndex;
      }
      if (proto.isLifeCycleRecord()) {
        if (proto.name === "onCheck" && !throwOnChange) {
          this._getDirectiveFor(directiveRecord.directiveIndex).onCheck();
        } else if (proto.name === "onInit" && !throwOnChange && !this.alreadyChecked) {
          this._getDirectiveFor(directiveRecord.directiveIndex).onInit();
        } else if (proto.name === "onChange" && lang_1.isPresent(changes) && !throwOnChange) {
          this._getDirectiveFor(directiveRecord.directiveIndex).onChange(changes);
        }
      } else {
        var change = this._check(proto, throwOnChange, this.values, this.locals);
        if (lang_1.isPresent(change)) {
          this._updateDirectiveOrElement(change, bindingRecord);
          isChanged = true;
          changes = this._addChange(bindingRecord, change, changes);
        }
      }
      if (proto.lastInDirective) {
        changes = null;
        if (isChanged && !bindingRecord.isDefaultChangeDetection()) {
          this._getDetectorFor(directiveRecord.directiveIndex).markAsCheckOnce();
        }
        isChanged = false;
      }
    }
    this.alreadyChecked = true;
  };
  DynamicChangeDetector.prototype._firstInBinding = function(r) {
    var prev = change_detection_util_1.ChangeDetectionUtil.protoByIndex(this.protos, r.selfIndex - 1);
    return lang_1.isBlank(prev) || prev.bindingRecord !== r.bindingRecord;
  };
  DynamicChangeDetector.prototype.callOnAllChangesDone = function() {
    _super.prototype.callOnAllChangesDone.call(this);
    var dirs = this.directiveRecords;
    for (var i = dirs.length - 1; i >= 0; --i) {
      var dir = dirs[i];
      if (dir.callOnAllChangesDone) {
        this._getDirectiveFor(dir.directiveIndex).onAllChangesDone();
      }
    }
  };
  DynamicChangeDetector.prototype._updateDirectiveOrElement = function(change, bindingRecord) {
    if (lang_1.isBlank(bindingRecord.directiveRecord)) {
      this.dispatcher.notifyOnBinding(bindingRecord, change.currentValue);
    } else {
      var directiveIndex = bindingRecord.directiveRecord.directiveIndex;
      bindingRecord.setter(this._getDirectiveFor(directiveIndex), change.currentValue);
    }
  };
  DynamicChangeDetector.prototype._addChange = function(bindingRecord, change, changes) {
    if (bindingRecord.callOnChange()) {
      return _super.prototype.addChange.call(this, changes, change.previousValue, change.currentValue);
    } else {
      return changes;
    }
  };
  DynamicChangeDetector.prototype._getDirectiveFor = function(directiveIndex) {
    return this.directives.getDirectiveFor(directiveIndex);
  };
  DynamicChangeDetector.prototype._getDetectorFor = function(directiveIndex) {
    return this.directives.getDetectorFor(directiveIndex);
  };
  DynamicChangeDetector.prototype._check = function(proto, throwOnChange, values, locals) {
    if (proto.isPipeRecord()) {
      return this._pipeCheck(proto, throwOnChange, values);
    } else {
      return this._referenceCheck(proto, throwOnChange, values, locals);
    }
  };
  DynamicChangeDetector.prototype._referenceCheck = function(proto, throwOnChange, values, locals) {
    if (this._pureFuncAndArgsDidNotChange(proto)) {
      this._setChanged(proto, false);
      return null;
    }
    var currValue = this.observe(this._calculateCurrValue(proto, values, locals), proto.selfIndex);
    if (proto.shouldBeChecked()) {
      var prevValue = this._readSelf(proto, values);
      if (!isSame(prevValue, currValue)) {
        if (proto.lastInBinding) {
          var change = change_detection_util_1.ChangeDetectionUtil.simpleChange(prevValue, currValue);
          if (throwOnChange)
            this.throwOnChangeError(prevValue, currValue);
          this._writeSelf(proto, currValue, values);
          this._setChanged(proto, true);
          return change;
        } else {
          this._writeSelf(proto, currValue, values);
          this._setChanged(proto, true);
          return null;
        }
      } else {
        this._setChanged(proto, false);
        return null;
      }
    } else {
      this._writeSelf(proto, currValue, values);
      this._setChanged(proto, true);
      return null;
    }
  };
  DynamicChangeDetector.prototype._calculateCurrValue = function(proto, values, locals) {
    switch (proto.mode) {
      case proto_record_1.RecordType.SELF:
        return this._readContext(proto, values);
      case proto_record_1.RecordType.CONST:
        return proto.funcOrValue;
      case proto_record_1.RecordType.PROPERTY_READ:
        var context = this._readContext(proto, values);
        return proto.funcOrValue(context);
      case proto_record_1.RecordType.SAFE_PROPERTY:
        var context = this._readContext(proto, values);
        return lang_1.isBlank(context) ? null : proto.funcOrValue(context);
      case proto_record_1.RecordType.PROPERTY_WRITE:
        var context = this._readContext(proto, values);
        var value = this._readArgs(proto, values)[0];
        proto.funcOrValue(context, value);
        return value;
      case proto_record_1.RecordType.KEYED_WRITE:
        var context = this._readContext(proto, values);
        var key = this._readArgs(proto, values)[0];
        var value = this._readArgs(proto, values)[1];
        context[key] = value;
        return value;
      case proto_record_1.RecordType.LOCAL:
        return locals.get(proto.name);
      case proto_record_1.RecordType.INVOKE_METHOD:
        var context = this._readContext(proto, values);
        var args = this._readArgs(proto, values);
        return proto.funcOrValue(context, args);
      case proto_record_1.RecordType.SAFE_INVOKE_METHOD:
        var context = this._readContext(proto, values);
        if (lang_1.isBlank(context)) {
          return null;
        }
        var args = this._readArgs(proto, values);
        return proto.funcOrValue(context, args);
      case proto_record_1.RecordType.KEYED_READ:
        var arg = this._readArgs(proto, values)[0];
        return this._readContext(proto, values)[arg];
      case proto_record_1.RecordType.CHAIN:
        var args = this._readArgs(proto, values);
        return args[args.length - 1];
      case proto_record_1.RecordType.INVOKE_CLOSURE:
        return lang_1.FunctionWrapper.apply(this._readContext(proto, values), this._readArgs(proto, values));
      case proto_record_1.RecordType.INTERPOLATE:
      case proto_record_1.RecordType.PRIMITIVE_OP:
      case proto_record_1.RecordType.COLLECTION_LITERAL:
        return lang_1.FunctionWrapper.apply(proto.funcOrValue, this._readArgs(proto, values));
      default:
        throw new lang_1.BaseException("Unknown operation " + proto.mode);
    }
  };
  DynamicChangeDetector.prototype._pipeCheck = function(proto, throwOnChange, values) {
    var context = this._readContext(proto, values);
    var args = this._readArgs(proto, values);
    var pipe = this._pipeFor(proto, context);
    var currValue = pipe.transform(context, args);
    if (proto.shouldBeChecked()) {
      var prevValue = this._readSelf(proto, values);
      if (!isSame(prevValue, currValue)) {
        currValue = change_detection_util_1.ChangeDetectionUtil.unwrapValue(currValue);
        if (proto.lastInBinding) {
          var change = change_detection_util_1.ChangeDetectionUtil.simpleChange(prevValue, currValue);
          if (throwOnChange)
            this.throwOnChangeError(prevValue, currValue);
          this._writeSelf(proto, currValue, values);
          this._setChanged(proto, true);
          return change;
        } else {
          this._writeSelf(proto, currValue, values);
          this._setChanged(proto, true);
          return null;
        }
      } else {
        this._setChanged(proto, false);
        return null;
      }
    } else {
      this._writeSelf(proto, currValue, values);
      this._setChanged(proto, true);
      return null;
    }
  };
  DynamicChangeDetector.prototype._pipeFor = function(proto, context) {
    var storedPipe = this._readPipe(proto);
    if (lang_1.isPresent(storedPipe))
      return storedPipe;
    var pipe = this.pipes.get(proto.name);
    this._writePipe(proto, pipe);
    return pipe;
  };
  DynamicChangeDetector.prototype._readContext = function(proto, values) {
    if (proto.contextIndex == -1) {
      return this._getDirectiveFor(proto.directiveIndex);
    } else {
      return values[proto.contextIndex];
    }
    return values[proto.contextIndex];
  };
  DynamicChangeDetector.prototype._readSelf = function(proto, values) {
    return values[proto.selfIndex];
  };
  DynamicChangeDetector.prototype._writeSelf = function(proto, value, values) {
    values[proto.selfIndex] = value;
  };
  DynamicChangeDetector.prototype._readPipe = function(proto) {
    return this.localPipes[proto.selfIndex];
  };
  DynamicChangeDetector.prototype._writePipe = function(proto, value) {
    this.localPipes[proto.selfIndex] = value;
  };
  DynamicChangeDetector.prototype._setChanged = function(proto, value) {
    if (proto.argumentToPureFunction)
      this.changes[proto.selfIndex] = value;
  };
  DynamicChangeDetector.prototype._pureFuncAndArgsDidNotChange = function(proto) {
    return proto.isPureFunction() && !this._argsChanged(proto);
  };
  DynamicChangeDetector.prototype._argsChanged = function(proto) {
    var args = proto.args;
    for (var i = 0; i < args.length; ++i) {
      if (this.changes[args[i]]) {
        return true;
      }
    }
    return false;
  };
  DynamicChangeDetector.prototype._readArgs = function(proto, values) {
    var res = collection_1.ListWrapper.createFixedSize(proto.args.length);
    var args = proto.args;
    for (var i = 0; i < args.length; ++i) {
      res[i] = values[args[i]];
    }
    return res;
  };
  return DynamicChangeDetector;
})(abstract_change_detector_1.AbstractChangeDetector);
exports.DynamicChangeDetector = DynamicChangeDetector;
function isSame(a, b) {
  if (a === b)
    return true;
  if (a instanceof String && b instanceof String && a == b)
    return true;
  if ((a !== a) && (b !== b))
    return true;
  return false;
}

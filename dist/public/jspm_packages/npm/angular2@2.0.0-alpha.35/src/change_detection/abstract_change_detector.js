/* */ 
'use strict';
var lang_1 = require("../facade/lang");
var collection_1 = require("../facade/collection");
var change_detection_util_1 = require("./change_detection_util");
var change_detector_ref_1 = require("./change_detector_ref");
var exceptions_1 = require("./exceptions");
var constants_1 = require("./constants");
var profile_1 = require("../profile/profile");
var observable_facade_1 = require("./observable_facade");
var _scope_check = profile_1.wtfCreateScope("ChangeDetector#check(ascii id, bool throwOnChange)");
var _Context = (function() {
  function _Context(element, componentElement, instance, context, locals, injector, expression) {
    this.element = element;
    this.componentElement = componentElement;
    this.instance = instance;
    this.context = context;
    this.locals = locals;
    this.injector = injector;
    this.expression = expression;
  }
  return _Context;
})();
var AbstractChangeDetector = (function() {
  function AbstractChangeDetector(id, dispatcher, protos, directiveRecords, modeOnHydrate) {
    this.id = id;
    this.modeOnHydrate = modeOnHydrate;
    this.lightDomChildren = [];
    this.shadowDomChildren = [];
    this.alreadyChecked = false;
    this.locals = null;
    this.mode = null;
    this.pipes = null;
    this.ref = new change_detector_ref_1.ChangeDetectorRef(this);
    this.directiveRecords = directiveRecords;
    this.dispatcher = dispatcher;
    this.protos = protos;
  }
  AbstractChangeDetector.prototype.addChild = function(cd) {
    this.lightDomChildren.push(cd);
    cd.parent = this;
  };
  AbstractChangeDetector.prototype.removeChild = function(cd) {
    collection_1.ListWrapper.remove(this.lightDomChildren, cd);
  };
  AbstractChangeDetector.prototype.addShadowDomChild = function(cd) {
    this.shadowDomChildren.push(cd);
    cd.parent = this;
  };
  AbstractChangeDetector.prototype.removeShadowDomChild = function(cd) {
    collection_1.ListWrapper.remove(this.shadowDomChildren, cd);
  };
  AbstractChangeDetector.prototype.remove = function() {
    this.parent.removeChild(this);
  };
  AbstractChangeDetector.prototype.handleEvent = function(eventName, elIndex, locals) {
    var res = this.handleEventInternal(eventName, elIndex, locals);
    this.markPathToRootAsCheckOnce();
    return res;
  };
  AbstractChangeDetector.prototype.handleEventInternal = function(eventName, elIndex, locals) {
    return false;
  };
  AbstractChangeDetector.prototype.detectChanges = function() {
    this.runDetectChanges(false);
  };
  AbstractChangeDetector.prototype.checkNoChanges = function() {
    throw new lang_1.BaseException("Not implemented");
  };
  AbstractChangeDetector.prototype.runDetectChanges = function(throwOnChange) {
    if (lang_1.StringWrapper.equals(this.mode, constants_1.DETACHED) || lang_1.StringWrapper.equals(this.mode, constants_1.CHECKED))
      return;
    var s = _scope_check(this.id, throwOnChange);
    this.detectChangesInRecords(throwOnChange);
    this._detectChangesInLightDomChildren(throwOnChange);
    if (throwOnChange === false)
      this.callOnAllChangesDone();
    this._detectChangesInShadowDomChildren(throwOnChange);
    if (lang_1.StringWrapper.equals(this.mode, constants_1.CHECK_ONCE))
      this.mode = constants_1.CHECKED;
    profile_1.wtfLeave(s);
  };
  AbstractChangeDetector.prototype.detectChangesInRecords = function(throwOnChange) {
    if (!this.hydrated()) {
      this.throwDehydratedError();
    }
    try {
      this.detectChangesInRecordsInternal(throwOnChange);
    } catch (e) {
      this._throwError(e, e.stack);
    }
  };
  AbstractChangeDetector.prototype.detectChangesInRecordsInternal = function(throwOnChange) {};
  AbstractChangeDetector.prototype.hydrate = function(context, locals, directives, pipes) {
    this.mode = this.modeOnHydrate;
    this.context = context;
    this.locals = locals;
    this.pipes = pipes;
    this.hydrateDirectives(directives);
    this.alreadyChecked = false;
  };
  AbstractChangeDetector.prototype.hydrateDirectives = function(directives) {};
  AbstractChangeDetector.prototype.dehydrate = function() {
    this.dehydrateDirectives(true);
    this.unsubsribeFromObservables();
    this.context = null;
    this.locals = null;
    this.pipes = null;
  };
  AbstractChangeDetector.prototype.dehydrateDirectives = function(destroyPipes) {};
  AbstractChangeDetector.prototype.hydrated = function() {
    return this.context !== null;
  };
  AbstractChangeDetector.prototype.callOnAllChangesDone = function() {
    this.dispatcher.notifyOnAllChangesDone();
  };
  AbstractChangeDetector.prototype._detectChangesInLightDomChildren = function(throwOnChange) {
    var c = this.lightDomChildren;
    for (var i = 0; i < c.length; ++i) {
      c[i].runDetectChanges(throwOnChange);
    }
  };
  AbstractChangeDetector.prototype._detectChangesInShadowDomChildren = function(throwOnChange) {
    var c = this.shadowDomChildren;
    for (var i = 0; i < c.length; ++i) {
      c[i].runDetectChanges(throwOnChange);
    }
  };
  AbstractChangeDetector.prototype.markAsCheckOnce = function() {
    this.mode = constants_1.CHECK_ONCE;
  };
  AbstractChangeDetector.prototype.markPathToRootAsCheckOnce = function() {
    var c = this;
    while (lang_1.isPresent(c) && !lang_1.StringWrapper.equals(c.mode, constants_1.DETACHED)) {
      if (lang_1.StringWrapper.equals(c.mode, constants_1.CHECKED))
        c.mode = constants_1.CHECK_ONCE;
      c = c.parent;
    }
  };
  AbstractChangeDetector.prototype.unsubsribeFromObservables = function() {
    if (lang_1.isPresent(this.subscriptions)) {
      for (var i = 0; i < this.subscriptions.length; ++i) {
        var s = this.subscriptions[i];
        if (lang_1.isPresent(this.subscriptions[i])) {
          s.cancel();
          this.subscriptions[i] = null;
        }
      }
    }
  };
  AbstractChangeDetector.prototype.observe = function(value, index) {
    var _this = this;
    if (observable_facade_1.isObservable(value)) {
      if (lang_1.isBlank(this.subscriptions)) {
        this.subscriptions = collection_1.ListWrapper.createFixedSize(this.protos.length + 1);
        this.streams = collection_1.ListWrapper.createFixedSize(this.protos.length + 1);
      }
      if (lang_1.isBlank(this.subscriptions[index])) {
        this.streams[index] = value.changes;
        this.subscriptions[index] = value.changes.listen(function(_) {
          return _this.ref.requestCheck();
        });
      } else if (this.streams[index] !== value.changes) {
        this.subscriptions[index].cancel();
        this.streams[index] = value.changes;
        this.subscriptions[index] = value.changes.listen(function(_) {
          return _this.ref.requestCheck();
        });
      }
    }
    return value;
  };
  AbstractChangeDetector.prototype.notifyDispatcher = function(value) {
    this.dispatcher.notifyOnBinding(this._currentBinding(), value);
  };
  AbstractChangeDetector.prototype.addChange = function(changes, oldValue, newValue) {
    if (lang_1.isBlank(changes)) {
      changes = {};
    }
    changes[this._currentBinding().propertyName] = change_detection_util_1.ChangeDetectionUtil.simpleChange(oldValue, newValue);
    return changes;
  };
  AbstractChangeDetector.prototype._throwError = function(exception, stack) {
    var proto = this._currentBindingProto();
    var c = this.dispatcher.getDebugContext(proto.bindingRecord.elementIndex, proto.directiveIndex);
    var context = lang_1.isPresent(c) ? new _Context(c.element, c.componentElement, c.directive, c.context, c.locals, c.injector, proto.expressionAsString) : null;
    throw new exceptions_1.ChangeDetectionError(proto, exception, stack, context);
  };
  AbstractChangeDetector.prototype.throwOnChangeError = function(oldValue, newValue) {
    var change = change_detection_util_1.ChangeDetectionUtil.simpleChange(oldValue, newValue);
    throw new exceptions_1.ExpressionChangedAfterItHasBeenCheckedException(this._currentBindingProto(), change, null);
  };
  AbstractChangeDetector.prototype.throwDehydratedError = function() {
    throw new exceptions_1.DehydratedException();
  };
  AbstractChangeDetector.prototype._currentBinding = function() {
    return this._currentBindingProto().bindingRecord;
  };
  AbstractChangeDetector.prototype._currentBindingProto = function() {
    return change_detection_util_1.ChangeDetectionUtil.protoByIndex(this.protos, this.firstProtoInCurrentBinding);
  };
  return AbstractChangeDetector;
})();
exports.AbstractChangeDetector = AbstractChangeDetector;

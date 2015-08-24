import {
  isPresent,
  isBlank,
  BaseException,
  FunctionWrapper,
  StringWrapper
} from 'angular2/src/facade/lang';
import {List, ListWrapper, MapWrapper, StringMapWrapper} from 'angular2/src/facade/collection';

import {AbstractChangeDetector} from './abstract_change_detector';
import {EventBinding} from './event_binding';
import {BindingRecord} from './binding_record';
import {Locals} from './parser/locals';
import {ChangeDetectionUtil, SimpleChange} from './change_detection_util';


import {ProtoRecord, RecordType} from './proto_record';

export class DynamicChangeDetector extends AbstractChangeDetector<any> {
  values: List<any>;
  changes: List<any>;
  localPipes: List<any>;
  prevContexts: List<any>;
  directives: any = null;

  constructor(id: string, changeDetectionStrategy: string, dispatcher: any,
              protos: List<ProtoRecord>, public eventBindings: EventBinding[],
              directiveRecords: List<any>) {
    super(id, dispatcher, protos, directiveRecords,
          ChangeDetectionUtil.changeDetectionMode(changeDetectionStrategy));
    var len = protos.length + 1;
    this.values = ListWrapper.createFixedSize(len);
    this.localPipes = ListWrapper.createFixedSize(len);
    this.prevContexts = ListWrapper.createFixedSize(len);
    this.changes = ListWrapper.createFixedSize(len);

    this.dehydrateDirectives(false);
  }

  handleEventInternal(eventName: string, elIndex: number, locals: Locals): boolean {
    var preventDefault = false;

    this._matchingEventBindings(eventName, elIndex)
        .forEach(rec => {
          var res = this._processEventBinding(rec, locals);
          if (res === false) {
            preventDefault = true;
          }
        });

    return preventDefault;
  }

  _processEventBinding(eb: EventBinding, locals: Locals): any {
    var values = ListWrapper.createFixedSize(eb.records.length);
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

    throw new BaseException("Cannot be reached");
  }

  _markPathAsCheckOnce(proto: ProtoRecord): void {
    if (!proto.bindingRecord.isDefaultChangeDetection()) {
      var dir = proto.bindingRecord.directiveRecord;
      this._getDetectorFor(dir.directiveIndex).markPathToRootAsCheckOnce();
    }
  }

  _matchingEventBindings(eventName: string, elIndex: number): EventBinding[] {
    return ListWrapper.filter(this.eventBindings,
                              eb => eb.eventName == eventName && eb.elIndex === elIndex);
  }

  hydrateDirectives(directives: any): void {
    this.values[0] = this.context;
    this.directives = directives;
  }

  dehydrateDirectives(destroyPipes: boolean) {
    if (destroyPipes) {
      this._destroyPipes();
    }
    this.values[0] = null;
    this.directives = null;
    ListWrapper.fill(this.values, ChangeDetectionUtil.uninitialized, 1);
    ListWrapper.fill(this.changes, false);
    ListWrapper.fill(this.localPipes, null);
    ListWrapper.fill(this.prevContexts, ChangeDetectionUtil.uninitialized);
  }

  _destroyPipes() {
    for (var i = 0; i < this.localPipes.length; ++i) {
      if (isPresent(this.localPipes[i])) {
        ChangeDetectionUtil.callPipeOnDestroy(this.localPipes[i]);
      }
    }
  }

  checkNoChanges(): void { this.runDetectChanges(true); }

  detectChangesInRecordsInternal(throwOnChange: boolean) {
    var protos = this.protos;

    var changes = null;
    var isChanged = false;
    for (var i = 0; i < protos.length; ++i) {
      var proto: ProtoRecord = protos[i];
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
        } else if (proto.name === "onChange" && isPresent(changes) && !throwOnChange) {
          this._getDirectiveFor(directiveRecord.directiveIndex).onChange(changes);
        }

      } else {
        var change = this._check(proto, throwOnChange, this.values, this.locals);
        if (isPresent(change)) {
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
  }

  _firstInBinding(r: ProtoRecord): boolean {
    var prev = ChangeDetectionUtil.protoByIndex(this.protos, r.selfIndex - 1);
    return isBlank(prev) || prev.bindingRecord !== r.bindingRecord;
  }

  callOnAllChangesDone() {
    super.callOnAllChangesDone();
    var dirs = this.directiveRecords;
    for (var i = dirs.length - 1; i >= 0; --i) {
      var dir = dirs[i];
      if (dir.callOnAllChangesDone) {
        this._getDirectiveFor(dir.directiveIndex).onAllChangesDone();
      }
    }
  }

  _updateDirectiveOrElement(change, bindingRecord) {
    if (isBlank(bindingRecord.directiveRecord)) {
      this.dispatcher.notifyOnBinding(bindingRecord, change.currentValue);
    } else {
      var directiveIndex = bindingRecord.directiveRecord.directiveIndex;
      bindingRecord.setter(this._getDirectiveFor(directiveIndex), change.currentValue);
    }
  }

  _addChange(bindingRecord: BindingRecord, change, changes) {
    if (bindingRecord.callOnChange()) {
      return super.addChange(changes, change.previousValue, change.currentValue);
    } else {
      return changes;
    }
  }

  _getDirectiveFor(directiveIndex) { return this.directives.getDirectiveFor(directiveIndex); }

  _getDetectorFor(directiveIndex) { return this.directives.getDetectorFor(directiveIndex); }

  _check(proto: ProtoRecord, throwOnChange: boolean, values: any[], locals: Locals): SimpleChange {
    if (proto.isPipeRecord()) {
      return this._pipeCheck(proto, throwOnChange, values);
    } else {
      return this._referenceCheck(proto, throwOnChange, values, locals);
    }
  }

  _referenceCheck(proto: ProtoRecord, throwOnChange: boolean, values: any[], locals: Locals) {
    if (this._pureFuncAndArgsDidNotChange(proto)) {
      this._setChanged(proto, false);
      return null;
    }

    var currValue = this.observe(this._calculateCurrValue(proto, values, locals), proto.selfIndex);
    if (proto.shouldBeChecked()) {
      var prevValue = this._readSelf(proto, values);
      if (!isSame(prevValue, currValue)) {
        if (proto.lastInBinding) {
          var change = ChangeDetectionUtil.simpleChange(prevValue, currValue);
          if (throwOnChange) this.throwOnChangeError(prevValue, currValue);

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
  }

  _calculateCurrValue(proto: ProtoRecord, values: any[], locals: Locals) {
    switch (proto.mode) {
      case RecordType.SELF:
        return this._readContext(proto, values);

      case RecordType.CONST:
        return proto.funcOrValue;

      case RecordType.PROPERTY_READ:
        var context = this._readContext(proto, values);
        return proto.funcOrValue(context);

      case RecordType.SAFE_PROPERTY:
        var context = this._readContext(proto, values);
        return isBlank(context) ? null : proto.funcOrValue(context);

      case RecordType.PROPERTY_WRITE:
        var context = this._readContext(proto, values);
        var value = this._readArgs(proto, values)[0];
        proto.funcOrValue(context, value);
        return value;

      case RecordType.KEYED_WRITE:
        var context = this._readContext(proto, values);
        var key = this._readArgs(proto, values)[0];
        var value = this._readArgs(proto, values)[1];
        context[key] = value;
        return value;

      case RecordType.LOCAL:
        return locals.get(proto.name);

      case RecordType.INVOKE_METHOD:
        var context = this._readContext(proto, values);
        var args = this._readArgs(proto, values);
        return proto.funcOrValue(context, args);

      case RecordType.SAFE_INVOKE_METHOD:
        var context = this._readContext(proto, values);
        if (isBlank(context)) {
          return null;
        }
        var args = this._readArgs(proto, values);
        return proto.funcOrValue(context, args);

      case RecordType.KEYED_READ:
        var arg = this._readArgs(proto, values)[0];
        return this._readContext(proto, values)[arg];

      case RecordType.CHAIN:
        var args = this._readArgs(proto, values);
        return args[args.length - 1];

      case RecordType.INVOKE_CLOSURE:
        return FunctionWrapper.apply(this._readContext(proto, values),
                                     this._readArgs(proto, values));

      case RecordType.INTERPOLATE:
      case RecordType.PRIMITIVE_OP:
      case RecordType.COLLECTION_LITERAL:
        return FunctionWrapper.apply(proto.funcOrValue, this._readArgs(proto, values));

      default:
        throw new BaseException(`Unknown operation ${proto.mode}`);
    }
  }

  _pipeCheck(proto: ProtoRecord, throwOnChange: boolean, values: any[]) {
    var context = this._readContext(proto, values);
    var args = this._readArgs(proto, values);

    var pipe = this._pipeFor(proto, context);
    var currValue = pipe.transform(context, args);

    if (proto.shouldBeChecked()) {
      var prevValue = this._readSelf(proto, values);
      if (!isSame(prevValue, currValue)) {
        currValue = ChangeDetectionUtil.unwrapValue(currValue);

        if (proto.lastInBinding) {
          var change = ChangeDetectionUtil.simpleChange(prevValue, currValue);
          if (throwOnChange) this.throwOnChangeError(prevValue, currValue);

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
  }

  _pipeFor(proto: ProtoRecord, context) {
    var storedPipe = this._readPipe(proto);
    if (isPresent(storedPipe)) return storedPipe;

    var pipe = this.pipes.get(proto.name);
    this._writePipe(proto, pipe);
    return pipe;
  }

  _readContext(proto: ProtoRecord, values: any[]) {
    if (proto.contextIndex == -1) {
      return this._getDirectiveFor(proto.directiveIndex);
    } else {
      return values[proto.contextIndex];
    }

    return values[proto.contextIndex];
  }

  _readSelf(proto: ProtoRecord, values: any[]) { return values[proto.selfIndex]; }

  _writeSelf(proto: ProtoRecord, value, values: any[]) { values[proto.selfIndex] = value; }

  _readPipe(proto: ProtoRecord) { return this.localPipes[proto.selfIndex]; }

  _writePipe(proto: ProtoRecord, value) { this.localPipes[proto.selfIndex] = value; }

  _setChanged(proto: ProtoRecord, value: boolean) {
    if (proto.argumentToPureFunction) this.changes[proto.selfIndex] = value;
  }

  _pureFuncAndArgsDidNotChange(proto: ProtoRecord): boolean {
    return proto.isPureFunction() && !this._argsChanged(proto);
  }

  _argsChanged(proto: ProtoRecord): boolean {
    var args = proto.args;
    for (var i = 0; i < args.length; ++i) {
      if (this.changes[args[i]]) {
        return true;
      }
    }
    return false;
  }

  _readArgs(proto: ProtoRecord, values: any[]) {
    var res = ListWrapper.createFixedSize(proto.args.length);
    var args = proto.args;
    for (var i = 0; i < args.length; ++i) {
      res[i] = values[args[i]];
    }
    return res;
  }
}

function isSame(a, b): boolean {
  if (a === b) return true;
  if (a instanceof String && b instanceof String && a == b) return true;
  if ((a !== a) && (b !== b)) return true;
  return false;
}

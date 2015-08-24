/* */ 
'use strict';
var collection_1 = require("../facade/collection");
var lang_1 = require("../facade/lang");
var codegen_facade_1 = require("./codegen_facade");
var proto_record_1 = require("./proto_record");
var ON_PUSH_OBSERVE = "ON_PUSH_OBSERVE";
var CodegenLogicUtil = (function() {
  function CodegenLogicUtil(_names, _utilName, _changeDetection) {
    this._names = _names;
    this._utilName = _utilName;
    this._changeDetection = _changeDetection;
  }
  CodegenLogicUtil.prototype.genPropertyBindingEvalValue = function(protoRec) {
    var _this = this;
    return this.genEvalValue(protoRec, function(idx) {
      return _this._names.getLocalName(idx);
    }, this._names.getLocalsAccessorName());
  };
  CodegenLogicUtil.prototype.genEventBindingEvalValue = function(eventRecord, protoRec) {
    var _this = this;
    return this.genEvalValue(protoRec, function(idx) {
      return _this._names.getEventLocalName(eventRecord, idx);
    }, "locals");
  };
  CodegenLogicUtil.prototype.genEvalValue = function(protoRec, getLocalName, localsAccessor) {
    var context = (protoRec.contextIndex == -1) ? this._names.getDirectiveName(protoRec.directiveIndex) : getLocalName(protoRec.contextIndex);
    var argString = collection_1.ListWrapper.map(protoRec.args, function(arg) {
      return getLocalName(arg);
    }).join(", ");
    var rhs;
    switch (protoRec.mode) {
      case proto_record_1.RecordType.SELF:
        rhs = context;
        break;
      case proto_record_1.RecordType.CONST:
        rhs = codegen_facade_1.codify(protoRec.funcOrValue);
        break;
      case proto_record_1.RecordType.PROPERTY_READ:
        rhs = this._observe(context + "." + protoRec.name, protoRec);
        break;
      case proto_record_1.RecordType.SAFE_PROPERTY:
        var read = this._observe(context + "." + protoRec.name, protoRec);
        rhs = this._utilName + ".isValueBlank(" + context + ") ? null : " + this._observe(read, protoRec);
        break;
      case proto_record_1.RecordType.PROPERTY_WRITE:
        rhs = context + "." + protoRec.name + " = " + getLocalName(protoRec.args[0]);
        break;
      case proto_record_1.RecordType.LOCAL:
        rhs = this._observe(localsAccessor + ".get(" + codegen_facade_1.rawString(protoRec.name) + ")", protoRec);
        break;
      case proto_record_1.RecordType.INVOKE_METHOD:
        rhs = this._observe(context + "." + protoRec.name + "(" + argString + ")", protoRec);
        break;
      case proto_record_1.RecordType.SAFE_INVOKE_METHOD:
        var invoke = context + "." + protoRec.name + "(" + argString + ")";
        rhs = this._utilName + ".isValueBlank(" + context + ") ? null : " + this._observe(invoke, protoRec);
        break;
      case proto_record_1.RecordType.INVOKE_CLOSURE:
        rhs = context + "(" + argString + ")";
        break;
      case proto_record_1.RecordType.PRIMITIVE_OP:
        rhs = this._utilName + "." + protoRec.name + "(" + argString + ")";
        break;
      case proto_record_1.RecordType.COLLECTION_LITERAL:
        rhs = this._utilName + "." + protoRec.name + "(" + argString + ")";
        break;
      case proto_record_1.RecordType.INTERPOLATE:
        rhs = this._genInterpolation(protoRec);
        break;
      case proto_record_1.RecordType.KEYED_READ:
        rhs = this._observe(context + "[" + getLocalName(protoRec.args[0]) + "]", protoRec);
        break;
      case proto_record_1.RecordType.KEYED_WRITE:
        rhs = context + "[" + getLocalName(protoRec.args[0]) + "] = " + getLocalName(protoRec.args[1]);
        break;
      case proto_record_1.RecordType.CHAIN:
        rhs = 'null';
        break;
      default:
        throw new lang_1.BaseException("Unknown operation " + protoRec.mode);
    }
    return getLocalName(protoRec.selfIndex) + " = " + rhs + ";";
  };
  CodegenLogicUtil.prototype._observe = function(exp, rec) {
    if (lang_1.StringWrapper.equals(this._changeDetection, ON_PUSH_OBSERVE)) {
      return "this.observe(" + exp + ", " + rec.selfIndex + ")";
    } else {
      return exp;
    }
  };
  CodegenLogicUtil.prototype._genInterpolation = function(protoRec) {
    var iVals = [];
    for (var i = 0; i < protoRec.args.length; ++i) {
      iVals.push(codegen_facade_1.codify(protoRec.fixedArgs[i]));
      iVals.push(this._utilName + ".s(" + this._names.getLocalName(protoRec.args[i]) + ")");
    }
    iVals.push(codegen_facade_1.codify(protoRec.fixedArgs[protoRec.args.length]));
    return codegen_facade_1.combineGeneratedStrings(iVals);
  };
  return CodegenLogicUtil;
})();
exports.CodegenLogicUtil = CodegenLogicUtil;

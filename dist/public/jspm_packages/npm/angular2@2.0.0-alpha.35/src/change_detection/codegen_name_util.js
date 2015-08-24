/* */ 
'use strict';
var lang_1 = require("../facade/lang");
var collection_1 = require("../facade/collection");
var _ALREADY_CHECKED_ACCESSOR = "alreadyChecked";
var _CONTEXT_ACCESSOR = "context";
var _FIRST_PROTO_IN_CURRENT_BINDING = "firstProtoInCurrentBinding";
var _DIRECTIVES_ACCESSOR = "directiveRecords";
var _DISPATCHER_ACCESSOR = "dispatcher";
var _LOCALS_ACCESSOR = "locals";
var _MODE_ACCESSOR = "mode";
var _PIPES_ACCESSOR = "pipes";
var _PROTOS_ACCESSOR = "protos";
exports.CONTEXT_INDEX = 0;
var _FIELD_PREFIX = 'this.';
var _whiteSpaceRegExp = lang_1.RegExpWrapper.create("\\W", "g");
function sanitizeName(s) {
  return lang_1.StringWrapper.replaceAll(s, _whiteSpaceRegExp, '');
}
exports.sanitizeName = sanitizeName;
var CodegenNameUtil = (function() {
  function CodegenNameUtil(records, eventBindings, directiveRecords, utilName) {
    this.records = records;
    this.eventBindings = eventBindings;
    this.directiveRecords = directiveRecords;
    this.utilName = utilName;
    this._sanitizedNames = collection_1.ListWrapper.createFixedSize(this.records.length + 1);
    this._sanitizedNames[exports.CONTEXT_INDEX] = _CONTEXT_ACCESSOR;
    for (var i = 0,
        iLen = this.records.length; i < iLen; ++i) {
      this._sanitizedNames[i + 1] = sanitizeName("" + this.records[i].name + i);
    }
    this._sanitizedEventNames = new collection_1.Map();
    for (var ebIndex = 0; ebIndex < eventBindings.length; ++ebIndex) {
      var eb = eventBindings[ebIndex];
      var names = [_CONTEXT_ACCESSOR];
      for (var i = 0,
          iLen = eb.records.length; i < iLen; ++i) {
        names.push(sanitizeName("" + eb.records[i].name + i + "_" + ebIndex));
      }
      this._sanitizedEventNames.set(eb, names);
    }
  }
  CodegenNameUtil.prototype._addFieldPrefix = function(name) {
    return "" + _FIELD_PREFIX + name;
  };
  CodegenNameUtil.prototype.getDispatcherName = function() {
    return this._addFieldPrefix(_DISPATCHER_ACCESSOR);
  };
  CodegenNameUtil.prototype.getPipesAccessorName = function() {
    return this._addFieldPrefix(_PIPES_ACCESSOR);
  };
  CodegenNameUtil.prototype.getProtosName = function() {
    return this._addFieldPrefix(_PROTOS_ACCESSOR);
  };
  CodegenNameUtil.prototype.getDirectivesAccessorName = function() {
    return this._addFieldPrefix(_DIRECTIVES_ACCESSOR);
  };
  CodegenNameUtil.prototype.getLocalsAccessorName = function() {
    return this._addFieldPrefix(_LOCALS_ACCESSOR);
  };
  CodegenNameUtil.prototype.getAlreadyCheckedName = function() {
    return this._addFieldPrefix(_ALREADY_CHECKED_ACCESSOR);
  };
  CodegenNameUtil.prototype.getModeName = function() {
    return this._addFieldPrefix(_MODE_ACCESSOR);
  };
  CodegenNameUtil.prototype.getFirstProtoInCurrentBinding = function() {
    return this._addFieldPrefix(_FIRST_PROTO_IN_CURRENT_BINDING);
  };
  CodegenNameUtil.prototype.getLocalName = function(idx) {
    return "l_" + this._sanitizedNames[idx];
  };
  CodegenNameUtil.prototype.getEventLocalName = function(eb, idx) {
    return "l_" + collection_1.MapWrapper.get(this._sanitizedEventNames, eb)[idx];
  };
  CodegenNameUtil.prototype.getChangeName = function(idx) {
    return "c_" + this._sanitizedNames[idx];
  };
  CodegenNameUtil.prototype.genInitLocals = function() {
    var declarations = [];
    var assignments = [];
    for (var i = 0,
        iLen = this.getFieldCount(); i < iLen; ++i) {
      if (i == exports.CONTEXT_INDEX) {
        declarations.push(this.getLocalName(i) + " = " + this.getFieldName(i));
      } else {
        var rec = this.records[i - 1];
        if (rec.argumentToPureFunction) {
          var changeName = this.getChangeName(i);
          declarations.push(this.getLocalName(i) + "," + changeName);
          assignments.push(changeName);
        } else {
          declarations.push("" + this.getLocalName(i));
        }
      }
    }
    var assignmentsCode = collection_1.ListWrapper.isEmpty(assignments) ? '' : collection_1.ListWrapper.join(assignments, '=') + " = false;";
    return "var " + collection_1.ListWrapper.join(declarations, ',') + ";" + assignmentsCode;
  };
  CodegenNameUtil.prototype.genInitEventLocals = function() {
    var _this = this;
    var res = [(this.getLocalName(exports.CONTEXT_INDEX) + " = " + this.getFieldName(exports.CONTEXT_INDEX))];
    collection_1.MapWrapper.forEach(this._sanitizedEventNames, function(names, eb) {
      for (var i = 0; i < names.length; ++i) {
        if (i !== exports.CONTEXT_INDEX) {
          res.push("" + _this.getEventLocalName(eb, i));
        }
      }
    });
    return res.length > 1 ? "var " + res.join(',') + ";" : '';
  };
  CodegenNameUtil.prototype.getPreventDefaultAccesor = function() {
    return "preventDefault";
  };
  CodegenNameUtil.prototype.getFieldCount = function() {
    return this._sanitizedNames.length;
  };
  CodegenNameUtil.prototype.getFieldName = function(idx) {
    return this._addFieldPrefix(this._sanitizedNames[idx]);
  };
  CodegenNameUtil.prototype.getAllFieldNames = function() {
    var fieldList = [];
    for (var k = 0,
        kLen = this.getFieldCount(); k < kLen; ++k) {
      if (k === 0 || this.records[k - 1].shouldBeChecked()) {
        fieldList.push(this.getFieldName(k));
      }
    }
    for (var i = 0,
        iLen = this.records.length; i < iLen; ++i) {
      var rec = this.records[i];
      if (rec.isPipeRecord()) {
        fieldList.push(this.getPipeName(rec.selfIndex));
      }
    }
    for (var j = 0,
        jLen = this.directiveRecords.length; j < jLen; ++j) {
      var dRec = this.directiveRecords[j];
      fieldList.push(this.getDirectiveName(dRec.directiveIndex));
      if (!dRec.isDefaultChangeDetection()) {
        fieldList.push(this.getDetectorName(dRec.directiveIndex));
      }
    }
    return fieldList;
  };
  CodegenNameUtil.prototype.genDehydrateFields = function() {
    var fields = this.getAllFieldNames();
    collection_1.ListWrapper.removeAt(fields, exports.CONTEXT_INDEX);
    if (collection_1.ListWrapper.isEmpty(fields))
      return '';
    fields.push(this.utilName + ".uninitialized;");
    return collection_1.ListWrapper.join(fields, ' = ');
  };
  CodegenNameUtil.prototype.genPipeOnDestroy = function() {
    var _this = this;
    return collection_1.ListWrapper.join(collection_1.ListWrapper.map(collection_1.ListWrapper.filter(this.records, function(r) {
      return r.isPipeRecord();
    }), function(r) {
      return _this.utilName + ".callPipeOnDestroy(" + _this.getPipeName(r.selfIndex) + ");";
    }), '\n');
  };
  CodegenNameUtil.prototype.getPipeName = function(idx) {
    return this._addFieldPrefix(this._sanitizedNames[idx] + "_pipe");
  };
  CodegenNameUtil.prototype.getAllDirectiveNames = function() {
    var _this = this;
    return collection_1.ListWrapper.map(this.directiveRecords, function(d) {
      return _this.getDirectiveName(d.directiveIndex);
    });
  };
  CodegenNameUtil.prototype.getDirectiveName = function(d) {
    return this._addFieldPrefix("directive_" + d.name);
  };
  CodegenNameUtil.prototype.getAllDetectorNames = function() {
    var _this = this;
    return collection_1.ListWrapper.map(collection_1.ListWrapper.filter(this.directiveRecords, function(r) {
      return !r.isDefaultChangeDetection();
    }), function(d) {
      return _this.getDetectorName(d.directiveIndex);
    });
  };
  CodegenNameUtil.prototype.getDetectorName = function(d) {
    return this._addFieldPrefix("detector_" + d.name);
  };
  return CodegenNameUtil;
})();
exports.CodegenNameUtil = CodegenNameUtil;

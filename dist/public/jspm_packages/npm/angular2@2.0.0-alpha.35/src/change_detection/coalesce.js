/* */ 
'use strict';
var lang_1 = require("../facade/lang");
var collection_1 = require("../facade/collection");
var proto_record_1 = require("./proto_record");
function coalesce(records) {
  var res = [];
  var indexMap = new collection_1.Map();
  for (var i = 0; i < records.length; ++i) {
    var r = records[i];
    var record = _replaceIndices(r, res.length + 1, indexMap);
    var matchingRecord = _findMatching(record, res);
    if (lang_1.isPresent(matchingRecord) && record.lastInBinding) {
      res.push(_selfRecord(record, matchingRecord.selfIndex, res.length + 1));
      indexMap.set(r.selfIndex, matchingRecord.selfIndex);
      matchingRecord.referencedBySelf = true;
    } else if (lang_1.isPresent(matchingRecord) && !record.lastInBinding) {
      if (record.argumentToPureFunction) {
        matchingRecord.argumentToPureFunction = true;
      }
      indexMap.set(r.selfIndex, matchingRecord.selfIndex);
    } else {
      res.push(record);
      indexMap.set(r.selfIndex, record.selfIndex);
    }
  }
  return res;
}
exports.coalesce = coalesce;
function _selfRecord(r, contextIndex, selfIndex) {
  return new proto_record_1.ProtoRecord(proto_record_1.RecordType.SELF, "self", null, [], r.fixedArgs, contextIndex, r.directiveIndex, selfIndex, r.bindingRecord, r.expressionAsString, r.lastInBinding, r.lastInDirective, false, false);
}
function _findMatching(r, rs) {
  return collection_1.ListWrapper.find(rs, function(rr) {
    return rr.mode !== proto_record_1.RecordType.DIRECTIVE_LIFECYCLE && _sameDirIndex(rr, r) && rr.mode === r.mode && lang_1.looseIdentical(rr.funcOrValue, r.funcOrValue) && rr.contextIndex === r.contextIndex && lang_1.looseIdentical(rr.name, r.name) && collection_1.ListWrapper.equals(rr.args, r.args);
  });
}
function _sameDirIndex(a, b) {
  var di1 = lang_1.isBlank(a.directiveIndex) ? null : a.directiveIndex.directiveIndex;
  var ei1 = lang_1.isBlank(a.directiveIndex) ? null : a.directiveIndex.elementIndex;
  var di2 = lang_1.isBlank(b.directiveIndex) ? null : b.directiveIndex.directiveIndex;
  var ei2 = lang_1.isBlank(b.directiveIndex) ? null : b.directiveIndex.elementIndex;
  return di1 === di2 && ei1 === ei2;
}
function _replaceIndices(r, selfIndex, indexMap) {
  var args = collection_1.ListWrapper.map(r.args, function(a) {
    return _map(indexMap, a);
  });
  var contextIndex = _map(indexMap, r.contextIndex);
  return new proto_record_1.ProtoRecord(r.mode, r.name, r.funcOrValue, args, r.fixedArgs, contextIndex, r.directiveIndex, selfIndex, r.bindingRecord, r.expressionAsString, r.lastInBinding, r.lastInDirective, r.argumentToPureFunction, r.referencedBySelf);
}
function _map(indexMap, value) {
  var r = indexMap.get(value);
  return lang_1.isPresent(r) ? r : value;
}

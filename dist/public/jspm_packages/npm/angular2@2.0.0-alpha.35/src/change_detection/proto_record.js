/* */ 
'use strict';(function (RecordType) {
    RecordType[RecordType["SELF"] = 0] = "SELF";
    RecordType[RecordType["CONST"] = 1] = "CONST";
    RecordType[RecordType["PRIMITIVE_OP"] = 2] = "PRIMITIVE_OP";
    RecordType[RecordType["PROPERTY_READ"] = 3] = "PROPERTY_READ";
    RecordType[RecordType["PROPERTY_WRITE"] = 4] = "PROPERTY_WRITE";
    RecordType[RecordType["LOCAL"] = 5] = "LOCAL";
    RecordType[RecordType["INVOKE_METHOD"] = 6] = "INVOKE_METHOD";
    RecordType[RecordType["INVOKE_CLOSURE"] = 7] = "INVOKE_CLOSURE";
    RecordType[RecordType["KEYED_READ"] = 8] = "KEYED_READ";
    RecordType[RecordType["KEYED_WRITE"] = 9] = "KEYED_WRITE";
    RecordType[RecordType["PIPE"] = 10] = "PIPE";
    RecordType[RecordType["INTERPOLATE"] = 11] = "INTERPOLATE";
    RecordType[RecordType["SAFE_PROPERTY"] = 12] = "SAFE_PROPERTY";
    RecordType[RecordType["COLLECTION_LITERAL"] = 13] = "COLLECTION_LITERAL";
    RecordType[RecordType["SAFE_INVOKE_METHOD"] = 14] = "SAFE_INVOKE_METHOD";
    RecordType[RecordType["DIRECTIVE_LIFECYCLE"] = 15] = "DIRECTIVE_LIFECYCLE";
    RecordType[RecordType["CHAIN"] = 16] = "CHAIN";
})(exports.RecordType || (exports.RecordType = {}));
var RecordType = exports.RecordType;
var ProtoRecord = (function () {
    function ProtoRecord(mode, name, funcOrValue, args, fixedArgs, contextIndex, directiveIndex, selfIndex, bindingRecord, expressionAsString, lastInBinding, lastInDirective, argumentToPureFunction, referencedBySelf) {
        this.mode = mode;
        this.name = name;
        this.funcOrValue = funcOrValue;
        this.args = args;
        this.fixedArgs = fixedArgs;
        this.contextIndex = contextIndex;
        this.directiveIndex = directiveIndex;
        this.selfIndex = selfIndex;
        this.bindingRecord = bindingRecord;
        this.expressionAsString = expressionAsString;
        this.lastInBinding = lastInBinding;
        this.lastInDirective = lastInDirective;
        this.argumentToPureFunction = argumentToPureFunction;
        this.referencedBySelf = referencedBySelf;
    }
    ProtoRecord.prototype.isPureFunction = function () {
        return this.mode === RecordType.INTERPOLATE || this.mode === RecordType.COLLECTION_LITERAL;
    };
    ProtoRecord.prototype.isUsedByOtherRecord = function () { return !this.lastInBinding || this.referencedBySelf; };
    ProtoRecord.prototype.shouldBeChecked = function () {
        return this.argumentToPureFunction || this.lastInBinding || this.isPureFunction();
    };
    ProtoRecord.prototype.isPipeRecord = function () { return this.mode === RecordType.PIPE; };
    ProtoRecord.prototype.isLifeCycleRecord = function () { return this.mode === RecordType.DIRECTIVE_LIFECYCLE; };
    return ProtoRecord;
})();
exports.ProtoRecord = ProtoRecord;
//# sourceMappingURL=proto_record.js.map
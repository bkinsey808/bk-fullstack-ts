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
var __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
    return Reflect.decorate(decorators, target, key, desc);
  switch (arguments.length) {
    case 2:
      return decorators.reduceRight(function(o, d) {
        return (d && d(o)) || o;
      }, target);
    case 3:
      return decorators.reduceRight(function(o, d) {
        return (d && d(target, key)), void 0;
      }, void 0);
    case 4:
      return decorators.reduceRight(function(o, d) {
        return (d && d(target, key, o)) || o;
      }, desc);
  }
};
var __metadata = (this && this.__metadata) || function(k, v) {
  if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
    return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function(paramIndex, decorator) {
  return function(target, key) {
    decorator(target, key, paramIndex);
  };
};
var jit_proto_change_detector_1 = require("./jit_proto_change_detector");
var pregen_proto_change_detector_1 = require("./pregen_proto_change_detector");
var proto_change_detector_1 = require("./proto_change_detector");
var iterable_differs_1 = require("./differs/iterable_differs");
var default_iterable_differ_1 = require("./differs/default_iterable_differ");
var keyvalue_differs_1 = require("./differs/keyvalue_differs");
var default_keyvalue_differ_1 = require("./differs/default_keyvalue_differ");
var interfaces_1 = require("./interfaces");
var di_1 = require("../../di");
var collection_1 = require("../facade/collection");
var lang_1 = require("../facade/lang");
var ast_1 = require("./parser/ast");
exports.ASTWithSource = ast_1.ASTWithSource;
exports.AST = ast_1.AST;
exports.AstTransformer = ast_1.AstTransformer;
exports.PropertyRead = ast_1.PropertyRead;
exports.LiteralArray = ast_1.LiteralArray;
exports.ImplicitReceiver = ast_1.ImplicitReceiver;
var lexer_1 = require("./parser/lexer");
exports.Lexer = lexer_1.Lexer;
var parser_1 = require("./parser/parser");
exports.Parser = parser_1.Parser;
var locals_1 = require("./parser/locals");
exports.Locals = locals_1.Locals;
var exceptions_1 = require("./exceptions");
exports.DehydratedException = exceptions_1.DehydratedException;
exports.ExpressionChangedAfterItHasBeenCheckedException = exceptions_1.ExpressionChangedAfterItHasBeenCheckedException;
exports.ChangeDetectionError = exceptions_1.ChangeDetectionError;
var interfaces_2 = require("./interfaces");
exports.ChangeDetection = interfaces_2.ChangeDetection;
exports.ChangeDetectorDefinition = interfaces_2.ChangeDetectorDefinition;
exports.DebugContext = interfaces_2.DebugContext;
var constants_1 = require("./constants");
exports.CHECK_ONCE = constants_1.CHECK_ONCE;
exports.CHECK_ALWAYS = constants_1.CHECK_ALWAYS;
exports.DETACHED = constants_1.DETACHED;
exports.CHECKED = constants_1.CHECKED;
exports.ON_PUSH = constants_1.ON_PUSH;
exports.DEFAULT = constants_1.DEFAULT;
var proto_change_detector_2 = require("./proto_change_detector");
exports.DynamicProtoChangeDetector = proto_change_detector_2.DynamicProtoChangeDetector;
var binding_record_1 = require("./binding_record");
exports.BindingRecord = binding_record_1.BindingRecord;
var directive_record_1 = require("./directive_record");
exports.DirectiveIndex = directive_record_1.DirectiveIndex;
exports.DirectiveRecord = directive_record_1.DirectiveRecord;
var dynamic_change_detector_1 = require("./dynamic_change_detector");
exports.DynamicChangeDetector = dynamic_change_detector_1.DynamicChangeDetector;
var change_detector_ref_1 = require("./change_detector_ref");
exports.ChangeDetectorRef = change_detector_ref_1.ChangeDetectorRef;
var iterable_differs_2 = require("./differs/iterable_differs");
exports.IterableDiffers = iterable_differs_2.IterableDiffers;
var keyvalue_differs_2 = require("./differs/keyvalue_differs");
exports.KeyValueDiffers = keyvalue_differs_2.KeyValueDiffers;
var change_detection_util_1 = require("./change_detection_util");
exports.WrappedValue = change_detection_util_1.WrappedValue;
exports.keyValDiff = lang_1.CONST_EXPR([lang_1.CONST_EXPR(new default_keyvalue_differ_1.DefaultKeyValueDifferFactory())]);
exports.iterableDiff = lang_1.CONST_EXPR([lang_1.CONST_EXPR(new default_iterable_differ_1.DefaultIterableDifferFactory())]);
exports.defaultIterableDiffers = lang_1.CONST_EXPR(new iterable_differs_1.IterableDiffers(exports.iterableDiff));
exports.defaultKeyValueDiffers = lang_1.CONST_EXPR(new keyvalue_differs_1.KeyValueDiffers(exports.keyValDiff));
exports.preGeneratedProtoDetectors = {};
exports.PROTO_CHANGE_DETECTOR = lang_1.CONST_EXPR(new di_1.OpaqueToken('ProtoChangeDetectors'));
var PreGeneratedChangeDetection = (function(_super) {
  __extends(PreGeneratedChangeDetection, _super);
  function PreGeneratedChangeDetection(protoChangeDetectorsForTest) {
    _super.call(this);
    this._dynamicChangeDetection = new DynamicChangeDetection();
    this._protoChangeDetectorFactories = lang_1.isPresent(protoChangeDetectorsForTest) ? protoChangeDetectorsForTest : exports.preGeneratedProtoDetectors;
  }
  PreGeneratedChangeDetection.isSupported = function() {
    return pregen_proto_change_detector_1.PregenProtoChangeDetector.isSupported();
  };
  PreGeneratedChangeDetection.prototype.createProtoChangeDetector = function(definition) {
    var id = definition.id;
    if (collection_1.StringMapWrapper.contains(this._protoChangeDetectorFactories, id)) {
      return collection_1.StringMapWrapper.get(this._protoChangeDetectorFactories, id)(definition);
    }
    return this._dynamicChangeDetection.createProtoChangeDetector(definition);
  };
  PreGeneratedChangeDetection = __decorate([di_1.Injectable(), __param(0, di_1.Inject(exports.PROTO_CHANGE_DETECTOR)), __param(0, di_1.Optional()), __metadata('design:paramtypes', [Object])], PreGeneratedChangeDetection);
  return PreGeneratedChangeDetection;
})(interfaces_1.ChangeDetection);
exports.PreGeneratedChangeDetection = PreGeneratedChangeDetection;
var DynamicChangeDetection = (function(_super) {
  __extends(DynamicChangeDetection, _super);
  function DynamicChangeDetection() {
    _super.apply(this, arguments);
  }
  DynamicChangeDetection.prototype.createProtoChangeDetector = function(definition) {
    return new proto_change_detector_1.DynamicProtoChangeDetector(definition);
  };
  DynamicChangeDetection = __decorate([di_1.Injectable(), __metadata('design:paramtypes', [])], DynamicChangeDetection);
  return DynamicChangeDetection;
})(interfaces_1.ChangeDetection);
exports.DynamicChangeDetection = DynamicChangeDetection;
var JitChangeDetection = (function(_super) {
  __extends(JitChangeDetection, _super);
  function JitChangeDetection() {
    _super.apply(this, arguments);
  }
  JitChangeDetection.isSupported = function() {
    return jit_proto_change_detector_1.JitProtoChangeDetector.isSupported();
  };
  JitChangeDetection.prototype.createProtoChangeDetector = function(definition) {
    return new jit_proto_change_detector_1.JitProtoChangeDetector(definition);
  };
  JitChangeDetection = __decorate([di_1.Injectable(), lang_1.CONST(), __metadata('design:paramtypes', [])], JitChangeDetection);
  return JitChangeDetection;
})(interfaces_1.ChangeDetection);
exports.JitChangeDetection = JitChangeDetection;

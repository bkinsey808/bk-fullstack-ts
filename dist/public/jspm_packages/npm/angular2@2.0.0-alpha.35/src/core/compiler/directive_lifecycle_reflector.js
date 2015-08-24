/* */ 
'use strict';
var lang_1 = require("../../facade/lang");
var metadata_1 = require("../../../metadata");
function hasLifecycleHook(e, type, annotation) {
  if (lang_1.isPresent(annotation.lifecycle)) {
    return annotation.lifecycle.indexOf(e) !== -1;
  } else {
    if (!(type instanceof lang_1.Type))
      return false;
    var proto = type.prototype;
    switch (e) {
      case metadata_1.LifecycleEvent.onAllChangesDone:
        return !!proto.onAllChangesDone;
      case metadata_1.LifecycleEvent.onChange:
        return !!proto.onChange;
      case metadata_1.LifecycleEvent.onCheck:
        return !!proto.onCheck;
      case metadata_1.LifecycleEvent.onDestroy:
        return !!proto.onDestroy;
      case metadata_1.LifecycleEvent.onInit:
        return !!proto.onInit;
      default:
        return false;
    }
  }
}
exports.hasLifecycleHook = hasLifecycleHook;

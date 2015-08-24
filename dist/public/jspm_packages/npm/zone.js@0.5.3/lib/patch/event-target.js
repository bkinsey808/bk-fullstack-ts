/* */ 
'use strict';
var utils = require("../utils");
function apply() {
  if (global.EventTarget) {
    utils.patchEventTargetMethods(global.EventTarget.prototype);
  } else {
    var apis = ['ApplicationCache', 'EventSource', 'FileReader', 'InputMethodContext', 'MediaController', 'MessagePort', 'Node', 'Performance', 'SVGElementInstance', 'SharedWorker', 'TextTrack', 'TextTrackCue', 'TextTrackList', 'WebKitNamedFlow', 'Window', 'Worker', 'WorkerGlobalScope', 'XMLHttpRequest', 'XMLHttpRequestEventTarget', 'XMLHttpRequestUpload'];
    apis.forEach(function(thing) {
      global[thing] && utils.patchEventTargetMethods(global[thing].prototype);
    });
  }
}
module.exports = {apply: apply};

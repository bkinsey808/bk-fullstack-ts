/* */ 
"format cjs";
import { bootstrapUICommon } from "angular2/src/web-workers/ui/impl";
/**
 * Bootstrapping a WebWorker
 *
 * You instantiate a WebWorker application by calling bootstrap with the URI of your worker's index
 * script
 * Note: The WebWorker script must call bootstrapWebworker once it is set up to complete the
 * bootstrapping process
 */
export function bootstrap(uri) {
    var messageBus = spawnWebWorker(uri);
    bootstrapUICommon(messageBus);
    return messageBus;
}
export function spawnWebWorker(uri) {
    var webWorker = new Worker(uri);
    return new UIMessageBus(new UIMessageBusSink(webWorker), new UIMessageBusSource(webWorker));
}
export class UIMessageBus {
    constructor(sink, source) {
        this.sink = sink;
        this.source = source;
    }
}
export class UIMessageBusSink {
    constructor(_webWorker) {
        this._webWorker = _webWorker;
    }
    send(message) { this._webWorker.postMessage(message); }
}
export class UIMessageBusSource {
    constructor(_webWorker) {
        this._webWorker = _webWorker;
        this._listenerStore = new Map();
        this._numListeners = 0;
    }
    addListener(fn) {
        this._webWorker.addEventListener("message", fn);
        this._listenerStore[++this._numListeners] = fn;
        return this._numListeners;
    }
    removeListener(index) {
        removeEventListener("message", this._listenerStore[index]);
        this._listenerStore.delete(index);
    }
}
//# sourceMappingURL=application.js.map
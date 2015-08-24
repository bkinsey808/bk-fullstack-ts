import {
  MessageBus,
  MessageBusSource,
  MessageBusSink,
  SourceListener
} from "angular2/src/web-workers/shared/message_bus";
import {BaseException} from "angular2/src/facade/lang";
import {bootstrapUICommon} from "angular2/src/web-workers/ui/impl";

/**
 * Bootstrapping a WebWorker
 *
 * You instantiate a WebWorker application by calling bootstrap with the URI of your worker's index
 * script
 * Note: The WebWorker script must call bootstrapWebworker once it is set up to complete the
 * bootstrapping process
 */
export function bootstrap(uri: string): MessageBus {
  var messageBus = spawnWebWorker(uri);
  bootstrapUICommon(messageBus);
  return messageBus;
}

export function spawnWebWorker(uri: string): MessageBus {
  var webWorker: Worker = new Worker(uri);
  return new UIMessageBus(new UIMessageBusSink(webWorker), new UIMessageBusSource(webWorker));
}

export class UIMessageBus implements MessageBus {
  constructor(public sink: UIMessageBusSink, public source: UIMessageBusSource) {}
}

export class UIMessageBusSink implements MessageBusSink {
  constructor(private _webWorker: Worker) {}

  send(message: Object): void { this._webWorker.postMessage(message); }
}

export class UIMessageBusSource implements MessageBusSource {
  private _listenerStore: Map<int, SourceListener> = new Map<int, SourceListener>();
  private _numListeners: int = 0;

  constructor(private _webWorker: Worker) {}

  public addListener(fn: SourceListener): int {
    this._webWorker.addEventListener("message", fn);
    this._listenerStore[++this._numListeners] = fn;
    return this._numListeners;
  }

  public removeListener(index: int): void {
    removeEventListener("message", this._listenerStore[index]);
    this._listenerStore.delete(index);
  }
}

/* */ 
"format cjs";
/// <reference path="../../typings/rx/rx.d.ts" />
import { global } from 'angular2/src/facade/lang';
import * as Rx from 'rx';
export { Promise };
export class PromiseWrapper {
    static resolve(obj) { return Promise.resolve(obj); }
    static reject(obj, _) { return Promise.reject(obj); }
    // Note: We can't rename this method into `catch`, as this is not a valid
    // method name in Dart.
    static catchError(promise, onError) {
        return promise.catch(onError);
    }
    static all(promises) {
        if (promises.length == 0)
            return Promise.resolve([]);
        return Promise.all(promises);
    }
    static then(promise, success, rejection) {
        return promise.then(success, rejection);
    }
    static wrap(computation) {
        return new Promise((res, rej) => {
            try {
                res(computation());
            }
            catch (e) {
                rej(e);
            }
        });
    }
    static completer() {
        var resolve;
        var reject;
        var p = new Promise(function (res, rej) {
            resolve = res;
            reject = rej;
        });
        return { promise: p, resolve: resolve, reject: reject };
    }
}
export class TimerWrapper {
    static setTimeout(fn, millis) { return global.setTimeout(fn, millis); }
    static clearTimeout(id) { global.clearTimeout(id); }
    static setInterval(fn, millis) { return global.setInterval(fn, millis); }
    static clearInterval(id) { global.clearInterval(id); }
}
export class ObservableWrapper {
    // TODO(vsavkin): when we use rxnext, try inferring the generic type from the first arg
    static subscribe(emitter, onNext, onThrow = null, onReturn = null) {
        return emitter.observer({ next: onNext, throw: onThrow, return: onReturn });
    }
    static isObservable(obs) { return obs instanceof Observable; }
    static dispose(subscription) { subscription.dispose(); }
    static callNext(emitter, value) { emitter.next(value); }
    static callThrow(emitter, error) { emitter.throw(error); }
    static callReturn(emitter) { emitter.return(null); }
}
// TODO: vsavkin change to interface
export class Observable {
    observer(generator) { return null; }
}
/**
 * Use Rx.Observable but provides an adapter to make it work as specified here:
 * https://github.com/jhusain/observable-spec
 *
 * Once a reference implementation of the spec is available, switch to it.
 */
export class EventEmitter extends Observable {
    constructor() {
        super();
        // System creates a different object for import * than Typescript es5 emit.
        if (Rx.hasOwnProperty('default')) {
            this._subject = new Rx.default.Rx.Subject();
            this._immediateScheduler = Rx.default.Rx.Scheduler.immediate;
        }
        else {
            this._subject = new Rx.Subject();
            this._immediateScheduler = Rx.Scheduler.immediate;
        }
    }
    observer(generator) {
        return this._subject.observeOn(this._immediateScheduler)
            .subscribe((value) => { setTimeout(() => generator.next(value)); }, (error) => generator.throw ? generator.throw(error) : null, () => generator.return ? generator.return() : null);
    }
    toRx() { return this._subject; }
    next(value) { this._subject.onNext(value); }
    throw(error) { this._subject.onError(error); }
    return(value) { this._subject.onCompleted(); }
}
//# sourceMappingURL=async.js.map
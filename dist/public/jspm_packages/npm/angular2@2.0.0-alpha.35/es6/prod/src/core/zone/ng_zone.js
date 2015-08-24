/* */ 
"format cjs";
import { ListWrapper, StringMapWrapper } from 'angular2/src/facade/collection';
import { normalizeBlank, isPresent, global } from 'angular2/src/facade/lang';
import { wtfLeave, wtfCreateScope } from '../../profile/profile';
/**
 * A wrapper around zones that lets you schedule tasks after it has executed a task.
 *
 * The wrapper maintains an "inner" and an "mount" `Zone`. The application code will executes
 * in the "inner" zone unless `runOutsideAngular` is explicitely called.
 *
 * A typical application will create a singleton `NgZone`. The outer `Zone` is a fork of the root
 * `Zone`. The default `onTurnDone` runs the Angular change detection.
 */
export class NgZone {
    /**
     * Associates with this
     *
     * - a "root" zone, which the one that instantiated this.
     * - an "inner" zone, which is a child of the root zone.
     *
     * @param {bool} enableLongStackTrace whether to enable long stack trace. They should only be
     *               enabled in development mode as they significantly impact perf.
     */
    constructor({ enableLongStackTrace }) {
        this._zone_run_scope = wtfCreateScope(`NgZone#run()`);
        this._zone_microtask = wtfCreateScope(`NgZone#microtask()`);
        this._inVmTurnDone = false;
        this._pendingTimeouts = [];
        this._onTurnStart = null;
        this._onTurnDone = null;
        this._onEventDone = null;
        this._onErrorHandler = null;
        this._pendingMicrotasks = 0;
        this._hasExecutedCodeInInnerZone = false;
        this._nestedRun = 0;
        if (global.zone) {
            this._disabled = false;
            this._mountZone = global.zone;
            this._innerZone = this._createInnerZone(this._mountZone, enableLongStackTrace);
        }
        else {
            this._disabled = true;
            this._mountZone = null;
        }
    }
    /**
     * Sets the zone hook that is called just before Angular event turn starts.
     * It is called once per browser event.
     */
    overrideOnTurnStart(onTurnStartFn) {
        this._onTurnStart = normalizeBlank(onTurnStartFn);
    }
    /**
     * Sets the zone hook that is called immediately after Angular processes
     * all pending microtasks.
     */
    overrideOnTurnDone(onTurnDoneFn) {
        this._onTurnDone = normalizeBlank(onTurnDoneFn);
    }
    /**
     * Sets the zone hook that is called immediately after the last turn in
     * an event completes. At this point Angular will no longer attempt to
     * sync the UI. Any changes to the data model will not be reflected in the
     * DOM. `onEventDoneFn` is executed outside Angular zone.
     *
     * This hook is useful for validating application state (e.g. in a test).
     */
    overrideOnEventDone(onEventDoneFn, opt_waitForAsync) {
        var normalizedOnEventDone = normalizeBlank(onEventDoneFn);
        if (opt_waitForAsync) {
            this._onEventDone = () => {
                if (!this._pendingTimeouts.length) {
                    normalizedOnEventDone();
                }
            };
        }
        else {
            this._onEventDone = normalizedOnEventDone;
        }
    }
    /**
     * Sets the zone hook that is called when an error is uncaught in the
     * Angular zone. The first argument is the error. The second argument is
     * the stack trace.
     */
    overrideOnErrorHandler(errorHandlingFn) {
        this._onErrorHandler = normalizeBlank(errorHandlingFn);
    }
    /**
     * Runs `fn` in the inner zone and returns whatever it returns.
     *
     * In a typical app where the inner zone is the Angular zone, this allows one to make use of the
     * Angular's auto digest mechanism.
     *
     * ```
     * var zone: NgZone = [ref to the application zone];
     *
     * zone.run(() => {
     *   // the change detection will run after this function and the microtasks it enqueues have
     * executed.
     * });
     * ```
     */
    run(fn) {
        if (this._disabled) {
            var s = this._zone_run_scope();
            try {
                return fn();
            }
            finally {
                wtfLeave(s);
            }
        }
        else {
            return this._innerZone.run(fn);
        }
    }
    /**
     * Runs `fn` in the outer zone and returns whatever it returns.
     *
     * In a typical app where the inner zone is the Angular zone, this allows one to escape Angular's
     * auto-digest mechanism.
     *
     * ```
     * var zone: NgZone = [ref to the application zone];
     *
     * zone.runOutsideAngular(() => {
     *   element.onClick(() => {
     *     // Clicking on the element would not trigger the change detection
     *   });
     * });
     * ```
     */
    runOutsideAngular(fn) {
        if (this._disabled) {
            return fn();
        }
        else {
            return this._mountZone.run(fn);
        }
    }
    _createInnerZone(zone, enableLongStackTrace) {
        var _zone_microtask = this._zone_microtask;
        var ngZone = this;
        var errorHandling;
        if (enableLongStackTrace) {
            errorHandling = StringMapWrapper.merge(Zone.longStackTraceZone, { onError: function (e) { ngZone._onError(this, e); } });
        }
        else {
            errorHandling = { onError: function (e) { ngZone._onError(this, e); } };
        }
        return zone.fork(errorHandling)
            .fork({
            '$run': function (parentRun) {
                return function () {
                    try {
                        ngZone._nestedRun++;
                        if (!ngZone._hasExecutedCodeInInnerZone) {
                            ngZone._hasExecutedCodeInInnerZone = true;
                            if (ngZone._onTurnStart) {
                                parentRun.call(ngZone._innerZone, ngZone._onTurnStart);
                            }
                        }
                        return parentRun.apply(this, arguments);
                    }
                    finally {
                        ngZone._nestedRun--;
                        // If there are no more pending microtasks, we are at the end of a VM turn (or in
                        // onTurnStart)
                        // _nestedRun will be 0 at the end of a macrotasks (it could be > 0 when there are
                        // nested calls
                        // to run()).
                        if (ngZone._pendingMicrotasks == 0 && ngZone._nestedRun == 0 &&
                            !this._inVmTurnDone) {
                            if (ngZone._onTurnDone && ngZone._hasExecutedCodeInInnerZone) {
                                try {
                                    this._inVmTurnDone = true;
                                    parentRun.call(ngZone._innerZone, ngZone._onTurnDone);
                                    if (ngZone._pendingMicrotasks === 0 && isPresent(ngZone._onEventDone)) {
                                        ngZone.runOutsideAngular(ngZone._onEventDone);
                                    }
                                }
                                finally {
                                    this._inVmTurnDone = false;
                                    ngZone._hasExecutedCodeInInnerZone = false;
                                }
                            }
                        }
                    }
                };
            },
            '$scheduleMicrotask': function (parentScheduleMicrotask) {
                return function (fn) {
                    ngZone._pendingMicrotasks++;
                    var microtask = function () {
                        var s = _zone_microtask();
                        try {
                            fn();
                        }
                        finally {
                            ngZone._pendingMicrotasks--;
                            wtfLeave(s);
                        }
                    };
                    parentScheduleMicrotask.call(this, microtask);
                };
            },
            '$setTimeout': function (parentSetTimeout) {
                return function (fn, delay, ...args) {
                    var id;
                    var cb = function () {
                        fn();
                        ListWrapper.remove(ngZone._pendingTimeouts, id);
                    };
                    id = parentSetTimeout(cb, delay, args);
                    ngZone._pendingTimeouts.push(id);
                    return id;
                };
            },
            '$clearTimeout': function (parentClearTimeout) {
                return function (id) {
                    parentClearTimeout(id);
                    ListWrapper.remove(ngZone._pendingTimeouts, id);
                };
            },
            _innerZone: true
        });
    }
    _onError(zone, e) {
        if (isPresent(this._onErrorHandler)) {
            var trace = [normalizeBlank(e.stack)];
            while (zone && zone.constructedAtException) {
                trace.push(zone.constructedAtException.get());
                zone = zone.parent;
            }
            this._onErrorHandler(e, trace);
        }
        else {
            console.log('## _onError ##');
            console.log(e.stack);
            throw e;
        }
    }
}
//# sourceMappingURL=ng_zone.js.map
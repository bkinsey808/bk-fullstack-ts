/* */ 
"format cjs";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") return Reflect.decorate(decorators, target, key, desc);
    switch (arguments.length) {
        case 2: return decorators.reduceRight(function(o, d) { return (d && d(o)) || o; }, target);
        case 3: return decorators.reduceRight(function(o, d) { return (d && d(target, key)), void 0; }, void 0);
        case 4: return decorators.reduceRight(function(o, d) { return (d && d(target, key, o)) || o; }, desc);
    }
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from 'angular2/di';
import { isPresent, isBlank, BaseException } from 'angular2/src/facade/lang';
import { isListLikeIterable } from 'angular2/src/facade/collection';
class _ArrayLogger {
    constructor() {
        this.res = [];
    }
    log(s) { this.res.push(s); }
    logGroup(s) { this.res.push(s); }
    logGroupEnd() { }
    ;
}
/**
 * Provides a hook for centralized exception handling.
 *
 * The default implementation of `ExceptionHandler` prints error messages to the `Console`. To
 * intercept error handling,
 * write a custom exception handler that replaces this default as appropriate for your app.
 *
 * # Example
 *
 * ```javascript
 *
 * class MyExceptionHandler implements ExceptionHandler {
 *   call(error, stackTrace = null, reason = null) {
 *     // do something with the exception
 *   }
 * }
 *
 * bootstrap(MyApp, [bind(ExceptionHandler).toClass(MyExceptionHandler)])
 *
 * ```
 */
export let ExceptionHandler = class {
    constructor(logger, rethrowException = true) {
        this.logger = logger;
        this.rethrowException = rethrowException;
    }
    static exceptionToString(exception, stackTrace = null, reason = null) {
        var l = new _ArrayLogger();
        var e = new ExceptionHandler(l, false);
        e.call(exception, stackTrace, reason);
        return l.res.join("\n");
    }
    call(exception, stackTrace = null, reason = null) {
        var originalException = this._findOriginalException(exception);
        var originalStack = this._findOriginalStack(exception);
        var context = this._findContext(exception);
        this.logger.logGroup(`EXCEPTION: ${exception}`);
        if (isPresent(stackTrace) && isBlank(originalStack)) {
            this.logger.log("STACKTRACE:");
            this.logger.log(this._longStackTrace(stackTrace));
        }
        if (isPresent(reason)) {
            this.logger.log(`REASON: ${reason}`);
        }
        if (isPresent(originalException)) {
            this.logger.log(`ORIGINAL EXCEPTION: ${originalException}`);
        }
        if (isPresent(originalStack)) {
            this.logger.log("ORIGINAL STACKTRACE:");
            this.logger.log(this._longStackTrace(originalStack));
        }
        if (isPresent(context)) {
            this.logger.log("ERROR CONTEXT:");
            this.logger.log(context);
        }
        this.logger.logGroupEnd();
        // We rethrow exceptions, so operations like 'bootstrap' will result in an error
        // when an exception happens. If we do not rethrow, bootstrap will always succeed.
        if (this.rethrowException)
            throw exception;
    }
    _longStackTrace(stackTrace) {
        return isListLikeIterable(stackTrace) ? stackTrace.join("\n\n-----async gap-----\n") :
            stackTrace.toString();
    }
    _findContext(exception) {
        try {
            if (!(exception instanceof BaseException))
                return null;
            return isPresent(exception.context) ? exception.context :
                this._findContext(exception.originalException);
        }
        catch (e) {
            // exception.context can throw an exception. if it happens, we ignore the context.
            return null;
        }
    }
    _findOriginalException(exception) {
        if (!(exception instanceof BaseException))
            return null;
        var e = exception.originalException;
        while (e instanceof BaseException && isPresent(e.originalException)) {
            e = e.originalException;
        }
        return e;
    }
    _findOriginalStack(exception) {
        if (!(exception instanceof BaseException))
            return null;
        var e = exception;
        var stack = exception.originalStack;
        while (e instanceof BaseException && isPresent(e.originalException)) {
            e = e.originalException;
            if (e instanceof BaseException && isPresent(e.originalException)) {
                stack = e.originalStack;
            }
        }
        return stack;
    }
};
ExceptionHandler = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [Object, Boolean])
], ExceptionHandler);
//# sourceMappingURL=exception_handler.js.map
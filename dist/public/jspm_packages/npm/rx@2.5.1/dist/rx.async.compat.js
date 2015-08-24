/* */ 
"format cjs";
;
(function(factory) {
  var objectTypes = {
    'boolean': false,
    'function': true,
    'object': true,
    'number': false,
    'string': false,
    'undefined': false
  };
  var root = (objectTypes[typeof window] && window) || this,
      freeExports = objectTypes[typeof exports] && exports && !exports.nodeType && exports,
      freeModule = objectTypes[typeof module] && module && !module.nodeType && module,
      moduleExports = freeModule && freeModule.exports === freeExports && freeExports,
      freeGlobal = objectTypes[typeof global] && global;
  if (freeGlobal && (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal)) {
    root = freeGlobal;
  }
  if (typeof define === 'function' && define.amd) {
    define(['rx.binding', 'exports'], function(Rx, exports) {
      root.Rx = factory(root, exports, Rx);
      return root.Rx;
    });
  } else if (typeof module === 'object' && module && module.exports === freeExports) {
    module.exports = factory(root, module.exports, require("./rx"));
  } else {
    root.Rx = factory(root, {}, root.Rx);
  }
}.call(this, function(root, exp, Rx, undefined) {
  var Observable = Rx.Observable,
      observableProto = Observable.prototype,
      observableFromPromise = Observable.fromPromise,
      observableThrow = Observable.throwError,
      AnonymousObservable = Rx.AnonymousObservable,
      AsyncSubject = Rx.AsyncSubject,
      disposableCreate = Rx.Disposable.create,
      CompositeDisposable = Rx.CompositeDisposable,
      immediateScheduler = Rx.Scheduler.immediate,
      timeoutScheduler = Rx.Scheduler.timeout,
      isScheduler = Rx.helpers.isScheduler,
      slice = Array.prototype.slice;
  var fnString = 'function',
      throwString = 'throw',
      isObject = Rx.internals.isObject;
  function toThunk(obj, ctx) {
    if (Array.isArray(obj)) {
      return objectToThunk.call(ctx, obj);
    }
    if (isGeneratorFunction(obj)) {
      return observableSpawn(obj.call(ctx));
    }
    if (isGenerator(obj)) {
      return observableSpawn(obj);
    }
    if (isObservable(obj)) {
      return observableToThunk(obj);
    }
    if (isPromise(obj)) {
      return promiseToThunk(obj);
    }
    if (typeof obj === fnString) {
      return obj;
    }
    if (isObject(obj) || Array.isArray(obj)) {
      return objectToThunk.call(ctx, obj);
    }
    return obj;
  }
  function objectToThunk(obj) {
    var ctx = this;
    return function(done) {
      var keys = Object.keys(obj),
          pending = keys.length,
          results = new obj.constructor(),
          finished;
      if (!pending) {
        timeoutScheduler.schedule(function() {
          done(null, results);
        });
        return;
      }
      for (var i = 0,
          len = keys.length; i < len; i++) {
        run(obj[keys[i]], keys[i]);
      }
      function run(fn, key) {
        if (finished) {
          return;
        }
        try {
          fn = toThunk(fn, ctx);
          if (typeof fn !== fnString) {
            results[key] = fn;
            return --pending || done(null, results);
          }
          fn.call(ctx, function(err, res) {
            if (finished) {
              return;
            }
            if (err) {
              finished = true;
              return done(err);
            }
            results[key] = res;
            --pending || done(null, results);
          });
        } catch (e) {
          finished = true;
          done(e);
        }
      }
    };
  }
  function observableToThunk(observable) {
    return function(fn) {
      var value,
          hasValue = false;
      observable.subscribe(function(v) {
        value = v;
        hasValue = true;
      }, fn, function() {
        hasValue && fn(null, value);
      });
    };
  }
  function promiseToThunk(promise) {
    return function(fn) {
      promise.then(function(res) {
        fn(null, res);
      }, fn);
    };
  }
  function isObservable(obj) {
    return obj && typeof obj.subscribe === fnString;
  }
  function isGeneratorFunction(obj) {
    return obj && obj.constructor && obj.constructor.name === 'GeneratorFunction';
  }
  function isGenerator(obj) {
    return obj && typeof obj.next === fnString && typeof obj[throwString] === fnString;
  }
  var observableSpawn = Rx.spawn = function(fn) {
    var isGenFun = isGeneratorFunction(fn);
    return function(done) {
      var ctx = this,
          gen = fn;
      if (isGenFun) {
        for (var args = [],
            i = 0,
            len = arguments.length; i < len; i++) {
          args.push(arguments[i]);
        }
        var len = args.length,
            hasCallback = len && typeof args[len - 1] === fnString;
        done = hasCallback ? args.pop() : handleError;
        gen = fn.apply(this, args);
      } else {
        done = done || handleError;
      }
      next();
      function exit(err, res) {
        timeoutScheduler.schedule(done.bind(ctx, err, res));
      }
      function next(err, res) {
        var ret;
        if (arguments.length > 2) {
          for (var res = [],
              i = 1,
              len = arguments.length; i < len; i++) {
            res.push(arguments[i]);
          }
        }
        if (err) {
          try {
            ret = gen[throwString](err);
          } catch (e) {
            return exit(e);
          }
        }
        if (!err) {
          try {
            ret = gen.next(res);
          } catch (e) {
            return exit(e);
          }
        }
        if (ret.done) {
          return exit(null, ret.value);
        }
        ret.value = toThunk(ret.value, ctx);
        if (typeof ret.value === fnString) {
          var called = false;
          try {
            ret.value.call(ctx, function() {
              if (called) {
                return;
              }
              called = true;
              next.apply(ctx, arguments);
            });
          } catch (e) {
            timeoutScheduler.schedule(function() {
              if (called) {
                return;
              }
              called = true;
              next.call(ctx, e);
            });
          }
          return;
        }
        next(new TypeError('Rx.spawn only supports a function, Promise, Observable, Object or Array.'));
      }
    };
  };
  function handleError(err) {
    if (!err) {
      return;
    }
    timeoutScheduler.schedule(function() {
      throw err;
    });
  }
  Observable.start = function(func, context, scheduler) {
    return observableToAsync(func, context, scheduler)();
  };
  var observableToAsync = Observable.toAsync = function(func, context, scheduler) {
    isScheduler(scheduler) || (scheduler = timeoutScheduler);
    return function() {
      var args = arguments,
          subject = new AsyncSubject();
      scheduler.schedule(function() {
        var result;
        try {
          result = func.apply(context, args);
        } catch (e) {
          subject.onError(e);
          return;
        }
        subject.onNext(result);
        subject.onCompleted();
      });
      return subject.asObservable();
    };
  };
  Observable.fromCallback = function(func, context, selector) {
    return function() {
      var len = arguments.length,
          args = new Array(len);
      for (var i = 0; i < len; i++) {
        args[i] = arguments[i];
      }
      return new AnonymousObservable(function(observer) {
        function handler() {
          var len = arguments.length,
              results = new Array(len);
          for (var i = 0; i < len; i++) {
            results[i] = arguments[i];
          }
          if (selector) {
            try {
              results = selector.apply(context, results);
            } catch (e) {
              return observer.onError(e);
            }
            observer.onNext(results);
          } else {
            if (results.length <= 1) {
              observer.onNext.apply(observer, results);
            } else {
              observer.onNext(results);
            }
          }
          observer.onCompleted();
        }
        args.push(handler);
        func.apply(context, args);
      }).publishLast().refCount();
    };
  };
  Observable.fromNodeCallback = function(func, context, selector) {
    return function() {
      var len = arguments.length,
          args = new Array(len);
      for (var i = 0; i < len; i++) {
        args[i] = arguments[i];
      }
      return new AnonymousObservable(function(observer) {
        function handler(err) {
          if (err) {
            observer.onError(err);
            return;
          }
          var len = arguments.length,
              results = [];
          for (var i = 1; i < len; i++) {
            results[i - 1] = arguments[i];
          }
          if (selector) {
            try {
              results = selector.apply(context, results);
            } catch (e) {
              return observer.onError(e);
            }
            observer.onNext(results);
          } else {
            if (results.length <= 1) {
              observer.onNext.apply(observer, results);
            } else {
              observer.onNext(results);
            }
          }
          observer.onCompleted();
        }
        args.push(handler);
        func.apply(context, args);
      }).publishLast().refCount();
    };
  };
  function fixEvent(event) {
    var stopPropagation = function() {
      this.cancelBubble = true;
    };
    var preventDefault = function() {
      this.bubbledKeyCode = this.keyCode;
      if (this.ctrlKey) {
        try {
          this.keyCode = 0;
        } catch (e) {}
      }
      this.defaultPrevented = true;
      this.returnValue = false;
      this.modified = true;
    };
    event || (event = root.event);
    if (!event.target) {
      event.target = event.target || event.srcElement;
      if (event.type == 'mouseover') {
        event.relatedTarget = event.fromElement;
      }
      if (event.type == 'mouseout') {
        event.relatedTarget = event.toElement;
      }
      if (!event.stopPropagation) {
        event.stopPropagation = stopPropagation;
        event.preventDefault = preventDefault;
      }
      switch (event.type) {
        case 'keypress':
          var c = ('charCode' in event ? event.charCode : event.keyCode);
          if (c == 10) {
            c = 0;
            event.keyCode = 13;
          } else if (c == 13 || c == 27) {
            c = 0;
          } else if (c == 3) {
            c = 99;
          }
          event.charCode = c;
          event.keyChar = event.charCode ? String.fromCharCode(event.charCode) : '';
          break;
      }
    }
    return event;
  }
  function createListener(element, name, handler) {
    if (element.addEventListener) {
      element.addEventListener(name, handler, false);
      return disposableCreate(function() {
        element.removeEventListener(name, handler, false);
      });
    }
    if (element.attachEvent) {
      var innerHandler = function(event) {
        handler(fixEvent(event));
      };
      element.attachEvent('on' + name, innerHandler);
      return disposableCreate(function() {
        element.detachEvent('on' + name, innerHandler);
      });
    }
    element['on' + name] = handler;
    return disposableCreate(function() {
      element['on' + name] = null;
    });
  }
  function createEventListener(el, eventName, handler) {
    var disposables = new CompositeDisposable();
    if (Object.prototype.toString.call(el) === '[object NodeList]') {
      for (var i = 0,
          len = el.length; i < len; i++) {
        disposables.add(createEventListener(el.item(i), eventName, handler));
      }
    } else if (el) {
      disposables.add(createListener(el, eventName, handler));
    }
    return disposables;
  }
  Rx.config.useNativeEvents = false;
  Observable.fromEvent = function(element, eventName, selector) {
    if (element.addListener) {
      return fromEventPattern(function(h) {
        element.addListener(eventName, h);
      }, function(h) {
        element.removeListener(eventName, h);
      }, selector);
    }
    if (!Rx.config.useNativeEvents) {
      if (typeof element.on === 'function' && typeof element.off === 'function') {
        return fromEventPattern(function(h) {
          element.on(eventName, h);
        }, function(h) {
          element.off(eventName, h);
        }, selector);
      }
    }
    return new AnonymousObservable(function(observer) {
      return createEventListener(element, eventName, function handler(e) {
        var results = e;
        if (selector) {
          try {
            results = selector(arguments);
          } catch (err) {
            return observer.onError(err);
          }
        }
        observer.onNext(results);
      });
    }).publish().refCount();
  };
  var fromEventPattern = Observable.fromEventPattern = function(addHandler, removeHandler, selector) {
    return new AnonymousObservable(function(observer) {
      function innerHandler(e) {
        var result = e;
        if (selector) {
          try {
            result = selector(arguments);
          } catch (err) {
            return observer.onError(err);
          }
        }
        observer.onNext(result);
      }
      var returnValue = addHandler(innerHandler);
      return disposableCreate(function() {
        if (removeHandler) {
          removeHandler(innerHandler, returnValue);
        }
      });
    }).publish().refCount();
  };
  Observable.startAsync = function(functionAsync) {
    var promise;
    try {
      promise = functionAsync();
    } catch (e) {
      return observableThrow(e);
    }
    return observableFromPromise(promise);
  };
  return Rx;
}));

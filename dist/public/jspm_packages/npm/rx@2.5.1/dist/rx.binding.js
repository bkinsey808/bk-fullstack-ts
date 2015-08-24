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
    define(['rx'], function(Rx, exports) {
      return factory(root, exports, Rx);
    });
  } else if (typeof module === 'object' && module && module.exports === freeExports) {
    module.exports = factory(root, module.exports, require("./rx"));
  } else {
    root.Rx = factory(root, {}, root.Rx);
  }
}.call(this, function(root, exp, Rx, undefined) {
  var Observable = Rx.Observable,
      observableProto = Observable.prototype,
      AnonymousObservable = Rx.AnonymousObservable,
      Subject = Rx.Subject,
      AsyncSubject = Rx.AsyncSubject,
      Observer = Rx.Observer,
      ScheduledObserver = Rx.internals.ScheduledObserver,
      disposableCreate = Rx.Disposable.create,
      disposableEmpty = Rx.Disposable.empty,
      CompositeDisposable = Rx.CompositeDisposable,
      currentThreadScheduler = Rx.Scheduler.currentThread,
      isFunction = Rx.helpers.isFunction,
      inherits = Rx.internals.inherits,
      addProperties = Rx.internals.addProperties,
      checkDisposed = Rx.Disposable.checkDisposed;
  function cloneArray(arr) {
    var len = arr.length,
        a = new Array(len);
    for (var i = 0; i < len; i++) {
      a[i] = arr[i];
    }
    return a;
  }
  observableProto.multicast = function(subjectOrSubjectSelector, selector) {
    var source = this;
    return typeof subjectOrSubjectSelector === 'function' ? new AnonymousObservable(function(observer) {
      var connectable = source.multicast(subjectOrSubjectSelector());
      return new CompositeDisposable(selector(connectable).subscribe(observer), connectable.connect());
    }, source) : new ConnectableObservable(source, subjectOrSubjectSelector);
  };
  observableProto.publish = function(selector) {
    return selector && isFunction(selector) ? this.multicast(function() {
      return new Subject();
    }, selector) : this.multicast(new Subject());
  };
  observableProto.share = function() {
    return this.publish().refCount();
  };
  observableProto.publishLast = function(selector) {
    return selector && isFunction(selector) ? this.multicast(function() {
      return new AsyncSubject();
    }, selector) : this.multicast(new AsyncSubject());
  };
  observableProto.publishValue = function(initialValueOrSelector, initialValue) {
    return arguments.length === 2 ? this.multicast(function() {
      return new BehaviorSubject(initialValue);
    }, initialValueOrSelector) : this.multicast(new BehaviorSubject(initialValueOrSelector));
  };
  observableProto.shareValue = function(initialValue) {
    return this.publishValue(initialValue).refCount();
  };
  observableProto.replay = function(selector, bufferSize, windowSize, scheduler) {
    return selector && isFunction(selector) ? this.multicast(function() {
      return new ReplaySubject(bufferSize, windowSize, scheduler);
    }, selector) : this.multicast(new ReplaySubject(bufferSize, windowSize, scheduler));
  };
  observableProto.shareReplay = function(bufferSize, windowSize, scheduler) {
    return this.replay(null, bufferSize, windowSize, scheduler).refCount();
  };
  var InnerSubscription = function(subject, observer) {
    this.subject = subject;
    this.observer = observer;
  };
  InnerSubscription.prototype.dispose = function() {
    if (!this.subject.isDisposed && this.observer !== null) {
      var idx = this.subject.observers.indexOf(this.observer);
      this.subject.observers.splice(idx, 1);
      this.observer = null;
    }
  };
  var BehaviorSubject = Rx.BehaviorSubject = (function(__super__) {
    function subscribe(observer) {
      checkDisposed(this);
      if (!this.isStopped) {
        this.observers.push(observer);
        observer.onNext(this.value);
        return new InnerSubscription(this, observer);
      }
      if (this.hasError) {
        observer.onError(this.error);
      } else {
        observer.onCompleted();
      }
      return disposableEmpty;
    }
    inherits(BehaviorSubject, __super__);
    function BehaviorSubject(value) {
      __super__.call(this, subscribe);
      this.value = value, this.observers = [], this.isDisposed = false, this.isStopped = false, this.hasError = false;
    }
    addProperties(BehaviorSubject.prototype, Observer, {
      getValue: function() {
        checkDisposed(this);
        if (this.hasError) {
          throw this.error;
        }
        return this.value;
      },
      hasObservers: function() {
        return this.observers.length > 0;
      },
      onCompleted: function() {
        checkDisposed(this);
        if (this.isStopped) {
          return;
        }
        this.isStopped = true;
        for (var i = 0,
            os = cloneArray(this.observers),
            len = os.length; i < len; i++) {
          os[i].onCompleted();
        }
        this.observers.length = 0;
      },
      onError: function(error) {
        checkDisposed(this);
        if (this.isStopped) {
          return;
        }
        this.isStopped = true;
        this.hasError = true;
        this.error = error;
        for (var i = 0,
            os = cloneArray(this.observers),
            len = os.length; i < len; i++) {
          os[i].onError(error);
        }
        this.observers.length = 0;
      },
      onNext: function(value) {
        checkDisposed(this);
        if (this.isStopped) {
          return;
        }
        this.value = value;
        for (var i = 0,
            os = cloneArray(this.observers),
            len = os.length; i < len; i++) {
          os[i].onNext(value);
        }
      },
      dispose: function() {
        this.isDisposed = true;
        this.observers = null;
        this.value = null;
        this.exception = null;
      }
    });
    return BehaviorSubject;
  }(Observable));
  var ReplaySubject = Rx.ReplaySubject = (function(__super__) {
    var maxSafeInteger = Math.pow(2, 53) - 1;
    function createRemovableDisposable(subject, observer) {
      return disposableCreate(function() {
        observer.dispose();
        !subject.isDisposed && subject.observers.splice(subject.observers.indexOf(observer), 1);
      });
    }
    function subscribe(observer) {
      var so = new ScheduledObserver(this.scheduler, observer),
          subscription = createRemovableDisposable(this, so);
      checkDisposed(this);
      this._trim(this.scheduler.now());
      this.observers.push(so);
      for (var i = 0,
          len = this.q.length; i < len; i++) {
        so.onNext(this.q[i].value);
      }
      if (this.hasError) {
        so.onError(this.error);
      } else if (this.isStopped) {
        so.onCompleted();
      }
      so.ensureActive();
      return subscription;
    }
    inherits(ReplaySubject, __super__);
    function ReplaySubject(bufferSize, windowSize, scheduler) {
      this.bufferSize = bufferSize == null ? maxSafeInteger : bufferSize;
      this.windowSize = windowSize == null ? maxSafeInteger : windowSize;
      this.scheduler = scheduler || currentThreadScheduler;
      this.q = [];
      this.observers = [];
      this.isStopped = false;
      this.isDisposed = false;
      this.hasError = false;
      this.error = null;
      __super__.call(this, subscribe);
    }
    addProperties(ReplaySubject.prototype, Observer.prototype, {
      hasObservers: function() {
        return this.observers.length > 0;
      },
      _trim: function(now) {
        while (this.q.length > this.bufferSize) {
          this.q.shift();
        }
        while (this.q.length > 0 && (now - this.q[0].interval) > this.windowSize) {
          this.q.shift();
        }
      },
      onNext: function(value) {
        checkDisposed(this);
        if (this.isStopped) {
          return;
        }
        var now = this.scheduler.now();
        this.q.push({
          interval: now,
          value: value
        });
        this._trim(now);
        for (var i = 0,
            os = cloneArray(this.observers),
            len = os.length; i < len; i++) {
          var observer = os[i];
          observer.onNext(value);
          observer.ensureActive();
        }
      },
      onError: function(error) {
        checkDisposed(this);
        if (this.isStopped) {
          return;
        }
        this.isStopped = true;
        this.error = error;
        this.hasError = true;
        var now = this.scheduler.now();
        this._trim(now);
        for (var i = 0,
            os = cloneArray(this.observers),
            len = os.length; i < len; i++) {
          var observer = os[i];
          observer.onError(error);
          observer.ensureActive();
        }
        this.observers.length = 0;
      },
      onCompleted: function() {
        checkDisposed(this);
        if (this.isStopped) {
          return;
        }
        this.isStopped = true;
        var now = this.scheduler.now();
        this._trim(now);
        for (var i = 0,
            os = cloneArray(this.observers),
            len = os.length; i < len; i++) {
          var observer = os[i];
          observer.onCompleted();
          observer.ensureActive();
        }
        this.observers.length = 0;
      },
      dispose: function() {
        this.isDisposed = true;
        this.observers = null;
      }
    });
    return ReplaySubject;
  }(Observable));
  var ConnectableObservable = Rx.ConnectableObservable = (function(__super__) {
    inherits(ConnectableObservable, __super__);
    function ConnectableObservable(source, subject) {
      var hasSubscription = false,
          subscription,
          sourceObservable = source.asObservable();
      this.connect = function() {
        if (!hasSubscription) {
          hasSubscription = true;
          subscription = new CompositeDisposable(sourceObservable.subscribe(subject), disposableCreate(function() {
            hasSubscription = false;
          }));
        }
        return subscription;
      };
      __super__.call(this, function(o) {
        return subject.subscribe(o);
      });
    }
    ConnectableObservable.prototype.refCount = function() {
      var connectableSubscription,
          count = 0,
          source = this;
      return new AnonymousObservable(function(observer) {
        var shouldConnect = ++count === 1,
            subscription = source.subscribe(observer);
        shouldConnect && (connectableSubscription = source.connect());
        return function() {
          subscription.dispose();
          --count === 0 && connectableSubscription.dispose();
        };
      });
    };
    return ConnectableObservable;
  }(Observable));
  return Rx;
}));

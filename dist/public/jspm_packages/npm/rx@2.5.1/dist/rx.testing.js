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
    define(['rx.virtualtime', 'exports'], function(Rx, exports) {
      root.Rx = factory(root, exports, Rx);
      return root.Rx;
    });
  } else if (typeof module === 'object' && module && module.exports === freeExports) {
    module.exports = factory(root, module.exports, require("./rx"));
  } else {
    root.Rx = factory(root, {}, root.Rx);
  }
}.call(this, function(root, exp, Rx, undefined) {
  var Observer = Rx.Observer,
      Observable = Rx.Observable,
      Notification = Rx.Notification,
      VirtualTimeScheduler = Rx.VirtualTimeScheduler,
      Disposable = Rx.Disposable,
      disposableEmpty = Disposable.empty,
      disposableCreate = Disposable.create,
      CompositeDisposable = Rx.CompositeDisposable,
      SingleAssignmentDisposable = Rx.SingleAssignmentDisposable,
      inherits = Rx.internals.inherits,
      defaultComparer = Rx.internals.isEqual;
  function OnNextPredicate(predicate) {
    this.predicate = predicate;
  }
  ;
  OnNextPredicate.prototype.equals = function(other) {
    if (other === this) {
      return true;
    }
    if (other == null) {
      return false;
    }
    if (other.kind !== 'N') {
      return false;
    }
    return this.predicate(other.value);
  };
  function OnErrorPredicate(predicate) {
    this.predicate = predicate;
  }
  ;
  OnErrorPredicate.prototype.equals = function(other) {
    if (other === this) {
      return true;
    }
    if (other == null) {
      return false;
    }
    if (other.kind !== 'E') {
      return false;
    }
    return this.predicate(other.exception);
  };
  var ReactiveTest = Rx.ReactiveTest = {
    created: 100,
    subscribed: 200,
    disposed: 1000,
    onNext: function(ticks, value) {
      return typeof value === 'function' ? new Recorded(ticks, new OnNextPredicate(value)) : new Recorded(ticks, Notification.createOnNext(value));
    },
    onError: function(ticks, error) {
      return typeof error === 'function' ? new Recorded(ticks, new OnErrorPredicate(error)) : new Recorded(ticks, Notification.createOnError(error));
    },
    onCompleted: function(ticks) {
      return new Recorded(ticks, Notification.createOnCompleted());
    },
    subscribe: function(start, end) {
      return new Subscription(start, end);
    }
  };
  var Recorded = Rx.Recorded = function(time, value, comparer) {
    this.time = time;
    this.value = value;
    this.comparer = comparer || defaultComparer;
  };
  Recorded.prototype.equals = function(other) {
    return this.time === other.time && this.comparer(this.value, other.value);
  };
  Recorded.prototype.toString = function() {
    return this.value.toString() + '@' + this.time;
  };
  var Subscription = Rx.Subscription = function(start, end) {
    this.subscribe = start;
    this.unsubscribe = end || Number.MAX_VALUE;
  };
  Subscription.prototype.equals = function(other) {
    return this.subscribe === other.subscribe && this.unsubscribe === other.unsubscribe;
  };
  Subscription.prototype.toString = function() {
    return '(' + this.subscribe + ', ' + (this.unsubscribe === Number.MAX_VALUE ? 'Infinite' : this.unsubscribe) + ')';
  };
  var MockDisposable = Rx.MockDisposable = function(scheduler) {
    this.scheduler = scheduler;
    this.disposes = [];
    this.disposes.push(this.scheduler.clock);
  };
  MockDisposable.prototype.dispose = function() {
    this.disposes.push(this.scheduler.clock);
  };
  var MockObserver = (function(__super__) {
    inherits(MockObserver, __super__);
    function MockObserver(scheduler) {
      __super__.call(this);
      this.scheduler = scheduler;
      this.messages = [];
    }
    var MockObserverPrototype = MockObserver.prototype;
    MockObserverPrototype.onNext = function(value) {
      this.messages.push(new Recorded(this.scheduler.clock, Notification.createOnNext(value)));
    };
    MockObserverPrototype.onError = function(exception) {
      this.messages.push(new Recorded(this.scheduler.clock, Notification.createOnError(exception)));
    };
    MockObserverPrototype.onCompleted = function() {
      this.messages.push(new Recorded(this.scheduler.clock, Notification.createOnCompleted()));
    };
    return MockObserver;
  })(Observer);
  function MockPromise(scheduler, messages) {
    var self = this;
    this.scheduler = scheduler;
    this.messages = messages;
    this.subscriptions = [];
    this.observers = [];
    for (var i = 0,
        len = this.messages.length; i < len; i++) {
      var message = this.messages[i],
          notification = message.value;
      (function(innerNotification) {
        scheduler.scheduleAbsoluteWithState(null, message.time, function() {
          var obs = self.observers.slice(0);
          for (var j = 0,
              jLen = obs.length; j < jLen; j++) {
            innerNotification.accept(obs[j]);
          }
          return disposableEmpty;
        });
      })(notification);
    }
  }
  MockPromise.prototype.then = function(onResolved, onRejected) {
    var self = this;
    this.subscriptions.push(new Subscription(this.scheduler.clock));
    var index = this.subscriptions.length - 1;
    var newPromise;
    var observer = Rx.Observer.create(function(x) {
      var retValue = onResolved(x);
      if (retValue && typeof retValue.then === 'function') {
        newPromise = retValue;
      } else {
        var ticks = self.scheduler.clock;
        newPromise = new MockPromise(self.scheduler, [Rx.ReactiveTest.onNext(ticks, undefined), Rx.ReactiveTest.onCompleted(ticks)]);
      }
      var idx = self.observers.indexOf(observer);
      self.observers.splice(idx, 1);
      self.subscriptions[index] = new Subscription(self.subscriptions[index].subscribe, self.scheduler.clock);
    }, function(err) {
      onRejected(err);
      var idx = self.observers.indexOf(observer);
      self.observers.splice(idx, 1);
      self.subscriptions[index] = new Subscription(self.subscriptions[index].subscribe, self.scheduler.clock);
    });
    this.observers.push(observer);
    return newPromise || new MockPromise(this.scheduler, this.messages);
  };
  var HotObservable = (function(__super__) {
    function subscribe(observer) {
      var observable = this;
      this.observers.push(observer);
      this.subscriptions.push(new Subscription(this.scheduler.clock));
      var index = this.subscriptions.length - 1;
      return disposableCreate(function() {
        var idx = observable.observers.indexOf(observer);
        observable.observers.splice(idx, 1);
        observable.subscriptions[index] = new Subscription(observable.subscriptions[index].subscribe, observable.scheduler.clock);
      });
    }
    inherits(HotObservable, __super__);
    function HotObservable(scheduler, messages) {
      __super__.call(this, subscribe);
      var message,
          notification,
          observable = this;
      this.scheduler = scheduler;
      this.messages = messages;
      this.subscriptions = [];
      this.observers = [];
      for (var i = 0,
          len = this.messages.length; i < len; i++) {
        message = this.messages[i];
        notification = message.value;
        (function(innerNotification) {
          scheduler.scheduleAbsoluteWithState(null, message.time, function() {
            var obs = observable.observers.slice(0);
            for (var j = 0,
                jLen = obs.length; j < jLen; j++) {
              innerNotification.accept(obs[j]);
            }
            return disposableEmpty;
          });
        })(notification);
      }
    }
    return HotObservable;
  })(Observable);
  var ColdObservable = (function(__super__) {
    function subscribe(observer) {
      var message,
          notification,
          observable = this;
      this.subscriptions.push(new Subscription(this.scheduler.clock));
      var index = this.subscriptions.length - 1;
      var d = new CompositeDisposable();
      for (var i = 0,
          len = this.messages.length; i < len; i++) {
        message = this.messages[i];
        notification = message.value;
        (function(innerNotification) {
          d.add(observable.scheduler.scheduleRelativeWithState(null, message.time, function() {
            innerNotification.accept(observer);
            return disposableEmpty;
          }));
        })(notification);
      }
      return disposableCreate(function() {
        observable.subscriptions[index] = new Subscription(observable.subscriptions[index].subscribe, observable.scheduler.clock);
        d.dispose();
      });
    }
    inherits(ColdObservable, __super__);
    function ColdObservable(scheduler, messages) {
      __super__.call(this, subscribe);
      this.scheduler = scheduler;
      this.messages = messages;
      this.subscriptions = [];
    }
    return ColdObservable;
  })(Observable);
  Rx.TestScheduler = (function(__super__) {
    inherits(TestScheduler, __super__);
    function baseComparer(x, y) {
      return x > y ? 1 : (x < y ? -1 : 0);
    }
    function TestScheduler() {
      __super__.call(this, 0, baseComparer);
    }
    TestScheduler.prototype.scheduleAbsoluteWithState = function(state, dueTime, action) {
      dueTime <= this.clock && (dueTime = this.clock + 1);
      return __super__.prototype.scheduleAbsoluteWithState.call(this, state, dueTime, action);
    };
    TestScheduler.prototype.add = function(absolute, relative) {
      return absolute + relative;
    };
    TestScheduler.prototype.toDateTimeOffset = function(absolute) {
      return new Date(absolute).getTime();
    };
    TestScheduler.prototype.toRelative = function(timeSpan) {
      return timeSpan;
    };
    TestScheduler.prototype.startWithTiming = function(create, created, subscribed, disposed) {
      var observer = this.createObserver(),
          source,
          subscription;
      this.scheduleAbsoluteWithState(null, created, function() {
        source = create();
        return disposableEmpty;
      });
      this.scheduleAbsoluteWithState(null, subscribed, function() {
        subscription = source.subscribe(observer);
        return disposableEmpty;
      });
      this.scheduleAbsoluteWithState(null, disposed, function() {
        subscription.dispose();
        return disposableEmpty;
      });
      this.start();
      return observer;
    };
    TestScheduler.prototype.startWithDispose = function(create, disposed) {
      return this.startWithTiming(create, ReactiveTest.created, ReactiveTest.subscribed, disposed);
    };
    TestScheduler.prototype.startWithCreate = function(create) {
      return this.startWithTiming(create, ReactiveTest.created, ReactiveTest.subscribed, ReactiveTest.disposed);
    };
    TestScheduler.prototype.createHotObservable = function() {
      var len = arguments.length,
          args;
      if (Array.isArray(arguments[0])) {
        args = arguments[0];
      } else {
        args = new Array(len);
        for (var i = 0; i < len; i++) {
          args[i] = arguments[i];
        }
      }
      return new HotObservable(this, args);
    };
    TestScheduler.prototype.createColdObservable = function() {
      var len = arguments.length,
          args;
      if (Array.isArray(arguments[0])) {
        args = arguments[0];
      } else {
        args = new Array(len);
        for (var i = 0; i < len; i++) {
          args[i] = arguments[i];
        }
      }
      return new ColdObservable(this, args);
    };
    TestScheduler.prototype.createResolvedPromise = function(ticks, value) {
      return new MockPromise(this, [Rx.ReactiveTest.onNext(ticks, value), Rx.ReactiveTest.onCompleted(ticks)]);
    };
    TestScheduler.prototype.createRejectedPromise = function(ticks, reason) {
      return new MockPromise(this, [Rx.ReactiveTest.onError(ticks, reason)]);
    };
    TestScheduler.prototype.createObserver = function() {
      return new MockObserver(this);
    };
    return TestScheduler;
  })(VirtualTimeScheduler);
  return Rx;
}));

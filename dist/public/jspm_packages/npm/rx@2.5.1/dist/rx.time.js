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
      observableDefer = Observable.defer,
      observableEmpty = Observable.empty,
      observableNever = Observable.never,
      observableThrow = Observable.throwException,
      observableFromArray = Observable.fromArray,
      timeoutScheduler = Rx.Scheduler.timeout,
      SingleAssignmentDisposable = Rx.SingleAssignmentDisposable,
      SerialDisposable = Rx.SerialDisposable,
      CompositeDisposable = Rx.CompositeDisposable,
      RefCountDisposable = Rx.RefCountDisposable,
      Subject = Rx.Subject,
      addRef = Rx.internals.addRef,
      normalizeTime = Rx.Scheduler.normalize,
      helpers = Rx.helpers,
      isPromise = helpers.isPromise,
      isScheduler = helpers.isScheduler,
      observableFromPromise = Observable.fromPromise;
  function observableTimerDate(dueTime, scheduler) {
    return new AnonymousObservable(function(observer) {
      return scheduler.scheduleWithAbsolute(dueTime, function() {
        observer.onNext(0);
        observer.onCompleted();
      });
    });
  }
  function observableTimerDateAndPeriod(dueTime, period, scheduler) {
    return new AnonymousObservable(function(observer) {
      var d = dueTime,
          p = normalizeTime(period);
      return scheduler.scheduleRecursiveWithAbsoluteAndState(0, d, function(count, self) {
        if (p > 0) {
          var now = scheduler.now();
          d = d + p;
          d <= now && (d = now + p);
        }
        observer.onNext(count);
        self(count + 1, d);
      });
    });
  }
  function observableTimerTimeSpan(dueTime, scheduler) {
    return new AnonymousObservable(function(observer) {
      return scheduler.scheduleWithRelative(normalizeTime(dueTime), function() {
        observer.onNext(0);
        observer.onCompleted();
      });
    });
  }
  function observableTimerTimeSpanAndPeriod(dueTime, period, scheduler) {
    return dueTime === period ? new AnonymousObservable(function(observer) {
      return scheduler.schedulePeriodicWithState(0, period, function(count) {
        observer.onNext(count);
        return count + 1;
      });
    }) : observableDefer(function() {
      return observableTimerDateAndPeriod(scheduler.now() + dueTime, period, scheduler);
    });
  }
  var observableinterval = Observable.interval = function(period, scheduler) {
    return observableTimerTimeSpanAndPeriod(period, period, isScheduler(scheduler) ? scheduler : timeoutScheduler);
  };
  var observableTimer = Observable.timer = function(dueTime, periodOrScheduler, scheduler) {
    var period;
    isScheduler(scheduler) || (scheduler = timeoutScheduler);
    if (periodOrScheduler !== undefined && typeof periodOrScheduler === 'number') {
      period = periodOrScheduler;
    } else if (isScheduler(periodOrScheduler)) {
      scheduler = periodOrScheduler;
    }
    if (dueTime instanceof Date && period === undefined) {
      return observableTimerDate(dueTime.getTime(), scheduler);
    }
    if (dueTime instanceof Date && period !== undefined) {
      period = periodOrScheduler;
      return observableTimerDateAndPeriod(dueTime.getTime(), period, scheduler);
    }
    return period === undefined ? observableTimerTimeSpan(dueTime, scheduler) : observableTimerTimeSpanAndPeriod(dueTime, period, scheduler);
  };
  function observableDelayTimeSpan(source, dueTime, scheduler) {
    return new AnonymousObservable(function(observer) {
      var active = false,
          cancelable = new SerialDisposable(),
          exception = null,
          q = [],
          running = false,
          subscription;
      subscription = source.materialize().timestamp(scheduler).subscribe(function(notification) {
        var d,
            shouldRun;
        if (notification.value.kind === 'E') {
          q = [];
          q.push(notification);
          exception = notification.value.exception;
          shouldRun = !running;
        } else {
          q.push({
            value: notification.value,
            timestamp: notification.timestamp + dueTime
          });
          shouldRun = !active;
          active = true;
        }
        if (shouldRun) {
          if (exception !== null) {
            observer.onError(exception);
          } else {
            d = new SingleAssignmentDisposable();
            cancelable.setDisposable(d);
            d.setDisposable(scheduler.scheduleRecursiveWithRelative(dueTime, function(self) {
              var e,
                  recurseDueTime,
                  result,
                  shouldRecurse;
              if (exception !== null) {
                return;
              }
              running = true;
              do {
                result = null;
                if (q.length > 0 && q[0].timestamp - scheduler.now() <= 0) {
                  result = q.shift().value;
                }
                if (result !== null) {
                  result.accept(observer);
                }
              } while (result !== null);
              shouldRecurse = false;
              recurseDueTime = 0;
              if (q.length > 0) {
                shouldRecurse = true;
                recurseDueTime = Math.max(0, q[0].timestamp - scheduler.now());
              } else {
                active = false;
              }
              e = exception;
              running = false;
              if (e !== null) {
                observer.onError(e);
              } else if (shouldRecurse) {
                self(recurseDueTime);
              }
            }));
          }
        }
      });
      return new CompositeDisposable(subscription, cancelable);
    }, source);
  }
  function observableDelayDate(source, dueTime, scheduler) {
    return observableDefer(function() {
      return observableDelayTimeSpan(source, dueTime - scheduler.now(), scheduler);
    });
  }
  observableProto.delay = function(dueTime, scheduler) {
    isScheduler(scheduler) || (scheduler = timeoutScheduler);
    return dueTime instanceof Date ? observableDelayDate(this, dueTime.getTime(), scheduler) : observableDelayTimeSpan(this, dueTime, scheduler);
  };
  observableProto.debounce = observableProto.throttleWithTimeout = function(dueTime, scheduler) {
    isScheduler(scheduler) || (scheduler = timeoutScheduler);
    var source = this;
    return new AnonymousObservable(function(observer) {
      var cancelable = new SerialDisposable(),
          hasvalue = false,
          value,
          id = 0;
      var subscription = source.subscribe(function(x) {
        hasvalue = true;
        value = x;
        id++;
        var currentId = id,
            d = new SingleAssignmentDisposable();
        cancelable.setDisposable(d);
        d.setDisposable(scheduler.scheduleWithRelative(dueTime, function() {
          hasvalue && id === currentId && observer.onNext(value);
          hasvalue = false;
        }));
      }, function(e) {
        cancelable.dispose();
        observer.onError(e);
        hasvalue = false;
        id++;
      }, function() {
        cancelable.dispose();
        hasvalue && observer.onNext(value);
        observer.onCompleted();
        hasvalue = false;
        id++;
      });
      return new CompositeDisposable(subscription, cancelable);
    }, this);
  };
  observableProto.throttle = function(dueTime, scheduler) {
    return this.debounce(dueTime, scheduler);
  };
  observableProto.windowWithTime = function(timeSpan, timeShiftOrScheduler, scheduler) {
    var source = this,
        timeShift;
    timeShiftOrScheduler == null && (timeShift = timeSpan);
    isScheduler(scheduler) || (scheduler = timeoutScheduler);
    if (typeof timeShiftOrScheduler === 'number') {
      timeShift = timeShiftOrScheduler;
    } else if (isScheduler(timeShiftOrScheduler)) {
      timeShift = timeSpan;
      scheduler = timeShiftOrScheduler;
    }
    return new AnonymousObservable(function(observer) {
      var groupDisposable,
          nextShift = timeShift,
          nextSpan = timeSpan,
          q = [],
          refCountDisposable,
          timerD = new SerialDisposable(),
          totalTime = 0;
      groupDisposable = new CompositeDisposable(timerD), refCountDisposable = new RefCountDisposable(groupDisposable);
      function createTimer() {
        var m = new SingleAssignmentDisposable(),
            isSpan = false,
            isShift = false;
        timerD.setDisposable(m);
        if (nextSpan === nextShift) {
          isSpan = true;
          isShift = true;
        } else if (nextSpan < nextShift) {
          isSpan = true;
        } else {
          isShift = true;
        }
        var newTotalTime = isSpan ? nextSpan : nextShift,
            ts = newTotalTime - totalTime;
        totalTime = newTotalTime;
        if (isSpan) {
          nextSpan += timeShift;
        }
        if (isShift) {
          nextShift += timeShift;
        }
        m.setDisposable(scheduler.scheduleWithRelative(ts, function() {
          if (isShift) {
            var s = new Subject();
            q.push(s);
            observer.onNext(addRef(s, refCountDisposable));
          }
          isSpan && q.shift().onCompleted();
          createTimer();
        }));
      }
      ;
      q.push(new Subject());
      observer.onNext(addRef(q[0], refCountDisposable));
      createTimer();
      groupDisposable.add(source.subscribe(function(x) {
        for (var i = 0,
            len = q.length; i < len; i++) {
          q[i].onNext(x);
        }
      }, function(e) {
        for (var i = 0,
            len = q.length; i < len; i++) {
          q[i].onError(e);
        }
        observer.onError(e);
      }, function() {
        for (var i = 0,
            len = q.length; i < len; i++) {
          q[i].onCompleted();
        }
        observer.onCompleted();
      }));
      return refCountDisposable;
    }, source);
  };
  observableProto.windowWithTimeOrCount = function(timeSpan, count, scheduler) {
    var source = this;
    isScheduler(scheduler) || (scheduler = timeoutScheduler);
    return new AnonymousObservable(function(observer) {
      var timerD = new SerialDisposable(),
          groupDisposable = new CompositeDisposable(timerD),
          refCountDisposable = new RefCountDisposable(groupDisposable),
          n = 0,
          windowId = 0,
          s = new Subject();
      function createTimer(id) {
        var m = new SingleAssignmentDisposable();
        timerD.setDisposable(m);
        m.setDisposable(scheduler.scheduleWithRelative(timeSpan, function() {
          if (id !== windowId) {
            return;
          }
          n = 0;
          var newId = ++windowId;
          s.onCompleted();
          s = new Subject();
          observer.onNext(addRef(s, refCountDisposable));
          createTimer(newId);
        }));
      }
      observer.onNext(addRef(s, refCountDisposable));
      createTimer(0);
      groupDisposable.add(source.subscribe(function(x) {
        var newId = 0,
            newWindow = false;
        s.onNext(x);
        if (++n === count) {
          newWindow = true;
          n = 0;
          newId = ++windowId;
          s.onCompleted();
          s = new Subject();
          observer.onNext(addRef(s, refCountDisposable));
        }
        newWindow && createTimer(newId);
      }, function(e) {
        s.onError(e);
        observer.onError(e);
      }, function() {
        s.onCompleted();
        observer.onCompleted();
      }));
      return refCountDisposable;
    }, source);
  };
  observableProto.bufferWithTime = function(timeSpan, timeShiftOrScheduler, scheduler) {
    return this.windowWithTime.apply(this, arguments).selectMany(function(x) {
      return x.toArray();
    });
  };
  observableProto.bufferWithTimeOrCount = function(timeSpan, count, scheduler) {
    return this.windowWithTimeOrCount(timeSpan, count, scheduler).selectMany(function(x) {
      return x.toArray();
    });
  };
  observableProto.timeInterval = function(scheduler) {
    var source = this;
    isScheduler(scheduler) || (scheduler = timeoutScheduler);
    return observableDefer(function() {
      var last = scheduler.now();
      return source.map(function(x) {
        var now = scheduler.now(),
            span = now - last;
        last = now;
        return {
          value: x,
          interval: span
        };
      });
    });
  };
  observableProto.timestamp = function(scheduler) {
    isScheduler(scheduler) || (scheduler = timeoutScheduler);
    return this.map(function(x) {
      return {
        value: x,
        timestamp: scheduler.now()
      };
    });
  };
  function sampleObservable(source, sampler) {
    return new AnonymousObservable(function(observer) {
      var atEnd,
          value,
          hasValue;
      function sampleSubscribe() {
        if (hasValue) {
          hasValue = false;
          observer.onNext(value);
        }
        atEnd && observer.onCompleted();
      }
      return new CompositeDisposable(source.subscribe(function(newValue) {
        hasValue = true;
        value = newValue;
      }, observer.onError.bind(observer), function() {
        atEnd = true;
      }), sampler.subscribe(sampleSubscribe, observer.onError.bind(observer), sampleSubscribe));
    }, source);
  }
  observableProto.sample = observableProto.throttleLatest = function(intervalOrSampler, scheduler) {
    isScheduler(scheduler) || (scheduler = timeoutScheduler);
    return typeof intervalOrSampler === 'number' ? sampleObservable(this, observableinterval(intervalOrSampler, scheduler)) : sampleObservable(this, intervalOrSampler);
  };
  observableProto.timeout = function(dueTime, other, scheduler) {
    (other == null || typeof other === 'string') && (other = observableThrow(new Error(other || 'Timeout')));
    isScheduler(scheduler) || (scheduler = timeoutScheduler);
    var source = this,
        schedulerMethod = dueTime instanceof Date ? 'scheduleWithAbsolute' : 'scheduleWithRelative';
    return new AnonymousObservable(function(observer) {
      var id = 0,
          original = new SingleAssignmentDisposable(),
          subscription = new SerialDisposable(),
          switched = false,
          timer = new SerialDisposable();
      subscription.setDisposable(original);
      function createTimer() {
        var myId = id;
        timer.setDisposable(scheduler[schedulerMethod](dueTime, function() {
          if (id === myId) {
            isPromise(other) && (other = observableFromPromise(other));
            subscription.setDisposable(other.subscribe(observer));
          }
        }));
      }
      createTimer();
      original.setDisposable(source.subscribe(function(x) {
        if (!switched) {
          id++;
          observer.onNext(x);
          createTimer();
        }
      }, function(e) {
        if (!switched) {
          id++;
          observer.onError(e);
        }
      }, function() {
        if (!switched) {
          id++;
          observer.onCompleted();
        }
      }));
      return new CompositeDisposable(subscription, timer);
    }, source);
  };
  Observable.generateWithAbsoluteTime = function(initialState, condition, iterate, resultSelector, timeSelector, scheduler) {
    isScheduler(scheduler) || (scheduler = timeoutScheduler);
    return new AnonymousObservable(function(observer) {
      var first = true,
          hasResult = false,
          result,
          state = initialState,
          time;
      return scheduler.scheduleRecursiveWithAbsolute(scheduler.now(), function(self) {
        hasResult && observer.onNext(result);
        try {
          if (first) {
            first = false;
          } else {
            state = iterate(state);
          }
          hasResult = condition(state);
          if (hasResult) {
            result = resultSelector(state);
            time = timeSelector(state);
          }
        } catch (e) {
          observer.onError(e);
          return;
        }
        if (hasResult) {
          self(time);
        } else {
          observer.onCompleted();
        }
      });
    });
  };
  Observable.generateWithRelativeTime = function(initialState, condition, iterate, resultSelector, timeSelector, scheduler) {
    isScheduler(scheduler) || (scheduler = timeoutScheduler);
    return new AnonymousObservable(function(observer) {
      var first = true,
          hasResult = false,
          result,
          state = initialState,
          time;
      return scheduler.scheduleRecursiveWithRelative(0, function(self) {
        hasResult && observer.onNext(result);
        try {
          if (first) {
            first = false;
          } else {
            state = iterate(state);
          }
          hasResult = condition(state);
          if (hasResult) {
            result = resultSelector(state);
            time = timeSelector(state);
          }
        } catch (e) {
          observer.onError(e);
          return;
        }
        if (hasResult) {
          self(time);
        } else {
          observer.onCompleted();
        }
      });
    });
  };
  observableProto.delaySubscription = function(dueTime, scheduler) {
    return this.delayWithSelector(observableTimer(dueTime, isScheduler(scheduler) ? scheduler : timeoutScheduler), observableEmpty);
  };
  observableProto.delayWithSelector = function(subscriptionDelay, delayDurationSelector) {
    var source = this,
        subDelay,
        selector;
    if (typeof subscriptionDelay === 'function') {
      selector = subscriptionDelay;
    } else {
      subDelay = subscriptionDelay;
      selector = delayDurationSelector;
    }
    return new AnonymousObservable(function(observer) {
      var delays = new CompositeDisposable(),
          atEnd = false,
          done = function() {
            if (atEnd && delays.length === 0) {
              observer.onCompleted();
            }
          },
          subscription = new SerialDisposable(),
          start = function() {
            subscription.setDisposable(source.subscribe(function(x) {
              var delay;
              try {
                delay = selector(x);
              } catch (error) {
                observer.onError(error);
                return;
              }
              var d = new SingleAssignmentDisposable();
              delays.add(d);
              d.setDisposable(delay.subscribe(function() {
                observer.onNext(x);
                delays.remove(d);
                done();
              }, observer.onError.bind(observer), function() {
                observer.onNext(x);
                delays.remove(d);
                done();
              }));
            }, observer.onError.bind(observer), function() {
              atEnd = true;
              subscription.dispose();
              done();
            }));
          };
      if (!subDelay) {
        start();
      } else {
        subscription.setDisposable(subDelay.subscribe(start, observer.onError.bind(observer), start));
      }
      return new CompositeDisposable(subscription, delays);
    }, this);
  };
  observableProto.timeoutWithSelector = function(firstTimeout, timeoutdurationSelector, other) {
    if (arguments.length === 1) {
      timeoutdurationSelector = firstTimeout;
      firstTimeout = observableNever();
    }
    other || (other = observableThrow(new Error('Timeout')));
    var source = this;
    return new AnonymousObservable(function(observer) {
      var subscription = new SerialDisposable(),
          timer = new SerialDisposable(),
          original = new SingleAssignmentDisposable();
      subscription.setDisposable(original);
      var id = 0,
          switched = false;
      function setTimer(timeout) {
        var myId = id;
        function timerWins() {
          return id === myId;
        }
        var d = new SingleAssignmentDisposable();
        timer.setDisposable(d);
        d.setDisposable(timeout.subscribe(function() {
          timerWins() && subscription.setDisposable(other.subscribe(observer));
          d.dispose();
        }, function(e) {
          timerWins() && observer.onError(e);
        }, function() {
          timerWins() && subscription.setDisposable(other.subscribe(observer));
        }));
      }
      ;
      setTimer(firstTimeout);
      function observerWins() {
        var res = !switched;
        if (res) {
          id++;
        }
        return res;
      }
      original.setDisposable(source.subscribe(function(x) {
        if (observerWins()) {
          observer.onNext(x);
          var timeout;
          try {
            timeout = timeoutdurationSelector(x);
          } catch (e) {
            observer.onError(e);
            return;
          }
          setTimer(isPromise(timeout) ? observableFromPromise(timeout) : timeout);
        }
      }, function(e) {
        observerWins() && observer.onError(e);
      }, function() {
        observerWins() && observer.onCompleted();
      }));
      return new CompositeDisposable(subscription, timer);
    }, source);
  };
  observableProto.debounceWithSelector = function(durationSelector) {
    var source = this;
    return new AnonymousObservable(function(observer) {
      var value,
          hasValue = false,
          cancelable = new SerialDisposable(),
          id = 0;
      var subscription = source.subscribe(function(x) {
        var throttle;
        try {
          throttle = durationSelector(x);
        } catch (e) {
          observer.onError(e);
          return;
        }
        isPromise(throttle) && (throttle = observableFromPromise(throttle));
        hasValue = true;
        value = x;
        id++;
        var currentid = id,
            d = new SingleAssignmentDisposable();
        cancelable.setDisposable(d);
        d.setDisposable(throttle.subscribe(function() {
          hasValue && id === currentid && observer.onNext(value);
          hasValue = false;
          d.dispose();
        }, observer.onError.bind(observer), function() {
          hasValue && id === currentid && observer.onNext(value);
          hasValue = false;
          d.dispose();
        }));
      }, function(e) {
        cancelable.dispose();
        observer.onError(e);
        hasValue = false;
        id++;
      }, function() {
        cancelable.dispose();
        hasValue && observer.onNext(value);
        observer.onCompleted();
        hasValue = false;
        id++;
      });
      return new CompositeDisposable(subscription, cancelable);
    }, source);
  };
  observableProto.throttleWithSelector = function(durationSelector) {
    return this.debounceWithSelector(durationSelector);
  };
  observableProto.skipLastWithTime = function(duration, scheduler) {
    isScheduler(scheduler) || (scheduler = timeoutScheduler);
    var source = this;
    return new AnonymousObservable(function(o) {
      var q = [];
      return source.subscribe(function(x) {
        var now = scheduler.now();
        q.push({
          interval: now,
          value: x
        });
        while (q.length > 0 && now - q[0].interval >= duration) {
          o.onNext(q.shift().value);
        }
      }, function(e) {
        o.onError(e);
      }, function() {
        var now = scheduler.now();
        while (q.length > 0 && now - q[0].interval >= duration) {
          o.onNext(q.shift().value);
        }
        o.onCompleted();
      });
    }, source);
  };
  observableProto.takeLastWithTime = function(duration, scheduler) {
    var source = this;
    isScheduler(scheduler) || (scheduler = timeoutScheduler);
    return new AnonymousObservable(function(o) {
      var q = [];
      return source.subscribe(function(x) {
        var now = scheduler.now();
        q.push({
          interval: now,
          value: x
        });
        while (q.length > 0 && now - q[0].interval >= duration) {
          q.shift();
        }
      }, function(e) {
        o.onError(e);
      }, function() {
        var now = scheduler.now();
        while (q.length > 0) {
          var next = q.shift();
          if (now - next.interval <= duration) {
            o.onNext(next.value);
          }
        }
        o.onCompleted();
      });
    }, source);
  };
  observableProto.takeLastBufferWithTime = function(duration, scheduler) {
    var source = this;
    isScheduler(scheduler) || (scheduler = timeoutScheduler);
    return new AnonymousObservable(function(o) {
      var q = [];
      return source.subscribe(function(x) {
        var now = scheduler.now();
        q.push({
          interval: now,
          value: x
        });
        while (q.length > 0 && now - q[0].interval >= duration) {
          q.shift();
        }
      }, function(e) {
        o.onError(e);
      }, function() {
        var now = scheduler.now(),
            res = [];
        while (q.length > 0) {
          var next = q.shift();
          now - next.interval <= duration && res.push(next.value);
        }
        o.onNext(res);
        o.onCompleted();
      });
    }, source);
  };
  observableProto.takeWithTime = function(duration, scheduler) {
    var source = this;
    isScheduler(scheduler) || (scheduler = timeoutScheduler);
    return new AnonymousObservable(function(o) {
      return new CompositeDisposable(scheduler.scheduleWithRelative(duration, function() {
        o.onCompleted();
      }), source.subscribe(o));
    }, source);
  };
  observableProto.skipWithTime = function(duration, scheduler) {
    var source = this;
    isScheduler(scheduler) || (scheduler = timeoutScheduler);
    return new AnonymousObservable(function(observer) {
      var open = false;
      return new CompositeDisposable(scheduler.scheduleWithRelative(duration, function() {
        open = true;
      }), source.subscribe(function(x) {
        open && observer.onNext(x);
      }, observer.onError.bind(observer), observer.onCompleted.bind(observer)));
    }, source);
  };
  observableProto.skipUntilWithTime = function(startTime, scheduler) {
    isScheduler(scheduler) || (scheduler = timeoutScheduler);
    var source = this,
        schedulerMethod = startTime instanceof Date ? 'scheduleWithAbsolute' : 'scheduleWithRelative';
    return new AnonymousObservable(function(o) {
      var open = false;
      return new CompositeDisposable(scheduler[schedulerMethod](startTime, function() {
        open = true;
      }), source.subscribe(function(x) {
        open && o.onNext(x);
      }, function(e) {
        o.onError(e);
      }, function() {
        o.onCompleted();
      }));
    }, source);
  };
  observableProto.takeUntilWithTime = function(endTime, scheduler) {
    isScheduler(scheduler) || (scheduler = timeoutScheduler);
    var source = this,
        schedulerMethod = endTime instanceof Date ? 'scheduleWithAbsolute' : 'scheduleWithRelative';
    return new AnonymousObservable(function(o) {
      return new CompositeDisposable(scheduler[schedulerMethod](endTime, function() {
        o.onCompleted();
      }), source.subscribe(o));
    }, source);
  };
  observableProto.throttleFirst = function(windowDuration, scheduler) {
    isScheduler(scheduler) || (scheduler = timeoutScheduler);
    var duration = +windowDuration || 0;
    if (duration <= 0) {
      throw new RangeError('windowDuration cannot be less or equal zero.');
    }
    var source = this;
    return new AnonymousObservable(function(o) {
      var lastOnNext = 0;
      return source.subscribe(function(x) {
        var now = scheduler.now();
        if (lastOnNext === 0 || now - lastOnNext >= duration) {
          lastOnNext = now;
          o.onNext(x);
        }
      }, function(e) {
        o.onError(e);
      }, function() {
        o.onCompleted();
      });
    }, source);
  };
  return Rx;
}));

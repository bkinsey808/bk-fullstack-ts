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
  var Scheduler = Rx.Scheduler,
      PriorityQueue = Rx.internals.PriorityQueue,
      ScheduledItem = Rx.internals.ScheduledItem,
      SchedulePeriodicRecursive = Rx.internals.SchedulePeriodicRecursive,
      disposableEmpty = Rx.Disposable.empty,
      inherits = Rx.internals.inherits,
      defaultSubComparer = Rx.helpers.defaultSubComparer,
      notImplemented = Rx.helpers.notImplemented;
  Rx.VirtualTimeScheduler = (function(__super__) {
    function localNow() {
      return this.toDateTimeOffset(this.clock);
    }
    function scheduleNow(state, action) {
      return this.scheduleAbsoluteWithState(state, this.clock, action);
    }
    function scheduleRelative(state, dueTime, action) {
      return this.scheduleRelativeWithState(state, this.toRelative(dueTime), action);
    }
    function scheduleAbsolute(state, dueTime, action) {
      return this.scheduleRelativeWithState(state, this.toRelative(dueTime - this.now()), action);
    }
    function invokeAction(scheduler, action) {
      action();
      return disposableEmpty;
    }
    inherits(VirtualTimeScheduler, __super__);
    function VirtualTimeScheduler(initialClock, comparer) {
      this.clock = initialClock;
      this.comparer = comparer;
      this.isEnabled = false;
      this.queue = new PriorityQueue(1024);
      __super__.call(this, localNow, scheduleNow, scheduleRelative, scheduleAbsolute);
    }
    var VirtualTimeSchedulerPrototype = VirtualTimeScheduler.prototype;
    VirtualTimeSchedulerPrototype.add = notImplemented;
    VirtualTimeSchedulerPrototype.toDateTimeOffset = notImplemented;
    VirtualTimeSchedulerPrototype.toRelative = notImplemented;
    VirtualTimeSchedulerPrototype.schedulePeriodicWithState = function(state, period, action) {
      var s = new SchedulePeriodicRecursive(this, state, period, action);
      return s.start();
    };
    VirtualTimeSchedulerPrototype.scheduleRelativeWithState = function(state, dueTime, action) {
      var runAt = this.add(this.clock, dueTime);
      return this.scheduleAbsoluteWithState(state, runAt, action);
    };
    VirtualTimeSchedulerPrototype.scheduleRelative = function(dueTime, action) {
      return this.scheduleRelativeWithState(action, dueTime, invokeAction);
    };
    VirtualTimeSchedulerPrototype.start = function() {
      if (!this.isEnabled) {
        this.isEnabled = true;
        do {
          var next = this.getNext();
          if (next !== null) {
            this.comparer(next.dueTime, this.clock) > 0 && (this.clock = next.dueTime);
            next.invoke();
          } else {
            this.isEnabled = false;
          }
        } while (this.isEnabled);
      }
    };
    VirtualTimeSchedulerPrototype.stop = function() {
      this.isEnabled = false;
    };
    VirtualTimeSchedulerPrototype.advanceTo = function(time) {
      var dueToClock = this.comparer(this.clock, time);
      if (this.comparer(this.clock, time) > 0) {
        throw new ArgumentOutOfRangeError();
      }
      if (dueToClock === 0) {
        return;
      }
      if (!this.isEnabled) {
        this.isEnabled = true;
        do {
          var next = this.getNext();
          if (next !== null && this.comparer(next.dueTime, time) <= 0) {
            this.comparer(next.dueTime, this.clock) > 0 && (this.clock = next.dueTime);
            next.invoke();
          } else {
            this.isEnabled = false;
          }
        } while (this.isEnabled);
        this.clock = time;
      }
    };
    VirtualTimeSchedulerPrototype.advanceBy = function(time) {
      var dt = this.add(this.clock, time),
          dueToClock = this.comparer(this.clock, dt);
      if (dueToClock > 0) {
        throw new ArgumentOutOfRangeError();
      }
      if (dueToClock === 0) {
        return;
      }
      this.advanceTo(dt);
    };
    VirtualTimeSchedulerPrototype.sleep = function(time) {
      var dt = this.add(this.clock, time);
      if (this.comparer(this.clock, dt) >= 0) {
        throw new ArgumentOutOfRangeError();
      }
      this.clock = dt;
    };
    VirtualTimeSchedulerPrototype.getNext = function() {
      while (this.queue.length > 0) {
        var next = this.queue.peek();
        if (next.isCancelled()) {
          this.queue.dequeue();
        } else {
          return next;
        }
      }
      return null;
    };
    VirtualTimeSchedulerPrototype.scheduleAbsolute = function(dueTime, action) {
      return this.scheduleAbsoluteWithState(action, dueTime, invokeAction);
    };
    VirtualTimeSchedulerPrototype.scheduleAbsoluteWithState = function(state, dueTime, action) {
      var self = this;
      function run(scheduler, state1) {
        self.queue.remove(si);
        return action(scheduler, state1);
      }
      var si = new ScheduledItem(this, state, run, dueTime, this.comparer);
      this.queue.enqueue(si);
      return si.disposable;
    };
    return VirtualTimeScheduler;
  }(Scheduler));
  Rx.HistoricalScheduler = (function(__super__) {
    inherits(HistoricalScheduler, __super__);
    function HistoricalScheduler(initialClock, comparer) {
      var clock = initialClock == null ? 0 : initialClock;
      var cmp = comparer || defaultSubComparer;
      __super__.call(this, clock, cmp);
    }
    var HistoricalSchedulerProto = HistoricalScheduler.prototype;
    HistoricalSchedulerProto.add = function(absolute, relative) {
      return absolute + relative;
    };
    HistoricalSchedulerProto.toDateTimeOffset = function(absolute) {
      return new Date(absolute).getTime();
    };
    HistoricalSchedulerProto.toRelative = function(timeSpan) {
      return timeSpan;
    };
    return HistoricalScheduler;
  }(Rx.VirtualTimeScheduler));
  return Rx;
}));

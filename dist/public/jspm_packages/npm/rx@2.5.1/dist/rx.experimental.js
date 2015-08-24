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
      observableConcat = Observable.concat,
      observableDefer = Observable.defer,
      observableEmpty = Observable.empty,
      disposableEmpty = Rx.Disposable.empty,
      CompositeDisposable = Rx.CompositeDisposable,
      SerialDisposable = Rx.SerialDisposable,
      SingleAssignmentDisposable = Rx.SingleAssignmentDisposable,
      Enumerator = Rx.internals.Enumerator,
      Enumerable = Rx.internals.Enumerable,
      enumerableOf = Enumerable.of,
      immediateScheduler = Rx.Scheduler.immediate,
      currentThreadScheduler = Rx.Scheduler.currentThread,
      slice = Array.prototype.slice,
      AsyncSubject = Rx.AsyncSubject,
      Observer = Rx.Observer,
      inherits = Rx.internals.inherits,
      bindCallback = Rx.internals.bindCallback,
      addProperties = Rx.internals.addProperties,
      helpers = Rx.helpers,
      noop = helpers.noop,
      isPromise = helpers.isPromise,
      isScheduler = helpers.isScheduler,
      observableFromPromise = Observable.fromPromise;
  var $iterator$ = (typeof Symbol === 'function' && Symbol.iterator) || '_es6shim_iterator_';
  if (root.Set && typeof new root.Set()['@@iterator'] === 'function') {
    $iterator$ = '@@iterator';
  }
  var doneEnumerator = Rx.doneEnumerator = {
    done: true,
    value: undefined
  };
  var isIterable = Rx.helpers.isIterable = function(o) {
    return o[$iterator$] !== undefined;
  };
  var isArrayLike = Rx.helpers.isArrayLike = function(o) {
    return o && o.length !== undefined;
  };
  Rx.helpers.iterator = $iterator$;
  function enumerableWhile(condition, source) {
    return new Enumerable(function() {
      return new Enumerator(function() {
        return condition() ? {
          done: false,
          value: source
        } : {
          done: true,
          value: undefined
        };
      });
    });
  }
  observableProto.letBind = observableProto['let'] = function(func) {
    return func(this);
  };
  Observable['if'] = Observable.ifThen = function(condition, thenSource, elseSourceOrScheduler) {
    return observableDefer(function() {
      elseSourceOrScheduler || (elseSourceOrScheduler = observableEmpty());
      isPromise(thenSource) && (thenSource = observableFromPromise(thenSource));
      isPromise(elseSourceOrScheduler) && (elseSourceOrScheduler = observableFromPromise(elseSourceOrScheduler));
      typeof elseSourceOrScheduler.now === 'function' && (elseSourceOrScheduler = observableEmpty(elseSourceOrScheduler));
      return condition() ? thenSource : elseSourceOrScheduler;
    });
  };
  Observable['for'] = Observable.forIn = function(sources, resultSelector, thisArg) {
    return enumerableOf(sources, resultSelector, thisArg).concat();
  };
  var observableWhileDo = Observable['while'] = Observable.whileDo = function(condition, source) {
    isPromise(source) && (source = observableFromPromise(source));
    return enumerableWhile(condition, source).concat();
  };
  observableProto.doWhile = function(condition) {
    return observableConcat([this, observableWhileDo(condition, this)]);
  };
  Observable['case'] = Observable.switchCase = function(selector, sources, defaultSourceOrScheduler) {
    return observableDefer(function() {
      isPromise(defaultSourceOrScheduler) && (defaultSourceOrScheduler = observableFromPromise(defaultSourceOrScheduler));
      defaultSourceOrScheduler || (defaultSourceOrScheduler = observableEmpty());
      typeof defaultSourceOrScheduler.now === 'function' && (defaultSourceOrScheduler = observableEmpty(defaultSourceOrScheduler));
      var result = sources[selector()];
      isPromise(result) && (result = observableFromPromise(result));
      return result || defaultSourceOrScheduler;
    });
  };
  observableProto.expand = function(selector, scheduler) {
    isScheduler(scheduler) || (scheduler = immediateScheduler);
    var source = this;
    return new AnonymousObservable(function(observer) {
      var q = [],
          m = new SerialDisposable(),
          d = new CompositeDisposable(m),
          activeCount = 0,
          isAcquired = false;
      var ensureActive = function() {
        var isOwner = false;
        if (q.length > 0) {
          isOwner = !isAcquired;
          isAcquired = true;
        }
        if (isOwner) {
          m.setDisposable(scheduler.scheduleRecursive(function(self) {
            var work;
            if (q.length > 0) {
              work = q.shift();
            } else {
              isAcquired = false;
              return;
            }
            var m1 = new SingleAssignmentDisposable();
            d.add(m1);
            m1.setDisposable(work.subscribe(function(x) {
              observer.onNext(x);
              var result = null;
              try {
                result = selector(x);
              } catch (e) {
                observer.onError(e);
              }
              q.push(result);
              activeCount++;
              ensureActive();
            }, observer.onError.bind(observer), function() {
              d.remove(m1);
              activeCount--;
              if (activeCount === 0) {
                observer.onCompleted();
              }
            }));
            self();
          }));
        }
      };
      q.push(source);
      activeCount++;
      ensureActive();
      return d;
    }, this);
  };
  Observable.forkJoin = function() {
    var allSources = [];
    if (Array.isArray(arguments[0])) {
      allSources = arguments[0];
    } else {
      for (var i = 0,
          len = arguments.length; i < len; i++) {
        allSources.push(arguments[i]);
      }
    }
    return new AnonymousObservable(function(subscriber) {
      var count = allSources.length;
      if (count === 0) {
        subscriber.onCompleted();
        return disposableEmpty;
      }
      var group = new CompositeDisposable(),
          finished = false,
          hasResults = new Array(count),
          hasCompleted = new Array(count),
          results = new Array(count);
      for (var idx = 0; idx < count; idx++) {
        (function(i) {
          var source = allSources[i];
          isPromise(source) && (source = observableFromPromise(source));
          group.add(source.subscribe(function(value) {
            if (!finished) {
              hasResults[i] = true;
              results[i] = value;
            }
          }, function(e) {
            finished = true;
            subscriber.onError(e);
            group.dispose();
          }, function() {
            if (!finished) {
              if (!hasResults[i]) {
                subscriber.onCompleted();
                return;
              }
              hasCompleted[i] = true;
              for (var ix = 0; ix < count; ix++) {
                if (!hasCompleted[ix]) {
                  return;
                }
              }
              finished = true;
              subscriber.onNext(results);
              subscriber.onCompleted();
            }
          }));
        })(idx);
      }
      return group;
    });
  };
  observableProto.forkJoin = function(second, resultSelector) {
    var first = this;
    return new AnonymousObservable(function(observer) {
      var leftStopped = false,
          rightStopped = false,
          hasLeft = false,
          hasRight = false,
          lastLeft,
          lastRight,
          leftSubscription = new SingleAssignmentDisposable(),
          rightSubscription = new SingleAssignmentDisposable();
      isPromise(second) && (second = observableFromPromise(second));
      leftSubscription.setDisposable(first.subscribe(function(left) {
        hasLeft = true;
        lastLeft = left;
      }, function(err) {
        rightSubscription.dispose();
        observer.onError(err);
      }, function() {
        leftStopped = true;
        if (rightStopped) {
          if (!hasLeft) {
            observer.onCompleted();
          } else if (!hasRight) {
            observer.onCompleted();
          } else {
            var result;
            try {
              result = resultSelector(lastLeft, lastRight);
            } catch (e) {
              observer.onError(e);
              return;
            }
            observer.onNext(result);
            observer.onCompleted();
          }
        }
      }));
      rightSubscription.setDisposable(second.subscribe(function(right) {
        hasRight = true;
        lastRight = right;
      }, function(err) {
        leftSubscription.dispose();
        observer.onError(err);
      }, function() {
        rightStopped = true;
        if (leftStopped) {
          if (!hasLeft) {
            observer.onCompleted();
          } else if (!hasRight) {
            observer.onCompleted();
          } else {
            var result;
            try {
              result = resultSelector(lastLeft, lastRight);
            } catch (e) {
              observer.onError(e);
              return;
            }
            observer.onNext(result);
            observer.onCompleted();
          }
        }
      }));
      return new CompositeDisposable(leftSubscription, rightSubscription);
    }, first);
  };
  observableProto.manySelect = function(selector, scheduler) {
    isScheduler(scheduler) || (scheduler = immediateScheduler);
    var source = this;
    return observableDefer(function() {
      var chain;
      return source.map(function(x) {
        var curr = new ChainObservable(x);
        chain && chain.onNext(x);
        chain = curr;
        return curr;
      }).tap(noop, function(e) {
        chain && chain.onError(e);
      }, function() {
        chain && chain.onCompleted();
      }).observeOn(scheduler).map(selector);
    }, source);
  };
  var ChainObservable = (function(__super__) {
    function subscribe(observer) {
      var self = this,
          g = new CompositeDisposable();
      g.add(currentThreadScheduler.schedule(function() {
        observer.onNext(self.head);
        g.add(self.tail.mergeAll().subscribe(observer));
      }));
      return g;
    }
    inherits(ChainObservable, __super__);
    function ChainObservable(head) {
      __super__.call(this, subscribe);
      this.head = head;
      this.tail = new AsyncSubject();
    }
    addProperties(ChainObservable.prototype, Observer, {
      onCompleted: function() {
        this.onNext(Observable.empty());
      },
      onError: function(e) {
        this.onNext(Observable.throwError(e));
      },
      onNext: function(v) {
        this.tail.onNext(v);
        this.tail.onCompleted();
      }
    });
    return ChainObservable;
  }(Observable));
  observableProto.exclusive = function() {
    var sources = this;
    return new AnonymousObservable(function(observer) {
      var hasCurrent = false,
          isStopped = false,
          m = new SingleAssignmentDisposable(),
          g = new CompositeDisposable();
      g.add(m);
      m.setDisposable(sources.subscribe(function(innerSource) {
        if (!hasCurrent) {
          hasCurrent = true;
          isPromise(innerSource) && (innerSource = observableFromPromise(innerSource));
          var innerSubscription = new SingleAssignmentDisposable();
          g.add(innerSubscription);
          innerSubscription.setDisposable(innerSource.subscribe(observer.onNext.bind(observer), observer.onError.bind(observer), function() {
            g.remove(innerSubscription);
            hasCurrent = false;
            if (isStopped && g.length === 1) {
              observer.onCompleted();
            }
          }));
        }
      }, observer.onError.bind(observer), function() {
        isStopped = true;
        if (!hasCurrent && g.length === 1) {
          observer.onCompleted();
        }
      }));
      return g;
    }, this);
  };
  observableProto.exclusiveMap = function(selector, thisArg) {
    var sources = this,
        selectorFunc = bindCallback(selector, thisArg, 3);
    return new AnonymousObservable(function(observer) {
      var index = 0,
          hasCurrent = false,
          isStopped = true,
          m = new SingleAssignmentDisposable(),
          g = new CompositeDisposable();
      g.add(m);
      m.setDisposable(sources.subscribe(function(innerSource) {
        if (!hasCurrent) {
          hasCurrent = true;
          innerSubscription = new SingleAssignmentDisposable();
          g.add(innerSubscription);
          isPromise(innerSource) && (innerSource = observableFromPromise(innerSource));
          innerSubscription.setDisposable(innerSource.subscribe(function(x) {
            var result;
            try {
              result = selectorFunc(x, index++, innerSource);
            } catch (e) {
              observer.onError(e);
              return;
            }
            observer.onNext(result);
          }, function(e) {
            observer.onError(e);
          }, function() {
            g.remove(innerSubscription);
            hasCurrent = false;
            if (isStopped && g.length === 1) {
              observer.onCompleted();
            }
          }));
        }
      }, function(e) {
        observer.onError(e);
      }, function() {
        isStopped = true;
        if (g.length === 1 && !hasCurrent) {
          observer.onCompleted();
        }
      }));
      return g;
    }, this);
  };
  return Rx;
}));

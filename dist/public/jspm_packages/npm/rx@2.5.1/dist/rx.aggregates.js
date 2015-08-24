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
      CompositeDisposable = Rx.CompositeDisposable,
      AnonymousObservable = Rx.AnonymousObservable,
      disposableEmpty = Rx.Disposable.empty,
      isEqual = Rx.internals.isEqual,
      helpers = Rx.helpers,
      not = helpers.not,
      defaultComparer = helpers.defaultComparer,
      identity = helpers.identity,
      defaultSubComparer = helpers.defaultSubComparer,
      isFunction = helpers.isFunction,
      isPromise = helpers.isPromise,
      isArrayLike = helpers.isArrayLike,
      isIterable = helpers.isIterable,
      observableFromPromise = Observable.fromPromise,
      observableFrom = Observable.from,
      bindCallback = Rx.internals.bindCallback,
      EmptyError = Rx.EmptyError,
      ArgumentOutOfRangeError = Rx.ArgumentOutOfRangeError;
  function extremaBy(source, keySelector, comparer) {
    return new AnonymousObservable(function(o) {
      var hasValue = false,
          lastKey = null,
          list = [];
      return source.subscribe(function(x) {
        var comparison,
            key;
        try {
          key = keySelector(x);
        } catch (ex) {
          o.onError(ex);
          return;
        }
        comparison = 0;
        if (!hasValue) {
          hasValue = true;
          lastKey = key;
        } else {
          try {
            comparison = comparer(key, lastKey);
          } catch (ex1) {
            o.onError(ex1);
            return;
          }
        }
        if (comparison > 0) {
          lastKey = key;
          list = [];
        }
        if (comparison >= 0) {
          list.push(x);
        }
      }, function(e) {
        o.onError(e);
      }, function() {
        o.onNext(list);
        o.onCompleted();
      });
    }, source);
  }
  function firstOnly(x) {
    if (x.length === 0) {
      throw new EmptyError();
    }
    return x[0];
  }
  observableProto.aggregate = function() {
    var hasSeed = false,
        accumulator,
        seed,
        source = this;
    if (arguments.length === 2) {
      hasSeed = true;
      seed = arguments[0];
      accumulator = arguments[1];
    } else {
      accumulator = arguments[0];
    }
    return new AnonymousObservable(function(o) {
      var hasAccumulation,
          accumulation,
          hasValue;
      return source.subscribe(function(x) {
        !hasValue && (hasValue = true);
        try {
          if (hasAccumulation) {
            accumulation = accumulator(accumulation, x);
          } else {
            accumulation = hasSeed ? accumulator(seed, x) : x;
            hasAccumulation = true;
          }
        } catch (e) {
          return o.onError(e);
        }
      }, function(e) {
        o.onError(e);
      }, function() {
        hasValue && o.onNext(accumulation);
        !hasValue && hasSeed && o.onNext(seed);
        !hasValue && !hasSeed && o.onError(new EmptyError());
        o.onCompleted();
      });
    }, source);
  };
  observableProto.reduce = function(accumulator) {
    var hasSeed = false,
        seed,
        source = this;
    if (arguments.length === 2) {
      hasSeed = true;
      seed = arguments[1];
    }
    return new AnonymousObservable(function(o) {
      var hasAccumulation,
          accumulation,
          hasValue;
      return source.subscribe(function(x) {
        !hasValue && (hasValue = true);
        try {
          if (hasAccumulation) {
            accumulation = accumulator(accumulation, x);
          } else {
            accumulation = hasSeed ? accumulator(seed, x) : x;
            hasAccumulation = true;
          }
        } catch (e) {
          return o.onError(e);
        }
      }, function(e) {
        o.onError(e);
      }, function() {
        hasValue && o.onNext(accumulation);
        !hasValue && hasSeed && o.onNext(seed);
        !hasValue && !hasSeed && o.onError(new EmptyError());
        o.onCompleted();
      });
    }, source);
  };
  observableProto.some = function(predicate, thisArg) {
    var source = this;
    return predicate ? source.filter(predicate, thisArg).some() : new AnonymousObservable(function(observer) {
      return source.subscribe(function() {
        observer.onNext(true);
        observer.onCompleted();
      }, function(e) {
        observer.onError(e);
      }, function() {
        observer.onNext(false);
        observer.onCompleted();
      });
    }, source);
  };
  observableProto.any = function() {
    return this.some.apply(this, arguments);
  };
  observableProto.isEmpty = function() {
    return this.any().map(not);
  };
  observableProto.every = function(predicate, thisArg) {
    return this.filter(function(v) {
      return !predicate(v);
    }, thisArg).some().map(not);
  };
  observableProto.all = function() {
    return this.every.apply(this, arguments);
  };
  observableProto.includes = function(searchElement, fromIndex) {
    var source = this;
    function comparer(a, b) {
      return (a === 0 && b === 0) || (a === b || (isNaN(a) && isNaN(b)));
    }
    return new AnonymousObservable(function(o) {
      var i = 0,
          n = +fromIndex || 0;
      Math.abs(n) === Infinity && (n = 0);
      if (n < 0) {
        o.onNext(false);
        o.onCompleted();
        return disposableEmpty;
      }
      return source.subscribe(function(x) {
        if (i++ >= n && comparer(x, searchElement)) {
          o.onNext(true);
          o.onCompleted();
        }
      }, function(e) {
        o.onError(e);
      }, function() {
        o.onNext(false);
        o.onCompleted();
      });
    }, this);
  };
  observableProto.contains = function(searchElement, fromIndex) {
    observableProto.includes(searchElement, fromIndex);
  };
  observableProto.count = function(predicate, thisArg) {
    return predicate ? this.filter(predicate, thisArg).count() : this.reduce(function(count) {
      return count + 1;
    }, 0);
  };
  observableProto.indexOf = function(searchElement, fromIndex) {
    var source = this;
    return new AnonymousObservable(function(o) {
      var i = 0,
          n = +fromIndex || 0;
      Math.abs(n) === Infinity && (n = 0);
      if (n < 0) {
        o.onNext(-1);
        o.onCompleted();
        return disposableEmpty;
      }
      return source.subscribe(function(x) {
        if (i >= n && x === searchElement) {
          o.onNext(i);
          o.onCompleted();
        }
        i++;
      }, function(e) {
        o.onError(e);
      }, function() {
        o.onNext(-1);
        o.onCompleted();
      });
    }, source);
  };
  observableProto.sum = function(keySelector, thisArg) {
    return keySelector && isFunction(keySelector) ? this.map(keySelector, thisArg).sum() : this.reduce(function(prev, curr) {
      return prev + curr;
    }, 0);
  };
  observableProto.minBy = function(keySelector, comparer) {
    comparer || (comparer = defaultSubComparer);
    return extremaBy(this, keySelector, function(x, y) {
      return comparer(x, y) * -1;
    });
  };
  observableProto.min = function(comparer) {
    return this.minBy(identity, comparer).map(function(x) {
      return firstOnly(x);
    });
  };
  observableProto.maxBy = function(keySelector, comparer) {
    comparer || (comparer = defaultSubComparer);
    return extremaBy(this, keySelector, comparer);
  };
  observableProto.max = function(comparer) {
    return this.maxBy(identity, comparer).map(function(x) {
      return firstOnly(x);
    });
  };
  observableProto.average = function(keySelector, thisArg) {
    return keySelector && isFunction(keySelector) ? this.map(keySelector, thisArg).average() : this.reduce(function(prev, cur) {
      return {
        sum: prev.sum + cur,
        count: prev.count + 1
      };
    }, {
      sum: 0,
      count: 0
    }).map(function(s) {
      if (s.count === 0) {
        throw new EmptyError();
      }
      return s.sum / s.count;
    });
  };
  observableProto.sequenceEqual = function(second, comparer) {
    var first = this;
    comparer || (comparer = defaultComparer);
    return new AnonymousObservable(function(o) {
      var donel = false,
          doner = false,
          ql = [],
          qr = [];
      var subscription1 = first.subscribe(function(x) {
        var equal,
            v;
        if (qr.length > 0) {
          v = qr.shift();
          try {
            equal = comparer(v, x);
          } catch (e) {
            o.onError(e);
            return;
          }
          if (!equal) {
            o.onNext(false);
            o.onCompleted();
          }
        } else if (doner) {
          o.onNext(false);
          o.onCompleted();
        } else {
          ql.push(x);
        }
      }, function(e) {
        o.onError(e);
      }, function() {
        donel = true;
        if (ql.length === 0) {
          if (qr.length > 0) {
            o.onNext(false);
            o.onCompleted();
          } else if (doner) {
            o.onNext(true);
            o.onCompleted();
          }
        }
      });
      (isArrayLike(second) || isIterable(second)) && (second = observableFrom(second));
      isPromise(second) && (second = observableFromPromise(second));
      var subscription2 = second.subscribe(function(x) {
        var equal;
        if (ql.length > 0) {
          var v = ql.shift();
          try {
            equal = comparer(v, x);
          } catch (exception) {
            o.onError(exception);
            return;
          }
          if (!equal) {
            o.onNext(false);
            o.onCompleted();
          }
        } else if (donel) {
          o.onNext(false);
          o.onCompleted();
        } else {
          qr.push(x);
        }
      }, function(e) {
        o.onError(e);
      }, function() {
        doner = true;
        if (qr.length === 0) {
          if (ql.length > 0) {
            o.onNext(false);
            o.onCompleted();
          } else if (donel) {
            o.onNext(true);
            o.onCompleted();
          }
        }
      });
      return new CompositeDisposable(subscription1, subscription2);
    }, first);
  };
  function elementAtOrDefault(source, index, hasDefault, defaultValue) {
    if (index < 0) {
      throw new ArgumentOutOfRangeError();
    }
    return new AnonymousObservable(function(o) {
      var i = index;
      return source.subscribe(function(x) {
        if (i-- === 0) {
          o.onNext(x);
          o.onCompleted();
        }
      }, function(e) {
        o.onError(e);
      }, function() {
        if (!hasDefault) {
          o.onError(new ArgumentOutOfRangeError());
        } else {
          o.onNext(defaultValue);
          o.onCompleted();
        }
      });
    }, source);
  }
  observableProto.elementAt = function(index) {
    return elementAtOrDefault(this, index, false);
  };
  observableProto.elementAtOrDefault = function(index, defaultValue) {
    return elementAtOrDefault(this, index, true, defaultValue);
  };
  function singleOrDefaultAsync(source, hasDefault, defaultValue) {
    return new AnonymousObservable(function(o) {
      var value = defaultValue,
          seenValue = false;
      return source.subscribe(function(x) {
        if (seenValue) {
          o.onError(new Error('Sequence contains more than one element'));
        } else {
          value = x;
          seenValue = true;
        }
      }, function(e) {
        o.onError(e);
      }, function() {
        if (!seenValue && !hasDefault) {
          o.onError(new EmptyError());
        } else {
          o.onNext(value);
          o.onCompleted();
        }
      });
    }, source);
  }
  observableProto.single = function(predicate, thisArg) {
    return predicate && isFunction(predicate) ? this.where(predicate, thisArg).single() : singleOrDefaultAsync(this, false);
  };
  observableProto.singleOrDefault = function(predicate, defaultValue, thisArg) {
    return predicate && isFunction(predicate) ? this.filter(predicate, thisArg).singleOrDefault(null, defaultValue) : singleOrDefaultAsync(this, true, defaultValue);
  };
  function firstOrDefaultAsync(source, hasDefault, defaultValue) {
    return new AnonymousObservable(function(o) {
      return source.subscribe(function(x) {
        o.onNext(x);
        o.onCompleted();
      }, function(e) {
        o.onError(e);
      }, function() {
        if (!hasDefault) {
          o.onError(new EmptyError());
        } else {
          o.onNext(defaultValue);
          o.onCompleted();
        }
      });
    }, source);
  }
  observableProto.first = function(predicate, thisArg) {
    return predicate ? this.where(predicate, thisArg).first() : firstOrDefaultAsync(this, false);
  };
  observableProto.firstOrDefault = function(predicate, defaultValue, thisArg) {
    return predicate ? this.where(predicate).firstOrDefault(null, defaultValue) : firstOrDefaultAsync(this, true, defaultValue);
  };
  function lastOrDefaultAsync(source, hasDefault, defaultValue) {
    return new AnonymousObservable(function(o) {
      var value = defaultValue,
          seenValue = false;
      return source.subscribe(function(x) {
        value = x;
        seenValue = true;
      }, function(e) {
        o.onError(e);
      }, function() {
        if (!seenValue && !hasDefault) {
          o.onError(new EmptyError());
        } else {
          o.onNext(value);
          o.onCompleted();
        }
      });
    }, source);
  }
  observableProto.last = function(predicate, thisArg) {
    return predicate ? this.where(predicate, thisArg).last() : lastOrDefaultAsync(this, false);
  };
  observableProto.lastOrDefault = function(predicate, defaultValue, thisArg) {
    return predicate ? this.where(predicate, thisArg).lastOrDefault(null, defaultValue) : lastOrDefaultAsync(this, true, defaultValue);
  };
  function findValue(source, predicate, thisArg, yieldIndex) {
    var callback = bindCallback(predicate, thisArg, 3);
    return new AnonymousObservable(function(o) {
      var i = 0;
      return source.subscribe(function(x) {
        var shouldRun;
        try {
          shouldRun = callback(x, i, source);
        } catch (e) {
          o.onError(e);
          return;
        }
        if (shouldRun) {
          o.onNext(yieldIndex ? i : x);
          o.onCompleted();
        } else {
          i++;
        }
      }, function(e) {
        o.onError(e);
      }, function() {
        o.onNext(yieldIndex ? -1 : undefined);
        o.onCompleted();
      });
    }, source);
  }
  observableProto.find = function(predicate, thisArg) {
    return findValue(this, predicate, thisArg, false);
  };
  observableProto.findIndex = function(predicate, thisArg) {
    return findValue(this, predicate, thisArg, true);
  };
  observableProto.toSet = function() {
    if (typeof root.Set === 'undefined') {
      throw new TypeError();
    }
    var source = this;
    return new AnonymousObservable(function(o) {
      var s = new root.Set();
      return source.subscribe(function(x) {
        s.add(x);
      }, function(e) {
        o.onError(e);
      }, function() {
        o.onNext(s);
        o.onCompleted();
      });
    }, source);
  };
  observableProto.toMap = function(keySelector, elementSelector) {
    if (typeof root.Map === 'undefined') {
      throw new TypeError();
    }
    var source = this;
    return new AnonymousObservable(function(o) {
      var m = new root.Map();
      return source.subscribe(function(x) {
        var key;
        try {
          key = keySelector(x);
        } catch (e) {
          o.onError(e);
          return;
        }
        var element = x;
        if (elementSelector) {
          try {
            element = elementSelector(x);
          } catch (e) {
            o.onError(e);
            return;
          }
        }
        m.set(key, element);
      }, function(e) {
        o.onError(e);
      }, function() {
        o.onNext(m);
        o.onCompleted();
      });
    }, source);
  };
  return Rx;
}));

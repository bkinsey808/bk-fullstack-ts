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
      CompositeDisposable = Rx.CompositeDisposable,
      RefCountDisposable = Rx.RefCountDisposable,
      SingleAssignmentDisposable = Rx.SingleAssignmentDisposable,
      SerialDisposable = Rx.SerialDisposable,
      Subject = Rx.Subject,
      observableProto = Observable.prototype,
      observableEmpty = Observable.empty,
      observableNever = Observable.never,
      AnonymousObservable = Rx.AnonymousObservable,
      observerCreate = Rx.Observer.create,
      addRef = Rx.internals.addRef,
      defaultComparer = Rx.internals.isEqual,
      inherits = Rx.internals.inherits,
      noop = Rx.helpers.noop,
      identity = Rx.helpers.identity,
      isPromise = Rx.helpers.isPromise,
      observableFromPromise = Observable.fromPromise,
      ArgumentOutOfRangeError = Rx.ArgumentOutOfRangeError;
  var Dictionary = (function() {
    var primes = [1, 3, 7, 13, 31, 61, 127, 251, 509, 1021, 2039, 4093, 8191, 16381, 32749, 65521, 131071, 262139, 524287, 1048573, 2097143, 4194301, 8388593, 16777213, 33554393, 67108859, 134217689, 268435399, 536870909, 1073741789, 2147483647],
        noSuchkey = "no such key",
        duplicatekey = "duplicate key";
    function isPrime(candidate) {
      if ((candidate & 1) === 0) {
        return candidate === 2;
      }
      var num1 = Math.sqrt(candidate),
          num2 = 3;
      while (num2 <= num1) {
        if (candidate % num2 === 0) {
          return false;
        }
        num2 += 2;
      }
      return true;
    }
    function getPrime(min) {
      var index,
          num,
          candidate;
      for (index = 0; index < primes.length; ++index) {
        num = primes[index];
        if (num >= min) {
          return num;
        }
      }
      candidate = min | 1;
      while (candidate < primes[primes.length - 1]) {
        if (isPrime(candidate)) {
          return candidate;
        }
        candidate += 2;
      }
      return min;
    }
    function stringHashFn(str) {
      var hash = 757602046;
      if (!str.length) {
        return hash;
      }
      for (var i = 0,
          len = str.length; i < len; i++) {
        var character = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + character;
        hash = hash & hash;
      }
      return hash;
    }
    function numberHashFn(key) {
      var c2 = 0x27d4eb2d;
      key = (key ^ 61) ^ (key >>> 16);
      key = key + (key << 3);
      key = key ^ (key >>> 4);
      key = key * c2;
      key = key ^ (key >>> 15);
      return key;
    }
    var getHashCode = (function() {
      var uniqueIdCounter = 0;
      return function(obj) {
        if (obj == null) {
          throw new Error(noSuchkey);
        }
        if (typeof obj === 'string') {
          return stringHashFn(obj);
        }
        if (typeof obj === 'number') {
          return numberHashFn(obj);
        }
        if (typeof obj === 'boolean') {
          return obj === true ? 1 : 0;
        }
        if (obj instanceof Date) {
          return numberHashFn(obj.valueOf());
        }
        if (obj instanceof RegExp) {
          return stringHashFn(obj.toString());
        }
        if (typeof obj.valueOf === 'function') {
          var valueOf = obj.valueOf();
          if (typeof valueOf === 'number') {
            return numberHashFn(valueOf);
          }
          if (typeof valueOf === 'string') {
            return stringHashFn(valueOf);
          }
        }
        if (obj.hashCode) {
          return obj.hashCode();
        }
        var id = 17 * uniqueIdCounter++;
        obj.hashCode = function() {
          return id;
        };
        return id;
      };
    }());
    function newEntry() {
      return {
        key: null,
        value: null,
        next: 0,
        hashCode: 0
      };
    }
    function Dictionary(capacity, comparer) {
      if (capacity < 0) {
        throw new ArgumentOutOfRangeError();
      }
      if (capacity > 0) {
        this._initialize(capacity);
      }
      this.comparer = comparer || defaultComparer;
      this.freeCount = 0;
      this.size = 0;
      this.freeList = -1;
    }
    var dictionaryProto = Dictionary.prototype;
    dictionaryProto._initialize = function(capacity) {
      var prime = getPrime(capacity),
          i;
      this.buckets = new Array(prime);
      this.entries = new Array(prime);
      for (i = 0; i < prime; i++) {
        this.buckets[i] = -1;
        this.entries[i] = newEntry();
      }
      this.freeList = -1;
    };
    dictionaryProto.add = function(key, value) {
      this._insert(key, value, true);
    };
    dictionaryProto._insert = function(key, value, add) {
      if (!this.buckets) {
        this._initialize(0);
      }
      var index3,
          num = getHashCode(key) & 2147483647,
          index1 = num % this.buckets.length;
      for (var index2 = this.buckets[index1]; index2 >= 0; index2 = this.entries[index2].next) {
        if (this.entries[index2].hashCode === num && this.comparer(this.entries[index2].key, key)) {
          if (add) {
            throw new Error(duplicatekey);
          }
          this.entries[index2].value = value;
          return;
        }
      }
      if (this.freeCount > 0) {
        index3 = this.freeList;
        this.freeList = this.entries[index3].next;
        --this.freeCount;
      } else {
        if (this.size === this.entries.length) {
          this._resize();
          index1 = num % this.buckets.length;
        }
        index3 = this.size;
        ++this.size;
      }
      this.entries[index3].hashCode = num;
      this.entries[index3].next = this.buckets[index1];
      this.entries[index3].key = key;
      this.entries[index3].value = value;
      this.buckets[index1] = index3;
    };
    dictionaryProto._resize = function() {
      var prime = getPrime(this.size * 2),
          numArray = new Array(prime);
      for (index = 0; index < numArray.length; ++index) {
        numArray[index] = -1;
      }
      var entryArray = new Array(prime);
      for (index = 0; index < this.size; ++index) {
        entryArray[index] = this.entries[index];
      }
      for (var index = this.size; index < prime; ++index) {
        entryArray[index] = newEntry();
      }
      for (var index1 = 0; index1 < this.size; ++index1) {
        var index2 = entryArray[index1].hashCode % prime;
        entryArray[index1].next = numArray[index2];
        numArray[index2] = index1;
      }
      this.buckets = numArray;
      this.entries = entryArray;
    };
    dictionaryProto.remove = function(key) {
      if (this.buckets) {
        var num = getHashCode(key) & 2147483647,
            index1 = num % this.buckets.length,
            index2 = -1;
        for (var index3 = this.buckets[index1]; index3 >= 0; index3 = this.entries[index3].next) {
          if (this.entries[index3].hashCode === num && this.comparer(this.entries[index3].key, key)) {
            if (index2 < 0) {
              this.buckets[index1] = this.entries[index3].next;
            } else {
              this.entries[index2].next = this.entries[index3].next;
            }
            this.entries[index3].hashCode = -1;
            this.entries[index3].next = this.freeList;
            this.entries[index3].key = null;
            this.entries[index3].value = null;
            this.freeList = index3;
            ++this.freeCount;
            return true;
          } else {
            index2 = index3;
          }
        }
      }
      return false;
    };
    dictionaryProto.clear = function() {
      var index,
          len;
      if (this.size <= 0) {
        return;
      }
      for (index = 0, len = this.buckets.length; index < len; ++index) {
        this.buckets[index] = -1;
      }
      for (index = 0; index < this.size; ++index) {
        this.entries[index] = newEntry();
      }
      this.freeList = -1;
      this.size = 0;
    };
    dictionaryProto._findEntry = function(key) {
      if (this.buckets) {
        var num = getHashCode(key) & 2147483647;
        for (var index = this.buckets[num % this.buckets.length]; index >= 0; index = this.entries[index].next) {
          if (this.entries[index].hashCode === num && this.comparer(this.entries[index].key, key)) {
            return index;
          }
        }
      }
      return -1;
    };
    dictionaryProto.count = function() {
      return this.size - this.freeCount;
    };
    dictionaryProto.tryGetValue = function(key) {
      var entry = this._findEntry(key);
      return entry >= 0 ? this.entries[entry].value : undefined;
    };
    dictionaryProto.getValues = function() {
      var index = 0,
          results = [];
      if (this.entries) {
        for (var index1 = 0; index1 < this.size; index1++) {
          if (this.entries[index1].hashCode >= 0) {
            results[index++] = this.entries[index1].value;
          }
        }
      }
      return results;
    };
    dictionaryProto.get = function(key) {
      var entry = this._findEntry(key);
      if (entry >= 0) {
        return this.entries[entry].value;
      }
      throw new Error(noSuchkey);
    };
    dictionaryProto.set = function(key, value) {
      this._insert(key, value, false);
    };
    dictionaryProto.containskey = function(key) {
      return this._findEntry(key) >= 0;
    };
    return Dictionary;
  }());
  observableProto.join = function(right, leftDurationSelector, rightDurationSelector, resultSelector) {
    var left = this;
    return new AnonymousObservable(function(observer) {
      var group = new CompositeDisposable();
      var leftDone = false,
          rightDone = false;
      var leftId = 0,
          rightId = 0;
      var leftMap = new Dictionary(),
          rightMap = new Dictionary();
      group.add(left.subscribe(function(value) {
        var id = leftId++;
        var md = new SingleAssignmentDisposable();
        leftMap.add(id, value);
        group.add(md);
        var expire = function() {
          leftMap.remove(id) && leftMap.count() === 0 && leftDone && observer.onCompleted();
          group.remove(md);
        };
        var duration;
        try {
          duration = leftDurationSelector(value);
        } catch (e) {
          observer.onError(e);
          return;
        }
        md.setDisposable(duration.take(1).subscribe(noop, observer.onError.bind(observer), expire));
        rightMap.getValues().forEach(function(v) {
          var result;
          try {
            result = resultSelector(value, v);
          } catch (exn) {
            observer.onError(exn);
            return;
          }
          observer.onNext(result);
        });
      }, observer.onError.bind(observer), function() {
        leftDone = true;
        (rightDone || leftMap.count() === 0) && observer.onCompleted();
      }));
      group.add(right.subscribe(function(value) {
        var id = rightId++;
        var md = new SingleAssignmentDisposable();
        rightMap.add(id, value);
        group.add(md);
        var expire = function() {
          rightMap.remove(id) && rightMap.count() === 0 && rightDone && observer.onCompleted();
          group.remove(md);
        };
        var duration;
        try {
          duration = rightDurationSelector(value);
        } catch (e) {
          observer.onError(e);
          return;
        }
        md.setDisposable(duration.take(1).subscribe(noop, observer.onError.bind(observer), expire));
        leftMap.getValues().forEach(function(v) {
          var result;
          try {
            result = resultSelector(v, value);
          } catch (exn) {
            observer.onError(exn);
            return;
          }
          observer.onNext(result);
        });
      }, observer.onError.bind(observer), function() {
        rightDone = true;
        (leftDone || rightMap.count() === 0) && observer.onCompleted();
      }));
      return group;
    }, left);
  };
  observableProto.groupJoin = function(right, leftDurationSelector, rightDurationSelector, resultSelector) {
    var left = this;
    return new AnonymousObservable(function(observer) {
      var group = new CompositeDisposable();
      var r = new RefCountDisposable(group);
      var leftMap = new Dictionary(),
          rightMap = new Dictionary();
      var leftId = 0,
          rightId = 0;
      function handleError(e) {
        return function(v) {
          v.onError(e);
        };
      }
      ;
      group.add(left.subscribe(function(value) {
        var s = new Subject();
        var id = leftId++;
        leftMap.add(id, s);
        var result;
        try {
          result = resultSelector(value, addRef(s, r));
        } catch (e) {
          leftMap.getValues().forEach(handleError(e));
          observer.onError(e);
          return;
        }
        observer.onNext(result);
        rightMap.getValues().forEach(function(v) {
          s.onNext(v);
        });
        var md = new SingleAssignmentDisposable();
        group.add(md);
        var expire = function() {
          leftMap.remove(id) && s.onCompleted();
          group.remove(md);
        };
        var duration;
        try {
          duration = leftDurationSelector(value);
        } catch (e) {
          leftMap.getValues().forEach(handleError(e));
          observer.onError(e);
          return;
        }
        md.setDisposable(duration.take(1).subscribe(noop, function(e) {
          leftMap.getValues().forEach(handleError(e));
          observer.onError(e);
        }, expire));
      }, function(e) {
        leftMap.getValues().forEach(handleError(e));
        observer.onError(e);
      }, observer.onCompleted.bind(observer)));
      group.add(right.subscribe(function(value) {
        var id = rightId++;
        rightMap.add(id, value);
        var md = new SingleAssignmentDisposable();
        group.add(md);
        var expire = function() {
          rightMap.remove(id);
          group.remove(md);
        };
        var duration;
        try {
          duration = rightDurationSelector(value);
        } catch (e) {
          leftMap.getValues().forEach(handleError(e));
          observer.onError(e);
          return;
        }
        md.setDisposable(duration.take(1).subscribe(noop, function(e) {
          leftMap.getValues().forEach(handleError(e));
          observer.onError(e);
        }, expire));
        leftMap.getValues().forEach(function(v) {
          v.onNext(value);
        });
      }, function(e) {
        leftMap.getValues().forEach(handleError(e));
        observer.onError(e);
      }));
      return r;
    }, left);
  };
  observableProto.buffer = function(bufferOpeningsOrClosingSelector, bufferClosingSelector) {
    return this.window.apply(this, arguments).selectMany(function(x) {
      return x.toArray();
    });
  };
  observableProto.window = function(windowOpeningsOrClosingSelector, windowClosingSelector) {
    if (arguments.length === 1 && typeof arguments[0] !== 'function') {
      return observableWindowWithBoundaries.call(this, windowOpeningsOrClosingSelector);
    }
    return typeof windowOpeningsOrClosingSelector === 'function' ? observableWindowWithClosingSelector.call(this, windowOpeningsOrClosingSelector) : observableWindowWithOpenings.call(this, windowOpeningsOrClosingSelector, windowClosingSelector);
  };
  function observableWindowWithOpenings(windowOpenings, windowClosingSelector) {
    return windowOpenings.groupJoin(this, windowClosingSelector, observableEmpty, function(_, win) {
      return win;
    });
  }
  function observableWindowWithBoundaries(windowBoundaries) {
    var source = this;
    return new AnonymousObservable(function(observer) {
      var win = new Subject(),
          d = new CompositeDisposable(),
          r = new RefCountDisposable(d);
      observer.onNext(addRef(win, r));
      d.add(source.subscribe(function(x) {
        win.onNext(x);
      }, function(err) {
        win.onError(err);
        observer.onError(err);
      }, function() {
        win.onCompleted();
        observer.onCompleted();
      }));
      isPromise(windowBoundaries) && (windowBoundaries = observableFromPromise(windowBoundaries));
      d.add(windowBoundaries.subscribe(function(w) {
        win.onCompleted();
        win = new Subject();
        observer.onNext(addRef(win, r));
      }, function(err) {
        win.onError(err);
        observer.onError(err);
      }, function() {
        win.onCompleted();
        observer.onCompleted();
      }));
      return r;
    }, source);
  }
  function observableWindowWithClosingSelector(windowClosingSelector) {
    var source = this;
    return new AnonymousObservable(function(observer) {
      var m = new SerialDisposable(),
          d = new CompositeDisposable(m),
          r = new RefCountDisposable(d),
          win = new Subject();
      observer.onNext(addRef(win, r));
      d.add(source.subscribe(function(x) {
        win.onNext(x);
      }, function(err) {
        win.onError(err);
        observer.onError(err);
      }, function() {
        win.onCompleted();
        observer.onCompleted();
      }));
      function createWindowClose() {
        var windowClose;
        try {
          windowClose = windowClosingSelector();
        } catch (e) {
          observer.onError(e);
          return;
        }
        isPromise(windowClose) && (windowClose = observableFromPromise(windowClose));
        var m1 = new SingleAssignmentDisposable();
        m.setDisposable(m1);
        m1.setDisposable(windowClose.take(1).subscribe(noop, function(err) {
          win.onError(err);
          observer.onError(err);
        }, function() {
          win.onCompleted();
          win = new Subject();
          observer.onNext(addRef(win, r));
          createWindowClose();
        }));
      }
      createWindowClose();
      return r;
    }, source);
  }
  observableProto.pairwise = function() {
    var source = this;
    return new AnonymousObservable(function(observer) {
      var previous,
          hasPrevious = false;
      return source.subscribe(function(x) {
        if (hasPrevious) {
          observer.onNext([previous, x]);
        } else {
          hasPrevious = true;
        }
        previous = x;
      }, observer.onError.bind(observer), observer.onCompleted.bind(observer));
    }, source);
  };
  observableProto.partition = function(predicate, thisArg) {
    return [this.filter(predicate, thisArg), this.filter(function(x, i, o) {
      return !predicate.call(thisArg, x, i, o);
    })];
  };
  observableProto.groupBy = function(keySelector, elementSelector, comparer) {
    return this.groupByUntil(keySelector, elementSelector, observableNever, comparer);
  };
  observableProto.groupByUntil = function(keySelector, elementSelector, durationSelector, comparer) {
    var source = this;
    elementSelector || (elementSelector = identity);
    comparer || (comparer = defaultComparer);
    return new AnonymousObservable(function(observer) {
      function handleError(e) {
        return function(item) {
          item.onError(e);
        };
      }
      var map = new Dictionary(0, comparer),
          groupDisposable = new CompositeDisposable(),
          refCountDisposable = new RefCountDisposable(groupDisposable);
      groupDisposable.add(source.subscribe(function(x) {
        var key;
        try {
          key = keySelector(x);
        } catch (e) {
          map.getValues().forEach(handleError(e));
          observer.onError(e);
          return;
        }
        var fireNewMapEntry = false,
            writer = map.tryGetValue(key);
        if (!writer) {
          writer = new Subject();
          map.set(key, writer);
          fireNewMapEntry = true;
        }
        if (fireNewMapEntry) {
          var group = new GroupedObservable(key, writer, refCountDisposable),
              durationGroup = new GroupedObservable(key, writer);
          try {
            duration = durationSelector(durationGroup);
          } catch (e) {
            map.getValues().forEach(handleError(e));
            observer.onError(e);
            return;
          }
          observer.onNext(group);
          var md = new SingleAssignmentDisposable();
          groupDisposable.add(md);
          var expire = function() {
            map.remove(key) && writer.onCompleted();
            groupDisposable.remove(md);
          };
          md.setDisposable(duration.take(1).subscribe(noop, function(exn) {
            map.getValues().forEach(handleError(exn));
            observer.onError(exn);
          }, expire));
        }
        var element;
        try {
          element = elementSelector(x);
        } catch (e) {
          map.getValues().forEach(handleError(e));
          observer.onError(e);
          return;
        }
        writer.onNext(element);
      }, function(ex) {
        map.getValues().forEach(handleError(ex));
        observer.onError(ex);
      }, function() {
        map.getValues().forEach(function(item) {
          item.onCompleted();
        });
        observer.onCompleted();
      }));
      return refCountDisposable;
    }, source);
  };
  var GroupedObservable = (function(__super__) {
    inherits(GroupedObservable, __super__);
    function subscribe(observer) {
      return this.underlyingObservable.subscribe(observer);
    }
    function GroupedObservable(key, underlyingObservable, mergedDisposable) {
      __super__.call(this, subscribe);
      this.key = key;
      this.underlyingObservable = !mergedDisposable ? underlyingObservable : new AnonymousObservable(function(observer) {
        return new CompositeDisposable(mergedDisposable.getDisposable(), underlyingObservable.subscribe(observer));
      });
    }
    return GroupedObservable;
  }(Observable));
  return Rx;
}));

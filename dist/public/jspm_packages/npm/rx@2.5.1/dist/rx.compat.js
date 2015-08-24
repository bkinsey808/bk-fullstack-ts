/* */ 
"format cjs";
(function(process) {
  ;
  (function(undefined) {
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
    var Rx = {
      internals: {},
      config: {Promise: root.Promise},
      helpers: {}
    };
    var noop = Rx.helpers.noop = function() {},
        notDefined = Rx.helpers.notDefined = function(x) {
          return typeof x === 'undefined';
        },
        isScheduler = Rx.helpers.isScheduler = function(x) {
          return x instanceof Rx.Scheduler;
        },
        identity = Rx.helpers.identity = function(x) {
          return x;
        },
        pluck = Rx.helpers.pluck = function(property) {
          return function(x) {
            return x[property];
          };
        },
        just = Rx.helpers.just = function(value) {
          return function() {
            return value;
          };
        },
        defaultNow = Rx.helpers.defaultNow = (function() {
          return !!Date.now ? Date.now : function() {
            return +new Date;
          };
        }()),
        defaultComparer = Rx.helpers.defaultComparer = function(x, y) {
          return isEqual(x, y);
        },
        defaultSubComparer = Rx.helpers.defaultSubComparer = function(x, y) {
          return x > y ? 1 : (x < y ? -1 : 0);
        },
        defaultKeySerializer = Rx.helpers.defaultKeySerializer = function(x) {
          return x.toString();
        },
        defaultError = Rx.helpers.defaultError = function(err) {
          throw err;
        },
        isPromise = Rx.helpers.isPromise = function(p) {
          return !!p && typeof p.then === 'function';
        },
        asArray = Rx.helpers.asArray = function() {
          return Array.prototype.slice.call(arguments);
        },
        not = Rx.helpers.not = function(a) {
          return !a;
        },
        isFunction = Rx.helpers.isFunction = (function() {
          var isFn = function(value) {
            return typeof value == 'function' || false;
          };
          if (isFn(/x/)) {
            isFn = function(value) {
              return typeof value == 'function' && toString.call(value) == '[object Function]';
            };
          }
          return isFn;
        }());
    function cloneArray(arr) {
      var len = arr.length,
          a = new Array(len);
      for (var i = 0; i < len; i++) {
        a[i] = arr[i];
      }
      return a;
    }
    Rx.config.longStackSupport = false;
    var hasStacks = false;
    try {
      throw new Error();
    } catch (e) {
      hasStacks = !!e.stack;
    }
    var rStartingLine = captureLine(),
        rFileName;
    var STACK_JUMP_SEPARATOR = "From previous event:";
    function makeStackTraceLong(error, observable) {
      if (hasStacks && observable.stack && typeof error === "object" && error !== null && error.stack && error.stack.indexOf(STACK_JUMP_SEPARATOR) === -1) {
        var stacks = [];
        for (var o = observable; !!o; o = o.source) {
          if (o.stack) {
            stacks.unshift(o.stack);
          }
        }
        stacks.unshift(error.stack);
        var concatedStacks = stacks.join("\n" + STACK_JUMP_SEPARATOR + "\n");
        error.stack = filterStackString(concatedStacks);
      }
    }
    function filterStackString(stackString) {
      var lines = stackString.split("\n"),
          desiredLines = [];
      for (var i = 0,
          len = lines.length; i < len; i++) {
        var line = lines[i];
        if (!isInternalFrame(line) && !isNodeFrame(line) && line) {
          desiredLines.push(line);
        }
      }
      return desiredLines.join("\n");
    }
    function isInternalFrame(stackLine) {
      var fileNameAndLineNumber = getFileNameAndLineNumber(stackLine);
      if (!fileNameAndLineNumber) {
        return false;
      }
      var fileName = fileNameAndLineNumber[0],
          lineNumber = fileNameAndLineNumber[1];
      return fileName === rFileName && lineNumber >= rStartingLine && lineNumber <= rEndingLine;
    }
    function isNodeFrame(stackLine) {
      return stackLine.indexOf("(module.js:") !== -1 || stackLine.indexOf("(node.js:") !== -1;
    }
    function captureLine() {
      if (!hasStacks) {
        return;
      }
      try {
        throw new Error();
      } catch (e) {
        var lines = e.stack.split("\n");
        var firstLine = lines[0].indexOf("@") > 0 ? lines[1] : lines[2];
        var fileNameAndLineNumber = getFileNameAndLineNumber(firstLine);
        if (!fileNameAndLineNumber) {
          return;
        }
        rFileName = fileNameAndLineNumber[0];
        return fileNameAndLineNumber[1];
      }
    }
    function getFileNameAndLineNumber(stackLine) {
      var attempt1 = /at .+ \((.+):(\d+):(?:\d+)\)$/.exec(stackLine);
      if (attempt1) {
        return [attempt1[1], Number(attempt1[2])];
      }
      var attempt2 = /at ([^ ]+):(\d+):(?:\d+)$/.exec(stackLine);
      if (attempt2) {
        return [attempt2[1], Number(attempt2[2])];
      }
      var attempt3 = /.*@(.+):(\d+)$/.exec(stackLine);
      if (attempt3) {
        return [attempt3[1], Number(attempt3[2])];
      }
    }
    var EmptyError = Rx.EmptyError = function() {
      this.message = 'Sequence contains no elements.';
      Error.call(this);
    };
    EmptyError.prototype = Error.prototype;
    var ObjectDisposedError = Rx.ObjectDisposedError = function() {
      this.message = 'Object has been disposed';
      Error.call(this);
    };
    ObjectDisposedError.prototype = Error.prototype;
    var ArgumentOutOfRangeError = Rx.ArgumentOutOfRangeError = function() {
      this.message = 'Argument out of range';
      Error.call(this);
    };
    ArgumentOutOfRangeError.prototype = Error.prototype;
    var NotSupportedError = Rx.NotSupportedError = function(message) {
      this.message = message || 'This operation is not supported';
      Error.call(this);
    };
    NotSupportedError.prototype = Error.prototype;
    var NotImplementedError = Rx.NotImplementedError = function(message) {
      this.message = message || 'This operation is not implemented';
      Error.call(this);
    };
    NotImplementedError.prototype = Error.prototype;
    var notImplemented = Rx.helpers.notImplemented = function() {
      throw new NotImplementedError();
    };
    var notSupported = Rx.helpers.notSupported = function() {
      throw new NotSupportedError();
    };
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
    var bindCallback = Rx.internals.bindCallback = function(func, thisArg, argCount) {
      if (typeof thisArg === 'undefined') {
        return func;
      }
      switch (argCount) {
        case 0:
          return function() {
            return func.call(thisArg);
          };
        case 1:
          return function(arg) {
            return func.call(thisArg, arg);
          };
        case 2:
          return function(value, index) {
            return func.call(thisArg, value, index);
          };
        case 3:
          return function(value, index, collection) {
            return func.call(thisArg, value, index, collection);
          };
      }
      return function() {
        return func.apply(thisArg, arguments);
      };
    };
    var dontEnums = ['toString', 'toLocaleString', 'valueOf', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable', 'constructor'],
        dontEnumsLength = dontEnums.length;
    var argsClass = '[object Arguments]',
        arrayClass = '[object Array]',
        boolClass = '[object Boolean]',
        dateClass = '[object Date]',
        errorClass = '[object Error]',
        funcClass = '[object Function]',
        numberClass = '[object Number]',
        objectClass = '[object Object]',
        regexpClass = '[object RegExp]',
        stringClass = '[object String]';
    var toString = Object.prototype.toString,
        hasOwnProperty = Object.prototype.hasOwnProperty,
        supportsArgsClass = toString.call(arguments) == argsClass,
        supportNodeClass,
        errorProto = Error.prototype,
        objectProto = Object.prototype,
        stringProto = String.prototype,
        propertyIsEnumerable = objectProto.propertyIsEnumerable;
    try {
      supportNodeClass = !(toString.call(document) == objectClass && !({'toString': 0} + ''));
    } catch (e) {
      supportNodeClass = true;
    }
    var nonEnumProps = {};
    nonEnumProps[arrayClass] = nonEnumProps[dateClass] = nonEnumProps[numberClass] = {
      'constructor': true,
      'toLocaleString': true,
      'toString': true,
      'valueOf': true
    };
    nonEnumProps[boolClass] = nonEnumProps[stringClass] = {
      'constructor': true,
      'toString': true,
      'valueOf': true
    };
    nonEnumProps[errorClass] = nonEnumProps[funcClass] = nonEnumProps[regexpClass] = {
      'constructor': true,
      'toString': true
    };
    nonEnumProps[objectClass] = {'constructor': true};
    var support = {};
    (function() {
      var ctor = function() {
        this.x = 1;
      },
          props = [];
      ctor.prototype = {
        'valueOf': 1,
        'y': 1
      };
      for (var key in new ctor) {
        props.push(key);
      }
      for (key in arguments) {}
      support.enumErrorProps = propertyIsEnumerable.call(errorProto, 'message') || propertyIsEnumerable.call(errorProto, 'name');
      support.enumPrototypes = propertyIsEnumerable.call(ctor, 'prototype');
      support.nonEnumArgs = key != 0;
      support.nonEnumShadows = !/valueOf/.test(props);
    }(1));
    var isObject = Rx.internals.isObject = function(value) {
      var type = typeof value;
      return value && (type == 'function' || type == 'object') || false;
    };
    function keysIn(object) {
      var result = [];
      if (!isObject(object)) {
        return result;
      }
      if (support.nonEnumArgs && object.length && isArguments(object)) {
        object = slice.call(object);
      }
      var skipProto = support.enumPrototypes && typeof object == 'function',
          skipErrorProps = support.enumErrorProps && (object === errorProto || object instanceof Error);
      for (var key in object) {
        if (!(skipProto && key == 'prototype') && !(skipErrorProps && (key == 'message' || key == 'name'))) {
          result.push(key);
        }
      }
      if (support.nonEnumShadows && object !== objectProto) {
        var ctor = object.constructor,
            index = -1,
            length = dontEnumsLength;
        if (object === (ctor && ctor.prototype)) {
          var className = object === stringProto ? stringClass : object === errorProto ? errorClass : toString.call(object),
              nonEnum = nonEnumProps[className];
        }
        while (++index < length) {
          key = dontEnums[index];
          if (!(nonEnum && nonEnum[key]) && hasOwnProperty.call(object, key)) {
            result.push(key);
          }
        }
      }
      return result;
    }
    function internalFor(object, callback, keysFunc) {
      var index = -1,
          props = keysFunc(object),
          length = props.length;
      while (++index < length) {
        var key = props[index];
        if (callback(object[key], key, object) === false) {
          break;
        }
      }
      return object;
    }
    function internalForIn(object, callback) {
      return internalFor(object, callback, keysIn);
    }
    function isNode(value) {
      return typeof value.toString != 'function' && typeof(value + '') == 'string';
    }
    var isArguments = function(value) {
      return (value && typeof value == 'object') ? toString.call(value) == argsClass : false;
    };
    if (!supportsArgsClass) {
      isArguments = function(value) {
        return (value && typeof value == 'object') ? hasOwnProperty.call(value, 'callee') : false;
      };
    }
    var isEqual = Rx.internals.isEqual = function(x, y) {
      return deepEquals(x, y, [], []);
    };
    function deepEquals(a, b, stackA, stackB) {
      if (a === b) {
        return a !== 0 || (1 / a == 1 / b);
      }
      var type = typeof a,
          otherType = typeof b;
      if (a === a && (a == null || b == null || (type != 'function' && type != 'object' && otherType != 'function' && otherType != 'object'))) {
        return false;
      }
      var className = toString.call(a),
          otherClass = toString.call(b);
      if (className == argsClass) {
        className = objectClass;
      }
      if (otherClass == argsClass) {
        otherClass = objectClass;
      }
      if (className != otherClass) {
        return false;
      }
      switch (className) {
        case boolClass:
        case dateClass:
          return +a == +b;
        case numberClass:
          return (a != +a) ? b != +b : (a == 0 ? (1 / a == 1 / b) : a == +b);
        case regexpClass:
        case stringClass:
          return a == String(b);
      }
      var isArr = className == arrayClass;
      if (!isArr) {
        if (className != objectClass || (!support.nodeClass && (isNode(a) || isNode(b)))) {
          return false;
        }
        var ctorA = !support.argsObject && isArguments(a) ? Object : a.constructor,
            ctorB = !support.argsObject && isArguments(b) ? Object : b.constructor;
        if (ctorA != ctorB && !(hasOwnProperty.call(a, 'constructor') && hasOwnProperty.call(b, 'constructor')) && !(isFunction(ctorA) && ctorA instanceof ctorA && isFunction(ctorB) && ctorB instanceof ctorB) && ('constructor' in a && 'constructor' in b)) {
          return false;
        }
      }
      var initedStack = !stackA;
      stackA || (stackA = []);
      stackB || (stackB = []);
      var length = stackA.length;
      while (length--) {
        if (stackA[length] == a) {
          return stackB[length] == b;
        }
      }
      var size = 0;
      var result = true;
      stackA.push(a);
      stackB.push(b);
      if (isArr) {
        length = a.length;
        size = b.length;
        result = size == length;
        if (result) {
          while (size--) {
            var index = length,
                value = b[size];
            if (!(result = deepEquals(a[size], value, stackA, stackB))) {
              break;
            }
          }
        }
      } else {
        internalForIn(b, function(value, key, b) {
          if (hasOwnProperty.call(b, key)) {
            size++;
            return (result = hasOwnProperty.call(a, key) && deepEquals(a[key], value, stackA, stackB));
          }
        });
        if (result) {
          internalForIn(a, function(value, key, a) {
            if (hasOwnProperty.call(a, key)) {
              return (result = --size > -1);
            }
          });
        }
      }
      stackA.pop();
      stackB.pop();
      return result;
    }
    var hasProp = {}.hasOwnProperty,
        slice = Array.prototype.slice;
    var inherits = this.inherits = Rx.internals.inherits = function(child, parent) {
      function __() {
        this.constructor = child;
      }
      __.prototype = parent.prototype;
      child.prototype = new __();
    };
    var addProperties = Rx.internals.addProperties = function(obj) {
      for (var sources = [],
          i = 1,
          len = arguments.length; i < len; i++) {
        sources.push(arguments[i]);
      }
      for (var idx = 0,
          ln = sources.length; idx < ln; idx++) {
        var source = sources[idx];
        for (var prop in source) {
          obj[prop] = source[prop];
        }
      }
    };
    var addRef = Rx.internals.addRef = function(xs, r) {
      return new AnonymousObservable(function(observer) {
        return new CompositeDisposable(r.getDisposable(), xs.subscribe(observer));
      });
    };
    function arrayInitialize(count, factory) {
      var a = new Array(count);
      for (var i = 0; i < count; i++) {
        a[i] = factory();
      }
      return a;
    }
    var errorObj = {e: {}};
    var tryCatchTarget;
    function tryCatcher() {
      try {
        return tryCatchTarget.apply(this, arguments);
      } catch (e) {
        errorObj.e = e;
        return errorObj;
      }
    }
    function tryCatch(fn) {
      if (!isFunction(fn)) {
        throw new TypeError('fn must be a function');
      }
      tryCatchTarget = fn;
      return tryCatcher;
    }
    function thrower(e) {
      throw e;
    }
    if (!Function.prototype.bind) {
      Function.prototype.bind = function(that) {
        var target = this,
            args = slice.call(arguments, 1);
        var bound = function() {
          if (this instanceof bound) {
            function F() {}
            F.prototype = target.prototype;
            var self = new F();
            var result = target.apply(self, args.concat(slice.call(arguments)));
            if (Object(result) === result) {
              return result;
            }
            return self;
          } else {
            return target.apply(that, args.concat(slice.call(arguments)));
          }
        };
        return bound;
      };
    }
    if (!Array.prototype.forEach) {
      Array.prototype.forEach = function(callback, thisArg) {
        var T,
            k;
        if (this == null) {
          throw new TypeError(" this is null or not defined");
        }
        var O = Object(this);
        var len = O.length >>> 0;
        if (typeof callback !== "function") {
          throw new TypeError(callback + " is not a function");
        }
        if (arguments.length > 1) {
          T = thisArg;
        }
        k = 0;
        while (k < len) {
          var kValue;
          if (k in O) {
            kValue = O[k];
            callback.call(T, kValue, k, O);
          }
          k++;
        }
      };
    }
    var boxedString = Object("a"),
        splitString = boxedString[0] != "a" || !(0 in boxedString);
    if (!Array.prototype.every) {
      Array.prototype.every = function every(fun) {
        var object = Object(this),
            self = splitString && {}.toString.call(this) == stringClass ? this.split("") : object,
            length = self.length >>> 0,
            thisp = arguments[1];
        if ({}.toString.call(fun) != funcClass) {
          throw new TypeError(fun + " is not a function");
        }
        for (var i = 0; i < length; i++) {
          if (i in self && !fun.call(thisp, self[i], i, object)) {
            return false;
          }
        }
        return true;
      };
    }
    if (!Array.prototype.map) {
      Array.prototype.map = function map(fun) {
        var object = Object(this),
            self = splitString && {}.toString.call(this) == stringClass ? this.split("") : object,
            length = self.length >>> 0,
            result = Array(length),
            thisp = arguments[1];
        if ({}.toString.call(fun) != funcClass) {
          throw new TypeError(fun + " is not a function");
        }
        for (var i = 0; i < length; i++) {
          if (i in self) {
            result[i] = fun.call(thisp, self[i], i, object);
          }
        }
        return result;
      };
    }
    if (!Array.prototype.filter) {
      Array.prototype.filter = function(predicate) {
        var results = [],
            item,
            t = new Object(this);
        for (var i = 0,
            len = t.length >>> 0; i < len; i++) {
          item = t[i];
          if (i in t && predicate.call(arguments[1], item, i, t)) {
            results.push(item);
          }
        }
        return results;
      };
    }
    if (!Array.isArray) {
      Array.isArray = function(arg) {
        return {}.toString.call(arg) == arrayClass;
      };
    }
    if (!Array.prototype.indexOf) {
      Array.prototype.indexOf = function indexOf(searchElement) {
        var t = Object(this);
        var len = t.length >>> 0;
        if (len === 0) {
          return -1;
        }
        var n = 0;
        if (arguments.length > 1) {
          n = Number(arguments[1]);
          if (n !== n) {
            n = 0;
          } else if (n !== 0 && n != Infinity && n !== -Infinity) {
            n = (n > 0 || -1) * Math.floor(Math.abs(n));
          }
        }
        if (n >= len) {
          return -1;
        }
        var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
        for (; k < len; k++) {
          if (k in t && t[k] === searchElement) {
            return k;
          }
        }
        return -1;
      };
    }
    if (!Object.prototype.propertyIsEnumerable) {
      Object.prototype.propertyIsEnumerable = function(key) {
        for (var k in this) {
          if (k === key) {
            return true;
          }
        }
        return false;
      };
    }
    if (!Object.keys) {
      Object.keys = (function() {
        'use strict';
        var hasOwnProperty = Object.prototype.hasOwnProperty,
            hasDontEnumBug = !({toString: null}).propertyIsEnumerable('toString');
        return function(obj) {
          if (typeof obj !== 'object' && (typeof obj !== 'function' || obj === null)) {
            throw new TypeError('Object.keys called on non-object');
          }
          var result = [],
              prop,
              i;
          for (prop in obj) {
            if (hasOwnProperty.call(obj, prop)) {
              result.push(prop);
            }
          }
          if (hasDontEnumBug) {
            for (i = 0; i < dontEnumsLength; i++) {
              if (hasOwnProperty.call(obj, dontEnums[i])) {
                result.push(dontEnums[i]);
              }
            }
          }
          return result;
        };
      }());
    }
    function IndexedItem(id, value) {
      this.id = id;
      this.value = value;
    }
    IndexedItem.prototype.compareTo = function(other) {
      var c = this.value.compareTo(other.value);
      c === 0 && (c = this.id - other.id);
      return c;
    };
    var PriorityQueue = Rx.internals.PriorityQueue = function(capacity) {
      this.items = new Array(capacity);
      this.length = 0;
    };
    var priorityProto = PriorityQueue.prototype;
    priorityProto.isHigherPriority = function(left, right) {
      return this.items[left].compareTo(this.items[right]) < 0;
    };
    priorityProto.percolate = function(index) {
      if (index >= this.length || index < 0) {
        return;
      }
      var parent = index - 1 >> 1;
      if (parent < 0 || parent === index) {
        return;
      }
      if (this.isHigherPriority(index, parent)) {
        var temp = this.items[index];
        this.items[index] = this.items[parent];
        this.items[parent] = temp;
        this.percolate(parent);
      }
    };
    priorityProto.heapify = function(index) {
      +index || (index = 0);
      if (index >= this.length || index < 0) {
        return;
      }
      var left = 2 * index + 1,
          right = 2 * index + 2,
          first = index;
      if (left < this.length && this.isHigherPriority(left, first)) {
        first = left;
      }
      if (right < this.length && this.isHigherPriority(right, first)) {
        first = right;
      }
      if (first !== index) {
        var temp = this.items[index];
        this.items[index] = this.items[first];
        this.items[first] = temp;
        this.heapify(first);
      }
    };
    priorityProto.peek = function() {
      return this.items[0].value;
    };
    priorityProto.removeAt = function(index) {
      this.items[index] = this.items[--this.length];
      this.items[this.length] = undefined;
      this.heapify();
    };
    priorityProto.dequeue = function() {
      var result = this.peek();
      this.removeAt(0);
      return result;
    };
    priorityProto.enqueue = function(item) {
      var index = this.length++;
      this.items[index] = new IndexedItem(PriorityQueue.count++, item);
      this.percolate(index);
    };
    priorityProto.remove = function(item) {
      for (var i = 0; i < this.length; i++) {
        if (this.items[i].value === item) {
          this.removeAt(i);
          return true;
        }
      }
      return false;
    };
    PriorityQueue.count = 0;
    var CompositeDisposable = Rx.CompositeDisposable = function() {
      var args = [],
          i,
          len;
      if (Array.isArray(arguments[0])) {
        args = arguments[0];
        len = args.length;
      } else {
        len = arguments.length;
        args = new Array(len);
        for (i = 0; i < len; i++) {
          args[i] = arguments[i];
        }
      }
      for (i = 0; i < len; i++) {
        if (!isDisposable(args[i])) {
          throw new TypeError('Not a disposable');
        }
      }
      this.disposables = args;
      this.isDisposed = false;
      this.length = args.length;
    };
    var CompositeDisposablePrototype = CompositeDisposable.prototype;
    CompositeDisposablePrototype.add = function(item) {
      if (this.isDisposed) {
        item.dispose();
      } else {
        this.disposables.push(item);
        this.length++;
      }
    };
    CompositeDisposablePrototype.remove = function(item) {
      var shouldDispose = false;
      if (!this.isDisposed) {
        var idx = this.disposables.indexOf(item);
        if (idx !== -1) {
          shouldDispose = true;
          this.disposables.splice(idx, 1);
          this.length--;
          item.dispose();
        }
      }
      return shouldDispose;
    };
    CompositeDisposablePrototype.dispose = function() {
      if (!this.isDisposed) {
        this.isDisposed = true;
        var len = this.disposables.length,
            currentDisposables = new Array(len);
        for (var i = 0; i < len; i++) {
          currentDisposables[i] = this.disposables[i];
        }
        this.disposables = [];
        this.length = 0;
        for (i = 0; i < len; i++) {
          currentDisposables[i].dispose();
        }
      }
    };
    var Disposable = Rx.Disposable = function(action) {
      this.isDisposed = false;
      this.action = action || noop;
    };
    Disposable.prototype.dispose = function() {
      if (!this.isDisposed) {
        this.action();
        this.isDisposed = true;
      }
    };
    var disposableCreate = Disposable.create = function(action) {
      return new Disposable(action);
    };
    var disposableEmpty = Disposable.empty = {dispose: noop};
    var isDisposable = Disposable.isDisposable = function(d) {
      return d && isFunction(d.dispose);
    };
    var checkDisposed = Disposable.checkDisposed = function(disposable) {
      if (disposable.isDisposed) {
        throw new ObjectDisposedError();
      }
    };
    var SingleAssignmentDisposable = Rx.SingleAssignmentDisposable = (function() {
      function BooleanDisposable() {
        this.isDisposed = false;
        this.current = null;
      }
      var booleanDisposablePrototype = BooleanDisposable.prototype;
      booleanDisposablePrototype.getDisposable = function() {
        return this.current;
      };
      booleanDisposablePrototype.setDisposable = function(value) {
        var shouldDispose = this.isDisposed;
        if (!shouldDispose) {
          var old = this.current;
          this.current = value;
        }
        old && old.dispose();
        shouldDispose && value && value.dispose();
      };
      booleanDisposablePrototype.dispose = function() {
        if (!this.isDisposed) {
          this.isDisposed = true;
          var old = this.current;
          this.current = null;
        }
        old && old.dispose();
      };
      return BooleanDisposable;
    }());
    var SerialDisposable = Rx.SerialDisposable = SingleAssignmentDisposable;
    var RefCountDisposable = Rx.RefCountDisposable = (function() {
      function InnerDisposable(disposable) {
        this.disposable = disposable;
        this.disposable.count++;
        this.isInnerDisposed = false;
      }
      InnerDisposable.prototype.dispose = function() {
        if (!this.disposable.isDisposed && !this.isInnerDisposed) {
          this.isInnerDisposed = true;
          this.disposable.count--;
          if (this.disposable.count === 0 && this.disposable.isPrimaryDisposed) {
            this.disposable.isDisposed = true;
            this.disposable.underlyingDisposable.dispose();
          }
        }
      };
      function RefCountDisposable(disposable) {
        this.underlyingDisposable = disposable;
        this.isDisposed = false;
        this.isPrimaryDisposed = false;
        this.count = 0;
      }
      RefCountDisposable.prototype.dispose = function() {
        if (!this.isDisposed && !this.isPrimaryDisposed) {
          this.isPrimaryDisposed = true;
          if (this.count === 0) {
            this.isDisposed = true;
            this.underlyingDisposable.dispose();
          }
        }
      };
      RefCountDisposable.prototype.getDisposable = function() {
        return this.isDisposed ? disposableEmpty : new InnerDisposable(this);
      };
      return RefCountDisposable;
    })();
    function ScheduledDisposable(scheduler, disposable) {
      this.scheduler = scheduler;
      this.disposable = disposable;
      this.isDisposed = false;
    }
    function scheduleItem(s, self) {
      if (!self.isDisposed) {
        self.isDisposed = true;
        self.disposable.dispose();
      }
    }
    ScheduledDisposable.prototype.dispose = function() {
      this.scheduler.scheduleWithState(this, scheduleItem);
    };
    var ScheduledItem = Rx.internals.ScheduledItem = function(scheduler, state, action, dueTime, comparer) {
      this.scheduler = scheduler;
      this.state = state;
      this.action = action;
      this.dueTime = dueTime;
      this.comparer = comparer || defaultSubComparer;
      this.disposable = new SingleAssignmentDisposable();
    };
    ScheduledItem.prototype.invoke = function() {
      this.disposable.setDisposable(this.invokeCore());
    };
    ScheduledItem.prototype.compareTo = function(other) {
      return this.comparer(this.dueTime, other.dueTime);
    };
    ScheduledItem.prototype.isCancelled = function() {
      return this.disposable.isDisposed;
    };
    ScheduledItem.prototype.invokeCore = function() {
      return this.action(this.scheduler, this.state);
    };
    var Scheduler = Rx.Scheduler = (function() {
      function Scheduler(now, schedule, scheduleRelative, scheduleAbsolute) {
        this.now = now;
        this._schedule = schedule;
        this._scheduleRelative = scheduleRelative;
        this._scheduleAbsolute = scheduleAbsolute;
      }
      function invokeAction(scheduler, action) {
        action();
        return disposableEmpty;
      }
      var schedulerProto = Scheduler.prototype;
      schedulerProto.schedule = function(action) {
        return this._schedule(action, invokeAction);
      };
      schedulerProto.scheduleWithState = function(state, action) {
        return this._schedule(state, action);
      };
      schedulerProto.scheduleWithRelative = function(dueTime, action) {
        return this._scheduleRelative(action, dueTime, invokeAction);
      };
      schedulerProto.scheduleWithRelativeAndState = function(state, dueTime, action) {
        return this._scheduleRelative(state, dueTime, action);
      };
      schedulerProto.scheduleWithAbsolute = function(dueTime, action) {
        return this._scheduleAbsolute(action, dueTime, invokeAction);
      };
      schedulerProto.scheduleWithAbsoluteAndState = function(state, dueTime, action) {
        return this._scheduleAbsolute(state, dueTime, action);
      };
      Scheduler.now = defaultNow;
      Scheduler.normalize = function(timeSpan) {
        timeSpan < 0 && (timeSpan = 0);
        return timeSpan;
      };
      return Scheduler;
    }());
    var normalizeTime = Scheduler.normalize;
    (function(schedulerProto) {
      function invokeRecImmediate(scheduler, pair) {
        var state = pair[0],
            action = pair[1],
            group = new CompositeDisposable();
        function recursiveAction(state1) {
          action(state1, function(state2) {
            var isAdded = false,
                isDone = false,
                d = scheduler.scheduleWithState(state2, function(scheduler1, state3) {
                  if (isAdded) {
                    group.remove(d);
                  } else {
                    isDone = true;
                  }
                  recursiveAction(state3);
                  return disposableEmpty;
                });
            if (!isDone) {
              group.add(d);
              isAdded = true;
            }
          });
        }
        recursiveAction(state);
        return group;
      }
      function invokeRecDate(scheduler, pair, method) {
        var state = pair[0],
            action = pair[1],
            group = new CompositeDisposable();
        function recursiveAction(state1) {
          action(state1, function(state2, dueTime1) {
            var isAdded = false,
                isDone = false,
                d = scheduler[method](state2, dueTime1, function(scheduler1, state3) {
                  if (isAdded) {
                    group.remove(d);
                  } else {
                    isDone = true;
                  }
                  recursiveAction(state3);
                  return disposableEmpty;
                });
            if (!isDone) {
              group.add(d);
              isAdded = true;
            }
          });
        }
        ;
        recursiveAction(state);
        return group;
      }
      function scheduleInnerRecursive(action, self) {
        action(function(dt) {
          self(action, dt);
        });
      }
      schedulerProto.scheduleRecursive = function(action) {
        return this.scheduleRecursiveWithState(action, function(_action, self) {
          _action(function() {
            self(_action);
          });
        });
      };
      schedulerProto.scheduleRecursiveWithState = function(state, action) {
        return this.scheduleWithState([state, action], invokeRecImmediate);
      };
      schedulerProto.scheduleRecursiveWithRelative = function(dueTime, action) {
        return this.scheduleRecursiveWithRelativeAndState(action, dueTime, scheduleInnerRecursive);
      };
      schedulerProto.scheduleRecursiveWithRelativeAndState = function(state, dueTime, action) {
        return this._scheduleRelative([state, action], dueTime, function(s, p) {
          return invokeRecDate(s, p, 'scheduleWithRelativeAndState');
        });
      };
      schedulerProto.scheduleRecursiveWithAbsolute = function(dueTime, action) {
        return this.scheduleRecursiveWithAbsoluteAndState(action, dueTime, scheduleInnerRecursive);
      };
      schedulerProto.scheduleRecursiveWithAbsoluteAndState = function(state, dueTime, action) {
        return this._scheduleAbsolute([state, action], dueTime, function(s, p) {
          return invokeRecDate(s, p, 'scheduleWithAbsoluteAndState');
        });
      };
    }(Scheduler.prototype));
    (function(schedulerProto) {
      Scheduler.prototype.schedulePeriodic = function(period, action) {
        return this.schedulePeriodicWithState(null, period, action);
      };
      Scheduler.prototype.schedulePeriodicWithState = function(state, period, action) {
        if (typeof root.setInterval === 'undefined') {
          throw new NotSupportedError();
        }
        period = normalizeTime(period);
        var s = state,
            id = root.setInterval(function() {
              s = action(s);
            }, period);
        return disposableCreate(function() {
          root.clearInterval(id);
        });
      };
    }(Scheduler.prototype));
    (function(schedulerProto) {
      schedulerProto.catchError = schedulerProto['catch'] = function(handler) {
        return new CatchScheduler(this, handler);
      };
    }(Scheduler.prototype));
    var SchedulePeriodicRecursive = Rx.internals.SchedulePeriodicRecursive = (function() {
      function tick(command, recurse) {
        recurse(0, this._period);
        try {
          this._state = this._action(this._state);
        } catch (e) {
          this._cancel.dispose();
          throw e;
        }
      }
      function SchedulePeriodicRecursive(scheduler, state, period, action) {
        this._scheduler = scheduler;
        this._state = state;
        this._period = period;
        this._action = action;
      }
      SchedulePeriodicRecursive.prototype.start = function() {
        var d = new SingleAssignmentDisposable();
        this._cancel = d;
        d.setDisposable(this._scheduler.scheduleRecursiveWithRelativeAndState(0, this._period, tick.bind(this)));
        return d;
      };
      return SchedulePeriodicRecursive;
    }());
    var immediateScheduler = Scheduler.immediate = (function() {
      function scheduleNow(state, action) {
        return action(this, state);
      }
      return new Scheduler(defaultNow, scheduleNow, notSupported, notSupported);
    }());
    var currentThreadScheduler = Scheduler.currentThread = (function() {
      var queue;
      function runTrampoline() {
        while (queue.length > 0) {
          var item = queue.dequeue();
          !item.isCancelled() && item.invoke();
        }
      }
      function scheduleNow(state, action) {
        var si = new ScheduledItem(this, state, action, this.now());
        if (!queue) {
          queue = new PriorityQueue(4);
          queue.enqueue(si);
          var result = tryCatch(runTrampoline)();
          queue = null;
          if (result === errorObj) {
            return thrower(result.e);
          }
        } else {
          queue.enqueue(si);
        }
        return si.disposable;
      }
      var currentScheduler = new Scheduler(defaultNow, scheduleNow, notSupported, notSupported);
      currentScheduler.scheduleRequired = function() {
        return !queue;
      };
      return currentScheduler;
    }());
    var scheduleMethod,
        clearMethod;
    var localTimer = (function() {
      var localSetTimeout,
          localClearTimeout = noop;
      if (!!root.WScript) {
        localSetTimeout = function(fn, time) {
          root.WScript.Sleep(time);
          fn();
        };
      } else if (!!root.setTimeout) {
        localSetTimeout = root.setTimeout;
        localClearTimeout = root.clearTimeout;
      } else {
        throw new NotSupportedError();
      }
      return {
        setTimeout: localSetTimeout,
        clearTimeout: localClearTimeout
      };
    }());
    var localSetTimeout = localTimer.setTimeout,
        localClearTimeout = localTimer.clearTimeout;
    (function() {
      var nextHandle = 1,
          tasksByHandle = {},
          currentlyRunning = false;
      clearMethod = function(handle) {
        delete tasksByHandle[handle];
      };
      function runTask(handle) {
        if (currentlyRunning) {
          localSetTimeout(function() {
            runTask(handle);
          }, 0);
        } else {
          var task = tasksByHandle[handle];
          if (task) {
            currentlyRunning = true;
            var result = tryCatch(task)();
            clearMethod(handle);
            currentlyRunning = false;
            if (result === errorObj) {
              return thrower(result.e);
            }
          }
        }
      }
      var reNative = RegExp('^' + String(toString).replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/toString| for [^\]]+/g, '.*?') + '$');
      var setImmediate = typeof(setImmediate = freeGlobal && moduleExports && freeGlobal.setImmediate) == 'function' && !reNative.test(setImmediate) && setImmediate;
      function postMessageSupported() {
        if (!root.postMessage || root.importScripts) {
          return false;
        }
        var isAsync = false,
            oldHandler = root.onmessage;
        root.onmessage = function() {
          isAsync = true;
        };
        root.postMessage('', '*');
        root.onmessage = oldHandler;
        return isAsync;
      }
      if (isFunction(setImmediate)) {
        scheduleMethod = function(action) {
          var id = nextHandle++;
          tasksByHandle[id] = action;
          setImmediate(function() {
            runTask(id);
          });
          return id;
        };
      } else if (typeof process !== 'undefined' && {}.toString.call(process) === '[object process]') {
        scheduleMethod = function(action) {
          var id = nextHandle++;
          tasksByHandle[id] = action;
          process.nextTick(function() {
            runTask(id);
          });
          return id;
        };
      } else if (postMessageSupported()) {
        var MSG_PREFIX = 'ms.rx.schedule' + Math.random();
        function onGlobalPostMessage(event) {
          if (typeof event.data === 'string' && event.data.substring(0, MSG_PREFIX.length) === MSG_PREFIX) {
            runTask(event.data.substring(MSG_PREFIX.length));
          }
        }
        if (root.addEventListener) {
          root.addEventListener('message', onGlobalPostMessage, false);
        } else {
          root.attachEvent('onmessage', onGlobalPostMessage, false);
        }
        scheduleMethod = function(action) {
          var id = nextHandle++;
          tasksByHandle[id] = action;
          root.postMessage(MSG_PREFIX + currentId, '*');
          return id;
        };
      } else if (!!root.MessageChannel) {
        var channel = new root.MessageChannel();
        channel.port1.onmessage = function(e) {
          runTask(e.data);
        };
        scheduleMethod = function(action) {
          var id = nextHandle++;
          tasksByHandle[id] = action;
          channel.port2.postMessage(id);
          return id;
        };
      } else if ('document' in root && 'onreadystatechange' in root.document.createElement('script')) {
        scheduleMethod = function(action) {
          var scriptElement = root.document.createElement('script');
          var id = nextHandle++;
          tasksByHandle[id] = action;
          scriptElement.onreadystatechange = function() {
            runTask(id);
            scriptElement.onreadystatechange = null;
            scriptElement.parentNode.removeChild(scriptElement);
            scriptElement = null;
          };
          root.document.documentElement.appendChild(scriptElement);
          return id;
        };
      } else {
        scheduleMethod = function(action) {
          var id = nextHandle++;
          tasksByHandle[id] = action;
          localSetTimeout(function() {
            runTask(id);
          }, 0);
          return id;
        };
      }
    }());
    var timeoutScheduler = Scheduler.timeout = Scheduler.default = (function() {
      function scheduleNow(state, action) {
        var scheduler = this,
            disposable = new SingleAssignmentDisposable();
        var id = scheduleMethod(function() {
          if (!disposable.isDisposed) {
            disposable.setDisposable(action(scheduler, state));
          }
        });
        return new CompositeDisposable(disposable, disposableCreate(function() {
          clearMethod(id);
        }));
      }
      function scheduleRelative(state, dueTime, action) {
        var scheduler = this,
            dt = Scheduler.normalize(dueTime);
        if (dt === 0) {
          return scheduler.scheduleWithState(state, action);
        }
        var disposable = new SingleAssignmentDisposable();
        var id = localSetTimeout(function() {
          if (!disposable.isDisposed) {
            disposable.setDisposable(action(scheduler, state));
          }
        }, dt);
        return new CompositeDisposable(disposable, disposableCreate(function() {
          localClearTimeout(id);
        }));
      }
      function scheduleAbsolute(state, dueTime, action) {
        return this.scheduleWithRelativeAndState(state, dueTime - this.now(), action);
      }
      return new Scheduler(defaultNow, scheduleNow, scheduleRelative, scheduleAbsolute);
    })();
    var CatchScheduler = (function(__super__) {
      function scheduleNow(state, action) {
        return this._scheduler.scheduleWithState(state, this._wrap(action));
      }
      function scheduleRelative(state, dueTime, action) {
        return this._scheduler.scheduleWithRelativeAndState(state, dueTime, this._wrap(action));
      }
      function scheduleAbsolute(state, dueTime, action) {
        return this._scheduler.scheduleWithAbsoluteAndState(state, dueTime, this._wrap(action));
      }
      inherits(CatchScheduler, __super__);
      function CatchScheduler(scheduler, handler) {
        this._scheduler = scheduler;
        this._handler = handler;
        this._recursiveOriginal = null;
        this._recursiveWrapper = null;
        __super__.call(this, this._scheduler.now.bind(this._scheduler), scheduleNow, scheduleRelative, scheduleAbsolute);
      }
      CatchScheduler.prototype._clone = function(scheduler) {
        return new CatchScheduler(scheduler, this._handler);
      };
      CatchScheduler.prototype._wrap = function(action) {
        var parent = this;
        return function(self, state) {
          try {
            return action(parent._getRecursiveWrapper(self), state);
          } catch (e) {
            if (!parent._handler(e)) {
              throw e;
            }
            return disposableEmpty;
          }
        };
      };
      CatchScheduler.prototype._getRecursiveWrapper = function(scheduler) {
        if (this._recursiveOriginal !== scheduler) {
          this._recursiveOriginal = scheduler;
          var wrapper = this._clone(scheduler);
          wrapper._recursiveOriginal = scheduler;
          wrapper._recursiveWrapper = wrapper;
          this._recursiveWrapper = wrapper;
        }
        return this._recursiveWrapper;
      };
      CatchScheduler.prototype.schedulePeriodicWithState = function(state, period, action) {
        var self = this,
            failed = false,
            d = new SingleAssignmentDisposable();
        d.setDisposable(this._scheduler.schedulePeriodicWithState(state, period, function(state1) {
          if (failed) {
            return null;
          }
          try {
            return action(state1);
          } catch (e) {
            failed = true;
            if (!self._handler(e)) {
              throw e;
            }
            d.dispose();
            return null;
          }
        }));
        return d;
      };
      return CatchScheduler;
    }(Scheduler));
    var Notification = Rx.Notification = (function() {
      function Notification(kind, value, exception, accept, acceptObservable, toString) {
        this.kind = kind;
        this.value = value;
        this.exception = exception;
        this._accept = accept;
        this._acceptObservable = acceptObservable;
        this.toString = toString;
      }
      Notification.prototype.accept = function(observerOrOnNext, onError, onCompleted) {
        return observerOrOnNext && typeof observerOrOnNext === 'object' ? this._acceptObservable(observerOrOnNext) : this._accept(observerOrOnNext, onError, onCompleted);
      };
      Notification.prototype.toObservable = function(scheduler) {
        var self = this;
        isScheduler(scheduler) || (scheduler = immediateScheduler);
        return new AnonymousObservable(function(observer) {
          return scheduler.scheduleWithState(self, function(_, notification) {
            notification._acceptObservable(observer);
            notification.kind === 'N' && observer.onCompleted();
          });
        });
      };
      return Notification;
    })();
    var notificationCreateOnNext = Notification.createOnNext = (function() {
      function _accept(onNext) {
        return onNext(this.value);
      }
      function _acceptObservable(observer) {
        return observer.onNext(this.value);
      }
      function toString() {
        return 'OnNext(' + this.value + ')';
      }
      return function(value) {
        return new Notification('N', value, null, _accept, _acceptObservable, toString);
      };
    }());
    var notificationCreateOnError = Notification.createOnError = (function() {
      function _accept(onNext, onError) {
        return onError(this.exception);
      }
      function _acceptObservable(observer) {
        return observer.onError(this.exception);
      }
      function toString() {
        return 'OnError(' + this.exception + ')';
      }
      return function(e) {
        return new Notification('E', null, e, _accept, _acceptObservable, toString);
      };
    }());
    var notificationCreateOnCompleted = Notification.createOnCompleted = (function() {
      function _accept(onNext, onError, onCompleted) {
        return onCompleted();
      }
      function _acceptObservable(observer) {
        return observer.onCompleted();
      }
      function toString() {
        return 'OnCompleted()';
      }
      return function() {
        return new Notification('C', null, null, _accept, _acceptObservable, toString);
      };
    }());
    var Enumerator = Rx.internals.Enumerator = function(next) {
      this._next = next;
    };
    Enumerator.prototype.next = function() {
      return this._next();
    };
    Enumerator.prototype[$iterator$] = function() {
      return this;
    };
    var Enumerable = Rx.internals.Enumerable = function(iterator) {
      this._iterator = iterator;
    };
    Enumerable.prototype[$iterator$] = function() {
      return this._iterator();
    };
    Enumerable.prototype.concat = function() {
      var sources = this;
      return new AnonymousObservable(function(o) {
        var e = sources[$iterator$]();
        var isDisposed,
            subscription = new SerialDisposable();
        var cancelable = immediateScheduler.scheduleRecursive(function(self) {
          if (isDisposed) {
            return;
          }
          try {
            var currentItem = e.next();
          } catch (ex) {
            return o.onError(ex);
          }
          if (currentItem.done) {
            return o.onCompleted();
          }
          var currentValue = currentItem.value;
          isPromise(currentValue) && (currentValue = observableFromPromise(currentValue));
          var d = new SingleAssignmentDisposable();
          subscription.setDisposable(d);
          d.setDisposable(currentValue.subscribe(function(x) {
            o.onNext(x);
          }, function(err) {
            o.onError(err);
          }, self));
        });
        return new CompositeDisposable(subscription, cancelable, disposableCreate(function() {
          isDisposed = true;
        }));
      });
    };
    Enumerable.prototype.catchError = function() {
      var sources = this;
      return new AnonymousObservable(function(o) {
        var e = sources[$iterator$]();
        var isDisposed,
            subscription = new SerialDisposable();
        var cancelable = immediateScheduler.scheduleRecursiveWithState(null, function(lastException, self) {
          if (isDisposed) {
            return;
          }
          try {
            var currentItem = e.next();
          } catch (ex) {
            return observer.onError(ex);
          }
          if (currentItem.done) {
            if (lastException !== null) {
              o.onError(lastException);
            } else {
              o.onCompleted();
            }
            return;
          }
          var currentValue = currentItem.value;
          isPromise(currentValue) && (currentValue = observableFromPromise(currentValue));
          var d = new SingleAssignmentDisposable();
          subscription.setDisposable(d);
          d.setDisposable(currentValue.subscribe(function(x) {
            o.onNext(x);
          }, self, function() {
            o.onCompleted();
          }));
        });
        return new CompositeDisposable(subscription, cancelable, disposableCreate(function() {
          isDisposed = true;
        }));
      });
    };
    Enumerable.prototype.catchErrorWhen = function(notificationHandler) {
      var sources = this;
      return new AnonymousObservable(function(o) {
        var exceptions = new Subject(),
            notifier = new Subject(),
            handled = notificationHandler(exceptions),
            notificationDisposable = handled.subscribe(notifier);
        var e = sources[$iterator$]();
        var isDisposed,
            lastException,
            subscription = new SerialDisposable();
        var cancelable = immediateScheduler.scheduleRecursive(function(self) {
          if (isDisposed) {
            return;
          }
          try {
            var currentItem = e.next();
          } catch (ex) {
            return o.onError(ex);
          }
          if (currentItem.done) {
            if (lastException) {
              o.onError(lastException);
            } else {
              o.onCompleted();
            }
            return;
          }
          var currentValue = currentItem.value;
          isPromise(currentValue) && (currentValue = observableFromPromise(currentValue));
          var outer = new SingleAssignmentDisposable();
          var inner = new SingleAssignmentDisposable();
          subscription.setDisposable(new CompositeDisposable(inner, outer));
          outer.setDisposable(currentValue.subscribe(function(x) {
            o.onNext(x);
          }, function(exn) {
            inner.setDisposable(notifier.subscribe(self, function(ex) {
              o.onError(ex);
            }, function() {
              o.onCompleted();
            }));
            exceptions.onNext(exn);
          }, function() {
            o.onCompleted();
          }));
        });
        return new CompositeDisposable(notificationDisposable, subscription, cancelable, disposableCreate(function() {
          isDisposed = true;
        }));
      });
    };
    var enumerableRepeat = Enumerable.repeat = function(value, repeatCount) {
      if (repeatCount == null) {
        repeatCount = -1;
      }
      return new Enumerable(function() {
        var left = repeatCount;
        return new Enumerator(function() {
          if (left === 0) {
            return doneEnumerator;
          }
          if (left > 0) {
            left--;
          }
          return {
            done: false,
            value: value
          };
        });
      });
    };
    var enumerableOf = Enumerable.of = function(source, selector, thisArg) {
      if (selector) {
        var selectorFn = bindCallback(selector, thisArg, 3);
      }
      return new Enumerable(function() {
        var index = -1;
        return new Enumerator(function() {
          return ++index < source.length ? {
            done: false,
            value: !selector ? source[index] : selectorFn(source[index], index, source)
          } : doneEnumerator;
        });
      });
    };
    var Observer = Rx.Observer = function() {};
    Observer.prototype.toNotifier = function() {
      var observer = this;
      return function(n) {
        return n.accept(observer);
      };
    };
    Observer.prototype.asObserver = function() {
      return new AnonymousObserver(this.onNext.bind(this), this.onError.bind(this), this.onCompleted.bind(this));
    };
    Observer.prototype.checked = function() {
      return new CheckedObserver(this);
    };
    var observerCreate = Observer.create = function(onNext, onError, onCompleted) {
      onNext || (onNext = noop);
      onError || (onError = defaultError);
      onCompleted || (onCompleted = noop);
      return new AnonymousObserver(onNext, onError, onCompleted);
    };
    Observer.fromNotifier = function(handler, thisArg) {
      return new AnonymousObserver(function(x) {
        return handler.call(thisArg, notificationCreateOnNext(x));
      }, function(e) {
        return handler.call(thisArg, notificationCreateOnError(e));
      }, function() {
        return handler.call(thisArg, notificationCreateOnCompleted());
      });
    };
    Observer.prototype.notifyOn = function(scheduler) {
      return new ObserveOnObserver(scheduler, this);
    };
    Observer.prototype.makeSafe = function(disposable) {
      return new AnonymousSafeObserver(this._onNext, this._onError, this._onCompleted, disposable);
    };
    var AbstractObserver = Rx.internals.AbstractObserver = (function(__super__) {
      inherits(AbstractObserver, __super__);
      function AbstractObserver() {
        this.isStopped = false;
        __super__.call(this);
      }
      AbstractObserver.prototype.next = notImplemented;
      AbstractObserver.prototype.error = notImplemented;
      AbstractObserver.prototype.completed = notImplemented;
      AbstractObserver.prototype.onNext = function(value) {
        if (!this.isStopped) {
          this.next(value);
        }
      };
      AbstractObserver.prototype.onError = function(error) {
        if (!this.isStopped) {
          this.isStopped = true;
          this.error(error);
        }
      };
      AbstractObserver.prototype.onCompleted = function() {
        if (!this.isStopped) {
          this.isStopped = true;
          this.completed();
        }
      };
      AbstractObserver.prototype.dispose = function() {
        this.isStopped = true;
      };
      AbstractObserver.prototype.fail = function(e) {
        if (!this.isStopped) {
          this.isStopped = true;
          this.error(e);
          return true;
        }
        return false;
      };
      return AbstractObserver;
    }(Observer));
    var AnonymousObserver = Rx.AnonymousObserver = (function(__super__) {
      inherits(AnonymousObserver, __super__);
      function AnonymousObserver(onNext, onError, onCompleted) {
        __super__.call(this);
        this._onNext = onNext;
        this._onError = onError;
        this._onCompleted = onCompleted;
      }
      AnonymousObserver.prototype.next = function(value) {
        this._onNext(value);
      };
      AnonymousObserver.prototype.error = function(error) {
        this._onError(error);
      };
      AnonymousObserver.prototype.completed = function() {
        this._onCompleted();
      };
      return AnonymousObserver;
    }(AbstractObserver));
    var CheckedObserver = (function(__super__) {
      inherits(CheckedObserver, __super__);
      function CheckedObserver(observer) {
        __super__.call(this);
        this._observer = observer;
        this._state = 0;
      }
      var CheckedObserverPrototype = CheckedObserver.prototype;
      CheckedObserverPrototype.onNext = function(value) {
        this.checkAccess();
        var res = tryCatch(this._observer.onNext).call(this._observer, value);
        this._state = 0;
        res === errorObj && thrower(res.e);
      };
      CheckedObserverPrototype.onError = function(err) {
        this.checkAccess();
        var res = tryCatch(this._observer.onError).call(this._observer, err);
        this._state = 2;
        res === errorObj && thrower(res.e);
      };
      CheckedObserverPrototype.onCompleted = function() {
        this.checkAccess();
        var res = tryCatch(this._observer.onCompleted).call(this._observer);
        this._state = 2;
        res === errorObj && thrower(res.e);
      };
      CheckedObserverPrototype.checkAccess = function() {
        if (this._state === 1) {
          throw new Error('Re-entrancy detected');
        }
        if (this._state === 2) {
          throw new Error('Observer completed');
        }
        if (this._state === 0) {
          this._state = 1;
        }
      };
      return CheckedObserver;
    }(Observer));
    var ScheduledObserver = Rx.internals.ScheduledObserver = (function(__super__) {
      inherits(ScheduledObserver, __super__);
      function ScheduledObserver(scheduler, observer) {
        __super__.call(this);
        this.scheduler = scheduler;
        this.observer = observer;
        this.isAcquired = false;
        this.hasFaulted = false;
        this.queue = [];
        this.disposable = new SerialDisposable();
      }
      ScheduledObserver.prototype.next = function(value) {
        var self = this;
        this.queue.push(function() {
          self.observer.onNext(value);
        });
      };
      ScheduledObserver.prototype.error = function(e) {
        var self = this;
        this.queue.push(function() {
          self.observer.onError(e);
        });
      };
      ScheduledObserver.prototype.completed = function() {
        var self = this;
        this.queue.push(function() {
          self.observer.onCompleted();
        });
      };
      ScheduledObserver.prototype.ensureActive = function() {
        var isOwner = false,
            parent = this;
        if (!this.hasFaulted && this.queue.length > 0) {
          isOwner = !this.isAcquired;
          this.isAcquired = true;
        }
        if (isOwner) {
          this.disposable.setDisposable(this.scheduler.scheduleRecursive(function(self) {
            var work;
            if (parent.queue.length > 0) {
              work = parent.queue.shift();
            } else {
              parent.isAcquired = false;
              return;
            }
            try {
              work();
            } catch (ex) {
              parent.queue = [];
              parent.hasFaulted = true;
              throw ex;
            }
            self();
          }));
        }
      };
      ScheduledObserver.prototype.dispose = function() {
        __super__.prototype.dispose.call(this);
        this.disposable.dispose();
      };
      return ScheduledObserver;
    }(AbstractObserver));
    var ObserveOnObserver = (function(__super__) {
      inherits(ObserveOnObserver, __super__);
      function ObserveOnObserver(scheduler, observer, cancel) {
        __super__.call(this, scheduler, observer);
        this._cancel = cancel;
      }
      ObserveOnObserver.prototype.next = function(value) {
        __super__.prototype.next.call(this, value);
        this.ensureActive();
      };
      ObserveOnObserver.prototype.error = function(e) {
        __super__.prototype.error.call(this, e);
        this.ensureActive();
      };
      ObserveOnObserver.prototype.completed = function() {
        __super__.prototype.completed.call(this);
        this.ensureActive();
      };
      ObserveOnObserver.prototype.dispose = function() {
        __super__.prototype.dispose.call(this);
        this._cancel && this._cancel.dispose();
        this._cancel = null;
      };
      return ObserveOnObserver;
    })(ScheduledObserver);
    var observableProto;
    var Observable = Rx.Observable = (function() {
      function Observable(subscribe) {
        if (Rx.config.longStackSupport && hasStacks) {
          try {
            throw new Error();
          } catch (e) {
            this.stack = e.stack.substring(e.stack.indexOf("\n") + 1);
          }
          var self = this;
          this._subscribe = function(observer) {
            var oldOnError = observer.onError.bind(observer);
            observer.onError = function(err) {
              makeStackTraceLong(err, self);
              oldOnError(err);
            };
            return subscribe.call(self, observer);
          };
        } else {
          this._subscribe = subscribe;
        }
      }
      observableProto = Observable.prototype;
      observableProto.subscribe = observableProto.forEach = function(observerOrOnNext, onError, onCompleted) {
        return this._subscribe(typeof observerOrOnNext === 'object' ? observerOrOnNext : observerCreate(observerOrOnNext, onError, onCompleted));
      };
      observableProto.subscribeOnNext = function(onNext, thisArg) {
        return this._subscribe(observerCreate(typeof thisArg !== 'undefined' ? function(x) {
          onNext.call(thisArg, x);
        } : onNext));
      };
      observableProto.subscribeOnError = function(onError, thisArg) {
        return this._subscribe(observerCreate(null, typeof thisArg !== 'undefined' ? function(e) {
          onError.call(thisArg, e);
        } : onError));
      };
      observableProto.subscribeOnCompleted = function(onCompleted, thisArg) {
        return this._subscribe(observerCreate(null, null, typeof thisArg !== 'undefined' ? function() {
          onCompleted.call(thisArg);
        } : onCompleted));
      };
      return Observable;
    })();
    var ObservableBase = Rx.ObservableBase = (function(__super__) {
      inherits(ObservableBase, __super__);
      function fixSubscriber(subscriber) {
        return subscriber && isFunction(subscriber.dispose) ? subscriber : isFunction(subscriber) ? disposableCreate(subscriber) : disposableEmpty;
      }
      function setDisposable(s, state) {
        var ado = state[0],
            self = state[1];
        var sub = tryCatch(self.subscribeCore).call(self, ado);
        if (sub === errorObj) {
          if (!ado.fail(errorObj.e)) {
            return thrower(errorObj.e);
          }
        }
        ado.setDisposable(fixSubscriber(sub));
      }
      function subscribe(observer) {
        var ado = new AutoDetachObserver(observer),
            state = [ado, this];
        if (currentThreadScheduler.scheduleRequired()) {
          currentThreadScheduler.scheduleWithState(state, setDisposable);
        } else {
          setDisposable(null, state);
        }
        return ado;
      }
      function ObservableBase() {
        __super__.call(this, subscribe);
      }
      ObservableBase.prototype.subscribeCore = notImplemented;
      return ObservableBase;
    }(Observable));
    observableProto.observeOn = function(scheduler) {
      var source = this;
      return new AnonymousObservable(function(observer) {
        return source.subscribe(new ObserveOnObserver(scheduler, observer));
      }, source);
    };
    observableProto.subscribeOn = function(scheduler) {
      var source = this;
      return new AnonymousObservable(function(observer) {
        var m = new SingleAssignmentDisposable(),
            d = new SerialDisposable();
        d.setDisposable(m);
        m.setDisposable(scheduler.schedule(function() {
          d.setDisposable(new ScheduledDisposable(scheduler, source.subscribe(observer)));
        }));
        return d;
      }, source);
    };
    var observableFromPromise = Observable.fromPromise = function(promise) {
      return observableDefer(function() {
        var subject = new Rx.AsyncSubject();
        promise.then(function(value) {
          subject.onNext(value);
          subject.onCompleted();
        }, subject.onError.bind(subject));
        return subject;
      });
    };
    observableProto.toPromise = function(promiseCtor) {
      promiseCtor || (promiseCtor = Rx.config.Promise);
      if (!promiseCtor) {
        throw new NotSupportedError('Promise type not provided nor in Rx.config.Promise');
      }
      var source = this;
      return new promiseCtor(function(resolve, reject) {
        var value,
            hasValue = false;
        source.subscribe(function(v) {
          value = v;
          hasValue = true;
        }, reject, function() {
          hasValue && resolve(value);
        });
      });
    };
    var ToArrayObservable = (function(__super__) {
      inherits(ToArrayObservable, __super__);
      function ToArrayObservable(source) {
        this.source = source;
        __super__.call(this);
      }
      ToArrayObservable.prototype.subscribeCore = function(observer) {
        return this.source.subscribe(new ToArrayObserver(observer));
      };
      return ToArrayObservable;
    }(ObservableBase));
    function ToArrayObserver(observer) {
      this.observer = observer;
      this.a = [];
      this.isStopped = false;
    }
    ToArrayObserver.prototype.onNext = function(x) {
      if (!this.isStopped) {
        this.a.push(x);
      }
    };
    ToArrayObserver.prototype.onError = function(e) {
      if (!this.isStopped) {
        this.isStopped = true;
        this.observer.onError(e);
      }
    };
    ToArrayObserver.prototype.onCompleted = function() {
      if (!this.isStopped) {
        this.isStopped = true;
        this.observer.onNext(this.a);
        this.observer.onCompleted();
      }
    };
    ToArrayObserver.prototype.dispose = function() {
      this.isStopped = true;
    };
    ToArrayObserver.prototype.fail = function(e) {
      if (!this.isStopped) {
        this.isStopped = true;
        this.observer.onError(e);
        return true;
      }
      return false;
    };
    observableProto.toArray = function() {
      return new ToArrayObservable(this);
    };
    Observable.create = Observable.createWithDisposable = function(subscribe, parent) {
      return new AnonymousObservable(subscribe, parent);
    };
    var observableDefer = Observable.defer = function(observableFactory) {
      return new AnonymousObservable(function(observer) {
        var result;
        try {
          result = observableFactory();
        } catch (e) {
          return observableThrow(e).subscribe(observer);
        }
        isPromise(result) && (result = observableFromPromise(result));
        return result.subscribe(observer);
      });
    };
    var observableEmpty = Observable.empty = function(scheduler) {
      isScheduler(scheduler) || (scheduler = immediateScheduler);
      return new AnonymousObservable(function(observer) {
        return scheduler.scheduleWithState(null, function() {
          observer.onCompleted();
        });
      });
    };
    var FromObservable = (function(__super__) {
      inherits(FromObservable, __super__);
      function FromObservable(iterable, mapper, scheduler) {
        this.iterable = iterable;
        this.mapper = mapper;
        this.scheduler = scheduler;
        __super__.call(this);
      }
      FromObservable.prototype.subscribeCore = function(observer) {
        var sink = new FromSink(observer, this);
        return sink.run();
      };
      return FromObservable;
    }(ObservableBase));
    var FromSink = (function() {
      function FromSink(observer, parent) {
        this.observer = observer;
        this.parent = parent;
      }
      FromSink.prototype.run = function() {
        var list = Object(this.parent.iterable),
            it = getIterable(list),
            observer = this.observer,
            mapper = this.parent.mapper;
        function loopRecursive(i, recurse) {
          try {
            var next = it.next();
          } catch (e) {
            return observer.onError(e);
          }
          if (next.done) {
            return observer.onCompleted();
          }
          var result = next.value;
          if (mapper) {
            try {
              result = mapper(result, i);
            } catch (e) {
              return observer.onError(e);
            }
          }
          observer.onNext(result);
          recurse(i + 1);
        }
        return this.parent.scheduler.scheduleRecursiveWithState(0, loopRecursive);
      };
      return FromSink;
    }());
    var maxSafeInteger = Math.pow(2, 53) - 1;
    function StringIterable(str) {
      this._s = s;
    }
    StringIterable.prototype[$iterator$] = function() {
      return new StringIterator(this._s);
    };
    function StringIterator(str) {
      this._s = s;
      this._l = s.length;
      this._i = 0;
    }
    StringIterator.prototype[$iterator$] = function() {
      return this;
    };
    StringIterator.prototype.next = function() {
      return this._i < this._l ? {
        done: false,
        value: this._s.charAt(this._i++)
      } : doneEnumerator;
    };
    function ArrayIterable(a) {
      this._a = a;
    }
    ArrayIterable.prototype[$iterator$] = function() {
      return new ArrayIterator(this._a);
    };
    function ArrayIterator(a) {
      this._a = a;
      this._l = toLength(a);
      this._i = 0;
    }
    ArrayIterator.prototype[$iterator$] = function() {
      return this;
    };
    ArrayIterator.prototype.next = function() {
      return this._i < this._l ? {
        done: false,
        value: this._a[this._i++]
      } : doneEnumerator;
    };
    function numberIsFinite(value) {
      return typeof value === 'number' && root.isFinite(value);
    }
    function isNan(n) {
      return n !== n;
    }
    function getIterable(o) {
      var i = o[$iterator$],
          it;
      if (!i && typeof o === 'string') {
        it = new StringIterable(o);
        return it[$iterator$]();
      }
      if (!i && o.length !== undefined) {
        it = new ArrayIterable(o);
        return it[$iterator$]();
      }
      if (!i) {
        throw new TypeError('Object is not iterable');
      }
      return o[$iterator$]();
    }
    function sign(value) {
      var number = +value;
      if (number === 0) {
        return number;
      }
      if (isNaN(number)) {
        return number;
      }
      return number < 0 ? -1 : 1;
    }
    function toLength(o) {
      var len = +o.length;
      if (isNaN(len)) {
        return 0;
      }
      if (len === 0 || !numberIsFinite(len)) {
        return len;
      }
      len = sign(len) * Math.floor(Math.abs(len));
      if (len <= 0) {
        return 0;
      }
      if (len > maxSafeInteger) {
        return maxSafeInteger;
      }
      return len;
    }
    var observableFrom = Observable.from = function(iterable, mapFn, thisArg, scheduler) {
      if (iterable == null) {
        throw new Error('iterable cannot be null.');
      }
      if (mapFn && !isFunction(mapFn)) {
        throw new Error('mapFn when provided must be a function');
      }
      if (mapFn) {
        var mapper = bindCallback(mapFn, thisArg, 2);
      }
      isScheduler(scheduler) || (scheduler = currentThreadScheduler);
      return new FromObservable(iterable, mapper, scheduler);
    };
    var FromArrayObservable = (function(__super__) {
      inherits(FromArrayObservable, __super__);
      function FromArrayObservable(args, scheduler) {
        this.args = args;
        this.scheduler = scheduler;
        __super__.call(this);
      }
      FromArrayObservable.prototype.subscribeCore = function(observer) {
        var sink = new FromArraySink(observer, this);
        return sink.run();
      };
      return FromArrayObservable;
    }(ObservableBase));
    function FromArraySink(observer, parent) {
      this.observer = observer;
      this.parent = parent;
    }
    FromArraySink.prototype.run = function() {
      var observer = this.observer,
          args = this.parent.args,
          len = args.length;
      function loopRecursive(i, recurse) {
        if (i < len) {
          observer.onNext(args[i]);
          recurse(i + 1);
        } else {
          observer.onCompleted();
        }
      }
      return this.parent.scheduler.scheduleRecursiveWithState(0, loopRecursive);
    };
    var observableFromArray = Observable.fromArray = function(array, scheduler) {
      isScheduler(scheduler) || (scheduler = currentThreadScheduler);
      return new FromArrayObservable(array, scheduler);
    };
    Observable.generate = function(initialState, condition, iterate, resultSelector, scheduler) {
      isScheduler(scheduler) || (scheduler = currentThreadScheduler);
      return new AnonymousObservable(function(o) {
        var first = true;
        return scheduler.scheduleRecursiveWithState(initialState, function(state, self) {
          var hasResult,
              result;
          try {
            if (first) {
              first = false;
            } else {
              state = iterate(state);
            }
            hasResult = condition(state);
            hasResult && (result = resultSelector(state));
          } catch (e) {
            return o.onError(e);
          }
          if (hasResult) {
            o.onNext(result);
            self(state);
          } else {
            o.onCompleted();
          }
        });
      });
    };
    var observableNever = Observable.never = function() {
      return new AnonymousObservable(function() {
        return disposableEmpty;
      });
    };
    function observableOf(scheduler, array) {
      isScheduler(scheduler) || (scheduler = currentThreadScheduler);
      return new FromArrayObservable(array, scheduler);
    }
    Observable.of = function() {
      var len = arguments.length,
          args = new Array(len);
      for (var i = 0; i < len; i++) {
        args[i] = arguments[i];
      }
      return new FromArrayObservable(args, currentThreadScheduler);
    };
    Observable.ofWithScheduler = function(scheduler) {
      var len = arguments.length,
          args = new Array(len - 1);
      for (var i = 1; i < len; i++) {
        args[i - 1] = arguments[i];
      }
      return new FromArrayObservable(args, scheduler);
    };
    Observable.pairs = function(obj, scheduler) {
      scheduler || (scheduler = Rx.Scheduler.currentThread);
      return new AnonymousObservable(function(observer) {
        var keys = Object.keys(obj),
            len = keys.length;
        return scheduler.scheduleRecursiveWithState(0, function(idx, self) {
          if (idx < len) {
            var key = keys[idx];
            observer.onNext([key, obj[key]]);
            self(idx + 1);
          } else {
            observer.onCompleted();
          }
        });
      });
    };
    var RangeObservable = (function(__super__) {
      inherits(RangeObservable, __super__);
      function RangeObservable(start, count, scheduler) {
        this.start = start;
        this.count = count;
        this.scheduler = scheduler;
        __super__.call(this);
      }
      RangeObservable.prototype.subscribeCore = function(observer) {
        var sink = new RangeSink(observer, this);
        return sink.run();
      };
      return RangeObservable;
    }(ObservableBase));
    var RangeSink = (function() {
      function RangeSink(observer, parent) {
        this.observer = observer;
        this.parent = parent;
      }
      RangeSink.prototype.run = function() {
        var start = this.parent.start,
            count = this.parent.count,
            observer = this.observer;
        function loopRecursive(i, recurse) {
          if (i < count) {
            observer.onNext(start + i);
            recurse(i + 1);
          } else {
            observer.onCompleted();
          }
        }
        return this.parent.scheduler.scheduleRecursiveWithState(0, loopRecursive);
      };
      return RangeSink;
    }());
    Observable.range = function(start, count, scheduler) {
      isScheduler(scheduler) || (scheduler = currentThreadScheduler);
      return new RangeObservable(start, count, scheduler);
    };
    Observable.repeat = function(value, repeatCount, scheduler) {
      isScheduler(scheduler) || (scheduler = currentThreadScheduler);
      return observableReturn(value, scheduler).repeat(repeatCount == null ? -1 : repeatCount);
    };
    var observableReturn = Observable['return'] = Observable.just = Observable.returnValue = function(value, scheduler) {
      isScheduler(scheduler) || (scheduler = immediateScheduler);
      return new AnonymousObservable(function(o) {
        return scheduler.scheduleWithState(value, function(_, v) {
          o.onNext(v);
          o.onCompleted();
        });
      });
    };
    var observableThrow = Observable['throw'] = Observable.throwError = function(error, scheduler) {
      isScheduler(scheduler) || (scheduler = immediateScheduler);
      return new AnonymousObservable(function(observer) {
        return scheduler.schedule(function() {
          observer.onError(error);
        });
      });
    };
    Observable.throwException = function() {
      return Observable.throwError.apply(null, arguments);
    };
    Observable.using = function(resourceFactory, observableFactory) {
      return new AnonymousObservable(function(observer) {
        var disposable = disposableEmpty,
            resource,
            source;
        try {
          resource = resourceFactory();
          resource && (disposable = resource);
          source = observableFactory(resource);
        } catch (exception) {
          return new CompositeDisposable(observableThrow(exception).subscribe(observer), disposable);
        }
        return new CompositeDisposable(source.subscribe(observer), disposable);
      });
    };
    observableProto.amb = function(rightSource) {
      var leftSource = this;
      return new AnonymousObservable(function(observer) {
        var choice,
            leftChoice = 'L',
            rightChoice = 'R',
            leftSubscription = new SingleAssignmentDisposable(),
            rightSubscription = new SingleAssignmentDisposable();
        isPromise(rightSource) && (rightSource = observableFromPromise(rightSource));
        function choiceL() {
          if (!choice) {
            choice = leftChoice;
            rightSubscription.dispose();
          }
        }
        function choiceR() {
          if (!choice) {
            choice = rightChoice;
            leftSubscription.dispose();
          }
        }
        leftSubscription.setDisposable(leftSource.subscribe(function(left) {
          choiceL();
          if (choice === leftChoice) {
            observer.onNext(left);
          }
        }, function(err) {
          choiceL();
          if (choice === leftChoice) {
            observer.onError(err);
          }
        }, function() {
          choiceL();
          if (choice === leftChoice) {
            observer.onCompleted();
          }
        }));
        rightSubscription.setDisposable(rightSource.subscribe(function(right) {
          choiceR();
          if (choice === rightChoice) {
            observer.onNext(right);
          }
        }, function(err) {
          choiceR();
          if (choice === rightChoice) {
            observer.onError(err);
          }
        }, function() {
          choiceR();
          if (choice === rightChoice) {
            observer.onCompleted();
          }
        }));
        return new CompositeDisposable(leftSubscription, rightSubscription);
      });
    };
    Observable.amb = function() {
      var acc = observableNever(),
          items = [];
      if (Array.isArray(arguments[0])) {
        items = arguments[0];
      } else {
        for (var i = 0,
            len = arguments.length; i < len; i++) {
          items.push(arguments[i]);
        }
      }
      function func(previous, current) {
        return previous.amb(current);
      }
      for (var i = 0,
          len = items.length; i < len; i++) {
        acc = func(acc, items[i]);
      }
      return acc;
    };
    function observableCatchHandler(source, handler) {
      return new AnonymousObservable(function(o) {
        var d1 = new SingleAssignmentDisposable(),
            subscription = new SerialDisposable();
        subscription.setDisposable(d1);
        d1.setDisposable(source.subscribe(function(x) {
          o.onNext(x);
        }, function(e) {
          try {
            var result = handler(e);
          } catch (ex) {
            return o.onError(ex);
          }
          isPromise(result) && (result = observableFromPromise(result));
          var d = new SingleAssignmentDisposable();
          subscription.setDisposable(d);
          d.setDisposable(result.subscribe(o));
        }, function(x) {
          o.onCompleted(x);
        }));
        return subscription;
      }, source);
    }
    observableProto['catch'] = observableProto.catchError = observableProto.catchException = function(handlerOrSecond) {
      return typeof handlerOrSecond === 'function' ? observableCatchHandler(this, handlerOrSecond) : observableCatch([this, handlerOrSecond]);
    };
    var observableCatch = Observable.catchError = Observable['catch'] = Observable.catchException = function() {
      var items = [];
      if (Array.isArray(arguments[0])) {
        items = arguments[0];
      } else {
        for (var i = 0,
            len = arguments.length; i < len; i++) {
          items.push(arguments[i]);
        }
      }
      return enumerableOf(items).catchError();
    };
    observableProto.combineLatest = function() {
      var len = arguments.length,
          args = new Array(len);
      for (var i = 0; i < len; i++) {
        args[i] = arguments[i];
      }
      if (Array.isArray(args[0])) {
        args[0].unshift(this);
      } else {
        args.unshift(this);
      }
      return combineLatest.apply(this, args);
    };
    var combineLatest = Observable.combineLatest = function() {
      var len = arguments.length,
          args = new Array(len);
      for (var i = 0; i < len; i++) {
        args[i] = arguments[i];
      }
      var resultSelector = args.pop();
      Array.isArray(args[0]) && (args = args[0]);
      return new AnonymousObservable(function(o) {
        var n = args.length,
            falseFactory = function() {
              return false;
            },
            hasValue = arrayInitialize(n, falseFactory),
            hasValueAll = false,
            isDone = arrayInitialize(n, falseFactory),
            values = new Array(n);
        function next(i) {
          hasValue[i] = true;
          if (hasValueAll || (hasValueAll = hasValue.every(identity))) {
            try {
              var res = resultSelector.apply(null, values);
            } catch (e) {
              return o.onError(e);
            }
            o.onNext(res);
          } else if (isDone.filter(function(x, j) {
            return j !== i;
          }).every(identity)) {
            o.onCompleted();
          }
        }
        function done(i) {
          isDone[i] = true;
          isDone.every(identity) && o.onCompleted();
        }
        var subscriptions = new Array(n);
        for (var idx = 0; idx < n; idx++) {
          (function(i) {
            var source = args[i],
                sad = new SingleAssignmentDisposable();
            isPromise(source) && (source = observableFromPromise(source));
            sad.setDisposable(source.subscribe(function(x) {
              values[i] = x;
              next(i);
            }, function(e) {
              o.onError(e);
            }, function() {
              done(i);
            }));
            subscriptions[i] = sad;
          }(idx));
        }
        return new CompositeDisposable(subscriptions);
      }, this);
    };
    observableProto.concat = function() {
      for (var args = [],
          i = 0,
          len = arguments.length; i < len; i++) {
        args.push(arguments[i]);
      }
      args.unshift(this);
      return observableConcat.apply(null, args);
    };
    var observableConcat = Observable.concat = function() {
      var args;
      if (Array.isArray(arguments[0])) {
        args = arguments[0];
      } else {
        args = new Array(arguments.length);
        for (var i = 0,
            len = arguments.length; i < len; i++) {
          args[i] = arguments[i];
        }
      }
      return enumerableOf(args).concat();
    };
    observableProto.concatAll = observableProto.concatObservable = function() {
      return this.merge(1);
    };
    var MergeObservable = (function(__super__) {
      inherits(MergeObservable, __super__);
      function MergeObservable(source, maxConcurrent) {
        this.source = source;
        this.maxConcurrent = maxConcurrent;
        __super__.call(this);
      }
      MergeObservable.prototype.subscribeCore = function(observer) {
        var g = new CompositeDisposable();
        g.add(this.source.subscribe(new MergeObserver(observer, this.maxConcurrent, g)));
        return g;
      };
      return MergeObservable;
    }(ObservableBase));
    var MergeObserver = (function() {
      function MergeObserver(o, max, g) {
        this.o = o;
        this.max = max;
        this.g = g;
        this.done = false;
        this.q = [];
        this.activeCount = 0;
        this.isStopped = false;
      }
      MergeObserver.prototype.handleSubscribe = function(xs) {
        var sad = new SingleAssignmentDisposable();
        this.g.add(sad);
        isPromise(xs) && (xs = observableFromPromise(xs));
        sad.setDisposable(xs.subscribe(new InnerObserver(this, sad)));
      };
      MergeObserver.prototype.onNext = function(innerSource) {
        if (this.isStopped) {
          return;
        }
        if (this.activeCount < this.max) {
          this.activeCount++;
          this.handleSubscribe(innerSource);
        } else {
          this.q.push(innerSource);
        }
      };
      MergeObserver.prototype.onError = function(e) {
        if (!this.isStopped) {
          this.isStopped = true;
          this.o.onError(e);
        }
      };
      MergeObserver.prototype.onCompleted = function() {
        if (!this.isStopped) {
          this.isStopped = true;
          this.done = true;
          this.activeCount === 0 && this.o.onCompleted();
        }
      };
      MergeObserver.prototype.dispose = function() {
        this.isStopped = true;
      };
      MergeObserver.prototype.fail = function(e) {
        if (!this.isStopped) {
          this.isStopped = true;
          this.o.onError(e);
          return true;
        }
        return false;
      };
      function InnerObserver(parent, sad) {
        this.parent = parent;
        this.sad = sad;
        this.isStopped = false;
      }
      InnerObserver.prototype.onNext = function(x) {
        if (!this.isStopped) {
          this.parent.o.onNext(x);
        }
      };
      InnerObserver.prototype.onError = function(e) {
        if (!this.isStopped) {
          this.isStopped = true;
          this.parent.o.onError(e);
        }
      };
      InnerObserver.prototype.onCompleted = function() {
        if (!this.isStopped) {
          this.isStopped = true;
          var parent = this.parent;
          parent.g.remove(this.sad);
          if (parent.q.length > 0) {
            parent.handleSubscribe(parent.q.shift());
          } else {
            parent.activeCount--;
            parent.done && parent.activeCount === 0 && parent.o.onCompleted();
          }
        }
      };
      InnerObserver.prototype.dispose = function() {
        this.isStopped = true;
      };
      InnerObserver.prototype.fail = function(e) {
        if (!this.isStopped) {
          this.isStopped = true;
          this.parent.o.onError(e);
          return true;
        }
        return false;
      };
      return MergeObserver;
    }());
    observableProto.merge = function(maxConcurrentOrOther) {
      return typeof maxConcurrentOrOther !== 'number' ? observableMerge(this, maxConcurrentOrOther) : new MergeObservable(this, maxConcurrentOrOther);
    };
    var observableMerge = Observable.merge = function() {
      var scheduler,
          sources = [],
          i,
          len = arguments.length;
      if (!arguments[0]) {
        scheduler = immediateScheduler;
        for (i = 1; i < len; i++) {
          sources.push(arguments[i]);
        }
      } else if (isScheduler(arguments[0])) {
        scheduler = arguments[0];
        for (i = 1; i < len; i++) {
          sources.push(arguments[i]);
        }
      } else {
        scheduler = immediateScheduler;
        for (i = 0; i < len; i++) {
          sources.push(arguments[i]);
        }
      }
      if (Array.isArray(sources[0])) {
        sources = sources[0];
      }
      return observableOf(scheduler, sources).mergeAll();
    };
    var MergeAllObservable = (function(__super__) {
      inherits(MergeAllObservable, __super__);
      function MergeAllObservable(source) {
        this.source = source;
        __super__.call(this);
      }
      MergeAllObservable.prototype.subscribeCore = function(observer) {
        var g = new CompositeDisposable(),
            m = new SingleAssignmentDisposable();
        g.add(m);
        m.setDisposable(this.source.subscribe(new MergeAllObserver(observer, g)));
        return g;
      };
      return MergeAllObservable;
    }(ObservableBase));
    var MergeAllObserver = (function() {
      function MergeAllObserver(o, g) {
        this.o = o;
        this.g = g;
        this.isStopped = false;
        this.done = false;
      }
      MergeAllObserver.prototype.onNext = function(innerSource) {
        if (this.isStopped) {
          return;
        }
        var sad = new SingleAssignmentDisposable();
        this.g.add(sad);
        isPromise(innerSource) && (innerSource = observableFromPromise(innerSource));
        sad.setDisposable(innerSource.subscribe(new InnerObserver(this, this.g, sad)));
      };
      MergeAllObserver.prototype.onError = function(e) {
        if (!this.isStopped) {
          this.isStopped = true;
          this.o.onError(e);
        }
      };
      MergeAllObserver.prototype.onCompleted = function() {
        if (!this.isStopped) {
          this.isStopped = true;
          this.done = true;
          this.g.length === 1 && this.o.onCompleted();
        }
      };
      MergeAllObserver.prototype.dispose = function() {
        this.isStopped = true;
      };
      MergeAllObserver.prototype.fail = function(e) {
        if (!this.isStopped) {
          this.isStopped = true;
          this.o.onError(e);
          return true;
        }
        return false;
      };
      function InnerObserver(parent, g, sad) {
        this.parent = parent;
        this.g = g;
        this.sad = sad;
        this.isStopped = false;
      }
      InnerObserver.prototype.onNext = function(x) {
        if (!this.isStopped) {
          this.parent.o.onNext(x);
        }
      };
      InnerObserver.prototype.onError = function(e) {
        if (!this.isStopped) {
          this.isStopped = true;
          this.parent.o.onError(e);
        }
      };
      InnerObserver.prototype.onCompleted = function() {
        if (!this.isStopped) {
          var parent = this.parent;
          this.isStopped = true;
          parent.g.remove(this.sad);
          parent.done && parent.g.length === 1 && parent.o.onCompleted();
        }
      };
      InnerObserver.prototype.dispose = function() {
        this.isStopped = true;
      };
      InnerObserver.prototype.fail = function(e) {
        if (!this.isStopped) {
          this.isStopped = true;
          this.parent.o.onError(e);
          return true;
        }
        return false;
      };
      return MergeAllObserver;
    }());
    observableProto.mergeAll = observableProto.mergeObservable = function() {
      return new MergeAllObservable(this);
    };
    var CompositeError = Rx.CompositeError = function(errors) {
      this.name = "NotImplementedError";
      this.innerErrors = errors;
      this.message = 'This contains multiple errors. Check the innerErrors';
      Error.call(this);
    };
    CompositeError.prototype = Error.prototype;
    Observable.mergeDelayError = function() {
      var args;
      if (Array.isArray(arguments[0])) {
        args = arguments[0];
      } else {
        var len = arguments.length;
        args = new Array(len);
        for (var i = 0; i < len; i++) {
          args[i] = arguments[i];
        }
      }
      var source = observableOf(null, args);
      return new AnonymousObservable(function(o) {
        var group = new CompositeDisposable(),
            m = new SingleAssignmentDisposable(),
            isStopped = false,
            errors = [];
        function setCompletion() {
          if (errors.length === 0) {
            o.onCompleted();
          } else if (errors.length === 1) {
            o.onError(errors[0]);
          } else {
            o.onError(new CompositeError(errors));
          }
        }
        group.add(m);
        m.setDisposable(source.subscribe(function(innerSource) {
          var innerSubscription = new SingleAssignmentDisposable();
          group.add(innerSubscription);
          isPromise(innerSource) && (innerSource = observableFromPromise(innerSource));
          innerSubscription.setDisposable(innerSource.subscribe(function(x) {
            o.onNext(x);
          }, function(e) {
            errors.push(e);
            group.remove(innerSubscription);
            isStopped && group.length === 1 && setCompletion();
          }, function() {
            group.remove(innerSubscription);
            isStopped && group.length === 1 && setCompletion();
          }));
        }, function(e) {
          errors.push(e);
          isStopped = true;
          group.length === 1 && setCompletion();
        }, function() {
          isStopped = true;
          group.length === 1 && setCompletion();
        }));
        return group;
      });
    };
    observableProto.onErrorResumeNext = function(second) {
      if (!second) {
        throw new Error('Second observable is required');
      }
      return onErrorResumeNext([this, second]);
    };
    var onErrorResumeNext = Observable.onErrorResumeNext = function() {
      var sources = [];
      if (Array.isArray(arguments[0])) {
        sources = arguments[0];
      } else {
        for (var i = 0,
            len = arguments.length; i < len; i++) {
          sources.push(arguments[i]);
        }
      }
      return new AnonymousObservable(function(observer) {
        var pos = 0,
            subscription = new SerialDisposable(),
            cancelable = immediateScheduler.scheduleRecursive(function(self) {
              var current,
                  d;
              if (pos < sources.length) {
                current = sources[pos++];
                isPromise(current) && (current = observableFromPromise(current));
                d = new SingleAssignmentDisposable();
                subscription.setDisposable(d);
                d.setDisposable(current.subscribe(observer.onNext.bind(observer), self, self));
              } else {
                observer.onCompleted();
              }
            });
        return new CompositeDisposable(subscription, cancelable);
      });
    };
    observableProto.skipUntil = function(other) {
      var source = this;
      return new AnonymousObservable(function(o) {
        var isOpen = false;
        var disposables = new CompositeDisposable(source.subscribe(function(left) {
          isOpen && o.onNext(left);
        }, function(e) {
          o.onError(e);
        }, function() {
          isOpen && o.onCompleted();
        }));
        isPromise(other) && (other = observableFromPromise(other));
        var rightSubscription = new SingleAssignmentDisposable();
        disposables.add(rightSubscription);
        rightSubscription.setDisposable(other.subscribe(function() {
          isOpen = true;
          rightSubscription.dispose();
        }, function(e) {
          o.onError(e);
        }, function() {
          rightSubscription.dispose();
        }));
        return disposables;
      }, source);
    };
    observableProto['switch'] = observableProto.switchLatest = function() {
      var sources = this;
      return new AnonymousObservable(function(observer) {
        var hasLatest = false,
            innerSubscription = new SerialDisposable(),
            isStopped = false,
            latest = 0,
            subscription = sources.subscribe(function(innerSource) {
              var d = new SingleAssignmentDisposable(),
                  id = ++latest;
              hasLatest = true;
              innerSubscription.setDisposable(d);
              isPromise(innerSource) && (innerSource = observableFromPromise(innerSource));
              d.setDisposable(innerSource.subscribe(function(x) {
                latest === id && observer.onNext(x);
              }, function(e) {
                latest === id && observer.onError(e);
              }, function() {
                if (latest === id) {
                  hasLatest = false;
                  isStopped && observer.onCompleted();
                }
              }));
            }, function(e) {
              observer.onError(e);
            }, function() {
              isStopped = true;
              !hasLatest && observer.onCompleted();
            });
        return new CompositeDisposable(subscription, innerSubscription);
      }, sources);
    };
    observableProto.takeUntil = function(other) {
      var source = this;
      return new AnonymousObservable(function(o) {
        isPromise(other) && (other = observableFromPromise(other));
        return new CompositeDisposable(source.subscribe(o), other.subscribe(function() {
          o.onCompleted();
        }, function(e) {
          o.onError(e);
        }, noop));
      }, source);
    };
    observableProto.withLatestFrom = function() {
      var len = arguments.length,
          args = new Array(len);
      for (var i = 0; i < len; i++) {
        args[i] = arguments[i];
      }
      var resultSelector = args.pop(),
          source = this;
      if (typeof source === 'undefined') {
        throw new Error('Source observable not found for withLatestFrom().');
      }
      if (typeof resultSelector !== 'function') {
        throw new Error('withLatestFrom() expects a resultSelector function.');
      }
      if (Array.isArray(args[0])) {
        args = args[0];
      }
      return new AnonymousObservable(function(observer) {
        var falseFactory = function() {
          return false;
        },
            n = args.length,
            hasValue = arrayInitialize(n, falseFactory),
            hasValueAll = false,
            values = new Array(n);
        var subscriptions = new Array(n + 1);
        for (var idx = 0; idx < n; idx++) {
          (function(i) {
            var other = args[i],
                sad = new SingleAssignmentDisposable();
            isPromise(other) && (other = observableFromPromise(other));
            sad.setDisposable(other.subscribe(function(x) {
              values[i] = x;
              hasValue[i] = true;
              hasValueAll = hasValue.every(identity);
            }, observer.onError.bind(observer), function() {}));
            subscriptions[i] = sad;
          }(idx));
        }
        var sad = new SingleAssignmentDisposable();
        sad.setDisposable(source.subscribe(function(x) {
          var res;
          var allValues = [x].concat(values);
          if (!hasValueAll)
            return;
          try {
            res = resultSelector.apply(null, allValues);
          } catch (ex) {
            observer.onError(ex);
            return;
          }
          observer.onNext(res);
        }, observer.onError.bind(observer), function() {
          observer.onCompleted();
        }));
        subscriptions[n] = sad;
        return new CompositeDisposable(subscriptions);
      }, this);
    };
    function zipArray(second, resultSelector) {
      var first = this;
      return new AnonymousObservable(function(observer) {
        var index = 0,
            len = second.length;
        return first.subscribe(function(left) {
          if (index < len) {
            var right = second[index++],
                result;
            try {
              result = resultSelector(left, right);
            } catch (e) {
              return observer.onError(e);
            }
            observer.onNext(result);
          } else {
            observer.onCompleted();
          }
        }, function(e) {
          observer.onError(e);
        }, function() {
          observer.onCompleted();
        });
      }, first);
    }
    function falseFactory() {
      return false;
    }
    function emptyArrayFactory() {
      return [];
    }
    observableProto.zip = function() {
      if (Array.isArray(arguments[0])) {
        return zipArray.apply(this, arguments);
      }
      var len = arguments.length,
          args = new Array(len);
      for (var i = 0; i < len; i++) {
        args[i] = arguments[i];
      }
      var parent = this,
          resultSelector = args.pop();
      args.unshift(parent);
      return new AnonymousObservable(function(observer) {
        var n = args.length,
            queues = arrayInitialize(n, emptyArrayFactory),
            isDone = arrayInitialize(n, falseFactory);
        function next(i) {
          var res,
              queuedValues;
          if (queues.every(function(x) {
            return x.length > 0;
          })) {
            try {
              queuedValues = queues.map(function(x) {
                return x.shift();
              });
              res = resultSelector.apply(parent, queuedValues);
            } catch (ex) {
              observer.onError(ex);
              return;
            }
            observer.onNext(res);
          } else if (isDone.filter(function(x, j) {
            return j !== i;
          }).every(identity)) {
            observer.onCompleted();
          }
        }
        ;
        function done(i) {
          isDone[i] = true;
          if (isDone.every(function(x) {
            return x;
          })) {
            observer.onCompleted();
          }
        }
        var subscriptions = new Array(n);
        for (var idx = 0; idx < n; idx++) {
          (function(i) {
            var source = args[i],
                sad = new SingleAssignmentDisposable();
            isPromise(source) && (source = observableFromPromise(source));
            sad.setDisposable(source.subscribe(function(x) {
              queues[i].push(x);
              next(i);
            }, function(e) {
              observer.onError(e);
            }, function() {
              done(i);
            }));
            subscriptions[i] = sad;
          })(idx);
        }
        return new CompositeDisposable(subscriptions);
      }, parent);
    };
    Observable.zip = function() {
      var len = arguments.length,
          args = new Array(len);
      for (var i = 0; i < len; i++) {
        args[i] = arguments[i];
      }
      var first = args.shift();
      return first.zip.apply(first, args);
    };
    Observable.zipArray = function() {
      var sources;
      if (Array.isArray(arguments[0])) {
        sources = arguments[0];
      } else {
        var len = arguments.length;
        sources = new Array(len);
        for (var i = 0; i < len; i++) {
          sources[i] = arguments[i];
        }
      }
      return new AnonymousObservable(function(observer) {
        var n = sources.length,
            queues = arrayInitialize(n, function() {
              return [];
            }),
            isDone = arrayInitialize(n, function() {
              return false;
            });
        function next(i) {
          if (queues.every(function(x) {
            return x.length > 0;
          })) {
            var res = queues.map(function(x) {
              return x.shift();
            });
            observer.onNext(res);
          } else if (isDone.filter(function(x, j) {
            return j !== i;
          }).every(identity)) {
            observer.onCompleted();
            return;
          }
        }
        ;
        function done(i) {
          isDone[i] = true;
          if (isDone.every(identity)) {
            observer.onCompleted();
            return;
          }
        }
        var subscriptions = new Array(n);
        for (var idx = 0; idx < n; idx++) {
          (function(i) {
            subscriptions[i] = new SingleAssignmentDisposable();
            subscriptions[i].setDisposable(sources[i].subscribe(function(x) {
              queues[i].push(x);
              next(i);
            }, function(e) {
              observer.onError(e);
            }, function() {
              done(i);
            }));
          })(idx);
        }
        return new CompositeDisposable(subscriptions);
      });
    };
    observableProto.asObservable = function() {
      var source = this;
      return new AnonymousObservable(function(o) {
        return source.subscribe(o);
      }, this);
    };
    observableProto.bufferWithCount = function(count, skip) {
      if (typeof skip !== 'number') {
        skip = count;
      }
      return this.windowWithCount(count, skip).selectMany(function(x) {
        return x.toArray();
      }).where(function(x) {
        return x.length > 0;
      });
    };
    observableProto.dematerialize = function() {
      var source = this;
      return new AnonymousObservable(function(o) {
        return source.subscribe(function(x) {
          return x.accept(o);
        }, function(e) {
          o.onError(e);
        }, function() {
          o.onCompleted();
        });
      }, this);
    };
    observableProto.distinctUntilChanged = function(keySelector, comparer) {
      var source = this;
      comparer || (comparer = defaultComparer);
      return new AnonymousObservable(function(o) {
        var hasCurrentKey = false,
            currentKey;
        return source.subscribe(function(value) {
          var key = value;
          if (keySelector) {
            try {
              key = keySelector(value);
            } catch (e) {
              o.onError(e);
              return;
            }
          }
          if (hasCurrentKey) {
            try {
              var comparerEquals = comparer(currentKey, key);
            } catch (e) {
              o.onError(e);
              return;
            }
          }
          if (!hasCurrentKey || !comparerEquals) {
            hasCurrentKey = true;
            currentKey = key;
            o.onNext(value);
          }
        }, function(e) {
          o.onError(e);
        }, function() {
          o.onCompleted();
        });
      }, this);
    };
    observableProto['do'] = observableProto.tap = observableProto.doAction = function(observerOrOnNext, onError, onCompleted) {
      var source = this;
      return new AnonymousObservable(function(observer) {
        var tapObserver = !observerOrOnNext || isFunction(observerOrOnNext) ? observerCreate(observerOrOnNext || noop, onError || noop, onCompleted || noop) : observerOrOnNext;
        return source.subscribe(function(x) {
          try {
            tapObserver.onNext(x);
          } catch (e) {
            observer.onError(e);
          }
          observer.onNext(x);
        }, function(err) {
          try {
            tapObserver.onError(err);
          } catch (e) {
            observer.onError(e);
          }
          observer.onError(err);
        }, function() {
          try {
            tapObserver.onCompleted();
          } catch (e) {
            observer.onError(e);
          }
          observer.onCompleted();
        });
      }, this);
    };
    observableProto.doOnNext = observableProto.tapOnNext = function(onNext, thisArg) {
      return this.tap(typeof thisArg !== 'undefined' ? function(x) {
        onNext.call(thisArg, x);
      } : onNext);
    };
    observableProto.doOnError = observableProto.tapOnError = function(onError, thisArg) {
      return this.tap(noop, typeof thisArg !== 'undefined' ? function(e) {
        onError.call(thisArg, e);
      } : onError);
    };
    observableProto.doOnCompleted = observableProto.tapOnCompleted = function(onCompleted, thisArg) {
      return this.tap(noop, null, typeof thisArg !== 'undefined' ? function() {
        onCompleted.call(thisArg);
      } : onCompleted);
    };
    observableProto['finally'] = observableProto.ensure = function(action) {
      var source = this;
      return new AnonymousObservable(function(observer) {
        var subscription;
        try {
          subscription = source.subscribe(observer);
        } catch (e) {
          action();
          throw e;
        }
        return disposableCreate(function() {
          try {
            subscription.dispose();
          } catch (e) {
            throw e;
          } finally {
            action();
          }
        });
      }, this);
    };
    observableProto.finallyAction = function(action) {
      return this.ensure(action);
    };
    observableProto.ignoreElements = function() {
      var source = this;
      return new AnonymousObservable(function(o) {
        return source.subscribe(noop, function(e) {
          o.onError(e);
        }, function() {
          o.onCompleted();
        });
      }, source);
    };
    observableProto.materialize = function() {
      var source = this;
      return new AnonymousObservable(function(observer) {
        return source.subscribe(function(value) {
          observer.onNext(notificationCreateOnNext(value));
        }, function(e) {
          observer.onNext(notificationCreateOnError(e));
          observer.onCompleted();
        }, function() {
          observer.onNext(notificationCreateOnCompleted());
          observer.onCompleted();
        });
      }, source);
    };
    observableProto.repeat = function(repeatCount) {
      return enumerableRepeat(this, repeatCount).concat();
    };
    observableProto.retry = function(retryCount) {
      return enumerableRepeat(this, retryCount).catchError();
    };
    observableProto.retryWhen = function(notifier) {
      return enumerableRepeat(this).catchErrorWhen(notifier);
    };
    observableProto.scan = function() {
      var hasSeed = false,
          seed,
          accumulator,
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
            o.onError(e);
            return;
          }
          o.onNext(accumulation);
        }, function(e) {
          o.onError(e);
        }, function() {
          !hasValue && hasSeed && o.onNext(seed);
          o.onCompleted();
        });
      }, source);
    };
    observableProto.skipLast = function(count) {
      if (count < 0) {
        throw new ArgumentOutOfRangeError();
      }
      var source = this;
      return new AnonymousObservable(function(o) {
        var q = [];
        return source.subscribe(function(x) {
          q.push(x);
          q.length > count && o.onNext(q.shift());
        }, function(e) {
          o.onError(e);
        }, function() {
          o.onCompleted();
        });
      }, source);
    };
    observableProto.startWith = function() {
      var values,
          scheduler,
          start = 0;
      if (!!arguments.length && isScheduler(arguments[0])) {
        scheduler = arguments[0];
        start = 1;
      } else {
        scheduler = immediateScheduler;
      }
      for (var args = [],
          i = start,
          len = arguments.length; i < len; i++) {
        args.push(arguments[i]);
      }
      return enumerableOf([observableFromArray(args, scheduler), this]).concat();
    };
    observableProto.takeLast = function(count) {
      if (count < 0) {
        throw new ArgumentOutOfRangeError();
      }
      var source = this;
      return new AnonymousObservable(function(o) {
        var q = [];
        return source.subscribe(function(x) {
          q.push(x);
          q.length > count && q.shift();
        }, function(e) {
          o.onError(e);
        }, function() {
          while (q.length > 0) {
            o.onNext(q.shift());
          }
          o.onCompleted();
        });
      }, source);
    };
    observableProto.takeLastBuffer = function(count) {
      var source = this;
      return new AnonymousObservable(function(o) {
        var q = [];
        return source.subscribe(function(x) {
          q.push(x);
          q.length > count && q.shift();
        }, function(e) {
          o.onError(e);
        }, function() {
          o.onNext(q);
          o.onCompleted();
        });
      }, source);
    };
    observableProto.windowWithCount = function(count, skip) {
      var source = this;
      +count || (count = 0);
      Math.abs(count) === Infinity && (count = 0);
      if (count <= 0) {
        throw new ArgumentOutOfRangeError();
      }
      skip == null && (skip = count);
      +skip || (skip = 0);
      Math.abs(skip) === Infinity && (skip = 0);
      if (skip <= 0) {
        throw new ArgumentOutOfRangeError();
      }
      return new AnonymousObservable(function(observer) {
        var m = new SingleAssignmentDisposable(),
            refCountDisposable = new RefCountDisposable(m),
            n = 0,
            q = [];
        function createWindow() {
          var s = new Subject();
          q.push(s);
          observer.onNext(addRef(s, refCountDisposable));
        }
        createWindow();
        m.setDisposable(source.subscribe(function(x) {
          for (var i = 0,
              len = q.length; i < len; i++) {
            q[i].onNext(x);
          }
          var c = n - count + 1;
          c >= 0 && c % skip === 0 && q.shift().onCompleted();
          ++n % skip === 0 && createWindow();
        }, function(e) {
          while (q.length > 0) {
            q.shift().onError(e);
          }
          observer.onError(e);
        }, function() {
          while (q.length > 0) {
            q.shift().onCompleted();
          }
          observer.onCompleted();
        }));
        return refCountDisposable;
      }, source);
    };
    function concatMap(source, selector, thisArg) {
      var selectorFunc = bindCallback(selector, thisArg, 3);
      return source.map(function(x, i) {
        var result = selectorFunc(x, i, source);
        isPromise(result) && (result = observableFromPromise(result));
        (isArrayLike(result) || isIterable(result)) && (result = observableFrom(result));
        return result;
      }).concatAll();
    }
    observableProto.selectConcat = observableProto.concatMap = function(selector, resultSelector, thisArg) {
      if (isFunction(selector) && isFunction(resultSelector)) {
        return this.concatMap(function(x, i) {
          var selectorResult = selector(x, i);
          isPromise(selectorResult) && (selectorResult = observableFromPromise(selectorResult));
          (isArrayLike(selectorResult) || isIterable(selectorResult)) && (selectorResult = observableFrom(selectorResult));
          return selectorResult.map(function(y, i2) {
            return resultSelector(x, y, i, i2);
          });
        });
      }
      return isFunction(selector) ? concatMap(this, selector, thisArg) : concatMap(this, function() {
        return selector;
      });
    };
    observableProto.concatMapObserver = observableProto.selectConcatObserver = function(onNext, onError, onCompleted, thisArg) {
      var source = this,
          onNextFunc = bindCallback(onNext, thisArg, 2),
          onErrorFunc = bindCallback(onError, thisArg, 1),
          onCompletedFunc = bindCallback(onCompleted, thisArg, 0);
      return new AnonymousObservable(function(observer) {
        var index = 0;
        return source.subscribe(function(x) {
          var result;
          try {
            result = onNextFunc(x, index++);
          } catch (e) {
            observer.onError(e);
            return;
          }
          isPromise(result) && (result = observableFromPromise(result));
          observer.onNext(result);
        }, function(err) {
          var result;
          try {
            result = onErrorFunc(err);
          } catch (e) {
            observer.onError(e);
            return;
          }
          isPromise(result) && (result = observableFromPromise(result));
          observer.onNext(result);
          observer.onCompleted();
        }, function() {
          var result;
          try {
            result = onCompletedFunc();
          } catch (e) {
            observer.onError(e);
            return;
          }
          isPromise(result) && (result = observableFromPromise(result));
          observer.onNext(result);
          observer.onCompleted();
        });
      }, this).concatAll();
    };
    observableProto.defaultIfEmpty = function(defaultValue) {
      var source = this;
      defaultValue === undefined && (defaultValue = null);
      return new AnonymousObservable(function(observer) {
        var found = false;
        return source.subscribe(function(x) {
          found = true;
          observer.onNext(x);
        }, function(e) {
          observer.onError(e);
        }, function() {
          !found && observer.onNext(defaultValue);
          observer.onCompleted();
        });
      }, source);
    };
    function arrayIndexOfComparer(array, item, comparer) {
      for (var i = 0,
          len = array.length; i < len; i++) {
        if (comparer(array[i], item)) {
          return i;
        }
      }
      return -1;
    }
    function HashSet(comparer) {
      this.comparer = comparer;
      this.set = [];
    }
    HashSet.prototype.push = function(value) {
      var retValue = arrayIndexOfComparer(this.set, value, this.comparer) === -1;
      retValue && this.set.push(value);
      return retValue;
    };
    observableProto.distinct = function(keySelector, comparer) {
      var source = this;
      comparer || (comparer = defaultComparer);
      return new AnonymousObservable(function(o) {
        var hashSet = new HashSet(comparer);
        return source.subscribe(function(x) {
          var key = x;
          if (keySelector) {
            try {
              key = keySelector(x);
            } catch (e) {
              o.onError(e);
              return;
            }
          }
          hashSet.push(key) && o.onNext(x);
        }, function(e) {
          o.onError(e);
        }, function() {
          o.onCompleted();
        });
      }, this);
    };
    var MapObservable = (function(__super__) {
      inherits(MapObservable, __super__);
      function MapObservable(source, selector, thisArg) {
        this.source = source;
        this.selector = bindCallback(selector, thisArg, 3);
        __super__.call(this);
      }
      MapObservable.prototype.internalMap = function(selector, thisArg) {
        var self = this;
        return new MapObservable(this.source, function(x, i, o) {
          return selector.call(this, self.selector(x, i, o), i, o);
        }, thisArg);
      };
      MapObservable.prototype.subscribeCore = function(observer) {
        return this.source.subscribe(new MapObserver(observer, this.selector, this));
      };
      return MapObservable;
    }(ObservableBase));
    function MapObserver(observer, selector, source) {
      this.observer = observer;
      this.selector = selector;
      this.source = source;
      this.i = 0;
      this.isStopped = false;
    }
    MapObserver.prototype.onNext = function(x) {
      if (this.isStopped) {
        return;
      }
      var result = tryCatch(this.selector).call(this, x, this.i++, this.source);
      if (result === errorObj) {
        return this.observer.onError(result.e);
      }
      this.observer.onNext(result);
    };
    MapObserver.prototype.onError = function(e) {
      if (!this.isStopped) {
        this.isStopped = true;
        this.observer.onError(e);
      }
    };
    MapObserver.prototype.onCompleted = function() {
      if (!this.isStopped) {
        this.isStopped = true;
        this.observer.onCompleted();
      }
    };
    MapObserver.prototype.dispose = function() {
      this.isStopped = true;
    };
    MapObserver.prototype.fail = function(e) {
      if (!this.isStopped) {
        this.isStopped = true;
        this.observer.onError(e);
        return true;
      }
      return false;
    };
    observableProto.map = observableProto.select = function(selector, thisArg) {
      var selectorFn = typeof selector === 'function' ? selector : function() {
        return selector;
      };
      return this instanceof MapObservable ? this.internalMap(selectorFn, thisArg) : new MapObservable(this, selectorFn, thisArg);
    };
    observableProto.pluck = function() {
      var args = arguments,
          len = arguments.length;
      if (len === 0) {
        throw new Error('List of properties cannot be empty.');
      }
      return this.map(function(x) {
        var currentProp = x;
        for (var i = 0; i < len; i++) {
          var p = currentProp[args[i]];
          if (typeof p !== 'undefined') {
            currentProp = p;
          } else {
            return undefined;
          }
        }
        return currentProp;
      });
    };
    function flatMap(source, selector, thisArg) {
      var selectorFunc = bindCallback(selector, thisArg, 3);
      return source.map(function(x, i) {
        var result = selectorFunc(x, i, source);
        isPromise(result) && (result = observableFromPromise(result));
        (isArrayLike(result) || isIterable(result)) && (result = observableFrom(result));
        return result;
      }).mergeAll();
    }
    observableProto.selectMany = observableProto.flatMap = function(selector, resultSelector, thisArg) {
      if (isFunction(selector) && isFunction(resultSelector)) {
        return this.flatMap(function(x, i) {
          var selectorResult = selector(x, i);
          isPromise(selectorResult) && (selectorResult = observableFromPromise(selectorResult));
          (isArrayLike(selectorResult) || isIterable(selectorResult)) && (selectorResult = observableFrom(selectorResult));
          return selectorResult.map(function(y, i2) {
            return resultSelector(x, y, i, i2);
          });
        }, thisArg);
      }
      return isFunction(selector) ? flatMap(this, selector, thisArg) : flatMap(this, function() {
        return selector;
      });
    };
    observableProto.flatMapObserver = observableProto.selectManyObserver = function(onNext, onError, onCompleted, thisArg) {
      var source = this;
      return new AnonymousObservable(function(observer) {
        var index = 0;
        return source.subscribe(function(x) {
          var result;
          try {
            result = onNext.call(thisArg, x, index++);
          } catch (e) {
            observer.onError(e);
            return;
          }
          isPromise(result) && (result = observableFromPromise(result));
          observer.onNext(result);
        }, function(err) {
          var result;
          try {
            result = onError.call(thisArg, err);
          } catch (e) {
            observer.onError(e);
            return;
          }
          isPromise(result) && (result = observableFromPromise(result));
          observer.onNext(result);
          observer.onCompleted();
        }, function() {
          var result;
          try {
            result = onCompleted.call(thisArg);
          } catch (e) {
            observer.onError(e);
            return;
          }
          isPromise(result) && (result = observableFromPromise(result));
          observer.onNext(result);
          observer.onCompleted();
        });
      }, source).mergeAll();
    };
    observableProto.selectSwitch = observableProto.flatMapLatest = observableProto.switchMap = function(selector, thisArg) {
      return this.select(selector, thisArg).switchLatest();
    };
    observableProto.skip = function(count) {
      if (count < 0) {
        throw new ArgumentOutOfRangeError();
      }
      var source = this;
      return new AnonymousObservable(function(o) {
        var remaining = count;
        return source.subscribe(function(x) {
          if (remaining <= 0) {
            o.onNext(x);
          } else {
            remaining--;
          }
        }, function(e) {
          o.onError(e);
        }, function() {
          o.onCompleted();
        });
      }, source);
    };
    observableProto.skipWhile = function(predicate, thisArg) {
      var source = this,
          callback = bindCallback(predicate, thisArg, 3);
      return new AnonymousObservable(function(o) {
        var i = 0,
            running = false;
        return source.subscribe(function(x) {
          if (!running) {
            try {
              running = !callback(x, i++, source);
            } catch (e) {
              o.onError(e);
              return;
            }
          }
          running && o.onNext(x);
        }, function(e) {
          o.onError(e);
        }, function() {
          o.onCompleted();
        });
      }, source);
    };
    observableProto.take = function(count, scheduler) {
      if (count < 0) {
        throw new ArgumentOutOfRangeError();
      }
      if (count === 0) {
        return observableEmpty(scheduler);
      }
      var source = this;
      return new AnonymousObservable(function(o) {
        var remaining = count;
        return source.subscribe(function(x) {
          if (remaining-- > 0) {
            o.onNext(x);
            remaining === 0 && o.onCompleted();
          }
        }, function(e) {
          o.onError(e);
        }, function() {
          o.onCompleted();
        });
      }, source);
    };
    observableProto.takeWhile = function(predicate, thisArg) {
      var source = this,
          callback = bindCallback(predicate, thisArg, 3);
      return new AnonymousObservable(function(o) {
        var i = 0,
            running = true;
        return source.subscribe(function(x) {
          if (running) {
            try {
              running = callback(x, i++, source);
            } catch (e) {
              o.onError(e);
              return;
            }
            if (running) {
              o.onNext(x);
            } else {
              o.onCompleted();
            }
          }
        }, function(e) {
          o.onError(e);
        }, function() {
          o.onCompleted();
        });
      }, source);
    };
    var FilterObservable = (function(__super__) {
      inherits(FilterObservable, __super__);
      function FilterObservable(source, predicate, thisArg) {
        this.source = source;
        this.predicate = bindCallback(predicate, thisArg, 3);
        __super__.call(this);
      }
      FilterObservable.prototype.subscribeCore = function(observer) {
        return this.source.subscribe(new FilterObserver(observer, this.predicate, this));
      };
      FilterObservable.prototype.internalFilter = function(predicate, thisArg) {
        var self = this;
        return new FilterObservable(this.source, function(x, i, o) {
          return self.predicate(x, i, o) && predicate.call(this, x, i, o);
        }, thisArg);
      };
      return FilterObservable;
    }(ObservableBase));
    function FilterObserver(observer, predicate, source) {
      this.observer = observer;
      this.predicate = predicate;
      this.source = source;
      this.i = 0;
      this.isStopped = false;
    }
    FilterObserver.prototype.onNext = function(x) {
      if (this.isStopped) {
        return;
      }
      var shouldYield = tryCatch(this.predicate).call(this, x, this.i++, this.source);
      if (shouldYield === errorObj) {
        return this.observer.onError(shouldYield.e);
      }
      shouldYield && this.observer.onNext(x);
    };
    FilterObserver.prototype.onError = function(e) {
      if (!this.isStopped) {
        this.isStopped = true;
        this.observer.onError(e);
      }
    };
    FilterObserver.prototype.onCompleted = function() {
      if (!this.isStopped) {
        this.isStopped = true;
        this.observer.onCompleted();
      }
    };
    FilterObserver.prototype.dispose = function() {
      this.isStopped = true;
    };
    FilterObserver.prototype.fail = function(e) {
      if (!this.isStopped) {
        this.isStopped = true;
        this.observer.onError(e);
        return true;
      }
      return false;
    };
    observableProto.filter = observableProto.where = function(predicate, thisArg) {
      return this instanceof FilterObservable ? this.internalFilter(predicate, thisArg) : new FilterObservable(this, predicate, thisArg);
    };
    observableProto.transduce = function(transducer) {
      var source = this;
      function transformForObserver(o) {
        return {
          '@@transducer/init': function() {
            return o;
          },
          '@@transducer/step': function(obs, input) {
            return obs.onNext(input);
          },
          '@@transducer/result': function(obs) {
            return obs.onCompleted();
          }
        };
      }
      return new AnonymousObservable(function(o) {
        var xform = transducer(transformForObserver(o));
        return source.subscribe(function(v) {
          try {
            xform['@@transducer/step'](o, v);
          } catch (e) {
            o.onError(e);
          }
        }, function(e) {
          o.onError(e);
        }, function() {
          xform['@@transducer/result'](o);
        });
      }, source);
    };
    var AnonymousObservable = Rx.AnonymousObservable = (function(__super__) {
      inherits(AnonymousObservable, __super__);
      function fixSubscriber(subscriber) {
        return subscriber && isFunction(subscriber.dispose) ? subscriber : isFunction(subscriber) ? disposableCreate(subscriber) : disposableEmpty;
      }
      function setDisposable(s, state) {
        var ado = state[0],
            subscribe = state[1];
        var sub = tryCatch(subscribe)(ado);
        if (sub === errorObj) {
          if (!ado.fail(errorObj.e)) {
            return thrower(errorObj.e);
          }
        }
        ado.setDisposable(fixSubscriber(sub));
      }
      function AnonymousObservable(subscribe, parent) {
        this.source = parent;
        function s(observer) {
          var ado = new AutoDetachObserver(observer),
              state = [ado, subscribe];
          if (currentThreadScheduler.scheduleRequired()) {
            currentThreadScheduler.scheduleWithState(state, setDisposable);
          } else {
            setDisposable(null, state);
          }
          return ado;
        }
        __super__.call(this, s);
      }
      return AnonymousObservable;
    }(Observable));
    var AutoDetachObserver = (function(__super__) {
      inherits(AutoDetachObserver, __super__);
      function AutoDetachObserver(observer) {
        __super__.call(this);
        this.observer = observer;
        this.m = new SingleAssignmentDisposable();
      }
      var AutoDetachObserverPrototype = AutoDetachObserver.prototype;
      AutoDetachObserverPrototype.next = function(value) {
        var result = tryCatch(this.observer.onNext).call(this.observer, value);
        if (result === errorObj) {
          this.dispose();
          thrower(result.e);
        }
      };
      AutoDetachObserverPrototype.error = function(err) {
        var result = tryCatch(this.observer.onError).call(this.observer, err);
        this.dispose();
        result === errorObj && thrower(result.e);
      };
      AutoDetachObserverPrototype.completed = function() {
        var result = tryCatch(this.observer.onCompleted).call(this.observer);
        this.dispose();
        result === errorObj && thrower(result.e);
      };
      AutoDetachObserverPrototype.setDisposable = function(value) {
        this.m.setDisposable(value);
      };
      AutoDetachObserverPrototype.getDisposable = function() {
        return this.m.getDisposable();
      };
      AutoDetachObserverPrototype.dispose = function() {
        __super__.prototype.dispose.call(this);
        this.m.dispose();
      };
      return AutoDetachObserver;
    }(AbstractObserver));
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
    var Subject = Rx.Subject = (function(__super__) {
      function subscribe(observer) {
        checkDisposed(this);
        if (!this.isStopped) {
          this.observers.push(observer);
          return new InnerSubscription(this, observer);
        }
        if (this.hasError) {
          observer.onError(this.error);
          return disposableEmpty;
        }
        observer.onCompleted();
        return disposableEmpty;
      }
      inherits(Subject, __super__);
      function Subject() {
        __super__.call(this, subscribe);
        this.isDisposed = false, this.isStopped = false, this.observers = [];
        this.hasError = false;
      }
      addProperties(Subject.prototype, Observer.prototype, {
        hasObservers: function() {
          return this.observers.length > 0;
        },
        onCompleted: function() {
          checkDisposed(this);
          if (!this.isStopped) {
            this.isStopped = true;
            for (var i = 0,
                os = cloneArray(this.observers),
                len = os.length; i < len; i++) {
              os[i].onCompleted();
            }
            this.observers.length = 0;
          }
        },
        onError: function(error) {
          checkDisposed(this);
          if (!this.isStopped) {
            this.isStopped = true;
            this.error = error;
            this.hasError = true;
            for (var i = 0,
                os = cloneArray(this.observers),
                len = os.length; i < len; i++) {
              os[i].onError(error);
            }
            this.observers.length = 0;
          }
        },
        onNext: function(value) {
          checkDisposed(this);
          if (!this.isStopped) {
            for (var i = 0,
                os = cloneArray(this.observers),
                len = os.length; i < len; i++) {
              os[i].onNext(value);
            }
          }
        },
        dispose: function() {
          this.isDisposed = true;
          this.observers = null;
        }
      });
      Subject.create = function(observer, observable) {
        return new AnonymousSubject(observer, observable);
      };
      return Subject;
    }(Observable));
    var AsyncSubject = Rx.AsyncSubject = (function(__super__) {
      function subscribe(observer) {
        checkDisposed(this);
        if (!this.isStopped) {
          this.observers.push(observer);
          return new InnerSubscription(this, observer);
        }
        if (this.hasError) {
          observer.onError(this.error);
        } else if (this.hasValue) {
          observer.onNext(this.value);
          observer.onCompleted();
        } else {
          observer.onCompleted();
        }
        return disposableEmpty;
      }
      inherits(AsyncSubject, __super__);
      function AsyncSubject() {
        __super__.call(this, subscribe);
        this.isDisposed = false;
        this.isStopped = false;
        this.hasValue = false;
        this.observers = [];
        this.hasError = false;
      }
      addProperties(AsyncSubject.prototype, Observer, {
        hasObservers: function() {
          checkDisposed(this);
          return this.observers.length > 0;
        },
        onCompleted: function() {
          var i,
              len;
          checkDisposed(this);
          if (!this.isStopped) {
            this.isStopped = true;
            var os = cloneArray(this.observers),
                len = os.length;
            if (this.hasValue) {
              for (i = 0; i < len; i++) {
                var o = os[i];
                o.onNext(this.value);
                o.onCompleted();
              }
            } else {
              for (i = 0; i < len; i++) {
                os[i].onCompleted();
              }
            }
            this.observers.length = 0;
          }
        },
        onError: function(error) {
          checkDisposed(this);
          if (!this.isStopped) {
            this.isStopped = true;
            this.hasError = true;
            this.error = error;
            for (var i = 0,
                os = cloneArray(this.observers),
                len = os.length; i < len; i++) {
              os[i].onError(error);
            }
            this.observers.length = 0;
          }
        },
        onNext: function(value) {
          checkDisposed(this);
          if (this.isStopped) {
            return;
          }
          this.value = value;
          this.hasValue = true;
        },
        dispose: function() {
          this.isDisposed = true;
          this.observers = null;
          this.exception = null;
          this.value = null;
        }
      });
      return AsyncSubject;
    }(Observable));
    var AnonymousSubject = Rx.AnonymousSubject = (function(__super__) {
      inherits(AnonymousSubject, __super__);
      function subscribe(observer) {
        return this.observable.subscribe(observer);
      }
      function AnonymousSubject(observer, observable) {
        this.observer = observer;
        this.observable = observable;
        __super__.call(this, subscribe);
      }
      addProperties(AnonymousSubject.prototype, Observer.prototype, {
        onCompleted: function() {
          this.observer.onCompleted();
        },
        onError: function(error) {
          this.observer.onError(error);
        },
        onNext: function(value) {
          this.observer.onNext(value);
        }
      });
      return AnonymousSubject;
    }(Observable));
    if (typeof define == 'function' && typeof define.amd == 'object' && define.amd) {
      root.Rx = Rx;
      define(function() {
        return Rx;
      });
    } else if (freeExports && freeModule) {
      if (moduleExports) {
        (freeModule.exports = Rx).Rx = Rx;
      } else {
        freeExports.Rx = Rx;
      }
    } else {
      root.Rx = Rx;
    }
    var rEndingLine = captureLine();
  }.call(this));
})(require("process"));

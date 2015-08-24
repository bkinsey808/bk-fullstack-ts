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
      observableNever = Observable.never,
      isEqual = Rx.internals.isEqual,
      defaultSubComparer = Rx.helpers.defaultSubComparer;
  observableProto.jortSort = function() {
    return this.jortSortUntil(observableNever());
  };
  observableProto.jortSortUntil = function(other) {
    var source = this;
    return new AnonymousObservable(function(observer) {
      var arr = [];
      return source.takeUntil(other).subscribe(arr.push.bind(arr), observer.onError.bind(observer), function() {
        var sorted = arr.slice(0).sort(defaultSubComparer);
        observer.onNext(isEqual(arr, sorted));
        observer.onCompleted();
      });
    }, source);
  };
  return Rx;
}));

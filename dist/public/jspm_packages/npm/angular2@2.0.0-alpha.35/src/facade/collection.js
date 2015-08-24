/* */ 
'use strict';
var lang_1 = require("./lang");
exports.List = lang_1.global.Array;
exports.Map = lang_1.global.Map;
exports.Set = lang_1.global.Set;
exports.StringMap = lang_1.global.Object;
var createMapFromPairs = (function() {
  try {
    if (new exports.Map([[1, 2]]).size === 1) {
      return function createMapFromPairs(pairs) {
        return new exports.Map(pairs);
      };
    }
  } catch (e) {}
  return function createMapAndPopulateFromPairs(pairs) {
    var map = new exports.Map();
    for (var i = 0; i < pairs.length; i++) {
      var pair = pairs[i];
      map.set(pair[0], pair[1]);
    }
    return map;
  };
})();
var createMapFromMap = (function() {
  try {
    if (new exports.Map(new exports.Map())) {
      return function createMapFromMap(m) {
        return new exports.Map(m);
      };
    }
  } catch (e) {}
  return function createMapAndPopulateFromMap(m) {
    var map = new exports.Map();
    m.forEach(function(v, k) {
      map.set(k, v);
    });
    return map;
  };
})();
var _clearValues = (function() {
  if ((new exports.Map()).keys().next) {
    return function _clearValues(m) {
      var keyIterator = m.keys();
      var k;
      while (!((k = keyIterator.next()).done)) {
        m.set(k.value, null);
      }
    };
  } else {
    return function _clearValuesWithForeEach(m) {
      m.forEach(function(v, k) {
        m.set(k, null);
      });
    };
  }
})();
var _arrayFromMap = (function() {
  try {
    if ((new exports.Map()).values().next) {
      return function createArrayFromMap(m, getValues) {
        return getValues ? Array.from(m.values()) : Array.from(m.keys());
      };
    }
  } catch (e) {}
  return function createArrayFromMapWithForeach(m, getValues) {
    var res = ListWrapper.createFixedSize(m.size),
        i = 0;
    m.forEach(function(v, k) {
      ListWrapper.set(res, i, getValues ? v : k);
      i++;
    });
    return res;
  };
})();
var MapWrapper = (function() {
  function MapWrapper() {}
  MapWrapper.clone = function(m) {
    return createMapFromMap(m);
  };
  MapWrapper.createFromStringMap = function(stringMap) {
    var result = new exports.Map();
    for (var prop in stringMap) {
      result.set(prop, stringMap[prop]);
    }
    return result;
  };
  MapWrapper.toStringMap = function(m) {
    var r = {};
    m.forEach(function(v, k) {
      return r[k] = v;
    });
    return r;
  };
  MapWrapper.createFromPairs = function(pairs) {
    return createMapFromPairs(pairs);
  };
  MapWrapper.forEach = function(m, fn) {
    m.forEach(fn);
  };
  MapWrapper.get = function(map, key) {
    return map.get(key);
  };
  MapWrapper.size = function(m) {
    return m.size;
  };
  MapWrapper.delete = function(m, k) {
    m.delete(k);
  };
  MapWrapper.clearValues = function(m) {
    _clearValues(m);
  };
  MapWrapper.iterable = function(m) {
    return m;
  };
  MapWrapper.keys = function(m) {
    return _arrayFromMap(m, false);
  };
  MapWrapper.values = function(m) {
    return _arrayFromMap(m, true);
  };
  return MapWrapper;
})();
exports.MapWrapper = MapWrapper;
var StringMapWrapper = (function() {
  function StringMapWrapper() {}
  StringMapWrapper.create = function() {
    return {};
  };
  StringMapWrapper.contains = function(map, key) {
    return map.hasOwnProperty(key);
  };
  StringMapWrapper.get = function(map, key) {
    return map.hasOwnProperty(key) ? map[key] : undefined;
  };
  StringMapWrapper.set = function(map, key, value) {
    map[key] = value;
  };
  StringMapWrapper.keys = function(map) {
    return Object.keys(map);
  };
  StringMapWrapper.isEmpty = function(map) {
    for (var prop in map) {
      return false;
    }
    return true;
  };
  StringMapWrapper.delete = function(map, key) {
    delete map[key];
  };
  StringMapWrapper.forEach = function(map, callback) {
    for (var prop in map) {
      if (map.hasOwnProperty(prop)) {
        callback(map[prop], prop);
      }
    }
  };
  StringMapWrapper.merge = function(m1, m2) {
    var m = {};
    for (var attr in m1) {
      if (m1.hasOwnProperty(attr)) {
        m[attr] = m1[attr];
      }
    }
    for (var attr in m2) {
      if (m2.hasOwnProperty(attr)) {
        m[attr] = m2[attr];
      }
    }
    return m;
  };
  StringMapWrapper.equals = function(m1, m2) {
    var k1 = Object.keys(m1);
    var k2 = Object.keys(m2);
    if (k1.length != k2.length) {
      return false;
    }
    var key;
    for (var i = 0; i < k1.length; i++) {
      key = k1[i];
      if (m1[key] !== m2[key]) {
        return false;
      }
    }
    return true;
  };
  return StringMapWrapper;
})();
exports.StringMapWrapper = StringMapWrapper;
var ListWrapper = (function() {
  function ListWrapper() {}
  ListWrapper.createFixedSize = function(size) {
    return new exports.List(size);
  };
  ListWrapper.createGrowableSize = function(size) {
    return new exports.List(size);
  };
  ListWrapper.get = function(m, k) {
    return m[k];
  };
  ListWrapper.set = function(m, k, v) {
    m[k] = v;
  };
  ListWrapper.clone = function(array) {
    return array.slice(0);
  };
  ListWrapper.map = function(array, fn) {
    return array.map(fn);
  };
  ListWrapper.forEach = function(array, fn) {
    for (var i = 0; i < array.length; i++) {
      fn(array[i]);
    }
  };
  ListWrapper.first = function(array) {
    if (!array)
      return null;
    return array[0];
  };
  ListWrapper.last = function(array) {
    if (!array || array.length == 0)
      return null;
    return array[array.length - 1];
  };
  ListWrapper.find = function(list, pred) {
    for (var i = 0; i < list.length; ++i) {
      if (pred(list[i]))
        return list[i];
    }
    return null;
  };
  ListWrapper.indexOf = function(array, value, startIndex) {
    if (startIndex === void 0) {
      startIndex = 0;
    }
    return array.indexOf(value, startIndex);
  };
  ListWrapper.reduce = function(list, fn, init) {
    return list.reduce(fn, init);
  };
  ListWrapper.filter = function(array, pred) {
    return array.filter(pred);
  };
  ListWrapper.any = function(list, pred) {
    for (var i = 0; i < list.length; ++i) {
      if (pred(list[i]))
        return true;
    }
    return false;
  };
  ListWrapper.contains = function(list, el) {
    return list.indexOf(el) !== -1;
  };
  ListWrapper.reversed = function(array) {
    var a = ListWrapper.clone(array);
    return a.reverse();
  };
  ListWrapper.concat = function(a, b) {
    return a.concat(b);
  };
  ListWrapper.insert = function(list, index, value) {
    list.splice(index, 0, value);
  };
  ListWrapper.removeAt = function(list, index) {
    var res = list[index];
    list.splice(index, 1);
    return res;
  };
  ListWrapper.removeAll = function(list, items) {
    for (var i = 0; i < items.length; ++i) {
      var index = list.indexOf(items[i]);
      list.splice(index, 1);
    }
  };
  ListWrapper.removeLast = function(list) {
    return list.pop();
  };
  ListWrapper.remove = function(list, el) {
    var index = list.indexOf(el);
    if (index > -1) {
      list.splice(index, 1);
      return true;
    }
    return false;
  };
  ListWrapper.clear = function(list) {
    list.splice(0, list.length);
  };
  ListWrapper.join = function(list, s) {
    return list.join(s);
  };
  ListWrapper.isEmpty = function(list) {
    return list.length == 0;
  };
  ListWrapper.fill = function(list, value, start, end) {
    if (start === void 0) {
      start = 0;
    }
    if (end === void 0) {
      end = null;
    }
    list.fill(value, start, end === null ? undefined : end);
  };
  ListWrapper.equals = function(a, b) {
    if (a.length != b.length)
      return false;
    for (var i = 0; i < a.length; ++i) {
      if (a[i] !== b[i])
        return false;
    }
    return true;
  };
  ListWrapper.slice = function(l, from, to) {
    if (from === void 0) {
      from = 0;
    }
    if (to === void 0) {
      to = null;
    }
    return l.slice(from, to === null ? undefined : to);
  };
  ListWrapper.splice = function(l, from, length) {
    return l.splice(from, length);
  };
  ListWrapper.sort = function(l, compareFn) {
    if (lang_1.isPresent(compareFn)) {
      l.sort(compareFn);
    } else {
      l.sort();
    }
  };
  ListWrapper.toString = function(l) {
    return l.toString();
  };
  ListWrapper.toJSON = function(l) {
    return JSON.stringify(l);
  };
  return ListWrapper;
})();
exports.ListWrapper = ListWrapper;
function isListLikeIterable(obj) {
  if (!lang_1.isJsObject(obj))
    return false;
  return lang_1.isArray(obj) || (!(obj instanceof exports.Map) && Symbol.iterator in obj);
}
exports.isListLikeIterable = isListLikeIterable;
function iterateListLike(obj, fn) {
  if (lang_1.isArray(obj)) {
    for (var i = 0; i < obj.length; i++) {
      fn(obj[i]);
    }
  } else {
    var iterator = obj[Symbol.iterator]();
    var item;
    while (!((item = iterator.next()).done)) {
      fn(item.value);
    }
  }
}
exports.iterateListLike = iterateListLike;
var createSetFromList = (function() {
  var test = new exports.Set([1, 2, 3]);
  if (test.size === 3) {
    return function createSetFromList(lst) {
      return new exports.Set(lst);
    };
  } else {
    return function createSetAndPopulateFromList(lst) {
      var res = new exports.Set(lst);
      if (res.size !== lst.length) {
        for (var i = 0; i < lst.length; i++) {
          res.add(lst[i]);
        }
      }
      return res;
    };
  }
})();
var SetWrapper = (function() {
  function SetWrapper() {}
  SetWrapper.createFromList = function(lst) {
    return createSetFromList(lst);
  };
  SetWrapper.has = function(s, key) {
    return s.has(key);
  };
  SetWrapper.delete = function(m, k) {
    m.delete(k);
  };
  return SetWrapper;
})();
exports.SetWrapper = SetWrapper;

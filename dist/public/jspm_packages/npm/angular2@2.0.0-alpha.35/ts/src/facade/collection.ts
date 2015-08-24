import {isJsObject, global, isPresent, isArray} from 'angular2/src/facade/lang';

export var List = global.Array;
export var Map = global.Map;
export var Set = global.Set;
export var StringMap = global.Object;

// Safari and Internet Explorer do not support the iterable parameter to the
// Map constructor.  We work around that by manually adding the items.
var createMapFromPairs: {(pairs: List<any>): Map<any, any>} = (function() {
  try {
    if (new Map([[1, 2]]).size === 1) {
      return function createMapFromPairs(pairs: List<any>):
          Map<any, any> { return new Map(pairs); };
    }
  } catch (e) {
  }
  return function createMapAndPopulateFromPairs(pairs: List<any>): Map<any, any> {
    var map = new Map();
    for (var i = 0; i < pairs.length; i++) {
      var pair = pairs[i];
      map.set(pair[0], pair[1]);
    }
    return map;
  };
})();
var createMapFromMap: {(m: Map<any, any>): Map<any, any>} = (function() {
  try {
    if (new Map(new Map())) {
      return function createMapFromMap(m: Map<any, any>): Map<any, any> { return new Map(m); };
    }
  } catch (e) {
  }
  return function createMapAndPopulateFromMap(m: Map<any, any>): Map<any, any> {
    var map = new Map();
    m.forEach((v, k) => { map.set(k, v); });
    return map;
  };
})();
var _clearValues: {(m: Map<any, any>)} = (function() {
  if ((<any>(new Map()).keys()).next) {
    return function _clearValues(m: Map<any, any>) {
      var keyIterator = m.keys();
      var k;
      while (!((k = (<any>keyIterator).next()).done)) {
        m.set(k.value, null);
      }
    };
  } else {
    return function _clearValuesWithForeEach(m: Map<any, any>) {
      m.forEach((v, k) => { m.set(k, null); });
    };
  }
})();
// Safari doesn't implement MapIterator.next(), which is used is Traceur's polyfill of Array.from
// TODO(mlaval): remove the work around once we have a working polyfill of Array.from
var _arrayFromMap: {(m: Map<any, any>, getValues: boolean): List<any>} = (function() {
  try {
    if ((<any>(new Map()).values()).next) {
      return function createArrayFromMap(m: Map<any, any>, getValues: boolean): List<any> {
        return getValues ? (<any>Array).from(m.values()) : (<any>Array).from(m.keys());
      };
    }
  } catch (e) {
  }
  return function createArrayFromMapWithForeach(m: Map<any, any>, getValues: boolean): List<any> {
    var res = ListWrapper.createFixedSize(m.size), i = 0;
    m.forEach((v, k) => {
      ListWrapper.set(res, i, getValues ? v : k);
      i++;
    });
    return res;
  };
})();

export class MapWrapper {
  static clone<K, V>(m: Map<K, V>): Map<K, V> { return createMapFromMap(m); }
  static createFromStringMap<T>(stringMap: StringMap<string, T>): Map<string, T> {
    var result = new Map();
    for (var prop in stringMap) {
      result.set(prop, stringMap[prop]);
    }
    return result;
  }
  static toStringMap<T>(m: Map<string, T>): StringMap<string, T> {
    var r = {};
    m.forEach((v, k) => r[k] = v);
    return r;
  }
  static createFromPairs(pairs: List<any>): Map<any, any> { return createMapFromPairs(pairs); }
  static forEach<K, V>(m: Map<K, V>, fn: /*(V, K) => void*/ Function) { m.forEach(<any>fn); }
  static get<K, V>(map: Map<K, V>, key: K): V { return map.get(key); }
  static size(m: Map<any, any>): number { return m.size; }
  static delete<K>(m: Map<K, any>, k: K) { m.delete(k); }
  static clearValues(m: Map<any, any>) { _clearValues(m); }
  static iterable<T>(m: T): T { return m; }
  static keys<K>(m: Map<K, any>): List<K> { return _arrayFromMap(m, false); }
  static values<V>(m: Map<any, V>): List<V> { return _arrayFromMap(m, true); }
}

/**
 * Wraps Javascript Objects
 */
export class StringMapWrapper {
  static create(): StringMap<any, any> {
    // Note: We are not using Object.create(null) here due to
    // performance!
    // http://jsperf.com/ng2-object-create-null
    return {};
  }
  static contains(map: StringMap<string, any>, key: string): boolean {
    return map.hasOwnProperty(key);
  }
  static get<V>(map: StringMap<string, V>, key: string): V {
    return map.hasOwnProperty(key) ? map[key] : undefined;
  }
  static set<V>(map: StringMap<string, V>, key: string, value: V) { map[key] = value; }
  static keys(map: StringMap<string, any>): List<string> { return Object.keys(map); }
  static isEmpty(map: StringMap<string, any>): boolean {
    for (var prop in map) {
      return false;
    }
    return true;
  }
  static delete (map: StringMap<string, any>, key: string) { delete map[key]; }
  static forEach<K, V>(map: StringMap<string, V>, callback: /*(V, K) => void*/ Function) {
    for (var prop in map) {
      if (map.hasOwnProperty(prop)) {
        callback(map[prop], prop);
      }
    }
  }

  static merge<V>(m1: StringMap<string, V>, m2: StringMap<string, V>): StringMap<string, V> {
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
  }

  static equals<V>(m1: StringMap<string, V>, m2: StringMap<string, V>): boolean {
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
  }
}

export interface Predicate<T> { (value: T, index?: number, array?: T[]): boolean; }

export class ListWrapper {
  // JS has no way to express a staticly fixed size list, but dart does so we
  // keep both methods.
  static createFixedSize(size: number): List<any> { return new List(size); }
  static createGrowableSize(size: number): List<any> { return new List(size); }
  static get<T>(m: List<T>, k: number): T { return m[k]; }
  static set<T>(m: List<T>, k: number, v: T) { m[k] = v; }
  static clone<T>(array: List<T>): T[] { return array.slice(0); }
  static map<T, V>(array: List<T>, fn: (T) => V): List<V> { return array.map(fn); }
  static forEach<T>(array: List<T>, fn: (T) => void) {
    for (var i = 0; i < array.length; i++) {
      fn(array[i]);
    }
  }
  static first<T>(array: List<T>): T {
    if (!array) return null;
    return array[0];
  }
  static last<T>(array: List<T>): T {
    if (!array || array.length == 0) return null;
    return array[array.length - 1];
  }
  static find<T>(list: List<T>, pred: Predicate<T>): T {
    for (var i = 0; i < list.length; ++i) {
      if (pred(list[i])) return list[i];
    }
    return null;
  }
  static indexOf<T>(array: List<T>, value: T, startIndex: number = 0): number {
    return array.indexOf(value, startIndex);
  }
  static reduce<T, E>(list: List<T>,
                      fn: (accumValue: E, currentValue: T, currentIndex: number, array: T[]) => E,
                      init: E): E {
    return list.reduce(fn, init);
  }
  static filter<T>(array: List<T>, pred: Predicate<T>): T[] { return array.filter(pred); }
  static any(list: List<any>, pred: Function): boolean {
    for (var i = 0; i < list.length; ++i) {
      if (pred(list[i])) return true;
    }
    return false;
  }
  static contains<T>(list: List<T>, el: T): boolean { return list.indexOf(el) !== -1; }
  static reversed<T>(array: List<T>): T[] {
    var a = ListWrapper.clone(array);
    return a.reverse();
  }
  static concat(a: List<any>, b: List<any>): List<any> { return a.concat(b); }
  static insert<T>(list: List<T>, index: number, value: T) { list.splice(index, 0, value); }
  static removeAt<T>(list: List<T>, index: number): T {
    var res = list[index];
    list.splice(index, 1);
    return res;
  }
  static removeAll<T>(list: List<T>, items: List<T>) {
    for (var i = 0; i < items.length; ++i) {
      var index = list.indexOf(items[i]);
      list.splice(index, 1);
    }
  }
  static removeLast<T>(list: List<T>): T { return list.pop(); }
  static remove<T>(list: List<T>, el: T): boolean {
    var index = list.indexOf(el);
    if (index > -1) {
      list.splice(index, 1);
      return true;
    }
    return false;
  }
  static clear(list: List<any>) { list.splice(0, list.length); }
  static join(list: List<any>, s: string): string { return list.join(s); }
  static isEmpty(list: List<any>): boolean { return list.length == 0; }
  static fill(list: List<any>, value: any, start: number = 0, end: number = null) {
    list.fill(value, start, end === null ? undefined : end);
  }
  static equals(a: List<any>, b: List<any>): boolean {
    if (a.length != b.length) return false;
    for (var i = 0; i < a.length; ++i) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }
  static slice<T>(l: List<T>, from: number = 0, to: number = null): List<T> {
    return l.slice(from, to === null ? undefined : to);
  }
  static splice<T>(l: List<T>, from: number, length: number): List<T> {
    return l.splice(from, length);
  }
  static sort<T>(l: List<T>, compareFn?: (a: T, b: T) => number) {
    if (isPresent(compareFn)) {
      l.sort(compareFn);
    } else {
      l.sort();
    }
  }
  static toString<T>(l: List<T>): string { return l.toString(); }
  static toJSON<T>(l: List<T>): string { return JSON.stringify(l); }
}

export function isListLikeIterable(obj: any): boolean {
  if (!isJsObject(obj)) return false;
  return isArray(obj) ||
         (!(obj instanceof Map) &&  // JS Map are iterables but return entries as [k, v]
          Symbol.iterator in obj);  // JS Iterable have a Symbol.iterator prop
}

export function iterateListLike(obj: any, fn: Function) {
  if (isArray(obj)) {
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

// Safari and Internet Explorer do not support the iterable parameter to the
// Set constructor.  We work around that by manually adding the items.
var createSetFromList: {(lst: List<any>): Set<any>} = (function() {
  var test = new Set([1, 2, 3]);
  if (test.size === 3) {
    return function createSetFromList(lst: List<any>): Set<any> { return new Set(lst); };
  } else {
    return function createSetAndPopulateFromList(lst: List<any>): Set<any> {
      var res = new Set(lst);
      if (res.size !== lst.length) {
        for (var i = 0; i < lst.length; i++) {
          res.add(lst[i]);
        }
      }
      return res;
    };
  }
})();
export class SetWrapper {
  static createFromList<T>(lst: List<T>): Set<T> { return createSetFromList(lst); }
  static has<T>(s: Set<T>, key: T): boolean { return s.has(key); }
  static delete<K>(m: Set<K>, k: K) { m.delete(k); }
}

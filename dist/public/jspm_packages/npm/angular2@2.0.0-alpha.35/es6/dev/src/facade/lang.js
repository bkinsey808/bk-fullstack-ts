/* */ 
"format cjs";
/// <reference path="../../globals.d.ts" />
var _global = (typeof window === 'undefined' ? global : window);
export { _global as global };
export var Type = Function;
export function getTypeNameForDebugging(type) {
    return type['name'];
}
export class BaseException extends Error {
    constructor(message, _originalException, _originalStack, _context) {
        super(message);
        this.message = message;
        this._originalException = _originalException;
        this._originalStack = _originalStack;
        this._context = _context;
        this.stack = (new Error(message)).stack;
    }
    get originalException() { return this._originalException; }
    get originalStack() { return this._originalStack; }
    get context() { return this._context; }
    toString() { return this.message; }
}
export function makeTypeError(message) {
    return new TypeError(message);
}
export var Math = _global.Math;
export var Date = _global.Date;
var assertionsEnabled_ = typeof _global['assert'] !== 'undefined';
export function assertionsEnabled() {
    return assertionsEnabled_;
}
// TODO: remove calls to assert in production environment
// Note: Can't just export this and import in in other files
// as `assert` is a reserved keyword in Dart
_global.assert = function assert(condition) {
    if (assertionsEnabled_) {
        _global['assert'].call(condition);
    }
};
export function ENUM_INDEX(value) {
    return value;
}
// This function is needed only to properly support Dart's const expressions
// see https://github.com/angular/ts2dart/pull/151 for more info
export function CONST_EXPR(expr) {
    return expr;
}
export function CONST() {
    return (target) => target;
}
export function ABSTRACT() {
    return (t) => t;
}
// Note: This is only a marker annotation needed for ts2dart.
// This is written so that is can be used as a Traceur annotation
// or a Typescript decorator.
export function IMPLEMENTS(_) {
    return (t) => t;
}
export function isPresent(obj) {
    return obj !== undefined && obj !== null;
}
export function isBlank(obj) {
    return obj === undefined || obj === null;
}
export function isString(obj) {
    return typeof obj === "string";
}
export function isFunction(obj) {
    return typeof obj === "function";
}
export function isType(obj) {
    return isFunction(obj);
}
export function isStringMap(obj) {
    return typeof obj === 'object' && obj !== null;
}
export function isPromise(obj) {
    return obj instanceof _global.Promise;
}
export function isArray(obj) {
    return Array.isArray(obj);
}
export function isNumber(obj) {
    return typeof obj === 'number';
}
export function isDate(obj) {
    return obj instanceof Date && !isNaN(obj.valueOf());
}
export function stringify(token) {
    if (typeof token === 'string') {
        return token;
    }
    if (token === undefined || token === null) {
        return '' + token;
    }
    if (token.name) {
        return token.name;
    }
    var res = token.toString();
    var newLineIndex = res.indexOf("\n");
    return (newLineIndex === -1) ? res : res.substring(0, newLineIndex);
}
// serialize / deserialize enum exist only for consistency with dart API
// enums in typescript don't need to be serialized
export function serializeEnum(val) {
    return val;
}
export function deserializeEnum(val, values) {
    return val;
}
export class StringWrapper {
    static fromCharCode(code) { return String.fromCharCode(code); }
    static charCodeAt(s, index) { return s.charCodeAt(index); }
    static split(s, regExp) { return s.split(regExp); }
    static equals(s, s2) { return s === s2; }
    static replace(s, from, replace) {
        return s.replace(from, replace);
    }
    static replaceAll(s, from, replace) {
        return s.replace(from, replace);
    }
    static toUpperCase(s) { return s.toUpperCase(); }
    static toLowerCase(s) { return s.toLowerCase(); }
    static startsWith(s, start) { return s.startsWith(start); }
    static substring(s, start, end = null) {
        return s.substring(start, end === null ? undefined : end);
    }
    static replaceAllMapped(s, from, cb) {
        return s.replace(from, function (...matches) {
            // Remove offset & string from the result array
            matches.splice(-2, 2);
            // The callback receives match, p1, ..., pn
            return cb(matches);
        });
    }
    static contains(s, substr) { return s.indexOf(substr) != -1; }
    static compare(a, b) {
        if (a < b) {
            return -1;
        }
        else if (a > b) {
            return 1;
        }
        else {
            return 0;
        }
    }
}
export class StringJoiner {
    constructor(parts = []) {
        this.parts = parts;
    }
    add(part) { this.parts.push(part); }
    toString() { return this.parts.join(""); }
}
export class NumberParseError extends BaseException {
    constructor(message) {
        super();
        this.message = message;
    }
    toString() { return this.message; }
}
export class NumberWrapper {
    static toFixed(n, fractionDigits) { return n.toFixed(fractionDigits); }
    static equal(a, b) { return a === b; }
    static parseIntAutoRadix(text) {
        var result = parseInt(text);
        if (isNaN(result)) {
            throw new NumberParseError("Invalid integer literal when parsing " + text);
        }
        return result;
    }
    static parseInt(text, radix) {
        if (radix == 10) {
            if (/^(\-|\+)?[0-9]+$/.test(text)) {
                return parseInt(text, radix);
            }
        }
        else if (radix == 16) {
            if (/^(\-|\+)?[0-9ABCDEFabcdef]+$/.test(text)) {
                return parseInt(text, radix);
            }
        }
        else {
            var result = parseInt(text, radix);
            if (!isNaN(result)) {
                return result;
            }
        }
        throw new NumberParseError("Invalid integer literal when parsing " + text + " in base " +
            radix);
    }
    // TODO: NaN is a valid literal but is returned by parseFloat to indicate an error.
    static parseFloat(text) { return parseFloat(text); }
    static get NaN() { return NaN; }
    static isNaN(value) { return isNaN(value); }
    static isInteger(value) { return Number.isInteger(value); }
}
export var RegExp = _global.RegExp;
export class RegExpWrapper {
    static create(regExpStr, flags = '') {
        flags = flags.replace(/g/g, '');
        return new _global.RegExp(regExpStr, flags + 'g');
    }
    static firstMatch(regExp, input) {
        // Reset multimatch regex state
        regExp.lastIndex = 0;
        return regExp.exec(input);
    }
    static test(regExp, input) {
        regExp.lastIndex = 0;
        return regExp.test(input);
    }
    static matcher(regExp, input) {
        // Reset regex state for the case
        // someone did not loop over all matches
        // last time.
        regExp.lastIndex = 0;
        return { re: regExp, input: input };
    }
}
export class RegExpMatcherWrapper {
    static next(matcher) {
        return matcher.re.exec(matcher.input);
    }
}
export class FunctionWrapper {
    static apply(fn, posArgs) { return fn.apply(null, posArgs); }
}
// JS has NaN !== NaN
export function looseIdentical(a, b) {
    return a === b || typeof a === "number" && typeof b === "number" && isNaN(a) && isNaN(b);
}
// JS considers NaN is the same as NaN for map Key (while NaN !== NaN otherwise)
// see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
export function getMapKey(value) {
    return value;
}
export function normalizeBlank(obj) {
    return isBlank(obj) ? null : obj;
}
export function normalizeBool(obj) {
    return isBlank(obj) ? false : obj;
}
export function isJsObject(o) {
    return o !== null && (typeof o === "function" || typeof o === "object");
}
export function print(obj) {
    if (obj instanceof BaseException) {
        console.log(obj.stack);
    }
    else {
        console.log(obj);
    }
}
// Can't be all uppercase as our transpiler would think it is a special directive...
export class Json {
    static parse(s) { return _global.JSON.parse(s); }
    static stringify(data) {
        // Dart doesn't take 3 arguments
        return _global.JSON.stringify(data, null, 2);
    }
}
export class DateWrapper {
    static create(year, month = 1, day = 1, hour = 0, minutes = 0, seconds = 0, milliseconds = 0) {
        return new Date(year, month - 1, day, hour, minutes, seconds, milliseconds);
    }
    static fromMillis(ms) { return new Date(ms); }
    static toMillis(date) { return date.getTime(); }
    static now() { return new Date(); }
    static toJson(date) { return date.toJSON(); }
}
//# sourceMappingURL=lang.js.map
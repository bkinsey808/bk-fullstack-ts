/* */ 
"format cjs";
import { StringMapWrapper } from 'angular2/src/facade/collection';
import { isPresent, isBlank, BaseException, RegExpWrapper, CONST_EXPR } from 'angular2/src/facade/lang';
export class Url {
    constructor(path, child = null, auxiliary = CONST_EXPR([]), params = null) {
        this.path = path;
        this.child = child;
        this.auxiliary = auxiliary;
        this.params = params;
    }
    toString() {
        return this.path + this._matrixParamsToString() + this._auxToString() + this._childString();
    }
    segmentToString() { return this.path + this._matrixParamsToString(); }
    _auxToString() {
        return this.auxiliary.length > 0 ?
            ('(' + this.auxiliary.map(sibling => sibling.toString()).join('//') + ')') :
            '';
    }
    _matrixParamsToString() {
        if (isBlank(this.params)) {
            return '';
        }
        return ';' + serializeParams(this.params).join(';');
    }
    _childString() { return isPresent(this.child) ? ('/' + this.child.toString()) : ''; }
}
export class RootUrl extends Url {
    constructor(path, child = null, auxiliary = CONST_EXPR([]), params = null) {
        super(path, child, auxiliary, params);
    }
    toString() {
        return this.path + this._auxToString() + this._childString() + this._queryParamsToString();
    }
    segmentToString() { return this.path + this._queryParamsToString(); }
    _queryParamsToString() {
        if (isBlank(this.params)) {
            return '';
        }
        return '?' + serializeParams(this.params).join('&');
    }
}
var SEGMENT_RE = RegExpWrapper.create('^[^\\/\\(\\)\\?;=&]+');
function matchUrlSegment(str) {
    var match = RegExpWrapper.firstMatch(SEGMENT_RE, str);
    return isPresent(match) ? match[0] : null;
}
export class UrlParser {
    peekStartsWith(str) { return this.remaining.startsWith(str); }
    capture(str) {
        if (!this.remaining.startsWith(str)) {
            throw new BaseException(`Expected "${str}".`);
        }
        this.remaining = this.remaining.substring(str.length);
    }
    parse(url) {
        this.remaining = url;
        if (url == '' || url == '/') {
            return new Url('');
        }
        return this.parseRoot();
    }
    // segment + (aux segments) + (query params)
    parseRoot() {
        if (this.peekStartsWith('/')) {
            this.capture('/');
        }
        var path = matchUrlSegment(this.remaining);
        this.capture(path);
        var aux = [];
        if (this.peekStartsWith('(')) {
            aux = this.parseAuxiliaryRoutes();
        }
        if (this.peekStartsWith(';')) {
            // TODO: should these params just be dropped?
            this.parseMatrixParams();
        }
        var child = null;
        if (this.peekStartsWith('/') && !this.peekStartsWith('//')) {
            this.capture('/');
            child = this.parseSegment();
        }
        var queryParams = null;
        if (this.peekStartsWith('?')) {
            queryParams = this.parseQueryParams();
        }
        return new RootUrl(path, child, aux, queryParams);
    }
    // segment + (matrix params) + (aux segments)
    parseSegment() {
        if (this.remaining.length == 0) {
            return null;
        }
        if (this.peekStartsWith('/')) {
            this.capture('/');
        }
        var path = matchUrlSegment(this.remaining);
        this.capture(path);
        var matrixParams = null;
        if (this.peekStartsWith(';')) {
            matrixParams = this.parseMatrixParams();
        }
        var aux = [];
        if (this.peekStartsWith('(')) {
            aux = this.parseAuxiliaryRoutes();
        }
        var child = null;
        if (this.peekStartsWith('/') && !this.peekStartsWith('//')) {
            this.capture('/');
            child = this.parseSegment();
        }
        return new Url(path, child, aux, matrixParams);
    }
    parseQueryParams() {
        var params = {};
        this.capture('?');
        this.parseParam(params);
        while (this.remaining.length > 0 && this.peekStartsWith('&')) {
            this.capture('&');
            this.parseParam(params);
        }
        return params;
    }
    parseMatrixParams() {
        var params = {};
        while (this.remaining.length > 0 && this.peekStartsWith(';')) {
            this.capture(';');
            this.parseParam(params);
        }
        return params;
    }
    parseParam(params) {
        var key = matchUrlSegment(this.remaining);
        if (isBlank(key)) {
            return;
        }
        this.capture(key);
        var value = true;
        if (this.peekStartsWith('=')) {
            this.capture('=');
            var valueMatch = matchUrlSegment(this.remaining);
            if (isPresent(valueMatch)) {
                value = valueMatch;
                this.capture(value);
            }
        }
        params[key] = value;
    }
    parseAuxiliaryRoutes() {
        var routes = [];
        this.capture('(');
        while (!this.peekStartsWith(')') && this.remaining.length > 0) {
            routes.push(this.parseSegment());
            if (this.peekStartsWith('//')) {
                this.capture('//');
            }
        }
        this.capture(')');
        return routes;
    }
}
export var parser = new UrlParser();
export function serializeParams(paramMap) {
    var params = [];
    if (isPresent(paramMap)) {
        StringMapWrapper.forEach(paramMap, (value, key) => {
            if (value == true) {
                params.push(key);
            }
            else {
                params.push(key + '=' + value);
            }
        });
    }
    return params;
}
//# sourceMappingURL=url_parser.js.map
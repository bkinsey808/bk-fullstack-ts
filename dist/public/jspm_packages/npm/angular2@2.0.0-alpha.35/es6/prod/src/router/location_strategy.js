/* */ 
"format cjs";
import { BaseException } from 'angular2/src/facade/lang';
function _abstract() {
    return new BaseException('This method is abstract');
}
export class LocationStrategy {
    path() { throw _abstract(); }
    pushState(ctx, title, url) { throw _abstract(); }
    forward() { throw _abstract(); }
    back() { throw _abstract(); }
    onPopState(fn) { throw _abstract(); }
    getBaseHref() { throw _abstract(); }
}
//# sourceMappingURL=location_strategy.js.map
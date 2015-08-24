/* */ 
"format cjs";
import { EventEmitter, ObservableWrapper } from 'angular2/src/facade/async';
import { LocationStrategy } from 'angular2/src/router/location_strategy';
export class MockLocationStrategy extends LocationStrategy {
    constructor() {
        super();
        this.internalBaseHref = '/';
        this.internalPath = '/';
        this.internalTitle = '';
        this.urlChanges = [];
        this._subject = new EventEmitter();
    }
    simulatePopState(url) {
        this.internalPath = url;
        ObservableWrapper.callNext(this._subject, null);
    }
    path() { return this.internalPath; }
    simulateUrlPop(pathname) {
        ObservableWrapper.callNext(this._subject, { 'url': pathname });
    }
    pushState(ctx, title, url) {
        this.internalTitle = title;
        this.internalPath = url;
        this.urlChanges.push(url);
    }
    onPopState(fn) { ObservableWrapper.subscribe(this._subject, fn); }
    getBaseHref() { return this.internalBaseHref; }
    back() {
        if (this.urlChanges.length > 0) {
            this.urlChanges.pop();
            var nextUrl = this.urlChanges.length > 0 ? this.urlChanges[this.urlChanges.length - 1] : '';
            this.simulatePopState(nextUrl);
        }
    }
}
//# sourceMappingURL=mock_location_strategy.js.map
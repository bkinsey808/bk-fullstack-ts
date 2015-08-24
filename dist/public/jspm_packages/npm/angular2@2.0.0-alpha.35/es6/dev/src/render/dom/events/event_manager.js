/* */ 
"format cjs";
import { BaseException, StringWrapper } from 'angular2/src/facade/lang';
import { DOM } from 'angular2/src/dom/dom_adapter';
var BUBBLE_SYMBOL = '^';
export class EventManager {
    constructor(_plugins, _zone) {
        this._plugins = _plugins;
        this._zone = _zone;
        for (var i = 0; i < _plugins.length; i++) {
            _plugins[i].manager = this;
        }
    }
    addEventListener(element, eventName, handler) {
        var withoutBubbleSymbol = this._removeBubbleSymbol(eventName);
        var plugin = this._findPluginFor(withoutBubbleSymbol);
        plugin.addEventListener(element, withoutBubbleSymbol, handler, withoutBubbleSymbol != eventName);
    }
    addGlobalEventListener(target, eventName, handler) {
        var withoutBubbleSymbol = this._removeBubbleSymbol(eventName);
        var plugin = this._findPluginFor(withoutBubbleSymbol);
        return plugin.addGlobalEventListener(target, withoutBubbleSymbol, handler, withoutBubbleSymbol != eventName);
    }
    getZone() { return this._zone; }
    _findPluginFor(eventName) {
        var plugins = this._plugins;
        for (var i = 0; i < plugins.length; i++) {
            var plugin = plugins[i];
            if (plugin.supports(eventName)) {
                return plugin;
            }
        }
        throw new BaseException(`No event manager plugin found for event ${eventName}`);
    }
    _removeBubbleSymbol(eventName) {
        return eventName[0] == BUBBLE_SYMBOL ? StringWrapper.substring(eventName, 1) : eventName;
    }
}
export class EventManagerPlugin {
    // We are assuming here that all plugins support bubbled and non-bubbled events.
    // That is equivalent to having supporting $event.target
    // The bubbling flag (currently ^) is stripped before calling the supports and
    // addEventListener methods.
    supports(eventName) { return false; }
    addEventListener(element, eventName, handler, shouldSupportBubble) {
        throw "not implemented";
    }
    addGlobalEventListener(element, eventName, handler, shouldSupportBubble) {
        throw "not implemented";
    }
}
export class DomEventsPlugin extends EventManagerPlugin {
    // This plugin should come last in the list of plugins, because it accepts all
    // events.
    supports(eventName) { return true; }
    addEventListener(element, eventName, handler, shouldSupportBubble) {
        var outsideHandler = this._getOutsideHandler(shouldSupportBubble, element, handler, this.manager._zone);
        this.manager._zone.runOutsideAngular(() => { DOM.on(element, eventName, outsideHandler); });
    }
    addGlobalEventListener(target, eventName, handler, shouldSupportBubble) {
        var element = DOM.getGlobalEventTarget(target);
        var outsideHandler = this._getOutsideHandler(shouldSupportBubble, element, handler, this.manager._zone);
        return this.manager._zone.runOutsideAngular(() => { return DOM.onAndCancel(element, eventName, outsideHandler); });
    }
    _getOutsideHandler(shouldSupportBubble, element, handler, zone) {
        return shouldSupportBubble ? DomEventsPlugin.bubbleCallback(element, handler, zone) :
            DomEventsPlugin.sameElementCallback(element, handler, zone);
    }
    static sameElementCallback(element, handler, zone) {
        return (event) => {
            if (event.target === element) {
                zone.run(() => handler(event));
            }
        };
    }
    static bubbleCallback(element, handler, zone) {
        return (event) => zone.run(() => handler(event));
    }
}
//# sourceMappingURL=event_manager.js.map
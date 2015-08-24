/* */ 
"format cjs";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") return Reflect.decorate(decorators, target, key, desc);
    switch (arguments.length) {
        case 2: return decorators.reduceRight(function(o, d) { return (d && d(o)) || o; }, target);
        case 3: return decorators.reduceRight(function(o, d) { return (d && d(target, key)), void 0; }, void 0);
        case 4: return decorators.reduceRight(function(o, d) { return (d && d(target, key, o)) || o; }, desc);
    }
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { print, isPresent, DateWrapper, stringify } from "../../facade/lang";
import { PromiseWrapper } from "angular2/src/facade/async";
import { ListWrapper, StringMapWrapper, MapWrapper } from "../../facade/collection";
import { Serializer } from "angular2/src/web-workers/shared/serializer";
import { Injectable } from "angular2/di";
import { RenderViewRef } from 'angular2/src/render/api';
import { NgZone } from 'angular2/src/core/zone/ng_zone';
import { deserializeGenericEvent } from './event_deserializer';
export let MessageBroker = class {
    constructor(_messageBus, _serializer, _zone) {
        this._messageBus = _messageBus;
        this._serializer = _serializer;
        this._zone = _zone;
        this._pending = new Map();
        this._eventDispatchRegistry = new Map();
        this._messageBus.source.addListener((data) => this._handleMessage(data['data']));
    }
    _generateMessageId(name) {
        var time = stringify(DateWrapper.toMillis(DateWrapper.now()));
        var iteration = 0;
        var id = name + time + stringify(iteration);
        while (isPresent(this._pending[id])) {
            id = `${name}${time}${iteration}`;
            iteration++;
        }
        return id;
    }
    runOnUiThread(args, returnType) {
        var fnArgs = [];
        if (isPresent(args.args)) {
            ListWrapper.forEach(args.args, (argument) => {
                if (argument.type != null) {
                    fnArgs.push(this._serializer.serialize(argument.value, argument.type));
                }
                else {
                    fnArgs.push(argument.value);
                }
            });
        }
        var promise;
        var id = null;
        if (returnType != null) {
            var completer = PromiseWrapper.completer();
            id = this._generateMessageId(args.type + args.method);
            this._pending.set(id, completer);
            PromiseWrapper.catchError(completer.promise, (err, stack) => {
                print(err);
                completer.reject(err, stack);
            });
            promise = PromiseWrapper.then(completer.promise, (value) => {
                if (this._serializer == null) {
                    return value;
                }
                else {
                    return this._serializer.deserialize(value, returnType);
                }
            });
        }
        else {
            promise = null;
        }
        // TODO(jteplitz602): Create a class for these messages so we don't keep using StringMap
        var message = { 'type': args.type, 'method': args.method, 'args': fnArgs };
        if (id != null) {
            message['id'] = id;
        }
        this._messageBus.sink.send(message);
        return promise;
    }
    _handleMessage(message) {
        var data = new MessageData(message);
        // TODO(jteplitz602): replace these strings with messaging constants
        if (data.type === "event") {
            this._dispatchEvent(new RenderEventData(data.value, this._serializer));
        }
        else if (data.type === "result" || data.type === "error") {
            var id = data.id;
            if (this._pending.has(id)) {
                if (data.type === "result") {
                    this._pending.get(id).resolve(data.value);
                }
                else {
                    this._pending.get(id).reject(data.value, null);
                }
                this._pending.delete(id);
            }
        }
    }
    _dispatchEvent(eventData) {
        var dispatcher = this._eventDispatchRegistry.get(eventData.viewRef);
        this._zone.run(() => {
            eventData.locals['$event'] = deserializeGenericEvent(eventData.locals['$event']);
            dispatcher.dispatchRenderEvent(eventData.elementIndex, eventData.eventName, eventData.locals);
        });
    }
    registerEventDispatcher(viewRef, dispatcher) {
        this._eventDispatchRegistry.set(viewRef, dispatcher);
    }
};
MessageBroker = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [Object, Serializer, NgZone])
], MessageBroker);
class RenderEventData {
    constructor(message, serializer) {
        this.viewRef = serializer.deserialize(message['viewRef'], RenderViewRef);
        this.elementIndex = message['elementIndex'];
        this.eventName = message['eventName'];
        this.locals = MapWrapper.createFromStringMap(message['locals']);
    }
}
class MessageData {
    constructor(data) {
        this.type = StringMapWrapper.get(data, "type");
        this.id = this._getValueIfPresent(data, "id");
        this.value = this._getValueIfPresent(data, "value");
    }
    /**
     * Returns the value from the StringMap if present. Otherwise returns null
     */
    _getValueIfPresent(data, key) {
        if (StringMapWrapper.contains(data, key)) {
            return StringMapWrapper.get(data, key);
        }
        else {
            return null;
        }
    }
}
export class FnArg {
    constructor(value, type) {
        this.value = value;
        this.type = type;
    }
}
export class UiArguments {
    constructor(type, method, args) {
        this.type = type;
        this.method = method;
        this.args = args;
    }
}
//# sourceMappingURL=broker.js.map
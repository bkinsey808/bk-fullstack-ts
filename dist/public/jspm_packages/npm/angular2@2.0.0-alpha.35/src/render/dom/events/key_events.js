/* */ 
(function(process) {
  'use strict';
  var __extends = (this && this.__extends) || function(d, b) {
    for (var p in b)
      if (b.hasOwnProperty(p))
        d[p] = b[p];
    function __() {
      this.constructor = d;
    }
    __.prototype = b.prototype;
    d.prototype = new __();
  };
  var dom_adapter_1 = require("../../../dom/dom_adapter");
  var lang_1 = require("../../../facade/lang");
  var collection_1 = require("../../../facade/collection");
  var event_manager_1 = require("./event_manager");
  var modifierKeys = ['alt', 'control', 'meta', 'shift'];
  var modifierKeyGetters = {
    'alt': function(event) {
      return event.altKey;
    },
    'control': function(event) {
      return event.ctrlKey;
    },
    'meta': function(event) {
      return event.metaKey;
    },
    'shift': function(event) {
      return event.shiftKey;
    }
  };
  var KeyEventsPlugin = (function(_super) {
    __extends(KeyEventsPlugin, _super);
    function KeyEventsPlugin() {
      _super.call(this);
    }
    KeyEventsPlugin.prototype.supports = function(eventName) {
      return lang_1.isPresent(KeyEventsPlugin.parseEventName(eventName));
    };
    KeyEventsPlugin.prototype.addEventListener = function(element, eventName, handler, shouldSupportBubble) {
      var parsedEvent = KeyEventsPlugin.parseEventName(eventName);
      var outsideHandler = KeyEventsPlugin.eventCallback(element, shouldSupportBubble, collection_1.StringMapWrapper.get(parsedEvent, 'fullKey'), handler, this.manager.getZone());
      this.manager.getZone().runOutsideAngular(function() {
        dom_adapter_1.DOM.on(element, collection_1.StringMapWrapper.get(parsedEvent, 'domEventName'), outsideHandler);
      });
    };
    KeyEventsPlugin.parseEventName = function(eventName) {
      var parts = eventName.toLowerCase().split('.');
      var domEventName = collection_1.ListWrapper.removeAt(parts, 0);
      if ((parts.length === 0) || !(lang_1.StringWrapper.equals(domEventName, 'keydown') || lang_1.StringWrapper.equals(domEventName, 'keyup'))) {
        return null;
      }
      var key = KeyEventsPlugin._normalizeKey(collection_1.ListWrapper.removeLast(parts));
      var fullKey = '';
      collection_1.ListWrapper.forEach(modifierKeys, function(modifierName) {
        if (collection_1.ListWrapper.contains(parts, modifierName)) {
          collection_1.ListWrapper.remove(parts, modifierName);
          fullKey += modifierName + '.';
        }
      });
      fullKey += key;
      if (parts.length != 0 || key.length === 0) {
        return null;
      }
      var result = collection_1.StringMapWrapper.create();
      collection_1.StringMapWrapper.set(result, 'domEventName', domEventName);
      collection_1.StringMapWrapper.set(result, 'fullKey', fullKey);
      return result;
    };
    KeyEventsPlugin.getEventFullKey = function(event) {
      var fullKey = '';
      var key = dom_adapter_1.DOM.getEventKey(event);
      key = key.toLowerCase();
      if (lang_1.StringWrapper.equals(key, ' ')) {
        key = 'space';
      } else if (lang_1.StringWrapper.equals(key, '.')) {
        key = 'dot';
      }
      collection_1.ListWrapper.forEach(modifierKeys, function(modifierName) {
        if (modifierName != key) {
          var modifierGetter = collection_1.StringMapWrapper.get(modifierKeyGetters, modifierName);
          if (modifierGetter(event)) {
            fullKey += modifierName + '.';
          }
        }
      });
      fullKey += key;
      return fullKey;
    };
    KeyEventsPlugin.eventCallback = function(element, shouldSupportBubble, fullKey, handler, zone) {
      return function(event) {
        var correctElement = shouldSupportBubble || event.target === element;
        if (correctElement && lang_1.StringWrapper.equals(KeyEventsPlugin.getEventFullKey(event), fullKey)) {
          zone.run(function() {
            return handler(event);
          });
        }
      };
    };
    KeyEventsPlugin._normalizeKey = function(keyName) {
      switch (keyName) {
        case 'esc':
          return 'escape';
        default:
          return keyName;
      }
    };
    return KeyEventsPlugin;
  })(event_manager_1.EventManagerPlugin);
  exports.KeyEventsPlugin = KeyEventsPlugin;
})(require("process"));

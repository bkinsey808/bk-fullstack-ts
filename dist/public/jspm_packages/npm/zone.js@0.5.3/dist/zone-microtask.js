/* */ 
"format cjs";
(function(process) {
  (function e(t, n, r) {
    function s(o, u) {
      if (!n[o]) {
        if (!t[o]) {
          var a = typeof require == "function" && require;
          if (!u && a)
            return a(o, !0);
          if (i)
            return i(o, !0);
          var f = new Error("Cannot find module '" + o + "'");
          throw f.code = "MODULE_NOT_FOUND", f;
        }
        var l = n[o] = {exports: {}};
        t[o][0].call(l.exports, function(e) {
          var n = t[o][1][e];
          return s(n ? n : e);
        }, l, l.exports, e, t, n, r);
      }
      return n[o].exports;
    }
    var i = typeof require == "function" && require;
    for (var o = 0; o < r.length; o++)
      s(r[o]);
    return s;
  })({
    1: [function(require, module, exports) {
      (function(global) {
        'use strict';
        var core = require("../core");
        var microtask = require("../microtask");
        var browserPatch = require("../patch/browser");
        var es6Promise = require("es6-promise");
        if (global.Zone) {
          console.warn('Zone already exported on window the object!');
        }
        global.Zone = microtask.addMicrotaskSupport(core.Zone);
        global.zone = new global.Zone();
        global.Promise = es6Promise.Promise;
        browserPatch.apply();
      }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
    }, {
      "../core": 2,
      "../microtask": 3,
      "../patch/browser": 4,
      "es6-promise": 15
    }],
    2: [function(require, module, exports) {
      (function(global) {
        'use strict';
        function Zone(parentZone, data) {
          var zone = (arguments.length) ? Object.create(parentZone) : this;
          zone.parent = parentZone || null;
          Object.keys(data || {}).forEach(function(property) {
            var _property = property.substr(1);
            if (property[0] === '$') {
              zone[_property] = data[property](parentZone[_property] || function() {});
            } else if (property[0] === '+') {
              if (parentZone[_property]) {
                zone[_property] = function() {
                  var result = parentZone[_property].apply(this, arguments);
                  data[property].apply(this, arguments);
                  return result;
                };
              } else {
                zone[_property] = data[property];
              }
            } else if (property[0] === '-') {
              if (parentZone[_property]) {
                zone[_property] = function() {
                  data[property].apply(this, arguments);
                  return parentZone[_property].apply(this, arguments);
                };
              } else {
                zone[_property] = data[property];
              }
            } else {
              zone[property] = (typeof data[property] === 'object') ? JSON.parse(JSON.stringify(data[property])) : data[property];
            }
          });
          zone.$id = Zone.nextId++;
          return zone;
        }
        Zone.prototype = {
          constructor: Zone,
          fork: function(locals) {
            this.onZoneCreated();
            return new Zone(this, locals);
          },
          bind: function(fn, skipEnqueue) {
            if (typeof fn !== 'function') {
              throw new Error('Expecting function got: ' + fn);
            }
            skipEnqueue || this.enqueueTask(fn);
            var zone = this.isRootZone() ? this : this.fork();
            return function zoneBoundFn() {
              return zone.run(fn, this, arguments);
            };
          },
          bindOnce: function(fn) {
            var boundZone = this;
            return this.bind(function() {
              var result = fn.apply(this, arguments);
              boundZone.dequeueTask(fn);
              return result;
            });
          },
          isRootZone: function() {
            return this.parent === null;
          },
          run: function run(fn, applyTo, applyWith) {
            applyWith = applyWith || [];
            var oldZone = global.zone;
            global.zone = this;
            try {
              this.beforeTask();
              return fn.apply(applyTo, applyWith);
            } catch (e) {
              if (this.onError) {
                this.onError(e);
              } else {
                throw e;
              }
            } finally {
              this.afterTask();
              global.zone = oldZone;
            }
          },
          onError: null,
          beforeTask: function() {},
          onZoneCreated: function() {},
          afterTask: function() {},
          enqueueTask: function() {},
          dequeueTask: function() {}
        };
        Zone.nextId = 1;
        Zone.bindPromiseFn = require("./patch/promise").bindPromiseFn;
        module.exports = {Zone: Zone};
      }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
    }, {"./patch/promise": 10}],
    3: [function(require, module, exports) {
      (function(global) {
        'use strict';
        var es6Promise = require("es6-promise").Promise;
        es6Promise._setAsap(function(fn, arg) {
          global.zone.scheduleMicrotask(function() {
            fn(arg);
          });
        });
        function scheduleMicrotask(fn) {
          es6Promise._asap(this.bind(fn));
        }
        function addMicrotaskSupport(zoneClass) {
          zoneClass.prototype.scheduleMicrotask = scheduleMicrotask;
          return zoneClass;
        }
        module.exports = {addMicrotaskSupport: addMicrotaskSupport};
        var hasNativePromise = typeof Promise !== "undefined" && Promise.toString().indexOf("[native code]") !== -1;
        var isFirefox = global.navigator && global.navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
        if (hasNativePromise && !isFirefox) {
          var resolvedPromise = Promise.resolve();
          es6Promise._setScheduler(function(fn) {
            resolvedPromise.then(fn);
          });
        }
      }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
    }, {"es6-promise": 15}],
    4: [function(require, module, exports) {
      (function(global) {
        'use strict';
        var fnPatch = require("./functions");
        var promisePatch = require("./promise");
        var mutationObserverPatch = require("./mutation-observer");
        var definePropertyPatch = require("./define-property");
        var registerElementPatch = require("./register-element");
        var webSocketPatch = require("./websocket");
        var eventTargetPatch = require("./event-target");
        var propertyDescriptorPatch = require("./property-descriptor");
        var geolocationPatch = require("./geolocation");
        function apply() {
          fnPatch.patchSetClearFunction(global, ['timeout', 'interval', 'immediate']);
          fnPatch.patchSetFunction(global, ['requestAnimationFrame', 'mozRequestAnimationFrame', 'webkitRequestAnimationFrame']);
          fnPatch.patchFunction(global, ['alert', 'prompt']);
          eventTargetPatch.apply();
          propertyDescriptorPatch.apply();
          promisePatch.apply();
          mutationObserverPatch.patchClass('MutationObserver');
          mutationObserverPatch.patchClass('WebKitMutationObserver');
          definePropertyPatch.apply();
          registerElementPatch.apply();
          geolocationPatch.apply();
        }
        module.exports = {apply: apply};
      }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
    }, {
      "./define-property": 5,
      "./event-target": 6,
      "./functions": 7,
      "./geolocation": 8,
      "./mutation-observer": 9,
      "./promise": 10,
      "./property-descriptor": 11,
      "./register-element": 12,
      "./websocket": 13
    }],
    5: [function(require, module, exports) {
      'use strict';
      var _defineProperty = Object.defineProperty;
      var _getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
      var _create = Object.create;
      function apply() {
        Object.defineProperty = function(obj, prop, desc) {
          if (isUnconfigurable(obj, prop)) {
            throw new TypeError('Cannot assign to read only property \'' + prop + '\' of ' + obj);
          }
          if (prop !== 'prototype') {
            desc = rewriteDescriptor(obj, prop, desc);
          }
          return _defineProperty(obj, prop, desc);
        };
        Object.defineProperties = function(obj, props) {
          Object.keys(props).forEach(function(prop) {
            Object.defineProperty(obj, prop, props[prop]);
          });
          return obj;
        };
        Object.create = function(obj, proto) {
          if (typeof proto === 'object') {
            Object.keys(proto).forEach(function(prop) {
              proto[prop] = rewriteDescriptor(obj, prop, proto[prop]);
            });
          }
          return _create(obj, proto);
        };
        Object.getOwnPropertyDescriptor = function(obj, prop) {
          var desc = _getOwnPropertyDescriptor(obj, prop);
          if (isUnconfigurable(obj, prop)) {
            desc.configurable = false;
          }
          return desc;
        };
      }
      ;
      function _redefineProperty(obj, prop, desc) {
        desc = rewriteDescriptor(obj, prop, desc);
        return _defineProperty(obj, prop, desc);
      }
      ;
      function isUnconfigurable(obj, prop) {
        return obj && obj.__unconfigurables && obj.__unconfigurables[prop];
      }
      function rewriteDescriptor(obj, prop, desc) {
        desc.configurable = true;
        if (!desc.configurable) {
          if (!obj.__unconfigurables) {
            _defineProperty(obj, '__unconfigurables', {
              writable: true,
              value: {}
            });
          }
          obj.__unconfigurables[prop] = true;
        }
        return desc;
      }
      module.exports = {
        apply: apply,
        _redefineProperty: _redefineProperty
      };
    }, {}],
    6: [function(require, module, exports) {
      (function(global) {
        'use strict';
        var utils = require("../utils");
        function apply() {
          if (global.EventTarget) {
            utils.patchEventTargetMethods(global.EventTarget.prototype);
          } else {
            var apis = ['ApplicationCache', 'EventSource', 'FileReader', 'InputMethodContext', 'MediaController', 'MessagePort', 'Node', 'Performance', 'SVGElementInstance', 'SharedWorker', 'TextTrack', 'TextTrackCue', 'TextTrackList', 'WebKitNamedFlow', 'Window', 'Worker', 'WorkerGlobalScope', 'XMLHttpRequest', 'XMLHttpRequestEventTarget', 'XMLHttpRequestUpload'];
            apis.forEach(function(thing) {
              global[thing] && utils.patchEventTargetMethods(global[thing].prototype);
            });
          }
        }
        module.exports = {apply: apply};
      }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
    }, {"../utils": 14}],
    7: [function(require, module, exports) {
      (function(global) {
        'use strict';
        var utils = require("../utils");
        function patchSetClearFunction(obj, fnNames) {
          fnNames.map(function(name) {
            return name[0].toUpperCase() + name.substr(1);
          }).forEach(function(name) {
            var setName = 'set' + name;
            var delegate = obj[setName];
            if (delegate) {
              var clearName = 'clear' + name;
              var ids = {};
              var bindArgs = setName === 'setInterval' ? utils.bindArguments : utils.bindArgumentsOnce;
              global.zone[setName] = function(fn) {
                var id,
                    fnRef = fn;
                arguments[0] = function() {
                  delete ids[id];
                  return fnRef.apply(this, arguments);
                };
                var args = bindArgs(arguments);
                id = delegate.apply(obj, args);
                ids[id] = true;
                return id;
              };
              obj[setName] = function() {
                return global.zone[setName].apply(this, arguments);
              };
              var clearDelegate = obj[clearName];
              global.zone[clearName] = function(id) {
                if (ids[id]) {
                  delete ids[id];
                  global.zone.dequeueTask();
                }
                return clearDelegate.apply(this, arguments);
              };
              obj[clearName] = function() {
                return global.zone[clearName].apply(this, arguments);
              };
            }
          });
        }
        ;
        function patchSetFunction(obj, fnNames) {
          fnNames.forEach(function(name) {
            var delegate = obj[name];
            if (delegate) {
              global.zone[name] = function(fn) {
                var fnRef = fn;
                arguments[0] = function() {
                  return fnRef.apply(this, arguments);
                };
                var args = utils.bindArgumentsOnce(arguments);
                return delegate.apply(obj, args);
              };
              obj[name] = function() {
                return zone[name].apply(this, arguments);
              };
            }
          });
        }
        ;
        function patchFunction(obj, fnNames) {
          fnNames.forEach(function(name) {
            var delegate = obj[name];
            global.zone[name] = function() {
              return delegate.apply(obj, arguments);
            };
            obj[name] = function() {
              return global.zone[name].apply(this, arguments);
            };
          });
        }
        ;
        module.exports = {
          patchSetClearFunction: patchSetClearFunction,
          patchSetFunction: patchSetFunction,
          patchFunction: patchFunction
        };
      }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
    }, {"../utils": 14}],
    8: [function(require, module, exports) {
      (function(global) {
        'use strict';
        var utils = require("../utils");
        function apply() {
          if (global.navigator && global.navigator.geolocation) {
            utils.patchPrototype(global.navigator.geolocation, ['getCurrentPosition', 'watchPosition']);
          }
        }
        module.exports = {apply: apply};
      }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
    }, {"../utils": 14}],
    9: [function(require, module, exports) {
      (function(global) {
        'use strict';
        function patchClass(className) {
          var OriginalClass = global[className];
          if (!OriginalClass)
            return;
          global[className] = function(fn) {
            this._o = new OriginalClass(global.zone.bind(fn, true));
            this._creationZone = global.zone;
          };
          var instance = new OriginalClass(function() {});
          global[className].prototype.disconnect = function() {
            var result = this._o.disconnect.apply(this._o, arguments);
            if (this._active) {
              this._creationZone.dequeueTask();
              this._active = false;
            }
            return result;
          };
          global[className].prototype.observe = function() {
            if (!this._active) {
              this._creationZone.enqueueTask();
              this._active = true;
            }
            return this._o.observe.apply(this._o, arguments);
          };
          var prop;
          for (prop in instance) {
            (function(prop) {
              if (typeof global[className].prototype !== undefined) {
                return;
              }
              if (typeof instance[prop] === 'function') {
                global[className].prototype[prop] = function() {
                  return this._o[prop].apply(this._o, arguments);
                };
              } else {
                Object.defineProperty(global[className].prototype, prop, {
                  set: function(fn) {
                    if (typeof fn === 'function') {
                      this._o[prop] = global.zone.bind(fn);
                    } else {
                      this._o[prop] = fn;
                    }
                  },
                  get: function() {
                    return this._o[prop];
                  }
                });
              }
            }(prop));
          }
        }
        ;
        module.exports = {patchClass: patchClass};
      }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
    }, {}],
    10: [function(require, module, exports) {
      (function(global) {
        'use strict';
        var utils = require("../utils");
        var bindPromiseFn;
        if (global.Promise) {
          bindPromiseFn = function(delegate) {
            return function() {
              var delegatePromise = delegate.apply(this, arguments);
              if (delegatePromise instanceof Promise) {
                return delegatePromise;
              }
              return new Promise(function(resolve, reject) {
                delegatePromise.then(resolve, reject);
              });
            };
          };
        } else {
          bindPromiseFn = function(delegate) {
            return function() {
              return _patchThenable(delegate.apply(this, arguments));
            };
          };
        }
        function _patchPromiseFnsOnObject(objectPath, fnNames) {
          var obj = global;
          var exists = objectPath.every(function(segment) {
            obj = obj[segment];
            return obj;
          });
          if (!exists) {
            return;
          }
          fnNames.forEach(function(name) {
            var fn = obj[name];
            if (fn) {
              obj[name] = bindPromiseFn(fn);
            }
          });
        }
        function _patchThenable(thenable) {
          var then = thenable.then;
          thenable.then = function() {
            var args = utils.bindArguments(arguments);
            var nextThenable = then.apply(thenable, args);
            return _patchThenable(nextThenable);
          };
          var ocatch = thenable.catch;
          thenable.catch = function() {
            var args = utils.bindArguments(arguments);
            var nextThenable = ocatch.apply(thenable, args);
            return _patchThenable(nextThenable);
          };
          return thenable;
        }
        function apply() {
          if (global.Promise) {
            utils.patchPrototype(Promise.prototype, ['then', 'catch']);
            var patchFns = [[[], ['fetch']], [['Response', 'prototype'], ['arrayBuffer', 'blob', 'json', 'text']]];
            patchFns.forEach(function(objPathAndFns) {
              _patchPromiseFnsOnObject(objPathAndFns[0], objPathAndFns[1]);
            });
          }
        }
        module.exports = {
          apply: apply,
          bindPromiseFn: bindPromiseFn
        };
      }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
    }, {"../utils": 14}],
    11: [function(require, module, exports) {
      (function(global) {
        'use strict';
        var webSocketPatch = require("./websocket");
        var utils = require("../utils");
        var eventNames = 'copy cut paste abort blur focus canplay canplaythrough change click contextmenu dblclick drag dragend dragenter dragleave dragover dragstart drop durationchange emptied ended input invalid keydown keypress keyup load loadeddata loadedmetadata loadstart message mousedown mouseenter mouseleave mousemove mouseout mouseover mouseup pause play playing progress ratechange reset scroll seeked seeking select show stalled submit suspend timeupdate volumechange waiting mozfullscreenchange mozfullscreenerror mozpointerlockchange mozpointerlockerror error webglcontextrestored webglcontextlost webglcontextcreationerror'.split(' ');
        function apply() {
          if (utils.isWebWorker()) {
            return;
          }
          var supportsWebSocket = typeof WebSocket !== 'undefined';
          if (canPatchViaPropertyDescriptor()) {
            var onEventNames = eventNames.map(function(property) {
              return 'on' + property;
            });
            utils.patchProperties(HTMLElement.prototype, onEventNames);
            utils.patchProperties(XMLHttpRequest.prototype);
            if (supportsWebSocket) {
              utils.patchProperties(WebSocket.prototype);
            }
          } else {
            patchViaCapturingAllTheEvents();
            utils.patchClass('XMLHttpRequest');
            if (supportsWebSocket) {
              webSocketPatch.apply();
            }
          }
        }
        function canPatchViaPropertyDescriptor() {
          if (!Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'onclick') && typeof Element !== 'undefined') {
            var desc = Object.getOwnPropertyDescriptor(Element.prototype, 'onclick');
            if (desc && !desc.configurable)
              return false;
          }
          Object.defineProperty(HTMLElement.prototype, 'onclick', {get: function() {
              return true;
            }});
          var elt = document.createElement('div');
          var result = !!elt.onclick;
          Object.defineProperty(HTMLElement.prototype, 'onclick', {});
          return result;
        }
        ;
        function patchViaCapturingAllTheEvents() {
          eventNames.forEach(function(property) {
            var onproperty = 'on' + property;
            document.addEventListener(property, function(event) {
              var elt = event.target,
                  bound;
              while (elt) {
                if (elt[onproperty] && !elt[onproperty]._unbound) {
                  bound = global.zone.bind(elt[onproperty]);
                  bound._unbound = elt[onproperty];
                  elt[onproperty] = bound;
                }
                elt = elt.parentElement;
              }
            }, true);
          });
        }
        ;
        module.exports = {apply: apply};
      }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
    }, {
      "../utils": 14,
      "./websocket": 13
    }],
    12: [function(require, module, exports) {
      (function(global) {
        'use strict';
        var _redefineProperty = require("./define-property")._redefineProperty;
        var utils = require("../utils");
        function apply() {
          if (utils.isWebWorker() || !('registerElement' in global.document)) {
            return;
          }
          var _registerElement = document.registerElement;
          var callbacks = ['createdCallback', 'attachedCallback', 'detachedCallback', 'attributeChangedCallback'];
          document.registerElement = function(name, opts) {
            if (opts && opts.prototype) {
              callbacks.forEach(function(callback) {
                if (opts.prototype.hasOwnProperty(callback)) {
                  var descriptor = Object.getOwnPropertyDescriptor(opts.prototype, callback);
                  if (descriptor.value) {
                    descriptor.value = global.zone.bind(descriptor.value);
                    _redefineProperty(opts.prototype, callback, descriptor);
                  } else {
                    opts.prototype[callback] = global.zone.bind(opts.prototype[callback]);
                  }
                } else if (opts.prototype[callback]) {
                  opts.prototype[callback] = global.zone.bind(opts.prototype[callback]);
                }
              });
            }
            return _registerElement.apply(document, [name, opts]);
          };
        }
        module.exports = {apply: apply};
      }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
    }, {
      "../utils": 14,
      "./define-property": 5
    }],
    13: [function(require, module, exports) {
      (function(global) {
        'use strict';
        var utils = require("../utils");
        function apply() {
          var WS = global.WebSocket;
          utils.patchEventTargetMethods(WS.prototype);
          global.WebSocket = function(a, b) {
            var socket = arguments.length > 1 ? new WS(a, b) : new WS(a);
            var proxySocket;
            var onmessageDesc = Object.getOwnPropertyDescriptor(socket, 'onmessage');
            if (onmessageDesc && onmessageDesc.configurable === false) {
              proxySocket = Object.create(socket);
              ['addEventListener', 'removeEventListener', 'send', 'close'].forEach(function(propName) {
                proxySocket[propName] = function() {
                  return socket[propName].apply(socket, arguments);
                };
              });
            } else {
              proxySocket = socket;
            }
            utils.patchProperties(proxySocket, ['onclose', 'onerror', 'onmessage', 'onopen']);
            return proxySocket;
          };
        }
        module.exports = {apply: apply};
      }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
    }, {"../utils": 14}],
    14: [function(require, module, exports) {
      (function(global) {
        'use strict';
        function bindArguments(args) {
          for (var i = args.length - 1; i >= 0; i--) {
            if (typeof args[i] === 'function') {
              args[i] = global.zone.bind(args[i]);
            }
          }
          return args;
        }
        ;
        function bindArgumentsOnce(args) {
          for (var i = args.length - 1; i >= 0; i--) {
            if (typeof args[i] === 'function') {
              args[i] = global.zone.bindOnce(args[i]);
            }
          }
          return args;
        }
        ;
        function patchPrototype(obj, fnNames) {
          fnNames.forEach(function(name) {
            var delegate = obj[name];
            if (delegate) {
              obj[name] = function() {
                return delegate.apply(this, bindArguments(arguments));
              };
            }
          });
        }
        ;
        function isWebWorker() {
          return (typeof document === "undefined");
        }
        function patchProperty(obj, prop) {
          var desc = Object.getOwnPropertyDescriptor(obj, prop) || {
            enumerable: true,
            configurable: true
          };
          delete desc.writable;
          delete desc.value;
          var eventName = prop.substr(2);
          var _prop = '_' + prop;
          desc.set = function(fn) {
            if (this[_prop]) {
              this.removeEventListener(eventName, this[_prop]);
            }
            if (typeof fn === 'function') {
              this[_prop] = fn;
              this.addEventListener(eventName, fn, false);
            } else {
              this[_prop] = null;
            }
          };
          desc.get = function() {
            return this[_prop];
          };
          Object.defineProperty(obj, prop, desc);
        }
        ;
        function patchProperties(obj, properties) {
          (properties || (function() {
            var props = [];
            for (var prop in obj) {
              props.push(prop);
            }
            return props;
          }()).filter(function(propertyName) {
            return propertyName.substr(0, 2) === 'on';
          })).forEach(function(eventName) {
            patchProperty(obj, eventName);
          });
        }
        ;
        function patchEventTargetMethods(obj) {
          var addDelegate = obj.addEventListener;
          obj.addEventListener = function(eventName, handler) {
            var fn;
            if (handler.toString() !== "[object FunctionWrapper]") {
              if (handler.handleEvent) {
                fn = (function(handler) {
                  return function() {
                    handler.handleEvent.apply(handler, arguments);
                  };
                })(handler);
              } else {
                fn = handler;
              }
              handler._fn = fn;
              handler._bound = handler._bound || {};
              arguments[1] = handler._bound[eventName] = zone.bind(fn);
            }
            return addDelegate.apply(this, arguments);
          };
          var removeDelegate = obj.removeEventListener;
          obj.removeEventListener = function(eventName, handler) {
            if (handler._bound && handler._bound[eventName]) {
              var _bound = handler._bound;
              arguments[1] = _bound[eventName];
              delete _bound[eventName];
            }
            var result = removeDelegate.apply(this, arguments);
            global.zone.dequeueTask(handler._fn);
            return result;
          };
        }
        ;
        function patchClass(className) {
          var OriginalClass = global[className];
          if (!OriginalClass)
            return;
          global[className] = function() {
            var a = bindArguments(arguments);
            switch (a.length) {
              case 0:
                this._o = new OriginalClass();
                break;
              case 1:
                this._o = new OriginalClass(a[0]);
                break;
              case 2:
                this._o = new OriginalClass(a[0], a[1]);
                break;
              case 3:
                this._o = new OriginalClass(a[0], a[1], a[2]);
                break;
              case 4:
                this._o = new OriginalClass(a[0], a[1], a[2], a[3]);
                break;
              default:
                throw new Error('what are you even doing?');
            }
          };
          var instance = new OriginalClass();
          var prop;
          for (prop in instance) {
            (function(prop) {
              if (typeof instance[prop] === 'function') {
                global[className].prototype[prop] = function() {
                  return this._o[prop].apply(this._o, arguments);
                };
              } else {
                Object.defineProperty(global[className].prototype, prop, {
                  set: function(fn) {
                    if (typeof fn === 'function') {
                      this._o[prop] = global.zone.bind(fn);
                    } else {
                      this._o[prop] = fn;
                    }
                  },
                  get: function() {
                    return this._o[prop];
                  }
                });
              }
            }(prop));
          }
          for (prop in OriginalClass) {
            if (prop !== 'prototype' && OriginalClass.hasOwnProperty(prop)) {
              global[className][prop] = OriginalClass[prop];
            }
          }
        }
        ;
        module.exports = {
          bindArguments: bindArguments,
          bindArgumentsOnce: bindArgumentsOnce,
          patchPrototype: patchPrototype,
          patchProperty: patchProperty,
          patchProperties: patchProperties,
          patchEventTargetMethods: patchEventTargetMethods,
          patchClass: patchClass,
          isWebWorker: isWebWorker
        };
      }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
    }, {}],
    15: [function(require, module, exports) {
      (function(process, global) {
        (function() {
          "use strict";
          function lib$es6$promise$utils$$objectOrFunction(x) {
            return typeof x === 'function' || (typeof x === 'object' && x !== null);
          }
          function lib$es6$promise$utils$$isFunction(x) {
            return typeof x === 'function';
          }
          function lib$es6$promise$utils$$isMaybeThenable(x) {
            return typeof x === 'object' && x !== null;
          }
          var lib$es6$promise$utils$$_isArray;
          if (!Array.isArray) {
            lib$es6$promise$utils$$_isArray = function(x) {
              return Object.prototype.toString.call(x) === '[object Array]';
            };
          } else {
            lib$es6$promise$utils$$_isArray = Array.isArray;
          }
          var lib$es6$promise$utils$$isArray = lib$es6$promise$utils$$_isArray;
          var lib$es6$promise$asap$$len = 0;
          var lib$es6$promise$asap$$toString = {}.toString;
          var lib$es6$promise$asap$$vertxNext;
          var lib$es6$promise$asap$$customSchedulerFn;
          var lib$es6$promise$asap$$asap = function asap(callback, arg) {
            lib$es6$promise$asap$$queue[lib$es6$promise$asap$$len] = callback;
            lib$es6$promise$asap$$queue[lib$es6$promise$asap$$len + 1] = arg;
            lib$es6$promise$asap$$len += 2;
            if (lib$es6$promise$asap$$len === 2) {
              if (lib$es6$promise$asap$$customSchedulerFn) {
                lib$es6$promise$asap$$customSchedulerFn(lib$es6$promise$asap$$flush);
              } else {
                lib$es6$promise$asap$$scheduleFlush();
              }
            }
          };
          function lib$es6$promise$asap$$setScheduler(scheduleFn) {
            lib$es6$promise$asap$$customSchedulerFn = scheduleFn;
          }
          function lib$es6$promise$asap$$setAsap(asapFn) {
            lib$es6$promise$asap$$asap = asapFn;
          }
          var lib$es6$promise$asap$$browserWindow = (typeof window !== 'undefined') ? window : undefined;
          var lib$es6$promise$asap$$browserGlobal = lib$es6$promise$asap$$browserWindow || {};
          var lib$es6$promise$asap$$BrowserMutationObserver = lib$es6$promise$asap$$browserGlobal.MutationObserver || lib$es6$promise$asap$$browserGlobal.WebKitMutationObserver;
          var lib$es6$promise$asap$$isNode = typeof process !== 'undefined' && {}.toString.call(process) === '[object process]';
          var lib$es6$promise$asap$$isWorker = typeof Uint8ClampedArray !== 'undefined' && typeof importScripts !== 'undefined' && typeof MessageChannel !== 'undefined';
          function lib$es6$promise$asap$$useNextTick() {
            var nextTick = process.nextTick;
            var version = process.versions.node.match(/^(?:(\d+)\.)?(?:(\d+)\.)?(\*|\d+)$/);
            if (Array.isArray(version) && version[1] === '0' && version[2] === '10') {
              nextTick = setImmediate;
            }
            return function() {
              nextTick(lib$es6$promise$asap$$flush);
            };
          }
          function lib$es6$promise$asap$$useVertxTimer() {
            return function() {
              lib$es6$promise$asap$$vertxNext(lib$es6$promise$asap$$flush);
            };
          }
          function lib$es6$promise$asap$$useMutationObserver() {
            var iterations = 0;
            var observer = new lib$es6$promise$asap$$BrowserMutationObserver(lib$es6$promise$asap$$flush);
            var node = document.createTextNode('');
            observer.observe(node, {characterData: true});
            return function() {
              node.data = (iterations = ++iterations % 2);
            };
          }
          function lib$es6$promise$asap$$useMessageChannel() {
            var channel = new MessageChannel();
            channel.port1.onmessage = lib$es6$promise$asap$$flush;
            return function() {
              channel.port2.postMessage(0);
            };
          }
          function lib$es6$promise$asap$$useSetTimeout() {
            return function() {
              setTimeout(lib$es6$promise$asap$$flush, 1);
            };
          }
          var lib$es6$promise$asap$$queue = new Array(1000);
          function lib$es6$promise$asap$$flush() {
            for (var i = 0; i < lib$es6$promise$asap$$len; i += 2) {
              var callback = lib$es6$promise$asap$$queue[i];
              var arg = lib$es6$promise$asap$$queue[i + 1];
              callback(arg);
              lib$es6$promise$asap$$queue[i] = undefined;
              lib$es6$promise$asap$$queue[i + 1] = undefined;
            }
            lib$es6$promise$asap$$len = 0;
          }
          function lib$es6$promise$asap$$attemptVertex() {
            try {
              var r = require;
              var vertx = r('vertx');
              lib$es6$promise$asap$$vertxNext = vertx.runOnLoop || vertx.runOnContext;
              return lib$es6$promise$asap$$useVertxTimer();
            } catch (e) {
              return lib$es6$promise$asap$$useSetTimeout();
            }
          }
          var lib$es6$promise$asap$$scheduleFlush;
          if (lib$es6$promise$asap$$isNode) {
            lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useNextTick();
          } else if (lib$es6$promise$asap$$BrowserMutationObserver) {
            lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useMutationObserver();
          } else if (lib$es6$promise$asap$$isWorker) {
            lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useMessageChannel();
          } else if (lib$es6$promise$asap$$browserWindow === undefined && typeof require === 'function') {
            lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$attemptVertex();
          } else {
            lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useSetTimeout();
          }
          function lib$es6$promise$$internal$$noop() {}
          var lib$es6$promise$$internal$$PENDING = void 0;
          var lib$es6$promise$$internal$$FULFILLED = 1;
          var lib$es6$promise$$internal$$REJECTED = 2;
          var lib$es6$promise$$internal$$GET_THEN_ERROR = new lib$es6$promise$$internal$$ErrorObject();
          function lib$es6$promise$$internal$$selfFullfillment() {
            return new TypeError("You cannot resolve a promise with itself");
          }
          function lib$es6$promise$$internal$$cannotReturnOwn() {
            return new TypeError('A promises callback cannot return that same promise.');
          }
          function lib$es6$promise$$internal$$getThen(promise) {
            try {
              return promise.then;
            } catch (error) {
              lib$es6$promise$$internal$$GET_THEN_ERROR.error = error;
              return lib$es6$promise$$internal$$GET_THEN_ERROR;
            }
          }
          function lib$es6$promise$$internal$$tryThen(then, value, fulfillmentHandler, rejectionHandler) {
            try {
              then.call(value, fulfillmentHandler, rejectionHandler);
            } catch (e) {
              return e;
            }
          }
          function lib$es6$promise$$internal$$handleForeignThenable(promise, thenable, then) {
            lib$es6$promise$asap$$asap(function(promise) {
              var sealed = false;
              var error = lib$es6$promise$$internal$$tryThen(then, thenable, function(value) {
                if (sealed) {
                  return;
                }
                sealed = true;
                if (thenable !== value) {
                  lib$es6$promise$$internal$$resolve(promise, value);
                } else {
                  lib$es6$promise$$internal$$fulfill(promise, value);
                }
              }, function(reason) {
                if (sealed) {
                  return;
                }
                sealed = true;
                lib$es6$promise$$internal$$reject(promise, reason);
              }, 'Settle: ' + (promise._label || ' unknown promise'));
              if (!sealed && error) {
                sealed = true;
                lib$es6$promise$$internal$$reject(promise, error);
              }
            }, promise);
          }
          function lib$es6$promise$$internal$$handleOwnThenable(promise, thenable) {
            if (thenable._state === lib$es6$promise$$internal$$FULFILLED) {
              lib$es6$promise$$internal$$fulfill(promise, thenable._result);
            } else if (thenable._state === lib$es6$promise$$internal$$REJECTED) {
              lib$es6$promise$$internal$$reject(promise, thenable._result);
            } else {
              lib$es6$promise$$internal$$subscribe(thenable, undefined, function(value) {
                lib$es6$promise$$internal$$resolve(promise, value);
              }, function(reason) {
                lib$es6$promise$$internal$$reject(promise, reason);
              });
            }
          }
          function lib$es6$promise$$internal$$handleMaybeThenable(promise, maybeThenable) {
            if (maybeThenable.constructor === promise.constructor) {
              lib$es6$promise$$internal$$handleOwnThenable(promise, maybeThenable);
            } else {
              var then = lib$es6$promise$$internal$$getThen(maybeThenable);
              if (then === lib$es6$promise$$internal$$GET_THEN_ERROR) {
                lib$es6$promise$$internal$$reject(promise, lib$es6$promise$$internal$$GET_THEN_ERROR.error);
              } else if (then === undefined) {
                lib$es6$promise$$internal$$fulfill(promise, maybeThenable);
              } else if (lib$es6$promise$utils$$isFunction(then)) {
                lib$es6$promise$$internal$$handleForeignThenable(promise, maybeThenable, then);
              } else {
                lib$es6$promise$$internal$$fulfill(promise, maybeThenable);
              }
            }
          }
          function lib$es6$promise$$internal$$resolve(promise, value) {
            if (promise === value) {
              lib$es6$promise$$internal$$reject(promise, lib$es6$promise$$internal$$selfFullfillment());
            } else if (lib$es6$promise$utils$$objectOrFunction(value)) {
              lib$es6$promise$$internal$$handleMaybeThenable(promise, value);
            } else {
              lib$es6$promise$$internal$$fulfill(promise, value);
            }
          }
          function lib$es6$promise$$internal$$publishRejection(promise) {
            if (promise._onerror) {
              promise._onerror(promise._result);
            }
            lib$es6$promise$$internal$$publish(promise);
          }
          function lib$es6$promise$$internal$$fulfill(promise, value) {
            if (promise._state !== lib$es6$promise$$internal$$PENDING) {
              return;
            }
            promise._result = value;
            promise._state = lib$es6$promise$$internal$$FULFILLED;
            if (promise._subscribers.length !== 0) {
              lib$es6$promise$asap$$asap(lib$es6$promise$$internal$$publish, promise);
            }
          }
          function lib$es6$promise$$internal$$reject(promise, reason) {
            if (promise._state !== lib$es6$promise$$internal$$PENDING) {
              return;
            }
            promise._state = lib$es6$promise$$internal$$REJECTED;
            promise._result = reason;
            lib$es6$promise$asap$$asap(lib$es6$promise$$internal$$publishRejection, promise);
          }
          function lib$es6$promise$$internal$$subscribe(parent, child, onFulfillment, onRejection) {
            var subscribers = parent._subscribers;
            var length = subscribers.length;
            parent._onerror = null;
            subscribers[length] = child;
            subscribers[length + lib$es6$promise$$internal$$FULFILLED] = onFulfillment;
            subscribers[length + lib$es6$promise$$internal$$REJECTED] = onRejection;
            if (length === 0 && parent._state) {
              lib$es6$promise$asap$$asap(lib$es6$promise$$internal$$publish, parent);
            }
          }
          function lib$es6$promise$$internal$$publish(promise) {
            var subscribers = promise._subscribers;
            var settled = promise._state;
            if (subscribers.length === 0) {
              return;
            }
            var child,
                callback,
                detail = promise._result;
            for (var i = 0; i < subscribers.length; i += 3) {
              child = subscribers[i];
              callback = subscribers[i + settled];
              if (child) {
                lib$es6$promise$$internal$$invokeCallback(settled, child, callback, detail);
              } else {
                callback(detail);
              }
            }
            promise._subscribers.length = 0;
          }
          function lib$es6$promise$$internal$$ErrorObject() {
            this.error = null;
          }
          var lib$es6$promise$$internal$$TRY_CATCH_ERROR = new lib$es6$promise$$internal$$ErrorObject();
          function lib$es6$promise$$internal$$tryCatch(callback, detail) {
            try {
              return callback(detail);
            } catch (e) {
              lib$es6$promise$$internal$$TRY_CATCH_ERROR.error = e;
              return lib$es6$promise$$internal$$TRY_CATCH_ERROR;
            }
          }
          function lib$es6$promise$$internal$$invokeCallback(settled, promise, callback, detail) {
            var hasCallback = lib$es6$promise$utils$$isFunction(callback),
                value,
                error,
                succeeded,
                failed;
            if (hasCallback) {
              value = lib$es6$promise$$internal$$tryCatch(callback, detail);
              if (value === lib$es6$promise$$internal$$TRY_CATCH_ERROR) {
                failed = true;
                error = value.error;
                value = null;
              } else {
                succeeded = true;
              }
              if (promise === value) {
                lib$es6$promise$$internal$$reject(promise, lib$es6$promise$$internal$$cannotReturnOwn());
                return;
              }
            } else {
              value = detail;
              succeeded = true;
            }
            if (promise._state !== lib$es6$promise$$internal$$PENDING) {} else if (hasCallback && succeeded) {
              lib$es6$promise$$internal$$resolve(promise, value);
            } else if (failed) {
              lib$es6$promise$$internal$$reject(promise, error);
            } else if (settled === lib$es6$promise$$internal$$FULFILLED) {
              lib$es6$promise$$internal$$fulfill(promise, value);
            } else if (settled === lib$es6$promise$$internal$$REJECTED) {
              lib$es6$promise$$internal$$reject(promise, value);
            }
          }
          function lib$es6$promise$$internal$$initializePromise(promise, resolver) {
            try {
              resolver(function resolvePromise(value) {
                lib$es6$promise$$internal$$resolve(promise, value);
              }, function rejectPromise(reason) {
                lib$es6$promise$$internal$$reject(promise, reason);
              });
            } catch (e) {
              lib$es6$promise$$internal$$reject(promise, e);
            }
          }
          function lib$es6$promise$enumerator$$Enumerator(Constructor, input) {
            var enumerator = this;
            enumerator._instanceConstructor = Constructor;
            enumerator.promise = new Constructor(lib$es6$promise$$internal$$noop);
            if (enumerator._validateInput(input)) {
              enumerator._input = input;
              enumerator.length = input.length;
              enumerator._remaining = input.length;
              enumerator._init();
              if (enumerator.length === 0) {
                lib$es6$promise$$internal$$fulfill(enumerator.promise, enumerator._result);
              } else {
                enumerator.length = enumerator.length || 0;
                enumerator._enumerate();
                if (enumerator._remaining === 0) {
                  lib$es6$promise$$internal$$fulfill(enumerator.promise, enumerator._result);
                }
              }
            } else {
              lib$es6$promise$$internal$$reject(enumerator.promise, enumerator._validationError());
            }
          }
          lib$es6$promise$enumerator$$Enumerator.prototype._validateInput = function(input) {
            return lib$es6$promise$utils$$isArray(input);
          };
          lib$es6$promise$enumerator$$Enumerator.prototype._validationError = function() {
            return new Error('Array Methods must be provided an Array');
          };
          lib$es6$promise$enumerator$$Enumerator.prototype._init = function() {
            this._result = new Array(this.length);
          };
          var lib$es6$promise$enumerator$$default = lib$es6$promise$enumerator$$Enumerator;
          lib$es6$promise$enumerator$$Enumerator.prototype._enumerate = function() {
            var enumerator = this;
            var length = enumerator.length;
            var promise = enumerator.promise;
            var input = enumerator._input;
            for (var i = 0; promise._state === lib$es6$promise$$internal$$PENDING && i < length; i++) {
              enumerator._eachEntry(input[i], i);
            }
          };
          lib$es6$promise$enumerator$$Enumerator.prototype._eachEntry = function(entry, i) {
            var enumerator = this;
            var c = enumerator._instanceConstructor;
            if (lib$es6$promise$utils$$isMaybeThenable(entry)) {
              if (entry.constructor === c && entry._state !== lib$es6$promise$$internal$$PENDING) {
                entry._onerror = null;
                enumerator._settledAt(entry._state, i, entry._result);
              } else {
                enumerator._willSettleAt(c.resolve(entry), i);
              }
            } else {
              enumerator._remaining--;
              enumerator._result[i] = entry;
            }
          };
          lib$es6$promise$enumerator$$Enumerator.prototype._settledAt = function(state, i, value) {
            var enumerator = this;
            var promise = enumerator.promise;
            if (promise._state === lib$es6$promise$$internal$$PENDING) {
              enumerator._remaining--;
              if (state === lib$es6$promise$$internal$$REJECTED) {
                lib$es6$promise$$internal$$reject(promise, value);
              } else {
                enumerator._result[i] = value;
              }
            }
            if (enumerator._remaining === 0) {
              lib$es6$promise$$internal$$fulfill(promise, enumerator._result);
            }
          };
          lib$es6$promise$enumerator$$Enumerator.prototype._willSettleAt = function(promise, i) {
            var enumerator = this;
            lib$es6$promise$$internal$$subscribe(promise, undefined, function(value) {
              enumerator._settledAt(lib$es6$promise$$internal$$FULFILLED, i, value);
            }, function(reason) {
              enumerator._settledAt(lib$es6$promise$$internal$$REJECTED, i, reason);
            });
          };
          function lib$es6$promise$promise$all$$all(entries) {
            return new lib$es6$promise$enumerator$$default(this, entries).promise;
          }
          var lib$es6$promise$promise$all$$default = lib$es6$promise$promise$all$$all;
          function lib$es6$promise$promise$race$$race(entries) {
            var Constructor = this;
            var promise = new Constructor(lib$es6$promise$$internal$$noop);
            if (!lib$es6$promise$utils$$isArray(entries)) {
              lib$es6$promise$$internal$$reject(promise, new TypeError('You must pass an array to race.'));
              return promise;
            }
            var length = entries.length;
            function onFulfillment(value) {
              lib$es6$promise$$internal$$resolve(promise, value);
            }
            function onRejection(reason) {
              lib$es6$promise$$internal$$reject(promise, reason);
            }
            for (var i = 0; promise._state === lib$es6$promise$$internal$$PENDING && i < length; i++) {
              lib$es6$promise$$internal$$subscribe(Constructor.resolve(entries[i]), undefined, onFulfillment, onRejection);
            }
            return promise;
          }
          var lib$es6$promise$promise$race$$default = lib$es6$promise$promise$race$$race;
          function lib$es6$promise$promise$resolve$$resolve(object) {
            var Constructor = this;
            if (object && typeof object === 'object' && object.constructor === Constructor) {
              return object;
            }
            var promise = new Constructor(lib$es6$promise$$internal$$noop);
            lib$es6$promise$$internal$$resolve(promise, object);
            return promise;
          }
          var lib$es6$promise$promise$resolve$$default = lib$es6$promise$promise$resolve$$resolve;
          function lib$es6$promise$promise$reject$$reject(reason) {
            var Constructor = this;
            var promise = new Constructor(lib$es6$promise$$internal$$noop);
            lib$es6$promise$$internal$$reject(promise, reason);
            return promise;
          }
          var lib$es6$promise$promise$reject$$default = lib$es6$promise$promise$reject$$reject;
          var lib$es6$promise$promise$$counter = 0;
          function lib$es6$promise$promise$$needsResolver() {
            throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
          }
          function lib$es6$promise$promise$$needsNew() {
            throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
          }
          var lib$es6$promise$promise$$default = lib$es6$promise$promise$$Promise;
          function lib$es6$promise$promise$$Promise(resolver) {
            this._id = lib$es6$promise$promise$$counter++;
            this._state = undefined;
            this._result = undefined;
            this._subscribers = [];
            if (lib$es6$promise$$internal$$noop !== resolver) {
              if (!lib$es6$promise$utils$$isFunction(resolver)) {
                lib$es6$promise$promise$$needsResolver();
              }
              if (!(this instanceof lib$es6$promise$promise$$Promise)) {
                lib$es6$promise$promise$$needsNew();
              }
              lib$es6$promise$$internal$$initializePromise(this, resolver);
            }
          }
          lib$es6$promise$promise$$Promise.all = lib$es6$promise$promise$all$$default;
          lib$es6$promise$promise$$Promise.race = lib$es6$promise$promise$race$$default;
          lib$es6$promise$promise$$Promise.resolve = lib$es6$promise$promise$resolve$$default;
          lib$es6$promise$promise$$Promise.reject = lib$es6$promise$promise$reject$$default;
          lib$es6$promise$promise$$Promise._setScheduler = lib$es6$promise$asap$$setScheduler;
          lib$es6$promise$promise$$Promise._setAsap = lib$es6$promise$asap$$setAsap;
          lib$es6$promise$promise$$Promise._asap = lib$es6$promise$asap$$asap;
          lib$es6$promise$promise$$Promise.prototype = {
            constructor: lib$es6$promise$promise$$Promise,
            then: function(onFulfillment, onRejection) {
              var parent = this;
              var state = parent._state;
              if (state === lib$es6$promise$$internal$$FULFILLED && !onFulfillment || state === lib$es6$promise$$internal$$REJECTED && !onRejection) {
                return this;
              }
              var child = new this.constructor(lib$es6$promise$$internal$$noop);
              var result = parent._result;
              if (state) {
                var callback = arguments[state - 1];
                lib$es6$promise$asap$$asap(function() {
                  lib$es6$promise$$internal$$invokeCallback(state, child, callback, result);
                });
              } else {
                lib$es6$promise$$internal$$subscribe(parent, child, onFulfillment, onRejection);
              }
              return child;
            },
            'catch': function(onRejection) {
              return this.then(null, onRejection);
            }
          };
          function lib$es6$promise$polyfill$$polyfill() {
            var local;
            if (typeof global !== 'undefined') {
              local = global;
            } else if (typeof self !== 'undefined') {
              local = self;
            } else {
              try {
                local = Function('return this')();
              } catch (e) {
                throw new Error('polyfill failed because global object is unavailable in this environment');
              }
            }
            var P = local.Promise;
            if (P && Object.prototype.toString.call(P.resolve()) === '[object Promise]' && !P.cast) {
              return;
            }
            local.Promise = lib$es6$promise$promise$$default;
          }
          var lib$es6$promise$polyfill$$default = lib$es6$promise$polyfill$$polyfill;
          var lib$es6$promise$umd$$ES6Promise = {
            'Promise': lib$es6$promise$promise$$default,
            'polyfill': lib$es6$promise$polyfill$$default
          };
          if (typeof define === 'function' && define['amd']) {
            define(function() {
              return lib$es6$promise$umd$$ES6Promise;
            });
          } else if (typeof module !== 'undefined' && module['exports']) {
            module['exports'] = lib$es6$promise$umd$$ES6Promise;
          } else if (typeof this !== 'undefined') {
            this['ES6Promise'] = lib$es6$promise$umd$$ES6Promise;
          }
          lib$es6$promise$polyfill$$default();
        }).call(this);
      }).call(this, {}, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
    }, {}]
  }, {}, [1]);
})(require("process"));

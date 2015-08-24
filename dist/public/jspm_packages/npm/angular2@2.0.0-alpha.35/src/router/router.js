/* */ 
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
var async_1 = require("../facade/async");
var collection_1 = require("../facade/collection");
var lang_1 = require("../facade/lang");
var instruction_1 = require("./instruction");
var route_lifecycle_reflector_1 = require("./route_lifecycle_reflector");
var _resolveToTrue = async_1.PromiseWrapper.resolve(true);
var _resolveToFalse = async_1.PromiseWrapper.resolve(false);
var Router = (function() {
  function Router(registry, _pipeline, parent, hostComponent) {
    this.registry = registry;
    this._pipeline = _pipeline;
    this.parent = parent;
    this.hostComponent = hostComponent;
    this.navigating = false;
    this._currentInstruction = null;
    this._currentNavigation = _resolveToTrue;
    this._outlet = null;
    this._auxOutlets = new collection_1.Map();
    this._subject = new async_1.EventEmitter();
  }
  Router.prototype.childRouter = function(hostComponent) {
    return new ChildRouter(this, hostComponent);
  };
  Router.prototype.registerOutlet = function(outlet) {
    if (lang_1.isPresent(outlet.name)) {
      this._auxOutlets.set(outlet.name, outlet);
    } else {
      this._outlet = outlet;
    }
    if (lang_1.isPresent(this._currentInstruction)) {
      return outlet.commit(this._currentInstruction);
    }
    return _resolveToTrue;
  };
  Router.prototype.config = function(definitions) {
    var _this = this;
    definitions.forEach(function(routeDefinition) {
      _this.registry.config(_this.hostComponent, routeDefinition);
    });
    return this.renavigate();
  };
  Router.prototype.navigate = function(url, _skipLocationChange) {
    var _this = this;
    if (_skipLocationChange === void 0) {
      _skipLocationChange = false;
    }
    return this._currentNavigation = this._currentNavigation.then(function(_) {
      _this.lastNavigationAttempt = url;
      _this._startNavigating();
      return _this._afterPromiseFinishNavigating(_this.recognize(url).then(function(instruction) {
        if (lang_1.isBlank(instruction)) {
          return false;
        }
        return _this._navigate(instruction, _skipLocationChange);
      }));
    });
  };
  Router.prototype.navigateInstruction = function(instruction, _skipLocationChange) {
    var _this = this;
    if (_skipLocationChange === void 0) {
      _skipLocationChange = false;
    }
    if (lang_1.isBlank(instruction)) {
      return _resolveToFalse;
    }
    return this._currentNavigation = this._currentNavigation.then(function(_) {
      _this._startNavigating();
      return _this._afterPromiseFinishNavigating(_this._navigate(instruction, _skipLocationChange));
    });
  };
  Router.prototype._navigate = function(instruction, _skipLocationChange) {
    var _this = this;
    return this._settleInstruction(instruction).then(function(_) {
      return _this._reuse(instruction);
    }).then(function(_) {
      return _this._canActivate(instruction);
    }).then(function(result) {
      if (!result) {
        return false;
      }
      return _this._canDeactivate(instruction).then(function(result) {
        if (result) {
          return _this.commit(instruction, _skipLocationChange).then(function(_) {
            _this._emitNavigationFinish(instruction_1.stringifyInstruction(instruction));
            return true;
          });
        }
      });
    });
  };
  Router.prototype._settleInstruction = function(instruction) {
    var _this = this;
    var unsettledInstructions = [];
    if (lang_1.isBlank(instruction.component.componentType)) {
      unsettledInstructions.push(instruction.component.resolveComponentType());
    }
    if (lang_1.isPresent(instruction.child)) {
      unsettledInstructions.push(this._settleInstruction(instruction.child));
    }
    collection_1.StringMapWrapper.forEach(instruction.auxInstruction, function(instruction, _) {
      unsettledInstructions.push(_this._settleInstruction(instruction));
    });
    return async_1.PromiseWrapper.all(unsettledInstructions);
  };
  Router.prototype._emitNavigationFinish = function(url) {
    async_1.ObservableWrapper.callNext(this._subject, url);
  };
  Router.prototype._afterPromiseFinishNavigating = function(promise) {
    var _this = this;
    return async_1.PromiseWrapper.catchError(promise.then(function(_) {
      return _this._finishNavigating();
    }), function(err) {
      _this._finishNavigating();
      throw err;
    });
  };
  Router.prototype._reuse = function(instruction) {
    var _this = this;
    if (lang_1.isBlank(this._outlet)) {
      return _resolveToFalse;
    }
    return this._outlet.canReuse(instruction).then(function(result) {
      if (lang_1.isPresent(_this._outlet.childRouter) && lang_1.isPresent(instruction.child)) {
        return _this._outlet.childRouter._reuse(instruction.child);
      }
    });
  };
  Router.prototype._canActivate = function(nextInstruction) {
    return canActivateOne(nextInstruction, this._currentInstruction);
  };
  Router.prototype._canDeactivate = function(instruction) {
    var _this = this;
    if (lang_1.isBlank(this._outlet)) {
      return _resolveToTrue;
    }
    var next;
    if (lang_1.isPresent(instruction) && instruction.component.reuse) {
      next = _resolveToTrue;
    } else {
      next = this._outlet.canDeactivate(instruction);
    }
    return next.then(function(result) {
      if (result == false) {
        return false;
      }
      if (lang_1.isPresent(_this._outlet.childRouter)) {
        return _this._outlet.childRouter._canDeactivate(lang_1.isPresent(instruction) ? instruction.child : null);
      }
      return true;
    });
  };
  Router.prototype.commit = function(instruction, _skipLocationChange) {
    if (_skipLocationChange === void 0) {
      _skipLocationChange = false;
    }
    this._currentInstruction = instruction;
    var next = _resolveToTrue;
    if (lang_1.isPresent(this._outlet)) {
      next = this._outlet.commit(instruction);
    }
    var promises = [];
    collection_1.MapWrapper.forEach(this._auxOutlets, function(outlet, _) {
      promises.push(outlet.commit(instruction));
    });
    return next.then(function(_) {
      return async_1.PromiseWrapper.all(promises);
    });
  };
  Router.prototype._startNavigating = function() {
    this.navigating = true;
  };
  Router.prototype._finishNavigating = function() {
    this.navigating = false;
  };
  Router.prototype.subscribe = function(onNext) {
    async_1.ObservableWrapper.subscribe(this._subject, onNext);
  };
  Router.prototype.deactivate = function(instruction) {
    if (lang_1.isPresent(this._outlet)) {
      return this._outlet.deactivate(instruction);
    }
    return _resolveToTrue;
  };
  Router.prototype.recognize = function(url) {
    return this.registry.recognize(url, this.hostComponent);
  };
  Router.prototype.renavigate = function() {
    if (lang_1.isBlank(this.lastNavigationAttempt)) {
      return this._currentNavigation;
    }
    return this.navigate(this.lastNavigationAttempt);
  };
  Router.prototype.generate = function(linkParams) {
    var normalizedLinkParams = splitAndFlattenLinkParams(linkParams);
    var first = collection_1.ListWrapper.first(normalizedLinkParams);
    var rest = collection_1.ListWrapper.slice(normalizedLinkParams, 1);
    var router = this;
    if (first == '') {
      while (lang_1.isPresent(router.parent)) {
        router = router.parent;
      }
    } else if (first == '..') {
      router = router.parent;
      while (collection_1.ListWrapper.first(rest) == '..') {
        rest = collection_1.ListWrapper.slice(rest, 1);
        router = router.parent;
        if (lang_1.isBlank(router)) {
          throw new lang_1.BaseException("Link \"" + collection_1.ListWrapper.toJSON(linkParams) + "\" has too many \"../\" segments.");
        }
      }
    } else if (first != '.') {
      throw new lang_1.BaseException("Link \"" + collection_1.ListWrapper.toJSON(linkParams) + "\" must start with \"/\", \"./\", or \"../\"");
    }
    if (rest[rest.length - 1] == '') {
      collection_1.ListWrapper.removeLast(rest);
    }
    if (rest.length < 1) {
      var msg = "Link \"" + collection_1.ListWrapper.toJSON(linkParams) + "\" must include a route name.";
      throw new lang_1.BaseException(msg);
    }
    var url = [];
    var parent = router.parent;
    while (lang_1.isPresent(parent)) {
      url.unshift(parent._currentInstruction);
      parent = parent.parent;
    }
    var nextInstruction = this.registry.generate(rest, router.hostComponent);
    while (url.length > 0) {
      nextInstruction = url.pop().replaceChild(nextInstruction);
    }
    return nextInstruction;
  };
  return Router;
})();
exports.Router = Router;
var RootRouter = (function(_super) {
  __extends(RootRouter, _super);
  function RootRouter(registry, pipeline, location, hostComponent) {
    var _this = this;
    _super.call(this, registry, pipeline, null, hostComponent);
    this._location = location;
    this._location.subscribe(function(change) {
      return _this.navigate(change['url'], lang_1.isPresent(change['pop']));
    });
    this.registry.configFromComponent(hostComponent);
    this.navigate(location.path());
  }
  RootRouter.prototype.commit = function(instruction, _skipLocationChange) {
    var _this = this;
    if (_skipLocationChange === void 0) {
      _skipLocationChange = false;
    }
    var emitUrl = instruction_1.stringifyInstruction(instruction);
    if (emitUrl.length > 0) {
      emitUrl = '/' + emitUrl;
    }
    var promise = _super.prototype.commit.call(this, instruction);
    if (!_skipLocationChange) {
      promise = promise.then(function(_) {
        _this._location.go(emitUrl);
      });
    }
    return promise;
  };
  return RootRouter;
})(Router);
exports.RootRouter = RootRouter;
var ChildRouter = (function(_super) {
  __extends(ChildRouter, _super);
  function ChildRouter(parent, hostComponent) {
    _super.call(this, parent.registry, parent._pipeline, parent, hostComponent);
    this.parent = parent;
  }
  ChildRouter.prototype.navigate = function(url, _skipLocationChange) {
    if (_skipLocationChange === void 0) {
      _skipLocationChange = false;
    }
    return this.parent.navigate(url, _skipLocationChange);
  };
  ChildRouter.prototype.navigateInstruction = function(instruction, _skipLocationChange) {
    if (_skipLocationChange === void 0) {
      _skipLocationChange = false;
    }
    return this.parent.navigateInstruction(instruction, _skipLocationChange);
  };
  return ChildRouter;
})(Router);
var SLASH = new RegExp('/');
function splitAndFlattenLinkParams(linkParams) {
  return collection_1.ListWrapper.reduce(linkParams, function(accumulation, item) {
    if (lang_1.isString(item)) {
      return collection_1.ListWrapper.concat(accumulation, lang_1.StringWrapper.split(item, SLASH));
    }
    accumulation.push(item);
    return accumulation;
  }, []);
}
function canActivateOne(nextInstruction, prevInstruction) {
  var next = _resolveToTrue;
  if (lang_1.isPresent(nextInstruction.child)) {
    next = canActivateOne(nextInstruction.child, lang_1.isPresent(prevInstruction) ? prevInstruction.child : null);
  }
  return next.then(function(result) {
    if (result == false) {
      return false;
    }
    if (nextInstruction.component.reuse) {
      return true;
    }
    var hook = route_lifecycle_reflector_1.getCanActivateHook(nextInstruction.component.componentType);
    if (lang_1.isPresent(hook)) {
      return hook(nextInstruction.component, lang_1.isPresent(prevInstruction) ? prevInstruction.component : null);
    }
    return true;
  });
}

/* */ 
(function(process) {
  'use strict';
  var collection_1 = require("../facade/collection");
  var binding_1 = require("./binding");
  var exceptions_1 = require("./exceptions");
  var lang_1 = require("../facade/lang");
  var key_1 = require("./key");
  var forward_ref_1 = require("./forward_ref");
  var metadata_1 = require("./metadata");
  var _MAX_CONSTRUCTION_COUNTER = 10;
  exports.UNDEFINED = lang_1.CONST_EXPR(new Object());
  (function(Visibility) {
    Visibility[Visibility["Public"] = 0] = "Public";
    Visibility[Visibility["Private"] = 1] = "Private";
    Visibility[Visibility["PublicAndPrivate"] = 2] = "PublicAndPrivate";
  })(exports.Visibility || (exports.Visibility = {}));
  var Visibility = exports.Visibility;
  function canSee(src, dst) {
    return (src === dst) || (dst === Visibility.PublicAndPrivate || src === Visibility.PublicAndPrivate);
  }
  var ProtoInjectorInlineStrategy = (function() {
    function ProtoInjectorInlineStrategy(protoEI, bwv) {
      this.binding0 = null;
      this.binding1 = null;
      this.binding2 = null;
      this.binding3 = null;
      this.binding4 = null;
      this.binding5 = null;
      this.binding6 = null;
      this.binding7 = null;
      this.binding8 = null;
      this.binding9 = null;
      this.keyId0 = null;
      this.keyId1 = null;
      this.keyId2 = null;
      this.keyId3 = null;
      this.keyId4 = null;
      this.keyId5 = null;
      this.keyId6 = null;
      this.keyId7 = null;
      this.keyId8 = null;
      this.keyId9 = null;
      this.visibility0 = null;
      this.visibility1 = null;
      this.visibility2 = null;
      this.visibility3 = null;
      this.visibility4 = null;
      this.visibility5 = null;
      this.visibility6 = null;
      this.visibility7 = null;
      this.visibility8 = null;
      this.visibility9 = null;
      var length = bwv.length;
      if (length > 0) {
        this.binding0 = bwv[0].binding;
        this.keyId0 = bwv[0].getKeyId();
        this.visibility0 = bwv[0].visibility;
      }
      if (length > 1) {
        this.binding1 = bwv[1].binding;
        this.keyId1 = bwv[1].getKeyId();
        this.visibility1 = bwv[1].visibility;
      }
      if (length > 2) {
        this.binding2 = bwv[2].binding;
        this.keyId2 = bwv[2].getKeyId();
        this.visibility2 = bwv[2].visibility;
      }
      if (length > 3) {
        this.binding3 = bwv[3].binding;
        this.keyId3 = bwv[3].getKeyId();
        this.visibility3 = bwv[3].visibility;
      }
      if (length > 4) {
        this.binding4 = bwv[4].binding;
        this.keyId4 = bwv[4].getKeyId();
        this.visibility4 = bwv[4].visibility;
      }
      if (length > 5) {
        this.binding5 = bwv[5].binding;
        this.keyId5 = bwv[5].getKeyId();
        this.visibility5 = bwv[5].visibility;
      }
      if (length > 6) {
        this.binding6 = bwv[6].binding;
        this.keyId6 = bwv[6].getKeyId();
        this.visibility6 = bwv[6].visibility;
      }
      if (length > 7) {
        this.binding7 = bwv[7].binding;
        this.keyId7 = bwv[7].getKeyId();
        this.visibility7 = bwv[7].visibility;
      }
      if (length > 8) {
        this.binding8 = bwv[8].binding;
        this.keyId8 = bwv[8].getKeyId();
        this.visibility8 = bwv[8].visibility;
      }
      if (length > 9) {
        this.binding9 = bwv[9].binding;
        this.keyId9 = bwv[9].getKeyId();
        this.visibility9 = bwv[9].visibility;
      }
    }
    ProtoInjectorInlineStrategy.prototype.getBindingAtIndex = function(index) {
      if (index == 0)
        return this.binding0;
      if (index == 1)
        return this.binding1;
      if (index == 2)
        return this.binding2;
      if (index == 3)
        return this.binding3;
      if (index == 4)
        return this.binding4;
      if (index == 5)
        return this.binding5;
      if (index == 6)
        return this.binding6;
      if (index == 7)
        return this.binding7;
      if (index == 8)
        return this.binding8;
      if (index == 9)
        return this.binding9;
      throw new exceptions_1.OutOfBoundsError(index);
    };
    ProtoInjectorInlineStrategy.prototype.createInjectorStrategy = function(injector) {
      return new InjectorInlineStrategy(injector, this);
    };
    return ProtoInjectorInlineStrategy;
  })();
  exports.ProtoInjectorInlineStrategy = ProtoInjectorInlineStrategy;
  var ProtoInjectorDynamicStrategy = (function() {
    function ProtoInjectorDynamicStrategy(protoInj, bwv) {
      var len = bwv.length;
      this.bindings = collection_1.ListWrapper.createFixedSize(len);
      this.keyIds = collection_1.ListWrapper.createFixedSize(len);
      this.visibilities = collection_1.ListWrapper.createFixedSize(len);
      for (var i = 0; i < len; i++) {
        this.bindings[i] = bwv[i].binding;
        this.keyIds[i] = bwv[i].getKeyId();
        this.visibilities[i] = bwv[i].visibility;
      }
    }
    ProtoInjectorDynamicStrategy.prototype.getBindingAtIndex = function(index) {
      if (index < 0 || index >= this.bindings.length) {
        throw new exceptions_1.OutOfBoundsError(index);
      }
      return this.bindings[index];
    };
    ProtoInjectorDynamicStrategy.prototype.createInjectorStrategy = function(ei) {
      return new InjectorDynamicStrategy(this, ei);
    };
    return ProtoInjectorDynamicStrategy;
  })();
  exports.ProtoInjectorDynamicStrategy = ProtoInjectorDynamicStrategy;
  var ProtoInjector = (function() {
    function ProtoInjector(bwv) {
      this.numberOfBindings = bwv.length;
      this._strategy = bwv.length > _MAX_CONSTRUCTION_COUNTER ? new ProtoInjectorDynamicStrategy(this, bwv) : new ProtoInjectorInlineStrategy(this, bwv);
    }
    ProtoInjector.prototype.getBindingAtIndex = function(index) {
      return this._strategy.getBindingAtIndex(index);
    };
    return ProtoInjector;
  })();
  exports.ProtoInjector = ProtoInjector;
  var InjectorInlineStrategy = (function() {
    function InjectorInlineStrategy(injector, protoStrategy) {
      this.injector = injector;
      this.protoStrategy = protoStrategy;
      this.obj0 = exports.UNDEFINED;
      this.obj1 = exports.UNDEFINED;
      this.obj2 = exports.UNDEFINED;
      this.obj3 = exports.UNDEFINED;
      this.obj4 = exports.UNDEFINED;
      this.obj5 = exports.UNDEFINED;
      this.obj6 = exports.UNDEFINED;
      this.obj7 = exports.UNDEFINED;
      this.obj8 = exports.UNDEFINED;
      this.obj9 = exports.UNDEFINED;
    }
    InjectorInlineStrategy.prototype.resetConstructionCounter = function() {
      this.injector._constructionCounter = 0;
    };
    InjectorInlineStrategy.prototype.instantiateBinding = function(binding, visibility) {
      return this.injector._new(binding, visibility);
    };
    InjectorInlineStrategy.prototype.attach = function(parent, isHost) {
      var inj = this.injector;
      inj._parent = parent;
      inj._isHost = isHost;
    };
    InjectorInlineStrategy.prototype.getObjByKeyId = function(keyId, visibility) {
      var p = this.protoStrategy;
      var inj = this.injector;
      if (p.keyId0 === keyId && canSee(p.visibility0, visibility)) {
        if (this.obj0 === exports.UNDEFINED) {
          this.obj0 = inj._new(p.binding0, p.visibility0);
        }
        return this.obj0;
      }
      if (p.keyId1 === keyId && canSee(p.visibility1, visibility)) {
        if (this.obj1 === exports.UNDEFINED) {
          this.obj1 = inj._new(p.binding1, p.visibility1);
        }
        return this.obj1;
      }
      if (p.keyId2 === keyId && canSee(p.visibility2, visibility)) {
        if (this.obj2 === exports.UNDEFINED) {
          this.obj2 = inj._new(p.binding2, p.visibility2);
        }
        return this.obj2;
      }
      if (p.keyId3 === keyId && canSee(p.visibility3, visibility)) {
        if (this.obj3 === exports.UNDEFINED) {
          this.obj3 = inj._new(p.binding3, p.visibility3);
        }
        return this.obj3;
      }
      if (p.keyId4 === keyId && canSee(p.visibility4, visibility)) {
        if (this.obj4 === exports.UNDEFINED) {
          this.obj4 = inj._new(p.binding4, p.visibility4);
        }
        return this.obj4;
      }
      if (p.keyId5 === keyId && canSee(p.visibility5, visibility)) {
        if (this.obj5 === exports.UNDEFINED) {
          this.obj5 = inj._new(p.binding5, p.visibility5);
        }
        return this.obj5;
      }
      if (p.keyId6 === keyId && canSee(p.visibility6, visibility)) {
        if (this.obj6 === exports.UNDEFINED) {
          this.obj6 = inj._new(p.binding6, p.visibility6);
        }
        return this.obj6;
      }
      if (p.keyId7 === keyId && canSee(p.visibility7, visibility)) {
        if (this.obj7 === exports.UNDEFINED) {
          this.obj7 = inj._new(p.binding7, p.visibility7);
        }
        return this.obj7;
      }
      if (p.keyId8 === keyId && canSee(p.visibility8, visibility)) {
        if (this.obj8 === exports.UNDEFINED) {
          this.obj8 = inj._new(p.binding8, p.visibility8);
        }
        return this.obj8;
      }
      if (p.keyId9 === keyId && canSee(p.visibility9, visibility)) {
        if (this.obj9 === exports.UNDEFINED) {
          this.obj9 = inj._new(p.binding9, p.visibility9);
        }
        return this.obj9;
      }
      return exports.UNDEFINED;
    };
    InjectorInlineStrategy.prototype.getObjAtIndex = function(index) {
      if (index == 0)
        return this.obj0;
      if (index == 1)
        return this.obj1;
      if (index == 2)
        return this.obj2;
      if (index == 3)
        return this.obj3;
      if (index == 4)
        return this.obj4;
      if (index == 5)
        return this.obj5;
      if (index == 6)
        return this.obj6;
      if (index == 7)
        return this.obj7;
      if (index == 8)
        return this.obj8;
      if (index == 9)
        return this.obj9;
      throw new exceptions_1.OutOfBoundsError(index);
    };
    InjectorInlineStrategy.prototype.getMaxNumberOfObjects = function() {
      return _MAX_CONSTRUCTION_COUNTER;
    };
    return InjectorInlineStrategy;
  })();
  exports.InjectorInlineStrategy = InjectorInlineStrategy;
  var InjectorDynamicStrategy = (function() {
    function InjectorDynamicStrategy(protoStrategy, injector) {
      this.protoStrategy = protoStrategy;
      this.injector = injector;
      this.objs = collection_1.ListWrapper.createFixedSize(protoStrategy.bindings.length);
      collection_1.ListWrapper.fill(this.objs, exports.UNDEFINED);
    }
    InjectorDynamicStrategy.prototype.resetConstructionCounter = function() {
      this.injector._constructionCounter = 0;
    };
    InjectorDynamicStrategy.prototype.instantiateBinding = function(binding, visibility) {
      return this.injector._new(binding, visibility);
    };
    InjectorDynamicStrategy.prototype.attach = function(parent, isHost) {
      var inj = this.injector;
      inj._parent = parent;
      inj._isHost = isHost;
    };
    InjectorDynamicStrategy.prototype.getObjByKeyId = function(keyId, visibility) {
      var p = this.protoStrategy;
      for (var i = 0; i < p.keyIds.length; i++) {
        if (p.keyIds[i] === keyId && canSee(p.visibilities[i], visibility)) {
          if (this.objs[i] === exports.UNDEFINED) {
            this.objs[i] = this.injector._new(p.bindings[i], p.visibilities[i]);
          }
          return this.objs[i];
        }
      }
      return exports.UNDEFINED;
    };
    InjectorDynamicStrategy.prototype.getObjAtIndex = function(index) {
      if (index < 0 || index >= this.objs.length) {
        throw new exceptions_1.OutOfBoundsError(index);
      }
      return this.objs[index];
    };
    InjectorDynamicStrategy.prototype.getMaxNumberOfObjects = function() {
      return this.objs.length;
    };
    return InjectorDynamicStrategy;
  })();
  exports.InjectorDynamicStrategy = InjectorDynamicStrategy;
  var BindingWithVisibility = (function() {
    function BindingWithVisibility(binding, visibility) {
      this.binding = binding;
      this.visibility = visibility;
    }
    ;
    BindingWithVisibility.prototype.getKeyId = function() {
      return this.binding.key.id;
    };
    return BindingWithVisibility;
  })();
  exports.BindingWithVisibility = BindingWithVisibility;
  var Injector = (function() {
    function Injector(_proto, _parent, _depProvider, _debugContext) {
      if (_parent === void 0) {
        _parent = null;
      }
      if (_depProvider === void 0) {
        _depProvider = null;
      }
      if (_debugContext === void 0) {
        _debugContext = null;
      }
      this._proto = _proto;
      this._parent = _parent;
      this._depProvider = _depProvider;
      this._debugContext = _debugContext;
      this._isHost = false;
      this._constructionCounter = 0;
      this._strategy = _proto._strategy.createInjectorStrategy(this);
    }
    Injector.resolve = function(bindings) {
      var resolvedBindings = _resolveBindings(bindings);
      var flatten = _flattenBindings(resolvedBindings, new collection_1.Map());
      return _createListOfBindings(flatten);
    };
    Injector.resolveAndCreate = function(bindings, depProvider) {
      if (depProvider === void 0) {
        depProvider = null;
      }
      var resolvedBindings = Injector.resolve(bindings);
      return Injector.fromResolvedBindings(resolvedBindings, depProvider);
    };
    Injector.fromResolvedBindings = function(bindings, depProvider) {
      if (depProvider === void 0) {
        depProvider = null;
      }
      var bd = bindings.map(function(b) {
        return new BindingWithVisibility(b, Visibility.Public);
      });
      var proto = new ProtoInjector(bd);
      var inj = new Injector(proto, null, depProvider);
      return inj;
    };
    Injector.prototype.debugContext = function() {
      return this._debugContext();
    };
    Injector.prototype.get = function(token) {
      return this._getByKey(key_1.Key.get(token), null, null, false, Visibility.PublicAndPrivate);
    };
    Injector.prototype.getOptional = function(token) {
      return this._getByKey(key_1.Key.get(token), null, null, true, Visibility.PublicAndPrivate);
    };
    Injector.prototype.getAt = function(index) {
      return this._strategy.getObjAtIndex(index);
    };
    Object.defineProperty(Injector.prototype, "parent", {
      get: function() {
        return this._parent;
      },
      enumerable: true,
      configurable: true
    });
    Object.defineProperty(Injector.prototype, "internalStrategy", {
      get: function() {
        return this._strategy;
      },
      enumerable: true,
      configurable: true
    });
    Injector.prototype.resolveAndCreateChild = function(bindings, depProvider) {
      if (depProvider === void 0) {
        depProvider = null;
      }
      var resovledBindings = Injector.resolve(bindings);
      return this.createChildFromResolved(resovledBindings, depProvider);
    };
    Injector.prototype.createChildFromResolved = function(bindings, depProvider) {
      if (depProvider === void 0) {
        depProvider = null;
      }
      var bd = bindings.map(function(b) {
        return new BindingWithVisibility(b, Visibility.Public);
      });
      var proto = new ProtoInjector(bd);
      var inj = new Injector(proto, null, depProvider);
      inj._parent = this;
      return inj;
    };
    Injector.prototype.resolveAndInstantiate = function(binding) {
      return this.instantiateResolved(Injector.resolve([binding])[0]);
    };
    Injector.prototype.instantiateResolved = function(binding) {
      return this._instantiate(binding, Visibility.PublicAndPrivate);
    };
    Injector.prototype._new = function(binding, visibility) {
      if (this._constructionCounter++ > this._strategy.getMaxNumberOfObjects()) {
        throw new exceptions_1.CyclicDependencyError(this, binding.key);
      }
      return this._instantiate(binding, visibility);
    };
    Injector.prototype._instantiate = function(binding, visibility) {
      var factory = binding.factory;
      var deps = binding.dependencies;
      var length = deps.length;
      var d0,
          d1,
          d2,
          d3,
          d4,
          d5,
          d6,
          d7,
          d8,
          d9,
          d10,
          d11,
          d12,
          d13,
          d14,
          d15,
          d16,
          d17,
          d18,
          d19;
      try {
        d0 = length > 0 ? this._getByDependency(binding, deps[0], visibility) : null;
        d1 = length > 1 ? this._getByDependency(binding, deps[1], visibility) : null;
        d2 = length > 2 ? this._getByDependency(binding, deps[2], visibility) : null;
        d3 = length > 3 ? this._getByDependency(binding, deps[3], visibility) : null;
        d4 = length > 4 ? this._getByDependency(binding, deps[4], visibility) : null;
        d5 = length > 5 ? this._getByDependency(binding, deps[5], visibility) : null;
        d6 = length > 6 ? this._getByDependency(binding, deps[6], visibility) : null;
        d7 = length > 7 ? this._getByDependency(binding, deps[7], visibility) : null;
        d8 = length > 8 ? this._getByDependency(binding, deps[8], visibility) : null;
        d9 = length > 9 ? this._getByDependency(binding, deps[9], visibility) : null;
        d10 = length > 10 ? this._getByDependency(binding, deps[10], visibility) : null;
        d11 = length > 11 ? this._getByDependency(binding, deps[11], visibility) : null;
        d12 = length > 12 ? this._getByDependency(binding, deps[12], visibility) : null;
        d13 = length > 13 ? this._getByDependency(binding, deps[13], visibility) : null;
        d14 = length > 14 ? this._getByDependency(binding, deps[14], visibility) : null;
        d15 = length > 15 ? this._getByDependency(binding, deps[15], visibility) : null;
        d16 = length > 16 ? this._getByDependency(binding, deps[16], visibility) : null;
        d17 = length > 17 ? this._getByDependency(binding, deps[17], visibility) : null;
        d18 = length > 18 ? this._getByDependency(binding, deps[18], visibility) : null;
        d19 = length > 19 ? this._getByDependency(binding, deps[19], visibility) : null;
      } catch (e) {
        if (e instanceof exceptions_1.AbstractBindingError) {
          e.addKey(this, binding.key);
        }
        throw e;
      }
      var obj;
      try {
        switch (length) {
          case 0:
            obj = factory();
            break;
          case 1:
            obj = factory(d0);
            break;
          case 2:
            obj = factory(d0, d1);
            break;
          case 3:
            obj = factory(d0, d1, d2);
            break;
          case 4:
            obj = factory(d0, d1, d2, d3);
            break;
          case 5:
            obj = factory(d0, d1, d2, d3, d4);
            break;
          case 6:
            obj = factory(d0, d1, d2, d3, d4, d5);
            break;
          case 7:
            obj = factory(d0, d1, d2, d3, d4, d5, d6);
            break;
          case 8:
            obj = factory(d0, d1, d2, d3, d4, d5, d6, d7);
            break;
          case 9:
            obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8);
            break;
          case 10:
            obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9);
            break;
          case 11:
            obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10);
            break;
          case 12:
            obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11);
            break;
          case 13:
            obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12);
            break;
          case 14:
            obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12, d13);
            break;
          case 15:
            obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12, d13, d14);
            break;
          case 16:
            obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12, d13, d14, d15);
            break;
          case 17:
            obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12, d13, d14, d15, d16);
            break;
          case 18:
            obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12, d13, d14, d15, d16, d17);
            break;
          case 19:
            obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12, d13, d14, d15, d16, d17, d18);
            break;
          case 20:
            obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12, d13, d14, d15, d16, d17, d18, d19);
            break;
        }
      } catch (e) {
        throw new exceptions_1.InstantiationError(this, e, e.stack, binding.key);
      }
      return obj;
    };
    Injector.prototype._getByDependency = function(binding, dep, bindingVisibility) {
      var special = lang_1.isPresent(this._depProvider) ? this._depProvider.getDependency(this, binding, dep) : exports.UNDEFINED;
      if (special !== exports.UNDEFINED) {
        return special;
      } else {
        return this._getByKey(dep.key, dep.lowerBoundVisibility, dep.upperBoundVisibility, dep.optional, bindingVisibility);
      }
    };
    Injector.prototype._getByKey = function(key, lowerBoundVisibility, upperBoundVisibility, optional, bindingVisibility) {
      if (key === INJECTOR_KEY) {
        return this;
      }
      if (upperBoundVisibility instanceof metadata_1.SelfMetadata) {
        return this._getByKeySelf(key, optional, bindingVisibility);
      } else if (upperBoundVisibility instanceof metadata_1.HostMetadata) {
        return this._getByKeyHost(key, optional, bindingVisibility, lowerBoundVisibility);
      } else {
        return this._getByKeyDefault(key, optional, bindingVisibility, lowerBoundVisibility);
      }
    };
    Injector.prototype._throwOrNull = function(key, optional) {
      if (optional) {
        return null;
      } else {
        throw new exceptions_1.NoBindingError(this, key);
      }
    };
    Injector.prototype._getByKeySelf = function(key, optional, bindingVisibility) {
      var obj = this._strategy.getObjByKeyId(key.id, bindingVisibility);
      return (obj !== exports.UNDEFINED) ? obj : this._throwOrNull(key, optional);
    };
    Injector.prototype._getByKeyHost = function(key, optional, bindingVisibility, lowerBoundVisibility) {
      var inj = this;
      if (lowerBoundVisibility instanceof metadata_1.SkipSelfMetadata) {
        if (inj._isHost) {
          return this._getPrivateDependency(key, optional, inj);
        } else {
          inj = inj._parent;
        }
      }
      while (inj != null) {
        var obj = inj._strategy.getObjByKeyId(key.id, bindingVisibility);
        if (obj !== exports.UNDEFINED)
          return obj;
        if (lang_1.isPresent(inj._parent) && inj._isHost) {
          return this._getPrivateDependency(key, optional, inj);
        } else {
          inj = inj._parent;
        }
      }
      return this._throwOrNull(key, optional);
    };
    Injector.prototype._getPrivateDependency = function(key, optional, inj) {
      var obj = inj._parent._strategy.getObjByKeyId(key.id, Visibility.Private);
      return (obj !== exports.UNDEFINED) ? obj : this._throwOrNull(key, optional);
    };
    Injector.prototype._getByKeyDefault = function(key, optional, bindingVisibility, lowerBoundVisibility) {
      var inj = this;
      if (lowerBoundVisibility instanceof metadata_1.SkipSelfMetadata) {
        bindingVisibility = inj._isHost ? Visibility.PublicAndPrivate : Visibility.Public;
        inj = inj._parent;
      }
      while (inj != null) {
        var obj = inj._strategy.getObjByKeyId(key.id, bindingVisibility);
        if (obj !== exports.UNDEFINED)
          return obj;
        bindingVisibility = inj._isHost ? Visibility.PublicAndPrivate : Visibility.Public;
        inj = inj._parent;
      }
      return this._throwOrNull(key, optional);
    };
    Object.defineProperty(Injector.prototype, "displayName", {
      get: function() {
        return "Injector(bindings: [" + _mapBindings(this, function(b) {
          return (" \"" + b.key.displayName + "\" ");
        }).join(", ") + "])";
      },
      enumerable: true,
      configurable: true
    });
    Injector.prototype.toString = function() {
      return this.displayName;
    };
    return Injector;
  })();
  exports.Injector = Injector;
  var INJECTOR_KEY = key_1.Key.get(Injector);
  function _resolveBindings(bindings) {
    var resolvedList = collection_1.ListWrapper.createFixedSize(bindings.length);
    for (var i = 0; i < bindings.length; i++) {
      var unresolved = forward_ref_1.resolveForwardRef(bindings[i]);
      var resolved;
      if (unresolved instanceof binding_1.ResolvedBinding) {
        resolved = unresolved;
      } else if (unresolved instanceof lang_1.Type) {
        resolved = binding_1.bind(unresolved).toClass(unresolved).resolve();
      } else if (unresolved instanceof binding_1.Binding) {
        resolved = unresolved.resolve();
      } else if (unresolved instanceof collection_1.List) {
        resolved = _resolveBindings(unresolved);
      } else if (unresolved instanceof binding_1.BindingBuilder) {
        throw new exceptions_1.InvalidBindingError(unresolved.token);
      } else {
        throw new exceptions_1.InvalidBindingError(unresolved);
      }
      resolvedList[i] = resolved;
    }
    return resolvedList;
  }
  function _createListOfBindings(flattenedBindings) {
    return collection_1.MapWrapper.values(flattenedBindings);
  }
  function _flattenBindings(bindings, res) {
    collection_1.ListWrapper.forEach(bindings, function(b) {
      if (b instanceof binding_1.ResolvedBinding) {
        res.set(b.key.id, b);
      } else if (b instanceof collection_1.List) {
        _flattenBindings(b, res);
      }
    });
    return res;
  }
  function _mapBindings(injector, fn) {
    var res = [];
    for (var i = 0; i < injector._proto.numberOfBindings; ++i) {
      res.push(fn(injector._proto.getBindingAtIndex(i)));
    }
    return res;
  }
})(require("process"));

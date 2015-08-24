/* */ 
(function(process) {
  'use strict';
  var __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
      return Reflect.decorate(decorators, target, key, desc);
    switch (arguments.length) {
      case 2:
        return decorators.reduceRight(function(o, d) {
          return (d && d(o)) || o;
        }, target);
      case 3:
        return decorators.reduceRight(function(o, d) {
          return (d && d(target, key)), void 0;
        }, void 0);
      case 4:
        return decorators.reduceRight(function(o, d) {
          return (d && d(target, key, o)) || o;
        }, desc);
    }
  };
  var __metadata = (this && this.__metadata) || function(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
      return Reflect.metadata(k, v);
  };
  var di_1 = require("../../../di");
  var lang_1 = require("../../facade/lang");
  var profile_1 = require("../../profile/profile");
  var LifeCycle = (function() {
    function LifeCycle(changeDetector, enforceNoNewChanges) {
      if (changeDetector === void 0) {
        changeDetector = null;
      }
      if (enforceNoNewChanges === void 0) {
        enforceNoNewChanges = false;
      }
      this._runningTick = false;
      this._changeDetector = changeDetector;
      this._enforceNoNewChanges = enforceNoNewChanges;
    }
    LifeCycle.prototype.registerWith = function(zone, changeDetector) {
      var _this = this;
      if (changeDetector === void 0) {
        changeDetector = null;
      }
      if (lang_1.isPresent(changeDetector)) {
        this._changeDetector = changeDetector;
      }
      zone.overrideOnTurnDone(function() {
        return _this.tick();
      });
    };
    LifeCycle.prototype.tick = function() {
      if (this._runningTick) {
        throw new lang_1.BaseException("LifeCycle.tick is called recursively");
      }
      var s = LifeCycle._scope_tick();
      try {
        this._runningTick = true;
        this._changeDetector.detectChanges();
        if (this._enforceNoNewChanges) {
          this._changeDetector.checkNoChanges();
        }
      } finally {
        this._runningTick = false;
        profile_1.wtfLeave(s);
      }
    };
    LifeCycle._scope_tick = profile_1.wtfCreateScope('LifeCycle#tick()');
    LifeCycle = __decorate([di_1.Injectable(), __metadata('design:paramtypes', [Object, Boolean])], LifeCycle);
    return LifeCycle;
  })();
  exports.LifeCycle = LifeCycle;
})(require("process"));

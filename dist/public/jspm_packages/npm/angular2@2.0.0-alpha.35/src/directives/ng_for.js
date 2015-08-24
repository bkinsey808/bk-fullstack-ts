/* */ 
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
var metadata_1 = require("../../metadata");
var core_1 = require("../../core");
var change_detection_1 = require("../../change_detection");
var lang_1 = require("../facade/lang");
var NgFor = (function() {
  function NgFor(viewContainer, templateRef, iterableDiffers, cdr) {
    this.viewContainer = viewContainer;
    this.templateRef = templateRef;
    this.iterableDiffers = iterableDiffers;
    this.cdr = cdr;
  }
  Object.defineProperty(NgFor.prototype, "ngForOf", {
    set: function(value) {
      this._ngForOf = value;
      if (lang_1.isBlank(this._differ) && lang_1.isPresent(value)) {
        this._differ = this.iterableDiffers.find(value).create(this.cdr);
      }
    },
    enumerable: true,
    configurable: true
  });
  NgFor.prototype.onCheck = function() {
    if (lang_1.isPresent(this._differ)) {
      var changes = this._differ.diff(this._ngForOf);
      if (lang_1.isPresent(changes))
        this._applyChanges(changes);
    }
  };
  NgFor.prototype._applyChanges = function(changes) {
    var recordViewTuples = [];
    changes.forEachRemovedItem(function(removedRecord) {
      return recordViewTuples.push(new RecordViewTuple(removedRecord, null));
    });
    changes.forEachMovedItem(function(movedRecord) {
      return recordViewTuples.push(new RecordViewTuple(movedRecord, null));
    });
    var insertTuples = NgFor.bulkRemove(recordViewTuples, this.viewContainer);
    changes.forEachAddedItem(function(addedRecord) {
      return insertTuples.push(new RecordViewTuple(addedRecord, null));
    });
    NgFor.bulkInsert(insertTuples, this.viewContainer, this.templateRef);
    for (var i = 0; i < insertTuples.length; i++) {
      this._perViewChange(insertTuples[i].view, insertTuples[i].record);
    }
  };
  NgFor.prototype._perViewChange = function(view, record) {
    view.setLocal('\$implicit', record.item);
    view.setLocal('index', record.currentIndex);
  };
  NgFor.bulkRemove = function(tuples, viewContainer) {
    tuples.sort(function(a, b) {
      return a.record.previousIndex - b.record.previousIndex;
    });
    var movedTuples = [];
    for (var i = tuples.length - 1; i >= 0; i--) {
      var tuple = tuples[i];
      if (lang_1.isPresent(tuple.record.currentIndex)) {
        tuple.view = viewContainer.detach(tuple.record.previousIndex);
        movedTuples.push(tuple);
      } else {
        viewContainer.remove(tuple.record.previousIndex);
      }
    }
    return movedTuples;
  };
  NgFor.bulkInsert = function(tuples, viewContainer, templateRef) {
    tuples.sort(function(a, b) {
      return a.record.currentIndex - b.record.currentIndex;
    });
    for (var i = 0; i < tuples.length; i++) {
      var tuple = tuples[i];
      if (lang_1.isPresent(tuple.view)) {
        viewContainer.insert(tuple.view, tuple.record.currentIndex);
      } else {
        tuple.view = viewContainer.createEmbeddedView(templateRef, tuple.record.currentIndex);
      }
    }
    return tuples;
  };
  NgFor = __decorate([metadata_1.Directive({
    selector: '[ng-for][ng-for-of]',
    properties: ['ngForOf'],
    lifecycle: [metadata_1.LifecycleEvent.onCheck]
  }), __metadata('design:paramtypes', [core_1.ViewContainerRef, core_1.TemplateRef, change_detection_1.IterableDiffers, change_detection_1.ChangeDetectorRef])], NgFor);
  return NgFor;
})();
exports.NgFor = NgFor;
var RecordViewTuple = (function() {
  function RecordViewTuple(record, view) {
    this.record = record;
    this.view = view;
  }
  return RecordViewTuple;
})();
exports.RecordViewTuple = RecordViewTuple;

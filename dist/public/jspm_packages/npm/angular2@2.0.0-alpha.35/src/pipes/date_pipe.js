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
var lang_1 = require("../facade/lang");
var intl_1 = require("../facade/intl");
var di_1 = require("../../di");
var collection_1 = require("../facade/collection");
var invalid_pipe_argument_exception_1 = require("./invalid_pipe_argument_exception");
var metadata_1 = require("../core/metadata");
var defaultLocale = 'en-US';
var DatePipe = (function() {
  function DatePipe() {}
  DatePipe.prototype.transform = function(value, args) {
    if (lang_1.isBlank(value))
      return null;
    if (!this.supports(value)) {
      throw new invalid_pipe_argument_exception_1.InvalidPipeArgumentException(DatePipe, value);
    }
    var pattern = lang_1.isPresent(args) && args.length > 0 ? args[0] : 'mediumDate';
    if (lang_1.isNumber(value)) {
      value = lang_1.DateWrapper.fromMillis(value);
    }
    if (collection_1.StringMapWrapper.contains(DatePipe._ALIASES, pattern)) {
      pattern = collection_1.StringMapWrapper.get(DatePipe._ALIASES, pattern);
    }
    return intl_1.DateFormatter.format(value, defaultLocale, pattern);
  };
  DatePipe.prototype.supports = function(obj) {
    return lang_1.isDate(obj) || lang_1.isNumber(obj);
  };
  DatePipe._ALIASES = {
    'medium': 'yMMMdjms',
    'short': 'yMdjm',
    'fullDate': 'yMMMMEEEEd',
    'longDate': 'yMMMMd',
    'mediumDate': 'yMMMd',
    'shortDate': 'yMd',
    'mediumTime': 'jms',
    'shortTime': 'jm'
  };
  DatePipe = __decorate([lang_1.CONST(), metadata_1.Pipe({name: 'date'}), di_1.Injectable(), __metadata('design:paramtypes', [])], DatePipe);
  return DatePipe;
})();
exports.DatePipe = DatePipe;

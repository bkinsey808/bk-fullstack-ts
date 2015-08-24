/* */ 
'use strict';
var async_pipe_1 = require("./async_pipe");
var uppercase_pipe_1 = require("./uppercase_pipe");
var lowercase_pipe_1 = require("./lowercase_pipe");
var json_pipe_1 = require("./json_pipe");
var limit_to_pipe_1 = require("./limit_to_pipe");
var date_pipe_1 = require("./date_pipe");
var number_pipe_1 = require("./number_pipe");
var lang_1 = require("../facade/lang");
var di_1 = require("../../di");
var DEFAULT_PIPES_LIST = lang_1.CONST_EXPR([async_pipe_1.AsyncPipe, uppercase_pipe_1.UpperCasePipe, lowercase_pipe_1.LowerCasePipe, json_pipe_1.JsonPipe, limit_to_pipe_1.LimitToPipe, number_pipe_1.DecimalPipe, number_pipe_1.PercentPipe, number_pipe_1.CurrencyPipe, date_pipe_1.DatePipe]);
exports.DEFAULT_PIPES_TOKEN = lang_1.CONST_EXPR(new di_1.OpaqueToken("Default Pipes"));
exports.DEFAULT_PIPES = lang_1.CONST_EXPR(new di_1.Binding(exports.DEFAULT_PIPES_TOKEN, {toValue: DEFAULT_PIPES_LIST}));

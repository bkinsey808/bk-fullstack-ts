/* */ 
'use strict';
var decorators_1 = require("../util/decorators");
var lifecycle_annotations_impl_1 = require("./lifecycle_annotations_impl");
var lifecycle_annotations_impl_2 = require("./lifecycle_annotations_impl");
exports.canReuse = lifecycle_annotations_impl_2.canReuse;
exports.canDeactivate = lifecycle_annotations_impl_2.canDeactivate;
exports.onActivate = lifecycle_annotations_impl_2.onActivate;
exports.onReuse = lifecycle_annotations_impl_2.onReuse;
exports.onDeactivate = lifecycle_annotations_impl_2.onDeactivate;
exports.CanActivate = decorators_1.makeDecorator(lifecycle_annotations_impl_1.CanActivate);

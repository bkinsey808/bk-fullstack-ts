/* */ 
'use strict';
var collection_1 = require("../../facade/collection");
var lang_1 = require("../../facade/lang");
var api_1 = require("../api");
function directiveMetadataToMap(meta) {
  return collection_1.MapWrapper.createFromPairs([['id', meta.id], ['selector', meta.selector], ['compileChildren', meta.compileChildren], ['hostProperties', _cloneIfPresent(meta.hostProperties)], ['hostListeners', _cloneIfPresent(meta.hostListeners)], ['hostActions', _cloneIfPresent(meta.hostActions)], ['hostAttributes', _cloneIfPresent(meta.hostAttributes)], ['properties', _cloneIfPresent(meta.properties)], ['readAttributes', _cloneIfPresent(meta.readAttributes)], ['type', meta.type], ['exportAs', meta.exportAs], ['callOnDestroy', meta.callOnDestroy], ['callOnCheck', meta.callOnCheck], ['callOnInit', meta.callOnInit], ['callOnChange', meta.callOnChange], ['callOnAllChangesDone', meta.callOnAllChangesDone], ['events', meta.events], ['changeDetection', meta.changeDetection], ['version', 1]]);
}
exports.directiveMetadataToMap = directiveMetadataToMap;
function directiveMetadataFromMap(map) {
  return new api_1.RenderDirectiveMetadata({
    id: map.get('id'),
    selector: map.get('selector'),
    compileChildren: map.get('compileChildren'),
    hostProperties: _cloneIfPresent(map.get('hostProperties')),
    hostListeners: _cloneIfPresent(map.get('hostListeners')),
    hostActions: _cloneIfPresent(map.get('hostActions')),
    hostAttributes: _cloneIfPresent(map.get('hostAttributes')),
    properties: _cloneIfPresent(map.get('properties')),
    readAttributes: _cloneIfPresent(map.get('readAttributes')),
    type: map.get('type'),
    exportAs: map.get('exportAs'),
    callOnDestroy: map.get('callOnDestroy'),
    callOnCheck: map.get('callOnCheck'),
    callOnChange: map.get('callOnChange'),
    callOnInit: map.get('callOnInit'),
    callOnAllChangesDone: map.get('callOnAllChangesDone'),
    events: _cloneIfPresent(map.get('events')),
    changeDetection: map.get('changeDetection')
  });
}
exports.directiveMetadataFromMap = directiveMetadataFromMap;
function _cloneIfPresent(o) {
  if (!lang_1.isPresent(o))
    return null;
  return lang_1.isArray(o) ? collection_1.ListWrapper.clone(o) : collection_1.MapWrapper.clone(o);
}

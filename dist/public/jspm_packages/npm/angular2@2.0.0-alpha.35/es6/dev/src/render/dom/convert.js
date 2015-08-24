/* */ 
"format cjs";
import { ListWrapper, MapWrapper } from 'angular2/src/facade/collection';
import { isPresent, isArray } from 'angular2/src/facade/lang';
import { RenderDirectiveMetadata } from 'angular2/src/render/api';
/**
 * Converts a [DirectiveMetadata] to a map representation. This creates a copy,
 * that is, subsequent changes to `meta` will not be mirrored in the map.
 */
export function directiveMetadataToMap(meta) {
    return MapWrapper.createFromPairs([
        ['id', meta.id],
        ['selector', meta.selector],
        ['compileChildren', meta.compileChildren],
        ['hostProperties', _cloneIfPresent(meta.hostProperties)],
        ['hostListeners', _cloneIfPresent(meta.hostListeners)],
        ['hostActions', _cloneIfPresent(meta.hostActions)],
        ['hostAttributes', _cloneIfPresent(meta.hostAttributes)],
        ['properties', _cloneIfPresent(meta.properties)],
        ['readAttributes', _cloneIfPresent(meta.readAttributes)],
        ['type', meta.type],
        ['exportAs', meta.exportAs],
        ['callOnDestroy', meta.callOnDestroy],
        ['callOnCheck', meta.callOnCheck],
        ['callOnInit', meta.callOnInit],
        ['callOnChange', meta.callOnChange],
        ['callOnAllChangesDone', meta.callOnAllChangesDone],
        ['events', meta.events],
        ['changeDetection', meta.changeDetection],
        ['version', 1],
    ]);
}
/**
 * Converts a map representation of [DirectiveMetadata] into a
 * [DirectiveMetadata] object. This creates a copy, that is, subsequent changes
 * to `map` will not be mirrored in the [DirectiveMetadata] object.
 */
export function directiveMetadataFromMap(map) {
    return new RenderDirectiveMetadata({
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
        changeDetection: map.get('changeDetection'),
    });
}
/**
 * Clones the [List] or [Map] `o` if it is present.
 */
function _cloneIfPresent(o) {
    if (!isPresent(o))
        return null;
    return isArray(o) ? ListWrapper.clone(o) : MapWrapper.clone(o);
}
//# sourceMappingURL=convert.js.map
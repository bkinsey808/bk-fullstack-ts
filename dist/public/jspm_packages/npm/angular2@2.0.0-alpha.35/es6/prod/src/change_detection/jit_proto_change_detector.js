/* */ 
"format cjs";
import { ChangeDetectorJITGenerator } from './change_detection_jit_generator';
import { createPropertyRecords, createEventRecords } from './proto_change_detector';
export class JitProtoChangeDetector {
    constructor(definition) {
        this.definition = definition;
        this._factory = this._createFactory(definition);
    }
    static isSupported() { return true; }
    instantiate(dispatcher) { return this._factory(dispatcher); }
    _createFactory(definition) {
        var propertyBindingRecords = createPropertyRecords(definition);
        var eventBindingRecords = createEventRecords(definition);
        return new ChangeDetectorJITGenerator(definition.id, definition.strategy, propertyBindingRecords, eventBindingRecords, this.definition.directiveRecords, this.definition.generateCheckNoChanges)
            .generate();
    }
}
//# sourceMappingURL=jit_proto_change_detector.js.map
/* */ 
"format cjs";
import { ChangeDetectorRef, DynamicChangeDetector } from 'angular2/src/change_detection/change_detection';
import { SpyObject } from './test_lib';
export class SpyChangeDetector extends SpyObject {
    constructor() {
        super(DynamicChangeDetector);
    }
}
export class SpyProtoChangeDetector extends SpyObject {
    constructor() {
        super(DynamicChangeDetector);
    }
}
export class SpyDependencyProvider extends SpyObject {
}
export class SpyIterableDifferFactory extends SpyObject {
}
export class SpyInjector extends SpyObject {
}
export class SpyChangeDetectorRef extends SpyObject {
    constructor() {
        super(ChangeDetectorRef);
    }
}
//# sourceMappingURL=spies.js.map
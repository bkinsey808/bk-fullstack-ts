/* */ 
"format cjs";
import { normalizeBool } from 'angular2/src/facade/lang';
import { isDefaultChangeDetectionStrategy } from './constants';
export class DirectiveIndex {
    constructor(elementIndex, directiveIndex) {
        this.elementIndex = elementIndex;
        this.directiveIndex = directiveIndex;
    }
    get name() { return `${this.elementIndex}_${this.directiveIndex}`; }
}
export class DirectiveRecord {
    constructor({ directiveIndex, callOnAllChangesDone, callOnChange, callOnCheck, callOnInit, changeDetection } = {}) {
        this.directiveIndex = directiveIndex;
        this.callOnAllChangesDone = normalizeBool(callOnAllChangesDone);
        this.callOnChange = normalizeBool(callOnChange);
        this.callOnCheck = normalizeBool(callOnCheck);
        this.callOnInit = normalizeBool(callOnInit);
        this.changeDetection = changeDetection;
    }
    isDefaultChangeDetection() {
        return isDefaultChangeDetectionStrategy(this.changeDetection);
    }
}
//# sourceMappingURL=directive_record.js.map
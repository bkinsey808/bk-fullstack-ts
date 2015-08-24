/* */ 
"format cjs";
import { AbstractControlDirective } from './abstract_control_directive';
/**
 * An abstract class that all control directive extend.
 *
 * It binds a {@link Control} object to a DOM element.
 */
export class NgControl extends AbstractControlDirective {
    constructor(...args) {
        super(...args);
        this.name = null;
        this.valueAccessor = null;
    }
    get validator() { return null; }
    get path() { return null; }
    viewToModelUpdate(newValue) { }
}
//# sourceMappingURL=ng_control.js.map
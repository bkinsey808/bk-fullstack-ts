/* */ 
"format cjs";
import { RenderFragmentRef } from '../../api';
export function resolveInternalDomFragment(fragmentRef) {
    return fragmentRef._nodes;
}
export class DomFragmentRef extends RenderFragmentRef {
    constructor(_nodes) {
        super();
        this._nodes = _nodes;
    }
}
//# sourceMappingURL=fragment.js.map
/* */ 
"format cjs";
import { ResolvedBinding, Binding } from 'angular2/di';
export class PipeBinding extends ResolvedBinding {
    constructor(name, key, factory, dependencies) {
        super(key, factory, dependencies);
        this.name = name;
    }
    static createFromType(type, metadata) {
        var binding = new Binding(type, { toClass: type });
        var rb = binding.resolve();
        return new PipeBinding(metadata.name, rb.key, rb.factory, rb.dependencies);
    }
}
//# sourceMappingURL=pipe_binding.js.map
/* */ 
"format cjs";
import { isBlank, BaseException } from 'angular2/src/facade/lang';
export class ProtoPipes {
    constructor(bindings) {
        /**
         * Map of {@link PipeMetadata} names to {@link PipeMetadata} implementations.
         */
        this.config = {};
        bindings.forEach(b => this.config[b.name] = b);
    }
    get(name) {
        var binding = this.config[name];
        if (isBlank(binding))
            throw new BaseException(`Cannot find pipe '${name}'.`);
        return binding;
    }
}
export class Pipes {
    constructor(proto, injector) {
        this.proto = proto;
        this.injector = injector;
    }
    get(name) {
        var b = this.proto.get(name);
        return this.injector.instantiateResolved(b);
    }
}
//# sourceMappingURL=pipes.js.map
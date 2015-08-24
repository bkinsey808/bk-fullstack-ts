/* */ 
"format cjs";
export class AbstractControlDirective {
    get control() { return null; }
    get value() { return this.control.value; }
    get valid() { return this.control.valid; }
    get errors() { return this.control.errors; }
    get pristine() { return this.control.pristine; }
    get dirty() { return this.control.dirty; }
    get touched() { return this.control.touched; }
    get untouched() { return this.control.untouched; }
}
//# sourceMappingURL=abstract_control_directive.js.map
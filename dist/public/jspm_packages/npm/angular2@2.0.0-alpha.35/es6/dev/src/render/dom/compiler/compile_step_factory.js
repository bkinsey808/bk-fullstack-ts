/* */ 
"format cjs";
import { PropertyBindingParser } from './property_binding_parser';
import { TextInterpolationParser } from './text_interpolation_parser';
import { DirectiveParser } from './directive_parser';
import { ViewSplitter } from './view_splitter';
import { StyleEncapsulator } from './style_encapsulator';
export class CompileStepFactory {
    createSteps(view) { return null; }
}
export class DefaultStepFactory extends CompileStepFactory {
    constructor(_parser, _appId) {
        super();
        this._parser = _parser;
        this._appId = _appId;
        this._componentUIDsCache = new Map();
    }
    createSteps(view) {
        return [
            new ViewSplitter(this._parser),
            new PropertyBindingParser(this._parser),
            new DirectiveParser(this._parser, view.directives),
            new TextInterpolationParser(this._parser),
            new StyleEncapsulator(this._appId, view, this._componentUIDsCache)
        ];
    }
}
//# sourceMappingURL=compile_step_factory.js.map
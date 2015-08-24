/* */ 
"format cjs";
import { StringMapWrapper } from 'angular2/src/facade/collection';
import { isBlank, normalizeBlank } from 'angular2/src/facade/lang';
export class RouteParams {
    constructor(params) {
        this.params = params;
    }
    get(param) { return normalizeBlank(StringMapWrapper.get(this.params, param)); }
}
/**
 * `Instruction` is a tree of `ComponentInstructions`, with all the information needed
 * to transition each component in the app to a given route, including all auxiliary routes.
 *
 * This is a public API.
 */
export class Instruction {
    constructor(component, child, auxInstruction) {
        this.component = component;
        this.child = child;
        this.auxInstruction = auxInstruction;
    }
    replaceChild(child) {
        return new Instruction(this.component, child, this.auxInstruction);
    }
}
/**
 * Represents a partially completed instruction during recognition that only has the
 * primary (non-aux) route instructions matched.
 *
 * `PrimaryInstruction` is an internal class used by `RouteRecognizer` while it's
 * figuring out where to navigate.
 */
export class PrimaryInstruction {
    constructor(component, child, auxUrls) {
        this.component = component;
        this.child = child;
        this.auxUrls = auxUrls;
    }
}
export function stringifyInstruction(instruction) {
    var params = instruction.component.urlParams.length > 0 ?
        ('?' + instruction.component.urlParams.join('&')) :
        '';
    return instruction.component.urlPath + stringifyAux(instruction) +
        stringifyPrimary(instruction.child) + params;
}
function stringifyPrimary(instruction) {
    if (isBlank(instruction)) {
        return '';
    }
    var params = instruction.component.urlParams.length > 0 ?
        (';' + instruction.component.urlParams.join(';')) :
        '';
    return '/' + instruction.component.urlPath + params + stringifyAux(instruction) +
        stringifyPrimary(instruction.child);
}
function stringifyAux(instruction) {
    var routes = [];
    StringMapWrapper.forEach(instruction.auxInstruction, (auxInstruction, _) => {
        routes.push(stringifyPrimary(auxInstruction));
    });
    if (routes.length > 0) {
        return '(' + routes.join('//') + ')';
    }
    return '';
}
/**
 * A `ComponentInstruction` represents the route state for a single component. An `Instruction` is
 * composed of a tree of these `ComponentInstruction`s.
 *
 * `ComponentInstructions` is a public API. Instances of `ComponentInstruction` are passed
 * to route lifecycle hooks, like {@link CanActivate}.
 */
export class ComponentInstruction {
    constructor(urlPath, urlParams, _recognizer, params = null) {
        this.urlPath = urlPath;
        this.urlParams = urlParams;
        this._recognizer = _recognizer;
        this.params = params;
        this.reuse = false;
    }
    get componentType() { return this._recognizer.handler.componentType; }
    resolveComponentType() { return this._recognizer.handler.resolveComponentType(); }
    get specificity() { return this._recognizer.specificity; }
    get terminal() { return this._recognizer.terminal; }
    routeData() { return this._recognizer.handler.data; }
}
//# sourceMappingURL=instruction.js.map
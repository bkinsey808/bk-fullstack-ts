/* */ 
"format cjs";
import { PromiseWrapper, EventEmitter, ObservableWrapper } from 'angular2/src/facade/async';
import { Map, StringMapWrapper, MapWrapper, ListWrapper } from 'angular2/src/facade/collection';
import { isBlank, isString, StringWrapper, isPresent, BaseException } from 'angular2/src/facade/lang';
import { stringifyInstruction } from './instruction';
import { getCanActivateHook } from './route_lifecycle_reflector';
let _resolveToTrue = PromiseWrapper.resolve(true);
let _resolveToFalse = PromiseWrapper.resolve(false);
/**
 * # Router
 * The router is responsible for mapping URLs to components.
 *
 * You can see the state of the router by inspecting the read-only field `router.navigating`.
 * This may be useful for showing a spinner, for instance.
 *
 * ## Concepts
 * Routers and component instances have a 1:1 correspondence.
 *
 * The router holds reference to a number of "outlets." An outlet is a placeholder that the
 * router dynamically fills in depending on the current URL.
 *
 * When the router navigates from a URL, it must first recognizes it and serialize it into an
 * `Instruction`.
 * The router uses the `RouteRegistry` to get an `Instruction`.
 */
export class Router {
    constructor(registry, _pipeline, parent, hostComponent) {
        this.registry = registry;
        this._pipeline = _pipeline;
        this.parent = parent;
        this.hostComponent = hostComponent;
        this.navigating = false;
        this._currentInstruction = null;
        this._currentNavigation = _resolveToTrue;
        this._outlet = null;
        this._auxOutlets = new Map();
        this._subject = new EventEmitter();
    }
    /**
     * Constructs a child router. You probably don't need to use this unless you're writing a reusable
     * component.
     */
    childRouter(hostComponent) { return new ChildRouter(this, hostComponent); }
    /**
     * Register an object to notify of route changes. You probably don't need to use this unless
     * you're writing a reusable component.
     */
    registerOutlet(outlet) {
        if (isPresent(outlet.name)) {
            this._auxOutlets.set(outlet.name, outlet);
        }
        else {
            this._outlet = outlet;
        }
        if (isPresent(this._currentInstruction)) {
            return outlet.commit(this._currentInstruction);
        }
        return _resolveToTrue;
    }
    /**
     * Dynamically update the routing configuration and trigger a navigation.
     *
     * # Usage
     *
     * ```
     * router.config([
     *   { 'path': '/', 'component': IndexComp },
     *   { 'path': '/user/:id', 'component': UserComp },
     * ]);
     * ```
     */
    config(definitions) {
        definitions.forEach((routeDefinition) => { this.registry.config(this.hostComponent, routeDefinition); });
        return this.renavigate();
    }
    /**
     * Navigate to a URL. Returns a promise that resolves when navigation is complete.
     *
     * If the given URL begins with a `/`, router will navigate absolutely.
     * If the given URL does not begin with `/`, the router will navigate relative to this component.
     */
    navigate(url, _skipLocationChange = false) {
        return this._currentNavigation = this._currentNavigation.then((_) => {
            this.lastNavigationAttempt = url;
            this._startNavigating();
            return this._afterPromiseFinishNavigating(this.recognize(url).then((instruction) => {
                if (isBlank(instruction)) {
                    return false;
                }
                return this._navigate(instruction, _skipLocationChange);
            }));
        });
    }
    /**
     * Navigate via the provided instruction. Returns a promise that resolves when navigation is
     * complete.
     */
    navigateInstruction(instruction, _skipLocationChange = false) {
        if (isBlank(instruction)) {
            return _resolveToFalse;
        }
        return this._currentNavigation = this._currentNavigation.then((_) => {
            this._startNavigating();
            return this._afterPromiseFinishNavigating(this._navigate(instruction, _skipLocationChange));
        });
    }
    _navigate(instruction, _skipLocationChange) {
        return this._settleInstruction(instruction)
            .then((_) => this._reuse(instruction))
            .then((_) => this._canActivate(instruction))
            .then((result) => {
            if (!result) {
                return false;
            }
            return this._canDeactivate(instruction)
                .then((result) => {
                if (result) {
                    return this.commit(instruction, _skipLocationChange)
                        .then((_) => {
                        this._emitNavigationFinish(stringifyInstruction(instruction));
                        return true;
                    });
                }
            });
        });
    }
    // TODO(btford): it'd be nice to remove this method as part of cleaning up the traversal logic
    // Since refactoring `Router.generate` to return an instruction rather than a string, it's not
    // guaranteed that the `componentType`s for the terminal async routes have been loaded by the time
    // we begin navigation. The method below simply traverses instructions and resolves any components
    // for which `componentType` is not present
    _settleInstruction(instruction) {
        var unsettledInstructions = [];
        if (isBlank(instruction.component.componentType)) {
            unsettledInstructions.push(instruction.component.resolveComponentType());
        }
        if (isPresent(instruction.child)) {
            unsettledInstructions.push(this._settleInstruction(instruction.child));
        }
        StringMapWrapper.forEach(instruction.auxInstruction, (instruction, _) => {
            unsettledInstructions.push(this._settleInstruction(instruction));
        });
        return PromiseWrapper.all(unsettledInstructions);
    }
    _emitNavigationFinish(url) { ObservableWrapper.callNext(this._subject, url); }
    _afterPromiseFinishNavigating(promise) {
        return PromiseWrapper.catchError(promise.then((_) => this._finishNavigating()), (err) => {
            this._finishNavigating();
            throw err;
        });
    }
    _reuse(instruction) {
        if (isBlank(this._outlet)) {
            return _resolveToFalse;
        }
        return this._outlet.canReuse(instruction)
            .then((result) => {
            if (isPresent(this._outlet.childRouter) && isPresent(instruction.child)) {
                return this._outlet.childRouter._reuse(instruction.child);
            }
        });
    }
    _canActivate(nextInstruction) {
        return canActivateOne(nextInstruction, this._currentInstruction);
    }
    _canDeactivate(instruction) {
        if (isBlank(this._outlet)) {
            return _resolveToTrue;
        }
        var next;
        if (isPresent(instruction) && instruction.component.reuse) {
            next = _resolveToTrue;
        }
        else {
            next = this._outlet.canDeactivate(instruction);
        }
        // TODO: aux route lifecycle hooks
        return next.then((result) => {
            if (result == false) {
                return false;
            }
            if (isPresent(this._outlet.childRouter)) {
                return this._outlet.childRouter._canDeactivate(isPresent(instruction) ? instruction.child :
                    null);
            }
            return true;
        });
    }
    /**
     * Updates this router and all descendant routers according to the given instruction
     */
    commit(instruction, _skipLocationChange = false) {
        this._currentInstruction = instruction;
        var next = _resolveToTrue;
        if (isPresent(this._outlet)) {
            next = this._outlet.commit(instruction);
        }
        var promises = [];
        MapWrapper.forEach(this._auxOutlets, (outlet, _) => { promises.push(outlet.commit(instruction)); });
        return next.then((_) => PromiseWrapper.all(promises));
    }
    _startNavigating() { this.navigating = true; }
    _finishNavigating() { this.navigating = false; }
    /**
     * Subscribe to URL updates from the router
     */
    subscribe(onNext) {
        ObservableWrapper.subscribe(this._subject, onNext);
    }
    /**
     * Removes the contents of this router's outlet and all descendant outlets
     */
    deactivate(instruction) {
        if (isPresent(this._outlet)) {
            return this._outlet.deactivate(instruction);
        }
        return _resolveToTrue;
    }
    /**
     * Given a URL, returns an instruction representing the component graph
     */
    recognize(url) {
        return this.registry.recognize(url, this.hostComponent);
    }
    /**
     * Navigates to either the last URL successfully navigated to, or the last URL requested if the
     * router has yet to successfully navigate.
     */
    renavigate() {
        if (isBlank(this.lastNavigationAttempt)) {
            return this._currentNavigation;
        }
        return this.navigate(this.lastNavigationAttempt);
    }
    /**
     * Generate a URL from a component name and optional map of parameters. The URL is relative to the
     * app's base href.
     */
    generate(linkParams) {
        let normalizedLinkParams = splitAndFlattenLinkParams(linkParams);
        var first = ListWrapper.first(normalizedLinkParams);
        var rest = ListWrapper.slice(normalizedLinkParams, 1);
        var router = this;
        // The first segment should be either '.' (generate from parent) or '' (generate from root).
        // When we normalize above, we strip all the slashes, './' becomes '.' and '/' becomes ''.
        if (first == '') {
            while (isPresent(router.parent)) {
                router = router.parent;
            }
        }
        else if (first == '..') {
            router = router.parent;
            while (ListWrapper.first(rest) == '..') {
                rest = ListWrapper.slice(rest, 1);
                router = router.parent;
                if (isBlank(router)) {
                    throw new BaseException(`Link "${ListWrapper.toJSON(linkParams)}" has too many "../" segments.`);
                }
            }
        }
        else if (first != '.') {
            throw new BaseException(`Link "${ListWrapper.toJSON(linkParams)}" must start with "/", "./", or "../"`);
        }
        if (rest[rest.length - 1] == '') {
            ListWrapper.removeLast(rest);
        }
        if (rest.length < 1) {
            let msg = `Link "${ListWrapper.toJSON(linkParams)}" must include a route name.`;
            throw new BaseException(msg);
        }
        // TODO: structural cloning and whatnot
        var url = [];
        var parent = router.parent;
        while (isPresent(parent)) {
            url.unshift(parent._currentInstruction);
            parent = parent.parent;
        }
        var nextInstruction = this.registry.generate(rest, router.hostComponent);
        while (url.length > 0) {
            nextInstruction = url.pop().replaceChild(nextInstruction);
        }
        return nextInstruction;
    }
}
export class RootRouter extends Router {
    constructor(registry, pipeline, location, hostComponent) {
        super(registry, pipeline, null, hostComponent);
        this._location = location;
        this._location.subscribe((change) => this.navigate(change['url'], isPresent(change['pop'])));
        this.registry.configFromComponent(hostComponent);
        this.navigate(location.path());
    }
    commit(instruction, _skipLocationChange = false) {
        var emitUrl = stringifyInstruction(instruction);
        if (emitUrl.length > 0) {
            emitUrl = '/' + emitUrl;
        }
        var promise = super.commit(instruction);
        if (!_skipLocationChange) {
            promise = promise.then((_) => { this._location.go(emitUrl); });
        }
        return promise;
    }
}
class ChildRouter extends Router {
    constructor(parent, hostComponent) {
        super(parent.registry, parent._pipeline, parent, hostComponent);
        this.parent = parent;
    }
    navigate(url, _skipLocationChange = false) {
        // Delegate navigation to the root router
        return this.parent.navigate(url, _skipLocationChange);
    }
    navigateInstruction(instruction, _skipLocationChange = false) {
        // Delegate navigation to the root router
        return this.parent.navigateInstruction(instruction, _skipLocationChange);
    }
}
/*
 * Given: ['/a/b', {c: 2}]
 * Returns: ['', 'a', 'b', {c: 2}]
 */
var SLASH = new RegExp('/');
function splitAndFlattenLinkParams(linkParams) {
    return ListWrapper.reduce(linkParams, (accumulation, item) => {
        if (isString(item)) {
            return ListWrapper.concat(accumulation, StringWrapper.split(item, SLASH));
        }
        accumulation.push(item);
        return accumulation;
    }, []);
}
function canActivateOne(nextInstruction, prevInstruction) {
    var next = _resolveToTrue;
    if (isPresent(nextInstruction.child)) {
        next = canActivateOne(nextInstruction.child, isPresent(prevInstruction) ? prevInstruction.child : null);
    }
    return next.then((result) => {
        if (result == false) {
            return false;
        }
        if (nextInstruction.component.reuse) {
            return true;
        }
        var hook = getCanActivateHook(nextInstruction.component.componentType);
        if (isPresent(hook)) {
            return hook(nextInstruction.component, isPresent(prevInstruction) ? prevInstruction.component : null);
        }
        return true;
    });
}
//# sourceMappingURL=router.js.map
/* */ 
"format cjs";
import { AsyncRoute, AuxRoute, Route, Redirect } from './route_config_decorator';
import { BaseException } from 'angular2/src/facade/lang';
/**
 * Given a JS Object that represents... returns a corresponding Route, AsyncRoute, or Redirect
 */
export function normalizeRouteConfig(config) {
    if (config instanceof Route || config instanceof Redirect || config instanceof AsyncRoute ||
        config instanceof AuxRoute) {
        return config;
    }
    if ((!config.component) == (!config.redirectTo)) {
        throw new BaseException(`Route config should contain exactly one "component", "loader", or "redirectTo" property.`);
    }
    if (config.component) {
        if (typeof config.component == 'object') {
            let componentDefinitionObject = config.component;
            if (componentDefinitionObject.type == 'constructor') {
                return new Route({
                    path: config.path,
                    component: componentDefinitionObject.constructor,
                    as: config.as
                });
            }
            else if (componentDefinitionObject.type == 'loader') {
                return new AsyncRoute({ path: config.path, loader: componentDefinitionObject.loader, as: config.as });
            }
            else {
                throw new BaseException(`Invalid component type "${componentDefinitionObject.type}". Valid types are "constructor" and "loader".`);
            }
        }
        return new Route(config);
    }
    if (config.redirectTo) {
        return new Redirect({ path: config.path, redirectTo: config.redirectTo });
    }
    return config;
}
//# sourceMappingURL=route_config_nomalizer.js.map
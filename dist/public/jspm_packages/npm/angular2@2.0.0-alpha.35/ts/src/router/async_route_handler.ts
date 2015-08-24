import {RouteHandler} from './route_handler';
import {Promise, PromiseWrapper} from 'angular2/src/facade/async';
import {isPresent, Type} from 'angular2/src/facade/lang';

export class AsyncRouteHandler implements RouteHandler {
  _resolvedComponent: Promise<any> = null;
  componentType: Type;

  constructor(private _loader: Function, public data?: Object) {}

  resolveComponentType(): Promise<any> {
    if (isPresent(this._resolvedComponent)) {
      return this._resolvedComponent;
    }

    return this._resolvedComponent = this._loader().then((componentType) => {
      this.componentType = componentType;
      return componentType;
    });
  }
}

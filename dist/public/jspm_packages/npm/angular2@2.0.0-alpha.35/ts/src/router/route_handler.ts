import {Promise, PromiseWrapper} from 'angular2/src/facade/async';
import {Type} from 'angular2/src/facade/lang';

export interface RouteHandler {
  componentType: Type;
  resolveComponentType(): Promise<any>;
  data?: Object;
}

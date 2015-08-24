import {Injectable} from 'angular2/di';
import {Type, isPresent} from 'angular2/src/facade/lang';
import {Map, MapWrapper} from 'angular2/src/facade/collection';

/**
 * Resolve a `Type` from a {@link ComponentMetadata} into a URL.
 *
 * This interface can be overridden by the application developer to create custom behavior.
 *
 * See {@link Compiler}
 */
@Injectable()
export class ComponentUrlMapper {
  /**
   * Returns the base URL to the component source file.
   * The returned URL could be:
   * - an absolute URL,
   * - a path relative to the application
   */
  getUrl(component: Type): string { return './'; }
}

export class RuntimeComponentUrlMapper extends ComponentUrlMapper {
  _componentUrls: Map<Type, string>;

  constructor() {
    super();
    this._componentUrls = new Map();
  }

  setComponentUrl(component: Type, url: string) { this._componentUrls.set(component, url); }

  getUrl(component: Type): string {
    var url = this._componentUrls.get(component);
    if (isPresent(url)) return url;
    return super.getUrl(component);
  }
}

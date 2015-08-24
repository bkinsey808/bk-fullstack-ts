import {AppRootUrl} from "angular2/src/services/app_root_url";
import {DOM} from "angular2/src/dom/dom_adapter";
import {Injectable} from "angular2/di";

/**
 * Extension of {@link AppRootUrl} that uses a DOM anchor tag to set the root url to
 * the current page's url.
 */
@Injectable()
export class AnchorBasedAppRootUrl extends AppRootUrl {
  constructor() {
    super("");
    // compute the root url to pass to AppRootUrl
    var rootUrl: string;
    var a = DOM.createElement('a');
    DOM.resolveAndSetHref(a, './', null);
    rootUrl = DOM.getHref(a);

    this.value = rootUrl;
  }
}

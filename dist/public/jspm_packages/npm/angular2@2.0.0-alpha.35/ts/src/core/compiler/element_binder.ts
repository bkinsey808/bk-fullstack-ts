import {isBlank, isPresent, BaseException} from 'angular2/src/facade/lang';
import * as eiModule from './element_injector';
import {DirectiveBinding} from './element_injector';
import * as viewModule from './view';

export class ElementBinder {
  // updated later, so we are able to resolve cycles
  nestedProtoView: viewModule.AppProtoView = null;

  constructor(public index: int, public parent: ElementBinder, public distanceToParent: int,
              public protoElementInjector: eiModule.ProtoElementInjector,
              public componentDirective: DirectiveBinding) {
    if (isBlank(index)) {
      throw new BaseException('null index not allowed.');
    }
  }

  hasStaticComponent(): boolean {
    return isPresent(this.componentDirective) && isPresent(this.nestedProtoView);
  }

  hasEmbeddedProtoView(): boolean {
    return !isPresent(this.componentDirective) && isPresent(this.nestedProtoView);
  }
}

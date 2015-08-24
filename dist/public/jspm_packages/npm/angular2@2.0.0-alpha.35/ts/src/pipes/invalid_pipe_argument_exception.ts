import {ABSTRACT, BaseException, CONST, Type} from 'angular2/src/facade/lang';

export class InvalidPipeArgumentException extends BaseException {
  constructor(type: Type, value: Object) {
    super(`Invalid argument '${value}' for pipe '${type}'`);
  }
}

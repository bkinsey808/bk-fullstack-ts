import {StringWrapper, normalizeBool, isBlank} from 'angular2/src/facade/lang';
import {isDefaultChangeDetectionStrategy} from './constants';

export class DirectiveIndex {
  constructor(public elementIndex: number, public directiveIndex: number) {}

  get name() { return `${this.elementIndex}_${this.directiveIndex}`; }
}

export class DirectiveRecord {
  directiveIndex: DirectiveIndex;
  callOnAllChangesDone: boolean;
  callOnChange: boolean;
  callOnCheck: boolean;
  callOnInit: boolean;
  changeDetection: string;

  constructor({directiveIndex, callOnAllChangesDone, callOnChange, callOnCheck, callOnInit,
               changeDetection}: {
    directiveIndex?: DirectiveIndex,
    callOnAllChangesDone?: boolean,
    callOnChange?: boolean,
    callOnCheck?: boolean,
    callOnInit?: boolean,
    changeDetection?: string
  } = {}) {
    this.directiveIndex = directiveIndex;
    this.callOnAllChangesDone = normalizeBool(callOnAllChangesDone);
    this.callOnChange = normalizeBool(callOnChange);
    this.callOnCheck = normalizeBool(callOnCheck);
    this.callOnInit = normalizeBool(callOnInit);
    this.changeDetection = changeDetection;
  }

  isDefaultChangeDetection(): boolean {
    return isDefaultChangeDetectionStrategy(this.changeDetection);
  }
}
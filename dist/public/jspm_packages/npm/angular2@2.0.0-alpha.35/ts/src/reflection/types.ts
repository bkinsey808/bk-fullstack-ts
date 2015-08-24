import {Type} from 'angular2/src/facade/lang';
import {List} from 'angular2/src/facade/collection';

export type SetterFn = (obj: any, value: any) => void;
export type GetterFn = (obj: any) => any;
export type MethodFn = (obj: any, args: List<any>) => any;

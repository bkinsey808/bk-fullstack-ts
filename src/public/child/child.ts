/// <reference path="../../../typings/angular2/angular2.d.ts" />

import { Component, View, bootstrap } from 'angular2/angular2';

// Annotation section
@Component({
  selector: 'child'
})
@View({
  // this is a hack to bust the cache. Is there a better way to do this?
  templateUrl: 'child/child.html'
})
// Component controller
export class Child {
  name: string;
  constructor() {
    this.name = 'yayayayay!!!';
  }
}

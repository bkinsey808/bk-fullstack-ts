/// <reference path="/typings/angular2/angular2.d.ts" />

import { Component, View, bootstrap } from 'angular2/angular2';
import { Child } from 'components/child/child';

@Component({
  selector: 'app'
})
@View({
  templateUrl: 'components/app.html',
  directives: [
    Child
  ]
})

class App {
  name: string;
  constructor() {
    this.name = 'My name';
  }
}

bootstrap(App);

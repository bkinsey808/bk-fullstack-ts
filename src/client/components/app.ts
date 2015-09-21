/// <reference path="../../../typings/angular2/angular2.d.ts" />

//import deps
//import 'zone.js';
//import 'reflect-metadata';

import { Component, View, bootstrap } from 'angular2/angular2';
import { Child } from './child/child';

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
    this.name = 'World';
  }
}

bootstrap(App);

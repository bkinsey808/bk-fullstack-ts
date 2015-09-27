/// <reference path="../../../typings/angular2/angular2.d.ts" />
/// <reference path="../../../typings/angular2/router.d.ts" />
/// <reference path="../../../typings/angular2/http.d.ts" />

import { bind, Component, View, bootstrap } from 'angular2/angular2';
import { HTTP_BINDINGS } from 'angular2/http';
import { ROUTER_DIRECTIVES, ROUTER_BINDINGS, LocationStrategy, HashLocationStrategy,
         RouteConfig
       } from 'angular2/router';
import { Header } from './header/header';
import { Nav } from './nav/nav';
import { Home } from './main/home/home';
import { About } from './main/about/about';

@Component({
  selector: 'app'
})
@View({
  templateUrl: 'components/app.html',
  directives: [
    Header,
    Nav,
    Home,
    About,
    ROUTER_DIRECTIVES
  ]
})
@RouteConfig([
  { path: '/', as: 'home', component: Home },
  { path: '/about', as: 'about', component: About }
])
class App {
  name: string;
  constructor() {
    this.name = 'World';
  }
}

bootstrap(App, [HTTP_BINDINGS,ROUTER_BINDINGS, bind(LocationStrategy).toClass(HashLocationStrategy)]);

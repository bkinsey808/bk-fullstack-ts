/// <reference path="../../../../typings/angular2/angular2.d.ts" />
/// <reference path="../../../../typings/angular2/router.d.ts" />
/// <reference path="../../../../typings/angular2/http.d.ts" />

import { bind, Component, View, bootstrap } from 'angular2/angular2';
import { HTTP_BINDINGS } from 'angular2/http';
import { ROUTER_BINDINGS, RouteConfig,
         LocationStrategy, HashLocationStrategy
       } from 'angular2/router';
import { Header } from '../layout/header/header';
import { Nav    } from '../layout/nav/nav';
import { Aside  } from '../layout/aside/aside';
import { Footer } from '../layout/footer/footer';
import { Body   } from '../layout/body/body';
import { Home   } from '../content/home/home';
import { About  } from '../content/about/about';

@Component({
  selector: 'app'
})
@View({
  templateUrl: 'components/app/app.html',
  directives: [
    Header,
    Nav,
    Aside,
    Body,
    Footer
  ]
})
@RouteConfig([
  //      URL           state               class
  { path: '/',      as: 'home',  component: Home },
  { path: '/about', as: 'about', component: About }
])
class App {
  name: string;
  constructor() {
    this.name = 'World';
    console.log('app works ');
  }
}

// How do I do html5mode without hash urls?
bootstrap(App, [HTTP_BINDINGS, ROUTER_BINDINGS, bind(LocationStrategy).toClass(HashLocationStrategy)]);

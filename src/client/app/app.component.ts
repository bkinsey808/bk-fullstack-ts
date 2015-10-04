/// <reference path="../../../typings/angular2/angular2.d.ts" />
/// <reference path="../../../typings/angular2/router.d.ts" />
/// <reference path="../../../typings/angular2/http.d.ts" />

import { bind, Component, View, bootstrap } from 'angular2/angular2';
import { HTTP_BINDINGS } from 'angular2/http';
import { ROUTER_BINDINGS, RouteConfig,
         LocationStrategy, HashLocationStrategy
       } from 'angular2/router';
import { HeaderComponent } from '../layout/header/header.component';
import { NavComponent    } from '../layout/nav/nav.component';
import { AsideComponent  } from '../layout/aside/aside.component';
import { FooterComponent } from '../layout/footer/footer.component';
import { BodyComponent   } from '../layout/body/body.component';
import { HomeComponent   } from '../content/home/home.component';
import { AboutComponent  } from '../content/about/about.component';

@Component({
  selector: 'app'
})
@View({
  templateUrl: 'app/app.template.html',
  directives: [
    HeaderComponent,
    NavComponent,
    AsideComponent,
    BodyComponent,
    FooterComponent
  ]
})
@RouteConfig([
  //      URL           state               class
  { path: '/',      as: 'home',  component: HomeComponent },
  { path: '/about', as: 'about', component: AboutComponent }
])
class AppComponent {
  name: string;
  constructor() {
    this.name = 'World';
    console.log('app works ');
  }
}

// How do I do html5mode without hash urls?
bootstrap(AppComponent, [
  HTTP_BINDINGS,
  ROUTER_BINDINGS,
  bind(LocationStrategy).toClass(HashLocationStrategy)
]);

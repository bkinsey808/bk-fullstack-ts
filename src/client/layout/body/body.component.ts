import { Component, View } from 'angular2/angular2';
import { ROUTER_DIRECTIVES } from 'angular2/router';
import { NavComponent   } from '../nav/nav.component';
import { AsideComponent } from '../aside/aside.component';
import { HomeComponent   } from '../../content/home/home.component';
import { AboutComponent  } from '../../content/about/about.component';

@Component({
  selector: 'app-body'
})
@View({
  templateUrl: 'layout/body/body.html',
  directives: [
    NavComponent,
    AsideComponent,
    HomeComponent,
    AboutComponent,
    ROUTER_DIRECTIVES // Do I need all of this?
  ]
})
export class BodyComponent {
  name: string;
  constructor() {
    this.name = 'World';
    console.log('body');
  }
}

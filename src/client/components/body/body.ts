import { Component, View } from 'angular2/angular2';
import { ROUTER_DIRECTIVES } from 'angular2/router';
import { Nav    } from '../nav/nav';
import { Aside  } from '../aside/aside';
import { Home   } from '../main/home/home';
import { About  } from '../main/about/about';

@Component({
  selector: 'app-body'
})
@View({
  templateUrl: 'components/body/body.html',
  directives: [
    Nav,
    Aside,
    Home,
    About,
    ROUTER_DIRECTIVES // Do I need all of this?
  ]
})
export class Body {
  name: string;
  constructor() {
    this.name = 'World';
    console.log('app works ');
  }
}

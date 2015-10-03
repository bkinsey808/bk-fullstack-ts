import { Component, View } from 'angular2/angular2';

@Component({
  selector: 'app-aside'
})
@View({
  templateUrl: 'components/layout/aside/aside.html'
})
export class Aside {
  constructor() {
    console.log('aside');
  }
}

import { Component, View, bootstrap } from 'angular2/angular2';

@Component({
  selector: 'home'
})
@View({
  templateUrl: 'components/main/home/home.html'
})
export class Home {
  constructor() {
    console.log('home.');
  }
}

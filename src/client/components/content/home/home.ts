import { Component, View } from 'angular2/angular2';

@Component({
  selector: 'home'
})
@View({
  templateUrl: 'components/content/home/home.html'
})
export class Home {
  constructor() {
    name='HOME';
    console.log('homeie');
  }
}

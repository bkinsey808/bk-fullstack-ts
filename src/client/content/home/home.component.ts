import { Component, View } from 'angular2/angular2';

@Component({
  selector: 'home'
})
@View({
  templateUrl: 'content/home/home.template.html'
})
export class HomeComponent {
  constructor() {
    name='HOME';
    console.log('homeie!');
  }
}

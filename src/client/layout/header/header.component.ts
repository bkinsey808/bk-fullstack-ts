import { Component, View } from 'angular2/angular2';

@Component({
  selector: 'app-header'
})
@View({
  templateUrl: 'layout/header/header.html'
})
export class HeaderComponent {
  constructor() {
    console.log('header');
  }
}

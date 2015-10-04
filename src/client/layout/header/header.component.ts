import { Component, View } from 'angular2/angular2';

@Component({
  selector: 'app-header'
})
@View({
  templateUrl: 'layout/header/header.template.html'
})
export class HeaderComponent {
  constructor() {
    console.log('header');
  }
}

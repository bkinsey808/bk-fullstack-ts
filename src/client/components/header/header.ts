import { Component, View } from 'angular2/angular2';

@Component({
  selector: 'app-header'
})
@View({
  templateUrl: 'components/header/header.html'
})
export class Header {
  constructor() {
    console.log('header');
  }
}

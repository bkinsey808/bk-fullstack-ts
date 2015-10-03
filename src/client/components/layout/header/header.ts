import { Component, View } from 'angular2/angular2';

@Component({
  selector: 'app-header'
})
@View({
  templateUrl: 'components/layout/header/header.html'
})
export class Header {
  constructor() {
    console.log('header');
  }
}

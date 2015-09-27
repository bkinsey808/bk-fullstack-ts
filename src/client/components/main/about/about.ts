import { Component, View, bootstrap } from 'angular2/angular2';

@Component({
  selector: 'app-menu'
})
@View({
  templateUrl: 'components/main/about/about.html'
})
export class About {
  constructor() {
    console.log('about');
  }
}

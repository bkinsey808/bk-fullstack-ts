import { Component, View, bootstrap } from 'angular2/angular2';

@Component({
  selector: 'app-menu'
})
@View({
  templateUrl: 'content/about/about.html'
})
export class AboutComponent {
  constructor() {
    console.log('about');
  }
}

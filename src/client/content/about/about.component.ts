import { Component, View, bootstrap } from 'angular2/angular2';

@Component({
  selector: 'app-menu'
})
@View({
  templateUrl: 'content/about/about.template.html'
})
export class AboutComponent {
  constructor() {
    console.log('about');
  }
}

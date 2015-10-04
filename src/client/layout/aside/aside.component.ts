import { Component, View } from 'angular2/angular2';

@Component({
  selector: 'app-aside'
})
@View({
  templateUrl: 'layout/aside/aside.template.html'
})
export class AsideComponent {
  constructor() {
    console.log('aside');
  }
}

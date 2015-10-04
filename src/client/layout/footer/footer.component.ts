import { Component, View } from 'angular2/angular2';

@Component({
  selector: 'app-footer'
})
@View({
  templateUrl: 'layout/footer/footer.html'
})
export class FooterComponent {
  constructor() {
    console.log('footer');
  }
}

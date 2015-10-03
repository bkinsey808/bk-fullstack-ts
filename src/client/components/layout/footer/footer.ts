import { Component, View } from 'angular2/angular2';

@Component({
  selector: 'app-footer'
})
@View({
  templateUrl: 'components/layout/footer/footer.html'
})
export class Footer {
  constructor() {
    console.log('footer');
  }
}

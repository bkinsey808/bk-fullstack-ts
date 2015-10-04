import { Component, View } from 'angular2/angular2';
import { RouterLink } from 'angular2/router';
import { ApiService } from '../../api/api.service';
import { HomeComponent } from '../../content/home/home.component';
import { AboutComponent } from '../../content/about/about.component';

@Component({
  selector: 'app-nav',
  bindings: [ApiService]
})
@View({
  templateUrl: 'components/layout/nav/nav.html',
  directives: [RouterLink]
})

export class NavComponent {
  name:     string;
  navItems: Array<any>;

  constructor(apiService: ApiService) {
    console.log('menu');
    this.name = 'YAY!!!!!';
    this.navItems = [];

    apiService.getNavItems()
    .then(r => r.json())
    .then(r => {
       this.navItems = r;
       console.log(this.navItems);
    });

  }
}

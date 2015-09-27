import { Component, View } from 'angular2/angular2';
import { RouterLink } from 'angular2/router';
import { API } from '../../services/api';
import { Home } from '../main/home/home';
import { About } from '../main/about/about';

@Component({
  selector: 'app-nav',
  bindings: [API]
})
@View({
  templateUrl: 'components/nav/nav.html',
  directives: [RouterLink]
})

export class Nav {
  name: string;
  books: Array<any>;

  constructor(api: API) {
    console.log('menu');
    this.name = 'YAY!!!!!';
    this.books = [];

    api.getBooks()
    .then(r => r.json())
    .then(r => {
       this.books = r;
       console.log(this.books);
    });

  }
}

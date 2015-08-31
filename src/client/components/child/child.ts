/// <reference path="../../../../typings/angular2/angular2.d.ts" />

import { Component, View, bootstrap } from 'angular2/angular2';
/*import { API } from '../../services/api';*/
import { API } from 'services/api';

// Annotation section
@Component({
  selector: 'child',
  bindings: [API]
})
@View({
  // this is a hack to bust the cache. Is there a better way to do this?
  templateUrl: 'components/child/child.html'
})
// Component controller
export class Child {
  name: string;
  books: Array<any>;

  constructor(api: API) {
    this.name = 'YAY!!!!!';
    this.books = [];
   console.log('here');
    api.getBooks()
    .then(r => r.json())
    .then(r => {
       this.books = r;
       console.log(this.books);
    });
  }
}

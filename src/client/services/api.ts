declare var fetch, Zone;

export class API {
  getBooks() {
    return fetch('http://localhost:3000/api/books');
  }
}

declare var fetch, Zone;

export class API {
  getNavItems() {
    return fetch('http://localhost:3000/api/nav_items');
  }
}

declare var fetch, Zone;

export class ApiService {
  getNavItems() {
    return fetch('http://localhost:3000/api/nav_items');
  }
}

declare var fetch, Zone;

export class NavService {
  get() {
    return fetch('/api/nav');
  }
}

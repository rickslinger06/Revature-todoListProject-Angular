import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor() { }

  count = signal(0);
  increment() {
    this.count.update(count => count + 1);
  }

  decrement() {
    this.count.update(count => count - 1);
  }


}

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MediaRecorderService {

  constructor() { }

  foo() {
    console.log('Hello media recorder');
  }
}

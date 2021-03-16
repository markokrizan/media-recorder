import { Component } from '@angular/core';
import { MediaRecorderService } from 'media-recorder/angular/dist/media-recorder';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'angular-demo';

  constructor(private mediaRecorderService: MediaRecorderService) { 
    mediaRecorderService.foo();
  }
}

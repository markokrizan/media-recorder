import { Component, OnInit, ViewChild } from '@angular/core';
import { MediaRecorderService } from 'media-recorder/angular/dist/media-recorder'; // TODO: Use media-recorder/dist/angular

@Component({
  selector: 'app-audio-preview',
  templateUrl: './audio-preview.component.html',
  styleUrls: ['./audio-preview.component.css']
})
export class AudioPreviewComponent implements OnInit {

  @ViewChild('audioelement') audioElement; 

  constructor(public mediaRecorderService: MediaRecorderService) { }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    const audioElement = this.audioElement.nativeElement;

    this.mediaRecorderService.init(audioElement, 100);
  }
}

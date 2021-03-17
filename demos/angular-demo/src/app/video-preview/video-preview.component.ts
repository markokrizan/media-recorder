import { Component, OnInit, ViewChild } from '@angular/core';
import { MediaRecorderService } from 'media-recorder/angular/dist/media-recorder'; // TODO: Use media-recorder/dist/angular

@Component({
  selector: 'app-video-preview',
  templateUrl: './video-preview.component.html',
  styleUrls: ['./video-preview.component.css']
})
export class VideoPreviewComponent implements OnInit {

  @ViewChild('videoelement') videoElement; 

  constructor(public mediaRecorderService: MediaRecorderService) { }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    const videoElement = this.videoElement.nativeElement;

    this.mediaRecorderService.init(videoElement, 100);
  }
}

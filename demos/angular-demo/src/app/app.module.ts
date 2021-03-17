import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { MediaRecorderModule } from 'media-recorder/angular/dist/media-recorder'; // TODO: Use media-recorder/dist/angular
import { VideoPreviewComponent } from './video-preview/video-preview.component';
import { AudioPreviewComponent } from './audio-preview/audio-preview.component'; 

@NgModule({
  declarations: [
    AppComponent,
    VideoPreviewComponent,
    AudioPreviewComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MediaRecorderModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

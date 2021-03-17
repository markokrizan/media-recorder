import { Injectable, OnDestroy } from '@angular/core';
import { mediaRecorderCore } from '../../../../MediaDriver';

const { MediaDriverFactory, getSecondsAsTimeString, mapPluggedOutDevice, EVENT_REMOVE_DEVICE } = mediaRecorderCore;

@Injectable({
  providedIn: 'root'
})
export class MediaRecorderService implements OnDestroy {
  private driver: any;

  public devices: Array<any> = [];
  public selectedDevice:any = null;
  public isPreviewing:boolean = false;
  public isRecording:boolean = false;
  public recordingDuration: any = {};
  public playingMediaProgress: any = {};
  public isPaused:boolean = false;
  public isPlaying:boolean = false;
  public isPlaybackAvailable:boolean = false;

  init(mediaElement, maxSize) {
    this.driver = MediaDriverFactory.create(
      mediaElement, maxSize,
      this.onStop.bind(this),
      this.onRecordingError.bind(this),
      this.onVideoRecordTick.bind(this),
      this.onStartRecording.bind(this),
      this.onResetMediaData.bind(this),
      this.onPlayMediaFrame.bind(this),
      this.onPlaybackFinished.bind(this),
      this.onDeviceChange.bind(this),
      this.onDeviceLoad.bind(this)
    );
  }

  ngOnDestroy() {
    this.driver.clear();
  }

  private onStop() {
    this.stopRecording();

    this.isPlaybackAvailable = true;
  }

  private onRecordingError(e) {
    console.error("Recording error: ", e);
  }

  private onVideoRecordTick(currentVideoTimeElapsed) {
    this.recordingDuration = {
      seconds: currentVideoTimeElapsed,
      defaultRepresentation: getSecondsAsTimeString(currentVideoTimeElapsed),
    };
  }

  private onStartRecording() {
    this.isRecording = true;
    this.recordingDuration = 0;
  }

  private onResetMediaData() {
    this.isPlaying = false;
    this.isPaused = false;
    this.playingMediaProgress = null;
  }

  private onPlayMediaFrame({ progressPercentage, timeElapsed }) {
    this.playingMediaProgress = {
      progressPercentage,
      timeElapsed,
      defaultRepresentation: getSecondsAsTimeString(timeElapsed),
    };
  }

  private onPlaybackFinished({ progressPercentage }) {
    this.playingMediaProgress = {
      progressPercentage,
      timeElapsed: 0,
      defaultRepresentation: getSecondsAsTimeString(0),
    };

    this.isPaused = false;
    this.isPlaying = false;
  }

  private async onDeviceChange({ event, device }) {
    const newDevices = await this.driver.loadDevices();

    if (event === EVENT_REMOVE_DEVICE) {
      this.devices = mapPluggedOutDevice(this.devices, device);
    }

    this.devices = newDevices;
  }

  private onDeviceLoad(devices) {
    if (devices.length) {
      this.devices = devices;
      this.setSelectedDevice(devices[0].deviceId);
    }
  }

  loadStream() {
    this.isPreviewing = true;
    this.isPlaying = false;
    this.isPlaybackAvailable = false;

    this.driver.loadStream();
  }

  setSelectedDevice(deviceId) {
    this.selectedDevice = deviceId;
  }

  startRecording() {
    return this.driver.startRecording();
  }

  stopRecording() {
    if (!this.isRecording) {
      return;
    }

    this.isRecording = false;

    return this.driver.stopRecording();
  }

  playMedia() {
    this.driver.playMedia();
    this.isPaused = false;
    this.isPlaying = true;
  }

  pauseMedia() {
    this.driver.pauseMedia();
    this.isPaused = true;
    this.isPlaying = false;
  }

  getRecordedMedia() {
    return this.driver.getRecordedMedia();
  }

  changeDevice(deviceId) {
    this.setSelectedDevice(deviceId);

    return this.driver.changeDevice(deviceId);
  }

  retake(deviceId = null) {
    this.isPlaybackAvailable = false;

    return this.driver.retake(deviceId || this.selectedDevice);
  }

  clearRecording() {
    this.isPlaybackAvailable = false;

    return this.driver.clearRecording();
  }

  showVideoFile(mediaFile) {
    this.isPreviewing = true;
    this.isPlaybackAvailable = true;

    this.driver.showMediaFile(mediaFile);
  }

  download() {
    this.driver.download();
  }
}

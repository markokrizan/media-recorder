import { bytesToMB } from "./utils";

export class CustomMediaRecorder extends MediaRecorder {
  constructor(
    stream,
    maxMediaSize,
    onStop = () => {},
    onRecordingError = () => {},
    onMediaRecordTick = () => {}
  ) {
    super(stream);

    this.currentRecordedData = [];
    this.currentRecordingTimeElapsed = 0;

    this.maxMediaSize = maxMediaSize;
    this.onStop = onStop;
    this.onRecordingError = onRecordingError;
    this.onMediaRecordTick = onMediaRecordTick;

    this.ondataavailable = (event) => {
      if (this._getTotalSize() > maxMediaSize && this.state === "recording") {
        return this.stop();
      }

      this.currentRecordedData.push(event.data);
    };

    this.onstop = () => {
      this.clear();

      this.onStop();
    };

    this.onerror = (event) => {
      this.clear();

      this.onError(event);
    };
  }

  startRecording() {
    this.sizeCheckTimer = setInterval(() => {
      if (this.state === "recording") {
        this.requestData();
      }
    }, 500);

    this.start();

    this.videoTimeInterval = setInterval(() => {
      this.currentRecordingTimeElapsed = this.currentRecordingTimeElapsed + 1;

      this.onMediaRecordTick(this.currentRecordingTimeElapsed);
    }, 1000);
  }

  getVideo() {
    return this.currentRecordedData;
  }

  resetVideo() {
    this.currentRecordingTimeElapsed = 0;
    this.currentRecordedData = [];
  }

  _getTotalSize() {
    return this.currentRecordedData.reduce(
      (acc, blob) => acc + bytesToMB(blob.size),
      0
    );
  }

  clear() {
    clearInterval(this.sizeCheckTimer);
    clearInterval(this.videoTimeInterval);
    this.ondataavailable = null;
  }
}

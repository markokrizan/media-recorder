import { CustomMediaRecorder } from "./MediaRecorder";
import { getVideoBlobDuration, differenceBy } from "./utils";
import {
  DEFAULT_VIDEO_FORMAT,
  DEVICE_TYPE_WEB_CAM,
  DEVICE_TYPE_MICROPHONE,
  EVENT_ADD_DEVICE,
  EVENT_REMOVE_DEVICE,
  ERROR_CODE_PERMISSION_DENIED,
  ERROR_CODE_DEVICE_NOT_FOUND,
} from "./consts";

const _PERMISSION_ERROR = "Permission denied";
const _DEVICE_NOT_FOUND_ERROR = "Requested device not found";

export class MediaDriver {
  constructor(
    mediaElement,
    maxMediaSize = 5,
    onStop = () => {},
    onRecordingError = () => {},
    onMediaRecordTick = () => {},
    onStartRecording = () => {},
    onResetVideoData = () => {},
    onPlayVideoFrame = () => {},
    onPlaybackFinished = () => {},
    onDeviceChange = () => {}
  ) {
    if (!mediaElement) {
      throw new Error(
        "Provide a reference to a HTMLMediaElement (ex. <video /> or <audio/>) in order to use the API!"
      );
    }

    this.mediaElement = mediaElement;
    this.stream = null;
    this.mediaRecorder = null;
    this.currentRecordedVideo = {};
    this.devices = [];

    this.maxMediaSize = maxMediaSize;

    this.onStop = onStop;
    this.onRecordingError = onRecordingError;
    this.onMediaRecordTick = onMediaRecordTick;
    this.onStartRecording = onStartRecording;
    this.onResetVideoData = onResetVideoData;
    this.onPlayVideoFrame = onPlayVideoFrame;
    this.onPlaybackFinished = onPlaybackFinished;
    this.onDeviceChange = onDeviceChange;

    navigator.mediaDevices.ondevicechange = this.handleDeviceChange.bind(this);
  }

  async showWebcamPreview(deviceId) {
    try {
      this.clear();

      this.stream = deviceId
        ? await this.getVideoDeviceStream(deviceId)
        : await this._getDefaultWebcam();

      this.mediaElement.setAttribute("autoplay", true);
      this.mediaElement.srcObject = this.stream;
    } catch (e) {
      if (e.message === _PERMISSION_ERROR) {
        throw { code: ERROR_CODE_PERMISSION_DENIED };
      }

      if (e.message === _DEVICE_NOT_FOUND_ERROR) {
        throw { code: ERROR_CODE_DEVICE_NOT_FOUND };
      }

      throw e;
    }
  }

  async showVideo(videoFile) {
    const duration = await getVideoBlobDuration(videoFile);

    this.currentRecordedVideo.duration = Math.round(duration);
    this.mediaElement.ontimeupdate = this.handlePlayingVideoFrame.bind(this);

    this.mediaElement.removeAttribute("autoplay");

    if (typeof videoFile === "object") {
      this.mediaElement.src = URL.createObjectURL(videoFile);

      return;
    }

    this.mediaElement.src = videoFile;
  }

  async startRecording() {
    this.mediaRecorder = new CustomMediaRecorder(
      this.stream,
      this.maxMediaSize,
      this.onStop,
      this.onRecordingError,
      this.onMediaRecordTick
    );

    this.mediaRecorder.startRecording();

    this.onStartRecording();
  }

  async stopRecording() {
    this.stopStream();

    this.mediaElement.ontimeupdate = this.handlePlayingVideoFrame.bind(this);

    await this.showRecordedVideoPreview();
  }

  async resetVideoData() {
    this.mediaElement?.removeAttribute?.("src");
    if (this.mediaElement?.ontimeupdate) {
      this.mediaElement.ontimeupdate = null;
    }

    this.mediaRecorder && this.mediaRecorder.resetVideo();
    this.currentRecordedVideo = {};

    this.onResetVideoData();
  }

  stopStream() {
    this.stream?.getTracks?.().forEach((track) => track.stop());
  }

  async loadDevices(deviceKind) {
    const devices = await navigator.mediaDevices.enumerateDevices();

    return devices.filter((device) => device.kind === deviceKind);
  }

  async loadWebcams() {
    return await this.loadDevices(DEVICE_TYPE_WEB_CAM);
  }

  async loadMicrophones() {
    return await this.loadDevices(DEVICE_TYPE_MICROPHONE);
  }

  getDevices() {
    return this.devices;
  }

  setDevices(devices) {
    this.devices = devices;
  }

  async _getDefaultWebcam() {
    return await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
  }

  async _getDeviceStream(constraint) {
    return await navigator.mediaDevices.getUserMedia(constraint);
  }

  async getVideoDeviceStream(deviceId) {
    return await this._getDeviceStream({
      video: { deviceId },
      audio: true,
    });
  }

  async getAudioDeviceStream(deviceId) {
    return await this._getDeviceStream({
      video: false,
      audio: { deviceId },
    });
  }

  async showRecordedVideoPreview() {
    this.mediaElement.removeAttribute("autoplay");

    const videoData = new Blob(this.mediaRecorder.getVideo(), {
      type: DEFAULT_VIDEO_FORMAT,
    });

    this.currentRecordedVideo = {
      video: videoData,
      duration: Math.round(await getVideoBlobDuration(videoData)),
    };

    this.mediaElement.srcObject = null;
    this.mediaElement.src = URL.createObjectURL(
      this.currentRecordedVideo.video
    );
  }

  handlePlayingVideoFrame() {
    if (!this.mediaElement) {
      return;
    }

    const timeElapsed = Math.round(this.mediaElement.currentTime);

    const progressPercentage = Math.floor(
      (timeElapsed / this.currentRecordedVideo.duration) * 100
    );

    this.onPlayVideoFrame({
      progressPercentage,
      timeElapsed,
    });

    if (timeElapsed === this.currentRecordedVideo.duration) {
      this.onPlaybackFinished({ progressPercentage });
    }
  }

  async handleDeviceChange() {
    const newDeviceList = await this.loadDevices();

    if (!this.onDeviceChange) {
      this.devices = newDeviceList;

      return;
    }

    if (this.devices.length < newDeviceList.length) {
      const addedDevice = differenceBy(
        newDeviceList,
        this.devices,
        "deviceId"
      )[0];

      this.onDeviceChange({
        event: EVENT_ADD_DEVICE,
        device: addedDevice,
      });
    } else {
      const removedDevice = differenceBy(
        this.devices,
        newDeviceList,
        "deviceId"
      )[0];

      this.onDeviceChange({
        event: EVENT_REMOVE_DEVICE,
        device: removedDevice,
      });
    }

    this.devices = newDeviceList;
  }

  playVideo() {
    this.mediaElement?.play?.();
  }

  pauseVideo() {
    this.mediaElement?.pause?.();
  }

  getRecordedVideo() {
    return this.currentRecordedVideo.video;
  }

  async changeDevice(deviceId) {
    this.stopStream();

    await this.resetVideoData();
    await this.showWebcamPreview(deviceId);
  }

  async retake() {
    await this.resetVideoData();
    await this.showWebcamPreview();
    await this.startRecording();
  }

  async clearRecording() {
    await this.resetVideoData();
    await this.showWebcamPreview();
  }

  clear() {
    this.stopStream();
    navigator.mediaDevices.ondevicechange = null;

    if (this.mediaElement) {
      this.mediaElement.ontimeupdate = null;
      this.mediaElement.removeAttribute("src");
      this.mediaElement.srcObject = null;
    }

    this.mediaRecorder && this.mediaRecorder.clear();
  }
}

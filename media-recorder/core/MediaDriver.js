import { CustomMediaRecorder } from "./MediaRecorder";
import {
  getMediaBlobDuration,
  differenceBy,
  generateRandomString,
} from "./utils";
import {
  TAG_NAME_VIDEO,
  TAG_NAME_AUDIO,
  DEFAULT_VIDEO_FORMAT,
  DEVICE_TYPE_WEB_CAM,
  DEVICE_TYPE_MICROPHONE,
  EVENT_ADD_DEVICE,
  EVENT_REMOVE_DEVICE,
  ERROR_CODE_PERMISSION_DENIED,
  ERROR_CODE_DEVICE_NOT_FOUND,
  DEFAULT_VIDEO_EXTENSION,
  DEFAULT_AUDIO_EXTENSION,
} from "./consts";

const _PERMISSION_ERROR = "Permission denied";
const _DEVICE_NOT_FOUND_ERROR = "Requested device not found";

const DEFAULT_EXTENSIONS = {
  [TAG_NAME_VIDEO]: DEFAULT_VIDEO_EXTENSION,
  [TAG_NAME_AUDIO]: DEFAULT_AUDIO_EXTENSION,
};

class MediaDriver {
  constructor(
    mediaElement,
    maxMediaSize = 5,
    onStop = () => {},
    onRecordingError = () => {},
    onMediaRecordTick = () => {},
    onStartRecording = () => {},
    onResetMediaData = () => {},
    onPlayMediaFrame = () => {},
    onPlaybackFinished = () => {},
    onDeviceChange = () => {},
    onDeviceLoad = () => {}
  ) {
    if (!mediaElement) {
      throw new Error(
        "Provide a reference to a HTMLMediaElement (ex. <video /> or <audio/>) in order to use the API!"
      );
    }

    this.mediaElement = mediaElement;
    this.stream = null;
    this.mediaRecorder = null;
    this.currentRecordedMedia = {};
    this.devices = [];
    this.maxMediaSize = maxMediaSize;
    this.onStop = onStop;
    this.onRecordingError = onRecordingError;
    this.onMediaRecordTick = onMediaRecordTick;
    this.onStartRecording = onStartRecording;
    this.onResetMediaData = onResetMediaData;
    this.onPlayMediaFrame = onPlayMediaFrame;
    this.onPlaybackFinished = onPlaybackFinished;
    this.onDeviceChange = onDeviceChange;
    this.onDeviceLoad = onDeviceLoad;

    this.init();
  }

  init() {
    navigator.mediaDevices.ondevicechange = this.handleDeviceChange.bind(this);
    this.loadDevices();
  }

  async showMediaFile(mediaFile) {
    const duration = await getMediaBlobDuration(mediaFile);

    this.currentRecordedMedia.file = mediaFile;
    this.currentRecordedMedia.duration = Math.round(duration);
    this.mediaElement.ontimeupdate = this.handlePlayingMediaFrame.bind(this);

    this.mediaElement.removeAttribute("autoplay");

    if (typeof mediaFile === "object") {
      this.mediaElement.src = URL.createObjectURL(mediaFile);

      return;
    }

    this.mediaElement.src = mediaFile;
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

    this.mediaElement.ontimeupdate = this.handlePlayingMediaFrame.bind(this);

    await this.showRecordedMediaPreview();
  }

  async resetMediaData() {
    this.mediaElement?.removeAttribute?.("src");
    if (this.mediaElement?.ontimeupdate) {
      this.mediaElement.ontimeupdate = null;
    }

    this.mediaRecorder && this.mediaRecorder.resetRecordedMedia();
    this.currentRecordedMedia = {};

    this.onResetMediaData();
  }

  stopStream() {
    this.stream?.getTracks?.().forEach((track) => track.stop());
  }

  async loadDevices(deviceKind) {
    const devices = await navigator.mediaDevices.enumerateDevices();

    return devices.filter((device) => device.kind === deviceKind);
  }

  getDevices() {
    return this.devices;
  }

  setDevices(devices) {
    this.devices = devices;
  }

  async getDeviceStream(constraint) {
    return await navigator.mediaDevices.getUserMedia(constraint);
  }

  async showRecordedMediaPreview() {
    this.mediaElement.removeAttribute("autoplay");

    const mediaData = new Blob(this.mediaRecorder.getRecordedMedia(), {
      type: DEFAULT_VIDEO_FORMAT,
    });

    this.currentRecordedMedia = {
      file: mediaData,
      duration: Math.round(await getMediaBlobDuration(mediaData)),
    };

    this.mediaElement.srcObject = null;
    this.mediaElement.src = URL.createObjectURL(this.currentRecordedMedia.file);
  }

  handlePlayingMediaFrame() {
    if (!this.mediaElement) {
      return;
    }

    const timeElapsed = Math.round(this.mediaElement.currentTime);

    const progressPercentage = Math.floor(
      (timeElapsed / this.currentRecordedMedia.duration) * 100
    );

    this.onPlayMediaFrame({
      progressPercentage,
      timeElapsed,
    });

    if (timeElapsed === this.currentRecordedMedia.duration) {
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

  playMedia() {
    this.mediaElement?.play?.();
  }

  pauseMedia() {
    this.mediaElement?.pause?.();
  }

  getRecordedMedia() {
    return this.currentRecordedMedia.file;
  }

  async changeDevice(deviceId) {
    this.stopStream();

    await this.resetMediaData();
    await this.loadStream(deviceId);
  }

  async retake(deviceId) {
    await this.resetMediaData();
    await this.loadStream(deviceId);
    await this.startRecording();
  }

  async clearRecording() {
    await this.resetMediaData();
    await this.loadStream();
  }

  download() {
    const url = URL.createObjectURL(this.getRecordedMedia());
    const downloadLink = document.createElement("a");
    const fileName =
      generateRandomString() + DEFAULT_EXTENSIONS[this.mediaElement.tagName];

    document.body.appendChild(downloadLink);
    downloadLink.style = "display: none";
    downloadLink.href = url;
    downloadLink.download = fileName;
    downloadLink.click();

    window.URL.revokeObjectURL(url);
    downloadLink.remove();
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

class VideoDriver extends MediaDriver {
  constructor(...params) {
    super(...params);
  }

  async loadStream(deviceId) {
    try {
      this.clear();

      this.stream = await this.getVideoDeviceStream(deviceId);

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

  async getVideoDeviceStream(deviceId) {
    if (deviceId) {
      return await this.getDeviceStream({
        video: { deviceId },
        audio: true,
      });
    }

    return await this.getDeviceStream({
      video: true,
      audio: true,
    });
  }

  async loadDevices() {
    this.devices = await super.loadDevices(DEVICE_TYPE_WEB_CAM);

    this.onDeviceLoad?.(this.devices);
  }
}

class AudioDriver extends MediaDriver {
  constructor(...params) {
    super(...params);
  }

  async loadStream(deviceId) {
    try {
      this.clear();

      this.stream = await this.getAudioDeviceStream(deviceId);

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

  async getAudioDeviceStream(deviceId) {
    if (deviceId) {
      return await this.getDeviceStream({
        video: false,
        audio: { deviceId },
      });
    }

    return await this.getDeviceStream({
      video: false,
      audio: true,
    });
  }

  async loadDevices() {
    this.devices = await super.loadDevices(DEVICE_TYPE_MICROPHONE);

    this.onDeviceLoad?.(this.devices);
  }
}

export class MediaDriverFactory {
  static create(mediaElement, ...rest) {
    const elementType = mediaElement.tagName;

    switch (elementType) {
      case TAG_NAME_VIDEO:
        return new VideoDriver(mediaElement, ...rest);
      case TAG_NAME_AUDIO:
        return new AudioDriver(mediaElement, ...rest);
      default:
        return null;
    }
  }
}

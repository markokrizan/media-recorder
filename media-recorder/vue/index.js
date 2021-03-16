import { MediaDriverFactory } from "../core/MediaDriver";
import { getSecondsAsTimeString, mapPluggedOutDevice } from "../core/utils";
import { EVENT_REMOVE_DEVICE } from "../core/consts";

export default (mediaElementRefName, maxMediaSize) => ({
  data() {
    return {
      driver: null,
      devices: [],
      selectedDevice: null,
      isPreviewing: false,
      isRecording: false,
      recordingDuration: 0,
      playingMediaProgress: null,
      isPaused: false,
      isPlaying: false,
      isPlaybackAvailable: false,
    };
  },

  mounted() {
    const mediaElement = this.$refs[mediaElementRefName];

    this.driver = MediaDriverFactory.create(
      mediaElement,
      maxMediaSize,
      this._onStop,
      this._onRecordingError,
      this._onVideoRecordTick,
      this._onStartRecording,
      this._onResetMediaData,
      this._onPlayMediaFrame,
      this._onPlaybackFinished,
      this._onDeviceChange,
      this._onDeviceLoad
    );
  },

  beforeDestroy() {
    this.driver.clear();
  },

  methods: {
    _onStop() {
      this.stopRecording();

      this.isPlaybackAvailable = true;
    },

    _onRecordingError() {
      console.error("Recording error: ", e);
    },

    _onVideoRecordTick(currentVideoTimeElapsed) {
      this.recordingDuration = {
        seconds: currentVideoTimeElapsed,
        defaultRepresentation: getSecondsAsTimeString(currentVideoTimeElapsed),
      };
    },

    _onStartRecording() {
      this.isRecording = true;
      this.recordingDuration = 0;
    },

    _onResetMediaData() {
      this.isPlaying = false;
      this.isPaused = false;
      this.playingMediaProgress = null;
    },

    _onPlayMediaFrame({ progressPercentage, timeElapsed }) {
      this.playingMediaProgress = {
        progressPercentage,
        timeElapsed,
        defaultRepresentation: getSecondsAsTimeString(timeElapsed),
      };
    },

    _onPlaybackFinished({ progressPercentage }) {
      this.playingMediaProgress = {
        progressPercentage,
        timeElapsed: 0,
        defaultRepresentation: getSecondsAsTimeString(0),
      };

      this.isPaused = false;
      this.isPlaying = false;
    },

    async _onDeviceChange({ event, device }) {
      const newDevices = await this.driver.loadDevices();

      if (event === EVENT_REMOVE_DEVICE) {
        this.devices = mapPluggedOutDevice(this.devices, device);
      }

      this.devices = newDevices;
    },

    _onDeviceLoad(devices) {
      if (devices.length) {
        this.devices = devices;
        this.setSelectedDevice(devices[0].deviceId);
      }
    },

    loadStream() {
      this.isPreviewing = true;
      this.isPlaying = false;
      this.isPlaybackAvailable = false;

      this.driver.loadStream();
    },

    setSelectedDevice(deviceId) {
      this.selectedDevice = deviceId;
    },

    startRecording() {
      return this.driver.startRecording();
    },

    stopRecording() {
      if (!this.isRecording) {
        return;
      }

      this.isRecording = false;

      return this.driver.stopRecording();
    },

    playMedia() {
      this.driver.playMedia();
      this.isPaused = false;
      this.isPlaying = true;
    },

    pauseMedia() {
      this.driver.pauseMedia();
      this.isPaused = true;
      this.isPlaying = false;
    },

    getRecordedMedia() {
      return this.driver.getRecordedMedia();
    },

    changeDevice(deviceId) {
      this.setSelectedDevice(deviceId);

      return this.driver.changeDevice(deviceId);
    },

    retake(deviceId) {
      this.isPlaybackAvailable = false;

      return this.driver.retake(deviceId || this.selectedDevice);
    },

    clearRecording() {
      this.isPlaybackAvailable = false;

      return this.driver.clearRecording();
    },

    showVideoFile(mediaFile) {
      this.isPreviewing = true;
      this.isPlaybackAvailable = true;

      this.driver.showMediaFile(mediaFile);
    },

    download() {
      this.driver.download();
    },
  },
});

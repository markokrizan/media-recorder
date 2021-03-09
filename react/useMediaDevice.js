import { useEffect, useState } from "react";

import useSyncState from "./useSyncState";
import { EVENT_REMOVE_DEVICE } from "../core/consts";
import { WebcamDriver } from "../core/WebcamDriver";

let camDriver = null;

const mapPluggedOutDevice = (devices, pluggedOutDevice) => {
  return [...devices].map((device) => {
    if (device.deviceId === pluggedOutDevice.deviceId) {
      return {
        deviceId: device.deviceId,
        groupId: device.groupId,
        kind: device.kind,
        label: device.label,
        isPluggedOut: true,
      };
    }

    return device;
  });
};

export const useMediaDevice = (videoElement, maxVideoMessageSize = 100) => {
  const [isPreviewing, setIsPreviewing] = useSyncState(false);
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useSyncState();
  const [isRecording, setIsRecording] = useSyncState(false);
  const [recordingDuration, setRecordingDuration] = useSyncState(0);
  const [playingVideoProgress, setPlayingVideoProgress] = useState(null);
  const [isPaused, setIsPaused] = useSyncState(false);
  const [isPlaying, setIsPlaying] = useSyncState(false);
  const [playbackAvailable, setPlaybackAvailable] = useSyncState(false);

  const onStop = async () => {
    await stopRecording();
    await setPlaybackAvailable(true);
  };

  const onRecordingError = (e) => {
    console.error("Recording error: ", e);
  };

  const onPreviewError = async () => {
    await setIsPreviewing(false);
  };

  const onVideoRecordTick = async (currentVideoTimeElapsed) => {
    await setRecordingDuration(currentVideoTimeElapsed);
  };

  const onStartRecording = async () => {
    await setIsRecording(true);
    await setRecordingDuration(0);
  };

  const onResetVideoData = async () => {
    await setIsPlaying(false);
    await setIsPaused(false);
    await setPlayingVideoProgress(null);
  };

  const showWebcamPreview = async () => {
    await setIsPreviewing(true);

    await setIsPlaying(false);
    await setPlaybackAvailable(false);

    await camDriver.showWebcamPreview();
  };

  const showVideoFile = async (videoFile) => {
    await setIsPreviewing(true);

    await setPlaybackAvailable(true);

    await camDriver.showVideo(videoFile);
  };

  const onPlayVideoFrame = async ({ progressPercentage, timeElapsed }) => {
    setPlayingVideoProgress({
      progressPercentage,
      timeElapsed,
    });
  };

  const onPlaybackFinished = async ({ progressPercentage }) => {
    setPlayingVideoProgress({
      progressPercentage,
      currentPlayingVideoTimeElapsed: 0,
    });

    await setIsPaused(false);
    await setIsPlaying(false);
  };

  const onDeviceChange = async ({ event, device }) => {
    const newDevices = await camDriver.loadDevices();

    if (event === EVENT_REMOVE_DEVICE) {
      return setDevices((previousDevices) =>
        mapPluggedOutDevice(previousDevices, device)
      );
    }

    setDevices(newDevices);
  };

  useEffect(() => {
    camDriver = new WebcamDriver(
      videoElement,
      maxVideoMessageSize,
      onStop,
      onRecordingError,
      onPreviewError,
      onVideoRecordTick,
      onStartRecording,
      onResetVideoData,
      onPlayVideoFrame,
      onPlaybackFinished,
      onDeviceChange
    );

    const initDevices = async () => {
      const devices = await camDriver.loadDevices();

      if (devices.length) {
        camDriver.setDevices(devices);
        await setDevices(devices);
        await setSelectedDevice(devices[0].deviceId);
      }
    };

    initDevices();

    return () => {
      camDriver && camDriver.clear();
    };
  }, []);

  const startRecording = async () => {
    return camDriver.startRecording();
  };

  const stopRecording = async () => {
    if (!isRecording) {
      return;
    }

    await setIsRecording(false);
    return camDriver.stopRecording();
  };

  const playVideo = async () => {
    camDriver.playVideo();
    await setIsPaused(false);
    await setIsPlaying(true);
  };

  const pauseVideo = async () => {
    camDriver.pauseVideo();
    await setIsPlaying(false);
    await setIsPaused(true);
  };

  const getRecordedVideo = () => {
    return camDriver.getRecordedVideo();
  };

  const changeDevice = async () => {
    return await camDriver.changeDevice(selectedDevice);
  };

  const retake = async () => {
    await setPlaybackAvailable(false);

    return await camDriver.retake();
  };

  const clearRecording = async () => {
    await setPlaybackAvailable(false);

    return await camDriver.clearRecording();
  };

  return {
    showWebcamPreview,
    isPreviewing,
    devices,
    selectedDevice,
    setSelectedDevice,
    startRecording,
    stopRecording,
    playVideo,
    isRecording,
    recordingDuration,
    playingVideoProgress,
    playbackAvailable,
    pauseVideo,
    isPaused,
    isPlaying,
    getRecordedVideo,
    changeDevice,
    retake,
    clearRecording,
    showVideoFile,
  };
};

import { useEffect, useState } from "react";

import useSyncState from "./useSyncState";
import { EVENT_REMOVE_DEVICE } from "../core/consts";
import { MediaDriver } from "../core/MediaDriver";
import { getSecondsAsTimeString, mapPluggedOutDevice } from "../core/utils";

let camDriver = null;

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

  const onVideoRecordTick = async (currentVideoTimeElapsed) => {
    await setRecordingDuration({
      seconds: currentVideoTimeElapsed,
      defaultRepresentation: getSecondsAsTimeString(currentVideoTimeElapsed),
    });
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
      defaultRepresentation: getSecondsAsTimeString(timeElapsed),
    });
  };

  const onPlaybackFinished = async ({ progressPercentage }) => {
    setPlayingVideoProgress({
      progressPercentage,
      timeElapsed: 0,
      defaultRepresentation: getSecondsAsTimeString(0),
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
    if (videoElement) {
      camDriver = new MediaDriver(
        videoElement,
        maxVideoMessageSize,
        onStop,
        onRecordingError,
        onVideoRecordTick,
        onStartRecording,
        onResetVideoData,
        onPlayVideoFrame,
        onPlaybackFinished,
        onDeviceChange
      );

      const initDevices = async () => {
        const devices = await camDriver.loadWebcams();

        if (devices.length) {
          camDriver.setDevices(devices);
          await setDevices(devices);
          await setSelectedDevice(devices[0].deviceId);
        }
      };

      initDevices();
    }

    return () => {
      camDriver && camDriver.clear();
    };
  }, [videoElement]);

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

  const changeDevice = async (deviceId) => {
    await setSelectedDevice(deviceId);

    return await camDriver?.changeDevice?.(deviceId);
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

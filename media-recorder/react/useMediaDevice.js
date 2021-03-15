import { useEffect, useState, useRef } from "react";

import useSyncState from "./useSyncState";
import { EVENT_REMOVE_DEVICE } from "../core/consts";
import { MediaDriver } from "../core/MediaDriver";
import { getSecondsAsTimeString, mapPluggedOutDevice } from "../core/utils";

export const useMediaDevice = (mediaElement, maxRecordedFileSize = 100) => {
  let camDriver = useRef(null);

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

  const loadStream = async () => {
    await setIsPreviewing(true);

    await setIsPlaying(false);
    await setPlaybackAvailable(false);

    await camDriver.current.loadStream();
  };

  const showVideoFile = async (videoFile) => {
    await setIsPreviewing(true);

    await setPlaybackAvailable(true);

    await camDriver.current.showVideo(videoFile);
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
    const newDevices = await camDriver.current.loadDevices();

    if (event === EVENT_REMOVE_DEVICE) {
      return setDevices((previousDevices) =>
        mapPluggedOutDevice(previousDevices, device)
      );
    }

    setDevices(newDevices);
  };

  const onDeviceLoad = async (devices) => {
    if (devices.length) {
      await setDevices(devices);
      await setSelectedDevice(devices[0].deviceId);
    }
  };

  useEffect(() => {
    if (mediaElement) {
      camDriver.current = new MediaDriver(
        mediaElement,
        maxRecordedFileSize,
        onStop,
        onRecordingError,
        onVideoRecordTick,
        onStartRecording,
        onResetVideoData,
        onPlayVideoFrame,
        onPlaybackFinished,
        onDeviceChange,
        onDeviceLoad
      );
    }

    return () => {
      camDriver.current && camDriver.current.clear();
    };
  }, [mediaElement]);

  const startRecording = async () => {
    return camDriver.current.startRecording();
  };

  const stopRecording = async () => {
    if (!isRecording) {
      return;
    }

    await setIsRecording(false);
    return camDriver.current.stopRecording();
  };

  const playVideo = async () => {
    camDriver.current.playVideo();
    await setIsPaused(false);
    await setIsPlaying(true);
  };

  const pauseVideo = async () => {
    camDriver.current.pauseVideo();
    await setIsPlaying(false);
    await setIsPaused(true);
  };

  const getRecordedVideo = () => {
    return camDriver.current.getRecordedVideo();
  };

  const changeDevice = async (deviceId) => {
    await setSelectedDevice(deviceId);

    return await camDriver.current?.changeDevice?.(deviceId);
  };

  const retake = async (deviceId) => {
    await setPlaybackAvailable(false);

    return await camDriver.current.retake(deviceId || selectedDevice);
  };

  const clearRecording = async () => {
    await setPlaybackAvailable(false);

    return await camDriver.current.clearRecording();
  };

  const download = () => {
    return camDriver.current.download();
  };

  return {
    loadStream,
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
    download,
  };
};

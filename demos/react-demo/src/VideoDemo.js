import { useState, useCallback } from "react";
import { mediaRecorderReact } from "media-recorder/dist/react";

function VideoDemo() {
  const [videoElement, setVideoElement] = useState(null);
  const videoElementRef = useCallback((node) => {
    if (node !== null) {
      setVideoElement(node);
    }
  }, []);

  const {
    loadStream,
    isPreviewing,
    devices,
    selectedDevice,
    startRecording,
    stopRecording,
    playMedia,
    isRecording,
    recordingDuration,
    playingMediaProgress,
    playbackAvailable,
    pauseMedia,
    isPlaying,
    changeDevice,
    retake,
    clearRecording,
    showVideoFile,
    download,
  } = mediaRecorderReact.useMediaDevice(videoElement);

  return (
    <>
      <p>Video demo:</p>
      <video ref={videoElementRef} autoPlay={true} className="media-element" />
      <div className="video-controls-container ">
        {!isPreviewing && (
          <>
            <button onClick={loadStream}>Load stream</button>
            Load video file:
            <input
              type="file"
              onChange={(e) => showVideoFile(e.target.files[0])}
            />
          </>
        )}
        {!isRecording && isPreviewing && !playbackAvailable && (
          <>
            <select
              value={selectedDevice?.deviceId || null}
              onChange={(e) => changeDevice(e.target.value)}
            >
              {devices.map((device) => (
                <option value={device.deviceId}>{device.label}</option>
              ))}
            </select>
            <button onClick={startRecording}>Start recording</button>
          </>
        )}
        {isRecording && (
          <span>
            Recording duration: {recordingDuration?.seconds} (
            {recordingDuration?.defaultRepresentation})
          </span>
        )}
        {isRecording && <button onClick={stopRecording}>Stop recording</button>}
        {playbackAvailable && (
          <>
            {!isPlaying && (
              <>
                <button onClick={playMedia}>Play video</button>
                <button onClick={() => retake()}>Retake</button>
                <button onClick={download}>Download</button>
                <button onClick={clearRecording}>Clear recording</button>
              </>
            )}
            {isPlaying && <button onClick={pauseMedia}>Pause video</button>}
            <span>
              Playback duration: {playingMediaProgress?.seconds} (
              {playingMediaProgress?.defaultRepresentation}) (
              {playingMediaProgress?.progressPercentage} %)
            </span>
          </>
        )}
      </div>
    </>
  );
}

export default VideoDemo;

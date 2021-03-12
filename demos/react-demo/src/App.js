import { useState, useCallback } from "react";
import { mediaRecorderReact } from "media-recorder/dist/react";
import "./App.css";

function App() {
  const [videoElement, setVideoElement] = useState(null);
  const videoElementRef = useCallback((node) => {
    if (node !== null) {
      setVideoElement(node);
    }
  }, []);

  const {
    showWebcamPreview,
    isPreviewing,
    devices,
    selectedDevice,
    startRecording,
    stopRecording,
    playVideo,
    isRecording,
    recordingDuration,
    playingVideoProgress,
    playbackAvailable,
    pauseVideo,
    isPlaying,
    changeDevice,
    retake,
    clearRecording,
    showVideoFile,
    download,
  } = mediaRecorderReact.useMediaDevice(videoElement);

  return (
    <div className="App">
      <p>Video demo:</p>
      <video ref={videoElementRef} autoPlay={true} className="video" />
      <div className="video-controls-container ">
        {!isPreviewing && (
          <>
            <button onClick={showWebcamPreview}>Show webcam preview</button>
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
                <button onClick={playVideo}>Play video</button>
                <button onClick={() => retake()}>Retake</button>
                <button onClick={download}>Download</button>
                <button onClick={clearRecording}>Clear recording</button>
              </>
            )}
            {isPlaying && <button onClick={pauseVideo}>Pause video</button>}
            <span>
              Playback duration: {playingVideoProgress?.seconds} (
              {playingVideoProgress?.defaultRepresentation}) (
              {playingVideoProgress?.progressPercentage} %)
            </span>
          </>
        )}
      </div>
    </div>
  );
}

export default App;

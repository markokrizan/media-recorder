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
    changeDevice,
    retake,
    getRecordedVideo,
    clearRecording,
    showVideoFile,
  } = mediaRecorderReact.useMediaDevice(videoElement);

  return (
    <div className="App">
      <p>Video demo:</p>
      <video ref={videoElementRef} autoPlay={true} />
      <div className="video-controls-container ">
        <button onClick={showWebcamPreview}>Show webcam preview</button>
        {!isRecording && (
          <button onClick={startRecording}>Start recording</button>
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
            {!isPlaying && <button onClick={playVideo}>Play video</button>}
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

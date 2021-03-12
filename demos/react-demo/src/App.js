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
      <div>
        <button onClick={showWebcamPreview}>show webcam preview</button>
        <button onClick={startRecording}>start recording</button>
        <span>Recording duration: {recordingDuration}</span>
        <button onClick={stopRecording}>stopRecording</button>
      </div>
    </div>
  );
}

export default App;

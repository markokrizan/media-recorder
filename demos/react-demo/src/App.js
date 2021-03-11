import { useRef } from 'react';
import { useMediaDevice } from "media-recorder/dist/react";

import "./App.css";

function App() {
  const videoElementRef = useRef(null);
  const {
    showPreview,
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
  } = useMediaDevice(videoElementRef.current);

  return <div className="App">
    <p>Video demo:</p>
    <video ref={videoElementRef} autoPlay={true}/>
    <button onClick={showPreview}>show preview</button>
  </div>;
}

export default App;

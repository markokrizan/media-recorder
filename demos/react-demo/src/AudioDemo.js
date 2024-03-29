import { useState, useCallback } from "react";
import { mediaRecorderReact } from "media-recorder/dist/react";

function AudioDemo() {
  const [audioElement, setAudioElement] = useState(null);
  const audioElementRef = useCallback((node) => {
    if (node !== null) {
      setAudioElement(node);
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
  } = mediaRecorderReact.useMediaDevice(audioElement);

  return (
    <>
      <p>Audio demo:</p>
      <audio ref={audioElementRef} autoPlay={true} className="media-element" />
      <div className="video-controls-container ">
        {!isPreviewing && (
          <>
            <button onClick={loadStream}>Load stream</button>
            Load audio file:
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
                <button onClick={playMedia}>Play audio</button>
                <button onClick={() => retake()}>Retake</button>
                <button onClick={download}>Download</button>
                <button onClick={clearRecording}>Clear recording</button>
              </>
            )}
            {isPlaying && <button onClick={pauseMedia}>Pause audio</button>}
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

export default AudioDemo;

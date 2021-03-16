<template>
  <div>
    <p>Video demo</p>
    <video ref="video-element" :autoplay="true" class="media-element" />
    <div className="video-controls-container ">
      <div v-if="!isPreviewing">
        <button @click="loadStream">Load stream</button>
        Load video file:
        <input type="file" @change="(e) => showVideoFile(e.target.files[0])" />
      </div>
      <div v-if="!isRecording && isPreviewing && !playbackAvailable">
        <select
          :value="selectedDevice.deviceId || null"
          @change="(e) => changeDevice(e.target.value)"
        >
          {devices.map((device) => (
          <option value="{device.deviceId}">{device.label}</option>
          ))}
        </select>
        <button onClick="{startRecording}">Start recording</button>
      </div>
      <span v-if="isRecording">
        Recording duration: {{ recordingDuration.seconds }} (
        {{ recordingDuration.defaultRepresentation }})
      </span>
      <button v-if="isRecording" @click="stopRecording">Stop recording</button>
      <div v-if="isPlaybackAvailable">
        <div v-if="!isPlaying">
          <button @click="playMedia">Play video</button>
          <button @click="() => retake()">Retake</button>
          <button @click="download">Download</button>
          <button @click="clearRecording">Clear recording</button>
        </div>
        <button v-if="isPlaying" @click="pauseMedia">Pause video</button>
        <span>
          Playback duration: {{ playingMediaProgress.seconds }} ({{
            playingMediaProgress.defaultRepresentation
          }}) ({{ playingMediaProgress.progressPercentage }} %)
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import { mediaRecorderVue } from "media-recorder/dist/vue";

export default {
  name: "VideoDemo",
  mixins: [mediaRecorderVue.default],
};
</script>

<template>
  <div>
    <p>Audio demo</p>
    <audio ref="audio-element" :autoplay="true" class="media-element" />
    <div className="video-controls-container ">
      <div v-if="!isPreviewing">
        <button @click="loadStream">Load stream</button>
        Load audio file:
        <input type="file" @change="(e) => showVideoFile(e.target.files[0])" />
      </div>
      <div v-if="!isRecording && isPreviewing && !isPlaybackAvailable">
        <select
          :value="selectedDevice || null"
          @change="(e) => changeDevice(e.target.value)"
        >
          <option
            :key="device.deviceId"
            v-for="device in devices"
            :value="device.deviceId"
            :selected="device.deviceId === selectedDevice"
            >{{ device.label }}</option
          >
        </select>
        <button @click="startRecording">Start recording</button>
      </div>
      <span v-if="isRecording">
        Recording duration:
        {{ recordingDuration && recordingDuration.seconds }} (
        {{ recordingDuration.defaultRepresentation }})
      </span>
      <button v-if="isRecording" @click="stopRecording">Stop recording</button>
      <div v-if="isPlaybackAvailable">
        <div v-if="!isPlaying">
          <button @click="playMedia">Play audio</button>
          <button @click="() => retake()">Retake</button>
          <button @click="download">Download</button>
          <button @click="clearRecording">Clear recording</button>
        </div>
        <button v-if="isPlaying" @click="pauseMedia">Pause audio</button>
        <span>
          Playback duration:
          {{ playingMediaProgress && playingMediaProgress.seconds }} ({{
            playingMediaProgress && playingMediaProgress.defaultRepresentation
          }}) ({{
            playingMediaProgress && playingMediaProgress.progressPercentage
          }}
          %)
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import { mediaRecorderVue } from "media-recorder/dist/vue";

export default {
  name: "AudioDemo",
  mixins: [mediaRecorderVue.mediaRecorderMixin("audio-element", 100)],
};
</script>

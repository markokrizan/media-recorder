<template>
  <div id="app" class="App">
    <VideoDemo />
    <AudioDemo />
  </div>
</template>

<script>
import VideoDemo from './components/VideoDemo.vue'
import AudioDemo from './components/AudioDemo.vue'

export default {
  name: 'App',
  components: {
    VideoDemo,
    AudioDemo
  }
}
</script>

<style>
.App {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.video-controls-container {
  display: flex;
  flex-direction: column;
  width: 20%;
}

.media-element {
  border: 1px solid black;
}
</style>

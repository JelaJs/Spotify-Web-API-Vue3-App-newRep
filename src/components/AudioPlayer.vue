<template>
  <div class="audio-player">
    <p v-if="player.currentSong" class="player-songName">{{ player.currentSong }}</p>
    <div class="command-wrap">
      <button @click="skipToPrevSong" :disabled="!player.currentSong">
        <svg xmlns="http://www.w3.org/2000/svg" height="16" width="10" viewBox="0 0 320 512">
          <path
            fill="#ffffff"
            d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l192 192c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256 246.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-192 192z"
          />
        </svg>
      </button>
      <div class="play-stop-wrap">
        <button v-if="!player.isPlaying" :disabled="!player.currentSong" @click="resume">
          <svg xmlns="http://www.w3.org/2000/svg" height="16" width="12" viewBox="0 0 384 512">
            <path
              fill="#ffffff"
              d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80V432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z"
            />
          </svg>
        </button>
        <button v-if="player.isPlaying" @click="pause">
          <svg xmlns="http://www.w3.org/2000/svg" height="16" width="10" viewBox="0 0 320 512">
            <path
              fill="#ffffff"
              d="M48 64C21.5 64 0 85.5 0 112V400c0 26.5 21.5 48 48 48H80c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H48zm192 0c-26.5 0-48 21.5-48 48V400c0 26.5 21.5 48 48 48h32c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H240z"
            />
          </svg>
        </button>
      </div>
      <button @click="skipToNextSong" :disabled="!player.currentSong">
        <svg xmlns="http://www.w3.org/2000/svg" height="16" width="10" viewBox="0 0 320 512">
          <path
            fill="#ffffff"
            d="M310.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256 73.4 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z"
          />
        </svg>
      </button>
    </div>
    <div class="duration-volume-wrap">
      <div class="song-duration-wrap">
        <p>{{ formatTime(player.currentPosition) }}</p>
        <input
          v-model="player.currentPosition"
          type="range"
          :max="player.trackDuration"
          @change="seekToPosition"
        />
        <p>{{ formatTime(player.trackDuration) }}</p>
      </div>
      <div class="volume-wrap">
        <svg xmlns="http://www.w3.org/2000/svg" height="16" width="14" viewBox="0 0 448 512">
          <path
            fill="#ffffff"
            d="M301.1 34.8C312.6 40 320 51.4 320 64V448c0 12.6-7.4 24-18.9 29.2s-25 3.1-34.4-5.3L131.8 352H64c-35.3 0-64-28.7-64-64V224c0-35.3 28.7-64 64-64h67.8L266.7 40.1c9.4-8.4 22.9-10.4 34.4-5.3zM412.6 181.5C434.1 199.1 448 225.9 448 256s-13.9 56.9-35.4 74.5c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C393.1 284.4 400 271 400 256s-6.9-28.4-17.7-37.3c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5z"
          />
        </svg>
        <input
          v-model="player.curVolume"
          @change="changeVolume"
          :max="player.maxVolume"
          class="volume-range"
          type="range"
        />
      </div>
      <!-- <div v-if="activeDevices.length > 0" class="deviceSelect-wrap">
        <label>D:</label>
        <select v-model="player.selectedDevice" id="device-select">
          <option v-for="device in activeDevices" :key="device.id">
            {{ device.id }}
          </option>
        </select>
      </div>-->
    </div>
  </div>
</template>

<script setup>
import { defineProps, onMounted } from 'vue'
import { usePLayerStore } from '../stores/player'

const props = defineProps(['checkAndRefreshAccessToken'])
const player = usePLayerStore()
//const activeDevices = ref([])

const pause = async () => {
  await props.checkAndRefreshAccessToken()
  await player.pause()
}

const resume = async () => {
  await props.checkAndRefreshAccessToken()
  await player.resumeSong()
}

const skipToNextSong = async () => {
  await props.checkAndRefreshAccessToken()
  await player.skipToNext()
}

const skipToPrevSong = async () => {
  await props.checkAndRefreshAccessToken()
  await player.skipToPrev()
}

const seekToPosition = async () => {
  //await props.checkAndRefreshAccessToken()
  await player.seekToPosition()
}

// Formatiranje vremena u format "mm:ss"
const formatTime = (milliseconds) => {
  const seconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
}

const changeVolume = async () => {
  await props.checkAndRefreshAccessToken()
  await player.setVolume(player.curVolume)
}

onMounted(async () => {
  //player.checkActiveDevice()
  //activeDevices.value = await player.getActiveDevice()
  //console.log(activeDevices.value)
  player.pause()
})
</script>

<style scoped>
.audio-player {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 120px;
  background-color: #080808;
  border-top: 1px solid #ffffff23;
  padding: 20px 40px;
  z-index: 999;
}

.audio-player .player-songName {
  text-align: center;
  margin-bottom: 10px;
}

.audio-player .command-wrap {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
}

.audio-player .command-wrap button {
  border: none;
  background-color: transparent;
}

.audio-player .command-wrap svg {
  cursor: pointer;
  width: 20px;
  height: 20px;
}

.audio-player .song-duration-wrap {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
  gap: 10px;
}

.audio-player .song-duration-wrap input {
  width: 50%;
}

.audio-player .duration-volume-wrap {
  position: relative;
}

.audio-player .volume-wrap {
  position: absolute;
  top: 0;
  left: 0;
}

.audio-player .volume-wrap .volume-range {
  margin-left: 10px;
}

.audio-player .duration-volume-wrap .deviceSelect-wrap {
  position: absolute;
  top: 0;
  right: 0;
}

.audio-player .duration-volume-wrap .deviceSelect-wrap #device-select {
  border: none;
  background: transparent;
  width: 50px;
  outline: none;
  color: white;
}

.audio-player .duration-volume-wrap .deviceSelect-wrap #device-select option {
  color: black;
}

/*Responsive */
@media (max-width: 915px) {
  .audio-player .volume-wrap .volume-range {
    transform: rotate(-90deg);
    width: 70px;
    position: absolute;
    top: -32px;
    left: -39px;
  }

  .audio-player .volume-wrap svg {
    position: absolute;
    top: 15px;
  }
}

@media (max-width: 740px) {
  .audio-player .volume-wrap {
    display: none;
  }
  .audio-player .duration-volume-wrap .deviceSelect-wrap #device-select {
    width: 20px;
  }
}

@media (max-width: 470px) {
  .audio-player .song-duration-wrap input {
    width: 50%;
  }

  .audio-player .song-duration-wrap p {
    font-size: 14px;
  }
}
</style>

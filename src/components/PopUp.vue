<template>
  <div class="overlay">
    <div class="content-wrap">
      <slot />
      <div class="btn-wrap">
        <button @click="player.playSongError = flase">Close</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { usePLayerStore } from '../stores/player'
const player = usePLayerStore()
</script>

<style scoped>
.overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  background-color: #000000d0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.overlay .content-wrap {
  padding: 30px 40px;
  background-color: white;
  color: #000;
}

.overlay .content-wrap .btn-wrap {
  text-align: center;
}

.overlay .content-wrap .btn-wrap button {
  border: none;
  outline: none;
  background-color: #131313;
  color: white;
  font-size: 18px;
  padding: 10px 15px;
  border-radius: 10px;
  cursor: pointer;
  margin-top: 20px;
}
</style>

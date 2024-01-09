<template>
  <div class="playlist-options">
    <div class="content-wrap">
      <label>Select playlist: (after select click again "+" to add a song)</label>
      <select v-model="playlist.selectedPlaylist" id="selectInput">
        <option v-for="singlePlaylist in playlist.customPlayLists[0]" :key="singlePlaylist.id">
          Name: {{ singlePlaylist.name }} ; <label class="id">id: {{ singlePlaylist.id }}</label>
        </option>
      </select>
      <button @click="$emit('toggleComp')">Select</button>
    </div>
  </div>
</template>

<script setup>
import { useCustomPlaylist } from '../stores/CustomPlaylist'
const playlist = useCustomPlaylist()
</script>

<style scoped>
.playlist-options {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100vh;
  background-color: #000000b9;
  display: flex;
  align-items: center;
  justify-content: center;
}

.playlist-options .content-wrap {
  background-color: #fff;
  color: #000;
  padding: 10px 20px;
}

.playlist-options .content-wrap label {
  margin-right: 10px;
}

.playlist-options .content-wrap option .id {
  opacity: 0;
}

.playlist-options .content-wrap button {
  border: none;
  outline: none;
  background-color: #000000c9;
  color: #fff;
  padding: 5px 10px;
  margin-left: 10px;
  cursor: pointer;
  border-radius: 5px;
}

@media (max-width: 940px) {
  .playlist-options .content-wrap label {
    display: block;
    margin-bottom: 10px;
  }
}

@media (max-width: 525px) {
  .playlist-options {
    flex-direction: column;
  }

  .playlist-options .content-wrap label {
    font-size: 12px;
  }
}

@media (max-width: 436px) {
  .playlist-options .content-wrap button {
    margin-left: 0;
    margin-right: 10px;
    margin-top: 20px;
  }
}
</style>

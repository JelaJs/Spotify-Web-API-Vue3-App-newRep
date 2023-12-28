<template>
  <div>
    <div class="custom-header">
      <div v-if="playlist.singleCustomPlaylist">
        <p class="preheading">Playlist</p>
        <h1>{{ playlist.singleCustomPlaylist.name }}</h1>
      </div>

      <div v-if="playlist.songsLoaded">
        <p>
          <span class="playlist-size">{{ playlist.customPlaylistSongs.tracks.items.length }}</span>
          {{ playlist.customPlaylistSongs.tracks.items.length === 1 ? 'song' : 'songs' }}
        </p>
      </div>
      <button class="btnDeletePlaylist" @click="deleteCurrentPlaylist(id)">Delete playlist</button>
    </div>

    <div class="custom-playlist" v-if="playlist.songsLoaded">
      <div
        class="custom-playlist-item"
        v-for="song in playlist.customPlaylistSongs.tracks.items"
        :key="song.track.id"
        @click="
          playSong(
            song,
            song.track.uri,
            playlist.singleCustomPlaylist.uri,
            playlist.customPlaylistSongs.tracks.items
          )
        "
      >
        <div class="img-info-flex">
          <img
            class="custom-song-img"
            :src="song.track.album.images[2].url"
            alt="Song cover image"
          />
          <div class="song-artist-wrap">
            <p class="song-name">{{ song.track.name }}</p>
            <p class="artist-name">{{ song.track.artists[0].name }}</p>
          </div>
        </div>
        <div class="time-del-flex">
          <p>{{ formatTime(song.track.duration_ms) }}</p>
          <button @click.stop="deleteSongFromCustomPlaylist(song.track.id, id)">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import { ref, watch, onMounted, inject } from 'vue'
import { useCustomPlaylist } from '../stores/CustomPlaylist'
import { usePLayerStore } from '../stores/player'

const route = useRoute()
const router = useRouter()
const playlist = useCustomPlaylist()
const player = usePLayerStore()
const id = ref(route.params.id)
const checkAndRefreshAccessToken = inject('checkAndRefreshAccessToken')

const formatTime = (milliseconds) => {
  const seconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
}

const deleteSongFromCustomPlaylist = async (trackId, playlistId) => {
  await checkAndRefreshAccessToken()

  try {
    await playlist.deleteSongFromPlaylist(trackId, playlistId)

    playlist.getSongFromCustomPlaylist(id.value)
  } catch (error) {
    console.error('Greška prilikom brisanja pesme iz playliste:', error)
  }
}

const deleteCurrentPlaylist = async (playlistId) => {
  await checkAndRefreshAccessToken()
  await playlist.deleteCustomPlaylist(playlistId).then(router.push('/'))
}

const playSong = async (track, uri, playlistUri, playlist) => {
  await checkAndRefreshAccessToken()
  await player.playSong(track, uri, playlistUri, playlist)
}

watch(
  () => route.params.id,
  async (newId) => {
    id.value = newId
    await playlist.getSongFromCustomPlaylist(id.value)
    await playlist.getSingleCustomPlaylist(id.value)
  }
)

onMounted(async () => {
  await playlist.getSongFromCustomPlaylist(id.value)
  await playlist.getSingleCustomPlaylist(id.value)
  //console.log('OnMOunted log:', playlist.customPlaylistSongs.tracks.items)
})
</script>

<style scoped>
.custom-header {
  padding: 20px 10px 30px 10px;
  background-color: #181818;
  border-bottom: 2px solid #1d1d1d;
  margin-bottom: 30px;
}

.custom-header .preheading {
  font-weight: 400;
  font-size: 10px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: #ffffffb4;
}

.custom-header h1 {
  font-size: 48px;
  margin-bottom: 10px;
}

.custom-header .btnDeletePlaylist {
  border: none;
  background-color: transparent;
  outline: none;
  color: rgb(212, 16, 16);
  cursor: pointer;
  margin-top: 40px;
  font-size: 18px;
  transition: all 0.3s;
}

.custom-header .btnDeletePlaylist:hover {
  color: rgb(161, 9, 9);
}

.custom-playlist {
  display: flex;
  gap: 10px;
}

.custom-header p .playlist-size {
  font-size: 18px;
}

.img-info-flex {
  display: flex;
  gap: 10px;
  align-items: center;
}

.img-info-flex img {
  border-radius: 10px;
}

.custom-playlist {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.custom-playlist .custom-playlist-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #1b1b1b;
  padding: 10px 20px;
  cursor: pointer;
  border-radius: 10px;
  transition: all 0.3s;
}

.custom-playlist .custom-playlist-item .time-del-flex {
  display: flex;
  align-items: center;
  gap: 10px;
}

.custom-playlist .custom-playlist-item .time-del-flex button {
  cursor: pointer;
  background-color: transparent;
  border: none;
  outline: none;
  color: rgb(202, 24, 24);
}

.custom-playlist .custom-playlist-item:hover {
  background-color: #222222;
}

.custom-playlist .custom-playlist-item .img-info-flex .song-artist-wrap .artist-name {
  font-size: 12px;
  color: #ffffffb4;
}

/*Responsive*/
@media (max-width: 1400px) {
  .custom-header h1 {
    font-size: 38px;
  }
}

@media (max-width: 740px) {
  .custom-header h1 {
    font-size: 24px;
  }
}

@media (max-width: 525px) {
  .time-del-flex p {
    display: none;
  }

  .img-info-flex img {
    width: 50px;
    height: 50px;
  }
}
</style>

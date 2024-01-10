<template>
  <div v-if="singleCategory" class="singleCategory-header">
    <h1>{{ singleCategory.name }}</h1>
    <img :src="singleCategory.icons[0].url" alt="Category image" />
  </div>
  <p v-if="error">Something went wrong, try again later</p>
  <div v-if="singleCategoryTrackItems" class="playlist-wrap">
    <ul class="playlist">
      <li
        v-for="track in singleCategoryTrackItems"
        :key="track.track.album.id"
        class="playlist-item"
        @click="playSong(track, track.track.uri, playListUri, singleCategoryTrackItems)"
      >
        <div class="img-p-wrap">
          <img :src="track.track.album.images[2].url" alt="Track image" />
          <p>{{ track.track.name.substring(0, 40) }}</p>
        </div>
        <div class="artist-btn-wrap">
          <div class="artists-wrap" v-for="artist in track.track.artists" :key="artist.id">
            <p>{{ artist.name }}</p>
          </div>
          <div class="button-inner-wrap">
            <button class="addToCustomPLayListbtn" @click.stop="addTrackToPlaylist(track)">
              +
            </button>
            <div class="btn-message-wrap">
              <p>Click first to select playlist, then click again to add a song</p>
            </div>
          </div>
          <p class="addedMessage" v-if="playlist.added">Song Added</p>
        </div>
      </li>
    </ul>
  </div>
  <PopUp v-if="player.playSongError"
    ><p>
      Maybe your device is not active. Check your active device on your original Spotify (Bottom
      Right Corner), or play a random song to activate the device.
    </p></PopUp
  >
  <PlaylistOtions v-if="optionToggler" @toggleComp="toggle()" />
</template>

<script setup>
import { inject, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
const route = useRoute()
const checkAndRefreshAccessToken = inject('checkAndRefreshAccessToken')
const accessToken = ref(localStorage.getItem('access_token') || null)
const singleCategory = ref(null)
const singleCategoryTracksId = ref(null)
const singleCategoryTrack = ref(null)
const singleCategoryTrackItems = ref(null)
const error = ref(false)
const playListUri = ref(null)
const optionToggler = ref(false)
const addTimeout = ref(null)

import { usePLayerStore } from '../stores/player'
import PopUp from '../components/PopUp.vue'
import PlaylistOtions from '../components/PlaylistOtions.vue'
import { useCustomPlaylist } from '../stores/CustomPlaylist'

const player = usePLayerStore()
const playlist = useCustomPlaylist()

const id = route.params.id

const getSingleCategory = async () => {
  await checkAndRefreshAccessToken()

  try {
    const response = await fetch(`https://api.spotify.com/v1/browse/categories/${id}?limit=20`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken.value}`
      }
    })

    if (response.ok) {
      const data = await response.json()
      singleCategory.value = data
      //console.log(singleCategory.value)

      getCategoryPlaylist()
    } else {
      error.value = true
      throw new Error(`Error: ${response.status}`)
    }
  } catch (error) {
    console.error(error)
    error.value = true
  }
}

const getCategoryPlaylist = async () => {
  //await checkAndRefreshAccessToken()

  try {
    const response = await fetch(
      `https://api.spotify.com/v1/browse/categories/${id}/playlists?limit=20`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken.value}`
        }
      }
    )

    if (response.ok) {
      const data = await response.json()
      singleCategoryTracksId.value = data.playlists.items[0].id
      playListUri.value = data.playlists.items[0].uri
      //console.log('Response:', data.playlists.items[0])
      //console.log(playListUri.value)

      getCategoryTrack()
    } else {
      error.value = true
      throw new Error(`Error: ${response.text()}`)
    }
  } catch (error) {
    console.error(error)
    error.value = true
  }
}

const getCategoryTrack = async () => {
  //await checkAndRefreshAccessToken()

  try {
    const response = await fetch(
      `https://api.spotify.com/v1/playlists/${singleCategoryTracksId.value}/tracks?limit=20`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken.value}`
        }
      }
    )

    if (response.ok) {
      const data = await response.json()
      singleCategoryTrack.value = data
      singleCategoryTrackItems.value = data.items
      //console.log(singleCategoryTrackItems.value)
      //console.log(singleCategoryTrack)
    } else {
      error.value = true
      throw new Error(`Error: ${response.status}`)
    }
  } catch (error) {
    console.error(error)
    error.value = true
  }
}

const playSong = async (track, uri, playlistUri, playlist) => {
  await checkAndRefreshAccessToken()
  await player.playSong(track, uri, playlistUri, playlist)
}

const toggle = () => {
  optionToggler.value = false
}

const addTrackToPlaylist = async (track) => {
  // console.log(track)
  if (playlist.selectedPlaylist === '') {
    optionToggler.value = true
  } else {
    clearTimeout(addTimeout.value)
    await playlist
      .addSongToCustomPlaylist(track)
      .then((playlist.added = true))
      .then((playlist.selectedPlaylist = ''))
      .then(
        (addTimeout.value = setTimeout(() => {
          playlist.added = false
        }, 1000))
      )
  }
}

onMounted(getSingleCategory)
</script>

<style scoped>
.singleCategory-header {
  position: relative;
  width: 100%;
  padding-bottom: 30px;
  border-bottom: 2px solid #0000001e;
}
.singleCategory-header h1 {
  position: absolute;
  top: 10px;
  left: 10px;
}

.singleCategory-header img {
  width: 250px;
  height: 250px;
  border-radius: 5px;
}

.playlist-wrap {
  margin-top: 30px;
}
.playlist-wrap .playlist {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.playlist-wrap .playlist .playlist-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 20px;
  background-color: #1b1b1b;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s;
}

.playlist-wrap .playlist .playlist-item:hover {
  background-color: #222222;
  scale: 1.01;
}

.playlist-wrap .playlist .playlist-item .img-p-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
}

.playlist-wrap .playlist .playlist-item .img-p-wrap img {
  border-radius: 10px;
}

.playlist-wrap .playlist .playlist-item .img-p-wrap p {
  font-size: 18px;
}

.playlist-wrap .playlist .playlist-item .artist-btn-wrap {
  display: flex;
  align-items: center;
  gap: 30px;
}

.playlist-wrap .playlist .playlist-item .artist-btn-wrap .button-inner-wrap {
  position: relative;
}

.playlist-wrap .playlist .playlist-item .artist-btn-wrap .btn-message-wrap {
  position: absolute;
  padding: 5px;
  top: -44px;
  left: -200px;
  width: 215px;
  text-align: center;
  background-color: #464646;
  color: #fff;
  display: none;
}

.playlist-wrap .playlist .playlist-item .artist-btn-wrap .btn-message-wrap::after {
  content: '';
  position: absolute;
  width: 10px;
  height: 10px;
  background-color: #464646;
  bottom: -5px;
  right: 2px;
  transform: rotate(45deg);
}

.playlist-wrap
  .playlist
  .playlist-item
  .artist-btn-wrap
  .button-inner-wrap:hover
  .btn-message-wrap {
  display: block;
}

.playlist-wrap .playlist .playlist-item .artist-btn-wrap .btn-message-wrap p {
  font-size: 12px;
}

.playlist-wrap .playlist .playlist-item .artist-btn-wrap .addToCustomPLayListbtn {
  border: none;
  background-color: transparent;
  color: rgba(255, 255, 255, 0.808);
  font-size: 28px;
  cursor: pointer;
  transition: all 0.3s;
}

.playlist-wrap .playlist .playlist-item .artist-btn-wrap .addToCustomPLayListbtn:hover {
  transform: scale(1.2);
  color: white;
}

.playlist-wrap .playlist .playlist-item .artist-btn-wrap .artists-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
}

.playlist-wrap .playlist .playlist-item .artist-btn-wrap .addedMessage {
  position: absolute;
  top: 0;
  right: 5px;
  font-size: 14px;
  background: #141414;
  padding: 10px;
  color: white;
}

/**Responsive */
@media (max-width: 1060px) {
  .playlist-wrap .playlist .playlist-item .artist-btn-wrap {
    gap: 10px;
  }
  .playlist-wrap .playlist .playlist-item .img-p-wrap p {
    font-size: 16px;
  }
  .artists-wrap p {
    font-size: 12px;
  }
}

@media (max-width: 1023px) {
  .playlist-wrap
    .playlist
    .playlist-item
    .artist-btn-wrap
    .button-inner-wrap:hover
    .btn-message-wrap {
    display: none;
  }
}

@media (max-width: 920px) {
  .playlist-wrap .playlist .playlist-item .img-p-wrap p {
    font-size: 14px;
  }

  .artists-wrap p {
    font-size: 10px;
  }
}

@media (max-width: 860px) {
  .playlist-wrap .playlist .playlist-item .artist-btn-wrap .artists-wrap {
    display: none;
  }
}

@media (max-width: 525px) {
  .playlist-wrap .playlist .playlist-item .img-p-wrap img {
    width: 50px;
    height: 50px;
  }
}
</style>

<template>
  <div>
    <button class="backBtn" @click="goBack()">
      <svg xmlns="http://www.w3.org/2000/svg" height="16" width="10" viewBox="0 0 320 512">
        <path
          fill="#ffffff"
          d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l192 192c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256 246.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-192 192z"
        />
      </svg>
    </button>
    <div v-if="album" class="album-header">
      <div class="inner-wr">
        <img :src="album.images[1].url" alt="Album cover image" />
        <h1>{{ album.name }}</h1>
      </div>
    </div>
    <div class="playlist-wrap" v-if="albumTracks">
      <ul class="playlist">
        <li v-for="track in albumTracks" :key="track.id" class="playlist-item">
          <div class="img-p-wrap">
            <img :src="album.images[2].url" alt="Album cover image" />
            <p>{{ track.name }}</p>
          </div>
          <div class="button-inner-wrap">
            <button class="addToCustomPLayListbtn" @click.stop="addTrackToPlaylist(track)">
              +
            </button>
            <div class="btn-message-wrap">
              <p v-if="!playlist.added">
                Click first to select playlist, then click again to add a song
              </p>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, inject, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
//import PlaylistOtions from '../components/PlaylistOtions.vue'
import { useCustomPlaylist } from '../stores/CustomPlaylist'

const route = useRoute()
const router = useRouter()
const playlist = useCustomPlaylist()

const id = route.params.id
const album = ref(null)
const albumTracks = ref(null)

const checkAndRefreshAccessToken = inject('checkAndRefreshAccessToken')
const accessToken = ref(localStorage.getItem('access_token') || null)

const goBack = () => {
  router.go(-1)
}

const getAlbum = async () => {
  await checkAndRefreshAccessToken()

  try {
    const response = await fetch(`https://api.spotify.com/v1/albums/${id}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken.value}`
      }
    })

    if (response.ok) {
      const data = await response.json()
      album.value = data
      console.log(album.value)
    } else {
      throw new Error(`Error: ${await response.text()}`)
    }
  } catch (error) {
    console.error(error)
  }
}

const getAlbumTracks = async () => {
  await checkAndRefreshAccessToken()

  try {
    const response = await fetch(`https://api.spotify.com/v1/albums/${id}/tracks`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken.value}`
      }
    })

    if (response.ok) {
      const data = await response.json()
      albumTracks.value = data.items
      console.log('Tracks:', albumTracks.value)
    } else {
      throw new Error(`Error: ${await response.text()}`)
    }
  } catch (error) {
    console.error(error)
  }
}

onMounted(async () => {
  await getAlbum()
  await getAlbumTracks()
})
</script>

<style scoped>
.backBtn {
  background-color: transparent;
  border: none;
  margin-bottom: 30px;
  cursor: pointer;
}

.backBtn svg {
  width: 32px;
  height: 32px;
}

.album-header {
  position: relative;
  width: 100%;
  padding-bottom: 50px;
  padding-left: 20px;
  border-bottom: 2px solid #0000001e;
}

.album-header .inner-wr {
  display: inline-block;
}
.album-header h1 {
  text-align: center;
  margin-top: 10px;
}

.album-header img {
  width: 250px;
  height: 250px;
  border-radius: 10px;
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

.playlist-wrap .playlist .playlist-item .button-inner-wrap {
  position: relative;
}

.playlist-wrap .playlist .playlist-item .btn-message-wrap {
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

.playlist-wrap .playlist .playlist-item .btn-message-wrap::after {
  content: '';
  position: absolute;
  width: 10px;
  height: 10px;
  background-color: #464646;
  bottom: -5px;
  right: 2px;
  transform: rotate(45deg);
}

.playlist-wrap .playlist .playlist-item .button-inner-wrap:hover .btn-message-wrap {
  display: block;
}

.playlist-wrap .playlist .playlist-item .btn-message-wrap p {
  font-size: 12px;
}

.playlist-wrap .playlist .playlist-item .addToCustomPLayListbtn {
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
</style>

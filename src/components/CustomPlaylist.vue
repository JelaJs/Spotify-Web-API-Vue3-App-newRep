<template>
  <div class="custom-playList">
    <div class="custom-header-btn-wrap">
      <h4>Your Custom Playlist:</h4>
      <button @click="customForm = !customForm">+</button>
    </div>
    <Transition name="fade">
      <div v-show="customForm" class="custom-form">
        <form @submit.prevent="createCustomPlaylist">
          <div class="form-input-wrap">
            <label for="playlist-name">* Playlist name:</label>
            <input
              v-model="playlist.playlistName"
              type="text"
              name="playlist-name"
              placeholder="Pop music..."
            />
            <p class="name-error" v-if="playlistNameError">Add playlist name</p>
          </div>
          <div class="form-input-wrap">
            <label for="playlist-desc">Playlist description:</label>
            <input
              v-model="playlist.playlistDesc"
              type="text"
              name="playlist-desc"
              placeholder="My custom playlist..."
            />
          </div>
          <button>Create Playlist</button>
        </form>
      </div>
    </Transition>
    <div class="custom-playlist-wrap" v-if="playlist.customPlayLists[0]">
      <div
        class="custom-playlists"
        v-for="singlePlaylist in playlist.customPlayLists[0]"
        :key="singlePlaylist.id"
        @click="openSingleCustomPlaylist(singlePlaylist.id)"
      >
        <p>{{ singlePlaylist.name }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useCustomPlaylist } from '../stores/CustomPlaylist'
//import SingleCustomPlaylist from '../views/SingleCustomPlaylist.vue'

const props = defineProps(['checkAndRefreshAccessToken'])

const playlist = useCustomPlaylist()
const router = useRouter()
const customForm = ref(false)
const playlistNameError = ref(false)

const createCustomPlaylist = async () => {
  try {
    await props.checkAndRefreshAccessToken()

    if (playlist.playlistName.trim() !== '') {
      playlistNameError.value = false
      customForm.value = false

      await playlist
        .makeCustomPlaylist()
        .then(await playlist.getCustomPlayLists())
        .then((playlist.playlistName = ''))
        .then((playlist.playlistDesc = ''))
    } else {
      playlistNameError.value = true
    }
  } catch (error) {
    console.error('Error in createCustomPlaylist:', error)
  }
}

const openSingleCustomPlaylist = (id) => {
  router.push(`/playlist/${id}`)
}

const updateCustomPlaylists = async () => {
  playlist.customPlayLists = []
  await playlist.getCustomPlayLists()
  playlist.curPlaylistDeleted = false
}

watch(
  () => playlist.curPlaylistDeleted,
  () => {
    //console.log('customPlayLists.value je ažuriran:')
    updateCustomPlaylists()
  }
)

watch(
  () => playlist.curPlaylistCreated,
  () => {
    //console.log('customPlayLists.value je ažuriran:')
    updateCustomPlaylists()
    playlist.curPlaylistCreated = false
  }
)

onMounted(async () => {
  await props.checkAndRefreshAccessToken()
  await playlist.getUserId()
  await playlist.getCustomPlayLists()
})
</script>

<style scoped>
.custom-playList {
  padding: 20px;
  background-color: #141414;
  border-radius: 10px;
  height: 100%;
  overflow: none;
}

.custom-playList .custom-header-btn-wrap {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 30px;
}

.custom-playList .custom-header-btn-wrap button {
  border: none;
  background-color: transparent;
  font-size: 28px;
  color: rgba(255, 255, 255, 0.726);
  cursor: pointer;
  transition: all 0.3s;
}

.custom-playList .custom-header-btn-wrap button:hover {
  color: #fff;
}

.custom-playList ul {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.custom-form {
  margin-bottom: 20px;
}

.custom-form form .form-input-wrap {
  margin-bottom: 10px;
}

.custom-form form .form-input-wrap label {
  font-weight: 400;
  font-size: 12px;
  letter-spacing: 1px;
  color: #ffffffa9;
}

.custom-form form .form-input-wrap input {
  border: none;
  outline: none;
  width: 100%;
  padding: 5px;
  background-color: #1f1f1f;
  color: #fff;
}

.custom-form form .form-input-wrap .name-error {
  font-size: 12px;
  color: rgb(211, 16, 16);
}

.custom-form form button {
  border: none;
  font-weight: 600;
  padding: 10px 20px;
  margin-top: 20px;
  border-radius: 10px;
  cursor: pointer;
  color: #000;
  background-color: #d6d6d6;
  transition: all 0.3s;
}

.custom-playlist-wrap {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.custom-playlist-wrap .custom-playlists {
  cursor: pointer;
  transition: all 0.3s;
}

.custom-playlist-wrap .custom-playlists:hover {
  color: #ffffff93;
}

.custom-form form button:hover {
  background-color: #fff;
  padding: 10px 25px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/**Responsive */
@media (max-width: 1400px) {
  .custom-playList .custom-header-btn-wrap h4 {
    font-size: 18px;
  }

  .custom-playList p {
    font-size: 14px;
  }
}

@media (max-width: 575px) {
  .custom-playList .custom-header-btn-wrap {
    flex-direction: column;
    align-items: start;
  }

  .custom-playList .custom-header-btn-wrap h4 {
    font-size: 14px;
  }

  .custom-form {
    position: absolute;
    top: 37%;
    padding: 10px;
    background-color: #424242;
    border-radius: 10px;
  }

  .custom-form form .form-input-wrap label {
    color: white;
  }
}
</style>

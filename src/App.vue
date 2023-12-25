<template>
  <div class="authorize" v-if="!accessToken">
    <button class="authorize-btn" @click="authorizeApp">Authorize With Spotify Account</button>
  </div>
  <div class="grid" v-else>
    <div class="left-side">
      <header>
        <nav>
          <RouterLink to="/">Artists</RouterLink>
          <RouterLink to="/categories">Categories</RouterLink>
        </nav>
      </header>
      <CustomPlaylist :checkAndRefreshAccessToken="checkAndRefreshAccessToken" />
    </div>

    <div class="right-side">
      <RouterView />
    </div>
  </div>
  <AudioPlayer v-if="accessToken" :checkAndRefreshAccessToken="checkAndRefreshAccessToken" />
</template>

<script setup>
import { ref, onMounted, provide } from 'vue'
import { RouterLink, RouterView, useRouter } from 'vue-router'
import AudioPlayer from './components/AudioPlayer.vue'
import CustomPlaylist from './components/CustomPlaylist.vue'

const code = ref(null)
const router = useRouter()
const accessToken = ref(localStorage.getItem('access_token') || null)
const refreshToken = ref(localStorage.getItem('refresh_token') || null)

const authorizeApp = () => {
  const clientId = 'c92cce6aa61a47eab08c3263f4883225'
  const redirectUri = 'http://localhost:5173/'
  const responseType = 'code'
  const scope =
    'user-read-private user-read-email user-modify-playback-state user-library-read streaming user-read-playback-state playlist-read-private  user-read-currently-playing playlist-modify-public playlist-modify-private'

  const authorizationUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${scope}`

  // Otvorite prozor/preglednik kako biste omogućili korisniku autorizaciju
  window.location.href = authorizationUrl
}

const handleAuthorizationCode = () => {
  if (window.location.search.includes('code')) {
    const urlParams = new URLSearchParams(window.location.search)
    code.value = urlParams.get('code')

    exchangeCodeForAccessToken()
  }
}

const exchangeCodeForAccessToken = async () => {
  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code.value,
        redirect_uri: 'http://localhost:5173/',
        client_id: 'c92cce6aa61a47eab08c3263f4883225',
        client_secret: '237534ceca1a4e8790f842ab589b16fd'
      })
    })

    if (response.ok) {
      const data = await response.json()

      accessToken.value = data.access_token
      refreshToken.value = data.refresh_token

      localStorage.setItem('access_token', accessToken.value)
      localStorage.setItem('refresh_token', refreshToken.value)

      // Postavi timer za provjeru i osvježavanje pristupnog tokena prije nego što istekne
      setTokenRefreshTimer(data.expires_in)

      // Nakon obrade, preusmjeri na početnu stranicu
      router.push('/')
    } else {
      console.log('Greska')
    }
  } catch (error) {
    console.error('Greška prilikom razmjene koda za pristupni token:', error)
  }
}

const setTokenRefreshTimer = (expiresIn) => {
  const currentTime = Math.floor(Date.now() / 1000)
  const expirationTime = currentTime + expiresIn - 60 // Osvježi 60 sekundi prije nego što istekne

  localStorage.setItem('access_token_expires_at', expirationTime)

  // Postavi timeout za osvježavanje pristupnog tokena
  setTimeout(
    () => {
      refreshAccessToken()
    },
    (expiresIn - 60) * 1000
  )
}

const checkAndRefreshAccessToken = async () => {
  const expirationTime = localStorage.getItem('access_token_expires_at')
  const currentTime = Math.floor(Date.now() / 1000)

  if (expirationTime && currentTime >= expirationTime) {
    // Pristupni token je istekao, osvježi ga
    await refreshAccessToken()
  }
}

const refreshAccessToken = async () => {
  try {
    const currentTime = Math.floor(Date.now() / 1000)

    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken.value,
        client_id: 'c92cce6aa61a47eab08c3263f4883225',
        client_secret: '237534ceca1a4e8790f842ab589b16fd'
      })
    })

    const data = await response.json()

    accessToken.value = data.access_token

    // Osvježi localStorage sa novim pristupnim tokenom i novim vremenom isteka
    localStorage.setItem('access_token', accessToken.value)
    localStorage.setItem('access_token_expires_at', currentTime + data.expires_in)
  } catch (error) {
    console.error('Greška prilikom osvježavanja pristupnog tokena:', error)
  }
}

onMounted(() => {
  if (accessToken.value) {
    checkAndRefreshAccessToken()
  } else {
    handleAuthorizationCode()
  }
  provide('checkAndRefreshAccessToken', checkAndRefreshAccessToken)
})
</script>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: 1fr 6fr;
  gap: 20px;
  height: 100vh;
}

.grid .left-side {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-bottom: 120px;
}

.grid .left-side header {
  padding: 20px;
  background-color: #141414;
  border-radius: 10px;
}

.grid .left-side header nav {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.grid .left-side header nav a {
  text-decoration: none;
  color: #fff;
  font-size: 23px;
  transition: all 0.3s;
}

.grid .left-side header nav a:hover {
  color: #ffffffc7;
}
/*
.grid .left-side .custom-playList {
  padding: 20px;
  background-color: #141414;
  border-radius: 10px;
  height: 100%;
}

.grid .left-side .custom-playList ul {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
*/
.grid .right-side {
  padding: 20px;
  background-color: #141414;
  border-radius: 10px;
  padding-bottom: 120px;
}

.authorize {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #000;
  display: flex;
  justify-content: center;
  align-items: center;
}

.authorize .authorize-btn {
  border: none;
  color: #000;
  background-color: rgb(231, 231, 28);
  border-radius: 10px;
  padding: 15px 20px;
  font-size: 23px;
  cursor: pointer;
  transition: all 0.3s;
}

.authorize .authorize-btn:hover {
  color: white;
  background-color: #111111;
  scale: 1.1;
}
</style>

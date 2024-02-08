<template>
  <div class="authorize" v-if="!accessToken">
    <div class="auth-btn-wrap">
      <button class="authorize-btn" @click="authorizeApp">Authorize With Spotify Account</button>
    </div>
    <p>
      For the app to work properly, after authorization, make sure to keep the original Spotify
      open, and to set the proper audio device active(play random song)
    </p>
    <p>For some features, like playing songs, you will need Spotify premium</p>
  </div>
  <div class="grid" v-else>
    <div class="responsiveMenuToggler">
      <div ref="openMenuBtn" class="openBtnWrap">
        <button class="openMenu" @click="openMenu()">
          <svg xmlns="http://www.w3.org/2000/svg" height="16" width="14" viewBox="0 0 448 512">
            <path
              d="M0 96C0 78.3 14.3 64 32 64H416c17.7 0 32 14.3 32 32s-14.3 32-32 32H32C14.3 128 0 113.7 0 96zM0 256c0-17.7 14.3-32 32-32H416c17.7 0 32 14.3 32 32s-14.3 32-32 32H32c-17.7 0-32-14.3-32-32zM448 416c0 17.7-14.3 32-32 32H32c-17.7 0-32-14.3-32-32s14.3-32 32-32H416c17.7 0 32 14.3 32 32z"
            />
          </svg>
        </button>
      </div>
      <div ref="closeMenuBtn" class="closeBtn-wrap">
        <button class="closeMenu" @click="closeMenu()">
          <svg xmlns="http://www.w3.org/2000/svg" height="16" width="12" viewBox="0 0 384 512">
            <path
              d="M376.6 84.5c11.3-13.6 9.5-33.8-4.1-45.1s-33.8-9.5-45.1 4.1L192 206 56.6 43.5C45.3 29.9 25.1 28.1 11.5 39.4S-3.9 70.9 7.4 84.5L150.3 256 7.4 427.5c-11.3 13.6-9.5 33.8 4.1 45.1s33.8 9.5 45.1-4.1L192 306 327.4 468.5c11.3 13.6 31.5 15.4 45.1 4.1s15.4-31.5 4.1-45.1L233.7 256 376.6 84.5z"
            />
          </svg>
        </button>
      </div>
    </div>
    <div ref="leftSide" class="left-side">
      <header ref="leftSideHeader">
        <nav @click="close">
          <RouterLink to="/">Artists</RouterLink>
          <RouterLink to="/categories">Categories</RouterLink>
        </nav>
        <button class="logout-Btn" @click="logOut">Log out</button>
      </header>
      <CustomPlaylist
        :checkAndRefreshAccessToken="checkAndRefreshAccessToken"
        @closeMobMenu="close()"
      />
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
const leftSide = ref(null)
const leftSideHeader = ref(null)
const menuTimeOut = ref(null)
const openMenuBtn = ref(null)
const closeMenuBtn = ref(null)

const authorizeApp = () => {
  //Set your clientId from your spotify dashboard
  //const clientId = 'YOUR CLIENT ID'
  const clientId = 'c92cce6aa61a47eab08c3263f4883225'
  //Set your redirect URI in spotify dashboard
  //const redirectUri = 'https://YOURLINK/'
  //const redirectUri = 'https://spotifyprojectvue.netlify.app/'
  const redirectUri = 'http://localhost:5173/'
  const responseType = 'code'
  const scope =
    'user-read-private user-read-email user-modify-playback-state user-library-read streaming user-read-playback-state playlist-read-private user-read-currently-playing playlist-modify-public playlist-modify-private'

  const authorizationUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${scope}`

  // Otvora prozor kako bi omogućio korisniku autorizaciju
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
        redirect_uri: 'https://spotifyprojectvue.netlify.app/',
        //redirect_uri: 'http://localhost:5173/',
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

      // timer za proveru i osvežavanje pristupnog tokena
      setTokenRefreshTimer(data.expires_in)

      // preusmeravanje na pocetnu stranicu
      router.push('/')
      //window.open('https://www.spotify.com/', '_blank')
    } else {
      console.log('Greska')
    }
  } catch (error) {
    console.error('Greška prilikom razmene koda za pristupni token:', error)
  }
}

const setTokenRefreshTimer = (expiresIn) => {
  const currentTime = Math.floor(Date.now() / 1000)
  const expirationTime = currentTime + expiresIn - 60 // Osveži 60 sekundi prie nego što istekne

  localStorage.setItem('access_token_expires_at', expirationTime)

  // timeout za osvežavanje pristupnog tokena
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

    // Osvežen localStorage sa novim pristupnim tokenom i novim vremenom isteka
    localStorage.setItem('access_token', accessToken.value)
    localStorage.setItem('access_token_expires_at', currentTime + data.expires_in)
  } catch (error) {
    console.error('Greška prilikom osvježavanja pristupnog tokena:', error)
  }
}

const logOut = () => {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('access_token_expires_at')
  location.href = '/'
  //location.reload()
}

const openMenu = () => {
  leftSide.value.style.opacity = '100%'
  leftSide.value.style.width = '200px'
  leftSide.value.style.height = '100%'
  leftSideHeader.value.style.padding = '20px'
  openMenuBtn.value.style.display = 'none'
  closeMenuBtn.value.style.display = 'block'
  //leftSide.value.style.display = 'block'
}

const closeMenu = () => {
  clearTimeout(menuTimeOut.value)
  leftSide.value.style.opacity = '0'
  leftSide.value.style.width = '0'
  leftSide.value.style.height = '0'
  openMenuBtn.value.style.display = 'block'
  closeMenuBtn.value.style.display = 'none'

  menuTimeOut.value = setTimeout(() => {
    leftSideHeader.value.style.padding = '0'
  }, 300)
}

const close = () => {
  if (window.innerWidth <= 740) {
    closeMenu()
    //console.log('Prosao uslov')
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

.grid .responsiveMenuToggler {
  position: absolute;
  top: 22px;
  right: 20px;
}

.grid .responsiveMenuToggler button {
  border: none;
  background-color: transparent;
  display: none;
}

.grid .responsiveMenuToggler button svg {
  fill: white;
}

.grid .left-side {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-bottom: 120px;
}

.closeBtn-wrap {
  text-align: end;
  display: none;
}

.grid .left-side .closeMenu {
  border: none;
  background-color: transparent;
  margin-bottom: 10px;
}

.grid .left-side .closeMenu svg {
  fill: white;
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

.grid .left-side header .logout-Btn {
  border: none;
  background-color: #070707;
  color: white;
  padding: 10px 20px;
  border-radius: 10px;
  margin-top: 20px;
  cursor: pointer;
  transition: all 0.3s;
}

.grid .left-side header .logout-Btn:hover {
  background-color: #161616;
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
  flex-direction: column;
  padding: 10px;
}

.authorize p {
  margin-top: 10px;
  text-align: center;
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

/*Route transition
.route-enter-from {
  opacity: 0;
  transform: translateX(100px);
}
.route-enter-active {
  transition: all 0.3 ease-out;
}
.route-leave-to {
  opacity: 0;
  transform: translateX(-100px);
}
.route-leave-active {
  transition: all 0.3 ease-in;
}*/

@media (max-width: 1400px) {
  .grid .left-side header nav {
    gap: 15px;
  }

  .grid .left-side {
    width: 194px;
  }

  .grid .left-side header nav a {
    font-size: 16px;
  }
}

@media (max-width: 740px) {
  .grid {
    grid-template-columns: 1fr;
  }

  .grid .responsiveMenuToggler button {
    display: block;
  }
  .grid .left-side {
    position: fixed;
    top: 0;
    left: 0;
    width: 140px;
    /* height: 100vh;*/
    z-index: 10;
    /*width: 200px;*/
    gap: 0;
    border-radius: 0;
    padding-bottom: 0;
    opacity: 0;
    width: 0;
    height: 0;
    /*display: none;*/
    transition: all 0.3s;
    border-right: 2px solid #1d1d1d;
  }

  .closeBtn-wrap {
    display: none;
  }

  .grid .left-side header {
    border-radius: 0;
    padding: 0;
  }

  .grid .left-side .custom-playList {
    border-radius: 0;
  }
}

@media (max-width: 415px) {
  .grid .left-side {
    width: 125px;
  }
}
</style>

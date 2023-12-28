<template>
  <div v-if="artist" class="header">
    <div class="header-content-wrap">
      <img :src="artist.images[1].url" alt="Artist image" />
      <h1>{{ artist.name }}</h1>
    </div>
  </div>
  <div v-if="artistAlbum">
    <p class="albums-sec-header">Albums:</p>
    <div class="albums-grid">
      <div
        v-for="album in artistAlbum"
        :key="album.id"
        class="albums-wrap"
        @click="goToSongsPage(album.id)"
      >
        <img :src="album.images[1].url" alt="Album cover image" />
        <p>{{ album.name.substring(0, 20) }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, inject, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const checkAndRefreshAccessToken = inject('checkAndRefreshAccessToken')
const accessToken = ref(localStorage.getItem('access_token') || null)
const route = useRoute()
const router = useRouter()
const id = route.params.id
//const countryCode = ref(null)
const artistAlbum = ref(null)
const artist = ref(null)

const goToSongsPage = (id) => {
  router.push(`/artistsongs/${id}`)
}

const getArtist = async () => {
  await checkAndRefreshAccessToken()

  try {
    const response = await fetch(`https://api.spotify.com/v1/artists/${id.slice(1)}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken.value}`
      }
    })

    if (!response.ok) {
      throw new Error('Neuspeli zahtev za informacije o korisniku', await response.text())
    }

    const data = await response.json()
    artist.value = data
    //console.log('Artist info:', artist.value)
  } catch (error) {
    console.error('Greška prilikom dobijanja informacija o korisniku:', error.message)
  }
}
/*
const getCountryCodeFromSpotify = async () => {
  await checkAndRefreshAccessToken()

  try {
    const response = await fetch('https://api.spotify.com/v1/me', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken.value}`
      }
    })

    if (!response.ok) {
      throw new Error('Neuspeli zahtev za informacije o korisniku', await response.text())
    }

    const data = await response.json()
    countryCode.value = data.country || 'US' // Default country code
    //console.log(id.slice(1))
  } catch (error) {
    console.error('Greška prilikom dobijanja informacija o korisniku:', error.message)
  }
}*/

const getArtistsAlbums = async () => {
  await checkAndRefreshAccessToken()

  try {
    const response = await fetch(
      `https://api.spotify.com/v1/artists/${id.slice(1)}/albums?limit=10`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken.value}`
        }
      }
    )

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${await response.text()}`)
    }

    const data = await response.json()
    artistAlbum.value = data.items
    //console.log('Albums:', artistAlbum.value)
  } catch (error) {
    console.error('Doslo je do greske:', error)
  }
}

onMounted(async () => {
  // await getCountryCodeFromSpotify()
  await getArtistsAlbums()
  await getArtist()
})
</script>

<style scoped>
.header {
  padding-bottom: 30px;
  border-bottom: 2px solid #0000001e;
}

.header .header-content-wrap {
  padding: 20px;
  background-color: rgb(29, 29, 29);
  display: inline-block;
  border: 2px solid #252525;
  border-radius: 10px;
}

.header .header-content-wrap img {
  border-radius: 10px;
  width: 300px;
  height: 300px;
}

.header .header-content-wrap h1 {
  text-align: center;
  margin-top: 10px;
}

.albums-sec-header {
  margin-top: 40px;
  margin-bottom: 20px;
  font-size: 23px;
  letter-spacing: 1.1px;
}

.albums-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
  gap: 20px;
}

.albums-wrap {
  padding: 10px;
  background-color: rgb(29, 29, 29);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border: 2px solid #252525;
  border-radius: 10px;
  gap: 30px;
  cursor: pointer;
  transition: all 0.3s;
}

.albums-wrap:hover {
  background-color: rgb(41, 41, 41);
}

.albums-wrap img {
  border-radius: 10px;
  width: 200px;
  height: 200px;
}

/*Responsive*/
@media (max-width: 1804px) {
  .header .header-content-wrap img {
    width: 200px;
    height: 200px;
  }

  .header .header-content-wrap h1 {
    font-size: 23px;
  }

  .albums-wrap {
    gap: 20px;
  }
  .albums-wrap p {
    font-size: 14px;
  }
}

@media (max-width: 1642px) {
  .albums-wrap img {
    width: 150px;
    height: 150px;
  }
}

@media (max-width: 1400px) {
  .albums-wrap img {
    width: 140px;
    height: 140px;
  }
}

@media (max-width: 1200px) {
  .header .header-content-wrap img {
    width: 170px;
    height: 170px;
  }
  .albums-grid {
    grid-template-columns: 1fr 1fr 1fr 1fr;
  }
}

@media (max-width: 1060px) {
  .albums-wrap img {
    width: 120px;
    height: 120px;
  }

  .albums-wrap p {
    font-size: 12px;
  }
}

@media (max-width: 915px) {
  .albums-grid {
    grid-template-columns: 1fr 1fr 1fr;
  }
}

@media (max-width: 740px) {
  .albums-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 525px) {
  .header .header-content-wrap img {
    width: 120px;
    height: 120px;
  }
  .albums-grid {
    grid-template-columns: 1fr;
  }
}
</style>

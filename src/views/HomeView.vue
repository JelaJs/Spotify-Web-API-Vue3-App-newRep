<template>
  <div>
    <div class="header-input-flex">
      <h1>Artists:</h1>
      <input
        v-model="inputName"
        type="text"
        placeholder="Search for your favorite artist here..."
        @input="getArtistID"
      />
    </div>
    <div class="searhed-artist-box" v-if="inputName">
      <div v-if="searchedArtist">
        <div class="artist-wrap" @click="goToArtistPage(searchedArtist[0].id)">
          <img :src="searchedArtist[0].images[2].url" alt="Artist image" />
        </div>
      </div>
      <div v-if="noArtists">No artists for your query...</div>
      <div v-if="artistError">Something went wrong, try again later...</div>
    </div>
  </div>
  <div class="artists-section">
    <div class="artists-main-wrap">
      <p class="artist-text">Most Popular Male Artists:</p>
      <div class="artists-grid" v-if="mostPopularMaleArtists">
        <div
          class="single-artist"
          v-for="maleArtist in mostPopularMaleArtists.artists"
          :key="maleArtist.id"
          @click="goToArtistPage(maleArtist.id)"
        >
          <img :src="maleArtist.images[2].url" alt="Artists image" />
        </div>
      </div>
    </div>

    <div class="artists-main-wrap">
      <p class="artist-text">Most Popular American Rappers:</p>
      <div class="artists-grid" v-if="mostPopularAmericanRappers">
        <div
          class="single-artist"
          v-for="americanRapper in mostPopularAmericanRappers.artists"
          :key="americanRapper.id"
          @click="goToArtistPage(americanRapper.id)"
        >
          <img :src="americanRapper.images[0].url" alt="Artists image" />
        </div>
      </div>
    </div>

    <div class="artists-main-wrap">
      <p class="artist-text">Most Popular Pop Artists:</p>
      <div class="artists-grid" v-if="mostPopularPopArtists">
        <div
          class="single-artist"
          v-for="popArtist in mostPopularPopArtists.artists"
          :key="popArtist.id"
          @click="goToArtistPage(popArtist.id)"
        >
          <img :src="popArtist.images[0].url" alt="Artists image" />
        </div>
      </div>
    </div>

    <div class="artists-main-wrap">
      <p class="artist-text">Most Popular Balkan Artists:</p>
      <div class="artists-grid" v-if="mostPopularBalkanArtists">
        <div
          class="single-artist"
          v-for="balkanArtist in mostPopularBalkanArtists.artists"
          :key="balkanArtist.id"
          @click="goToArtistPage(balkanArtist.id)"
        >
          <img :src="balkanArtist.images[0].url" alt="Artists image" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, inject, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const checkAndRefreshAccessToken = inject('checkAndRefreshAccessToken')
const accessToken = ref(localStorage.getItem('access_token') || null)
const mostPopularMaleArtists = ref(null)
const mostPopularFemaleArtists = ref(null)
const mostPopularAmericanRappers = ref(null)
const mostPopularPopArtists = ref(null)
const mostPopularBalkanArtists = ref(null)
const searchedArtist = ref(null)
const artistId = ref(null)
const inputName = ref('')
const queryTimeuot = ref(null)
const noArtists = ref(false)
const artistError = ref(false)

const router = useRouter()

const goToArtistPage = (id) => {
  router.push(`/artist/:${id}`)
}

const getArtistID = () => {
  clearTimeout(queryTimeuot.value)

  queryTimeuot.value = setTimeout(async () => {
    await checkAndRefreshAccessToken()

    const artistName = inputName.value

    try {
      if (inputName.value === '') return
      const searchResponse = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(artistName)}&type=artist`,
        {
          headers: {
            Authorization: `Bearer ${accessToken.value}`
          }
        }
      )

      if (!searchResponse.ok) {
        searchedArtist.value = null
        artistError.value = true
        throw new Error('Nije moguće dohvatiti informacije o umjetniku')
      }

      const searchData = await searchResponse.json()
      const firstArtist = searchData.artists.items[0]

      if (!firstArtist) {
        noArtists.value = true
        searchedArtist.value = null
        throw new Error('Umjetnik nije pronađen')
      }

      artistId.value = firstArtist.id
      noArtists.value = false
      console.log('Artist id:', artistId.value)
      console.log('Response image:', searchData.artists.items[0].images[0])

      await getSearchedArtists(firstArtist.id)
    } catch (error) {
      console.error('Greška prilikom dohvaćanja informacija o umjetniku', error.message)
    }
  }, 300)
}

const getSearchedArtists = async (id) => {
  await checkAndRefreshAccessToken()

  if (artistId.value === null) return

  try {
    const response = await fetch(`https://api.spotify.com/v1/artists?ids=${id}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken.value}`
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${await response.text()}`)
    }

    const data = await response.json()
    searchedArtist.value = data.artists
    console.log('Searched artist:', searchedArtist.value)
    console.log('Searched artist image:', searchedArtist.value[0].images[2].url)
  } catch (error) {
    console.error('Doslo je do greske:', error)
  }
}

const getMostPopularBalkanArtists = async () => {
  await checkAndRefreshAccessToken()

  try {
    const response = await fetch(
      `https://api.spotify.com/v1/artists?ids=1hTNGLTfpkxCaH9m0IPD8d,6eiVM12aC3SP5n0fMg9fqP,0JQ4vokBBqHxHzRb36fSWN,58Wsq5pz5tOvWXBR8hOfxg,3YNm5MBjwq1QDeKQJq7wze,7aASXckUdNXJ5X338n8C1D,3kLaFkY8dscdLove42grJF,6C1X5Uh3DPIkC2gaVq00BL,3ekwV8Mt8DgZvmuK2futxG,2ZiHQ3wOlb6bH7bf1R8NTB`,
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
    mostPopularBalkanArtists.value = data
    console.log(mostPopularBalkanArtists.value)
  } catch (error) {
    console.error('Doslo je do greske:', error)
  }
}

const getMostPopularPopArtists = async () => {
  await checkAndRefreshAccessToken()

  try {
    const response = await fetch(
      `https://api.spotify.com/v1/artists?ids=3fMbdgg4jU18AjLCKBhRSm,1l7ZsJRRS8wlW3WfJfPfNS,06HL4z0CvFAxyc27GXpf02,1uNFoZAHBGtllmzznpCI3s,6jJ0s89eD6GaHleKKya26X,26dSoYclwsYLMAKD3tpOr4,0du5cEVh5yTK9QJze8zA0C,5rSXSAkZ67PYJSvpUpkOr7,31TPClRtHm23RisEBtV3X7,6M2wZ9GZgrQXHCFfjv46we`,
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
    mostPopularPopArtists.value = data
    console.log(mostPopularPopArtists.value)
  } catch (error) {
    console.error('Doslo je do greske:', error)
  }
}

const getMostPopularAmericanRappers = async () => {
  await checkAndRefreshAccessToken()

  try {
    const response = await fetch(
      `https://api.spotify.com/v1/artists?ids=7dGJo4pcD2V6oG8kP0tJRR,6DPYiyq5kWVQS4RGwxzPC7,1ZwdS5xdxEREPySFridCfh,3TVXtAsR1Inumwj472S9r4,3nFkdlSjzX9mRTtwJOzDYB,3q7HBObVc0L8jNeTe5Gofh,7hJcb9fa4alzcOq3EaNPoG,1RyvyyTE3xzB2ZywiAwp0i,3ipn9JLAPI5GUEo4y4jcoi,3Mcii5XWf6E0lrY3Uky4cA`,
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
    mostPopularAmericanRappers.value = data
    console.log(mostPopularAmericanRappers.value)
  } catch (error) {
    console.error('Doslo je do greske:', error)
  }
}

const getMostPopularFemaleArtists = async () => {
  await checkAndRefreshAccessToken()

  try {
    const response = await fetch(
      `https://api.spotify.com/v1/artists?ids=6tbjWDEIzxoDsBA1FuhfPW,06HL4z0CvFAxyc27GXpf02,3NkUVbGU8HjV9CqzfmtwMa,66CXWjxzNUsdJxJ2JdwvnR,1HY2Jd0NmPuamShAr6KMms,6jJ0s89eD6GaHleKKya26X,6vWDO969PvNqNYHIOW5v0m,0EmeFodog0BfCgMzAIvKQp,5pKCCKE2ajJHZ9KAiaK11H,00FQb4jTyendYWaN8pK0wa`,
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
    mostPopularFemaleArtists.value = data
    console.log('Female.artists', mostPopularFemaleArtists.value.artists)
  } catch (error) {
    console.error('Doslo je do greske:', error)
  }
}

const getMostPopularMaleArtists = async () => {
  await checkAndRefreshAccessToken()

  try {
    const response = await fetch(
      `https://api.spotify.com/v1/artists?ids=6eUKZXaKkcviH0Ku9w2n3V,1Xyo4u8uXC1ZmMpatF05PJ,3TVXtAsR1Inumwj472S9r4,7dGJo4pcD2V6oG8kP0tJRR,1RyvyyTE3xzB2ZywiAwp0i,0Y5tJX1MQlPlqiwlOH1tJY,1Cs0zKBU1kc0i8ypK3B9ai,7hJcb9fa4alzcOq3EaNPoG,0z4gvV4rjIZ9wHck67ucSV,3q7HBObVc0L8jNeTe5Gofh`,
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
    mostPopularMaleArtists.value = data
    console.log(mostPopularMaleArtists.value.artists)
    //console.log('Imgs', mostPopularMaleArtists.value.artists[0].images[2])
  } catch (error) {
    console.error('Doslo je do greske:', error)
  }
}

onMounted(async () => {
  await checkAndRefreshAccessToken()
  await getMostPopularMaleArtists()
  await getMostPopularFemaleArtists()
  await getMostPopularAmericanRappers()
  await getMostPopularPopArtists()
  await getMostPopularBalkanArtists()
})
</script>

<style scoped>
.header-input-flex {
  display: flex;
  gap: 20px;
  align-items: center;
}

.header-input-flex input {
  border: none;
  outline: none;
  padding: 15px 10px;
  color: rgba(255, 255, 255, 0.76);
  font-size: 12px;
  border-radius: 10px;
  background-color: #0a0a0a;
  width: 50%;
}

.searhed-artist-box {
  background-color: #1a1a1a;
  border-radius: 10px;
  padding: 10px 20px 20px 20px;
  margin-top: 5px;
}

.searhed-artist-box .artist-wrap {
  padding: 15px;
  background-color: #242424;
  display: inline-block;
  border-radius: 10px;
  cursor: pointer;
}

.searhed-artist-box .artist-wrap img {
  border-radius: 10px;
}

.artists-section {
  padding-top: 60px;
}

.artists-section .artists-main-wrap {
  margin-bottom: 100px;
}

.artists-section .artist-text {
  font-size: 23px;
  margin-bottom: 10px;
}

.artists-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
  gap: 10px;
}

.artists-grid .single-artist {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 180px;
  height: 180px;
  border-radius: 10px;
  background-color: #242424;
  cursor: pointer;
  transition: all 0.3s;
}

.artists-grid .single-artist:hover {
  background-color: #333333;
}

.artists-grid .single-artist img {
  width: 150px;
  height: 150px;
  border-radius: 10px;
}

/*Responsive*/
@media (max-width: 1804px) {
  .artists-grid {
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
  }
}

@media (max-width: 1642px) {
  .artists-grid {
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
  }
}

@media (max-width: 1400px) {
  .artist-text {
    font-size: 18px;
  }

  h1 {
    font-size: 24px;
  }

  .grid .left-side header nav {
    gap: 15px;
  }

  .grid .left-side header nav a {
    font-size: 18px;
  }

  h4 {
    font-size: 23px;
  }
}

@media (max-width: 1200px) {
  .artists-grid {
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
  }

  .artists-grid .single-artist {
    width: 150px;
    height: 150px;
  }
  .artists-grid .single-artist img {
    width: 120px;
    height: 120px;
  }
}

@media (max-width: 1060px) {
  .grid .left-side {
    width: 550px;
  }
  .artists-grid {
    grid-template-columns: 1fr 1fr 1fr 1fr;
  }
}

@media (max-width: 915px) {
  .artists-grid {
    grid-template-columns: 1fr 1fr 1fr;
  }
}

@media (max-width: 740px) {
  .header-input-flex {
    flex-direction: column;
    align-items: start;
  }

  .header-input-flex input {
    width: 100%;
  }
  .artists-grid {
    grid-template-columns: 1fr 1fr;
  }

  .artists-section .artist-text {
    font-size: 21px;
  }

  .searhed-artist-box .artist-wrap img {
    width: 120px;
    height: 120px;
  }
}

@media (max-width: 575px) {
  .artists-grid {
    grid-template-columns: 1fr;
  }

  .artists-section .artist-text[data-v-b4e148ca] {
    font-size: 16px;
  }
}
</style>

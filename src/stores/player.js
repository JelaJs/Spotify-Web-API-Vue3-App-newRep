import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

export const usePLayerStore = defineStore('player', () => {
  const isPlaying = ref(false)
  const currentSong = ref(null)
  const playSongError = ref(false)
  const curTrack = ref(null)
  const curUri = ref(null)
  const currentPosition = ref(0)
  const curTimeInSeconds = computed(() => Math.floor(currentPosition.value / 1000))
  const curPlaylistUri = ref(null)
  const curPlaylist = ref([])
  const playlistSongIndex = ref(0)
  const trackDuration = ref(0)
  const currentTime = ref(0)
  const curVolume = ref(50)
  const maxVolume = 100

  const getActiveDevice = async () => {
    try {
      const accessToken = ref(localStorage.getItem('access_token') || null)
      const url = 'https://api.spotify.com/v1/me/player/devices'

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${accessToken.value}`
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${await response.text()}`)
      }

      const data = await response.json()
      console.log(data)
    } catch (error) {
      console.error('Doslo je do greske prilikom rpistupanju uredjaja:', error)
    }
  }

  const getCurPosition = async () => {
    try {
      const accessToken = ref(localStorage.getItem('access_token') || null)

      const playbackStateResponse = await fetch(
        'https://api.spotify.com/v1/me/player/currently-playing',
        {
          headers: {
            Authorization: `Bearer ${accessToken.value}`
          }
        }
      )

      if (!playbackStateResponse.ok) {
        throw new Error(`HTTP error! Status: ${await playbackStateResponse.text()}`)
      }

      const playbackState = await playbackStateResponse.json()
      currentPosition.value = playbackState.progress_ms || 0
      trackDuration.value = playbackState.item.duration_ms || 0

      //console.log('cur pos', currentPosition.value)
      //console.log('Dur pos', trackDuration.value)
      if (currentPosition.value === trackDuration.value) {
        skipToNext()
        //console.log('Isto je')
      }
    } catch (error) {
      console.error('Doslo je do greske:', error)
    }
  }

  watch(isPlaying, () => {
    setInterval(getCurPosition, 1000)
  })

  const seekToPosition = async () => {
    try {
      const accessToken = ref(localStorage.getItem('access_token') || null)
      //const newPositionInSeconds = currentTime.value / 1000

      const seekEndpoint = `https://api.spotify.com/v1/me/player/seek?position_ms=${currentPosition.value}`

      const data = {
        position_ms: currentPosition.value
      }

      const requestOptions = {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken.value}`
        },
        body: JSON.stringify(data)
      }

      const response = await fetch(seekEndpoint, requestOptions)

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${await response.text()}`)
      }

      if (response.status === 204) {
        console.log('Pozicija pesme uspešno postavljena.')
      } else {
        console.error(`Neočekivan status odgovora: ${response.status}`)
      }
    } catch (error) {
      console.error('Došlo je do greške prilikom postavljanja pozicije pesme:', error)
    }
  }

  const setVolume = async (newVolume) => {
    try {
      const accessToken = ref(localStorage.getItem('access_token') || null)

      const volumetateResponse = await fetch(
        `https://api.spotify.com/v1/me/player/volume?volume_percent=${newVolume}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken.value}`
          }
        }
      )

      if (!volumetateResponse.ok) {
        throw new Error(`HTTP error! Status: ${await volumetateResponse.text()}`)
      }

      if (volumetateResponse.status === 204) {
        console.log('Pozicija zvuka uspešno postavljena.')
        curVolume.value = newVolume
      } else {
        console.error(`Neočekivan status odgovora: ${await volumetateResponse.text()}`)
      }
    } catch (error) {
      console.error('Doslo je do greske:', error)
    }
  }

  const playSong = async (track, uri, playlistUri, playlist) => {
    curTrack.value = track
    curUri.value = uri
    curPlaylistUri.value = playlistUri
    curPlaylist.value = playlist

    try {
      const accessToken = ref(localStorage.getItem('access_token') || null)

      const spotifyUri = uri

      const playEndpoint = 'https://api.spotify.com/v1/me/player/play'

      const data = {
        uris: [spotifyUri],
        position_ms: 0
      }

      const requestOptions = {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken.value}`
        },
        body: JSON.stringify(data)
      }

      const response = await fetch(playEndpoint, requestOptions)

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${await response.text()}`)
      }

      if (response.status === 204) {
        //console.log('Pesma je uspešno reprodukovana.')
        isPlaying.value = true
        currentSong.value = track.track.name
        playlistSongIndex.value = curPlaylist.value.findIndex(
          (item) => item.track.uri === curUri.value
        )
        // console.log('trenutna playlista', curPlaylist.value)
        //console.log('Playlist song index', playlistSongIndex.value)
      } else {
        // Ako je status odgovora nešto drugo osim 204, tretirajte ga prema potrebama vaše aplikacije
        console.error(`Neočekivan status odgovora: ${response.status}`)
      }
    } catch (error) {
      console.error('Došlo je do greške prilikom reprodukcije pesme:', error)
      playSongError.value = true
    }
  }

  const playAlbumSong = async (track, uri, playlistUri, playlist) => {
    curTrack.value = track
    curUri.value = uri
    curPlaylistUri.value = playlistUri
    curPlaylist.value = playlist

    try {
      const accessToken = ref(localStorage.getItem('access_token') || null)

      const spotifyUri = uri

      const playEndpoint = 'https://api.spotify.com/v1/me/player/play'

      const data = {
        uris: [spotifyUri],
        position_ms: 0
      }

      const requestOptions = {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken.value}`
        },
        body: JSON.stringify(data)
      }

      const response = await fetch(playEndpoint, requestOptions)

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${await response.text()}`)
      }

      if (response.status === 204) {
        //console.log('Pesma je uspešno reprodukovana.')
        isPlaying.value = true
        currentSong.value = track.name
        playlistSongIndex.value = curPlaylist.value.findIndex((item) => item.uri === curUri.value)
        // console.log('trenutna playlista', curPlaylist.value)
        //console.log('Playlist song index', playlistSongIndex.value)
      } else {
        // Ako je status odgovora nešto drugo osim 204, tretirajte ga prema potrebama vaše aplikacije
        console.error(`Neočekivan status odgovora: ${await response.text()}`)
      }
    } catch (error) {
      console.error('Došlo je do greške prilikom reprodukcije pesme:', error)
      playSongError.value = true
    }
  }

  const playNextSong = async (name, uri) => {
    try {
      const accessToken = ref(localStorage.getItem('access_token') || null)

      const spotifyUri = uri

      const playEndpoint = 'https://api.spotify.com/v1/me/player/play'

      const data = {
        uris: [spotifyUri],
        position_ms: 0
      }

      const requestOptions = {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken.value}`
        },
        body: JSON.stringify(data)
      }

      const response = await fetch(playEndpoint, requestOptions)

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${await response.text()}`)
      }

      if (response.status === 204) {
        //console.log('Pesma je uspešno reprodukovana.')
        isPlaying.value = true
        currentSong.value = name
      } else {
        console.error(`Neočekivan status odgovora: ${response.status}`)
      }
    } catch (error) {
      console.error('Došlo je do greške prilikom reprodukcije pesme:', error)
      playSongError.value = true
    }
  }

  const pause = async () => {
    try {
      const accessToken = ref(localStorage.getItem('access_token') || null)
      const pauseEndpoint = 'https://api.spotify.com/v1/me/player/pause'

      const requestOptions = {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken.value}`
        }
      }

      const response = await fetch(pauseEndpoint, requestOptions)

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${await response.text()}`)
      }

      isPlaying.value = false
    } catch (error) {
      console.error('Doslo je do grekse:', error)
    }
  }

  const resumeSong = async () => {
    try {
      await getCurPosition()
      const accessToken = ref(localStorage.getItem('access_token') || null)

      const spotifyUri = curUri.value
      console.log(spotifyUri)

      const playEndpoint = 'https://api.spotify.com/v1/me/player/play'

      const data = {
        uris: [spotifyUri],
        position_ms: currentPosition.value
      }

      const requestOptions = {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken.value}`
        },
        body: JSON.stringify(data)
      }

      const response = await fetch(playEndpoint, requestOptions)

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${await response.text()}`)
      }

      if (response.status === 204) {
        // console.log('Pesma je uspešno reprodukovana ili nastavljena.')
        isPlaying.value = true
        // currentSong.value = curTrack.value.track.name
      } else {
        // Ako je status odgovora nešto drugo osim 204, tretirajte ga prema potrebama vaše aplikacije
        //console.error(`Neočekivan status odgovora: ${response.status}`)
      }
    } catch (error) {
      console.error('Došlo je do greške prilikom reprodukcije pesme:', error)
      playSongError.value = true
    }
  }

  const skipToNext = () => {
    playlistSongIndex.value++
    if (playlistSongIndex.value === curPlaylist.value.length) {
      playlistSongIndex.value = 0
    }
    let nextSongUri = ''
    let name = ''
    const nextSong = curPlaylist.value.filter((item, index) => index === playlistSongIndex.value)
    if (nextSong[0].track === undefined) {
      nextSongUri = nextSong[0].uri
      curUri.value = nextSong[0].uri
      name = nextSong[0].name
    } else {
      nextSongUri = nextSong[0].track.uri
      curUri.value = nextSong[0].track.uri
      name = nextSong[0].track.name
    }

    //console.log('Next song', nextSong[0])
    //console.log('Next song uri', nextSongUri)
    //console.log(playlistSongIndex.value)
    playNextSong(name, nextSongUri)
  }

  const skipToPrev = () => {
    playlistSongIndex.value--
    if (playlistSongIndex.value === -1) {
      playlistSongIndex.value = curPlaylist.value.length - 1
    }
    let nextSongUri = ''
    let name = ''
    const nextSong = curPlaylist.value.filter((item, index) => index === playlistSongIndex.value)
    if (nextSong[0].track === undefined) {
      nextSongUri = nextSong[0].uri
      curUri.value = nextSong[0].uri
      name = nextSong[0].name
    } else {
      nextSongUri = nextSong[0].track.uri
      curUri.value = nextSong[0].track.uri
      name = nextSong[0].track.name
    }
    //console.log('Next song', nextSong[0])
    //console.log('Next song uri', nextSongUri)
    //console.log(playlistSongIndex.value)
    playNextSong(name, nextSongUri)
  }

  return {
    playSong,
    isPlaying,
    currentSong,
    getActiveDevice,
    playSongError,
    pause,
    resumeSong,
    skipToNext,
    skipToPrev,
    currentPosition,
    curTimeInSeconds,
    trackDuration,
    currentTime,
    seekToPosition,
    setVolume,
    maxVolume,
    curVolume,
    playAlbumSong
  }
})

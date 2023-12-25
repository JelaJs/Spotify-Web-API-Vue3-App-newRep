import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useCustomPlaylist = defineStore('customPlaylist', () => {
  const userId = ref(null)
  const playlistName = ref('')
  const playlistDesc = ref('')
  const customPlayLists = ref([])
  const selectedPlaylist = ref('')
  const singleCustomPlaylist = ref(null)
  const customPlaylistSongs = ref([])
  const songsLoaded = ref(false)
  const singlePlaylistLoaded = ref(false)
  const curPlaylistDeleted = ref(false)
  const curPlaylistCreated = ref(false)

  const getUserId = async () => {
    const accessToken = ref(localStorage.getItem('access_token') || null)

    try {
      const response = await fetch('https://api.spotify.com/v1/me', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken.value}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to get user information', await response.text())
      }

      const userData = await response.json()
      userId.value = userData.id
      //console.log(userId.value)
    } catch (error) {
      console.error('Error getting user ID:', error)
      throw error
    }
  }

  const makeCustomPlaylist = async () => {
    const accessToken = ref(localStorage.getItem('access_token') || null)

    if (!accessToken.value) {
      console.error('Access token is missing. Please authenticate the user.')
      return
    }

    try {
      const response = await fetch(`https://api.spotify.com/v1/users/${userId.value}/playlists`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken.value}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: playlistName.value,
          public: false,
          //collaborative: false,
          description: playlistDesc.value || 'My custom Spotify playlist'
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Error creating playlist. Response status:', response.status)
        console.error('Response text:', errorText)
        throw new Error(
          `Failed to create playlist. Response status: ${response.status}. Response text: ${errorText}`
        )
      }

      const playlistData = await response.json()
      customPlayLists.value.push(playlistData)
      curPlaylistCreated.value = true
      //console.log('Playlist created:', playlistData)
      //console.log(customPlayLists.value)
    } catch (error) {
      console.error('Error creating playlist:', error)
      throw error
    }
  }

  const getCustomPlayLists = async () => {
    const accessToken = ref(localStorage.getItem('access_token') || null)

    if (!accessToken.value) {
      console.error('Access token is missing. Please authenticate the user.')
      return
    }

    try {
      const response = await fetch(`https://api.spotify.com/v1/users/${userId.value}/playlists`, {
        headers: {
          Authorization: `Bearer ${accessToken.value}`
        }
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Error creating playlist. Response status:', response.status)
        console.error('Response text:', errorText)
        throw new Error(
          `Failed to create playlist. Response status: ${response.status}. Response text: ${errorText}`
        )
      }

      const playlistData = await response.json()
      customPlayLists.value.push(playlistData.items)
      // console.log(customPlayLists.value)
    } catch (error) {
      console.error('Something wrong, playlist unavailable', error)
    }
  }

  const getSingleCustomPlaylist = async (id) => {
    const accessToken = ref(localStorage.getItem('access_token') || null)

    if (!accessToken.value) {
      console.error('Access token is missing. Please authenticate the user.')
      return
    }

    try {
      const response = await fetch(`https://api.spotify.com/v1/playlists/${id}`, {
        headers: {
          Authorization: `Bearer ${accessToken.value}`
        }
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Error creating playlist. Response status:', response.status)
        console.error('Response text:', errorText)
        throw new Error(
          `Failed to create playlist. Response status: ${response.status}. Response text: ${errorText}`
        )
      }

      const playlistData = await response.json()
      singleCustomPlaylist.value = playlistData
      singlePlaylistLoaded.value = true
    } catch (error) {
      console.error('Something wrong, playlist unavailable', error)
    }
  }

  const addSongToCustomPlaylistFromArtist = async (track) => {
    const accessToken = ref(localStorage.getItem('access_token') || null)
    const playlistId = selectedPlaylist.value.split(';')[1].split(' ')[2]
    const trackUri = track.uri
    // console.log(playlistId)
    //console.log('TrackURi:', trackUri)

    if (!accessToken.value) {
      console.error('Access token is missing. Please authenticate the user.')
      return
    }

    try {
      const url = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken.value}`
        },
        body: JSON.stringify({
          uris: [trackUri]
        })
      }

      const response = await fetch(url, options)

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }

      const data = await response.json()
      console.log('Pesma je dodata u plejlistu:', data)
    } catch (error) {
      console.error('Can not add track', error)
    }
  }

  const addSongToCustomPlaylist = async (track) => {
    const accessToken = ref(localStorage.getItem('access_token') || null)
    const playlistId = selectedPlaylist.value.split(';')[1].split(' ')[2]
    const trackUri = track.track.uri
    // console.log(playlistId)
    //console.log('TrackURi:', trackUri)

    if (!accessToken.value) {
      console.error('Access token is missing. Please authenticate the user.')
      return
    }

    try {
      const url = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken.value}`
        },
        body: JSON.stringify({
          uris: [trackUri]
        })
      }

      const response = await fetch(url, options)

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }

      const data = await response.json()
      console.log('Pesma je dodata u plejlistu:', data)
    } catch (error) {
      console.error('Can not add track', error)
    }
  }

  const getSongFromCustomPlaylist = async (playlistId) => {
    const accessToken = ref(localStorage.getItem('access_token') || null)

    if (!accessToken.value) {
      console.error('Access token is missing. Please authenticate the user.')
      return
    }

    const playlistInfoUrl = `https://api.spotify.com/v1/playlists/${playlistId}`
    const playlistInfoOptions = {
      headers: {
        Authorization: `Bearer ${accessToken.value}`
      }
    }

    try {
      const response = await fetch(playlistInfoUrl, playlistInfoOptions)

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${await response.text()}`)
      }

      const data = await response.json()
      customPlaylistSongs.value = data
      songsLoaded.value = true
      //console.log('Custom playlist songs', customPlaylistSongs.value)
      //console.log('Custom songs', customPlaylistSongs.value.tracks.items)
    } catch (error) {
      console.error('Something wrong, playlist song unavailable', error)
    }
  }

  const deleteSongFromPlaylist = async (trackId, playlistId) => {
    const accessToken = ref(localStorage.getItem('access_token') || null)

    if (!accessToken.value) {
      console.error('Access token is missing. Please authenticate the user.')
      return
    }

    try {
      const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken.value}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tracks: [
            {
              uri: `spotify:track:${trackId}`
            }
          ]
        })
      })

      if (!response.ok) {
        throw new Error(
          `Nešto je pošlo po zlu prilikom brisanja pesme iz playliste. Status: ${response.status}`
        )
      }

      //console.log('Pesma je uspešno obrisana iz playliste.')
      // Dodajte logiku za osvežavanje komponente ili prikazivanje poruke korisniku
    } catch (error) {
      console.error('Greška prilikom brisanja pesme iz playliste:', error.message)
    }
  }

  const deleteCustomPlaylist = async (playlistId) => {
    const accessToken = ref(localStorage.getItem('access_token') || null)

    if (!accessToken.value) {
      console.error('Access token is missing. Please authenticate the user.')
      return
    }

    try {
      const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/followers`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken.value}`
        }
      })

      if (response.ok) {
        //getCustomPlayLists()
        //console.log('Playlista je uspešno obrisana.', customPlayLists.value)
        curPlaylistDeleted.value = true
      } else {
        console.error('Nešto je pošlo po zlu prilikom brisanja playliste.', await response.text())
      }
    } catch (error) {
      console.error('Greška prilikom brisanja playliste:', error)
    }
  }

  return {
    getUserId,
    makeCustomPlaylist,
    playlistName,
    playlistDesc,
    getCustomPlayLists,
    customPlayLists,
    selectedPlaylist,
    addSongToCustomPlaylist,
    addSongToCustomPlaylistFromArtist,
    getSongFromCustomPlaylist,
    getSingleCustomPlaylist,
    singleCustomPlaylist,
    customPlaylistSongs,
    deleteSongFromPlaylist,
    deleteCustomPlaylist,
    songsLoaded,
    singlePlaylistLoaded,
    curPlaylistDeleted,
    curPlaylistCreated
  }
})

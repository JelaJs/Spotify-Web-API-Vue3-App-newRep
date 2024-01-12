# SpotifywebAPI-Vue3App

To develop this Vue application, I used Spotify Web API (https://developer.spotify.com/documentation/web-api) to catch and manage data from Spotify. For state management I used
Pinia, for style CSS with media query for responsive.

######

# Development App.vue

The first thing I had to do was to go to https://developer.spotify.com/documentation/web-api and make my App. There I had to grab the client ID and secret ID which I used for my first API call to Authorize user.

After the user clicks on the authorize button, he will be navigated to the Spotify page where he needs to log in and accept terms of use. After that, he will be redirected to the home page of my app and he will get an Access token for Every API call and Refresh token to replace Access token in the case he was expired. Both the Access token and Refresh token
are stored in local storage. The function responsible for checking and refreshing the Access token is called "checkAndRefreshAccessToken" and it's called before every API call where
we need an Access token.

In this component we also have functions for Logout, and for opening and closing the responsive mobile menu.

######

# Development HomeView.vue

After authorization, the user will be redirected to this component. In this component, he will list the most popular artists in different categories and he can choose and click on
any of these artists. Besides that, the user has a search bar where he can search for his favorite artist and click on that.

To represent the different artists in several categories I used different API calls and for each call, I added the artist ID I needed, and every one of these functions is called on "onMounted" hook, so after the user gets navigated to this component he will get the artist listed.

For searching artist feature we have v-model on inputName which allows us to record changes, and "@input" we call function getArtistID. "@input" will wait for chages and trigger the function.

The getArtistID function, in each call, has clearTimeout at the beginning, and besides that, it will trigger the async function every 0.3s after the change. In that async function, he will await "checkAndRefreshAccessToken" and after that we have artistName = inputName.value and that is forwarded in the API call. If the API call is successful we set firstArtist = searchData.artists.items[0] and from that, we get an ID and pass to await getSearchedArtists(firstArtist.id). If the call is rejected we set noArtists.value = true to show the message and throw a new Error with the message.

If the user decides to click on any of the artists he will be redirected to the "SingleArtistView.vue" using @click="goToArtistPage". After he gets on the SingleArtist page there he will get listed artist albums and each album will navigate to the "SingleArtistSongsView.vue" where he can listen to songs from that album, and also he can add songs to the custom playlist(more about that later).

######

# Development CategoriesView.vue

The next component from the sidebar where the user can navigate is this component. There users will have different categories listed and the possibility to search for each category.
To get categories listed I used "getCategories" function. This function also uses "checkAndRefreshAccessToken" to check if the access token is expired, and after that, for a successful response on an API call, I get categories.value = data.categories.items which I used in the filterCategories function to filter over data and to return filteredCategories which I used in the template with v-for in combination with v-if on the parent component to list all categories.

Each of the categories has @click="goToSingleCategorie(category.id)". This function will navigate the user to the "SingleCategoryView.vue" component where he will get 20 songs from the category listed. The user can listen to the songs and also can add songs to a custom playlist.

######

# Development AudioPlayer.vue

This component is development with global pinia statement player.js. After we first play song from categories, custom playlist, or single arist we trigger player.playSong(track, uri, playlistUri, playlist) where we pass current data from the place where we play a song, and with that the player know which song is the next and previous for that current playlist.

After the user plays the song in the AudioPLayer.vue component he can change the volume of the song, he can see song duration and current duration and also he can rewind the song, can play the next and previous song from the playlist and he can pause and play the song.

In the AudioPlayer.vue component we have functions like pause, resume, skipToNextSong, skipToPrevSong and it checks for an access token and calls the proper function from player.js where all API calls for the player are placed.

######

# Development Custom Playlist

On the left side, the sidebar user has a "+" button which will give him a form where he can add a name and the description for the custom playlist. In this case, the name of the playlist is mandatory and the description is optional. This is placed in the "CustomPLaylist.vue". After the user adds a name and presses create playlist button the form will call "createCustomPlaylist" function which will call playlist.makeCustomPlaylist() from CustomPlaylist.js and besides that clear name and description fields.
playlist.makeCustomPlaylist() will pass the userId in the API call and in the body it will set the name and description that we added. Besides that, it will push the current created
playlist in the "customPlayLists" and set "curPlaylistCreated.value = true". This "customPlayLists" I used to list all custom playlists in the CustomPlaylist.vue.

After we click on any of the custom playlists it will navigate us to SingleCustomPLaylist.vue where the user can listen to added songs, delete current songs from the playlist, and also delete the whole playlist which will disappear from the list automatically.

In each of the components where the user has listed songs, he can also add that song to the custom playlist, he can do that by clicking the "+" button on the right side of each song.
After he click "+" trigger @click.stop="addTrackToPlaylist(track) function. The function will check if we have a playlist selected if not it will open a "PlaylistOptions.vue" popup where the user can choose which playlist he wants to add a song. After he chooses he can click again the "+" button and add the song. The second click will trigger the playlist.addSongToCustomPlaylist(track) from "CustomPlaylist.js" and after that, it will clear the chosen playlist so the user can choose again.

######

# Development index.js

Every main component is added to index.js and that component is rendered in "<RouterView />" depending on the URL where we are navigated.

import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import CategoriesView from '../views/CategoriesView.vue'
import SingleCategory from '../views/SingleCategoryView.vue'
import SingleCustomPlaylist from '../views/SingleCustomPlaylist.vue'
import SingleArtist from '../views/SingleArtistView.vue'
import SingleArtistSongs from '../views/SingleArtistSongsView.vue'
import PageNotFound from '../views/PageNotFoundView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/categories',
      name: 'categories',
      component: CategoriesView
    },
    {
      path: '/category/:id',
      name: 'categoty',
      component: SingleCategory
    },
    {
      path: '/playlist/:id',
      name: 'customPlaylist',
      component: SingleCustomPlaylist
    },
    {
      path: '/artist/:id',
      name: 'singleArtist',
      component: SingleArtist
    },
    {
      path: '/artistsongs/:id',
      name: 'singleArtistSongs',
      component: SingleArtistSongs
    },
    {
      path: '/:catchAll(.*)',
      name: 'NotFound',
      component: PageNotFound
    }
  ],
  scrollBehavior() {
    return { top: 0, left: 0 }
  }
})

export default router

<template>
  <div class="category-header">
    <h1>Categories:</h1>
    <input
      v-model="inputContent"
      type="text"
      placeholder="Search for category..."
      @input="filterCategories"
    />
  </div>
  <div
    style="margin-top: 20px; padding-left: 20px"
    v-if="filteredCategories.length === 0 && !error"
  >
    <p>No matching results for your query...</p>
  </div>
  <div v-if="error"><p>Error with fetching data, try again later...</p></div>
  <div v-else class="categories-wrap">
    <div
      class="single-category-box"
      v-for="category in filteredCategories"
      :key="category.id"
      @click="goToSingleCategorie(category.id)"
    >
      <img :src="category.icons[0].url" alt="Category cover" />
      <p>{{ category.name }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, inject } from 'vue'
import { useRouter } from 'vue-router'

const accessToken = ref(localStorage.getItem('access_token') || null)
const categories = ref(null)
const error = ref(false)
const router = useRouter()
const queryTimeuot = ref(null)
const inputContent = ref('')
const filteredCategories = ref([])

const checkAndRefreshAccessToken = inject('checkAndRefreshAccessToken')

const getCategories = async () => {
  await checkAndRefreshAccessToken()

  try {
    const response = await fetch('https://api.spotify.com/v1/browse/categories?limit=20', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken.value}`
      }
    })

    // Provjeri status odgovora
    if (response.ok) {
      const data = await response.json()
      categories.value = data.categories.items
      //console.log(categories.value)

      // Obradi podatke od API poziva
    } else {
      error.value = true
      throw new Error(`Error: ${response.status}`)
    }
  } catch (error) {
    console.error(error)
    error.value = true
  }
}

const filterCategories = () => {
  clearTimeout(queryTimeuot.value)
  queryTimeuot.value = setTimeout(() => {
    filteredCategories.value = categories.value.filter((category) => {
      if (inputContent.value !== '') {
        return category.name.toLowerCase().includes(inputContent.value.toLowerCase())
      } else {
        return filteredCategories.value
      }
    })
  }, 300)
}

const goToSingleCategorie = (id) => {
  router.push(`/category/${id}`)
}

onMounted(getCategories)
onMounted(async () => {
  // Dohvati kategorije asinkrono prije nego što postaviš inicijalne filtrirane kategorije
  await getCategories()
  // Postavi inicijalno filtrirane kategorije na sve kategorije
  filteredCategories.value = categories.value
})
</script>

<style scoped>
.category-header {
  display: flex;
  gap: 20px;
  align-items: center;
}

.category-header input {
  border: none;
  outline: none;
  padding: 15px 10px;
  color: rgba(255, 255, 255, 0.76);
  font-size: 12px;
  border-radius: 10px;
  background-color: #0a0a0a;
  width: 50%;
}

.categories-wrap {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
  gap: 10px;
  margin-top: 20px;
}

.categories-wrap .single-category-box {
  position: relative;
  width: 300px;
  height: 300px;
  cursor: pointer;
}

.categories-wrap .single-category-box img {
  width: 300px;
  height: 300px;
  border-radius: 10px;
}

.categories-wrap .single-category-box p {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translate(-50%, 0);
  font-size: 18px;
}

/*Responsive*/
@media (max-width: 1804px) {
  .categories-wrap .single-category-box {
    width: 250px;
    height: 250px;
  }
  .categories-wrap .single-category-box img {
    width: 250px;
    height: 250px;
  }
}

@media (max-width: 1642px) {
  .categories-wrap {
    grid-template-columns: 1fr 1fr 1fr 1fr;
  }
}

@media (max-width: 1400px) {
  h1 {
    font-size: 24px;
  }

  .categories-wrap .single-category-box {
    width: 200px;
    height: 200px;
  }
  .categories-wrap .single-category-box img {
    width: 200px;
    height: 200px;
  }
}

@media (max-width: 1200px) {
  .categories-wrap {
    grid-template-columns: 1fr 1fr 1fr;
  }
}

@media (max-width: 1060px) {
  .categories-wrap .single-category-box {
    width: 200px;
    height: 200px;
  }
  .categories-wrap .single-category-box img {
    width: 200px;
    height: 200px;
  }
}

@media (max-width: 915px) {
  .categories-wrap {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 740px) {
  .category-header {
    flex-direction: column;
    align-items: start;
  }

  .category-header input {
    width: 100%;
  }

  .categories-wrap .single-category-box {
    width: 150px;
    height: 150px;
  }
  .categories-wrap .single-category-box img {
    width: 150px;
    height: 150px;
  }
}

@media (max-width: 575px) {
  .categories-wrap {
    grid-template-columns: 1fr;
  }
}

/**Transition */
</style>

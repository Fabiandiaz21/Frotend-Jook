<template>
  <q-card flat class="q-ma-md">
    <q-card-section>
      <div class="text-h6 q-pb-md text-center text-weight-bold">Explora por Categorías</div>
    </q-card-section>

    <q-carousel v-model="categorySlide" transition-prev="scale" transition-next="scale" swipeable animated
      control-color="primary" navigation padding arrows height="260px"
      class="bg-white rounded-borders category-carousel" @mouseenter="stopCategoryAutoplay" @mouseleave="startCategoryAutoplay">
      <q-carousel-slide v-for="(chunk, index) in categoryChunks" :key="index" :name="index"
        class="column no-wrap flex-center">
        <TransitionGroup name="cards-slide" tag="div" class="row q-gutter-md justify-center full-width">
          <q-card v-for="(category, cardIndex) in chunk" :key="category._id"
            class="category-card cursor-pointer q-hoverable col-xs-5 col-sm-3 col-md-2"
            @click="selectCategory(category)" :data-index="cardIndex">
            <span class="q-focus-helper"></span>
            <q-img :src="category.image || 'https://cdn.quasar.dev/img/mountains.jpg'" :ratio="1" class="category-img">
              <div class="absolute-bottom text-center category-name">
                {{ category.name }}
              </div>
            </q-img>
          </q-card>
        </TransitionGroup>
      </q-carousel-slide>
    </q-carousel>
  </q-card>


  <q-card flat class="q-ma-md">
    <q-card-section>
      <div class="text-h6 q-pb-md text-center text-weight-bold">Explora por Marcas</div>
    </q-card-section>

    <q-carousel v-model="brandSlide" transition-prev="scale" transition-next="scale" swipeable animated
      control-color="primary" navigation padding arrows height="260px" class="bg-white rounded-borders brand-carousel"
      @mouseenter="stopBrandAutoplay" @mouseleave="startBrandAutoplay">
      <q-carousel-slide v-for="(chunk, index) in brandChunks" :key="index" :name="index"
        class="column no-wrap flex-center">
        <TransitionGroup name="cards-slide" tag="div" class="row q-gutter-md justify-center full-width">
          <q-card v-for="(brand, cardIndex) in chunk" :key="brand.name"
            class="brand-card cursor-pointer q-hoverable col-xs-5 col-sm-3 col-md-2" @click="selectBrand(brand)"
            :data-index="cardIndex">
            <span class="q-focus-helper"></span>
            <q-img :src="brand.image || 'https://cdn.quasar.dev/img/material.png'" :ratio="1" class="brand-img">
              <div class="absolute-bottom text-center brand-name"> {{ brand.name }}
              </div>
            </q-img>
          </q-card>
        </TransitionGroup>
      </q-carousel-slide>
    </q-carousel>
  </q-card>

</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { getData } from '../services/jook';

// --- Props ---
const props = defineProps({
  categoriesPerPage: {
    type: Number,
    default: 5
  },
  brandsPerPage: {
    type: Number,
    default: 5
  }
});

// --- Common Setup ---
const router = useRouter();
const $q = useQuasar();

// --- Category Carousel Logic ---
const categorySlide = ref(0);
const categoryAutoplay = ref(true);
const categories = ref([]);

const categoryChunks = computed(() => {
  const chunks = [];
  for (let i = 0; i < categories.value.length; i += props.categoriesPerPage) {
    chunks.push(categories.value.slice(i, i + props.categoriesPerPage));
  }
  return chunks;
});

const fetchCategories = async () => {
  try {
    const response = await getData('/categoria');
    if (Array.isArray(response)) {
      categories.value = response;
    } else {
      console.warn('La respuesta de la API de categorías no es un array:', response);
      categories.value = [];
    }
  } catch (err) {
    console.error('Error al cargar categorías para el carrusel:', err);
    $q.notify({ type: 'negative', message: 'Error al cargar categorías para el carrusel' });
  }
};

const selectCategory = (category) => {
  if (category && category._id) {
    router.push(`/vistacategoria/${category._id}`);
  } else {
    console.warn('La categoría no tiene un ID válido:', category);
  }
};

let categoryAutoplayInterval;
const startCategoryAutoplay = () => {
  stopCategoryAutoplay(); // Clear any existing interval
  categoryAutoplayInterval = setInterval(() => {
    if (categoryAutoplay.value && categoryChunks.value.length > 1) {
      categorySlide.value = (categorySlide.value + 1) % categoryChunks.value.length;
    }
  }, 5000);
};

const stopCategoryAutoplay = () => {
  clearInterval(categoryAutoplayInterval);
};

// --- Brand Carousel Logic ---
const brandSlide = ref(0);
const brandAutoplay = ref(true);
const brands = ref([]);

const brandChunks = computed(() => {
  const chunks = [];
  for (let i = 0; i < brands.value.length; i += props.brandsPerPage) {
    chunks.push(brands.value.slice(i, i + props.brandsPerPage));
  }
  return chunks;
});

// ... (resto del código del script)

const fetchBrands = async () => {
  try {
    const response = await getData('/producto/marcas'); 
    if (Array.isArray(response)) {
      const uniqueBrands = [...new Set(response.filter(Boolean))]; 
      
      brands.value = uniqueBrands.map(brandName => ({
        name: brandName,
        image: 'https://cdn.quasar.dev/img/material.png' // Default image for brands
      }));
      
      // Puedes añadir un log para ver qué hay en brands.value justo antes de que se use
      console.log('Marcas procesadas para el carrusel:', brands.value);

    } else {
      console.warn('La respuesta de la API de marcas no es un array o está vacía:', response);
      brands.value = [];
    }
  } catch (err) {
    console.error('Error al cargar marcas para el carrusel:', err);
    $q.notify({ type: 'negative', message: 'Error al cargar marcas para el carrusel' });
  }
};

// ... (resto del código del script)

const selectBrand = (brand) => {
  if (brand && brand.name) {
    router.push(`/vistamarca/${brand.name}`);
  } else {
    console.warn('La marca no tiene un nombre válido:', brand);
  }
};

let brandAutoplayInterval;
const startBrandAutoplay = () => {
  stopBrandAutoplay(); // Clear any existing interval
  brandAutoplayInterval = setInterval(() => {
    if (brandAutoplay.value && brandChunks.value.length > 1) {
      brandSlide.value = (brandSlide.value + 1) % brandChunks.value.length;
    }
  }, 5000);
};

const stopBrandAutoplay = () => {
  clearInterval(brandAutoplayInterval);
};

// --- Lifecycle Hooks ---
onMounted(() => {
  fetchCategories();
  fetchBrands();
  startCategoryAutoplay();
  startBrandAutoplay();
});

onUnmounted(() => {
  stopCategoryAutoplay();
  stopBrandAutoplay();
});
</script>

<style lang="scss" scoped>
.category-card, .brand-card {
  width: 140px; // Adjust as needed
  height: 140px; // Ensure consistent height
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  overflow: hidden;

  .category-img, .brand-img {
    height: 100%;
    width: 100%;
    object-fit: cover; // Ensures the image covers the area without distortion
  }

  .category-name, .brand-name {
    padding: 4px;
    font-size: 0.85em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;
    background: rgba(0, 0, 0, 0.6); // Darker background for better text readability
  }
}

// Transition styles for the cards within the carousel slides
.cards-slide-enter-active,
.cards-slide-leave-active {
  transition: all 0.5s ease;
}
.cards-slide-enter-from,
.cards-slide-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
.cards-slide-leave-active {
  position: absolute; // To prevent cards from jumping when one leaves
}
</style>
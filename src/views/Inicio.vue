<template>
  <div class="page-container">
    <!-- Featured Tech Slider (Full Width) -->
    <div class="full-width-slider">
      <q-carousel v-model="featuredSlide" animated infinite autoplay arrows control-color="brown-6" height="500px"
        class="full-width-carousel">
        <q-carousel-slide v-for="(slide, index) in featuredSlides" :key="index" :name="index" class="column no-wrap">
          <div class="row fit justify-start items-center q-gutter-xs q-col-gutter no-wrap">
            <q-img :src="slide.image" class="full-height full-width-slide-img" spinner-color="brown-6">
              <div class="absolute-bottom full-width-slide-overlay">
                <div class="text-h2 text-weight-bold text-white">{{ slide.title }}</div>
                <div class="text-h5 q-mb-lg">{{ slide.description }}</div>
              </div>
            </q-img>
          </div>
        </q-carousel-slide>
      </q-carousel>
    </div>

    <!-- Services Cards -->
    <div class="row q-ma-xl q-gutter-xl justify-center">
      <q-card class="service-card bg-brown-1">
        <q-card-section class="text-center">
          <q-icon name="assignment_return" size="xl" color="brown-8" class="service-icon" />
          <div class="text-h4 q-mt-md text-brown-10">Devoluciones Fáciles</div>
          <p class="text-h6 text-brown-9 q-mt-sm">30 días para devoluciones sin complicaciones</p>
        </q-card-section>
      </q-card>

         <q-card class="service-card bg-brown-1" @click="router.push('/productos')" style="cursor:pointer;">
        <q-card-section class="text-center">
          <q-icon name="library_books" size="xl" color="brown-8" class="service-icon"/>
          <div class="text-h4 q-mt-md text-brown-10">Catálogo Completo </div>
          <p class="text-h6 text-brown-9 q-mt-sm">Explora todos nuestros productos tecnológicos</p>
        </q-card-section>
      </q-card>

      <q-card class="service-card bg-brown-1">
        <q-card-section class="text-center">
          <q-icon name="support_agent" size="xl" color="brown-8" class="service-icon" />
          <div class="text-h4 q-mt-md text-brown-10">Soporte 24/7</div>
          <p class="text-h6 text-brown-9 q-mt-sm">Asistencia técnica disponible en todo momento</p>
        </q-card-section>
      </q-card>

    </div>

    <!-- Categories Carousel -->
    <q-card flat class="q-ma-xl">
      <q-card-section>
        <div class="text-h3 q-pb-xl text-center text-weight-bold text-brown-8">Explora por Categorías</div>
      </q-card-section>

      <q-carousel v-model="categorySlide" transition-prev="scale" transition-next="scale" swipeable animated
        control-color="brown-6" padding arrows height="300px"
        class="bg-brown-1 rounded-borders category-carousel shadow-3" @mouseenter="stopCategoryAutoplay"
        @mouseleave="startCategoryAutoplay">
        <q-carousel-slide v-for="(chunk, index) in categoryChunks" :key="index" :name="index" class="column no-wrap">
          <div class="row no-wrap justify-center q-px-xl">
            <q-card v-for="(category, cardIndex) in chunk" :key="category._id"
              class="category-card cursor-pointer q-hoverable q-mx-sm" @click="selectCategory(category)"
              :data-index="cardIndex">
              <span class="q-focus-helper"></span>
              <q-img :src="category.image || 'https://cdn.quasar.dev/img/mountains.jpg'" :ratio="1"
                class="category-img">
                <div class="absolute-bottom text-center category-name">
                  <span class="text-h5">{{ category.name }}</span>
                </div>
              </q-img>
            </q-card>
          </div>
        </q-carousel-slide>
      </q-carousel>
    </q-card>

    <!-- Brands Carousel -->
    <q-card flat class="q-ma-xl">
      <q-card-section>
        <div class="text-h3 q-pb-xl text-center text-weight-bold text-brown-8">Nuestras Marcas</div>
      </q-card-section>

      <q-carousel v-model="brandSlide" transition-prev="scale" transition-next="scale" swipeable animated
        control-color="brown-6" padding arrows height="300px" class="bg-brown-1 rounded-borders brand-carousel shadow-3"
        @mouseenter="stopBrandAutoplay" @mouseleave="startBrandAutoplay">
        <q-carousel-slide v-for="(chunk, index) in brandChunks" :key="index" :name="index" class="column no-wrap">
          <div class="row no-wrap justify-center q-px-xl">
            <q-card v-for="(brand, cardIndex) in chunk" :key="brand.name"
              class="brand-card cursor-pointer q-hoverable q-mx-sm" @click="selectBrand(brand)" :data-index="cardIndex">
              <span class="q-focus-helper"></span>
              <q-img :src="brand.image || 'https://cdn.quasar.dev/img/material.png'" :ratio="1" class="brand-img">
                <div class="absolute-bottom text-center brand-name">
                  <span class="text-h5">{{ brand.name }}</span>
                </div>
              </q-img>
            </q-card>
          </div>
        </q-carousel-slide>
      </q-carousel>
    </q-card>

    <!-- Compact Full-Width Footer -->
    <footer class="compact-full-width-footer bg-brown-9">
      <div class="footer-content">
        <div class="footer-section">
          <h4 class="text-h4 text-white">TecnoShop</h4>
          <p class="text-subtitle1 text-brown-2 q-mt-md">Tu tienda de tecnología confiable con los mejores productos y
            precios.</p>
        </div>

        <div class="footer-section">
          <h4 class="text-h4 text-white">Categorías</h4>
          <ul class="footer-links">
            <li><a href="#" class="text-subtitle1">Computadoras</a></li>
            <li><a href="#" class="text-subtitle1">Smartphones</a></li>
            <li><a href="#" class="text-subtitle1">Tablets</a></li>
          </ul>
        </div>

        <div class="footer-section">
          <h4 class="text-h4 text-white">Contacto</h4>
          <p class="text-subtitle1 text-brown-2"><q-icon name="email" /> contacto@tecnoshop.com</p>
          <p class="text-subtitle1 text-brown-2"><q-icon name="phone" /> +1 234 567 890</p>
        </div>

        <div class="footer-section">
          <h4 class="text-h4 text-white">Newsletter</h4>
          <q-input outlined dense bg-color="brown-8" color="brown-2" placeholder="Tu correo electrónico"
            class="q-mb-sm">
            <template v-slot:append>
              <q-btn icon="send" color="brown-6" dense flat />
            </template>
          </q-input>

          <div class="social-icons q-mt-md">
            <q-btn flat round dense icon="facebook" class="social-icon text-brown-2" />
            <q-btn flat round dense icon="twitter" class="social-icon text-brown-2" />
            <q-btn flat round dense icon="instagram" class="social-icon text-brown-2" />
          </div>
        </div>
      </div>

      <div class="footer-bottom bg-brown-10">
        <div class="footer-bottom-content">
          <p class="text-caption text-brown-3">&copy; 2023 TecnoShop. Todos los derechos reservados.</p>
          <div class="footer-links">
            <a href="#" class="text-caption">Términos</a>
            <a href="#" class="text-caption">Privacidad</a>
          </div>
        </div>
      </div>
    </footer>
  </div>
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

// Computed properties for responsive items per page
const responsiveCategoriesPerPage = computed(() => {
  if ($q.screen.width < 768) return 2; // móvil
  if ($q.screen.width < 1300) return 4; // 1300px o menos
  return props.categoriesPerPage; // default (5)
});

const responsiveBrandsPerPage = computed(() => {
  if ($q.screen.width < 768) return 2; // móvil
  if ($q.screen.width < 1300) return 4; // 1300px o menos
  return props.brandsPerPage; // default (5)
});

// --- Featured Tech Slider ---
const featuredSlide = ref(0);
const featuredSlides = ref([
  {
    image: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    title: 'JOOK - Tecnología de Vanguardia',
    description: 'Descubre la mejor selección de productos tecnológicos para tu hogar y oficina'
  },
  {
    image: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1967&q=80',
    title: 'Innovación a Tu Alcance',
    description: 'Las últimas novedades tecnológicas al mejor precio del mercado'
  },
  {
    image: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2080&q=80',
    title: 'Expertos en Tecnología',
    description: 'Más de 10 años brindando soluciones tecnológicas de calidad'
  },
  {
    image: 'https://images.unsplash.com/photo-1558126319-c9feecbf57ee?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    title: 'Compra con Confianza',
    description: 'Garantía extendida en todos nuestros productos y soporte técnico especializado'
  }
]);

// --- Category Carousel Logic ---
const categorySlide = ref(0);
const categoryAutoplay = ref(true);
const categories = ref([]);

const categoryChunks = computed(() => {
  const chunks = [];
  const perPage = responsiveCategoriesPerPage.value;
  for (let i = 0; i < categories.value.length; i += perPage) {
    chunks.push(categories.value.slice(i, i + perPage));
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
  const perPage = responsiveBrandsPerPage.value;
  for (let i = 0; i < brands.value.length; i += perPage) {
    chunks.push(brands.value.slice(i, i + perPage));
  }
  return chunks;
});

// ...
const fetchBrands = async () => {
  try {
    const response = await getData('/marca');
    if (Array.isArray(response)) {
      brands.value = response
        .filter(brand => brand !== null && brand !== undefined)
        .map(brand => ({
          // Asegúrate de incluir el _id (o el campo que represente el ID único)
          _id: brand._id, // Asumiendo que tu API devuelve _id para marcas
          name: brand.nombre,
          image: brand.image || 'https://cdn.quasar.dev/img/material.png'
        }));

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
// ...

const selectBrand = (brand) => {
  if (brand && brand._id) {
    router.push(`/vistamarca/${brand._id}`);
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
/* Full Width Slider */
.full-width-slider {
  width: 100vw;
  position: relative;
  left: 50%;
  right: 50%;
  margin-left: -50vw;
  margin-right: -50vw;
  margin-bottom: 60px;

  .full-width-carousel {
    border-radius: 0 !important;

    .q-carousel__arrow {
      margin: 0 50px;
      background: rgba(255, 255, 255, 0.3);
      backdrop-filter: blur(5px);
      border-radius: 50%;
      width: 50px;
      height: 50px;

      &:hover {
        background: rgba(255, 255, 255, 0.5);
      }
    }
  }

  .full-width-slide-img {
    object-fit: cover;
  }

  .full-width-slide-overlay {
    background: linear-gradient(to top, rgba(44, 33, 27, 0.85), transparent);
    padding: 80px;
    color: white;
    text-align: center;

    .text-h2 {
      font-weight: bold;
      text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.7);
      margin-bottom: 20px;
      font-size: 3.5rem;
    }

    .text-h5 {
      text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.7);
      max-width: 900px;
      margin: 0 auto 30px;
      font-size: 1.8rem;
    }
  }
}

/* Services Cards */
.service-card {
  width: 100%;
  max-width: 320px;
  height: 280px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border-radius: 16px !important;

  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 15px 30px rgba(89, 71, 58, 0.3) !important;
    background: #efebe9 !important;
  }

  .q-card__section {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 30px;
  }

  .service-icon {
    font-size: 3.5rem;
  }
}

/* Category and Brand Cards - MODIFIED */
.category-carousel,
.brand-carousel {
  .q-carousel__slide {
    padding: 0 !important;
    display: flex;
    align-items: center;
    /* Centra verticalmente las cards */
  }

  .q-carousel__arrow {
    margin: 0 20px;
    background: rgba(89, 71, 58, 0.3);
    backdrop-filter: blur(5px);
    border-radius: 50%;
    width: 40px;
    height: 40px;

    &:hover {
      background: rgba(89, 71, 58, 0.5);
    }
  }
}

.category-card,
.brand-card {
  width: 220px;
  height: 220px;
  min-width: 220px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border-radius: 16px !important;
  border: 1px solid #d7ccc8;
  margin: 30px;
  /* Añade margen vertical */

  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 15px 30px rgba(89, 71, 58, 0.3) !important;
  }

  .category-img,
  .brand-img {
    height: 100%;
    width: 100%;
    object-fit: cover;
  }

  .category-name,
  .brand-name {
    padding: 16px;
    width: 100%;
    background: rgba(89, 71, 58, 0.9);
    color: white;
    font-weight: 500;
    border-bottom-left-radius: 16px;
    border-bottom-right-radius: 16px;

    span {
      display: block;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}

/* Compact Full Width Footer */
.compact-full-width-footer {
  width: 100vw;
  position: relative;
  left: 50%;
  right: 50%;
  margin-left: -50vw;
  margin-right: -50vw;
  padding: 40px 0 0;

  .footer-content {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 40px;

    .footer-section {
      flex: 1;
      min-width: 250px;
      margin-bottom: 30px;
      padding: 0 20px;

      h4 {
        margin-bottom: 15px;
        font-size: 1.25rem;
        position: relative;
        padding-bottom: 10px;

        &::after {
          content: '';
          position: absolute;
          left: 0;
          bottom: 0;
          width: 50px;
          height: 2px;
          background: #a1887f;
        }
      }

      p {
        margin-bottom: 10px;
        line-height: 1.4;
        font-size: 0.9rem;
      }

      .footer-links {
        list-style: none;
        padding: 0;

        li {
          margin-bottom: 8px;

          a {
            color: #d7ccc8;
            text-decoration: none;
            transition: color 0.3s ease;
            font-size: 0.9rem;

            &:hover {
              color: white;
              text-decoration: underline;
            }
          }
        }
      }
    }

    .social-icons {
      display: flex;
      gap: 15px;

      .social-icon {
        transition: color 0.3s ease;
        font-size: 1.5rem;

        &:hover {
          color: #a1887f !important;
        }
      }
    }
  }

  .footer-bottom {
    padding: 20px 0;

    .footer-bottom-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;

      p,
      a {
        font-size: 0.75rem;
      }

      .footer-links {
        display: flex;
        gap: 15px;

        a {
          color: #a1887f;
          text-decoration: none;
          transition: color 0.3s ease;

          &:hover {
            color: #d7ccc8;
          }
        }
      }
    }
  }
}

/* Responsive Adjustments - MODIFIED */
@media (max-width: 1440px) {
  .full-width-slide-overlay {
    padding: 60px !important;

    .text-h2 {
      font-size: 3rem !important;
    }

    .text-h5 {
      font-size: 1.5rem !important;
    }
  }
}

@media (max-width: 1300px) {
  .service-card {
    max-width: 280px;
    height: 260px;

    .text-h4 {
      font-size: 1.6rem !important;
    }

    .text-h6 {
      font-size: 1.1rem !important;
    }
  }

  .category-card,
  .brand-card {
    width: 200px;
    height: 200px;
    min-width: 200px;
    margin: 20px;

    .category-name,
    .brand-name {
      padding: 12px;

      span {
        font-size: 1.2rem;
      }
    }
  }
}

@media (max-width: 1475px) {
  .full-width-slide-overlay {
    padding: 40px !important;

    .text-h2 {
      font-size: 2.5rem !important;
    }

    .text-h5 {
      font-size: 1.3rem !important;
    }
  }

  .service-card {
    height: 240px;
    max-width: 280px;

    .service-icon {
      font-size: 3rem;
    }
  }

  .category-card,
  .brand-card {
    width: 180px;
    height: 180px;
    min-width: 180px;
  }
}

@media (max-width: 768px) {
  .full-width-slider {
    height: 400px !important;

    .full-width-slide-overlay {
      padding: 30px !important;

      .text-h2 {
        font-size: 2rem !important;
        margin-bottom: 15px;
      }

      .text-h5 {
        font-size: 1.1rem !important;
        margin-bottom: 20px;
      }
    }

    .q-carousel__arrow {
      margin: 0 20px !important;
      width: 40px !important;
      height: 40px !important;
    }
  }

  .service-card {
    max-width: 100%;
    height: 200px;

    .text-h4 {
      font-size: 1.5rem !important;
    }

    .text-h6 {
      font-size: 1rem !important;
    }
  }

  /* Modified for responsive cards */
  .category-carousel,
  .brand-carousel {
    .row.no-wrap {
      flex-wrap: wrap !important;
      justify-content: center !important;
      overflow-x: hidden !important;
      width: 100% !important;
    }

    .category-card,
    .brand-card {
      width: calc(50% - 20px) !important;
      min-width: auto !important;
      margin: 10px !important;
      height: 160px;
    }
  }

  .category-card,
  .brand-card {
    .text-h5 {
      font-size: 1rem !important;
    }
  }

  .compact-full-width-footer {
    .footer-content {
      flex-direction: column;
      padding: 0 30px !important;

      .footer-section {
        text-align: center;
        margin-bottom: 30px;

        h4::after {
          left: 50% !important;
          transform: translateX(-50%) !important;
        }

        .footer-links {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 15px;

          li {
            margin-bottom: 8px;
          }
        }
      }

      .social-icons {
        justify-content: center;
        gap: 15px;
      }
    }

    .footer-bottom-content {
      flex-direction: column;
      gap: 10px;
      text-align: center;

      .footer-links {
        justify-content: center !important;
        flex-wrap: wrap;
        gap: 15px !important;
      }
    }
  }
}

@media (max-width: 480px) {
  .full-width-slider {
    height: 350px !important;
  }

  .service-card {
    height: 180px;

    .service-icon {
      font-size: 2.5rem;
    }

    .text-h4 {
      font-size: 1.3rem !important;
    }
  }

  /* 2 cards on very small screens */
  .category-carousel,
  .brand-carousel {

    .category-card,
    .brand-card {
      width: calc(50% - 20px) !important;
    }
  }

  .category-card,
  .brand-card {
    width: 130px;
    height: 130px;
  }
}
</style>
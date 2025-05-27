<template>
  <div class="page-wrapper">

    <div class="filter-bar">
      <div v-for="filterGroup in filterOptions" :key="filterGroup.label" class="filter-select">
        <label :for="filterGroup.label">{{ filterGroup.label }}</label>
        <select :id="filterGroup.label" v-model="selectedFilters[filterGroup.label]" @change="applyFilters">
          <option value="">Todos</option>
          <option v-for="option in filterGroup.options" :key="option" :value="option">
            {{ option }}
          </option>
        </select>
      </div>
    </div>

    <div v-for="(carousel, index) in carouselsData" :key="index" class="carousel-container">
      <div class="carousel">
        <button class="carousel-btn left" @click="moveCarousel(index, 'left')">
          &#9664;
        </button>

        <div class="carousel-items" :style="{ transform: 'translateX(' + carouselPositions[index] + 'px)' }"
          ref="carousels">
          <div class="carousel-item" v-for="(item, i) in carousel" :key="i">
            <a :href="item.url" target="_blank">
              <img :src="item.img" alt="Producto" class="product-img imagen-problematica" style="width: 180px; height: 180px;">
            </a>
            <div class="product-info">
              <p class="price">{{ item.price }}</p>
              <p class="desc">{{ item.desc }}</p>
              <p class="discount">{{ item.discount }}</p>
            </div>
          </div>
        </div>

        <button class="carousel-btn right" @click="moveCarousel(index, 'right')">
          &#9654;
        </button>
      </div>
    </div>

    <div class="all-products-container">
      <h2>Todos los Productos</h2>
      <div class="product-grid">
        <div v-for="product in products" :key="product._id" class="product-card">
          <a :href="`/product/${product._id}`" target="_blank">
            <img :src="product.images?.[0] || 'https://via.placeholder.com/200'" alt="Producto" class="product-img">
          </a>
          <div class="product-info">
            <p class="price">{{ `$${product.price}` }}</p>
            <p class="desc">{{ product.nombre }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue';
import { getData } from '../Services/jook.js'; // tu función para hacer GET

const search = ref('');
const selectedFilters = ref({}); // Objeto para almacenar los filtros seleccionados
const filterOptions = ref([
  { label: 'Ordenar por', options: ['Destacados', 'Precio: Menor a Mayor', 'Precio: Mayor a Menor'] },
  { label: 'Categoría', options: [] }, // Se llenará dinámicamente
  { label: 'Marca', options: [] },    // Se llenará dinámicamente
  { label: 'Precio', options: ['Menos de $50', '$50 - $100', 'Más de $100'] },
  { label: 'Tipo de uso', options: [] }  // Se llenará dinámicamente
]);

const products = ref([]); // Aquí se almacenarán todos los productos O los productos filtrados
const carouselsData = ref([]);
const carouselPositions = ref([]);
const itemWidth = 200;

// Función para obtener y procesar las opciones de los filtros
async function fetchFilterOptions() {
  try {
    const allProducts = await getData('/producto?estado=activo'); // Obtener todos los productos activos

    // Obtener opciones únicas para Categoría (usando categoryId)
    const categories = [...new Set(allProducts.map(p => p.categoryId).filter(Boolean))];
    const categoriaFilter = filterOptions.value.find(f => f.label === 'Categoría');
    if (categoriaFilter) {
      categoriaFilter.options = categories.map(id => String(id)); // Convertir ObjectId a String para el value del select
    }

    // Obtener opciones únicas para Marca (se mantiene igual)
    const marcas = [...new Set(allProducts.map(p => p.marca).filter(Boolean))];
    const marcaFilter = filterOptions.value.find(f => f.label === 'Marca');
    if (marcaFilter) {
      marcaFilter.options = marcas;
    }

    // Obtener opciones únicas para Tipo de uso (usando tipo)
    const tiposUso = [...new Set(allProducts.map(p => p.tipo).filter(Boolean))];
    const tipoUsoFilter = filterOptions.value.find(f => f.label === 'Tipo de uso');
    if (tipoUsoFilter) {
      tipoUsoFilter.options = tiposUso;
    }

  } catch (error) {
    console.error('Error al obtener las opciones de los filtros:', error);
  }
}

// Función para obtener productos con filtros
async function fetchFilteredProducts() {
  console.log('fetchFilteredProducts ejecutado', selectedFilters.value, search.value);
  try {
    // Construimos query params basados en los filtros seleccionados
    const params = new URLSearchParams();
    if (search.value) params.append('nombre', search.value);

    for (const key in selectedFilters.value) {
      if (selectedFilters.value[key]) {
        if (key === 'Marca') params.append('marca', selectedFilters.value[key]);
        if (key === 'Categoría') params.append('categoryId', selectedFilters.value[key]); // Usamos categoryId
        if (key === 'Tipo de uso') params.append('tipo', selectedFilters.value[key]);      // Usamos tipo
        if (key === 'Ordenar por') {
          if (selectedFilters.value[key] === 'Precio: Menor a Mayor') {
            params.append('sortBy', 'price');
            params.append('sortOrder', 'asc');
          } else if (selectedFilters.value[key] === 'Precio: Mayor a Menor') {
            params.append('sortBy', 'price');
            params.append('sortOrder', 'desc');
          }
          // 'Destacados' podría no requerir parámetros o depender de tu lógica
        }
        if (key === 'Precio') {
          const precioSeleccionado = selectedFilters.value[key];
          if (precioSeleccionado === 'Menos de $50') {
            params.append('precio_lte', 50);
          } else if (precioSeleccionado === '$50 - $100') {
            params.append('precio_gte', 50);
            params.append('precio_lte', 100);
          } else if (precioSeleccionado === 'Más de $100') {
            params.append('precio_gte', 100);
          }
        }
      }
    }

    const url = `/producto?${params.toString()}`;
    const data = await getData(url);

    // Filtramos activos y actualizamos la lista de productos
    const activos = data.filter(product => product.estado === 'activo');
    console.log('Productos obtenidos:', activos);
    const oldProducts = [...products.value]; // Crea una copia del array anterior
    products.value = []; // Vacía el array
    nextTick(() => {
      products.value = activos; // Asigna el nuevo array
    });
    generateCarousels(activos); // También actualizamos los carruseles con los productos filtrados
  } catch (error) {
    console.error('Error al obtener los productos filtrados:', error);
  }
}

onMounted(async () => {
  await fetchFilterOptions(); // Obtener las opciones de los filtros al montar
  await fetchFilteredProducts(); // Obtener todos los productos activos inicialmente para la lista
  // generateCarousels(products.value); // Los carruseles se generan con los productos filtrados

  // Animación automática (se mantiene igual)
  carouselsData.value.forEach((_, index) => {
    setInterval(() => {
      moveCarousel(index, 'right');
    }, 4000);
  });
});

// Actualizar productos cuando cambie search o los filtros seleccionados
watch([search, selectedFilters], () => {
  fetchFilteredProducts();
}, { deep: true }); // Importante el deep: true para observar cambios dentro del objeto selectedFilters

function generateCarousels(productList) {
  const numberOfCarousels = 6;
  const itemsPerCarousel = 12;

  carouselsData.value = Array.from({ length: numberOfCarousels }, () =>
    Array.from({ length: itemsPerCarousel }, () => {
      const index = Math.floor(Math.random() * productList.length);
      const p = productList[index];

      return {
        id: p._id,
        price: `$${p.price}`,
        desc: p.nombre,
        discount: '',
        url: `/product/${p._id}`,
        img: p.images?.[0] || 'https://via.placeholder.com/200',
      };
    })
  );

  carouselPositions.value = Array(carouselsData.value.length).fill(0);
}

function moveCarousel(index, direction) {
  const maxScroll = carouselsData.value[index].length * itemWidth - window.innerWidth;
  if (direction === 'right') {
    carouselPositions.value[index] = (carouselPositions.value[index] - itemWidth) % (maxScroll + itemWidth);
  } else {
    carouselPositions.value[index] = (carouselPositions.value[index] + itemWidth) % (maxScroll + itemWidth);
  }
}

// Nueva función para aplicar los filtros
function applyFilters() {
  fetchFilteredProducts();
}
</script>

<style>
/* Estilos generales */
body {
  margin: 0;
  font-family: 'Segoe UI', sans-serif;
  background: #f5f5f5;
}

.page-wrapper {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 40px;
}

/* Búsqueda */
.search-bar {
  margin-bottom: 8px;
}

.search-input-wrapper {
  position: relative;
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
}

.search-input-wrapper input {
  width: 100%;
  padding: 14px 16px 14px 44px;
  border-radius: 12px;
  border: 1px solid #ccc;
  font-size: 16px;
  background: #fff;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.05);
  transition: 0.2s ease;
}

.search-input-wrapper input:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
}

.search-icon {
  position: absolute;
  top: 50%;
  left: 14px;
  transform: translateY(-50%);
  font-size: 18px;
  color: #888;
}

/* Filtros */
.filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
}

.filter-select {
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;
}

.filter-select label {
  font-weight: 500;
  margin-bottom: 5px;
  color: #374151;
}

.filter-select select {
  background-color: #f3f4f6;
  color: #374151;
  padding: 10px 18px;
  border-radius: 20px;
  font-weight: 500;
  font-size: 14px;
  border: 1px solid transparent;
  transition: all 0.2s ease;
  cursor: pointer;
  appearance: none; /* Para quitar estilos por defecto del navegador */
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor' class='w-6 h-6'%3E%3Cpath fill-rule='evenodd' d='M11.47 17.7a.75.75 0 01-1.06 0l-7.5-7.5a.75.75 0 111.06-1.06L12 15.94l6.97-7.01a.75.75 0 111.06 1.06l-7.5 7.5z' clip-rule='evenodd' /%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 1.5em 1.5em;
  padding-right: 30px; /* Espacio para la flecha */
}

.filter-select select:hover {
  background-color: #e5e7eb;
  border-color: #d1d5db;
}

/* Carruseles */
.carousel-container {
  background: white;
  padding: 20px;
  margin: 0 auto;
  max-width: 1200px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.12);
  border-radius: 12px;
  overflow: hidden;
}

.carousel {
  display: flex;
  overflow: hidden;
  position: relative;
  width: 100%;
  height: auto;
  background-color: white;
}

.carousel-items {
  display: flex;
  transition: transform 1s ease-in-out;
  padding-bottom: 10px;
}

.carousel-item {
  flex: 0 0 180px; /* Ancho fijo */
  height: 180px;    /* Alto fijo */
  margin: 0 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  overflow: hidden; /* Evita que la imagen se salga */
  border-radius: 8px;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
}

/* Imagen dentro del carousel-item */
.carousel-item img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain; /* Ajusta la imagen manteniendo proporción sin recortar */
  display: block;
  border-radius: 8px;
  transition: object-fit 0.3s ease-in-out;
}

@media (max-width: 768px) {
  .carousel-item {
    flex: 0 0 140px;
    margin: 0 6px;
    height: 140px;
  }

  .carousel-item img {
    max-width: 100%;
    max-height: 100%;
  }
}

.carousel-btn {
  background-color: rgba(0, 0, 0, 0.4);
  color: white;
  border: none;
  padding: 8px;
  font-size: 20px;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  cursor: pointer;
  border-radius: 50%;
}

.carousel-btn.left {
  left: 10px;
}

.carousel-btn.right {
  right: 10px;
}

/* Texto info dentro del carousel */
.carousel-item .product-info {
  font-size: 12px;
  color: #333;
  line-height: 1.4;
}

.carousel-item .price {
  font-weight: bold;
  color: #d0021b;
}

/* Estilos para la sección de todos los productos */
.all-products-container {
  padding: 20px;
  margin: 20px auto;
  max-width: 1200px;
  background-color: white;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.12);
  border-radius: 12px;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); /* Columnas responsivas */
  gap: 20px;
  padding: 20px;
}

.product-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 8px;
  transition: transform 0.3s ease-in-out;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 7px 18px rgba(0, 0, 0, 0.15);
}

/* Imagen de producto en la grilla general */
.product-card .product-img {
  width: 100%;
  height: 200px; /* Tamaño fijo para imágenes en la grilla */
  object-fit: contain; /* Ajusta la imagen sin recortar */
  border-radius: 6px;
  margin-bottom: 10px;
  transition: object-fit 0.3s ease-in-out;
}

/* Control de calidad al escalar */
.product-img {
  image-rendering: optimizeQuality;
}

</style>
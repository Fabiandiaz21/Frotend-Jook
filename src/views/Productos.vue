<template>
  <div class="page-wrapper">
    <div class="filter-bar">
      <div v-for="filterGroup in filterOptions" :key="filterGroup.label" class="filter-select">
        <label :for="filterGroup.label">{{ filterGroup.label }}</label>
        <select :id="filterGroup.label" v-model="selectedFilters[filterGroup.label]">
          <option value="">Todos</option>
          <option v-for="option in filterGroup.options" :key="option" :value="option">
            {{ option }}
          </option>
        </select>
      </div>
      <button @click="applyFilters" class="search-button">Buscar</button>
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
              <img :src="item.img" alt="Producto" class="product-img imagen-problematica"
                style="width: 180px; height: 180px;">
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
      <h2>Productos Filtrados</h2>
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
        <p v-if="products.length === 0">No se encontraron productos con los filtros seleccionados.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue';
import { getData } from '../Services/jook.js'; // tu función para hacer GET

const search = ref(''); // Si tienes una barra de búsqueda de texto general
const selectedFilters = ref({
  'Ordenar por': '',
  'Categoría': '',
  'Marca': '',
  'Precio': '',
  'Tipo de uso': ''
});
const filterOptions = ref([
  { label: 'Ordenar por', options: ['Destacados', 'Precio: Menor a Mayor', 'Precio: Mayor a Menor'] },
  { label: 'Categoría', options: [] }, // Se llenará dinámicamente
  { label: 'Marca', options: [] },    // Se llenará dinámicamente
  { label: 'Precio', options: ['Menos de $50', '$50 - $100', 'Más de $100'] },
  { label: 'Tipo de uso', options: [] } // Se llenará dinámicamente
]);

const products = ref([]); // Aquí se almacenarán los productos filtrados

// Datos de carrusel (mantén tu lógica existente)
const carouselsData = ref([
  // ... tus datos de carrusel ...
]);
const carouselPositions = ref([]);
const carousels = ref([]);

// Funciones del carrusel (mantén tu lógica existente)
const moveCarousel = (index, direction) => {
  // ... tu lógica de carrusel ...
};

// Función para obtener productos con filtros
const applyFilters = async () => {
  try {
    const params = new URLSearchParams();

    // Agrega la búsqueda general si existe
    if (search.value) {
      params.append('search', search.value);
    }

    // Agrega los filtros seleccionados
    if (selectedFilters.value['Categoría']) {
      params.append('categoria', selectedFilters.value['Categoría']);
    }
    if (selectedFilters.value['Marca']) {
      params.append('marca', selectedFilters.value['Marca']);
    }
    if (selectedFilters.value['Ordenar por']) {
      params.append('sortBy', selectedFilters.value['Ordenar por']);
    }

    // Manejo del filtro de precio
    if (selectedFilters.value['Precio']) {
      switch (selectedFilters.value['Precio']) {
        case 'Menos de $50':
          params.append('precioMax', 50);
          break;
        case '$50 - $100':
          params.append('precioMin', 50);
          params.append('precioMax', 100);
          break;
        case 'Más de $100':
          params.append('precioMin', 100);
          break;
      }
    }

    // Nota: 'Tipo de uso' no tiene una implementación en el backend de ejemplo,
    // si lo necesitas, debes agregar la lógica correspondiente en el backend.
    // if (selectedFilters.value['Tipo de uso']) {
    //   params.append('tipoUso', selectedFilters.value['Tipo de uso']);
    // }

    const url = `/producto/search?${params.toString()}`;
    const data = await getData(url); // Ajusta la URL según tu configuración de proxy/ruta
    products.value = data;
  } catch (error) {
    console.error('Error al aplicar filtros:', error);
    products.value = []; // Vacía los productos en caso de error
  }
};

// Función para cargar opciones de filtros dinámicamente
const loadFilterOptions = async () => {
  try {
    // Cargar categorías
    const categorias = await getData('/categoria');
    const categoriaFilter = filterOptions.value.find(f => f.label === 'Categoría');
    if (categoriaFilter) {
      categoriaFilter.options = categorias;
    }

    // Cargar marcas
    const marcas = await getData('producto/marcas');
    const marcaFilter = filterOptions.value.find(f => f.label === 'Marca');
    if (marcaFilter) {
      marcaFilter.options = marcas;
    }
  } catch (error) {
    console.error('Error al cargar opciones de filtros:', error);
  }
};

onMounted(async () => {
  // Carga inicial de productos (todos)
  await applyFilters();
  // Carga las opciones dinámicas de los filtros
  await loadFilterOptions();

  // Inicializa las posiciones del carrusel si es necesario
  carouselPositions.value = carouselsData.value.map(() => 0);
});
</script>

<style scoped>
/* Agrega o modifica tus estilos CSS según sea necesario */
.filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 30px;
  padding: 20px;
  background-color: #f8f8f8;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  align-items: flex-end; /* Alinea los elementos al final */
}

.filter-select {
  display: flex;
  flex-direction: column;
}

.filter-select label {
  font-weight: bold;
  margin-bottom: 5px;
  color: #333;
}

.filter-select select {
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
  background-color: #fff;
  min-width: 150px;
}

.search-button {
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s ease;
}

.search-button:hover {
  background-color: #0056b3;
}

.all-products-container {
  margin-top: 40px;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.product-card {
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
  padding: 15px;
  background-color: #fff;
}

.product-card img {
  max-width: 100%;
  height: auto;
  border-bottom: 1px solid #eee;
  margin-bottom: 10px;
}

.product-info p {
  margin: 5px 0;
}

.product-info .price {
  font-weight: bold;
  color: #e44d26;
  font-size: 1.1rem;
}

.product-info .desc {
  font-size: 0.9rem;
  color: #555;
}
/* ... Tus estilos de carrusel y otros ... */
</style>
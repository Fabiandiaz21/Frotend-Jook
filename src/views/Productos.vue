<template>
  <div class="page-wrapper">
    <div class="filter-bar">
      <div v-for="filterGroup in filterOptions" :key="filterGroup.label" class="filter-select">
        <label :for="filterGroup.label">{{ filterGroup.label }}</label>
        <select :id="filterGroup.label" v-model="selectedFilters[filterGroup.label]">
          <option value="">Todos</option>
          <template v-if="filterGroup.label === 'Categoría'">
            <option v-for="option in filterGroup.options" :key="option._id" :value="option._id">
              {{ option.name }}
            </option>
          </template>
          <template v-else-if="filterGroup.label === 'Marca' || filterGroup.label === 'Tipo de uso'">
            <option v-for="option in filterGroup.options" :key="option?.nombre" :value="option?.nombre">
              {{ option?.nombre }}
            </option>
          </template>
          <template v-else>
            <option v-for="option in filterGroup.options" :key="option" :value="option">
              {{ option.nombre }}
            </option>
          </template>
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
          <a :href="`/vistap/${product._id}`">
            <img :src="product.images?.[0] || 'https://via.placeholder.com/200'" alt="Producto" class="product-img">
          </a>
          <div class="product-info">
            <p class="price">{{ `$${formatNumberWithThousandsSeparator(product.price)}` }}</p>
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
import { formatNumberWithThousandsSeparator } from '../utils/utils.js';

const search = ref('');
const selectedFilters = ref({
  'Ordenar por': '',
  'Categoría': '',
  'Marca': '',
  'Precio': '',
  'Tipo de uso': ''
});
const filterOptions = ref([
  { label: 'Ordenar por', options: ['Destacados', 'Precio: Menor a Mayor', 'Precio: Mayor a Menor'] },
  { label: 'Categoría', options: [] }, // Se llenará dinámicamente con objetos { _id, name }
  { label: 'Marca', options: [] }, // Se llenará dinámicamente con strings
  { label: 'Precio', options: ['Menos de $50', '$50 - $100', 'Más de $100'] },
  { label: 'Tipo de uso', options: [] } // Se llenará dinámicamente
]);

const products = ref([]);

// Datos y funciones de carrusel (mantén tu lógica existente)
const carouselsData = ref([
  // ... tus datos de carrusel ...
]);
const carouselPositions = ref([]);
const carousels = ref([]);

const moveCarousel = (index, direction) => {
  // ... tu lógica de carrusel ...
};

// Función para obtener productos con filtros
const applyFilters = async () => {
  try {
    const params = new URLSearchParams();

    if (search.value) {
      params.append('search', search.value);
    }

    if (selectedFilters.value['Categoría']) {
      // Enviamos el _id de la categoría como 'categoria'
      params.append('categoria', selectedFilters.value['Categoría']);
    }
    if (selectedFilters.value['Marca']) {
      params.append('marca', selectedFilters.value['Marca']);
    }
    if (selectedFilters.value['Ordenar por']) {
      params.append('sortBy', selectedFilters.value['Ordenar por']);
    }
    // Asegúrate de que el nombre del parámetro sea 'tipoUso' en el backend
    if (selectedFilters.value['Tipo de uso']) {
      params.append('tipo', selectedFilters.value['Tipo de uso']);
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

    // Asegúrate de que la URL base sea correcta, ej: '/api/productos/search'
    // Si tu proxy o jook.js ya agrega '/api', entonces solo '/productos/search'
    const url = `/producto/search?${params.toString()}`;
    console.log("URL de búsqueda:", url); // Para depurar
    const data = await getData(url);
    products.value = data.productos;
  } catch (error) {
    console.error('Error al aplicar filtros:', error);
    products.value = [];
  }
};

// Función para cargar opciones de filtros dinámicamente
const loadFilterOptions = async () => {
  try {
    // Cargar categorías
    // Tu backend debería devolver [{ _id: '...', name: '...' }]
    const categoriasCompletas = await getData('/categoria'); // Ajusta esta URL si tu ruta no es '/categoria' directamente
    console.log('Datos brutos de categorías para filtro:', categoriasCompletas);
    const categoriaFilter = filterOptions.value.find(f => f.label === 'Categoría');
    if (categoriaFilter) {
      categoriaFilter.options = categoriasCompletas;
    }

    // Cargar marcas
    // Tu backend debería devolver ['Marca A', 'Marca B']
    const marcas = await getData('/producto/marcas'); // Asumo que es '/productos/marcas'
    console.log("respuesta marcas", marcas);

    const marcaFilter = filterOptions.value.find(f => f.label === 'Marca');
    if (marcaFilter) {
      marcaFilter.options = marcas;
    }

    // Cargar tipos de uso
    // Tu backend debería devolver ['Gaming', 'Oficina', 'Hogar']
    const tiposDeUso = await getData('/producto/tipos-de-uso'); // Asumo que es '/productos/tipos-de-uso'
    console.log("respuesta de uso", tiposDeUso);
    const tipoUsoFilter = filterOptions.value.find(f => f.label === 'Tipo de uso');
    if (tipoUsoFilter) {
      tipoUsoFilter.options = tiposDeUso;
    }

  } catch (error) {
    console.error('Error al cargar opciones de filtros:', error);
  }
};

onMounted(async () => {
  // Carga las opciones dinámicas de los filtros primero
  await loadFilterOptions();
  // Luego, carga los productos iniciales (sin filtros o con los predeterminados)
  await applyFilters();


  // Inicializa las posiciones del carrusel si es necesario
  carouselPositions.value = carouselsData.value.map(() => 0);
});
</script>

<style scoped>
/* Agrega o modifica tus estilos CSS según sea necesario */
.page-wrapper {
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f2f4f8;
}

.filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 30px;
  padding: 20px;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
  align-items: flex-end;
}

.filter-select {
  display: flex;
  flex-direction: column;
  min-width: 180px;
  transition: transform 0.3s ease;
}

.filter-select:hover {
  transform: scale(1.02);
}

.filter-select label {
  font-weight: 600;
  margin-bottom: 5px;
  color: #333;
  font-size: 0.95rem;
}

.filter-select select {
  padding: 10px;
  border: 1px solid #dcdcdc;
  border-radius: 6px;
  font-size: 1rem;
  background-color: #fdfdfd;
  transition: border-color 0.3s;
}

.filter-select select:focus {
  border-color: #007bff;
  outline: none;
}

.search-button {
  padding: 12px 24px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s ease, transform 0.2s;
}

.search-button:hover {
  background-color: #0056b3;
  transform: translateY(-1px);
}

.carousel-container {
  margin-bottom: 40px;
}

.carousel {
  position: relative;
  display: flex;
  align-items: center;
  overflow: hidden;
  padding: 10px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.05);
}

.carousel-btn {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #007bff;
  transition: color 0.3s ease;
}

.carousel-btn:hover {
  color: #0056b3;
}

.carousel-items {
  display: flex;
  transition: transform 0.3s ease-in-out;
  gap: 20px;
}

.carousel-item {
  min-width: 200px;
  max-width: 200px;
  background-color: #fdfdfd;
  border-radius: 10px;
  overflow: hidden;
  text-align: center;
  padding: 10px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.product-img {
  width: 180px;
  height: 180px;
  object-fit: cover;
  border-radius: 8px;
  transition: transform 0.3s ease;
}

.carousel-item:hover .product-img {
  transform: scale(1.05);
}

.product-info {
  padding: 8px 0;
}

.product-info .price {
  font-weight: bold;
  color: #e44d26;
  font-size: 1.1rem;
}

.product-info .desc {
  font-size: 0.95rem;
  color: #444;
}

.product-info .discount {
  font-size: 0.85rem;
  color: #28a745;
}

.all-products-container {
  margin-top: 40px;
}

.all-products-container h2 {
  font-size: 1.5rem;
  margin-bottom: 20px;
  color: #333;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 24px;
}

.product-card {
  background-color: #fff;
  border-radius: 10px;
  padding: 16px;
  text-align: center;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s ease-in-out;
}

.product-card:hover {
  transform: translateY(-4px);
}

.product-card img {
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-radius: 6px;
}

.product-info .price {
  color: #d6336c;
  font-weight: bold;
  font-size: 1.05rem;
}

.product-info .desc {
  color: #555;
  font-size: 0.95rem;
}

@media (max-width: 768px) {
  .filter-bar {
    flex-direction: column;
    gap: 10px;
  }

  .carousel-item {
    min-width: 160px;
    max-width: 160px;
  }

  .product-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  }
}
</style>
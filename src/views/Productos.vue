<template>
  <div class="products-page">
    <!-- Hero Section -->
    <div class="hero-section">
      <div class="hero-content">
        <h1>Nuestra Colección</h1>
        <p>Descubre productos seleccionados con cuidado para ti</p>
      </div>
    </div>

    <!-- Filter Section -->
    <div class="filter-section">
      <div class="filter-container">
        <div v-for="filterGroup in filterOptions" :key="filterGroup.label" class="filter-group">
          <q-select
            outlined
            :label="filterGroup.label"
            v-model="selectedFilters[filterGroup.label]"
            :options="filterGroup.options"
            option-label="name"
            option-value="_id"
            color="brown-7"
            class="filter-select"
            dense
          >
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section>
                  <q-item-label>{{ scope.opt.name || scope.opt }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-select>
        </div>
        <q-btn 
          label="Aplicar Filtros" 
          color="brown-7" 
          unelevated 
          @click="applyFilters"
          class="apply-btn"
        />
      </div>
    </div>



    <!-- Products Grid -->
    <div class="section-title">
      <h2>Nuestros Productos</h2>
      <q-separator color="brown-3" />
    </div>

    <div class="products-grid">
      <q-card 
        v-for="product in products" 
        :key="product._id" 
        class="product-card"
      >
        <router-link :to="`/vistap/${product._id}`">
          <q-img
            :src="product.images?.[0] || 'https://via.placeholder.com/300'"
            :ratio="1"
            class="product-img"
            spinner-color="brown-6"
          >
            <template v-slot:error>
              <div class="absolute-full flex flex-center bg-brown-1 text-brown-8">
                Imagen no disponible
              </div>
            </template>
          </q-img>
        </router-link>

        <q-card-section>
          <div class="product-title">{{ product.nombre }}</div>
          <div class="product-brand">{{ product.marca.nombre }}</div>
          
          <div class="row items-center justify-between q-mt-sm">
            <div class="product-price text-brown-8">
              ${{ formatNumberWithThousandsSeparator(product.price) }}
            </div>
            <q-btn 
              round 
              flat 
              color="brown-6" 
              icon="shopping_cart" 
              @click.stop="addToCart(product)"
            />
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Empty State -->
    <div v-if="products.length === 0" class="empty-state">
      <q-icon name="search_off" size="xl" color="brown-4" />
      <h3>No encontramos productos</h3>
      <p>Intenta con otros filtros de búsqueda</p>
      <q-btn 
        label="Limpiar Filtros" 
        color="brown-7" 
        outline 
        @click="clearFilters"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getData } from '../Services/jook.js';
import { formatNumberWithThousandsSeparator } from '../utils/utils.js';
import { useCartStore } from '../Store/useCartStore';

const cartStore = useCartStore();

const search = ref('');
const slide = ref(0);
const selectedFilters = ref({
  'Ordenar por': '',
  'Categoría': '',
  'Marca': '',
  'Precio': '',
  'Tipo de uso': ''
});

const filterOptions = ref([
  { label: 'Ordenar por', options: ['Destacados', 'Precio: Menor a Mayor', 'Precio: Mayor a Menor'] },
  { label: 'Categoría', options: [] },
  { label: 'Marca', options: [] },
  { label: 'Precio', options: ['Menos de $50', '$50 - $100', 'Más de $100'] },
  { label: 'Tipo de uso', options: [] }
]);

const products = ref([]);
const carouselsData = ref([[]]);

const addToCart = (product) => {
  cartStore.addItem({
    id: product._id,
    nombre: product.nombre,
    precio: product.price,
    imagen: product.images?.[0],
    cantidad: 1
  });
};

const applyFilters = async () => {
  try {
    const params = new URLSearchParams();

    if (search.value) params.append('search', search.value);
    if (selectedFilters.value['Categoría']) params.append('categoria', selectedFilters.value['Categoría']._id || selectedFilters.value['Categoría']);
    if (selectedFilters.value['Marca']) params.append('marca', selectedFilters.value['Marca'].nombre || selectedFilters.value['Marca']);
    if (selectedFilters.value['Ordenar por']) params.append('sortBy', selectedFilters.value['Ordenar por']);
    if (selectedFilters.value['Tipo de uso']) params.append('tipo', selectedFilters.value['Tipo de uso'].nombre || selectedFilters.value['Tipo de uso']);

    if (selectedFilters.value['Precio']) {
      switch (selectedFilters.value['Precio']) {
        case 'Menos de $50': params.append('precioMax', 50); break;
        case '$50 - $100':
          params.append('precioMin', 50);
          params.append('precioMax', 100);
          break;
        case 'Más de $100': params.append('precioMin', 100); break;
      }
    }

    const url = `/producto/search?${params.toString()}`;
    const data = await getData(url);
    products.value = data.productos || [];
  } catch (error) {
    console.error('Error al aplicar filtros:', error);
    products.value = [];
  }
};

const clearFilters = () => {
  selectedFilters.value = {
    'Ordenar por': '',
    'Categoría': '',
    'Marca': '',
    'Precio': '',
    'Tipo de uso': ''
  };
  applyFilters();
};

const loadFilterOptions = async () => {
  try {
    const [categorias, marcas, tiposDeUso] = await Promise.all([
      getData('/categoria'),
      getData('/producto/marcas'),  
      getData('/producto/tipos-de-uso')
    ]);

    filterOptions.value = [
      { label: 'Ordenar por', options: ['Destacados', 'Precio: Menor a Mayor', 'Precio: Mayor a Menor'] },
      { label: 'Categoría', options: categorias },
      { label: 'Marca', options: marcas.map(m => ({ nombre: m })) },
      { label: 'Precio', options: ['Menos de $50', '$50 - $100', 'Más de $100'] },
      { label: 'Tipo de uso', options: tiposDeUso.map(t => ({ nombre: t })) }
    ];

    await applyFilters();
  } catch (error) {
    console.error('Error al cargar opciones de filtros:', error);
  }
};

onMounted(() => {
  loadFilterOptions();
});
</script>

<style scoped>
.products-page {
  background-color: #f9f5f0;
  min-height: 100vh;
}

.hero-section {
  height: 300px;
  background-image: linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), 
                  url('https://img.freepik.com/foto-gratis/arreglo-coleccion-estacionaria-moderna_23-2149309649.jpg?semt=ais_items_boosted&w=740');
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: white;
  margin-bottom: 30px;
}

.hero-content h1 {
  font-size: 3rem;
  margin-bottom: 10px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.hero-content p {
  font-size: 1.2rem;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.filter-section {
  background-color: #fff;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(139, 69, 19, 0.1);
  margin-bottom: 30px;
}

.filter-container {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  align-items: flex-end;
  max-width: 1200px;
  margin: 0 auto;
}

.filter-group {
  flex: 1;
  min-width: 200px;
}

.filter-select {
  background-color: #fff;
}

.apply-btn {
  height: 40px;
}

.section-title {
  max-width: 1200px;
  margin: 0 auto 20px;
  padding: 0 20px;
}

.section-title h2 {
  font-size: 1.8rem;
  color: #5d4037;
  margin-bottom: 10px;
}

.featured-carousel {
  max-width: 1200px;
  margin: 0 auto 40px;
  padding: 0 20px;
}

.carousel {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(139, 69, 19, 0.15);
}

.slide-content {
  display: flex;
  height: 100%;
  align-items: center;
  padding: 20px;
}

.featured-img {
  width: 250px;
  height: 250px;
  object-fit: cover;
  border-radius: 8px;
  margin-right: 30px;
}

.featured-info {
  flex: 1;
  color: #5d4037;
}

.featured-info h3 {
  font-size: 1.5rem;
  margin-bottom: 15px;
}

.price-container {
  margin-bottom: 20px;
}

.price {
  font-size: 1.8rem;
  font-weight: bold;
  color: #6d4c41;
  margin-right: 15px;
}

.discount {
  font-size: 1.2rem;
  color: #8d6e63;
  text-decoration: line-through;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 25px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px 40px;
}

.product-card {
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  background-color: #fff;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(139, 69, 19, 0.15);
}

.product-img {
  height: 250px;
}

.product-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #5d4037;
  margin-bottom: 5px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-brand {
  font-size: 0.9rem;
  color: #8d6e63;
  margin-bottom: 10px;
}

.product-price {
  font-size: 1.2rem;
  font-weight: bold;
}

.empty-state {
  text-align: center;
  padding: 50px 20px;
  max-width: 500px;
  margin: 0 auto;
}

.empty-state h3 {
  font-size: 1.5rem;
  color: #5d4037;
  margin: 20px 0 10px;
}

.empty-state p {
  color: #8d6e63;
  margin-bottom: 20px;
}

@media (max-width: 768px) {
  .hero-content h1 {
    font-size: 2rem;
  }
  
  .hero-content p {
    font-size: 1rem;
  }
  
  .slide-content {
    flex-direction: column;
    padding: 10px;
  }
  
  .featured-img {
    width: 150px;
    height: 150px;
    margin-right: 0;
    margin-bottom: 15px;
  }
  
  .featured-info h3 {
    font-size: 1.2rem;
    text-align: center;
  }
  
  .price-container {
    text-align: center;
  }
  
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 15px;
  }
}

@media (max-width: 480px) {
  .filter-container {
    flex-direction: column;
  }
  
  .filter-group {
    width: 100%;
  }
  
  .products-grid {
    grid-template-columns: 1fr;
  }
}
</style>
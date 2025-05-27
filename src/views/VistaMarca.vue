<template>
    <q-page padding>
      <div class="text-h4 q-mb-md text-center">Productos de {{ brandName }}</div>
      <div v-if="loading" class="text-center q-mt-xl">
        <q-spinner-dots color="primary" size="4em" />
        <p class="q-mt-md">Cargando productos...</p>
      </div>
      <div v-else-if="products.length > 0" class="row q-col-gutter-md">
        <div
          v-for="product in products"
          :key="product._id"
          class="col-xs-12 col-sm-6 col-md-4 col-lg-3"
        >
          <q-card>
            <q-img :src="product.images[0] || 'https://cdn.quasar.dev/img/parallax2.jpg'" :ratio="1">
              <div class="absolute-bottom text-subtitle2 text-center">
                {{ product.nombre }}
              </div>
            </q-img>
            <q-card-section>
              <div class="text-h6">${{ product.price }}</div>
              <div class="text-subtitle2">{{ product.marca }}</div>
            </q-card-section>
            <q-card-actions align="right">
              <q-btn flat label="Ver Detalle" color="primary" :to="`/product/${product._id}`" />
            </q-card-actions>
          </q-card>
        </div>
      </div>
      <div v-else class="text-center q-mt-xl">
        <p>No se encontraron productos para la marca "{{ brandName }}".</p>
      </div>
    </q-page>
  </template>
  
  <script setup>
  import { ref, onMounted, watch } from 'vue';
  import { useRoute } from 'vue-router';
  import { useQuasar } from 'quasar';
  import { getData } from '../services/jook'; // Asegúrate de que esta ruta sea correcta
  
  const route = useRoute();
  const $q = useQuasar();
  const brandName = ref('');
  const products = ref([]);
  const loading = ref(true);
  
  const fetchProductsByBrand = async (marca) => {
    loading.value = true;
    try {
      const response = await getData(`/producto/marca/${marca}`);
      if (Array.isArray(response)) {
        products.value = response;
      } else {
        products.value = [];
      }
    } catch (error) {
      console.error(`Error al cargar productos de la marca ${marca}:`, error);
      $q.notify({ type: 'negative', message: `Error al cargar productos de ${marca}` });
      products.value = [];
    } finally {
      loading.value = false;
    }
  };
  
  // Observar cambios en el parámetro de la ruta 'marca'
  watch(
    () => route.params.marca,
    (newMarca) => {
      if (newMarca) {
        brandName.value = newMarca;
        fetchProductsByBrand(newMarca);
      }
    },
    { immediate: true } // Ejecutar la función inmediatamente al montar el componente
  );
  
  onMounted(() => {
    // El watcher con immediate: true ya se encargará de la carga inicial
  });
  </script>
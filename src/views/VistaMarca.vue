<template>
  <q-page class="q-pa-md">
    <div v-if="loading" class="text-center q-py-lg">
      <q-spinner-dots color="primary" size="3em" />
      <div class="q-mt-md">Cargando productos de {{ marcaSeleccionada }}...</div>
    </div>

    <div v-else-if="error" class="text-center q-py-lg text-negative">
      <q-icon name="error" size="2em" />
      <div class="q-mt-md">{{ error }}</div>
    </div>

    <div v-else>
      <h4 class="q-mb-md text-center">Productos de {{ marcaSeleccionada }}</h4>
      <div v-if="productos.length > 0" class="row q-col-gutter-md justify-center">
        <div v-for="producto in productos" :key="producto._id" class="col-xs-12 col-sm-6 col-md-4 col-lg-3">
          <q-card flat bordered>
            <q-img :src="producto.images[0] || 'https://via.placeholder.com/300'" :ratio="16/9" />
            <q-card-section>
              <div class="text-h6">{{ producto.nombre }}</div>
              <div class="text-subtitle2">{{ producto.marca }}</div>
              <div class="text-body1 text-weight-bold">${{ producto.price }}</div>
            </q-card-section>
            <q-card-actions align="right">
              <q-btn flat round color="primary" icon="visibility" @click="viewProduct(producto._id)" />
              <q-btn flat round color="secondary" icon="add_shopping_cart" />
            </q-card-actions>
          </q-card>
        </div>
      </div>
      <div v-else class="text-center q-py-lg">
        <p>No se encontraron productos para la marca {{ marcaSeleccionada }}.</p>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'; // Importa 'watch' para reaccionar a cambios en la URL
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { getData } from '../services/jook'; // Asegúrate de que la ruta sea correcta

const route = useRoute(); // Instancia para acceder a los parámetros de la ruta
const router = useRouter(); // Instancia para la navegación
const $q = useQuasar(); // Instancia para las notificaciones de Quasar

const productos = ref([]);
const loading = ref(true);
const error = ref(null);
const marcaSeleccionada = ref(''); // Para mostrar el nombre de la marca en el título

// Función para obtener los productos de la API por marca
const fetchProductosPorMarca = async (marca) => {
  loading.value = true;
  error.value = null;
  productos.value = []; // Limpiar productos anteriores

  if (!marca) {
    error.value = "Nombre de marca no proporcionado en la URL.";
    loading.value = false;
    return;
  }

  try {
    // Aquí es donde usas la ruta de tu API para obtener productos por marca
    // Ejemplo: /api/producto/marca/MSI
    const response = await getData(`/producto/marca/${marca}`); 
    console.log("respuesta",response);
    
    if (Array.isArray(response)) {
      productos.value = response;
    } else {
      console.warn('La respuesta de la API de productos por marca no es un array:', response);
      productos.value = [];
      error.value = "Formato de datos incorrecto recibido de la API.";
    }
  } catch (err) {
    console.error('Error al cargar productos por marca:', err);
    // Verifica si el error es un 404 (no encontrado) o un error general
    if (err.response && err.response.status === 404) {
      error.value = `No se encontraron productos para la marca "${marca}".`;
    } else {
      error.value = 'Error al cargar los productos de la marca.';
    }
    $q.notify({ type: 'negative', message: error.value });
  } finally {
    loading.value = false;
  }
};

// Función para navegar a la vista de detalle del producto
const viewProduct = (productId) => {
  router.push(`/producto/${productId}`); // Ajusta esta ruta si es diferente
};

// Observar cambios en el parámetro 'marca' de la URL
// Esto es útil si el usuario navega entre marcas sin recargar la página completa
watch(() => route.params.marca, (newMarca) => {
  if (newMarca) {
    marcaSeleccionada.value = newMarca;
    fetchProductosPorMarca(newMarca);
  }
}, { immediate: true }); // 'immediate: true' para que se ejecute la primera vez que se monta

// Ya no necesitamos onMounted por separado si usamos watch con immediate: true
/*
onMounted(() => {
  // Obtener la marca del parámetro de la URL
  const marca = route.params.marca;
  marcaSeleccionada.value = marca; // Almacenar para mostrar en el título
  fetchProductosPorMarca(marca);
});
*/
</script>

<style scoped>
/* Estilos específicos para este componente si los necesitas */
.q-card {
  height: 100%; /* Asegura que todas las tarjetas tengan la misma altura */
  display: flex;
  flex-direction: column;
}

.q-card-section {
  flex-grow: 1; /* Permite que el contenido se expanda */
}

.q-card-actions {
  margin-top: auto; /* Empuja las acciones al final de la tarjeta */
}
</style>
<template>
  <q-page padding>
    <div class="q-pa-md">
      <h4 class="text-h4 q-my-md text-center">
        Productos de la Categoría - {{ categoria.name || 'Sin nombre' }}
      </h4>

      <div v-if="loading" class="text-center q-py-lg">
        <q-spinner-dots color="primary" size="3em" />
        <div class="q-mt-md">Cargando productos de {{ categoria.name || 'la categoría' }}...</div>
      </div>

      <div v-else-if="error" class="text-center q-py-lg text-negative">
        <q-icon name="error" size="2em" />
        <div class="q-mt-md">{{ error }}</div>
      </div>

      <div v-else-if="products.length > 0" class="q-gutter-md row items-start justify-center">
        <q-card v-for="product in products" :key="product._id" class="my-card col-xs-12 col-sm-6 col-md-4 col-lg-3">
          <q-img
            :src="product.images && product.images.length > 0 ? product.images[0] : 'https://via.placeholder.com/300x200?text=No+Image'"
            :alt="product.nombre" spinner-color="white" style="height: 200px;">
            <template v-slot:error>
              <div class="absolute-full flex flex-center bg-negative text-white">
                No se pudo cargar la imagen
              </div>
            </template>
          </q-img>

          <q-card-section>
            <div class="text-h6">{{ product.nombre }}</div>
            <q-rating v-if="product.reviews && product.reviews.length > 0" :model-value="averageRating(product.reviews)"
              size="1.5em" color="orange" icon="star_border" icon-selected="star" icon-half="star_half" readonly />
            <div v-else class="text-caption text-grey">Sin reseñas</div>
            <div class="text-subtitle2 text-weight-bold q-mt-sm">
              {{ product.price ? `$${product.price.toFixed(2)}` : 'Precio no disponible' }}
            </div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            <div class="text-caption text-grey">
              {{ product.descripcion ? product.descripcion.substring(0, 100) + '...' : 'Sin descripción.' }}
            </div>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat color="primary" label="Ver Detalles" :to="`/vistap/${product._id}`" />
            <q-btn flat color="secondary" icon="add_shopping_cart" @click="agregarAlCarrito(product)" />
          </q-card-actions>
        </q-card>
      </div>

      <div v-else class="q-pa-md text-center text-h6 text-grey">
        No se encontraron productos para esta categoría.
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { getData } from '../services/jook'; // Asegúrate de que esta ruta sea correcta
import { useQuasar } from 'quasar';
import { useCartStore } from '../Store/useCartStore';

const route = useRoute();
const $q = useQuasar();
const cartStore = useCartStore();

const products = ref([]);
const categoria = ref({}); // Cambiado de 'marca' a 'categoria'
const loading = ref(true);
const error = ref(null);

const averageRating = (reviews) => {
  if (!reviews || reviews.length === 0) return 0;
  const total = reviews.reduce((sum, review) => sum + review.rating, 0);
  return total / reviews.length;
};

// --- INICIO: FUNCIONES MODIFICADAS ---

// Función para obtener los productos por ID de categoría
const fetchProductsByCategoryPage = async (id) => {
  loading.value = true;
  error.value = null;
  products.value = [];

  try {
    // AJUSTA LA RUTA DE LA API PARA OBTENER PRODUCTOS POR CATEGORÍA
    const response = await getData(`/producto/categoria/${id}`);
    if (Array.isArray(response)) {
      products.value = response;
    } else {
      products.value = [];
      $q.notify({
        type: 'warning',
        message: 'No se encontraron productos para esta categoría o el formato de datos es incorrecto.',
      });
    }
  } catch (err) {
    console.error('Error al obtener productos por categoría:', err);
    error.value = 'Ocurrió un error al cargar los productos de esta categoría.';
    $q.notify({
      type: 'negative',
      message: error.value,
    });
  } finally {
    loading.value = false;
  }
};

// Función para obtener los detalles de la categoría por ID
const fetchCategoria = async (id) => {
  try {
    // AJUSTA LA RUTA DE LA API PARA OBTENER DETALLES DE LA CATEGORÍA
    const response = await getData(`/categoria/${id}`);
    if (response && response.name) { // Asumiendo que tu API de categoría devuelve 'name'
      categoria.value = { name: response.name, _id: response._id };
    } else {
      categoria.value = { name: 'Categoría Desconocida', _id: id };
      console.warn(`No se encontró el nombre para la categoría con ID: ${id}`);
    }
  } catch (err) {
    console.error('Error al obtener categoría:', err);
    $q.notify({
      type: 'negative',
      message: 'Error al cargar los detalles de la categoría.',
    });
    categoria.value = { name: 'Error al Cargar Categoría', _id: id };
  }
};

// --- FIN: FUNCIONES MODIFICADAS ---

const agregarAlCarrito = (product) => {
  const cantidadSeleccionada = 1;

  if (!product) {
    $q.notify({
      type: 'negative',
      message: 'No se pudo cargar la información del producto.',
      position: 'top',
      timeout: 2000,
    });
    return;
  }

  if (product.estado !== 'activo') {
    $q.notify({
      type: 'warning',
      message: 'Este producto no está activo y no se puede añadir al carrito.',
      position: 'top',
      timeout: 2500,
    });
    return;
  }

  if (cantidadSeleccionada <= 0 || cantidadSeleccionada > product.stock) {
    const message = cantidadSeleccionada > product.stock
      ? `No hay suficiente stock. Solo quedan ${product.stock} unidades.`
      : 'Por favor, selecciona una cantidad válida (mayor a 0).';
    $q.notify({
      type: 'warning',
      message,
      position: 'top',
      timeout: 3000,
    });
    return;
  }

  cartStore.addItem({
    id: product._id,
    nombre: product.nombre,
    precio: product.price,
    imagen: product.images[0],
    cantidad: cantidadSeleccionada,
    stock: product.stock,
  });

  $q.notify({
    type: 'positive',
    message: 'Producto añadido al carrito.',
    position: 'top',
    timeout: 2000,
  });
};

onMounted(() => {
  const id = route.params.id; // El ID de la categoría viene de la ruta /vistacategoria/:id
  if (id) {
    fetchCategoria(id); // Obtener los detalles (nombre) de la categoría
    fetchProductsByCategoryPage(id); // Obtener los productos de esa categoría
  }
});

watch(() => route.params.id, (newId, oldId) => {
  if (newId && newId !== oldId) {
    fetchCategoria(newId); // Volver a obtener los detalles de la categoría si el ID cambia
    fetchProductsByCategoryPage(newId); // Volver a obtener los productos si el ID cambia
  }
});
</script>

<style scoped>
.my-card {
  width: 100%;
  max-width: 300px;
  display: flex;
  flex-direction: column;
}

.my-card .q-card-section {
  flex-grow: 1;
}

.my-card .q-card-actions {
  margin-top: auto;
}
</style>
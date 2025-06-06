<template>
  <q-page padding>
    <div class="q-pa-md">
      <h4 class="text-h4 q-my-md text-center">
        Productos de la Marca - {{ marca.name || 'Sin nombre' }}
      </h4>

      <div v-if="loading" class="text-center q-py-lg">
        <q-spinner-dots color="primary" size="3em" />
        <div class="q-mt-md">Cargando productos de {{ marca.name || 'la marca' }}...</div>
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
        No se encontraron productos para esta marca.
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
const marca = ref({}); // Cambiado de 'categoria' a 'marca'
const loading = ref(true); // Nuevo estado de carga
const error = ref(null);   // Nuevo estado de error

// Función para calcular el promedio de las reseñas
const averageRating = (reviews) => {
  if (!reviews || reviews.length === 0) return 0;
  const total = reviews.reduce((sum, review) => sum + review.rating, 0);
  return total / reviews.length;
};

// Función para obtener los productos de la marca por ID
const fetchProductsByBrandPage = async (id) => {
  loading.value = true;
  error.value = null; // Reiniciar error
  products.value = []; // Limpiar productos anteriores

  try {
    const response = await getData(`/producto/marca/${id}`); // Ajusta la ruta a tu API de productos por marca
    if (Array.isArray(response)) {
      products.value = response;
    } else {
      products.value = [];
      $q.notify({
        type: 'warning',
        message: 'No se encontraron productos para esta marca o el formato de datos es incorrecto.',
      });
    }
  } catch (err) { // Usar 'err' para diferenciar del 'error' ref
    console.error('Error al obtener productos por marca:', err);
    error.value = 'Ocurrió un error al cargar los productos de esta marca.';
    $q.notify({
      type: 'negative',
      message: error.value,
    });
  } finally {
    loading.value = false;
  }
};

// Función para obtener los detalles de la marca por ID
const fetchMarca = async (id) => {
  try {
    const response = await getData(`/marca/${id}`); // Ajusta la ruta a tu API de marca por ID
    if (response && response.nombre) { // Asegúrate de que el campo sea 'nombre' si tu API lo devuelve así
      marca.value = { name: response.nombre, _id: response._id }; // Almacena el nombre y el _id
    } else {
      marca.value = { name: 'Marca Desconocida', _id: id }; // Fallback
      console.warn(`No se encontró el nombre para la marca con ID: ${id}`);
    }
  } catch (err) { // Usar 'err' para diferenciar del 'error' ref
    console.error('Error al obtener marca:', err);
    $q.notify({
      type: 'negative',
      message: 'Error al cargar los detalles de la marca.',
    });
    marca.value = { name: 'Error al Cargar Marca', _id: id }; // Otro fallback en caso de error
  }
};

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
  const id = route.params.id; // El ID de la marca viene de la ruta /vistamarca/:id
  if (id) {
    fetchMarca(id); // Obtener los detalles (nombre) de la marca
    fetchProductsByBrandPage(id); // Obtener los productos de esa marca
  }
});

watch(() => route.params.id, (newId, oldId) => {
  if (newId && newId !== oldId) {
    fetchMarca(newId); // Re-obtener los detalles de la marca si el ID cambia
    fetchProductsByBrandPage(newId); // Re-obtener los productos si el ID cambia
  }
});
</script>

<style scoped>
.my-card {
  width: 100%;
  max-width: 300px;
  /* Añadimos estilos para consistencia */
  display: flex;
  flex-direction: column;
}

.my-card .q-card-section {
  flex-grow: 1; /* Permite que la sección se expanda */
}

.my-card .q-card-actions {
  margin-top: auto; /* Mueve las acciones a la parte inferior */
}
</style>
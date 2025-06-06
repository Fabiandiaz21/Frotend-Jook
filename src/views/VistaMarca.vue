<template>
  <q-page class="q-pa-md">
    <div v-if="loading" class="text-center q-py-lg">
      <q-spinner-dots color="primary" size="3em" />
      <div class="q-mt-md">Cargando productos de {{ marcaSeleccionada || 'la marca' }}...</div>
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
            <q-img :src="producto.images[0] || 'https://via.placeholder.com/300'" :ratio="16 / 9" />
            <q-card-section>
              <div class="text-h6">{{ producto.nombre }}</div>
              <div class="text-subtitle2">{{ producto.marca.nombre }}</div>
              <div class="text-body1 text-weight-bold">${{ producto.price }}</div>
            </q-card-section>
            <q-card-actions align="right">
              <q-btn flat round color="primary" icon="visibility" @click="viewProduct(producto._id)" />
              <q-btn flat color="secondary" icon="add_shopping_cart" @click="agregarAlCarrito(producto)" />
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
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { getData } from '../services/jook';
import { useCartStore } from '../Store/useCartStore';

const cartStore = useCartStore();
const route = useRoute();
const router = useRouter();
const $q = useQuasar();

const productos = ref([]);
const loading = ref(true);
const error = ref(null);
const marcaSeleccionada = ref(''); // Para mostrar el nombre de la marca en el título

// Función para obtener los productos y el nombre de la marca por ID
const fetchProductosYMarca = async (marcaId) => {
  loading.value = true;
  error.value = null;
  productos.value = []; // Limpiar productos anteriores
  marcaSeleccionada.value = ''; // Limpiar el nombre de la marca también

  if (!marcaId) {
    error.value = "ID de marca no proporcionado en la URL.";
    loading.value = false;
    return;
  }

  try {
    // 1. Intentar obtener los detalles de la marca para su nombre
    // Asumiendo que tienes un endpoint como /marca/:id que devuelve { _id: ..., nombre: '...', ... }
    const brandDetails = await getData(`/producto/marca/${marcaId}`);
    if (brandDetails && brandDetails.nombre) {
      marcaSeleccionada.value = brandDetails.nombre; // Establecer el nombre real de la marca
    } else {
      // Si no se encuentra el nombre, se puede mostrar el ID o un mensaje genérico
      console.warn(`No se encontró el nombre para la marca con ID: ${marcaId}`);
      marcaSeleccionada.value = `Marca con ID: ${marcaId}`; // Mostrar el ID como fallback
    }

    // 2. Obtener los productos de esa marca
    // Asegúrate de que tu API /producto/marca/ espera el ID de la marca aquí
    const response = await getData(`/producto/marca/${marcaId}/productos`);

    if (Array.isArray(response)) {
      productos.value = response;
    } else {
      console.warn('La respuesta de la API de productos por marca no es un array:', response);
      productos.value = [];
      error.value = "Formato de datos incorrecto recibido de la API.";
    }
  } catch (err) {
    console.error('Error al cargar productos o la marca:', err);
    if (err.response && err.response.status === 404) {
      error.value = `No se encontraron productos para la marca "${marcaSeleccionada.value}" (ID: ${marcaId}).`;
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
  router.push(`/vistap/${productId}`);
};

// Observar cambios en el parámetro 'id' de la URL (desde la ruta /vistamarca/:id)
watch(() => route.params.id, (newBrandId) => {
  if (newBrandId) {
    fetchProductosYMarca(newBrandId); // Llama a la nueva función con el ID
  }
}, { immediate: true }); // 'immediate: true' para que se ejecute la primera vez que se monta

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
</script>

<style scoped>
/* Estilos específicos para este componente si los necesitas */
.q-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.q-card-section {
  flex-grow: 1;
}

.q-card-actions {
  margin-top: auto;
}
</style>

<style scoped>
/* Estilos específicos para este componente si los necesitas */
.q-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.q-card-section {
  flex-grow: 1;
}

.q-card-actions {
  margin-top: auto;
}
</style>
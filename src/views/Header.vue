<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="custom-header" height-hint="72">
      <q-toolbar class="q-px-md text-dark">
        <q-toolbar-title class="flex items-center" id="titulo" style="min-width: 150px; color: white;">
          <q-avatar size="36px" class="bg-yellow-8 text-white">
            <q-icon name="shopping_cart" />
          </q-avatar>
          <span class="q-ml-sm text-weight-bold">Jook</span>
        </q-toolbar-title>
        <div class="col q-mx-md" style="max-width: 700px;">
          <q-input dense outlined debounce="300" v-model="searchQuery" placeholder="Buscar productos, marcas y más..."
            class="rounded-input bg-white" @update:model-value="handleSearch">
            <template #prepend>
              <q-btn flat round icon="menu" />
            </template>
            <template #append>
              <q-icon name="search" />
            </template>
          </q-input>
          <div v-if="searchQuery" style="position: relative;">
            <q-list v-if="searchResults.length > 0"
              class="bg-white rounded-borders shadow-1 q-mt-sm search-results-list">
              <q-item clickable v-for="item in searchResults" :key="item._id" @click="goToProduct(item)">
                <q-item-section>
                  <q-item-label>{{ item.nombre }}</q-item-label>
                  <q-item-label caption>{{ item.categoryId?.nombre || item.marca || 'Sin categoría' }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>

            <div v-else class="q-pa-md bg-white rounded-borders shadow-1 q-mt-sm">
              No se encontraron resultados para "{{ searchQuery }}"
            </div>
          </div>
        </div>


        <div class="flex items-center">
          <q-btn flat round dense icon="favorite_border" @click="$router.push('/favoritos')" class="q-mr-sm" id="btn" />
          <q-btn flat round dense icon="shopping_cart" class="q-mr-sm" id="btn" />
          <q-btn round flat dense icon="account_circle" class="btn">
            <q-menu>
              <q-list bordered style="min-width: 170px">
                <q-item v-close-popup>
                  <q-item-section>
                    <q-item-label class="text-bold text-primary">Hola, Usuario</q-item-label>
                  </q-item-section>
                </q-item>
                <q-separator />
                <q-item clickable v-close-popup @click="goToProfile">
                  <q-item-section>
                    <q-item-label>Mi cuenta</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item clickable v-close-popup @click="showLogoutModal = true">
                  <q-item-section>
                    <q-item-label class="text-negative">Cerrar sesión</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </div>
      </q-toolbar>

      <q-toolbar class="custom-header text-dark q-px-md q-py-xs">
        <q-btn flat label="inicio" @click="$router.push('/')" class="btn" />
        <!-- Botón desplegable de categorías -->
        <q-btn flat label="Categorías" icon-right="arrow_drop_down" class="btn">
          <q-menu>
            <q-list style="min-width: 250px; max-height: 300px; overflow-y: auto">
              <q-item v-for="categoria in categories" :key="categoria._id" clickable @click="selectCategory(categoria)">
                <q-item-section>
                  <q-item-label class="text-bold">{{ categoria.name }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>

        <q-btn flat label="Productos" @click="$router.push('/productos')" class="btn" />
        <q-space />
        <q-btn flat label="Ayuda" class="btn" />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-dialog v-model="showLogoutModal" persistent>
      <q-card class="q-pa-md">
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="red" text-color="white" />
          <span class="q-ml-sm text-subtitle1">¿Estás seguro de que quieres cerrar sesión?</span>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="primary" v-close-popup />
          <q-btn unelevated label="Cerrar sesión" color="red" @click="logout" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { getData } from '../services/jook';
import { useAuthStore } from '../Store/useAunt';

const showLogoutModal = ref(false);
const searchQuery = ref('');
const categories = ref([]);
const productsByCategory = ref([]);
const router = useRouter();
const $q = useQuasar();
const searchResults = ref([]);
const authStore = useAuthStore();

const handleSearch = async (newValue) => {
  if (newValue) {
    try {
      const response = await getData(`/producto/search?query=${newValue}`);
      console.log("Respuesta completa:", response);

      if (response && Array.isArray(response)) {
        searchResults.value = response;
      } else {
        searchResults.value = [];
        console.warn("La respuesta del servidor no es un array de productos válido.");
      }
    } catch (error) {
      console.error('Error al buscar:', error);
      $q.notify({
        type: 'negative',
        message: 'Ocurrió un error al realizar la búsqueda.',
      });
    }
  } else {
    searchResults.value = [];
  }
};
const logout = () => {
  $q.notify({
    type: 'positive',
    message: 'Sesión cerrada correctamente',
    position: 'bottom',
    timeout: 2000
  });

  authStore.clearAuth();

  setTimeout(() => {
    router.push("/");
  }, 1000);
};

const goToProfile = () => {
  router.push("/perfil");
};

const goToProduct = (product) => {
  if (product && product._id) {
    console.log('Ir al producto:', product._id);
    router.push(`/vistaP/${product._id}`);
    searchQuery.value = '';
  } else {
    console.warn('El producto no tiene un ID válido:', product);
  }
};
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
    console.error('Error al cargar categorías:', err);
    $q.notify({ type: 'negative', message: 'Error al cargar categorías' });
  }
};

const fetchProductsByCategory = async (categoryId) => {
  try {
    const response = await getData(`/producto/categoria/${categoryId}`);
    if (Array.isArray(response)) {
      productsByCategory.value = response;
      // Aquí podrías actualizar la vista para mostrar productsByCategory
      console.log('Productos de la categoría:', productsByCategory.value);
      // Por ejemplo, podrías mostrar un componente con estos productos
    } else {
      console.warn('La respuesta de la API de productos por categoría no es un array:', response);
      productsByCategory.value = [];
      $q.notify({
        type: 'warning',
        message: 'No se encontraron productos para esta categoría.',
      });
    }
  } catch (error) {
    console.error('Error al obtener productos por categoría:', error);
    $q.notify({
      type: 'negative',
      message: 'Ocurrió un error al cargar los productos de esta categoría.',
    });
  }
};

const selectCategory = (category) => {
  console.log('Categoría seleccionada:', category);
  console.log('URL de navegación:', `/vistacategoria/${category._id}`);
  router.push(`/vistacategoria/${category._id}`);

};

onMounted(fetchCategories);




</script>

<style scoped>
#titulo {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  font-size: 20px;
  font-weight: 600;
  color: #212121;
}

.bg-yellow-10 {
  background-color: #6d4c41;
}

.custom-header {
  background-color: #6d4c41;
}

.rounded-input {
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
}

.btn {
  color: white;
}

#btn {
  color: white;
}

.search-results-list {
  position: absolute;
  top: 100%;
  /* Para que aparezca justo debajo del contenedor */
  left: 0;
  right: 0;
  z-index: 10;
  /* Asegura que esté por encima del header y otros elementos */
  margin-top: 0 !important;
  /* Elimina el margen superior predeterminado de q-mt-sm */
  border: 1px solid #ddd;
  /* Opcional: añade un borde para separarlo visualmente */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  /* Opcional: añade una sombra */
}
</style>
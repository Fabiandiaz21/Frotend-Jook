<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="custom-header" height-hint="72">
      <!-- PRIMER TOOLBAR (desktop) -->
      <q-toolbar class="q-px-md text-white">
        <q-btn flat round dense icon="menu" @click="toggleLeftDrawer" class="lt-sm q-mr-sm" />

        <q-toolbar-title class="flex items-center" id="titulo" style="min-width: 150px; color: white;">
          <q-avatar size="36px" class="bg-yellow-8 text-white">
            <q-icon name="shopping_cart" />
          </q-avatar>
          <span class="q-ml-sm text-weight-bold">Jook</span>
        </q-toolbar-title>

        <div class="col q-mx-md gt-xs" style="max-width: 700px;">
          <q-input dense outlined debounce="300" v-model="searchQuery" placeholder="Buscar productos, marcas y más..."
            class="rounded-input bg-white" @update:model-value="handleSearch">
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
          <q-btn flat round dense icon="favorite_border" @click="$router.push('/favoritos')" class="q-mr-sm btn" />
          <q-btn flat round dense icon="shopping_cart" @click="$router.push('/carrito')" class="q-mr-sm btn" />
          <q-btn v-if="isLoggedIn" round flat dense icon="account_circle" class="btn">
            <q-menu>
              <q-list bordered style="min-width: 170px">
                <q-item v-close-popup>
                  <q-item-section>
                    <q-item-label class="text-bold text-white">
                      Hola, {{ authStore.user?.nombre || 'Usuario' }}
                    </q-item-label>
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
          <q-btn v-else round flat dense icon="login" @click="$router.push('/login')" class="btn" />
        </div>
      </q-toolbar>

      <!-- SEGUNDO TOOLBAR (desktop navegación) -->
      <q-toolbar class="custom-header text-white q-px-md q-py-xs gt-xs">
        <q-btn flat label="inicio" @click="$router.push('/')" class="btn" />
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

      <!-- TOOLBAR MÓVIL -->
      <q-toolbar class="custom-header text-white q-px-md q-py-xs lt-sm">
        <div class="col">
          <q-input dense outlined debounce="300" v-model="searchQuery" placeholder="Buscar productos, marcas y más..."
            class="rounded-input bg-white" @update:model-value="handleSearch">
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
      </q-toolbar>
    </q-header>
    <q-drawer v-model="leftDrawerOpen" side="left" overlay elevated>
      <q-list>
        <q-item-label header>
          Menú de Navegación
        </q-item-label>

        <q-item clickable v-ripple @click="$router.push('/'); leftDrawerOpen = false;">
          <q-item-section avatar>
            <q-icon name="home" />
          </q-item-section>
          <q-item-section>
            Inicio
          </q-item-section>
        </q-item>

        <q-expansion-item expand-separator icon="category" label="Categorías">
          <q-list class="q-pl-lg">
            <q-item v-for="categoria in categories" :key="categoria._id" clickable v-ripple
              @click="selectCategory(categoria); leftDrawerOpen = false;">
              <q-item-section>
                <q-item-label>{{ categoria.name }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-expansion-item>

        <q-item clickable v-ripple @click="$router.push('/productos'); leftDrawerOpen = false;">
          <q-item-section avatar>
            <q-icon name="shopping_bag" />
          </q-item-section>
          <q-item-section>
            Productos
          </q-item-section>
        </q-item>

        <q-item clickable v-ripple @click="$router.push('/ayuda'); leftDrawerOpen = false;">
          <q-item-section avatar>
            <q-icon name="help" />
          </q-item-section>
          <q-item-section>
            Ayuda
          </q-item-section>
        </q-item>

      </q-list>
    </q-drawer>

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
import { ref, onMounted, computed } from 'vue';
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
const isLoggedIn = computed(() => authStore.isLoggedIn());

// Estado para controlar la apertura/cierre del q-drawer
const leftDrawerOpen = ref(false);
const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value;
};

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
  showLogoutModal.value = false;
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
    searchQuery.value = ''; // Limpiar la búsqueda al navegar
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



const selectCategory = (category) => {
  console.log('Categoría seleccionada:', category);
  console.log('URL de navegación:', `/vistacategoria/${category._id}`);
  router.push(`/vistacategoria/${category._id}`);
};

onMounted(fetchCategories);
</script>

<style lang="scss">
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
  left: 0;
  right: 0;
  z-index: 10;
  margin-top: 0 !important;
  border: 1px solid #ddd;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}


.custom-header {
  background-color: #6d4c41 !important; 
  color: white;
}

.rounded-input {
  border-radius: 25px;
}

.btn {
  color: white;
}

.search-results-list {
  position: absolute;
  width: 100%;
  z-index: 1000;
  max-height: 250px;
  overflow-y: auto;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); 
}

/* Media Queries para responsividad */
@media (max-width: $breakpoint-xs-max) {
  .q-toolbar-title {
    min-width: unset !important;
  }

  .q-toolbar .col.q-mx-md.gt-xs {
    display: none;
  }

  .q-toolbar.custom-header.gt-xs {
    display: none;
  }

  .q-btn.lt-sm {
    display: block;
  }
}

@media (min-width: $breakpoint-sm-min) {

  .q-toolbar .col.q-mx-md.gt-xs {
    display: block;
  }

  .q-toolbar.custom-header.gt-xs {
    display: flex;
  }

  .q-toolbar.custom-header.lt-sm {
    display: none;
  }

  .q-btn.lt-sm {
    display: none;
  }
}
</style>
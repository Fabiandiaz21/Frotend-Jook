<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="custom-header" height-hint="72">
      <q-toolbar class="q-px-md text-white">
        <q-btn flat round dense icon="menu" @click="toggleLeftDrawer" class="lt-sm q-mr-sm" />

        <q-toolbar-title class="flex items-center" id="titulo" style="min-width: 150px; color: white">
             <q-avatar size="55px" class="bg-yellow-8 text-white" style="margin-top: 15px;">
            <img src = "https://res.cloudinary.com/dvqn0avdc/image/upload/v1749428022/WhatsApp_Image_2025-06-08_at_6.37.31_PM_iyksbv.jpg">
          </q-avatar>
          <span class="q-ml-sm text-weight-bold">Jook</span>
        </q-toolbar-title>

        <div class="col q-mx-md" :class="{ 'gt-xs': $q.screen.gt.xs, 'lt-sm': $q.screen.lt.sm }"
          style="max-width: 700px; position: relative">
          <q-input dense outlined debounce="300" v-model="searchQuery" placeholder="Buscar productos, marcas y más..."
            class="rounded-input bg-white" @update:model-value="handleSearch">
            <template #append>
              <q-icon name="search" />
            </template>
          </q-input>

          <div v-if="searchQuery" style="position: absolute; width: 100%; z-index: 10; top: 100%">
            <q-list v-if="searchResults.length > 0"
              class="bg-white rounded-borders shadow-1 q-mt-sm search-results-list text-black">
              <q-item clickable v-for="item in sortedSearchResults" :key="item._id || item.nombre || item.name"
                @click="handleItemClick(item)">
                <q-item-section>
                  <q-item-label v-if="item.tipoResultado === 'producto'">
                    📦 Producto: {{ item.nombre || "[sin nombre]" }}
                  </q-item-label>
                  <q-item-label v-else-if="item.tipoResultado === 'marca'">
                    🏷️ Marca: {{ item.nombre || "[sin nombre]" }}
                  </q-item-label>
                  <q-item-label v-else-if="item.tipoResultado === 'categoria'">
                    📂 Categoría:
                    {{ item.name || item.nombre || "[sin nombre]" }}
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
            <div v-else class="q-pa-md bg-white rounded-borders shadow-1 q-mt-sm text-black">
              No se encontraron resultados para "{{ searchQuery }}"
            </div>
          </div>
        </div>

        <div class="flex items-center">

          <div class="cart-button-container">
            <q-btn flat round dense icon="favorite_border" @click="$router.push('/favoritos')" class="q-mr-sm btn" />
            <q-badge v-if="authStore.favorites.length > 0" floating color="red" rounded class="cart-badge">
              {{ authStore.favorites.length }}
            </q-badge>
          </div>

          <div class="q-pa-md">
            <div class="cart-button-container">
              <q-btn flat round dense icon="shopping_cart" @click="$router.push('/carrito')" class="q-mr-sm btn" />
              <q-badge v-if="cartStore.items.length > 0" floating color="red" rounded class="cart-badge">
                {{ cartStore.items.length }}
              </q-badge>
            </div>
          </div>

          <q-btn v-if="isLoggedIn" round flat dense icon="account_circle" class="btn">
            <q-menu>
              <q-list bordered style="min-width: 170px">
                <q-item v-close-popup>
                  <q-item-section>
                    <q-item-label class="text-bold text-black">
                      Hola, {{ authStore.user?.nombre || "Usuario" }}
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
          <q-btn v-else flat dense label="Iniciar sesión" @click="$router.push('/login')" class="btn" />
        </div>
      </q-toolbar>

      <q-toolbar class="custom-header text-white q-px-md q-py-xs gt-xs">
        <q-btn flat label="inicio" @click="$router.push('/')" class="btn" />
        <q-btn flat label="Categorías" icon-right="arrow_drop_down" class="btn">
          <q-menu>
            <q-list style="min-width: 250px; max-height: 300px; overflow-y: auto">
              <q-item v-for="categoria in categories" :key="categoria._id" clickable @click="selectCategory(categoria)">
                <q-item-section>
                  <q-item-label class="text-bold">{{
                    categoria.name
                  }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
        <q-btn flat label="Productos" @click="$router.push('/productos')" class="btn" />
        <q-space />
        <q-btn flat label="Ayuda" class="btn" />
      </q-toolbar>

      <q-toolbar class="custom-header text-white q-px-md q-py-xs lt-sm">
      </q-toolbar>
    </q-header>
    <q-drawer v-model="leftDrawerOpen" side="left" overlay elevated>
      <q-list>
        <q-item-label header> Menú de Navegación </q-item-label>

        <q-item clickable v-ripple @click="
          $router.push('/');
        leftDrawerOpen = false;
        ">
          <q-item-section avatar>
            <q-icon name="home" />
          </q-item-section>
          <q-item-section> Inicio </q-item-section>
        </q-item>

        <q-expansion-item expand-separator icon="category" label="Categorías">
          <q-list class="q-pl-lg">
            <q-item v-for="categoria in categories" :key="categoria._id" clickable v-ripple @click="
              selectCategory(categoria);
            leftDrawerOpen = false;
            ">
              <q-item-section>
                <q-item-label>{{ categoria.name }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-expansion-item>

        <q-item clickable v-ripple @click="
          $router.push('/productos');
        leftDrawerOpen = false;
        ">
          <q-item-section avatar>
            <q-icon name="shopping_bag" />
          </q-item-section>
          <q-item-section> Productos </q-item-section>
        </q-item>

        <q-item clickable v-ripple @click="
          $router.push('/ayuda');
        leftDrawerOpen = false;
        ">
          <q-item-section avatar>
            <q-icon name="help" />
          </q-item-section>
          <q-item-section> Ayuda </q-item-section>
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
import { ref, onMounted, computed } from "vue";
import { useRouter, useRoute } from "vue-router"; // Importa useRoute
import { useQuasar } from "quasar";
import { getData } from "../services/jook";
import { useAuthStore } from "../Store/useAunt";
import { cargarFavoritos } from "../utils/utils";
const showLogoutModal = ref(false);
const searchQuery = ref("");
const categories = ref([]);
const productsByCategory = ref([]);
const router = useRouter();
const route = useRoute(); // Instancia useRoute
const $q = useQuasar();
const searchResults = ref([]);
import { useCartStore } from "../Store/useCartStore";
const cartStore = useCartStore();
const authStore = useAuthStore();
const isLoggedIn = computed(() => authStore.isLoggedIn());

const sortedSearchResults = computed(() => {
  return [...searchResults.value].sort((a, b) => {
    const order = { categoria: 0, marca: 1, producto: 2 };
    return (order[a.tipoResultado] ?? 99) - (order[b.tipoResultado] ?? 99);
  });
});

// Estado para controlar la apertura/cierre del q-drawer
const leftDrawerOpen = ref(false);
const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value;
};

const handleSearch = async (newValue) => {
  if (newValue) {
    try {
      const response = await getData(`/producto/search?search=${newValue}`);
      console.log("Respuesta completa:", response);

      if (response && typeof response === "object") {
        const { productos, sugerenciasMarca, sugerenciasCategoria } = response;

        searchResults.value = [
          // Productos
          ...productos.map((p) => ({
            ...p,
            tipoResultado: "producto",
          })),

          // Marcas sugeridas (como strings)
          ...sugerenciasMarca.map((m) => ({
            _id: m._id,
            nombre: m.nombre,
            tipoResultado: "marca",
          })),

          // Categorías sugeridas (con name y _id)
          ...sugerenciasCategoria.map((c) => ({
            ...c,
            tipoResultado: "categoria",
          })),
        ];
      } else {
        searchResults.value = [];
        console.warn("La respuesta del servidor no tiene el formato esperado.");
      }
    } catch (error) {
      console.error("Error al buscar:", error);
      $q.notify({
        type: "negative",
        message: "Ocurrió un error al realizar la búsqueda.",
      });
    }
  } else {
    searchResults.value = [];
  }
};

const handleItemClick = (item) => {
  if (item.tipoResultado === "producto" && item._id) {
    router.push(`/vistaP/${item._id}`);
  } else if (item.tipoResultado === "marca" && item._id) {
    router.push({ name: "vistamarca", params: { id: item._id } });
  } else if (item.tipoResultado === "categoria" && item._id) {
    router.push(`/vistacategoria/${item._id}`);
  } else {
    console.warn("Tipo de resultado no manejado:", item);
  }

  searchQuery.value = "";
};

const logout = () => {
  showLogoutModal.value = false;
  $q.notify({
    type: "positive",
    message: "Sesión cerrada correctamente",
    position: "bottom",
    timeout: 2000,
  });

  authStore.clearAuth();

  setTimeout(() => {
    router.push("/");
  }, 1000);
};

const goToProfile = () => {
  router.push("/perfil");
};

const fetchCategories = async () => {
  try {
    const response = await getData("/categoria");
    if (Array.isArray(response)) {
      categories.value = response;
    } else {
      console.warn(
        "La respuesta de la API de categorías no es un array:",
        response
      );
      categories.value = [];
    }
  } catch (err) {
    console.error("Error al cargar categorías:", err);
    $q.notify({ type: "negative", message: "Error al cargar categorías" });
  }
};

const selectCategory = (category) => {
  console.log("Categoría seleccionada:", category);
  console.log("URL de navegación:", `/vistacategoria/${category._id}`);
  router.push(`/vistacategoria/${category._id}`);
};

onMounted(() => {
  fetchCategories();
  cargarFavoritos();
  // Verificar si hay un parámetro de búsqueda en la URL al cargar el componente
  if (route.query.search) {
    searchQuery.value = route.query.search;
    handleSearch(route.query.search);
  }
});
</script>

<style lang="scss">
.black {
  color: #212121;
}

.cart-button-container {
  position: relative;
  display: inline-block;
}

.cart-badge {
  position: absolute;
  top: 1px;
  /* Ajusta este valor (disminúyelo para subir la burbuja) */
  right: 1px;
  /* Ajusta este valor (disminúyelo para acercar la burbuja al icono) */
  transform: translate(5%, -30%);
  font-size: 0.7em;
  padding: 3px 6px;
  border-radius: 50%;
  min-width: 20px;
  height: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1;
}

#titulo {
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
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

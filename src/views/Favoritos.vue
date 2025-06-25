<template>
  <q-page class="favorites-page">
    <div class="page-header bg-brown-1 q-pa-md">
      <q-toolbar class="text-brown-9">
        <q-toolbar-title class="text-h4">
          <q-icon name="favorite" class="q-mr-sm" />
          Mis Favoritos
        </q-toolbar-title>
        <q-badge color="brown-6" rounded>
          {{ favoritos.length }} items
        </q-badge>
      </q-toolbar>
      <q-separator color="brown-3" />
    </div>

    <div class="page-content q-pa-md">
      <q-card class="favorites-card" flat bordered>
        <template v-if="favoritos.length > 0">
          <q-list separator class="favorites-list">
            <q-item v-for="producto in favoritos" :key="producto._id" clickable @click="verDetalle(producto._id)"
              class="favorite-item">
              <q-item-section avatar>
                <q-img :src="producto.images?.[0] || 'https://via.placeholder.com/150'" class="product-image" ratio="1"
                  spinner-color="brown-6" />
              </q-item-section>

              <q-item-section>
                <q-item-label class="product-name text-brown-9">
                  <strong>{{ producto.nombre }}</strong>
                </q-item-label>
                <q-item-label class="product-description text-brown-7">
                  {{ producto.descripcion }}
                </q-item-label>

                <div class="row q-mt-sm">
                  <div class="col-6">
                    <q-item-label class="text-caption text-brown-7">
                      <q-icon name="local_offer" size="sm" />
                      Marca: {{ getNombreMarca(producto.marca) }}
                    </q-item-label>
                  </div>
                  <div class="col-6">
                    <q-item-label class="text-caption text-brown-7">
                      <q-icon name="category" size="sm" />
                      Tipo: {{ getNombreTipo(producto.tipo) }}
                    </q-item-label>
                  </div>
                </div>
              </q-item-section>

              <q-item-section side top>
                <div class="column items-end">
                  <div class="product-price text-h6 text-brown-8 q-mb-xs">
                    ${{ formatNumberWithThousandsSeparator(producto.price) }}
                  </div>
                  <q-badge :color="producto.stock > 0 ? 'green-6' : 'red-6'" :label="producto.stock > 0
                      ? 'Disponible (' + producto.stock + ')'
                      : 'Agotado'
                    " rounded />
                  <q-btn round flat color="brown-6" icon="delete" @click.stop="removeFromFavorites(producto._id)"
                    class="q-mt-sm" />
                </div>
              </q-item-section>
            </q-item>
          </q-list>
        </template>

        <template v-else>
          <div class="empty-state column items-center q-pa-xl">
            <q-icon name="favorite_border" size="xl" color="brown-4" />
            <div class="text-h6 text-brown-7 q-mt-md">
              No tienes productos favoritos aún
            </div>
            <q-btn label="Explorar productos" color="brown-6" unelevated class="q-mt-md"
              @click="router.push('/productos')" />
          </div>
        </template>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../Store/useAunt";
import { useQuasar } from "quasar";
import { getData, postData } from '../Services/jook.js';


// Asegúrate de que cargarFavoritos y formatNumberWithThousandsSeparator sean exportados y usados correctamente
import { cargarFavoritos, formatNumberWithThousandsSeparator } from "../utils/utils.js";

const $q = useQuasar();
const router = useRouter();

const authStore = useAuthStore();

const favoritos = computed(() => authStore.favorites);
const marcas = ref([]);
const tipos = ref([]);

// Navegar al detalle del producto
const verDetalle = (id) => {
  router.push(`/vistap/${id}`);
};

// Eliminar un producto de favoritos
const removeFromFavorites = (productId) => {
  $q.dialog({
    title: "Eliminar de favoritos",
    message: "¿Estás seguro de que quieres eliminar este producto de tus favoritos?",
    cancel: true,
    persistent: true,
    color: "brown-8",
  }).onOk(async () => {
    try {
      const token = authStore.token;
      if (!token) {
        $q.notify({
          message: "No autenticado. Por favor, inicia sesión.",
          color: "red-6",
          icon: "warning",
          position: "top",
        });
        return;
      }

      // Usando postData en lugar de axios.post
      const res = await postData(
        `/usuario/favoritos/${productId}`,
        {}, // El cuerpo de la solicitud es vacío para esta API
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Asumiendo que `res` contiene la respuesta del servidor directamente (no anidada en `.data`)
      if (res.mensaje?.includes("eliminado")) {
        authStore.removeFromFavorites(productId);
        $q.notify({
          message: "Producto eliminado de favoritos",
          color: "green",
          icon: "check",
          position: "top",
        });
      } else {
        $q.notify({
          message: "Este producto no estaba en favoritos",
          color: "orange-6",
          icon: "info",
          position: "top",
        });
      }
    } catch (error) {
      console.error("Error al eliminar de favoritos:", error);
      $q.notify({
        message:
          "Error al eliminar el producto de favoritos. Por favor, inténtalo de nuevo.",
        color: "red-6",
        icon: "error",
        position: "top",
      });
    }
  });
};

// Cargar marcas
const cargarMarcas = async () => {
  try {
    // Usando getData en lugar de axios.get
    const res = await getData("/marca");
    marcas.value = res; // Asumiendo que getData retorna los datos directamente
  } catch (error) {
    $q.notify({
      message: "No se pudieron cargar las marcas",
      color: "red-6",
      icon: "error",
      position: "top",
    });
  }
};

// Cargar tipos
const cargarTipos = async () => {
  try {
    // Usando getData en lugar de axios.get
    const res = await getData("/tipo");
    tipos.value = res; // Asumiendo que getData retorna los datos directamente
  } catch (error) {
    $q.notify({
      message: "No se pudieron cargar los tipos de producto",
      color: "red-6",
      icon: "error",
      position: "top",
    });
  }
};

// Obtener nombre de marca
const getNombreMarca = (id) => {
  const marca = marcas.value.find((m) => m._id === id);
  return marca ? marca.nombre : "Sin marca";
};

// Obtener nombre de tipo
const getNombreTipo = (id) => {
  const tipo = tipos.value.find((t) => t._id === id);
  return tipo ? tipo.nombre : "Sin tipo";
};

// Al montar el componente
onMounted(() => {
  cargarFavoritos();
  cargarMarcas();
  cargarTipos();
});
</script>

<style scoped>
.favorites-page {
  background-color: #fffaf4;
}

.product-image {
  border-radius: 12px;
}

.favorite-item {
  transition: background-color 0.2s;
}

.favorite-item:hover {
  background-color: #f9f1e7;
}
</style>
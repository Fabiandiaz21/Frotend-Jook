<template>
  <q-page class="favorites-page">
    <!-- Encabezado -->
    <div class="page-header bg-brown-1 q-pa-md">
      <q-toolbar class="text-brown-9">
        <q-toolbar-title class="text-h4">
          <q-icon name="favorite" class="q-mr-sm" /> Mis Favoritos
        </q-toolbar-title>
        <q-badge color="brown-6" rounded>
          {{ favoritos.length }} items
        </q-badge>
      </q-toolbar>
      <q-separator color="brown-3" />
    </div>

    <!-- Contenido principal -->
    <div class="page-content q-pa-md">
      <!-- Lista de favoritos -->
      <q-card class="favorites-card" flat bordered>
        <template v-if="favoritos.length > 0">
          <q-list separator class="favorites-list">
            <q-item
              v-for="producto in favoritos"
              :key="producto._id"
              clickable
              @click="verDetalle(producto._id)"
              class="favorite-item"
            >
              <q-item-section avatar>
                <q-img
                  :src="
                    producto.images?.[0] || 'https://via.placeholder.com/150'
                  "
                  class="product-image"
                  ratio="1"
                  spinner-color="brown-6"
                />
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
                      Tipo: {{ producto.tipo }}
                    </q-item-label>
                  </div>
                </div>
              </q-item-section>

              <q-item-section side top>
                <div class="column items-end">
                  <div class="product-price text-h6 text-brown-8 q-mb-xs">
                    ${{ producto.price }}
                  </div>
                  <q-badge
                    :color="producto.stock > 0 ? 'green-6' : 'red-6'"
                    :label="
                      producto.stock > 0
                        ? 'Disponible (' + producto.stock + ')'
                        : 'Agotado'
                    "
                    rounded
                  />
                  <q-btn
                    round
                    flat
                    color="brown-6"
                    icon="delete"
                    @click.stop="removeFromFavorites(producto._id)"
                    class="q-mt-sm"
                  />
                </div>
              </q-item-section>
            </q-item>
          </q-list>
        </template>

        <!-- Estado vacío -->
        <template v-else>
          <div class="empty-state column items-center q-pa-xl">
            <q-icon name="favorite_border" size="xl" color="brown-4" />
            <div class="text-h6 text-brown-7 q-mt-md">
              No tienes productos favoritos aún
            </div>
            <q-btn
              label="Explorar productos"
              color="brown-6"
              unelevated
              class="q-mt-md"
              @click="router.push('/productos')"
            />
          </div>
        </template>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { cargarFavoritos } from "../utils/utils";
import { useRouter } from "vue-router";
import { useAuthStore } from "../Store/useAunt";
import { useQuasar } from "quasar";
import axios from "axios";

const $q = useQuasar();
const authStore = useAuthStore();
const router = useRouter();
const favoritos = authStore.favorites;
const marcas = ref([]);

const verDetalle = (id) => {
  router.push(`/vistap/${id}`);
};

const removeFromFavorites = (productId) => {
  $q.dialog({
    title: "Eliminar de favoritos",
    message:
      "¿Estás seguro de que quieres eliminar este producto de tus favoritos?",
    cancel: true,
    persistent: true,
    color: "brown-8",
  }).onOk(() => {
    authStore.removeFromFavorites(productId);
    $q.notify({
      message: "Producto eliminado de favoritos",
      color: "brown-6",
      icon: "check",
      position: "top",
    });
  });
};

const cargarMarcas = async () => {
  try {
    const res = await axios.get("http://localhost:3000/api/marca"); // Ajusta la URL a tu backend
    marcas.value = res.data;
  } catch (error) {
    $q.notify({
      message: "No se pudieron cargar las marcas",
      color: "red-6",
      icon: "error",
      position: "top",
    });
  }
};

const getNombreMarca = (id) => {
  const marca = marcas.value.find((m) => m._id === id);
  return marca ? marca.nombre : "Sin marca";
};

onMounted(() => {
  cargarFavoritos();
  cargarMarcas();
});
</script>

<style scoped>
.favorites-page {
  background-color: #f9f5f0;
}

.page-header {
  border-bottom: 1px solid #e0d6cc;
}

.favorites-card {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(139, 69, 19, 0.1);
  border: 1px solid #e0d6cc;
}

.favorites-list {
  background-color: #fff;
}

.favorite-item {
  transition: all 0.3s ease;
  border-bottom: 1px solid #efebe9;
}

.favorite-item:last-child {
  border-bottom: none;
}

.favorite-item:hover {
  background-color: #f5efe8;
  transform: translateX(2px);
}

.product-image {
  width: 100px;
  height: 100px;
  border-radius: 4px;
  border: 1px solid #e0d6cc;
}

.product-name {
  font-size: 1.1rem;
  line-height: 1.4;
}

.product-description {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.product-price {
  font-weight: 600;
}

.empty-state {
  background-color: #fff;
  border-radius: 8px;
}

/* Animación para los items */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.favorite-item {
  animation: fadeIn 0.3s ease forwards;
}

.favorite-item:nth-child(1) {
  animation-delay: 0.1s;
}
.favorite-item:nth-child(2) {
  animation-delay: 0.2s;
}
.favorite-item:nth-child(3) {
  animation-delay: 0.3s;
}
.favorite-item:nth-child(4) {
  animation-delay: 0.4s;
}
.favorite-item:nth-child(5) {
  animation-delay: 0.5s;
}
</style>

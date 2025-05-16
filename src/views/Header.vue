<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="custom-header" height-hint="98">
      <q-toolbar class="bg-brown">

        <!-- Título -->
        <q-toolbar-title class="flex items-center" id="titulo">
          <q-avatar />
          <span class="q-ml-sm">Jook</span>
        </q-toolbar-title>

        <!-- Barra de búsqueda -->
        <q-input
          dense
          outlined
          debounce="300"
          v-model="searchQuery"
          placeholder="Buscar..."
          class="q-mr-md"
          rounded
          bg-color="white"
          style="max-width: 250px"
        >
          <template #append>
            <q-icon name="search" />
          </template>
        </q-input>

        <!-- Menú de usuario -->
        <q-btn round flat dense icon="account_circle" class="q-mr-sm">
          <q-menu>
            <q-list style="min-width: 150px">
              <q-item clickable v-close-popup>
                <q-item-section>
                  <q-item-label>Hola, Usuario</q-item-label>
                </q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="goToProfile">
                <q-item-section>
                  <q-item-label>Perfil</q-item-label>
                </q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="showLogoutModal = true">
                <q-item-section>
                  <q-item-label>Cerrar sesión</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>

      <q-tabs align="center" class="bg-brown text-white">
        <q-route-tab to="/inicio" label="Inicio" />
        <q-route-tab to="/productos" label="Productos" />
      </q-tabs>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>

    <!-- Modal de cierre de sesión -->
    <q-dialog v-model="showLogoutModal" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="red" text-color="white" />
          <span class="q-ml-sm">¿Estás seguro de que quieres cerrar sesión?</span>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="primary" v-close-popup />
          <q-btn flat label="Cerrar sesión" color="red" @click="logout" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';

const isAdmin = ref(localStorage.getItem('userRole') === 'admin');
const showLogoutModal = ref(false);
const searchQuery = ref('');
const router = useRouter();
const $q = useQuasar();

const logout = () => {
  $q.notify({
    type: 'positive',
    message: 'Sesión cerrada correctamente',
    position: 'bottom',
    timeout: 2000
  });

  setTimeout(() => {
    router.push("/");
  }, 1000);
};

const goToProfile = () => {
  router.push("/perfil");
};
</script>

<style scoped>
#titulo {
  font-family: 'Times New Roman', Times, serif;
  font-size: 30px;
  font-weight: 700;
  color: white;
}

.custom-header {
  background-color: #8B4513;
}
</style>

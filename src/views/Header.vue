<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="custom-header" height-hint="98">
      <q-toolbar class="bg-brown">
        <q-toolbar-title class="flex flex-center" id="titulo">
          <q-avatar />
          Jook
        </q-toolbar-title>

        <!-- Botón para abrir el modal -->
        <q-btn flat dense icon="logout" @click="showLogoutModal = true" class="q-mr-md" />
      </q-toolbar>

      <q-tabs align="center" class="bg-brown text-white">
        <q-route-tab to="/inicio" label="Inicio" />
        <q-route-tab to="/productos" label="Productos" />

        <!-- Solo mostrar el tab de "Agregar Productos" si el usuario es admin -->
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
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';

// Verificamos si el usuario es admin basándonos en localStorage
const isAdmin = ref(localStorage.getItem('userRole') === 'admin');

const showLogoutModal = ref(false);
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
    router.push("/"); // Redirigir a la página principal
  }, 1000);
};
</script>

<style scoped>
#titulo {
  font-family: 'Times New Roman', Times, serif;
  font-size: 30px;
  font-weight: 700;
  color: white; /* Texto blanco */
}

.custom-header {
  background-color: #8B4513; /* Fondo principal café del header */
}
</style>

<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="custom-header" height-hint="72">
      <q-toolbar class="q-px-md text-dark">
        <q-toolbar-title class="flex items-center" id="titulo" style="min-width: 150px; color: white;" >
          <q-avatar size="36px" class="bg-yellow-8 text-white">
            <q-icon name="shopping_cart" />
          </q-avatar>
          <span class="q-ml-sm text-weight-bold">Jook</span>
        </q-toolbar-title>

        <div class="col q-mx-md" style="max-width: 700px;">
          <q-input
            dense
            outlined
            debounce="300"
            v-model="searchQuery"
            placeholder="Buscar productos, marcas y más..."
            class="rounded-input bg-white"
          >
            <template #prepend>
              <q-btn flat round icon="menu" />
            </template>
            <template #append>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>

        <div class="flex items-center">
          <q-btn flat round dense icon="favorite_border" class="q-mr-sm"  id="btn" />
          <q-btn flat round dense icon="notifications_none" class="q-mr-sm" id="btn" />
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
        <q-btn flat label="inicio" to="inicio" class="btn"/>
        <q-btn flat label="Productos" to="productos" class="btn" />
        <q-space />
        <q-btn flat label="Ayuda" class="btn"/>
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
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  font-size: 20px;
  font-weight: 600;
  color: #212121; /* Un color más oscuro para el logo */
}

.bg-yellow-10 {
  background-color: #6d4c41;
}

.custom-header {
  background-color: #6d4c41;
}

.rounded-input {
  border-radius: 4px; /* Bordes más sutiles */
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24); /* Sombra sutil */
}

.btn{
  color: white;
}

#btn{
  color: white;
}
</style>
<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="custom-header" height-hint="98">
      <q-toolbar class="bg-brown text-white">

        <!-- Logo y título -->
        <q-toolbar-title class="row items-center q-gutter-sm">
          <q-avatar>
            <img src="/logo.png" alt="Logo" />
          </q-avatar>
          <span class="text-h6"></span>
        </q-toolbar-title>

        <!-- Tabs centrados -->
        <q-tabs align="center" class="bg-brown text-white q-mx-auto" active-color="amber-4" indicator-color="amber-4">
          <q-route-tab to="/admin/Agregar" label="Agregar Productos" />
          <q-route-tab to="/admin/categoria" label="Categorías" />
          <q-route-tab to="/admin/Usuarios" label="Usuarios" />
        </q-tabs>

        <!-- Menú del usuario admin -->
        <q-btn flat round icon="account_circle" color="white">
          <q-menu>
            <q-list style="min-width: 150px">
              <q-item>
                <q-item-section>
                  <q-item-label class="text-bold">Hola, {{ userName }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-separator />
              <q-item clickable @click="logout">
                <q-item-section>
                  <q-item-label>Salir</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>

      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const userName = ref(localStorage.getItem('userName') || 'Admin')

const logout = () => {
  localStorage.clear()
  router.replace('/')
}
</script>

<style scoped>
.custom-header {
  background-color: #6d4c41;
  /* Color café oscuro si no usas bg-brown de Quasar */
}
</style>

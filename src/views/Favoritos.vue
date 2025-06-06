<template>
    <q-page padding>
      <q-toolbar>
        <q-toolbar-title>Mis Favoritos</q-toolbar-title>
      </q-toolbar>
  
      <q-list bordered padding>
        <q-item
          v-for="producto in favoritos"
          :key="producto._id"
          clickable
          @click="verDetalle(producto._id)"
        >
          <q-item-section avatar>
            <q-img
              :src="producto.images?.[0] || 'https://via.placeholder.com/80'"
              style="width: 80px; height: 80px;"
              contain
            />
          </q-item-section>
  
          <q-item-section>
            <q-item-label><strong>{{ producto.nombre }}</strong></q-item-label>
            <q-item-label caption>{{ producto.descripcion }}</q-item-label>
            <q-item-label>Marca: {{ producto.marca }}</q-item-label>
            <q-item-label>Tipo: {{ producto.tipo }}</q-item-label>
            <q-item-label>Precio: ${{ producto.price }}</q-item-label>
            <q-item-label>Stock: {{ producto.stock }}</q-item-label>
          </q-item-section>
        </q-item>
  
        <div v-if="favoritos.length === 0" class="text-center q-mt-xl">
          No tienes productos favoritos aún.
        </div>
      </q-list>
    </q-page>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { cargarFavoritos } from '../utils/utils'
  import { useRouter } from 'vue-router'
  import { useAuthStore } from '../Store/useAunt'
  const authStore = useAuthStore()
  const router = useRouter()

  const favoritos = authStore.favorites;
  
  

  
  const verDetalle = (id) => {
    router.push(`/vistap/${id}`)
  }

  
  onMounted(() => {
    cargarFavoritos()
  })
  </script>
  
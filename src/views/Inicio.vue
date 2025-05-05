<template>
  <div>
    <h1>Bienvenido</h1>
    
    <q-btn v-if="auth.role === 'admin'" color="primary" label="Agregar Producto" @click="irAgregarProducto" />
  </div>
</template>

<script setup>
import { useAuthStore } from '../Store/useAunt.js';
import { useRouter } from 'vue-router';

const auth = useAuthStore();
const router = useRouter();

const irAgregarProducto = () => {
  router.push('/Agregar'); // Asegúrate de tener esta ruta
};
</script>

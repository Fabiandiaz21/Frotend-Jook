<template>
    <q-page class="flex flex-center">
      <q-card class="my-card" bordered>
        <q-card-section>
          <div class="q-mb-md text-center">
            <q-avatar size="120px">
              <img :src="user.profilePic" alt="User Avatar" />
            </q-avatar>
            <h2 class="q-mt-sm">{{ user.name }}</h2>
            <p>{{ user.email }}</p>
          </div>
          <q-separator />
          <div class="q-mt-md">
            <q-btn
              label="Editar perfil"
              color="primary"
              class="full-width q-mb-xs"
              @click="editProfile"
            />
            <q-btn
              label="Mis Productos"
              color="secondary"
              class="full-width"
              @click="viewProducts"
            />
          </div>
          <q-separator />
          <div class="q-mt-md text-center">
            <q-btn
              label="Cerrar sesión"
              color="negative"
              @click="logout"
            />
          </div>
        </q-card-section>
      </q-card>
    </q-page>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  
  // Definimos los datos del usuario con ref
  const user = ref({
    name: 'Juan Pérez',
    email: 'juanperez@ejemplo.com',
    profilePic: 'https://via.placeholder.com/150',
  });
  
  // Accedemos a router para navegar a otras páginas
  const router = useRouter();
  
  // Métodos para navegación y acciones
  const editProfile = () => {
    router.push('/edit-profile');
  };
  
  const viewProducts = () => {
    router.push('/my-products');
  };
  
  const logout = () => {
    // Aquí iría la lógica de cierre de sesión
    console.log('Cerrando sesión...');
  };
  </script>
  
  <style scoped>
  .my-card {
    max-width: 400px;
    width: 100%;
    padding: 16px;
    border-radius: 16px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  
  .q-card-section {
    padding: 16px;
  }
  
  .q-btn {
    font-weight: bold;
  }
  
  .q-mb-xs {
    margin-bottom: 8px;
  }
  </style>
  
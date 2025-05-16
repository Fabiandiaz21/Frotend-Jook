<template>
  <q-page class="flex flex-center bg-grey-2">
    <q-card class="profile-card" flat bordered>
      <q-card-section class="text-center">
        <q-avatar size="120px" class="q-mb-sm">
          <img :src="user.profilePic || ''" alt="User Avatar" />
        </q-avatar>
        <div class="text-h6">{{ user.name }}</div>
        <div class="text-subtitle2 text-grey-7">{{ user.email }}</div>
        <div class="text-caption text-grey-6">Rol: {{ user.role }}</div>
        <div class="text-caption text-green">Estado: {{ user.estado }}</div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <q-btn label="Editar perfil" color="primary" icon="edit" class="full-width q-mb-sm" @click="isEditing = true" />
        <q-btn label="Productos comprados" color="secondary" icon="shopping_cart" class="full-width"
          @click="viewProducts" />
        <q-btn label="Seleccionar imagen desde dispositivo" color="secondary" flat icon="image"
          @click="triggerFileInput" />
        <input type="file" ref="fileInput" accept="image/*" class="hidden" @change="handleFileUpload" />
      </q-card-section>
    </q-card>

    <!-- Modal de edición -->
    <q-dialog v-model="isEditing">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Editar Perfil</div>
        </q-card-section>

        <q-card-section class="q-gutter-md">
          <q-input v-model="editData.name" label="Nombre" />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey" @click="isEditing = false" />
          <q-btn flat label="Guardar" color="primary" @click="saveProfile" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { getData, postData, putData } from '../Services/jook.js';
import { useAuthStore } from '../Store/useAunt.js';
const store = useAuthStore()


const router = useRouter();

const user = ref({
  name: '',
  email: '',
  profilePic: '',
  role: '',
  estado: '',
});

const editData = ref({
  name: '',
  email: '',
  profilePic: '',
});

const isEditing = ref(false);

// Obtener datos del perfil
const loadProfile = async () => {
  try {
    const response = await getData(`usuario/perfil/${store.userID}`); // Asegúrate de que el token esté incluido en la solicitud
    user.value = response;
    console.log(response);
  } catch (error) {
    console.error('Error al cargar el perfil:', error);
  }
};

// Guardar cambios del perfil
const saveProfile = async () => {
  try {
    await putData('/usuario', editData.value); // Asegúrate de que la ruta sea correcta
    user.value = { ...user.value, ...editData.value }; // Actualiza solo los campos editables
    isEditing.value = false;
  } catch (error) {
    console.error('Error al guardar el perfil:', error);
  }
};

watch(isEditing, (newVal) => {
  if (newVal) {
    editData.value = {
      name: user.value.name,
      email: user.value.email,
      profilePic: user.value.profilePic,
    };
  }
});

const viewProducts = () => {
  router.push('/my-products');
};

const fileInput = ref(null);

const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleFileUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('profilePic', file);
  formData.append('userId', user.value._id); // Agregar el userId para asociar la imagen

  try {
    const data = await postData('/usuario/upload-profile-pic', formData); // Endpoint para subir la imagen

    if (data.success) {
      editData.value.profilePic = data.imageUrl;
      user.value.profilePic = data.imageUrl; // Actualiza la vista con la nueva imagen
    } else {
      console.error('Error al subir la imagen:', data.message);
    }
  } catch (err) {
    console.error('Error al subir la imagen:', err);
  }
};

onMounted(() => {
  loadProfile();
});
</script>

<style scoped>
.profile-card {
  max-width: 480px;
  width: 100%;
  border-radius: 24px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.05);
  background: white;
}

.q-btn {
  font-weight: 500;
  border-radius: 12px;
}

.q-avatar img {
  border-radius: 50%;
  border: 4px solid #e0e0e0;
}
</style>

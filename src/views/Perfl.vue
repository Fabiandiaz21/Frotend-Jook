<template>
  <q-page class="flex flex-center bg-coffee-page">
    <q-card class="profile-card" flat bordered>
      <!-- Sección superior con avatar -->
      <q-card-section class="profile-header text-center">
        <div class="avatar-container">
          <q-avatar size="140px" class="profile-avatar">
            <img :src="user.profilePic || 'https://cdn.quasar.dev/img/boy-avatar.png'" alt="User Avatar" />
            <q-icon 
              name="photo_camera" 
              class="camera-icon" 
              size="sm"
              @click="triggerFileInput"
            />
          </q-avatar>
        </div>
        <div class="text-h5 text-coffee-dark q-mt-md">{{ user.name }}</div>
        <div class="text-subtitle1 text-coffee-medium">{{ user.email }}</div>
        
        <div class="badges-container q-mt-sm">
          <q-badge outline color="coffee-gold" class="text-coffee-dark">
            Rol: {{ user.role }}
          </q-badge>
          <q-badge outline :color="user.estado === 'Activo' ? 'positive' : 'negative'" class="q-ml-sm">
            {{ user.estado }}
          </q-badge>
        </div>
      </q-card-section>

      <q-separator color="coffee-light" />

      <!-- Sección de acciones -->
      <q-card-section class="actions-section">
        <q-btn 
          label="Editar perfil" 
          color="coffee-medium" 
          icon="edit" 
          class="full-width q-mb-sm action-btn"
          @click="isEditing = true" 
        />
        <q-btn 
          label="Productos comprados" 
          color="coffee-dark" 
          icon="shopping_cart" 
          class="full-width q-mb-sm action-btn"
          @click="viewProducts" 
        />
        <q-btn 
          label="Cambiar imagen de perfil" 
          color="coffee-gold" 
          flat 
          icon="image" 
          class="full-width action-btn"
          @click="triggerFileInput" 
        />
        <input type="file" ref="fileInput" accept="image/*" class="hidden" @change="handleFileUpload" />
      </q-card-section>
    </q-card>

    <!-- Modal de edición -->
    <q-dialog v-model="isEditing">
      <q-card class="edit-modal">
        <q-card-section class="modal-header">
          <div class="text-h6 text-coffee-dark">Editar Perfil</div>
        </q-card-section>

        <q-card-section class="q-gutter-md modal-body">
          <q-input 
            v-model="editData.name" 
            label="Nombre" 
            color="coffee-dark"
            standout="bg-coffee-light text-coffee-dark"
            class="custom-input"
          />
          <q-input 
            v-model="editData.email" 
            label="Email" 
            color="coffee-dark"
            standout="bg-coffee-light text-coffee-dark"
            class="custom-input"
            readonly
          />
        </q-card-section>

        <q-card-actions align="right" class="modal-footer">
          <q-btn 
            flat 
            label="Cancelar" 
            color="coffee-medium" 
            @click="isEditing = false" 
            class="cancel-btn"
          />
          <q-btn 
            flat 
            label="Guardar" 
            color="coffee-dark" 
            @click="saveProfile" 
            class="save-btn"
          />
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
    const response = await getData(`usuario/perfil/${store.userID}`);
    user.value = response;
    console.log(response);
  } catch (error) {
    console.error('Error al cargar el perfil:', error);
  }
};

// Guardar cambios del perfil
const saveProfile = async () => {
  try {
    await putData('/usuario', editData.value);
    user.value = { ...user.value, ...editData.value };
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
  formData.append('userId', user.value._id);

  try {
    const data = await postData('/usuario/upload-profile-pic', formData);

    if (data.success) {
      editData.value.profilePic = data.imageUrl;
      user.value.profilePic = data.imageUrl;
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
/* Paleta de colores café profesional */
.text-coffee-dark { color: #3E2723; }
.bg-coffee-dark { background: #3E2723; }
.text-coffee-medium { color: #5D4037; }
.bg-coffee-medium { background: #5D4037; }
.text-coffee-light { color: #8D6E63; }
.bg-coffee-light { background: #8D6E63; }
.text-coffee-cream { color: #D7CCC8; }
.bg-coffee-cream { background: #D7CCC8; }
.text-coffee-gold { color: #BCAAA4; }
.bg-coffee-gold { background: #BCAAA4; }
.bg-coffee-page { background: #EFEBE9; }

.profile-card {
  max-width: 500px;
  width: 100%;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(62, 39, 35, 0.1);
  overflow: hidden;
  background: white;
}

.profile-header {
  padding: 30px 20px;
  background: linear-gradient(to bottom, #EFEBE9 0%, white 100%);
}

.avatar-container {
  position: relative;
  display: inline-block;
}

.profile-avatar {
  border: 5px solid white;
  box-shadow: 0 4px 12px rgba(62, 39, 35, 0.15);
  transition: all 0.3s ease;
}

.profile-avatar:hover {
  transform: scale(1.03);
}

.camera-icon {
  position: absolute;
  bottom: 10px;
  right: 10px;
  background: #5D4037;
  color: white;
  border-radius: 50%;
  padding: 6px;
  cursor: pointer;
  opacity: 0.9;
  transition: all 0.3s ease;
}

.camera-icon:hover {
  opacity: 1;
  transform: scale(1.1);
}

.badges-container {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.actions-section {
  padding: 20px;
}

.action-btn {
  padding: 12px;
  font-weight: 500;
  letter-spacing: 0.5px;
  border-radius: 10px;
  transition: all 0.3s ease;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(62, 39, 35, 0.1);
}

.edit-modal {
  border-radius: 12px;
  overflow: hidden;
  width: 100%;
  max-width: 450px;
}

.modal-header {
  background: #EFEBE9;
  border-bottom: 1px solid #D7CCC8;
}

.modal-body {
  padding: 20px;
}

.modal-footer {
  padding: 15px 20px;
  background: #F5F5F5;
  border-top: 1px solid #D7CCC8;
}

.custom-input {
  font-size: 16px;
}

.custom-input :deep(.q-field__control) {
  height: 50px;
  border-radius: 8px;
  background: #F5F5F5;
}

.custom-input :deep(.q-field__label) {
  color: #8D6E63;
  font-weight: 500;
}

.cancel-btn, .save-btn {
  padding: 8px 20px;
  border-radius: 8px;
  font-weight: 500;
}

.cancel-btn:hover {
  background: rgba(141, 110, 99, 0.1);
}

.save-btn {
  background: #5D4037;
  color: white;
}

.save-btn:hover {
  background: #4E342E;
}

.hidden {
  display: none;
}
</style>
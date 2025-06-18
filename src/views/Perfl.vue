<template>
  <q-page class="flex flex-center bg-coffee-page">
    <div class="profile-container">
      <!-- Tarjeta de perfil -->
      <q-card class="profile-card" flat bordered>
        <!-- Sección superior con avatar -->
        <q-card-section class="profile-header text-center">
          <div class="avatar-container">
            <q-avatar size="140px" class="profile-avatar">
              <img :src="user.profilePic || 'https://cdn.quasar.dev/img/boy-avatar.png'" alt="User Avatar" />
              <q-icon name="photo_camera" class="camera-icon" size="sm" @click="triggerFileInput" />
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
          <q-btn label="Editar perfil" color="coffee-medium" icon="edit" class="full-width q-mb-sm action-btn"
            @click="isEditing = true" />
          <q-btn label="Historial de compras" color="coffee-dark" icon="shopping_bag"
            class="full-width q-mb-sm action-btn" @click="togglePurchaseHistory" />
          <q-btn label="Cambiar imagen de perfil" color="coffee-gold" flat icon="image" class="full-width action-btn"
            @click="triggerFileInput" />
          <input type="file" ref="fileInput" accept="image/*" class="hidden" @change="handleFileUpload" />
        </q-card-section>
      </q-card>

      <!-- Sección de historial de compras -->
      <q-card class="purchase-history-card" flat bordered v-if="showPurchaseHistory">
        <q-card-section class="history-header">
          <div class="text-h6 text-coffee-dark">Historial de Compras</div>
          <q-btn icon="close" flat round dense color="coffee-medium" @click="togglePurchaseHistory = false"
            class="close-btn" />
        </q-card-section>

        <q-card-section v-if="loadingPurchases">
          <q-spinner color="coffee-dark" size="3em" />
          <div class="text-coffee-medium q-mt-sm">Cargando historial...</div>
        </q-card-section>

        <q-card-section v-else-if="purchases.length === 0" class="text-center">
          <q-icon name="shopping_bag" color="coffee-light" size="xl" />
          <div class="text-h6 text-coffee-medium q-mt-md">No hay compras registradas</div>
          <div class="text-subtitle1 text-coffee-light">Tus compras aparecerán aquí</div>
        </q-card-section>

        <q-card-section v-else class="purchase-list">
          <div v-for="(purchase, index) in purchases" :key="index" class="purchase-item">
            <div class="purchase-header">
              <div class="text-subtitle1 text-coffee-dark">
                Orden #{{ purchase.orderId }}
              </div>
              <div class="text-caption text-coffee-light">
                {{ formatDate(purchase.date) }}
              </div>
            </div>

            <q-separator color="coffee-cream" class="q-my-sm" />

            <div class="purchase-details">
              <div v-for="item in purchase.items" :key="item.id" class="item-row">
                <div class="item-info">
                  <q-avatar size="40px" class="item-image">
                    <img :src="item.image || 'https://cdn.quasar.dev/img/placeholder.png'" />
                  </q-avatar>
                  <div class="item-name">{{ item.name }}</div>
                </div>
                <div class="item-price">{{ formatCurrency(item.price) }} x {{ item.quantity }}</div>
              </div>
            </div>

            <q-separator color="coffee-cream" class="q-my-sm" />

            <div class="purchase-summary">
              <div class="summary-row">
                <span>Subtotal:</span>
                <span>{{ formatCurrency(purchase.subtotal) }}</span>
              </div>
              <div class="summary-row">
                <span>Envío:</span>
                <span>{{ formatCurrency(purchase.shipping) }}</span>
              </div>
              <div class="summary-row total">
                <span>Total:</span>
                <span>{{ formatCurrency(purchase.total) }}</span>
              </div>
            </div>

            <div class="purchase-status" :class="getStatusClass(purchase.status)">
              {{ purchase.status }}
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Modal de edición -->
    <q-dialog v-model="isEditing">
      <q-card class="edit-modal">
        <q-card-section class="modal-header">
          <div class="text-h6 text-coffee-dark">Editar Perfil</div>
        </q-card-section>

        <q-card-section class="q-gutter-md modal-body">
          <q-input v-model="editData.name" label="Nombre" color="coffee-dark"
            standout="bg-coffee-light text-coffee-dark" class="custom-input" />
          <q-input v-model="editData.email" label="Email" color="coffee-dark"
            standout="bg-coffee-light text-coffee-dark" class="custom-input" readonly />
        </q-card-section>

        <q-card-actions align="right" class="modal-footer">
          <q-btn flat label="Cancelar" color="coffee-medium" @click="isEditing = false" class="cancel-btn" />
          <q-btn flat label="Guardar" color="coffee-dark" @click="saveProfile" class="save-btn" />
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
const showPurchaseHistory = ref(false);
const loadingPurchases = ref(false);
const purchases = ref([]);

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

// Obtener historial de compras
const loadPurchaseHistory = async () => {
  loadingPurchases.value = true;
  try {
    const response = await getData(`/ordenes/usuario/${store.userID}`);
        console.log('Respuesta del backend:', response); // <-- Aquí
    purchases.value = response.map(orden => ({
      orderId: orden.orderId,
      date: orden.createdAt,
      items: orden.productos.map(prod => ({
        id: prod.productId._id, // Esto es correcto si el populate funciona
        name: prod.productId?.nombre || 'Producto', // Esto es correcto
        price: prod.precio, // Este es el precio por cantidad del producto en la orden
        quantity: prod.cantidad,
        image: prod.productId?.imagen || '', // Esto es correcto
      })),
      subtotal: orden.amount,
      shipping: 0, // Asegúrate de ajustar esto si tu backend empieza a devolver un costo de envío
      total: orden.total,
      status: orden.estado === 1 ? 'Pendiente' : orden.estado === 2 ? 'Pagado' : 'Cancelado'
    }));
  } catch (error) {
    console.error('Error al cargar el historial:', error);
  } finally {
    loadingPurchases.value = false;
  }
};

const togglePurchaseHistory = () => {
  showPurchaseHistory.value = !showPurchaseHistory.value;
  if (showPurchaseHistory.value && purchases.value.length === 0) {
    loadPurchaseHistory();
  }
};

// Formatear fecha
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Formatear moneda
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
};

// Clase CSS según estado
const getStatusClass = (status) => {
  const statusMap = {
    'Completado': 'completed',
    'En camino': 'shipping',
    'Cancelado': 'cancelled',
    'Procesando': 'processing'
  };
  return statusMap[status] || '';
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
  purchases.value = mockPurchases; // Cargar datos de ejemplo
});
</script>

<style scoped>
/* Paleta de colores café profesional */
.text-coffee-dark {
  color: #3E2723;
}

.bg-coffee-dark {
  background: #3E2723;
}

.text-coffee-medium {
  color: #5D4037;
}

.bg-coffee-medium {
  background: #5D4037;
}

.text-coffee-light {
  color: #8D6E63;
}

.bg-coffee-light {
  background: #8D6E63;
}

.text-coffee-cream {
  color: #D7CCC8;
}

.bg-coffee-cream {
  background: #D7CCC8;
}

.text-coffee-gold {
  color: #BCAAA4;
}

.bg-coffee-gold {
  background: #BCAAA4;
}

.bg-coffee-page {
  background: #EFEBE9;
}

.profile-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 900px;
  width: 100%;
  padding: 20px;
}

.profile-card {
  width: 100%;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(62, 39, 35, 0.1);
  overflow: hidden;
  background: white;
}

.purchase-history-card {
  width: 100%;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(62, 39, 35, 0.1);
  background: white;
}

.profile-header {
  padding: 30px 20px;
  background: linear-gradient(to bottom, #EFEBE9 0%, white 100%);
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #D7CCC8;
}

.close-btn {
  transition: all 0.3s ease;
}

.close-btn:hover {
  transform: rotate(90deg);
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

.purchase-list {
  padding: 0;
}

.purchase-item {
  padding: 20px;
  border-bottom: 1px solid #EFEBE9;
  transition: all 0.3s ease;
}

.purchase-item:hover {
  background-color: #FAFAFA;
}

.purchase-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.purchase-details {
  margin: 10px 0;
}

.item-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.item-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.item-image {
  border-radius: 8px;
  border: 1px solid #D7CCC8;
}

.item-name {
  font-weight: 500;
}

.item-price {
  font-weight: 500;
  color: #5D4037;
}

.purchase-summary {
  margin-top: 10px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin: 4px 0;
}

.summary-row.total {
  font-weight: bold;
  font-size: 1.1em;
  margin-top: 8px;
  color: #3E2723;
}

.purchase-status {
  margin-top: 12px;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 0.8em;
  font-weight: 500;
  display: inline-block;
}

.purchase-status.completed {
  background-color: #E8F5E9;
  color: #2E7D32;
}

.purchase-status.shipping {
  background-color: #E3F2FD;
  color: #1565C0;
}

.purchase-status.cancelled {
  background-color: #FFEBEE;
  color: #C62828;
}

.purchase-status.processing {
  background-color: #FFF8E1;
  color: #F9A825;
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

.cancel-btn,
.save-btn {
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

/* Responsive */
@media (max-width: 768px) {
  .profile-container {
    flex-direction: column;
  }

  .profile-card,
  .purchase-history-card {
    max-width: 100%;
  }
}
</style>
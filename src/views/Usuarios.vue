<template>
  <q-page class="flex flex-center q-pa-md bg-cafe">
    <div class="row q-gutter-xl justify-center">
      <q-card
        v-for="user in categories"
        :key="user._id"
        class="user-card shadow-2"
        flat
        bordered
      >
        <q-card-section class="bg-cafe-dark text-white text-center">
          <div class="text-h6">{{ user.name }}</div>
          <div class="text-subtitle2">{{ user.role }}</div>
        </q-card-section>

        <q-card-section class="q-pa-md">
          <div class="q-mb-sm">
            <div class="text-caption text-bold">Email</div>
            <div class="text-body2">{{ user.email }}</div>
          </div>

          <div class="q-mb-sm">
            <div class="text-caption text-bold">Estado</div>
            <div class="text-body2">{{ user.estado }}</div>
          </div>

          <div>
            <div class="text-caption text-bold">Creado</div>
            <div class="text-body2">{{ formatDate(user.createdAt) }}</div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right" class="q-pa-sm">
          <q-btn flat label="Editar" color="brown-7" @click="editarUsuario(user)" />
          <q-btn flat label="Eliminar" color="red-6" @click="eliminarUsuario(user._id)" />
        </q-card-actions>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { date, useQuasar } from 'quasar'
import { postData, getData, putData } from '../Services/jook.js';

const $q = useQuasar()
const categories = ref([])
const loading = ref(true)

const fetchCategories = async () => {
  try {
    categories.value = await getData('/usuario')
  } catch (err) {
    $q.notify({ type: 'negative', message: 'Error al cargar categorías' })
  } finally {
    loading.value = false
  }
}

function formatDate(dateStr) {
  return date.formatDate(dateStr, 'YYYY-MM-DD HH:mm')
}

function editarUsuario(user) {
  console.log('Editar usuario:', user)
}

function eliminarUsuario(userId) {
  console.log('Eliminar usuario:', userId)
}

onMounted(() => {
  fetchCategories()
})
</script>

<style scoped>
.bg-cafe {
  background-color: #f5efe6; /* Café claro */
}

.bg-cafe-dark {
  background-color: #a1887f; /* Café oscuro */
}

.user-card {
  width: 280px;
  border-radius: 12px;
}
</style>

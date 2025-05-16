<template>
  <div class="q-pa-md">
    <q-table title="Categorías" :rows="categories" :columns="columns" row-key="name" flat bordered>

      <!-- Botones de acción -->
      <template v-slot:body-cell-acciones="props">
        <q-td align="center">
          <div class="row no-wrap justify-center q-gutter-xs">
            <q-btn icon="edit" color="primary" dense size="sm" flat @click="openEditDialog(props.row)"
              class="q-px-xs" />
            <q-btn :icon="props.row.estado === 'activo' ? 'cancel' : 'check'"
              :color="props.row.estado === 'activo' ? 'negative' : 'positive'" dense size="sm" flat
              @click="cambiarEstado(props.row)" class="q-px-xs" />
          </div>
        </q-td>
      </template>
    </q-table>

    <!-- Botón flotante -->
    <q-btn fab icon="add" color="primary" class="q-fab-bottom-right q-ma-md" @click="openAddDialog" />

    <!-- Diálogo para agregar/editar -->
    <q-dialog v-model="dialog">
      <q-card style="min-width: 500px; max-width: 90vw" >
        <q-card-section>
          <div class="text-h6">{{ isEditing ? 'Editar' : 'Agregar' }} Categoría</div>
        </q-card-section>

        <q-card-section>
          <q-input v-model="form.name" label="Nombre" dense />
          <q-input v-model="form.description" label="Descripción" type="textarea" dense />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="negative" v-close-popup />
          <q-btn flat label="Guardar" color="primary" @click="saveCategory" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { postData, getData, putData } from '../Services/jook.js';


const $q = useQuasar()
const categories = ref([])
const dialog = ref(false)
const isEditing = ref(false)
const currentId = ref(null)

const form = ref({
  name: '',
  description: '',
  estado: 'activo'
})

const columns = [
  { name: 'name', label: 'Nombre', field: 'name', sortable: true, align: 'center' },
  { name: 'description', label: 'Descripción', field: 'description', align: 'center' },
  { name: 'createdAt', label: 'Fecha de creación', field: row => new Date(row.createdAt).toLocaleDateString(), sortable: true, align: 'center' },
  { name: 'acciones', label: 'Acciones', field: 'acciones', sortable: false, align: 'center' }
]

const fetchCategories = async () => {
  try {
    categories.value = await getData('/categoria')
  } catch (err) {
    $q.notify({ type: 'negative', message: 'Error al cargar categorías' })
  }
}

const openAddDialog = () => {
  isEditing.value = false
  currentId.value = null
  form.value = { name: '', description: '', estado: 'activo' }
  dialog.value = true
}

const openEditDialog = (row) => {
  isEditing.value = true
  currentId.value = row._id
  form.value = { name: row.name, description: row.description, estado: row.estado }
  dialog.value = true
}

const saveCategory = async () => {
  try {
    if (isEditing.value && currentId.value) {
      await putData(`/categoria/${currentId.value}`, form.value)
      $q.notify({ type: 'positive', message: 'Categoría actualizada' })
    } else {
      await postData('/categoria', form.value)
      $q.notify({ type: 'positive', message: 'Categoría agregada' })
    }
    dialog.value = false
    fetchCategories()
  } catch (err) {
    $q.notify({ type: 'negative', message: 'Error al guardar categoría' })
  }
}

const cambiarEstado = async (row) => {
  try {
    const nuevoEstado = row.estado === 'activo' ? 'inactivo' : 'activo'
    await putData(`/categoria/${row._id}`, { ...row, estado: nuevoEstado })
    $q.notify({ type: 'positive', message: `Estado cambiado a ${nuevoEstado}` })
    fetchCategories()
  } catch (err) {
    $q.notify({ type: 'negative', message: 'Error al cambiar estado' })
  }
}

onMounted(fetchCategories)
</script>

<style scoped>
.q-fab-bottom-right {
  position: fixed;
  right: 16px;
  bottom: 16px;
}
</style>
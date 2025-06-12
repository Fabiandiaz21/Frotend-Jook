<template>
  <div class="q-pa-md bg-white">
    <q-table title="Categorías" :rows="categories" :columns="columns" row-key="name" flat bordered
      class="my-category-table shadow-3 rounded-borders">
      <template v-slot:body-cell-acciones="props">
        <q-td align="center">
          <div class="row no-wrap justify-center q-gutter-xs">
            <q-btn icon="edit" color="brown-7" dense size="sm" flat @click="openEditDialog(props.row)"
              class="q-px-xs table-btn">
              <q-tooltip>Editar Categoría</q-tooltip>
            </q-btn>
            <q-btn :icon="props.row.estado === 'activo' ? 'cancel' : 'check'"
              :color="props.row.estado === 'activo' ? 'red-6' : 'green-6'" dense size="sm" flat
              @click="cambiarEstado(props.row)" class="q-px-xs table-btn">
              <q-tooltip>{{ props.row.estado === 'activo' ? 'Desactivar' : 'Activar' }}</q-tooltip>
            </q-btn>
          </div>
        </q-td>
      </template>

      <template v-slot:no-data="{ icon, message, filter }">
        <div class="full-width row flex-center text-brown-7 q-gutter-sm">
          <q-icon size="2em" :name="icon" />
          <span>
            {{ message }}
          </span>
          <q-icon size="2em" :name="filter ? 'filter_list' : 'search'" />
        </div>
      </template>
    </q-table>

    <q-btn fab icon="add" color="brown-7" class="q-fab-bottom-right q-ma-md" @click="openAddDialog">
      <q-tooltip>Agregar Nueva Categoría</q-tooltip>
    </q-btn>

    <q-dialog v-model="dialog" class="custom-dialog">
      <q-card style="min-width: 500px; max-width: 90vw">
        <q-card-section class="bg-brown-2 text-brown-9 dialog-header">
          <div class="text-h6">{{ isEditing ? 'Editar' : 'Agregar' }} Categoría</div>
        </q-card-section>

        <q-card-section class="q-pa-md">
          <q-input v-model="form.name" label="Nombre" dense outlined class="q-mb-md custom-input" />
          <q-input v-model="form.description" label="Descripción" type="textarea" dense outlined class="custom-input"
            rows="3" />
        </q-card-section>

        <q-card-actions align="right" class="dialog-actions-bg">
          <q-btn flat label="Cancelar" color="red-6" v-close-popup class="action-btn" />
          <q-btn flat label="Guardar" color="brown-7" @click="saveCategory" class="action-btn" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
// Tu script existente, sin cambios, para mantener la lógica intacta.
// Asegúrate de que este bloque <script setup> esté presente en tu archivo original.
import { ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { postData, getData, putData } from '../Services/jook.js';

const $q = useQuasar();
const categories = ref([]);
const dialog = ref(false);
const isEditing = ref(false);
const currentId = ref(null);

const form = ref({
  name: '',
  description: '',
  estado: 'activo',
});

const columns = [
  { name: 'name', label: 'Nombre', field: 'name', sortable: true, align: 'left', classes: 'text-brown-9 text-bold', headerClasses: 'bg-brown-2 text-brown-9' },
  { name: 'description', label: 'Descripción', field: 'description', align: 'left', classes: 'text-brown-8', headerClasses: 'bg-brown-2 text-brown-9' },
  { name: 'createdAt', label: 'Fecha de creación', field: row => new Date(row.createdAt).toLocaleDateString(), sortable: true, align: 'center', classes: 'text-brown-8', headerClasses: 'bg-brown-2 text-brown-9' },
  { name: 'acciones', label: 'Acciones', field: 'acciones', sortable: false, align: 'center', headerClasses: 'bg-brown-2 text-brown-9' },
];

const fetchCategories = async () => {
  try {
    categories.value = await getData('/categoria');
  } catch (err) {
    $q.notify({ type: 'negative', message: 'Error al cargar categorías' });
  }
};

const openAddDialog = () => {
  isEditing.value = false;
  currentId.value = null;
  form.value = { name: '', description: '', estado: 'activo' };
  dialog.value = true;
};

const openEditDialog = (row) => {
  isEditing.value = true;
  currentId.value = row._id;
  form.value = { name: row.name, description: row.description, estado: row.estado };
  dialog.value = true;
};

const saveCategory = async () => {
  try {
    if (isEditing.value && currentId.value) {
      await putData(`/categoria/${currentId.value}`, form.value);
      $q.notify({ type: 'positive', message: 'Categoría actualizada', color: 'green-6', icon: 'check_circle' });
    } else {
      await postData('/categoria', form.value);
      $q.notify({ type: 'positive', message: 'Categoría agregada', color: 'green-6', icon: 'check_circle' });
    }
    dialog.value = false;
    fetchCategories();
  } catch (err) {
    $q.notify({ type: 'negative', message: 'Error al guardar categoría', color: 'red-6', icon: 'error' });
  }
};

const cambiarEstado = async (row) => {
  const nuevoEstado = row.estado === 'activo' ? 'inactivo' : 'activo';
  try {
    // Aquí puedes preguntar al usuario si está seguro
    $q.dialog({
      title: `Confirmar ${nuevoEstado === 'activo' ? 'Activación' : 'Desactivación'}`,
      message: `¿Estás seguro de que quieres ${nuevoEstado === 'activo' ? 'activar' : 'desactivar'} la categoría "${row.name}"?`,
      cancel: true,
      persistent: true,
      color: nuevoEstado === 'activo' ? 'green-6' : 'red-6',
    }).onOk(async () => {
      await putData(`/categoria/${row._id}`, { ...row, estado: nuevoEstado });
      $q.notify({ type: 'positive', message: `Estado cambiado a ${nuevoEstado}`, color: 'green-6', icon: 'check_circle' });
      fetchCategories();
    }).onCancel(() => {
      $q.notify({ type: 'info', message: 'Operación cancelada.', color: 'blue-6', icon: 'cancel' });
    });
  } catch (err) {
    $q.notify({ type: 'negative', message: 'Error al cambiar estado', color: 'red-6', icon: 'error' });
  }
};

onMounted(fetchCategories);
</script>

---

<style scoped>
/* Fondo blanco para la página */
.bg-white {
  background-color: #ffffff;
}

/* Estilos generales para la tabla de categorías */
.my-category-table {
  background-color: #fcf8f5;
  /* Un tono crema muy claro */
  border-radius: 8px;
  /* Bordes ligeramente redondeados para la tabla */
  width: 100%;
  /* Asegura que ocupe todo el ancho disponible */
}

/* Color para el encabezado de la tabla */
.my-category-table thead tr:first-child {
  background-color: #a1887f;
  /* Café oscuro de tus tarjetas */
  color: white;
}

/* Filas impares con un color diferente para mejorar la legibilidad */
.my-category-table tbody tr:nth-child(odd) {
  background-color: #f7f2ed;
  /* Un café aún más claro para filas alternas */
}

/* Efecto hover en las filas */
.my-category-table tbody tr:hover {
  background-color: #e6dcd4;
  /* Un café claro distintivo al pasar el mouse */
  cursor: pointer;
  /* Indicar que la fila es interactiva */
}

/* Estilos de texto para las celdas */
.text-brown-9 {
  color: #3e2723;
  /* Café muy oscuro para nombres y encabezados */
}

.text-brown-8 {
  color: #5d4037;
  /* Un café un poco más claro para otros textos */
}

/* Clases para los encabezados de las columnas */
.bg-brown-2 {
  background-color: #d7ccc8 !important;
  /* Un tono café claro para los encabezados */
  color: #3e2723 !important;
  /* Texto oscuro para contrastar */
}

/* Estilo para los botones dentro de la tabla */
.table-btn {
  transition: background-color 0.3s ease;
}

.table-btn:hover {
  background-color: rgba(0, 0, 0, 0.08);
  /* Un ligero sombreado al pasar el mouse */
}

/* Botón flotante */
.q-fab-bottom-right {
  position: fixed;
  right: 16px;
  bottom: 16px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  /* Sombra para destacarlo */
  transition: transform 0.2s ease;
}

.q-fab-bottom-right:hover {
  transform: translateY(-3px);
  /* Pequeña elevación al pasar el mouse */
}

/* Estilos para el diálogo (modal) */
.custom-dialog .q-card {
  border-radius: 12px;
  /* Bordes redondeados para el diálogo */
  overflow: hidden;
  /* Asegura que los bordes redondeados se vean bien */
}

.dialog-header {
  padding: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  color: #3e2723;
  /* Asegura que el título sea un café oscuro */
}

.dialog-actions-bg {
  background-color: #f7f2ed;
  /* Fondo ligeramente crema para las acciones del diálogo */
  padding: 12px 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

/* Estilos para los q-input dentro del diálogo */
.custom-input.q-field--outlined .q-field__control {
  border-color: #a1887f !important;
  /* Borde de un café más oscuro */
  background-color: #fffaf7;
  /* Fondo ligeramente crema dentro del input */
}

.custom-input.q-field--outlined .q-field__label {
  color: #5d4037;
  /* Color café para el label */
}

.custom-input.q-field--outlined .q-field__native,
.custom-input.q-field--outlined .q-field__input {
  color: #3e2723;
  /* Color café oscuro para el texto de entrada */
}

/* Ajustes para el textarea */
.q-textarea.custom-input .q-field__control {
  min-height: 80px;
  /* Altura mínima para el textarea */
}
</style>
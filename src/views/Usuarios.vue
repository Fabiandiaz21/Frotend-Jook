<template>
  <q-page class="q-pa-md bg-white">
    <q-table title="Usuarios" :rows="categories" :columns="columns" row-key="_id" :loading="loading"
      :pagination="initialPagination" class="my-sticky-header-table" flat bordered>
      <template v-slot:body-cell-estado="props">
        <q-td :props="props">
          <q-badge :color="props.row.estado === 'Activo' ? 'green' : 'red'" text-color="white" class="q-pa-xs">
            {{ props.row.estado }}
          </q-badge>
        </q-td>
      </template>

      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn flat icon="edit" color="brown-7" @click="editarUsuario(props.row)" size="sm" class="q-mr-sm">
            <q-tooltip>Editar</q-tooltip>
          </q-btn>
          <q-btn flat icon="delete" color="red-6" @click="eliminarUsuario(props.row._id)" size="sm">
            <q-tooltip>Eliminar</q-tooltip>
          </q-btn>
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
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { date, useQuasar } from 'quasar';
import { getData } from '../Services/jook.js'; // Asumiendo que postData y putData no son necesarios para la tabla de visualización.

const $q = useQuasar();
const categories = ref([]);
const loading = ref(true);

// Definición de las columnas de la tabla
const columns = [
  {
    name: 'name',
    required: true,
    label: 'Nombre',
    align: 'left',
    field: 'name',
    sortable: true,
    classes: 'text-brown-9', // Clase para el texto del nombre
    headerClasses: 'bg-brown-2 text-brown-9', // Clase para el encabezado
  },
  {
    name: 'email',
    label: 'Email',
    align: 'left',
    field: 'email',
    sortable: true,
    classes: 'text-brown-8',
    headerClasses: 'bg-brown-2 text-brown-9',
  },
  {
    name: 'role',
    label: 'Rol',
    align: 'left',
    field: 'role',
    sortable: true,
    classes: 'text-brown-8',
    headerClasses: 'bg-brown-2 text-brown-9',
  },
  {
    name: 'estado',
    label: 'Estado',
    align: 'center',
    field: 'estado',
    sortable: true,
    headerClasses: 'bg-brown-2 text-brown-9',
  },
  {
    name: 'createdAt',
    label: 'Creado',
    align: 'center',
    field: 'createdAt',
    format: (val) => formatDate(val),
    sortable: true,
    classes: 'text-brown-8',
    headerClasses: 'bg-brown-2 text-brown-9',
  },
  {
    name: 'actions',
    label: 'Acciones',
    align: 'center',
    field: 'actions',
    headerClasses: 'bg-brown-2 text-brown-9',
  },
];

// Configuración inicial de paginación
const initialPagination = {
  sortBy: 'createdAt',
  descending: true,
  page: 1,
  rowsPerPage: 10,
};

const fetchCategories = async () => {
  try {
    categories.value = await getData('/usuario');
  } catch (err) {
    $q.notify({
      type: 'negative',
      message: 'Error al cargar usuarios. Intenta de nuevo más tarde.',
      color: 'red-6',
      icon: 'error',
    });
  } finally {
    loading.value = false;
  }
};

function formatDate(dateStr) {
  return date.formatDate(dateStr, 'YYYY-MM-DD HH:mm');
}

function editarUsuario(user) {
  $q.notify({
    type: 'info',
    message: `Editando usuario: ${user.name}`,
    color: 'brown-7',
    icon: 'edit',
  });
  console.log('Editar usuario:', user);
  // Aquí podrías abrir un diálogo o navegar a una página de edición
}

function eliminarUsuario(userId) {
  $q.dialog({
    title: 'Confirmar Eliminación',
    message: '¿Estás seguro de que quieres eliminar este usuario?',
    cancel: true,
    persistent: true,
    color: 'red-6',
  })
    .onOk(() => {
      // Lógica para eliminar el usuario
      $q.notify({
        type: 'positive',
        message: 'Usuario eliminado exitosamente.',
        color: 'green-6',
        icon: 'check_circle',
      });
      console.log('Eliminar usuario:', userId);
      // Actualizar la lista de categorías después de eliminar
      // fetchCategories(); // Descomentar si la eliminación se maneja en el frontend directamente
    })
    .onCancel(() => {
      $q.notify({
        type: 'info',
        message: 'Eliminación cancelada.',
        color: 'blue-6',
        icon: 'cancel',
      });
    });
}

onMounted(() => {
  fetchCategories();
});
</script>

<style scoped>
/* Fondo blanco para la página */
.bg-white {
  background-color: #ffffff;
}

/* Estilos para la tabla, adaptados de tus colores "café" */
.my-sticky-header-table {
  /* Fondo general de la tabla, ajustado para combinar con el blanco */
  background-color: #fcf8f5;
  /* Un tono crema muy claro */
  border-radius: 8px;
  /* Bordes ligeramente redondeados para la tabla */
}

/* Color para el encabezado de la tabla */
.my-sticky-header-table thead tr:first-child {
  background-color: #a1887f;
  /* Café oscuro de tus tarjetas */
  color: white;
}

/* Filas impares con un color diferente para mejorar la legibilidad (interactividad visual) */
.my-sticky-header-table tbody tr:nth-child(odd) {
  background-color: #f7f2ed;
  /* Un café aún más claro para filas alternas */
}

/* Efecto hover en las filas */
.my-sticky-header-table tbody tr:hover {
  background-color: #e6dcd4;
  /* Un café claro distintivo al pasar el mouse */
  cursor: pointer;
  /* Indicar que la fila es interactiva */
}

/* Estilos de texto para las celdas */
.text-brown-9 {
  color: #3e2723;
  /* Café muy oscuro para los nombres y encabezados */
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
</style>
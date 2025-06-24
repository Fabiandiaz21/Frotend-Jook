<template>
  <q-page class="q-pa-md bg-white">
    <div class="q-mb-md row items-center q-gutter-md">
      <q-input
        outlined
        dense
        v-model="searchQuery"
        placeholder="Buscar por nombre o email"
        class="col-grow"
        clearable
        @clear="clearSearch"
        @keyup.enter="performSearch"
      >
        <template v-slot:append>
          <q-icon v-if="searchQuery === ''" name="search" />
          <q-icon v-else name="clear" class="cursor-pointer" @click="clearSearch" />
        </template>
      </q-input>
      <q-btn
        label="Buscar"
        color="brown-7"
        @click="performSearch"
        icon="search"
      />
      <q-btn
        label="Mostrar Todos"
        color="grey-7"
        @click="resetSearch"
        icon="refresh"
        v-if="searchActive"
      />
    </div>

    <q-table
      title="Usuarios"
      :rows="users" :columns="columns"
      row-key="_id"
      :loading="loading"
      :pagination="initialPagination"
      class="my-sticky-header-table"
      flat
      bordered
    >
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
import { getData } from '../Services/jook.js';

const $q = useQuasar();
const users = ref([]); // Cambiado de categories a users
const loading = ref(true);
const searchQuery = ref(''); // Nuevo ref para el término de búsqueda
const searchActive = ref(false); // Para controlar si la búsqueda está activa

// Definición de las columnas de la tabla (sin cambios significativos)
const columns = [
  {
    name: 'name',
    required: true,
    label: 'Nombre',
    align: 'left',
    field: 'name',
    sortable: true,
    classes: 'text-brown-9',
    headerClasses: 'bg-brown-2 text-brown-9',
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

// Función para obtener usuarios (modificada para soportar búsqueda)
const fetchUsers = async (query = '') => {
  loading.value = true;
  try {
    let url = '/usuario';
    if (query) {
      url = `/usuario/usuarios/search?query=${encodeURIComponent(query)}`;
      searchActive.value = true;
    } else {
      searchActive.value = false;
    }
    const response = await getData(url);
    users.value = response; // Asignar a users.value
  } catch (err) {
    console.error("Error fetching users:", err);
    let errorMessage = 'Error al cargar usuarios. Intenta de nuevo más tarde.';
    if (err.response && err.response.status === 404) {
      errorMessage = 'No se encontraron usuarios que coincidan con la búsqueda.';
    }
    $q.notify({
      type: 'negative',
      message: errorMessage,
      color: 'red-6',
      icon: 'error',
    });
    users.value = []; // Vaciar la tabla si hay un error o no hay resultados
  } finally {
    loading.value = false;
  }
};

// Función para ejecutar la búsqueda
const performSearch = () => {
  fetchUsers(searchQuery.value);
};

// Función para limpiar la búsqueda
const clearSearch = () => {
  searchQuery.value = '';
  // No llamamos a fetchUsers aquí para evitar doble llamada si el usuario solo borra sin presionar Enter/Buscar
};

// Función para restablecer la búsqueda y mostrar todos los usuarios
const resetSearch = () => {
  searchQuery.value = '';
  fetchUsers(); // Llama sin query para obtener todos los usuarios
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
      // Actualizar la lista de usuarios después de eliminar
      // fetchUsers(); // Descomentar si la eliminación se maneja en el frontend directamente
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
  fetchUsers(); // Carga inicial de todos los usuarios
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
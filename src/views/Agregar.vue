<template>
  <div class="q-pa-md">
    <q-card flat bordered class="q-mb-md q-pa-sm">
      <q-card-section>
        <div class="row q-col-gutter-md items-center">
          <div class="col-12 col-md-auto">
            <q-btn color="primary" icon="add" label="Agregar Producto" @click="dialog = true" />
          </div>
          <div class="col-12 col-md-auto">
            <q-btn color="secondary" icon="sell" label="Nueva Marca" @click="openAddMarcaDialog" />
          </div>
          <div class="col-12 col-md-auto">
            <q-btn color="accent" icon="category" label="Nuevo Tipo" @click="openAddTipoDialog" />
          </div>

          <div class="col-12 col-md-4 q-ml-auto">
            <q-input outlined dense v-model="searchQuery" label="Buscar producto" clearable>
              <template v-slot:append>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>
          <div class="col-12 col-md-4">
            <q-select outlined dense v-model="filterMarca" :options="uniqueMarcasOptions" label="Filtrar por Marca"
              clearable use-input input-debounce="0" @filter="filterFnMarca" emit-value map-options>
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey">
                    No hay resultados
                  </q-item-section>
                </q-item>
              </template>
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section avatar v-if="scope.opt.imagen">
                    <q-avatar rounded size="32px">
                      <img :src="scope.opt.imagen">
                    </q-avatar>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ scope.opt.label }}</q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>
          <div class="col-12 col-md-4">
            <q-select outlined dense v-model="filterTipo" :options="availableTipos" label="Filtrar por Tipo" clearable
              use-input input-debounce="0" @filter="filterFnTipo" emit-value map-options>
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey">
                    No hay resultados
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>
          <div class="col-12 col-md-4">
            <q-select outlined dense v-model="filterCategory" :options="categories" label="Filtrar por Categoría"
              clearable emit-value map-options>
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey">
                    No hay categorías
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <q-table title="Lista de Productos" :rows="filteredProductos" :columns="columnas" row-key="_id"
      :loading="loadingTable">
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

      <template v-slot:body-cell-imagen="props">
        <q-td align="center">
          <img :src="props.row.images?.[0]" alt="imagen del producto" width="60" height="60"
            style="object-fit: cover; border-radius: 8px;" />
        </q-td>
      </template>

      <template v-slot:body-cell-marca="props">
        <q-td align="left">
          <div class="row items-center q-gutter-sm">
            <q-avatar v-if="props.row.marca?.imagen" rounded size="32px">
              <img :src="props.row.marca.imagen" />
            </q-avatar>
            <span>{{ props.row.marca?.nombre || 'N/A' }}</span>
          </div>
        </q-td>
      </template>
      <template v-slot:body-cell-tipo="props">
        <q-td align="left">
          <span>{{ props.row.tipo?.nombre || 'N/A' }}</span>
        </q-td>
      </template>
    </q-table>

    <q-dialog v-model="editDialog" :persistent="false">
      <q-card style="min-width: 500px; max-width: 90vw">
        <q-card-section class="row items-center justify-between">
          <div class="text-h6">Editar Producto</div>
        </q-card-section>

        <q-card-section>
          <q-form @submit.prevent="handleEditProduct">
            <q-input v-model="productToEdit.nombre" label="Nombre del Producto" outlined dense required />

            <q-select outlined dense v-model="productToEdit.marca" :options="availableMarcas" label="Marca" clearable
              use-input input-debounce="0" @filter="filterMarcasEdit" @new-value="addMarcaFromSelect"
              new-value-mode="add-unique" emit-value map-options>
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey">
                    No hay marcas. Escribe para añadir una nueva.
                  </q-item-section>
                </q-item>
              </template>
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section avatar v-if="scope.opt.imagen">
                    <q-avatar rounded size="32px">
                      <img :src="scope.opt.imagen">
                    </q-avatar>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ scope.opt.label }}</q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-select>

            <div class="q-mt-sm">
              <label class="text-subtitle2 text-primary q-mb-sm">Cambiar Imagen de Marca (opcional):</label>
              <q-file outlined dense v-model="marcaImageFileEdit" label="Seleccionar imagen de marca" accept="image/*">
                <template v-slot:prepend>
                  <q-icon name="attach_file" />
                </template>
              </q-file>
              <div v-if="marcaImagePreviewEdit" class="q-mt-sm flex flex-center">
                <img :src="marcaImagePreviewEdit" alt="Marca Preview"
                  style="max-width: 150px; max-height: 150px; object-fit: cover; border-radius: 8px;" />
              </div>
            </div>

            <q-select outlined dense v-model="productToEdit.tipo" :options="availableTipos" label="Tipo" clearable
              use-input input-debounce="0" @filter="filterTiposEdit" @new-value="addTipoFromSelect"
              new-value-mode="add-unique" emit-value map-options>
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey">
                    No hay tipos. Escribe para añadir uno nuevo.
                  </q-item-section>
                </q-item>
              </template>
            </q-select>

            <q-input v-model="productToEdit.descripcion" label="Descripción" outlined dense required />
            <q-input v-model="productToEdit.price" label="Precio" type="number" outlined dense required />
            <q-select v-model="productToEdit.categoryId" :options="categories" label="Categoría" outlined dense
              emit-value map-options required />

            <q-input v-model="productToEdit.stock" label="Stock" type="number" outlined dense required />

            <div class="q-mt-md">
              <label class="text-subtitle2 text-primary q-mb-sm">Cambiar imágenes del producto (máx. 4):</label>

              <div class="q-gutter-sm row justify-center q-mt-sm">
                <div v-for="n in 4" :key="'edit-' + n">
                  <q-btn :label="'Imagen ' + n" color="primary" icon="cloud_upload"
                    @click="$refs['editImageInput' + n][0].click()" flat rounded />
                  <input :ref="'editImageInput' + n" type="file" accept="image/*" style="display: none"
                    @change="(e) => handleSingleEditFileChange(e, n - 1)" />
                </div>
              </div>

              <div class="q-gutter-sm q-mt-sm">
                <div class="q-row q-col-gutter-md">
                  <div v-for="(img, i) in editImagePreviews" :key="i" class="q-col-6 q-pa-xs flex flex-center">
                    <div class="relative-position" style="width: 150px; height: 150px;">
                      <img :src="img" class="q-img rounded-borders shadow-2"
                        style="width: 150px; height: 150px; object-fit: cover; border-radius: 8px;" />

                      <q-btn round dense flat size="xs" icon="close" color="negative" class="absolute"
                        style="top: 4px; right: 4px; background-color: white; width: 24px; height: 24px; min-width: 0;"
                        @click="removeEditImage(i)" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <q-btn type="submit" label="Guardar Cambios" color="primary" class="q-mt-md" :loading="loading" unelevated
              block />
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="dialog" :persistent="false">
      <q-card style="min-width: 500px; max-width: 90vw">
        <q-card-section class="row items-center justify-between">
          <div class="text-h6">Agregar Producto</div>
        </q-card-section>

        <q-card-section>
          <q-form @submit.prevent="handleAddProduct">
            <q-input v-model="productName" label="Nombre del Producto" outlined dense required />

            <q-select outlined dense v-model="productMarca" :options="availableMarcas" label="Marca" clearable use-input
              input-debounce="0" @filter="filterMarcasAdd" @new-value="addMarcaFromSelect" new-value-mode="add-unique"
              emit-value map-options>
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey">
                    No hay marcas. Escribe para añadir una nueva.
                  </q-item-section>
                </q-item>
              </template>
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section avatar v-if="scope.opt.imagen">
                    <q-avatar rounded size="32px">
                      <img :src="scope.opt.imagen">
                    </q-avatar>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ scope.opt.label }}</q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-select>

            <div class="q-mt-sm">
              <label class="text-subtitle2 text-primary q-mb-sm">Seleccionar Imagen de Marca (opcional):</label>
              <q-file outlined dense v-model="marcaImageFileAdd" label="Imagen de la Marca" accept="image/*">
                <template v-slot:prepend>
                  <q-icon name="attach_file" />
                </template>
              </q-file>
              <div v-if="marcaImagePreviewAdd" class="q-mt-sm flex flex-center">
                <img :src="marcaImagePreviewAdd" alt="Marca Preview"
                  style="max-width: 150px; max-height: 150px; object-fit: cover; border-radius: 8px;" />
              </div>
            </div>

            <q-select outlined dense v-model="productTipo" :options="availableTipos" label="Tipo" clearable use-input
              input-debounce="0" @filter="filterTiposAdd" @new-value="addTipoFromSelect" new-value-mode="add-unique"
              emit-value map-options>
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey">
                    No hay tipos. Escribe para añadir uno nuevo.
                  </q-item-section>
                </q-item>
              </template>
            </q-select>

            <q-input v-model="productDescription" label="Descripción" outlined dense required />
            <q-input v-model="productPrice" label="Precio" type="number" outlined dense required />
            <q-select v-model="categoryId" :options="categories" label="Categoría" outlined dense emit-value map-options
              required />
            <q-input v-model="productStock" label="Stock" type="number" outlined dense required />

            <div class="q-mt-sm">
              <label class="text-subtitle2 q-mb-sm text-primary">Seleccionar imágenes del producto (hasta 4):</label>

              <div class="q-gutter-sm row justify-center q-mt-sm">
                <div v-for="n in 4" :key="n">
                  <q-btn :label="'Imagen ' + n" color="primary" icon="cloud_upload"
                    @click="$refs['imageInput' + n][0].click()" flat rounded />
                  <input :ref="'imageInput' + n" type="file" accept="image/*" style="display: none"
                    @change="(e) => handleSingleFileChange(e, n - 1)" />
                </div>
              </div>

              <div class="q-gutter-sm row justify-center q-mt-sm">
                <div class="q-row q-col-gutter-md">
                  <div v-for="(img, i) in imagePreviews" :key="i" class="q-col-6 q-pa-xs"
                    style="width: 150px; height: 240px;">
                    <div class="relative-position">
                      <div class="text-caption text-center q-mb-xs ellipsis">{{ imageNames[i] }}</div>
                      <img :src="img" class="q-img rounded-borders shadow-2"
                        style="width: 100%; height: 200px; object-fit: cover;" />
                      <q-btn round dense flat size="xs" icon="close" color="white" class="absolute"
                        style="top: 4px; right: 4px; background-color: red; width: 24px; height: 24px; min-width: 0;"
                        @click="removeImage(i)" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <q-btn type="submit" label="Agregar Producto" color="primary" class="q-mt-md" :loading="loading" unelevated
              block />
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="addMarcaDialog" :persistent="false">
      <q-card style="min-width: 350px;">
        <q-card-section class="row items-center justify-between">
          <div class="text-h6">Agregar Nueva Marca</div>
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input outlined dense v-model="newMarcaName" label="Nombre de la Marca" required />
          <q-file outlined dense v-model="newMarcaImageFile" label="Imagen de la Marca (opcional)" accept="image/*"
            class="q-mt-md">
            <template v-slot:prepend>
              <q-icon name="attach_file" />
            </template>
          </q-file>
          <div v-if="newMarcaImagePreview" class="q-mt-sm flex flex-center">
            <img :src="newMarcaImagePreview" alt="Nueva Marca Preview"
              style="max-width: 150px; max-height: 150px; object-fit: cover; border-radius: 8px;" />
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="negative" v-close-popup />
          <q-btn label="Guardar" color="primary" @click="handleAddNewMarca" :loading="loading" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="addTipoDialog" :persistent="false">
      <q-card style="min-width: 350px;">
        <q-card-section class="row items-center justify-between">
          <div class="text-h6">Agregar Nuevo Tipo</div>
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input outlined dense v-model="newTipoName" label="Nombre del Tipo" required />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="negative" v-close-popup />
          <q-btn label="Guardar" color="primary" @click="handleAddNewTipo" :loading="loading" />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useQuasar } from 'quasar';
import { postData, getData, putData } from '../Services/jook.js';

const $q = useQuasar();

// --- Variables de estado para los modales y formularios ---
const dialog = ref(false); // Controla la visibilidad del modal para agregar producto

// Datos para el formulario de agregar producto
const productName = ref('');
// productMarca ahora almacenará el _id de la marca
const productMarca = ref(null);
const marcaImageFileAdd = ref(null);
const marcaImagePreviewAdd = ref(null);

// productTipo ahora almacenará el _id del tipo
const productTipo = ref(null);
const productDescription = ref('');
const productPrice = ref('');
const productStock = ref('');
const categoryId = ref('');
const categories = ref([]); // Opciones de categorías para los selectores
const images = ref([]); // Array para almacenar los archivos de imagen del producto (nuevos)
const imagePreviews = ref([]); // Array para almacenar las URLs de previsualización de imágenes del producto
const imageNames = ref([]); // Array para almacenar los nombres de archivo de las imágenes

const loading = ref(false); // Estado de carga para los botones de enviar
const loadingTable = ref(true); // Estado de carga para la tabla de productos

// Variables para el modal de edición de producto
const productToEdit = ref(null); // Objeto del producto que se está editando
const editDialog = ref(false); // Controla la visibilidad del modal de edición

const editImages = ref([]); // Archivos de imagen *nuevos* para el producto en edición
const editImagePreviews = ref([]); // URLs de previsualización para imágenes en edición (mezcla de existentes y nuevas)

const marcaImageFileEdit = ref(null); // Archivo de imagen para la marca (al editar producto)
const marcaImagePreviewEdit = ref(null); // URL de previsualización de la imagen de marca (al editar producto)

// Listas de opciones completas para selectores (label: nombre, value: _id, imagen: url)
const availableMarcas = ref([]);
const availableTipos = ref([]);

// Variables para el modal de agregar nueva marca (separado)
const addMarcaDialog = ref(false);
const newMarcaName = ref('');
const newMarcaImageFile = ref(null); // Archivo de imagen para la nueva marca
const newMarcaImagePreview = ref(null); // Previsualización para la nueva marca

// Variables para el modal de agregar nuevo tipo (separado)
const addTipoDialog = ref(false);
const newTipoName = ref('');

// --- Variables para la búsqueda y filtrado de la tabla ---
const searchQuery = ref('');
// filterMarca ahora es un _id o null
const filterMarca = ref(null);
// filterTipo ahora es un _id o null
const filterTipo = ref(null);
const filterCategory = ref(null);



const allMarcas = ref([])
const allTipos = ref([])


const productos = ref([]); // Array que contiene todos los productos cargados
const columnas = [ // Definición de las columnas de la tabla Quasar
  { name: 'imagen', label: 'Imagen', field: 'images', align: 'center' },
  { name: 'marca', label: 'Marca', field: 'marca', align: 'left', sortable: true, format: val => val?.nombre || 'N/A' },
  { name: 'categoriaNombre', label: 'Categoría', field: 'categoriaNombre', align: 'center', sortable: true },
  { name: 'tipo', label: 'Tipo', field: 'tipo', align: 'left', sortable: true, format: val => val?.nombre || 'N/A' }, // Asegura que muestre el nombre del tipo
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left', sortable: true },
  { name: 'descripcion', label: 'Descripción', field: 'descripcion', align: 'center' },
  { name: 'precio', label: 'Precio', field: 'price', align: 'right', sortable: true },
  { name: 'stock', label: 'Stock', field: 'stock', align: 'right', sortable: true },
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'center' }
];

// --- Propiedades computadas para la lógica de la UI ---

// Opciones de marcas únicas para el filtro de la tabla, incluyendo la imagen
const uniqueMarcasOptions = computed(() => {
  // Las opciones para el filtro deben venir de `availableMarcas` para incluir _id y label
  return availableMarcas.value.map(marca => ({
    label: marca.label,
    value: marca.value, // El _id de la marca
    imagen: marca.imagen
  })).sort((a, b) => a.label.localeCompare(b.label));
});

// Productos filtrados para la tabla (se actualiza automáticamente con los filtros)
const filteredProductos = computed(() => {
  let result = productos.value;

  // Filtrado por búsqueda general en varios campos
  if (searchQuery.value) {
    const searchLower = searchQuery.value.toLowerCase();
    result = result.filter(producto =>
      (producto.nombre && producto.nombre.toLowerCase().includes(searchLower)) ||
      (producto.descripcion && producto.descripcion.toLowerCase().includes(searchLower)) ||
      (producto.marca?.nombre && producto.marca.nombre.toLowerCase().includes(searchLower)) ||
      (producto.tipo?.name && producto.tipo.name.toLowerCase().includes(searchLower)) || // Cambio: producto.tipo.name
      (producto.categoriaNombre && producto.categoriaNombre.toLowerCase().includes(searchLower))
    );
  }

  // Filtrado por Marca (usando el _id de la marca)
  if (filterMarca.value) {
    result = result.filter(producto => producto.marca?._id === filterMarca.value);
  }

  // Filtrado por Tipo (usando el _id del tipo)
  if (filterTipo.value) {
    result = result.filter(producto => producto.tipo?._id === filterTipo.value);
  }

  // Filtrado por Categoría
  if (filterCategory.value) {
    result = result.filter(producto => producto.categoryId?._id === filterCategory.value);
  }

  return result;
});


// --- Watchers para la previsualización de imágenes ---

// Previsualización de imagen de marca al agregar producto
watch(marcaImageFileAdd, (newFile) => {
  if (newFile) {
    marcaImagePreviewAdd.value = URL.createObjectURL(newFile);
  } else {
    marcaImagePreviewAdd.value = null;
  }
});

// Previsualización de imagen de marca al editar producto
watch(marcaImageFileEdit, (newFile) => {
  if (newFile) {
    marcaImagePreviewEdit.value = URL.createObjectURL(newFile);
  } else {
    // Si el usuario borra el archivo, volvemos a la imagen original del producto (si existe)
    marcaImagePreviewEdit.value = productToEdit.value?.marca?.imagen || null;
  }
});

// Previsualización de imagen de marca al usar el modal "Nueva Marca"
watch(newMarcaImageFile, (newFile) => {
  if (newFile) {
    newMarcaImagePreview.value = URL.createObjectURL(newFile);
  } else {
    newMarcaImagePreview.value = null;
  }
});


// --- Funciones de filtro para los q-selects en los modales de agregar/editar ---

// Filtra las opciones de marca al escribir en el campo de agregar producto
const filterMarcasAdd = (val, update) => {
  update(() => {
    if (val === '') {
      // Si la búsqueda está vacía, mostramos todas las marcas disponibles
      allMarcas.value = availableMarcas.value;
    } else {
      const needle = val.toLowerCase();
      // Filtramos las marcas existentes que coincidan con la búsqueda por su label
      allMarcas.value = availableMarcas.value.filter(v => v.label.toLowerCase().includes(needle));
    }
  });
};

// Filtra las opciones de tipo al escribir en el campo de agregar producto
const filterTiposAdd = (val, update) => {
  update(() => {
    if (val === '') {
      // Si la búsqueda está vacía, mostramos todos los tipos disponibles
      allTipos.value = availableTipos.value;
    } else {
      const needle = val.toLowerCase();
      // Filtramos los tipos existentes que coincidan con la búsqueda por su label
      allTipos.value = availableTipos.value.filter(v => v.label.toLowerCase().includes(needle));
    }
  });
};

// Filtra las opciones de marca al escribir en el campo de editar producto
const filterMarcasEdit = (val, update) => {
  update(() => {
    if (val === '') {
      allMarcas.value = availableMarcas.value;
    } else {
      const needle = val.toLowerCase();
      allMarcas.value = availableMarcas.value.filter(v => v.label.toLowerCase().includes(needle));
    }
  });
};

// Filtra las opciones de tipo al escribir en el campo de editar producto
const filterTiposEdit = (val, update) => {
  update(() => {
    if (val === '') {
      allTipos.value = availableTipos.value;
    } else {
      const needle = val.toLowerCase();
      allTipos.value = availableTipos.value.filter(v => v.label.toLowerCase().includes(needle));
    }
  });
};


// Agrega una nueva marca si el usuario la escribe en el q-select (y no existe)
const addMarcaFromSelect = async (val, done) => {
  if (val.length > 0) {
    // 1. Verifica si ya existe localmente para evitar duplicados
    const existingMarca = availableMarcas.value.find(m => m.label.toLowerCase() === val.toLowerCase());
    if (existingMarca) {
      $q.notify({ type: 'info', message: `La marca "${val}" ya existe.` });
      if (done) done(existingMarca.value, 'add-unique'); // Selecciona el _id existente
      return;
    }

    loading.value = true;
    try {
      // 2. Llama a tu API para crear la nueva marca
      const formData = new FormData();
      formData.append('name', val);
      if (newMarcaImageFile.value) { // Utiliza newMarcaImageFile para la imagen del select
        formData.append('image', newMarcaImageFile.value);
      }
      const newMarcaData = await postData('/marca', formData, true);

      if (newMarcaData && newMarcaData._id) {
        // 3. Si se creó correctamente, añade la nueva opción a availableMarcas
        const newOption = { label: newMarcaData.name, value: newMarcaData._id, imagen: newMarcaData.image || null };
        availableMarcas.value.push(newOption);
        availableMarcas.value.sort((a, b) => a.label.localeCompare(b.label));
        $q.notify({ type: 'positive', message: `Marca "${val}" creada y seleccionada.` });
        if (done) done(newOption.value, 'add-unique'); // Selecciona el _id de la marca recién creada
      } else {
        $q.notify({ type: 'negative', message: `No se pudo crear la marca "${val}".` });
        if (done) done(null);
      }
    } catch (error) {
      console.error('Error al añadir nueva marca desde select:', error);
      $q.notify({ type: 'negative', message: `Error al crear la marca "${val}".` });
      if (done) done(null);
    } finally {
      loading.value = false;
      newMarcaImageFile.value = null; // Limpiar después de usar
      marcaImagePreviewAdd.value = null; // Limpiar previsualización del select
    }
  }
};

// Agrega un nuevo tipo si el usuario lo escribe en el q-select (y no existe)
const addTipoFromSelect = async (val, done) => {
  if (val.length > 0) {
    const existingType = availableTipos.value.find(t => t.label.toLowerCase() === val.toLowerCase());
    if (existingType) {
      $q.notify({ type: 'info', message: `El tipo "${val}" ya existe.` });
      if (done) done(existingType.value, 'add-unique');
      return;
    }

    loading.value = true;
    try {
      // Llama a tu API para crear el nuevo tipo
      const newTypeData = await postData('/tipo', { nombre: val });

      if (newTypeData && newTypeData._id) {
        const newOption = { label: newTypeData.nombre, value: newTypeData._id };
        availableTipos.value.push(newOption);
        availableTipos.value.sort((a, b) => a.label.localeCompare(b.label));
        $q.notify({ type: 'positive', message: `Tipo "${val}" creado y seleccionado.` });
        if (done) done(newOption.value, 'add-unique');
      } else {
        $q.notify({ type: 'negative', message: `No se pudo crear el tipo "${val}".` });
        if (done) done(null);
      }
    } catch (error) {
      console.error('Error al añadir nuevo tipo desde select:', error);
      $q.notify({ type: 'negative', message: `Error al crear el tipo "${val}".` });
      if (done) done(null);
    } finally {
      loading.value = false;
    }
  }
};

// --- Funciones de filtro para los q-selects de la tabla (filtros de la parte superior) ---

// Filtra las opciones de marca para el selector de la tabla
const filterFnMarca = (val, update) => {
  update(() => {
    if (val === '') {
      // filterMarca.options debe ser una variable local en la función update
      // y no una propiedad de ref de filterMarca.
      // Quasar espera que `update` se llame con una función que actualiza las opciones.
      filterMarcasAdd.options = uniqueMarcasOptions.value; // Usamos el nombre de la función para el ámbito
    } else {
      const needle = val.toLowerCase();
      filterMarcasAdd.options = uniqueMarcasOptions.value.filter(v => v.label.toLowerCase().includes(needle));
    }
  });
};

// Filtra las opciones de tipo para el selector de la tabla
const filterFnTipo = (val, update) => {
  update(() => {
    if (val === '') {
      filterTiposAdd.options = availableTipos.value;
    } else {
      const needle = val.toLowerCase();
      filterTiposAdd.options = availableTipos.value.filter(v => v.label.toLowerCase().includes(needle));
    }
  });
};

// --- Funciones para los botones de agregar marca/tipo (modales separados) ---

// Abre el diálogo para agregar una nueva marca
const openAddMarcaDialog = () => {
  newMarcaName.value = '';
  newMarcaImageFile.value = null; // Limpiar el archivo de imagen
  newMarcaImagePreview.value = null; // Limpiar la previsualización
  addMarcaDialog.value = true;
};

// Maneja la adición de una nueva marca desde el diálogo separado
const handleAddNewMarca = async () => {
  if (newMarcaName.value.trim() === '') {
    $q.notify({ type: 'negative', message: 'El nombre de la marca no puede estar vacío.' });
    return;
  }
  loading.value = true;
  try {
    const formData = new FormData();
    formData.append('nombre', newMarcaName.value.trim());
    if (newMarcaImageFile.value) {
      formData.append('imagenMarca', newMarcaImageFile.value);
    }
    const newMarca = await postData('/marca', formData, true); 

    if (newMarca && newMarca.marca && newMarca.marca._id) {
      $q.notify({ type: 'positive', message: `Marca "${newMarca.marca.nombre}" agregada.` });

      await fetchMarcas();

      addMarcaDialog.value = false;
      newMarcaName.value = '';
      newMarcaImageFile.value = null;
    } else {
      $q.notify({ type: 'negative', message: 'Error al agregar la marca.' });
    }
  } catch (error) {
    console.error("Error al añadir nueva marca:", error);
    $q.notify({ type: 'negative', message: 'Error al procesar la nueva marca.' });
  } finally {
    loading.value = false;
  }
};

// Abre el diálogo para agregar un nuevo tipo
const openAddTipoDialog = () => {
  newTipoName.value = '';
  addTipoDialog.value = true;
};

// Maneja la adición de un nuevo tipo desde el diálogo separado
const handleAddNewTipo = async () => {
  if (newTipoName.value.trim() === '') {
    $q.notify({ type: 'negative', message: 'El nombre del tipo no puede estar vacío.' });
    return;
  }
  loading.value = true;
  try {
    const response = await postData('/tipo', { nombre: newTipoName.value.trim() });
    const newTipo = response.tipo; // ✅ extraer el objeto correcto

    if (newTipo && newTipo._id) {
      $q.notify({ type: 'positive', message: `Tipo "${newTipo.nombre}" agregado.` });
      await fetchTipos();
      addTipoDialog.value = false;
      newTipoName.value = '';
    } else {
      $q.notify({ type: 'negative', message: 'Error al agregar el tipo (respuesta inválida).' });
    }
  } catch (error) {
    console.error("Error al añadir nuevo tipo:", error);
    $q.notify({ type: 'negative', message: 'Error al procesar el nuevo tipo.' });
  } finally {
    loading.value = false;
  }
};



// --- Ciclo de vida (al montar el componente) ---
onMounted(async () => {
  await fetchCategories();
  await fetchMarcas(); // Cargar marcas al inicio
  await fetchTipos();   // Cargar tipos al inicio
  await fetchProductos();
});
// --- Funciones de comunicación con el backend ---

// Obtiene todas las categorías desde el backend
const fetchCategories = async () => {
  try {
    const response = await getData('/categoria');
    categories.value = response.map(cat => ({
      label: cat.name,
      value: cat._id,
    }));
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Error al cargar categorías' });
  }
};


// Obtiene todas las marcas desde el backend
// ... (código existente)

// Obtiene todas las marcas desde el backend
const fetchMarcas = async () => {
  try {
    const response = await getData('/marca');
    console.log("marca", response);

    availableMarcas.value = response.map(m => ({
      label: m.nombre || 'Sin Nombre',
      value: m._id
    })).sort((a, b) => {

      const labelA = a.label || '';
      const labelB = b.label || '';
      return labelA.localeCompare(labelB);
    });
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Error al cargar marcas.' });
    console.error('Error fetching marcas:', error);
  }
};


// Obtiene todos los tipos desde el backend
const fetchTipos = async () => {
  try {
    const response = await getData('/tipo');
    console.log("respuesta", response);

    availableTipos.value = response.map(t => ({
      label: t.nombre || 'Sin Tipo', // <--- CAMBIO CLAVE: Usa 'Sin Tipo' o una cadena vacía si t.name es undefined/null
      value: t._id
    })).sort((a, b) => {
      const labelA = a.label || ''; // Si por alguna razón label aún es undefined, usa ''
      const labelB = b.label || '';
      return labelA.localeCompare(labelB);
    });
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Error al cargar tipos.' });
    console.error('Error fetching types:', error);
  }
};

// ... (resto de tu código)

// Obtiene todos los productos desde el backend
const fetchProductos = async () => {
  loadingTable.value = true;
  try {
    const response = await getData('/producto');
    console.log("respuesta productos", response);

    // En tu función fetchProductos:
    productos.value = response.map(producto => {
      const marcaObj = producto.marca && typeof producto.marca === 'object'
        ? { _id: producto.marca._id, nombre: producto.marca.name, imagen: producto.marca.image } // <--- CAMBIO AQUÍ: producto.marca.name
        : { _id: producto.marca || null, nombre: 'N/A', imagen: null };

      const tipoObj = producto.tipo && typeof producto.tipo === 'object'
        ? { _id: producto.tipo._id, name: producto.tipo.name }
        : { _id: producto.tipo || null, name: 'N/A' };

      return {
        ...producto,
        categoriaNombre: producto.categoryId?.name || 'Sin categoría',
        marca: marcaObj,
        tipo: tipoObj,
      };
    });
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Error al cargar productos' });
  } finally {
    loadingTable.value = false;
  }
};

// Abre el diálogo de edición y carga los datos del producto seleccionado
const openEditDialog = (producto) => {
  let categoriaId;

  if (producto.categoryId) {
    categoriaId = typeof producto.categoryId === 'object' ?
      producto.categoryId._id : // Si es un objeto de categoría, toma el _id
      producto.categoryId; // Si ya es solo el _id
  } else {
    categoriaId = ''; // Si no tiene categoría
  }

  // Inicializamos `productToEdit` con una copia de los datos del producto
  productToEdit.value = {
    _id: producto._id,
    nombre: producto.nombre,
    descripcion: producto.descripcion,
    price: producto.price,
    stock: producto.stock,
    categoryId: categoriaId,
    // Aseguramos que 'marca' y 'tipo' se inicialicen con su _id si existen,
    // o null si no hay referencia. Esto es lo que `v-model` del q-select espera.
    marca: producto.marca?._id || null,
    tipo: producto.tipo?._id || null,
    images: [...(producto.images || [])] // Copia de las URLs de imágenes existentes
  };

  // Inicializamos las previsualizaciones de imágenes con las imágenes existentes del producto
  editImagePreviews.value = [...(productToEdit.value.images || [])];
  editImages.value = []; // Reiniciamos los archivos de imagen nuevos para edición

  // Inicializamos la imagen de la marca para edición
  marcaImageFileEdit.value = null; // Nos aseguramos de que no haya un archivo `File` en el ref
  marcaImagePreviewEdit.value = producto.marca?.imagen || null; // Carga la imagen actual de la marca
  editDialog.value = true;
};

// Maneja el envío del formulario para agregar un nuevo producto
const handleAddProduct = async () => {
  if (!productName.value || !productDescription.value || !productPrice.value || !productStock.value || !categoryId.value || !productMarca.value || !productTipo.value) {
    $q.notify({ type: 'negative', message: 'Por favor, rellena todos los campos obligatorios.' });
    return;
  }

  loading.value = true;
  try {
    const formData = new FormData();
    formData.append('nombre', productName.value);
    formData.append('descripcion', productDescription.value);
    formData.append('price', productPrice.value);
    formData.append('stock', productStock.value);
    formData.append('categoryId', categoryId.value);
    formData.append('marca', productMarca.value); // Aquí enviamos el _id de la marca
    formData.append('tipo', productTipo.value);     // Aquí enviamos el _id del tipo

    images.value.forEach((file) => {
      formData.append('images', file);
    });

    if (marcaImageFileAdd.value) {
      formData.append('marcaImage', marcaImageFileAdd.value);
    }

    await postData('/producto', formData, true); // true para indicar que se envía FormData
    $q.notify({ type: 'positive', message: 'Producto agregado exitosamente.' });
    resetAddForm(); // Limpiar el formulario
    dialog.value = false; // Cerrar el modal
    await fetchProductos(); // Recargar la lista de productos
  } catch (error) {
    console.error('Error al agregar producto:', error);
    $q.notify({ type: 'negative', message: 'Error al agregar producto.' });
  } finally {
    loading.value = false;
  }
};

// Maneja el envío del formulario para editar un producto existente
const handleEditProduct = async () => {
  if (!productToEdit.value.nombre || !productToEdit.value.descripcion || !productToEdit.value.price || !productToEdit.value.stock || !productToEdit.value.categoryId || !productToEdit.value.marca || !productToEdit.value.tipo) {
    $q.notify({ type: 'negative', message: 'Por favor, rellena todos los campos obligatorios.' });
    return;
  }

  loading.value = true;
  try {
    const formData = new FormData();
    formData.append('nombre', productToEdit.value.nombre);
    formData.append('descripcion', productToEdit.value.descripcion);
    formData.append('price', productToEdit.value.price);
    formData.append('stock', productToEdit.value.stock);
    formData.append('categoryId', productToEdit.value.categoryId);
    formData.append('marca', productToEdit.value.marca); // Aquí enviamos el _id de la marca
    formData.append('tipo', productToEdit.value.tipo);     // Aquí enviamos el _id del tipo

    // Añade las imágenes nuevas con el nombre esperado 'images'
    editImages.value.forEach((file) => {
      formData.append('images', file);
    });

    // Envía las URLs de las imágenes que se mantienen
    formData.append('existingImages', JSON.stringify(editImagePreviews.value.filter(img => typeof img === 'string')));

    // Añade la imagen de marca con el nombre esperado 'marcaImagen'
    if (marcaImageFileEdit.value) {
      formData.append('marcaImagen', marcaImageFileEdit.value);
    }

    await putData(`/producto/id/${productToEdit.value._id}`, formData, true); // true para indicar que se envía FormData
    $q.notify({ type: 'positive', message: 'Producto actualizado exitosamente.' });
    editDialog.value = false; // Cerrar el modal
    await fetchProductos(); // Recargar la lista de productos
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    $q.notify({ type: 'negative', message: 'Error al actualizar producto.' });
  } finally {
    loading.value = false;
  }
};

// Cambiar el estado de un producto (activo/inactivo)
const cambiarEstado = async (producto) => {
  loadingTable.value = true;
  try {
    const newEstado = producto.estado === 'activo' ? 'inactivo' : 'activo';
    await putData(`/producto/id/${producto._id}/estado`, { estado: newEstado });
    $q.notify({ type: 'positive', message: `Producto "${producto.nombre}" cambiado a ${newEstado}.` });
    await fetchProductos();
  } catch (error) {
    console.error('Error al cambiar estado:', error);
    $q.notify({ type: 'negative', message: 'Error al cambiar el estado del producto.' });
  } finally {
    loadingTable.value = false;
  }
};


// --- Funciones de manejo de archivos e imágenes ---

// Maneja la selección de una sola imagen para el formulario de agregar producto
const handleSingleFileChange = (event, index) => {
  const file = event.target.files[0];
  if (file) {
    images.value[index] = file;
    imagePreviews.value[index] = URL.createObjectURL(file);
    imageNames.value[index] = file.name;
  }
};

// Elimina una imagen del formulario de agregar producto
const removeImage = (index) => {
  images.value.splice(index, 1);
  imagePreviews.value.splice(index, 1);
  imageNames.value.splice(index, 1);
};

// Maneja la selección de una sola imagen para el formulario de editar producto
const handleSingleEditFileChange = (event, index) => {
  const file = event.target.files[0];
  if (file) {
    editImages.value[index] = file;
    editImagePreviews.value[index] = URL.createObjectURL(file);
  }
};

// Elimina una imagen del formulario de editar producto
const removeEditImage = (index) => {
  editImages.value.splice(index, 1);
  editImagePreviews.value.splice(index, 1);
};

// --- Limpiar el formulario de agregar producto ---
const resetAddForm = () => {
  productName.value = '';
  productMarca.value = null;
  marcaImageFileAdd.value = null;
  marcaImagePreviewAdd.value = null;
  productTipo.value = null;
  productDescription.value = '';
  productPrice.value = '';
  productStock.value = '';
  categoryId.value = '';
  images.value = [];
  imagePreviews.value = [];
  imageNames.value = [];
};



</script>


<style scoped>
/* Estilos para el formulario de agregar producto */
.add-product-container {
  padding: 2rem;
}

h2 {
  text-align: center;
  margin-bottom: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group input {
  width: 100%;
}

button {
  width: 100%;
  margin-top: 1rem;
}
</style>
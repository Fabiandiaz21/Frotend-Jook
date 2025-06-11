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
          <div class="col-12 col-md-auto">
            <q-btn color="purple" icon="local_offer" label="Ver Ofertas" @click="toggleOfertasFilter" />
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

            <q-btn v-if="!props.row.hasActiveOffer" icon="local_offer" color="teal" dense size="sm" flat label="Oferta"
              @click="openOfertaDialog(props.row)" class="q-px-xs" />
            <q-btn v-else icon="edit_off" color="orange" dense size="sm" flat label="Editar Oferta"
              @click="openOfertaDialog(props.row)" class="q-px-xs" />
            <q-btn v-if="props.row.hasActiveOffer" icon="delete_forever" color="red" dense size="sm" flat
              label="Quitar Oferta" @click="confirmDesactivarOferta(props.row)" class="q-px-xs" />
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
          </div>
        </q-td>
      </template>
      <template v-slot:body-cell-tipo="props">
        <q-td align="left">
          <span>{{ props.row.tipo?.nombre || 'N/A' }}</span>
        </q-td>
      </template>

      <template v-slot:body-cell-oferta="props">
        <q-td align="center">
          <q-chip v-if="props.row.hasActiveOffer" color="teal" text-color="white" icon="local_offer"
            :label="`${props.row.offer?.percentage}% Desc.`" />
          <q-chip v-else color="grey" text-color="white" label="Sin Oferta" />
        </q-td>
      </template>

      <template v-slot:body-cell-precioFinal="props">
        <q-td align="right">
          <span :class="{ 'text-strike text-grey': props.row.hasActiveOffer }">{{ formatCurrency(props.row.price)
          }}</span>
          <br v-if="props.row.hasActiveOffer" />
          <span v-if="props.row.hasActiveOffer" class="text-bold text-green-8">
            {{ formatCurrency(calculateFinalPrice(props.row)) }}
          </span>
        </q-td>
      </template>

    </q-table>

    <q-dialog v-model="editDialog" :persistent="false">
      <q-card style="min-width: 500px; max-width: 90vw">
        <q-card-section class="row items-center justify-between">
          <div class="text-h6">Editar Producto</div>
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-form @submit.prevent="handleEditProduct">
            <q-input v-model="productToEdit.nombre" label="Nombre del Producto" outlined dense required />

            <q-select outlined dense v-model="productToEdit.marca" :options="allMarcas" label="Marca" clearable
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

            <q-select outlined dense v-model="productToEdit.tipo" :options="allTipos" label="Tipo" clearable use-input
              input-debounce="0" @filter="filterTiposEdit" @new-value="addTipoFromSelect" new-value-mode="add-unique"
              emit-value map-options>
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
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-form @submit.prevent="handleAddProduct">
            <q-input v-model="productName" label="Nombre del Producto" outlined dense required />

            <q-select outlined dense v-model="productMarca" :options="allMarcas" label="Marca" clearable use-input
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

            <q-select outlined dense v-model="productTipo" :options="allTipos" label="Tipo" clearable use-input
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

    <q-dialog v-model="ofertaDialog" :persistent="false">
      <q-card style="min-width: 400px; max-width: 90vw;">
        <q-card-section class="row items-center justify-between">
          <div class="text-h6">{{ offerToEdit?.offer ? 'Editar Oferta' : 'Activar Oferta' }}</div>
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div v-if="offerToEdit">
            <div class="text-subtitle1 q-mb-sm">Producto: <strong>{{ offerToEdit.nombre }}</strong></div>
            <div class="text-body2">Precio Original: {{ formatCurrency(offerToEdit.price) }}</div>
            <q-input outlined dense v-model="offerPercentage" label="Porcentaje de Descuento (%)" type="number" min="1"
              max="100" required class="q-mt-md" />
            <q-input outlined dense v-model="offerExpirationDate" label="Fecha de Vencimiento" type="date" required
              class="q-mt-sm" />
            <div class="text-body1 q-mt-md" v-if="offerPercentage && offerToEdit.price">
              Precio Final Estimado: <span class="text-bold text-green-8">{{
                formatCurrency(offerToEdit.price * (1 - (offerPercentage / 100))) }}</span>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="negative" v-close-popup />
          <q-btn label="Guardar Oferta" color="primary" @click="handleActivarOferta" :loading="loading" />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useQuasar } from 'quasar';
import { postData, getData, putData, deleteData } from '../Services/jook.js';

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
const showOfertasOnly = ref(false); // Nueva variable para filtrar por productos con oferta

const allMarcas = ref([])
const allTipos = ref([])


const productos = ref([]); // Array que contiene todos los productos cargados

// --- Variables para la gestión de ofertas ---
const ofertaDialog = ref(false); // Controla la visibilidad del modal de oferta
const offerToEdit = ref(null); // Objeto del producto para el que se está gestionando la oferta
const offerPercentage = ref(null); // Porcentaje de descuento para la oferta
const offerExpirationDate = ref(null); // Fecha de vencimiento de la oferta

const columnas = [ // Definición de las columnas de la tabla Quasar
  { name: 'imagen', label: 'Imagen', field: 'images', align: 'center' },
  { name: 'marca', label: 'Marca', field: 'marca', align: 'left', sortable: true },
  { name: 'categoryId', label: 'Categoría', field: 'categoryId', align: 'center', sortable: true , format: val => val?.name},
  { name: 'tipo', label: 'Tipo', field: 'tipo', align: 'left', sortable: true, format: val => val?.nombre || 'N/A' }, // Asegura que muestre el nombre del tipo
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left', sortable: true },
  { name: 'descripcion', label: 'Descripción', field: 'descripcion', align: 'center' },
  { name: 'precio', label: 'Precio Original', field: 'price', align: 'right', sortable: true },
  { name: 'oferta', label: 'Oferta', align: 'center' }, // Nueva columna para mostrar el estado de la oferta
  { name: 'precioFinal', label: 'Precio Final', align: 'right', sortable: true }, // Nueva columna para el precio final
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
      (producto.tipo?.nombre && producto.tipo.nombre.toLowerCase().includes(searchLower)) || // Cambio: producto.tipo.nombre
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

  // Nuevo filtro para mostrar solo productos con oferta
  if (showOfertasOnly.value) {
    result = result.filter(producto => producto.hasActiveOffer);
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
      formData.append('nombre', val); // Asegúrate de que el nombre del campo sea 'nombre'
      if (marcaImageFileAdd.value) { // Utiliza marcaImageFileAdd para la imagen del select en el modal agregar
        formData.append('imagenMarca', marcaImageFileAdd.value); // Asegúrate de que el nombre del campo sea 'imagenMarca'
      }
      const newMarcaData = await postData('/marca', formData, true); // `true` indica FormData

      if (newMarcaData && newMarcaData.marca && newMarcaData.marca._id) { // Accede a newMarcaData.marca
        // 3. Si se creó correctamente, añade la nueva opción a availableMarcas
        const newOption = {
          label: newMarcaData.marca.nombre,
          value: newMarcaData.marca._id,
          imagen: newMarcaData.marca.imagen || null
        };
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
      // No limpiar marcaImageFileAdd aquí si aún se va a usar en el formulario principal
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
      const response = await postData('/tipo', { nombre: val });
      const newTypeData = response.tipo; // Asegúrate de acceder al objeto correcto

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
    } else {
      const needle = val.toLowerCase();
      // Asegúrate de que estás filtrando el array correcto de opciones
      const filtered = uniqueMarcasOptions.value.filter(v => v.label.toLowerCase().includes(needle));

      // Si `availableMarcas` es el origen de las opciones, deberías filtrar eso.
      availableMarcas.value = filtered; // Esto afectaría el select principal también
    }
  });
};

// Filtra las opciones de tipo para el selector de la tabla
const filterFnTipo = (val, update) => {
  update(() => {
    if (val === '') {
      // Se actualiza directamente `availableTipos`
    } else {
      const needle = val.toLowerCase();
      const filtered = availableTipos.value.filter(v => v.label.toLowerCase().includes(needle));
      availableTipos.value = filtered;
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

      await fetchMarcas(); // Volver a cargar las marcas para actualizar las opciones

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
      await fetchTipos(); // Volver a cargar los tipos para actualizar las opciones
      addTipoDialog.value = false;
      newTipoName.value = '';
    } else {
      $q.notify({ type: 'negative', message: 'Error al agregar el tipo.' });
    }
  } catch (error) {
    console.error("Error al añadir nuevo tipo:", error);
    $q.notify({ type: 'negative', message: 'Error al procesar el nuevo tipo.' });
  } finally {
    loading.value = false;
  }
};


// --- Funciones para la gestión de imágenes (Add Product) ---

// Maneja la selección de un solo archivo de imagen para el producto (agregar)
const handleSingleFileChange = (event, index) => {
  const file = event.target.files[0];
  if (file) {
    // Asegurar que el array tenga el tamaño correcto
    while (images.value.length <= index) {
      images.value.push(null);
      imagePreviews.value.push(null);
      imageNames.value.push(null);
    }
    
    images.value[index] = file;
    imagePreviews.value[index] = URL.createObjectURL(file);
    imageNames.value[index] = file.name;
    
    console.log('Archivo agregado en índice', index, ':', file.name); // Para debugging
  } else {
    if (images.value[index]) {
      images.value[index] = null;
      imagePreviews.value[index] = null;
      imageNames.value[index] = null;
    }
  }
  
  // NO eliminar elementos aquí para mantener los índices
  // Solo limpiar al final cuando se envíe el formulario
  console.log('Estado actual de images:', images.value); // Para debugging
};

// --- Funciones para la gestión de imágenes (Edit Product) ---

// Maneja la selección de un solo archivo de imagen para el producto (editar)
const handleSingleEditFileChange = (event, index) => {
  const file = event.target.files[0];
  if (file) {
    editImages.value[index] = file;
    editImagePreviews.value[index] = URL.createObjectURL(file);
  } else {
    editImages.value[index] = null;
    // Si no hay nuevo archivo, se intenta mostrar la imagen original si existe
    if (productToEdit.value?.images?.[index]) {
      editImagePreviews.value[index] = productToEdit.value.images[index];
    } else {
      editImagePreviews.value[index] = null;
    }
  }
  editImages.value = editImages.value.filter(Boolean);
  editImagePreviews.value = editImagePreviews.value.filter(Boolean);
};

// Elimina una imagen de la lista de previsualización (editar)
const removeEditImage = (index) => {
  if (productToEdit.value.images && productToEdit.value.images[index]) {
    if (!productToEdit.value.imagesToRemove) {
      productToEdit.value.imagesToRemove = [];
    }
    productToEdit.value.imagesToRemove.push(productToEdit.value.images[index]);
  }
  editImages.value.splice(index, 1);
  editImagePreviews.value.splice(index, 1);
  if (productToEdit.value.images) {
    productToEdit.value.images.splice(index, 1);
  }
};


// --- Funciones CRUD de Productos ---

// Carga todos los productos
const fetchProductos = async () => {
  loadingTable.value = true;
  try {
    const data = await getData('/producto');
    productos.value = data.map(p => {
      const category = categories.value.find(c => c.value === p.tipo?._id); // Usamos p.tipo?._id para seguridad

      return {
        ...p,
        categoriaNombre: category ? category.label : 'Desconocida',
        hasActiveOffer: p.offer && new Date(p.offer.expirationDate) > new Date(),
      };
    });
    console.log("Productos con nombres de categoría asignados:", productos.value); // Para verificar
  } catch (error) {
    console.error('Error al obtener productos:', error);
    $q.notify({ type: 'negative', message: 'Error al cargar los productos.' });
  } finally {
    loadingTable.value = false;
  }
};
// Carga todas las marcas
const fetchMarcas = async () => {
  try {
    const data = await getData('/marca');
    availableMarcas.value = data.map(m => ({
      label: m.nombre,
      value: m._id,
      imagen: m.imagen // Asegúrate de que tu API devuelva la URL de la imagen de la marca
    }));
    // También actualiza la lista de opciones para el filtro principal
    allMarcas.value = availableMarcas.value;
  } catch (error) {
    console.error('Error al obtener marcas:', error);
    $q.notify({ type: 'negative', message: 'Error al cargar las marcas.' });
  }
};

// Carga todos los tipos de uso
const fetchTipos = async () => {
  try {
    const data = await getData('/tipo');
    availableTipos.value = data.map(t => ({
      label: t.nombre,
      value: t._id
    }));
    allTipos.value = availableTipos.value;
  } catch (error) {
    console.error('Error al obtener tipos de uso:', error);
    $q.notify({ type: 'negative', message: 'Error al cargar los tipos de uso.' });
  }
};

// Carga las categorías
const fetchCategories = async () => {
  try {
    // Asume que tienes una API para categorías
    const data = await getData('/categoria');
    console.log("Datos de categorías crudos (API):", data); // Para depuración
    categories.value = data.map(cat => ({
      label: cat.name,
      value: cat._id
    }));
     console.log("Categorías mapeadas para uso interno:", categories.value); // ¡Verifica esto en la consola!
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    $q.notify({ type: 'negative', message: 'Error al cargar las categorías.' });
  }
};

// Maneja el envío del formulario de agregar producto
const handleAddProduct = async () => {
  if (!productName.value || !productDescription.value || !productPrice.value || !productStock.value || !categoryId.value || !productMarca.value || !productTipo.value) {
    $q.notify({ type: 'negative', message: 'Por favor, complete todos los campos requeridos.' });
    return;
  }

  if (images.value.length === 0) {
    $q.notify({ type: 'negative', message: 'Por favor, suba al menos una imagen del producto.' });
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
    formData.append('marca', productMarca.value);
    formData.append('tipo', productTipo.value);

    // ✅ CAMBIO PRINCIPAL: Filtrar archivos nulos ANTES del forEach
    const validImages = images.value.filter(file => file !== null && file !== undefined);
    
    console.log('Imágenes válidas a enviar:', validImages); // Para debugging
    
    validImages.forEach((file) => {
      formData.append('images', file);
    });

    if (marcaImageFileAdd.value) {
      formData.append('marcaImagen', marcaImageFileAdd.value);
    }

    // Debug: Verificar contenido del FormData
    console.log('FormData contents:');
    for (let pair of formData.entries()) {
      console.log(pair[0], pair[1]);
    }

    const newProduct = await postData('/producto', formData, true);

    if (newProduct) {
      $q.notify({ type: 'positive', message: 'Producto agregado exitosamente.' });
      dialog.value = false;
      
      // Resetear formulario inline para evitar el error
      productName.value = '';
      productDescription.value = '';
      productPrice.value = '';
      productStock.value = '';
      categoryId.value = '';
      productMarca.value = null;
      productTipo.value = null;
      
      // Limpiar URLs de objeto para liberar memoria
      imagePreviews.value.forEach(url => {
        if (url && url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
      
      images.value = [];
      imagePreviews.value = [];
      imageNames.value = [];
      marcaImageFileAdd.value = null;
      marcaImagePreviewAdd.value = null;
      
      await fetchProductos();
    } else {
      $q.notify({ type: 'negative', message: 'Error al agregar el producto.' });
    }
  } catch (error) {
    console.error('Error al agregar producto:', error);
    $q.notify({ type: 'negative', message: 'Error al procesar el producto.' });
  } finally {
    loading.value = false;
  }
};

// Maneja la actualización de un producto
const handleEditProduct = async () => {
  if (!productToEdit.value.nombre || !productToEdit.value.descripcion || !productToEdit.value.price ||
    !productToEdit.value.stock || !productToEdit.value.categoryId || !productToEdit.value.marca ||
    !productToEdit.value.tipo) {
    $q.notify({ type: 'negative', message: 'Por favor, complete todos los campos requeridos.' });
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
    formData.append('marca', productToEdit.value.marca); // Envía el _id
    formData.append('tipo', productToEdit.value.tipo); // Envía el _id

    // Añadir nuevas imágenes
    editImages.value.forEach((file, index) => {
      if (file) {
        formData.append('images', file);
      }
    });

    if (productToEdit.value.images) {
      productToEdit.value.images.forEach(imageUrl => {
        if (!productToEdit.value.imagesToRemove || !productToEdit.value.imagesToRemove.includes(imageUrl)) {
          formData.append('existingImages', imageUrl);
        }
      });
    }

    // Añadir imágenes a eliminar
    if (productToEdit.value.imagesToRemove && productToEdit.value.imagesToRemove.length > 0) {
      productToEdit.value.imagesToRemove.forEach(url => {
        formData.append('imagesToRemove', url);
      });
    }

    // Manejar la imagen de la marca
    if (marcaImageFileEdit.value) {
      formData.append('marcaImagen', marcaImageFileEdit.value);
    } else if (productToEdit.value.marca?.imagen && !marcaImageFileEdit.value && !productToEdit.value.keepMarcaImage) {
      formData.append('currentMarcaImage', productToEdit.value.marca.imagen); // Enviar la URL actual si no se cambió.
    }


    const updatedProduct = await putData(`/productos/id/${productToEdit.value._id}`, formData, true); // `true` indica FormData

    if (updatedProduct) {
      $q.notify({ type: 'positive', message: 'Producto actualizado exitosamente.' });
      editDialog.value = false;
      await fetchProductos(); // Recargar la tabla
    } else {
      $q.notify({ type: 'negative', message: 'Error al actualizar el producto.' });
    }
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    $q.notify({ type: 'negative', message: 'Error al procesar la actualización del producto.' });
  } finally {
    loading.value = false;
  }
};

// Cambiar el estado de un producto (activo/inactivo)
const cambiarEstado = async (product) => {
  const newEstado = product.estado === 'activo' ? 'inactivo' : 'activo';
  $q.dialog({
    title: 'Confirmar cambio de estado',
    message: `¿Estás seguro de que quieres cambiar el estado de "${product.nombre}" a "${newEstado}"?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    loadingTable.value = true;
    try {
      // Endpoint actualizado: /productos/id/:id/estado
      const updatedProduct = await putData(`/producto/id/${product._id}/estado`, { estado: newEstado });
      if (updatedProduct) {
        $q.notify({ type: 'positive', message: `Producto "${product.nombre}" ${newEstado} correctamente.` });
        await fetchProductos(); // Recargar la tabla
      } else {
        $q.notify({ type: 'negative', message: `Error al cambiar el estado de "${product.nombre}".` });
      }
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      $q.notify({ type: 'negative', message: 'Error al procesar el cambio de estado.' });
    } finally {
      loadingTable.value = false;
    }
  });
};

// --- Funciones para la gestión de Ofertas ---

// Abre el diálogo para activar/editar una oferta
const openOfertaDialog = (product) => {
  offerToEdit.value = JSON.parse(JSON.stringify(product));
  if (product.hasActiveOffer && product.offer) {
    offerPercentage.value = product.offer.percentage;
    offerExpirationDate.value = product.offer.expirationDate ? new Date(product.offer.expirationDate).toISOString().split('T')[0] : null;
  } else {
    offerPercentage.value = null;
    offerExpirationDate.value = null;
  }
  ofertaDialog.value = true;
};

// Maneja la activación o actualización de una oferta
const handleActivarOferta = async () => {
  if (!offerToEdit.value || !offerPercentage.value || !offerExpirationDate.value) {
    $q.notify({ type: 'negative', message: 'Por favor, complete todos los campos de la oferta.' });
    return;
  }

  if (offerPercentage.value <= 0 || offerPercentage.value > 100) {
    $q.notify({ type: 'negative', message: 'El porcentaje de descuento debe estar entre 1 y 100.' });
    return;
  }

  loading.value = true;
  try {
    const payload = {
      percentage: offerPercentage.value,
      expirationDate: offerExpirationDate.value,
    };
    const response = await postData(`/producto/id/${offerToEdit.value._id}/oferta`, payload);

    if (response) {
      $q.notify({ type: 'positive', message: 'Oferta activada/actualizada exitosamente.' });
      ofertaDialog.value = false;
      await fetchProductos(); // Recargar la tabla para mostrar los cambios
    } else {
      $q.notify({ type: 'negative', message: 'Error al activar/actualizar la oferta.' });
    }
  } catch (error) {
    console.error('Error al activar/actualizar oferta:', error);
    $q.notify({ type: 'negative', message: 'Error al procesar la oferta.' });
  } finally {
    loading.value = false;
  }
};

// Confirma y desactiva una oferta
const confirmDesactivarOferta = (product) => {
  $q.dialog({
    title: 'Confirmar Eliminación de Oferta',
    message: `¿Estás seguro de que quieres quitar la oferta de "${product.nombre}"?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    loadingTable.value = true;
    try {
      const response = await deleteData(`/producto/id/${product._id}/oferta`);
      if (response) {
        $q.notify({ type: 'positive', message: 'Oferta desactivada exitosamente.' });
        await fetchProductos();
      } else {
        $q.notify({ type: 'negative', message: 'Error al desactivar la oferta.' });
      }
    } catch (error) {
      console.error('Error al desactivar oferta:', error);
      $q.notify({ type: 'negative', message: 'Error al procesar la desactivación de la oferta.' });
    } finally {
      loadingTable.value = false;
    }
  });
};

// Alterna el filtro para mostrar solo productos con ofertas
const toggleOfertasFilter = () => {
  showOfertasOnly.value = !showOfertasOnly.value;
  if (showOfertasOnly.value) {
    $q.notify({ type: 'info', message: 'Mostrando solo productos con ofertas activas.' });
  } else {
    $q.notify({ type: 'info', message: 'Mostrando todos los productos.' });
  }
};


// --- Funciones de utilidad ---

// Formatea un número como moneda
const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP', // Moneda de Colombia
    minimumFractionDigits: 0, // No mostrar decimales para valores enteros
    maximumFractionDigits: 0 // No mostrar decimales para valores enteros
  }).format(value);
};

// Calcula el precio final con el descuento de oferta
const calculateFinalPrice = (product) => {
  if (product.hasActiveOffer && product.offer && product.offer.percentage) {
    return product.price * (1 - (product.offer.percentage / 100));
  }
  return product.price;
};

// --- Ciclo de vida ---

onMounted(async () => {
  await fetchCategories();
  await fetchMarcas();
  await fetchTipos();
  await fetchProductos();
});

</script>

<style scoped>
/* Agrega estilos si es necesario */
.q-table__container {
  box-shadow: none;
}
</style>
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
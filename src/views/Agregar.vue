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
            <q-select
              outlined
              dense
              v-model="filterMarca"
              :options="uniqueMarcas"
              label="Filtrar por Marca"
              clearable
              use-input
              input-debounce="0"
              @filter="filterFnMarca"
            >
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
            <q-select
              outlined
              dense
              v-model="filterTipo"
              :options="uniqueTipos"
              label="Filtrar por Tipo"
              clearable
              use-input
              input-debounce="0"
              @filter="filterFnTipo"
            >
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
            <q-select
              outlined
              dense
              v-model="filterCategory"
              :options="categories"
              label="Filtrar por Categoría"
              clearable
              emit-value
              map-options
            >
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

    <q-table title="Lista de Productos" :rows="filteredProductos" :columns="columnas" row-key="_id" :loading="loadingTable">
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

    </q-table>

    <q-dialog v-model="editDialog" :persistent="false">
      <q-card style="min-width: 500px; max-width: 90vw">
        <q-card-section class="row items-center justify-between">
          <div class="text-h6">Editar Producto</div>
        </q-card-section>

        <q-card-section>
          <q-form @submit.prevent="handleEditProduct">
            <q-input v-model="productToEdit.nombre" label="Nombre del Producto" outlined dense required />

            <q-select
              outlined
              dense
              v-model="productToEdit.marca"
              :options="allMarcas"
              label="Marca"
              clearable
              use-input
              input-debounce="0"
              @filter="filterMarcasEdit"
              @new-value="addMarca"
              new-value-mode="add-unique"
            >
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey">
                    No hay marcas. Escribe para añadir una nueva.
                  </q-item-section>
                </q-item>
              </template>
            </q-select>

            <q-select
              outlined
              dense
              v-model="productToEdit.tipo"
              :options="allTipos"
              label="Tipo"
              clearable
              use-input
              input-debounce="0"
              @filter="filterTiposEdit"
              @new-value="addTipo"
              new-value-mode="add-unique"
            >
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
              <label class="text-subtitle2 text-primary q-mb-sm">Cambiar imágenes (máx. 4):</label>

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

            <q-select
              outlined
              dense
              v-model="productMarca"
              :options="allMarcas"
              label="Marca"
              clearable
              use-input
              input-debounce="0"
              @filter="filterMarcasAdd"
              @new-value="addMarca"
              new-value-mode="add-unique"
            >
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey">
                    No hay marcas. Escribe para añadir una nueva.
                  </q-item-section>
                </q-item>
              </template>
            </q-select>

            <q-select
              outlined
              dense
              v-model="productTipo"
              :options="allTipos"
              label="Tipo"
              clearable
              use-input
              input-debounce="0"
              @filter="filterTiposAdd"
              @new-value="addTipo"
              new-value-mode="add-unique"
            >
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
              <label class="text-subtitle2 q-mb-sm text-primary">Seleccionar imágenes (hasta 4):</label>

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
import { ref, onMounted, computed } from 'vue';
import { useQuasar } from 'quasar';
import { postData, getData, putData } from '../Services/jook.js';

const $q = useQuasar();
const dialog = ref(false); // Modal para agregar producto

const productName = ref('');
const productMarca = ref(null);
const productTipo = ref(null);
const productDescription = ref('');
const productPrice = ref('');
const productStock = ref('');
const categoryId = ref('');
const categories = ref([]); // Opciones de categorías para los selects
const images = ref([]);
const imagePreviews = ref([]);
const loading = ref(false);
const loadingTable = ref(true);
const imageNames = ref([]);

const productToEdit = ref(null);
const editDialog = ref(false);

const editImages = ref([]);
const editImagePreviews = ref([]);

const allMarcas = ref([]);
const allTipos = ref([]);

const addMarcaDialog = ref(false);
const newMarcaName = ref('');
const addTipoDialog = ref(false);
const newTipoName = ref('');

// Refs para la búsqueda y filtrado de la tabla
const searchQuery = ref('');
const filterMarca = ref(null);
const filterTipo = ref(null);
const filterCategory = ref(null); // Nuevo ref para el filtro de categoría

const productos = ref([]);
const columnas = [
  { name: 'imagen', label: 'Imagen', field: 'imagen', align: 'center' },
  { name: 'marca', label: 'Marca', field: 'marca', align: 'left', sortable: true },
  { name: 'categoriaNombre', label: 'Categoría', field: 'categoriaNombre', align: 'center', sortable: true },
  { name: 'tipo', label: 'Tipo', field: 'tipo', align: 'left', sortable: true },
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left', sortable: true },
  { name: 'descripcion', label: 'Descripción', field: 'descripcion', align: 'center' },
  { name: 'precio', label: 'Precio', field: 'price', align: 'right', sortable: true },
  { name: 'stock', label: 'Stock', field: 'stock', align: 'right', sortable: true },
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'center' }
];

// Computed property para marcas y tipos únicos para los filtros de la tabla
const uniqueMarcas = computed(() => {
  const marcas = new Set(productos.value.map(p => p.marca).filter(Boolean));
  return Array.from(marcas).sort();
});

const uniqueTipos = computed(() => {
  const tipos = new Set(productos.value.map(p => p.tipo).filter(Boolean));
  return Array.from(tipos).sort();
});

// Computed property para los productos filtrados en la tabla
const filteredProductos = computed(() => {
  let result = productos.value;

  // Filtrado por búsqueda general
  if (searchQuery.value) {
    const searchLower = searchQuery.value.toLowerCase();
    result = result.filter(producto =>
      (producto.nombre && producto.nombre.toLowerCase().includes(searchLower)) ||
      (producto.descripcion && producto.descripcion.toLowerCase().includes(searchLower)) ||
      (producto.marca && producto.marca.toLowerCase().includes(searchLower)) ||
      (producto.tipo && producto.tipo.toLowerCase().includes(searchLower)) ||
      (producto.categoriaNombre && producto.categoriaNombre.toLowerCase().includes(searchLower))
    );
  }

  // Filtrado por Marca
  if (filterMarca.value) {
    result = result.filter(producto => producto.marca === filterMarca.value);
  }

  // Filtrado por Tipo
  if (filterTipo.value) {
    result = result.filter(producto => producto.tipo === filterTipo.value);
  }

  // **NUEVO FILTRO: Por Categoría**
  if (filterCategory.value) {
    result = result.filter(producto => producto.categoryId._id === filterCategory.value);
  }

  return result;
});


// Funciones para los q-selects de marca y tipo en los modales de agregar/editar
const filterMarcasAdd = (val, update) => {
  update(() => {
    if (val === '') {
      update(() => {
        allMarcas.value; // Mostrar todas las marcas
      });
    } else {
      const needle = val.toLowerCase();
      update(() => {
        allMarcas.value = allMarcas.value.filter(v => v.toLowerCase().indexOf(needle) > -1);
      });
    }
  });
};

const filterTiposAdd = (val, update) => {
  update(() => {
    if (val === '') {
      update(() => {
        allTipos.value; // Mostrar todos los tipos
      });
    } else {
      const needle = val.toLowerCase();
      update(() => {
        allTipos.value = allTipos.value.filter(v => v.toLowerCase().indexOf(needle) > -1);
      });
    }
  });
};

const filterMarcasEdit = (val, update) => {
  update(() => {
    if (val === '') {
      update(() => {
        allMarcas.value;
      });
    } else {
      const needle = val.toLowerCase();
      update(() => {
        allMarcas.value = allMarcas.value.filter(v => v.toLowerCase().indexOf(needle) > -1);
      });
    }
  });
};

const filterTiposEdit = (val, update) => {
  update(() => {
    if (val === '') {
      update(() => {
        allTipos.value;
      });
    } else {
      const needle = val.toLowerCase();
      update(() => {
        allTipos.value = allTipos.value.filter(v => v.toLowerCase().indexOf(needle) > -1);
      });
    }
  });
};

const addMarca = (val, done) => {
  if (val.length > 0) {
    if (!allMarcas.value.includes(val)) {
      allMarcas.value.push(val);
      allMarcas.value.sort();
    }
    if (done) done(val, 'add-unique');
  }
};

const addTipo = (val, done) => {
  if (val.length > 0) {
    if (!allTipos.value.includes(val)) {
      allTipos.value.push(val);
      allTipos.value.sort();
    }
    if (done) done(val, 'add-unique');
  }
};

// Funciones de filtro para los selects de la tabla
const filterFnMarca = (val, update) => {
  update(() => {
    if (val === '') {
      const currentUniqueMarcas = Array.from(new Set(productos.value.map(p => p.marca).filter(Boolean))).sort();
      filterMarca.options = currentUniqueMarcas;
    } else {
      const needle = val.toLowerCase();
      const currentUniqueMarcas = Array.from(new Set(productos.value.map(p => p.marca).filter(Boolean))).sort();
      filterMarca.options = currentUniqueMarcas.filter(v => v.toLowerCase().includes(needle));
    }
  });
};

const filterFnTipo = (val, update) => {
  update(() => {
    if (val === '') {
      const currentUniqueTipos = Array.from(new Set(productos.value.map(p => p.tipo).filter(Boolean))).sort();
      filterTipo.options = currentUniqueTipos;
    } else {
      const needle = val.toLowerCase();
      const currentUniqueTipos = Array.from(new Set(productos.value.map(p => p.tipo).filter(Boolean))).sort();
      filterTipo.options = currentUniqueTipos.filter(v => v.toLowerCase().includes(needle));
    }
  });
};

// Funciones para los nuevos botones de agregar marca/tipo
const openAddMarcaDialog = () => {
  newMarcaName.value = '';
  addMarcaDialog.value = true;
};

const handleAddNewMarca = () => {
  if (newMarcaName.value.trim() === '') {
    $q.notify({ type: 'negative', message: 'El nombre de la marca no puede estar vacío.' });
    return;
  }
  addMarca(newMarcaName.value.trim());
  $q.notify({ type: 'positive', message: `Marca "${newMarcaName.value}" agregada.` });
  addMarcaDialog.value = false;
  newMarcaName.value = '';
};

const openAddTipoDialog = () => {
  newTipoName.value = '';
  addTipoDialog.value = true;
};

const handleAddNewTipo = () => {
  if (newTipoName.value.trim() === '') {
    $q.notify({ type: 'negative', message: 'El nombre del tipo no puede estar vacío.' });
    return;
  }
  addTipo(newTipoName.value.trim());
  $q.notify({ type: 'positive', message: `Tipo "${newTipoName.value}" agregado.` });
  addTipoDialog.value = false;
  newTipoName.value = '';
};


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

const fetchProductos = async () => {
  loadingTable.value = true;
  try {
    const response = await getData('/producto');
    productos.value = response.map(producto => {
      return {
        ...producto,
        categoriaNombre: producto.categoryId?.name || 'Sin categoría',
        marca: producto.marca || '',
        tipo: producto.tipo || '',
      };
    });
    allMarcas.value = Array.from(new Set(productos.value.map(p => p.marca).filter(Boolean))).sort();
    allTipos.value = Array.from(new Set(productos.value.map(p => p.tipo).filter(Boolean))).sort();
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Error al cargar productos' });
  } finally {
    loadingTable.value = false;
  }
};

const openEditDialog = (producto) => {
  let categoriaId;

  if (producto.categoryId) {
    categoriaId = typeof producto.categoryId === 'object' ?
      producto.categoryId._id :
      producto.categoryId;
  } else {
    categoriaId = '';
  }

  productToEdit.value = {
    _id: producto._id,
    nombre: producto.nombre,
    descripcion: producto.descripcion,
    price: producto.price,
    stock: producto.stock,
    categoryId: categoriaId,
    marca: producto.marca || null,
    tipo: producto.tipo || null,
    images: [...(producto.images || [])]
  };

  editImagePreviews.value = [...(producto.images || [])];
  editImages.value = [];

  editDialog.value = true;
};

const handleEditProduct = async () => {
  loading.value = true;
  try {
    const formData = new FormData();
    formData.append('nombre', productToEdit.value.nombre);
    formData.append('marca', productToEdit.value.marca);
    formData.append('tipo', productToEdit.value.tipo);
    formData.append('descripcion', productToEdit.value.descripcion);
    formData.append('price', productToEdit.value.price);
    formData.append('categoryId', productToEdit.value.categoryId);
    formData.append('stock', productToEdit.value.stock);

    const existingUrls = editImagePreviews.value.filter(url =>
      typeof url === 'string' && url.startsWith('http')
    );

    existingUrls.forEach(url => {
      formData.append('existingImages', url);
    });

    editImages.value.forEach(file => {
      formData.append('images', file);
    });

    await putData(`/producto/id/${productToEdit.value._id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    $q.notify({ type: 'positive', message: 'Producto actualizado con éxito' });

    await fetchProductos();

    editDialog.value = false;
    productToEdit.value = null;
    editImages.value = [];
    editImagePreviews.value = [];
  } catch (err) {
    console.error(err);
    $q.notify({ type: 'negative', message: 'Error al actualizar producto' });
  } finally {
    loading.value = false;
  }
};

const handleAddProduct = async () => {
  loading.value = true;
  try {
    const formData = new FormData();
    formData.append('nombre', productName.value);
    formData.append('marca', productMarca.value);
    formData.append('tipo', productTipo.value);
    formData.append('descripcion', productDescription.value);
    formData.append('price', productPrice.value);
    formData.append('categoryId', categoryId.value);
    formData.append('stock', productStock.value);

    images.value.forEach(img => formData.append('images', img));

    await postData('/producto', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    $q.notify({ type: 'positive', message: 'Producto agregado con éxito' });
    dialog.value = false;

    // Limpiar campos del formulario después de agregar
    productName.value = '';
    productMarca.value = null;
    productTipo.value = null;
    productDescription.value = '';
    productPrice.value = '';
    productStock.value = '';
    categoryId.value = '';
    images.value = [];
    imagePreviews.value = [];
    imageNames.value = [];

    await fetchProductos();
  } catch (err) {
    console.error(err);
    $q.notify({ type: 'negative', message: 'Error al agregar producto' });
  } finally {
    loading.value = false;
  }
};

const removeImage = (index) => {
  imagePreviews.value.splice(index, 1);
  images.value.splice(index, 1);
  imageNames.value.splice(index, 1);
};

const removeEditImage = (index) => {
  editImagePreviews.value.splice(index, 1);
  if (index >= (productToEdit.value.images?.length || 0)) {
    editImages.value.splice(index - (productToEdit.value.images?.length || 0), 1);
  }
};

function handleSingleFileChange(event, index) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    if (!imagePreviews.value[index]) imagePreviews.value[index] = '';
    if (!imageNames.value[index]) imageNames.value[index] = '';
    if (!images.value[index]) images.value[index] = null;

    imagePreviews.value[index] = e.target.result;
    imageNames.value[index] = file.name;
    images.value[index] = file;
  };
  reader.readAsDataURL(file);
}

const handleSingleEditFileChange = (event, index) => {
  const file = event.target.files[0];
  if (!file) return;

  const imageUrl = URL.createObjectURL(file);

  if (!editImagePreviews.value[index]) editImagePreviews.value[index] = '';
  if (!editImages.value[index]) editImages.value[index] = null;

  editImages.value[index] = file;
  editImagePreviews.value[index] = imageUrl;
};

const cambiarEstado = async (producto) => {
  try {
    const nuevoEstado = producto.estado === 'activo' ? 'inactivo' : 'activo';

    const response = await putData(`/producto/${producto._id}/${nuevoEstado}`);

    if (response?.producto) {
      const index = productos.value.findIndex(p => p._id === producto._id);
      if (index !== -1) {
        const categoriaOriginal = productos.value[index].categoriaNombre;
        productos.value[index] = {
          ...response.producto,
          categoriaNombre: categoriaOriginal
        };
      }
      $q.notify({
        type: 'positive',
        message: `Producto ${nuevoEstado === 'activo' ? 'activado' : 'inactivado'} correctamente`
      });
    }
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al cambiar el estado del producto'
    });
    console.error('Error en la petición PUT:', error);
  }
};

onMounted(async () => {
  await fetchCategories();
  await fetchProductos();
});
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
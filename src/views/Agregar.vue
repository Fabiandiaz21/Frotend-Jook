<template>
  <div class="q-pa-md">

    <q-table title="Lista de Productos" :rows="productos" :columns="columnas" row-key="_id">

      <!-- Reemplazo del template v-slot:body-cell-acciones -->
      <template v-slot:body-cell-acciones="props">
        <q-td align="center">
          <div class="row no-wrap justify-center q-gutter-xs">
            <!-- Botón de editar más compacto -->
            <q-btn icon="edit" color="primary" dense size="sm" flat @click="openEditDialog(props.row)"
              class="q-px-xs" />

            <!-- Botón de activar/desactivar más compacto -->
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


    <q-page-sticky position="bottom-right" :offset="[20, 20]">
      <q-btn fab color="primary" icon="add" size="sm" @click="dialog = true" class="q-fab" style="z-index: 9999;" />
    </q-page-sticky>


    <!-- Modal para editar producto -->
    <q-dialog v-model="editDialog" :persistent="false">
      <q-card style="min-width: 500px; max-width: 90vw">
        <q-card-section class="row items-center justify-between">
          <div class="text-h6">Editar Producto</div>
        </q-card-section>

        <q-card-section>
          <q-form @submit.prevent="handleEditProduct">
            <q-input v-model="productToEdit.nombre" label="Nombre del Producto" outlined dense required />
            <q-input v-model="productToEdit.descripcion" label="Descripción" outlined dense required />
            <q-input v-model="productToEdit.price" label="Precio" type="number" outlined dense required />
            <q-select v-model="productToEdit.categoryId" :options="categories" label="Categoría" outlined dense
              emit-value map-options required />

            <q-input v-model="productToEdit.stock" label="Stock" type="number" outlined dense required />

            <!-- Imágenes en edición -->

            <div class="q-mt-md">
              <label class="text-subtitle2 text-primary q-mb-sm">Cambiar imágenes (máx. 4):</label>

              <!-- Botones individuales para subir imágenes -->
              <div class="q-gutter-sm row justify-center q-mt-sm">
                <div v-for="n in 4" :key="'edit-' + n">
                  <q-btn :label="'Imagen ' + n" color="primary" icon="cloud_upload"
                    @click="$refs['editImageInput' + n][0].click()" flat rounded />
                  <input :ref="'editImageInput' + n" type="file" accept="image/*" style="display: none"
                    @change="(e) => handleSingleEditFileChange(e, n - 1)" />
                </div>
              </div>

              <!-- Vista previa de imágenes en una cuadrícula de 2 columnas -->
              <div class="q-gutter-sm q-mt-sm">
                <div class="q-row q-col-gutter-md">
                  <div v-for="(img, i) in editImagePreviews" :key="i" class="q-col-6 q-pa-xs flex flex-center">
                    <div class="relative-position" style="width: 150px; height: 150px;">
                      <img :src="img" class="q-img rounded-borders shadow-2"
                        style="width: 150px; height: 150px; object-fit: cover; border-radius: 8px;" />

                      <!-- Botón eliminar en la esquina superior derecha -->
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


    <!-- Modal para agregar producto -->
    <q-dialog v-model="dialog" :persistent="false">
      <q-card style="min-width: 500px; max-width: 90vw">
        <q-card-section class="row items-center justify-between">
          <div class="text-h6">Agregar Producto</div>
        </q-card-section>

        <q-card-section>
          <q-form @submit.prevent="handleAddProduct">
            <q-input v-model="productName" label="Nombre del Producto" outlined dense required />
            <q-input v-model="productDescription" label="Descripción" outlined dense required />
            <q-input v-model="productPrice" label="Precio" type="number" outlined dense required />
            <q-select v-model="categoryId" :options="categories" label="Categoría" outlined dense emit-value map-options
              required />
            <q-input v-model="productStock" label="Stock" type="number" outlined dense required />

            <!-- Imágenes -->

            <div class="q-mt-sm">
              <label class="text-subtitle2 q-mb-sm text-primary">Seleccionar imágenes (hasta 4):</label>

              <!-- Botones individuales para subir imágenes -->
              <div class="q-gutter-sm row justify-center q-mt-sm">
                <div v-for="n in 4" :key="n">
                  <q-btn :label="'Imagen ' + n" color="primary" icon="cloud_upload"
                    @click="$refs['imageInput' + n][0].click()" flat rounded />
                  <input :ref="'imageInput' + n" type="file" accept="image/*" style="display: none"
                    @change="(e) => handleSingleFileChange(e, n - 1)" />
                </div>
              </div>

              <!-- Vista previa de imágenes -->
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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { postData, getData, putData } from '../Services/jook.js';

const $q = useQuasar();
const dialog = ref(false);

const productName = ref('');
const productDescription = ref('');
const productPrice = ref('');
const productStock = ref('');
const categoryId = ref('');
const categories = ref([]);
const images = ref([]);
const imagePreviews = ref([]);
const loading = ref(false);
const imageNames = ref([]);


const productToEdit = ref(null);  // Para almacenar el producto que se va a editar
const editDialog = ref(false);  // Para controlar la visibilidad del modal de edición

const editImages = ref([]);
const editImagePreviews = ref([]);


const openEditDialog = (producto) => {
  // Asegurarnos de manejar correctamente la referencia de categoría
  // El problema está aquí: el código no maneja correctamente la categoría
  let categoriaId;

  if (producto.categoryId) {
    categoriaId = typeof producto.categoryId === 'object' ?
      producto.categoryId._id :
      producto.categoryId;
  } else {
    categoriaId = ''; // Valor por defecto si no hay categoría
  }

  // Crear una copia profunda del producto para evitar modificar el original
  productToEdit.value = {
    _id: producto._id,
    nombre: producto.nombre,
    descripcion: producto.descripcion,
    price: producto.price,
    stock: producto.stock,
    categoryId: categoriaId,
    images: [...(producto.images || [])]
  };

  // Asignar imágenes previas
  editImagePreviews.value = [...(producto.images || [])];
  editImages.value = []; // Limpiar los archivos seleccionados anteriormente

  // Abrir el modal de edición
  editDialog.value = true;
};



const productos = ref([]);  // Array para almacenar los productos
const columnas = [
  { name: 'imagen', label: 'Imagen', field: 'imagen', align: 'center' },
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left' },
  { name: 'descripcion', label: 'Descripción', field: 'descripcion', align: 'left' },
  { name: 'categoriaNombre', label: 'Categoría', field: 'categoriaNombre', align: 'right' },
  { name: 'precio', label: 'Precio', field: 'price', align: 'right' },
  { name: 'stock', label: 'Stock', field: 'stock', align: 'right' },
  { name: 'acciones', label: 'Acciones', align: 'center', field: 'acciones' }  // Nueva columna

];

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

// Función para obtener los productos desde el servidor
const fetchProductos = async () => {
  try {
    const response = await getData('/producto');
    productos.value = response.map(producto => {
      return {
        ...producto,
        categoriaNombre: producto.categoryId?.name || 'Sin categoría'
      };
    });

  } catch (error) {
    $q.notify({ type: 'negative', message: 'Error al cargar productos' });
  }
};


const handleFileChange = (event) => {
  const files = event.target.files;
  if (files.length <= 4) {
    images.value = Array.from(files);  // Imágenes nuevas
    imagePreviews.value = Array.from(files).map(file => URL.createObjectURL(file));
  } else {
    $q.notify({ type: 'negative', message: 'Máximo 4 imágenes permitidas.' });
  }
};

const handleEditProduct = async () => {
  loading.value = true;
  try {
    const formData = new FormData();
    formData.append('nombre', productToEdit.value.nombre);
    formData.append('descripcion', productToEdit.value.descripcion);
    formData.append('price', productToEdit.value.price);
    formData.append('categoryId', productToEdit.value.categoryId);
    formData.append('stock', productToEdit.value.stock);

    // Agregar imágenes existentes que el usuario desea mantener
    const existingUrls = editImagePreviews.value.filter(url =>
      typeof url === 'string' && url.startsWith('http')
    );

    existingUrls.forEach(url => {
      formData.append('existingImages', url);
    });

    // Agregar nuevas imágenes
    editImages.value.forEach(file => {
      formData.append('images', file);
    });

    const updatedProduct = await putData(`/producto/${productToEdit.value._id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    // Actualizar el producto en el frontend
    const index = productos.value.findIndex(p => p._id === productToEdit.value._id);
    if (index !== -1) {
      productos.value[index] = {
        ...updatedProduct,
        categoriaNombre: updatedProduct.categoryId?.name || 'Sin categoría'
      };
    }

    $q.notify({ type: 'positive', message: 'Producto actualizado con éxito' });

    // Actualizar los productos después de editar
    await fetchProductos();

    // Limpiar el estado
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
    formData.append('descripcion', productDescription.value);
    formData.append('price', productPrice.value);
    formData.append('categoryId', categoryId.value);
    formData.append('stock', productStock.value);

    // Agregar imágenes
    images.value.forEach(img => formData.append('images', img));  // Asegúrate de que 'images' sea un array de archivos

    const newProduct = await postData('/producto', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    // Agregar el nuevo producto a la lista de productos
    productos.value.push({
      nombre: productName.value,
      descripcion: productDescription.value,
      price: productPrice.value,
      stock: productStock.value,
      images: newProduct.images,  // Asegúrate de recibir las URLs de las imágenes
    });

    $q.notify({ type: 'positive', message: 'Producto agregado con éxito' });
    dialog.value = false;
  } catch (err) {
    console.error(err);
    $q.notify({ type: 'negative', message: 'Error al agregar producto' });
  } finally {
    loading.value = false;
  }
};


const handleEditFileChange = (event) => {
  const files = Array.from(event.target.files);
  if (files.length + editImagePreviews.value.length > 4) {
    $q.notify({ type: 'negative', message: 'Máximo 4 imágenes permitidas.' });
    return;
  }

  editImages.value.push(...files);
  const newPreviews = files.map(file => URL.createObjectURL(file));
  editImagePreviews.value.push(...newPreviews);
};

const removeImage = (index) => {
  imagePreviews.value.splice(index, 1);
  images.value.splice(index, 1);
};


const removeEditImage = (index) => {
  editImagePreviews.value.splice(index, 1);
  // También quitar del arreglo de archivos si fue cargado recientemente
  if (index >= productToEdit.value.images?.length || !productToEdit.value.images) {
    editImages.value.splice(index - (productToEdit.value.images?.length || 0), 1);
  }
};


// Manejar archivo individual
function handleSingleFileChange(event, index) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    imagePreviews.value[index] = e.target.result;
    imageNames.value[index] = file.name;
  };
  reader.readAsDataURL(file);
}


const handleSingleEditFileChange = (event, index) => {
  const file = event.target.files[0];
  if (!file) return;

  const imageUrl = URL.createObjectURL(file);

  // Reemplaza en la posición correspondiente
  editImages.value[index] = file;
  editImagePreviews.value[index] = imageUrl;
};

const cambiarEstado = async (producto) => {
  try {
    const nuevoEstado = producto.estado === 'activo' ? 'inactivo' : 'activo';

    // Enviar la solicitud PUT para cambiar el estado
    const response = await putData(`/producto/${producto._id}/${nuevoEstado}`);

    if (response?.producto) {
      // Encuentra el índice del producto
      const index = productos.value.findIndex(p => p._id === producto._id);
      if (index !== -1) {
        // Mantener la categoría original mientras actualizamos el estado
        const categoriaOriginal = productos.value[index].categoriaNombre;

        // Actualizar el producto pero conservar el nombre de la categoría
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

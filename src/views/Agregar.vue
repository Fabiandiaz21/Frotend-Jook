<template>
    <div class="add-product-container">
      <h2>Agregar Producto</h2>
      <form @submit.prevent="handleAddProduct">
        <div class="form-group">
          <q-input v-model="productName" label="Nombre del Producto" outlined dense required />
        </div>
        <div class="form-group">
          <q-input v-model="productDescription" label="Descripción" outlined dense required />
        </div>
        <div class="form-group">
          <q-input v-model="productPrice" label="Precio" type="number" outlined dense required />
        </div>
        <div class="form-group">
          <q-select
            v-model="categoryId"
            :options="categories"
            label="Categoría"
            outlined
            dense
            required
          />
        </div>
        <div class="form-group">
          <q-input v-model="productStock" label="Stock" type="number" outlined dense required />
        </div>
  
        <!-- Sección para seleccionar imágenes -->
        <div class="form-group">
          <label for="images">Seleccionar imágenes (hasta 4):</label>
          <input
            id="images"
            type="file"
            multiple
            accept="image/*"
            @change="handleFileChange"
          />
          <div v-if="imagePreviews.length">
            <div v-for="(image, index) in imagePreviews" :key="index">
              <img :src="image" alt="Imagen previa" width="100" height="100" />
            </div>
          </div>
        </div>
  
        <q-btn type="submit" label="Agregar Producto" color="primary" :loading="loading" />
      </form>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import { postData } from '../Services/jook.js';
  import { useRouter } from 'vue-router';
  import { useQuasar } from 'quasar';
  import { getData } from '../Services/jook.js';
  
  const $q = useQuasar();
  const router = useRouter();
  
  const loading = ref(false);
  const productName = ref('');
  const productDescription = ref('');
  const productPrice = ref('');
  const productStock = ref('');
  const categoryId = ref('');
  const categories = ref([]); // Aquí irán las categorías disponibles
  const images = ref([]);  // Array para las imágenes
  const imagePreviews = ref([]);  // Para mostrar las imágenes previsualizadas
  
  const fetchCategories = async () => {
    try {
      const response = await getData('/categoria');
      categories.value = response.map(cat => ({
        label: cat.name, 
        value: cat._id
      }));
    } catch (error) {
      console.error('Error al cargar las categorías:', error);
      $q.notify({
        type: 'negative',
        message: 'Error al cargar las categorías',
        position: 'top-right'
      });
    }
  };
  
  const handleFileChange = (event) => {
    const files = event.target.files;
    if (files.length <= 4) {
      images.value = Array.from(files);
      imagePreviews.value = Array.from(files).map(file => URL.createObjectURL(file));
    } else {
      $q.notify({
        type: 'negative',
        message: 'Puedes seleccionar hasta 4 imágenes.',
        position: 'top-right'
      });
    }
  };
  
  const handleAddProduct = async () => {
    loading.value = true;
  
    try {
      // Crear el formulario de datos para el producto
      const formData = new FormData();
      formData.append('nombre', productName.value);
      formData.append('descripcion', productDescription.value);
      formData.append('price', productPrice.value);
      formData.append('categoryId', categoryId.value.value);  // Solo el valor de ObjectId
      formData.append('stock', productStock.value);
  
      // Agregar las imágenes al formData
      images.value.forEach((image, index) => {
        formData.append(`image${index + 1}`, image);  // Añadir cada imagen con nombre único
      });
  
      const response = await postData('/producto', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
  
      $q.notify({
        type: 'positive',
        message: 'Producto agregado con éxito',
        position: 'top-right'
      });
  
      router.push('/productos'); // Redirigir al listado de productos
    } catch (error) {
      console.error('Error al agregar el producto:', error);
      $q.notify({
        type: 'negative',
        message: 'Error al agregar el producto',
        position: 'top-right'
      });
    } finally {
      loading.value = false;
    }
  };
  
  fetchCategories();
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
  
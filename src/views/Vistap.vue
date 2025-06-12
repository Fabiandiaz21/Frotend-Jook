<template>
  <div v-if="loading">Cargando detalles del producto...</div>
  <div v-else-if="error">{{ error }}</div>
  <div v-else class="contenedor">
    <div class="producto">
      <div class="galeria">
        <div class="miniaturas">
          <img v-for="(img, i) in product?.images" :key="i" :src="img" @click="cambiarImagen(img, i)" />
        </div>
        <div class="imagen-principal">
          <img :src="imagenSeleccionada" v-if="imagenSeleccionada && product?.images?.length > 0"
            alt="Imagen principal del producto" />
          <div class="flecha izquierda" @click="imagenAnterior">&lt;</div>
          <div class="flecha derecha" @click="imagenSiguiente">&gt;</div>
        </div>
      </div>

      <div class="info" v-if="product">
        <h1>
          {{ product.nombre }}
          <q-badge
            v-if="product.oferta?.activa === true && product.precioOferta && product.precioOferta < product.price"
            color="red" class="q-ml-sm"> Oferta
          </q-badge>
        </h1>

        <p class="descripcion">{{ product.descripcion }}</p>
        <p class="ventas">Ventas: (próximamente) | Vendido por <strong>Jook</strong></p>
        <div class="etiqueta" v-if="product.categoryId">Categoría: {{ product.categoryId.name }}</div>

        <!-- Precio -->
        <div class="precio">
          <template
            v-if="product.oferta?.activa === true && product.oferta?.precioOferta !== undefined && product.oferta?.precioOferta !== null && parseFloat(product.oferta?.precioOferta) < product.price">
            <span class="actual text-red text-h5">
              ${{ formatNumberWithThousandsSeparator(product.oferta.precioOferta) }}
            </span>
            <span class="original text-grey text-strike q-ml-sm">
              ${{ formatNumberWithThousandsSeparator(product.price) }}
            </span>
          </template>

          <template v-else>
            <span class="actual">
              ${{ formatNumberWithThousandsSeparator(product.price) }}
            </span>
          </template>

          <template v-else>
            <span class="actual">${{ formatNumberWithThousandsSeparator(product.price) }}</span>
          </template>
        </div>

        <p class="envio" v-if="product.estado === 'activo'">✓ Producto disponible</p>

        <label v-if="product.subtipo">
          Subtipo:
          <input type="text" :value="product.subtipo" readonly />
        </label>

        <p>Disponibles: {{ product.stock }} unidades</p>
        <p v-if="product.marca?.nombre">Marca: {{ product.marca.nombre }}</p>
        <p v-if="product.tipo?.nombre">Tipo: {{ product.tipo.nombre }}</p>

        <!-- Botón de carrito -->
        <button class="boton-carrito" v-if="product.estado === 'activo'" @click="agregarAlCarrito">
          Añadir al carrito
        </button>
        <button class="boton-carrito" v-else disabled>Producto inactivo</button>

        <!-- Botón de favoritos -->
        <button v-if="authStore.token" class="boton-favorito" :class="{ favorito: esFavorito }" @click="toggleFavorito">
          <q-icon :name="esFavorito ? 'favorite' : 'favorite_border'" />
          {{ esFavorito ? 'Quitar de favoritos' : 'Agregar a favoritos' }}
        </button>

        <div class="detalle-envio" v-if="product.estado === 'activo'">
          <strong>✔ Envío disponible</strong>
          <p>El tiempo de entrega y los costos se calcularán al finalizar la compra.</p>
        </div>

        <div class="detalle">
          <strong>✔ Devoluciones sujetas a políticas</strong>
        </div>

        <div class="detalle">
          <strong>✔ Seguridad en las compras</strong>
          <p>- Opciones de pago seguro</p>
          <p>- Logística segura</p>
        </div>
      </div>

      <div v-else-if="loading">Cargando detalles del producto...</div>
      <div v-else-if="error">{{ error }}</div>
      <div v-else>
        <p>No se pudo cargar la información del producto.</p>
      </div>
    </div>

    <div class="resenas">
      <h3 class="titulo-resenas">Reseñas</h3>

      <div v-if="product?.reviews?.length" class="promedio-resenas">
        <div class="estrellas-promedio">
          <span v-for="n in 5" :key="n" class="estrella"
            :class="{ activa: n <= Math.round(promedioCalificaciones) }">★</span>
        </div>
        <div class="numero-promedio">{{ promedioCalificaciones }} / 5</div>
        <div class="cantidad-resenas">Basado en {{ product.reviews.length }} reseñas</div>
      </div>


      <!-- Lista de reseñas -->
      <div v-if="product?.reviews?.length > 0" class="lista-resenas">
        <div v-for="(review, i) in product.reviews" :key="review._id" class="review-card">
          <div class="review-header">
            <div class="usuario-info">
              <img v-if="review?.user?.profilePic" :src="review.user.profilePic"
                alt="Foto de perfil de {{ review.user?.name }}" class="profile-pic" />
              <strong class="nombre-usuario">{{ review?.user?.name || 'Anónimo' }}</strong>
            </div>
            <span class="estrellas">
              <span v-for="n in 5" :key="n" class="estrella" :class="{ activa: n <= review.rating }">★</span>
            </span>
            <button v-if="authStore.user?._id === review?.user?._id" @click="eliminarResena(review._id, i)"
              class="boton-eliminar">Eliminar</button>
          </div>
          <p class="comentario">{{ review.comment }}</p>
        </div>
      </div>
      <div v-else>
        <p class="sin-resenas">No hay reseñas disponibles para este producto.</p>
      </div>

      <!-- Formulario para agregar reseña -->
      <form @submit.prevent="enviarResena" class="formulario-resena">
        <h4>Agregar una reseña</h4>
        <textarea v-model="nuevaResena.comentario" placeholder="Escribe tu reseña" required></textarea>
        <div class="calificacion-estrellas">
          <span v-for="n in 5" :key="n" class="estrella-seleccionable"
            :class="{ activa: n <= nuevaResena.calificacion }" @click="nuevaResena.calificacion = n">★</span>
        </div>

        <button type="submit">Enviar reseña</button>
      </form>
    </div>


  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, reactive, computed } from 'vue';
import { useRoute } from 'vue-router';
import { getData, postData, deleteData } from '../services/jook';
import { useAuthStore } from '../Store/useAunt';
import { useCartStore } from '../Store/useCartStore';
import { useQuasar } from 'quasar';
import { cargarFavoritos, formatNumberWithThousandsSeparator } from '../utils/utils';

const route = useRoute();
const productId = ref(route.params.id);

const cartStore = useCartStore();
const cantidadSeleccionada = ref(1);
const product = ref(null);
const loading = ref(true);
const error = ref(null);
const imagenes = ref([]);
const imagenSeleccionada = ref('');
const indiceActual = ref(0);
const intervalo = ref(null);
const authStore = useAuthStore();
const nuevaResena = reactive({
  comentario: '',
  calificacion: null,
});

const $q = useQuasar(); // Usa el hook para acceder a la instancia de Quasar

const cargarProducto = async (id) => {
  loading.value = true;
  error.value = null;
  try {
    const response = await getData(`/producto/id/${id}`);
    console.log('Respuesta del servidor:', response);
    console.log('Oferta activa:', response.oferta?.activa);
    console.log('Precio de oferta:', response.precioOferta);
    console.log('Precio original:', response.price);

    product.value = response;
    loading.value = false;
    if (product.value && product.value.images) {
      imagenes.value = product.value.images;
      if (imagenes.value.length > 0) {
        imagenSeleccionada.value = imagenes.value[0];
        indiceActual.value = 0; // Resetear el índice al cargar un nuevo producto
      } else {
        imagenSeleccionada.value = '';
        indiceActual.value = 0;
      }
    } else {
      imagenes.value = [];
      imagenSeleccionada.value = '';
      indiceActual.value = 0;
    }
  } catch (err) {
    error.value = 'Error al cargar los detalles del producto.';
    loading.value = false;
    console.error('Error al cargar el producto:', err);
  }
};

const cambiarImagen = (img, index) => {
  imagenSeleccionada.value = img;
  indiceActual.value = index;
};

const imagenAnterior = () => {
  indiceActual.value =
    indiceActual.value > 0
      ? indiceActual.value - 1
      : imagenes.value.length - 1;
  imagenSeleccionada.value = imagenes.value[indiceActual.value];
};

const imagenSiguiente = () => {
  indiceActual.value =
    indiceActual.value < imagenes.value.length - 1
      ? indiceActual.value + 1
      : 0;
  imagenSeleccionada.value = imagenes.value[indiceActual.value];
};

const enviarResena = async () => {
  // Verifica la autenticación usando el estado del store
  if (!authStore.token) {
    $q.notify({
      type: 'warning',
      message: 'Debes iniciar sesión para agregar una reseña',
      position: 'top',
      timeout: 2500,
    });
    return;
  }

  // Validar la calificación
  if (nuevaResena.calificacion === null || nuevaResena.calificacion < 1 || nuevaResena.calificacion > 5) {
    $q.notify({
      type: 'warning',
      message: 'Por favor, califica el producto con un mínimo de 1 o un máximo de 5 estrellas.',
      position: 'top',
      timeout: 3000,
    });
    return; // Detener el envío si la calificación no es válida
  }

  try {
    const res = await postData(
      `/producto/resena/${product.value._id}`,
      {
        comment: nuevaResena.comentario,
        rating: nuevaResena.calificacion,
      },
      {
        headers: {
          Authorization: `Bearer ${authStore.token}`, // Usa el token del store
        },
      }
    );

    $q.notify({
      type: 'positive',
      message: 'Reseña enviada con éxito',
      position: 'top',
      timeout: 2000,
    });

    await cargarProducto(product.value._id);

    // Limpiar formulario
    nuevaResena.comentario = '';
    nuevaResena.calificacion = null;
  } catch (err) {
    $q.notify({
      type: 'negative',
      message: err.response?.data?.msg || 'Error al enviar la reseña',
      position: 'top',
      timeout: 3000,
    });
  }
};

const eliminarResena = async (reviewId, index) => {
  if (!authStore.token) {
    $q.notify({
      type: 'warning',
      message: 'Debes iniciar sesión para eliminar tu reseña.',
      position: 'top',
      timeout: 2500,
    });
    return;
  }

  $q.dialog({
    title: 'Confirmar eliminación',
    message: '¿Estás seguro de que deseas eliminar esta reseña?',
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      // Llamada al nuevo endpoint de eliminación
      const response = await deleteData(`/producto/${productId.value}/resena/${reviewId}`, {
        headers: {
          Authorization: `Bearer ${authStore.token}`,
        },
      });

      $q.notify({
        type: 'positive',
        message: 'Reseña eliminada con éxito.',
        position: 'top',
        timeout: 2000,
      });

      // Actualizar la lista de reseñas localmente
      if (product.value && product.value.reviews) {
        product.value.reviews.splice(index, 1);
        product.value.reviews = [...product.value.reviews];
      }
    } catch (error) {
      console.error('Error al eliminar la reseña:', error);
      $q.notify({
        type: 'negative',
        message: error.response?.data?.msg || 'Error al eliminar la reseña.',
        position: 'top',
        timeout: 3000,
      });
    }
  });
};

const esFavorito = ref(false);

// Verifica si el producto está en favoritos al cargar
const verificarFavorito = async () => {
  if (!authStore.token) return;
  try {
    const res = await getData('/usuario/favoritos', {
      headers: { Authorization: `Bearer ${authStore.token}` },
    });
    esFavorito.value = res.some(p => p._id === productId.value);
  } catch (err) {
    console.error('Error al verificar favoritos:', err);
  }
};

const toggleFavorito = async () => {
  if (!authStore.token) {
    $q.notify({
      type: 'warning',
      message: 'Debes iniciar sesión para usar favoritos',
    });
    return;
  }

  try {
    await postData(`/usuario/favoritos/${productId.value}`, {}, {
      headers: { Authorization: `Bearer ${authStore.token}` },
    });
    esFavorito.value = !esFavorito.value;
    $q.notify({
      type: 'positive',
      message: esFavorito.value ? 'Agregado a favoritos' : 'Quitado de favoritos',
    });
    cargarFavoritos()
  } catch (err) {
    console.error('Error al modificar favorito:', err);
    $q.notify({
      type: 'negative',
      message: 'Error al actualizar favoritos',
    });
  }
};

const promedioCalificaciones = computed(() => {
  if (!product.value?.reviews?.length) return 0;
  const total = product.value.reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
  return (total / product.value.reviews.length).toFixed(1); // por ejemplo, "4.3"
});

// === INICIO DE LA FUNCIÓN agregarAlCarrito CORREGIDA ===
const agregarAlCarrito = () => {
  // Validaciones antes de añadir al carrito
  if (!product.value) {
    $q.notify({
      type: 'negative',
      message: 'No se pudo cargar la información del producto.',
      position: 'top',
      timeout: 2000,
    });
    return;
  }

  if (product.value.estado !== 'activo') {
    $q.notify({
      type: 'warning',
      message: 'Este producto no está activo y no se puede añadir al carrito.',
      position: 'top',
      timeout: 2500,
    });
    return;
  }

  // Aseguramos que la cantidad seleccionada sea válida y no exceda el stock
  if (cantidadSeleccionada.value <= 0 || cantidadSeleccionada.value > product.value.stock) {
    let message = 'Por favor, selecciona una cantidad válida (mayor a 0).';
    if (cantidadSeleccionada.value > product.value.stock) {
      message = `No hay suficiente stock. Solo quedan ${product.value.stock} unidades.`;
    }
    $q.notify({
      type: 'warning',
      message: message,
      position: 'top',
      timeout: 3000,
    });
    return;
  }

  // Lógica para determinar el precio final (con o sin oferta)
  const tieneOfertaActiva = product.value.oferta?.activa === true &&
    product.value.oferta?.precioOferta !== undefined &&
    product.value.oferta?.precioOferta !== null &&
    parseFloat(product.value.oferta?.precioOferta) < product.value.price;


  const precioFinal = tieneOfertaActiva
    ? parseFloat(product.value.oferta.precioOferta)
    : product.value.price;


  // Agregar al carrito usando cartStore
  cartStore.addItem({
    id: product.value._id,
    nombre: product.value.nombre,
    precio: precioFinal, // ¡Aquí se usa el precio calculado, que puede ser el de oferta!
    imagen: product.value.images?.[0], // Primer imagen del array, con encadenamiento opcional
    cantidad: cantidadSeleccionada.value,
    stock: product.value.stock,
  });

  $q.notify({
    type: 'positive',
    message: 'Producto añadido al carrito!',
    position: 'top',
    timeout: 1500,
  });

  // Opcional: Reiniciar la cantidad seleccionada a 1 después de añadir
  cantidadSeleccionada.value = 1;
};
// === FIN DE LA FUNCIÓN agregarAlCarrito CORREGIDA ===


onMounted(() => {
  cargarProducto(productId.value);
  intervalo.value = setInterval(() => {
    imagenSiguiente();
  }, 4000);
  verificarFavorito();
});

onBeforeUnmount(() => {
  clearInterval(intervalo.value);
});

// Observar los cambios en el parámetro 'id' de la ruta
watch(() => route.params.id, (newId) => {
  productId.value = newId;
  cargarProducto(newId);
});
</script>




<style>
.contenedor {
  width: 100%;
}

.producto {
  display: flex;
  max-width: 1400px;
  margin: 40px auto;
  background: #6f4f29;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  padding: 20px;
  gap: 30px;
}

.galeria {
  display: flex;
  gap: 20px;
}

.miniaturas {
  background: #d6b697;
  padding: 40px;
  display: grid;
  grid-template-rows: repeat(4, 100px);
  gap: 80px;
  border-radius: 6px;
  height: auto;
  box-sizing: border-box;
}


.miniaturas img {
  width: 150px;
  height: 150px;
  flex-shrink: 0;
  object-fit: cover;
  border: 2px solid transparent;
  cursor: pointer;
  border-radius: 6px;
  transition: transform 0.2s ease;
}


.miniaturas img:hover {
  border-color: #3b2c1d;
}

.imagen-principal {
  position: relative;
  width: 500px;
  height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff8f2;
  border-radius: 10px;
  padding: 20px;
  margin-top: 100px;
}

.imagen-principal img {
  width: 100%;
  height: auto;
  object-fit: contain;
}

.flecha {
  position: absolute;
  font-size: 2.5em;
  color: #999;
  cursor: pointer;
  top: 50%;
  transform: translateY(-50%);
}

.flecha.izquierda {
  left: 10px;
}

.flecha.derecha {
  right: 10px;
}

.info {
  flex: 1;
  padding: 20px;
  background: #f9f3ec;
  border-radius: 10px;
  text-align: left;
}

.info h1 {
  font-size: 1.7em;
  margin-bottom: 10px;
}

.descripcion {
  font-size: 1em;
  margin-bottom: 15px;
}

.ventas {
  font-size: 0.9em;
  margin-bottom: 10px;
}

.etiqueta {
  background: #1d8348;
  color: white;
  padding: 5px 12px;
  font-size: 0.85em;
  display: inline-block;
  border-radius: 4px;
  margin-bottom: 15px;
}

.precio {
  font-size: 1.6em;
  margin-bottom: 10px;
}

.precio .anterior {
  text-decoration: line-through;
  font-size: 0.6em;
  margin-left: 10px;
  color: #666;
}

.precio .descuento {
  color: orange;
  font-size: 0.7em;
  margin-left: 10px;
}

.envio {
  color: orange;
  font-weight: bold;
  font-size: 0.9em;
  margin-bottom: 10px;
}

.info label {
  display: block;
  margin: 10px 0;
}

.info input,
.info select {
  margin-left: 10px;
  padding: 6px;
  border-radius: 4px;
  border: 1px solid #ccc;
}

.boton-carrito {
  background: #fbbf24;
  color: white;
  font-weight: bold;
  border: none;
  padding: 12px 24px;
  border-radius: 25px;
  cursor: pointer;
  margin-top: 15px;
}

.boton-carrito:hover {
  background: #f59e0b;
}

.detalle-envio,
.detalle {
  color: green;
  font-size: 0.9em;
  margin-top: 15px;
}


.resenas {
  margin-top: 2rem;
  padding: 1rem;
  background-color: #fafafa;
  border-radius: 10px;
}

.titulo-resenas {
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.lista-resenas {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.review-card {
  background-color: #fff;
  border-radius: 10px;
  padding: 1rem;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.nombre-usuario {
  font-weight: bold;
  color: #333;
  margin-bottom: 50px;
}

.estrellas {
  color: #ffc107;
  font-size: 1.2rem;
}

.estrella {
  opacity: 0.3;
  transition: opacity 0.3s;
}

.estrella.activa {
  opacity: 1;
}

.comentario {
  color: #555;
  font-size: 0.95rem;
}

.formulario-resena {
  background-color: #ffffff;
  border-radius: 10px;
  padding: 1rem;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.formulario-resena textarea {
  resize: vertical;
  min-height: 80px;
  padding: 0.5rem;
  border-radius: 5px;
  border: 1px solid #ddd;
}

.formulario-resena select {
  padding: 0.4rem;
  border-radius: 5px;
  border: 1px solid #ccc;
}

.formulario-resena button {
  background-color: #027be3;
  color: white;
  border: none;
  padding: 0.6rem;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.formulario-resena button:hover {
  background-color: #015bbf;
}

.sin-resenas {
  color: #666;
  font-style: italic;
}

.calificacion-estrellas {
  display: flex;
  gap: 0.4rem;
  font-size: 1.8rem;
  margin-bottom: 1rem;
  user-select: none;
}

.estrella-seleccionable {
  cursor: pointer;
  color: #ccc;
  transition: color 0.2s ease;
}

.estrella-seleccionable.activa {
  color: #ffc107;
}

.profile-pic {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 10px;
  object-fit: cover;
  border: solid black 2px;
}

.review-header {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
}

select {
  width: 100%;
  margin-bottom: 5px;
}

button {
  background-color: #2196f3;
  color: white;
  border: none;
  padding: 8px 16px;
  cursor: pointer;
  border-radius: 4px;
}

button:hover {
  background-color: #1769aa;
}


.boton-eliminar {
  background-color: #f44336;
  color: white;
  border: none;
  padding: 5px 10px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 0.8em;
  cursor: pointer;
  border-radius: 5px;
  margin-left: 10px;
}

.boton-eliminar:hover {
  background-color: #d32f2f;
}

.boton-favorito {
  margin-top: 10px;
  border: none;
  background-color: #f5f5f5;
  color: #e53935;
  padding: 8px 12px;
  font-weight: bold;
  cursor: pointer;
  border-radius: 6px;
}

.boton-favorito.favorito {
  background-color: #ffebee;
}


.promedio-resenas {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.estrellas-promedio .estrella {
  font-size: 1.4rem;
  color: #ccc;
}

.estrellas-promedio .estrella.activa {
  color: gold;
}

.numero-promedio {
  font-weight: bold;
}

.cantidad-resenas {
  font-size: 0.9rem;
  color: #555;
}
</style>
import { getData } from "../Services/jook";
import { useAuthStore } from "../Store/useAunt";
import { useQuasar } from 'quasar';

export function formatNumberWithThousandsSeparator(number) {
  let numStr = String(number);
  return numStr.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export function formatDate(date) {
  const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
  return new Date(date).toLocaleDateString('es-ES', options);
}

export async function cargarFavoritos() {
  const authStore = useAuthStore();
  const $q = useQuasar();

  try {
    const response = await getData('usuario/favoritos');
    console.log('Respuesta favoritos:', response);

    if (response && Array.isArray(response)) {
      authStore.favorites = response;
    } else {
      authStore.favorites = [];
      console.warn('La respuesta del servidor no es un array de productos válido.');
    }
    console.log('Favoritos cargados en Pinia:', authStore.favorites);

  } catch (error) {
    console.error('Error cargando favoritos:', error);
    $q.notify({
      type: 'negative',
      message: 'Ocurrió un error al cargar los favoritos.',
    });
  }
}



export function getPrecioInfo(product) {
  const tieneOferta =
    product?.oferta?.activa === true &&
    product?.oferta?.precioOferta !== undefined &&
    product?.oferta?.precioOferta !== null &&
    parseFloat(product.oferta.precioOferta) < product.price;

  return {
    precioFinal: tieneOferta ? parseFloat(product.oferta.precioOferta) : product.price,
    precioOriginal: product.price,
    tieneOferta
  };
}

<template>
  <div class="home">
    <q-layout view="hHh Lpr lFf">
      <q-page-container>
        <q-page class="q-pa-md">
          <div class="form-container">
            <h2 class="form-title">Finalizar Compra</h2>
            <div class="form-divider"></div>
            
            <q-form ref="checkoutFormRef" class="checkout-form">
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-6">
                  <h3 class="section-title">Información Personal</h3>
                  <q-input
                    v-model="form.nombre"
                    label="Nombre *"
                    :rules="[(val) => !!val || 'El nombre es requerido']"
                    outlined
                    class="form-input"
                    bg-color="grey-1"
                  />
                  <q-input
                    v-model="form.apellidos"
                    label="Apellidos *"
                    :rules="[(val) => !!val || 'Los apellidos son requeridos']"
                    outlined
                    class="form-input"
                    bg-color="grey-1"
                  />
                  <q-input
                    v-model="form.email"
                    label="Correo electrónico *"
                    type="email"
                    :rules="[
                      (val) => !!val || 'El correo electrónico es requerido',
                      (val) =>
                        /.+@.+\..+/.test(val) || 'Formato de email inválido',
                    ]"
                    outlined
                    class="form-input"
                    bg-color="grey-1"
                  />
                  <q-input
                    v-model="form.confirmarEmail"
                    label="Confirmar email *"
                    type="email"
                    :rules="[
                      (val) => !!val || 'La confirmación de email es requerida',
                      (val) =>
                        val === form.email ||
                        'Los correos electrónicos no coinciden',
                    ]"
                    outlined
                    class="form-input"
                    bg-color="grey-1"
                  />
                  <q-checkbox
                    v-model="form.aceptaPrivacidad"
                    label="He leído y aceptado la Política de Privacidad"
                    :rules="[
                      (val) =>
                        val === true || 'Debes aceptar la política de privacidad',
                    ]"
                    class="form-checkbox"
                    color="brown-6"
                  />
                </div>

                <div class="col-12 col-md-6">
                  <h3 class="section-title">Dirección de Envío</h3>
                  <q-input
                    v-model="form.dni"
                    label="DNI *"
                    :rules="[(val) => !!val || 'El DNI es requerido']"
                    outlined
                    class="form-input"
                    bg-color="grey-1"
                  />
                  <q-input
                    v-model="form.direccion"
                    label="Dirección *"
                    :rules="[(val) => !!val || 'La dirección es requerida']"
                    outlined
                    class="form-input"
                    bg-color="grey-1"
                  />
                  <q-select
                    v-model="form.pais"
                    :options="availableCountries"
                    label="País *"
                    emit-value
                    map-options
                    :rules="[(val) => !!val || 'El país es requerido']"
                    @update:model-value="onCountryChange"
                    outlined
                    class="form-input"
                    bg-color="grey-1"
                  />

                  <div class="row q-col-gutter-sm">
                    <div class="col-6">
                      <q-input
                        v-model="form.codigoPostal"
                        label="Código Postal"
                        :rules="[
                          (val) => !!val || 'El código postal es requerido',
                        ]"
                        outlined
                        class="form-input"
                        bg-color="grey-1"
                      />
                    </div>
                    <div class="col-6">
                      <q-select
                        v-model="form.provincia"
                        :options="availableProvinces"
                        label="Provincia *"
                        emit-value
                        map-options
                        :rules="[(val) => !!val || 'La provincia es requerida']"
                        @update:model-value="onProvinceChange"
                        :disable="!form.pais"
                        outlined
                        class="form-input"
                        bg-color="grey-1"
                      />
                    </div>
                  </div>
                  <q-select
                    v-model="form.ciudad"
                    :options="availableCities"
                    label="Ciudad *"
                    emit-value
                    map-options
                    :rules="[(val) => !!val || 'La ciudad es requerida']"
                    :disable="!form.provincia"
                    outlined
                    class="form-input"
                    bg-color="grey-1"
                  />
                  <q-input 
                    v-model="form.telefonoMovil" 
                    label="Teléfono móvil" 
                    outlined
                    class="form-input"
                    bg-color="grey-1"
                  />
                </div>
              </div>

              <q-card class="q-mt-md form-card">
                <q-card-section>
                  <q-checkbox
                    v-model="form.mismaDireccion"
                    label="Usar la misma dirección para la facturación"
                    class="form-checkbox"
                    color="brown-6"
                  />
                  <div v-if="!form.mismaDireccion" class="row q-col-gutter-md">
                    <div class="col-12 col-md-6">
                      <q-input
                        label="Empresa (opcional)"
                        v-model="form.empresa"
                        outlined
                        class="form-input"
                        bg-color="grey-1"
                      />
                      <q-input
                        label="Dirección de Facturación *"
                        v-model="form.direccionFacturacion"
                        :rules="[
                          (val) =>
                            form.mismaDireccion ||
                            !!val ||
                            'La dirección de facturación es requerida',
                        ]"
                        outlined
                        class="form-input"
                        bg-color="grey-1"
                      />
                    </div>
                  </div>
                </q-card-section>
              </q-card>

              <q-card class="q-mt-md form-card">
                <q-card-section>
                  <h3 class="section-title">Método de Envío y Pago</h3>
                  <q-radio
                    v-model="form.envio"
                    val="rapido"
                    label="Envío Rápido (700 - 2 a 5 días)"
                    class="form-radio"
                    color="brown-6"
                  />
                  <q-radio
                    v-model="form.pago"
                    val="tarjeta"
                    label="Tarjeta de crédito (Visa, MasterCard, Maestro)"
                    class="form-radio"
                    color="brown-6"
                  />
                </q-card-section>
              </q-card>

              <q-card class="q-mt-md form-card">
                <q-card-section>
                  <h3 class="section-title">Resumen del Pedido</h3>
                  <div
                    v-for="item in cartStore.items"
                    :key="item.id"
                    class="row justify-between order-item"
                  >
                    <div>
                      {{ item.nombre }}
                      <span v-if="item.cantidad">x{{ item.cantidad }}</span>
                    </div>
                    <div>{{ item.precio.toFixed(2) }}€</div>
                  </div>
                  <div class="row justify-between order-item">
                    <div>Envío</div>
                    <div>700€</div>
                  </div>
                  <q-separator class="order-separator" />
                  <div class="row justify-between order-total">
                    <div>Total</div>
                    <div>{{ (cartStore.totalPrice + 700).toFixed(2) }}€</div>
                  </div>
                </q-card-section>
              </q-card>

              <q-checkbox
                v-model="form.aceptaTerminos"
                label="Acepto los términos de servicio"
                class="q-mt-md form-checkbox"
                :rules="[
                  (val) =>
                    val === true || 'Debes aceptar los términos de servicio',
                ]"
                color="brown-6"
              />

              <div class="row justify-end q-gutter-sm q-mt-md">
                <div ref="paypalRef" class="q-ml-sm"></div>
              </div>
            </q-form>
          </div>
        </q-page>
      </q-page-container>
    </q-layout>
    <button class="carrito-btn" @click="irAlCarrito">🛒</button>
  </div>
</template>

<script setup>
// El script setup permanece exactamente igual que en tu código original
import { useCartStore } from "../Store/useCartStore";
import { useRouter } from "vue-router";
import { ref, onMounted, computed, watch } from "vue";
import { QLayout, QPageContainer, QPage, useQuasar } from "quasar";
import axios from 'axios';
import { Country, State, City } from 'country-state-city';

const cartStore = useCartStore();
const router = useRouter();
const $q = useQuasar();

const checkoutFormRef = ref(null);

const form = ref({
  nombre: "",
  apellidos: "",
  email: "",
  confirmarEmail: "",
  aceptaPrivacidad: false,
  aceptaTerminos: false,
  dni: "",
  direccion: "",
  pais: null,
  codigoPostal: "",
  provincia: null,
  ciudad: null,
  telefonoMovil: "",
  envio: "rapido",
  pago: "tarjeta",
  mismaDireccion: true,
  empresa: "",
  direccionFacturacion: "",
});

const paypalRef = ref(null);
const paymentStatus = ref('');
const paymentError = ref('');

const exchangeRateCOP_to_USD = 4000;
const GEOAPIFY_API_KEY = import.meta.env.VITE_GEOAPIFY_API_KEY;

const availableCountries = computed(() => {
  return Country.getAllCountries().map(c => ({
    label: c.name,
    value: c.isoCode
  }));
});

const availableProvinces = computed(() => {
  if (form.value.pais) {
    const states = State.getStatesOfCountry(form.value.pais);
    return states.map(s => ({
      label: s.name,
      value: s.isoCode
    }));
  }
  return [];
});

const availableCities = computed(() => {
  if (form.value.pais && form.value.provincia) {
    const cities = City.getCitiesOfState(form.value.pais, form.value.provincia);
    return cities.map(city => ({
      label: city.name,
      value: city.name
    }));
  }
  return [];
});

const onCountryChange = () => {
  form.value.provincia = null;
  form.value.ciudad = null;
  form.value.codigoPostal = "";
};

const onProvinceChange = () => {
  form.value.ciudad = null;
  form.value.codigoPostal = "";
};

const fetchPostalCode = async () => {
  if (form.value.pais && form.value.provincia && form.value.ciudad) {
    try {
      let query = `${form.value.ciudad}, ${form.value.provincia}, ${form.value.pais}`;
      if (form.value.direccion) {
        query = `${form.value.direccion}, ${query}`;
      }

      console.log('Consultando Geoapify con:', query);
      const response = await axios.get(`https://api.geoapify.com/v1/geocode/search`, {
        params: {
          text: query,
          apiKey: GEOAPIFY_API_KEY,
          lang: 'es',
          limit: 1
        }
      });

      const features = response.data.features;
      if (features && features.length > 0) {
        const firstResult = features[0].properties;
        const postalCode = firstResult.postcode;

        if (postalCode) {
          form.value.codigoPostal = postalCode;
          console.log('Código postal auto-rellenado:', postalCode);
        } else {
          form.value.codigoPostal = '';
          console.warn('Geoapify: No se encontró código postal para la ubicación.');
          $q.notify({
            message: "No se encontró código postal automáticamente. Por favor, ingréselo manualmente.",
            color: "info",
            textColor: "white",
            icon: "info",
          });
        }
      } else {
        form.value.codigoPostal = '';
        console.warn('Geoapify: No se encontraron resultados para la búsqueda.');
        $q.notify({
          message: "No se encontraron resultados para el código postal. Por favor, ingréselo manualmente.",
          color: "info",
          textColor: "white",
          icon: "info",
        });
      }
    } catch (error) {
      console.error('Error al obtener el código postal de Geoapify:', error);
      form.value.codigoPostal = '';
      $q.notify({
        message: "Error de red al obtener el código postal. Por favor, ingréselo manualmente.",
        color: "red-5",
        textColor: "white",
        icon: "error",
      });
    }
  } else {
    form.value.codigoPostal = "";
  }
};

watch(() => [form.value.ciudad, form.value.direccion], ([newCity, newAddress], [oldCity, oldAddress]) => {
  if ((newCity && newCity !== oldCity) || (newAddress && newAddress !== oldAddress)) {
    fetchPostalCode();
  } else if (!newCity && !newAddress) {
    form.value.codigoPostal = "";
  }
}, { deep: true });

const totalAmountCOP = computed(() => {
  const cartTotal = parseFloat(cartStore.totalPrice || 0);
  const shippingCost = 700;
  return (cartTotal + shippingCost);
});

const totalAmountUSD = computed(() => {
  const totalInUSD = totalAmountCOP.value / exchangeRateCOP_to_USD;
  return totalInUSD.toFixed(2);
});

const handleFormDataAndPaymentSuccess = () => {
  console.log("Datos del formulario para la orden:", form.value);
  $q.notify({
    message: "¡Orden procesada y pago completado! Información guardada.",
    color: "green-4",
    textColor: "white",
    icon: "cloud_done",
  });
};

const irAlCarrito = () => {
  router.push("/carrito");
};

const renderPayPalButtons = () => {
  if (!paypalRef.value) {
    console.error("No se encontró el elemento de referencia de PayPal.");
    return;
  }

  if (!window.paypal) {
    console.log("El SDK de PayPal aún no está disponible, reintentando renderizar en 300ms...");
    setTimeout(renderPayPalButtons, 300);
    return;
  }

  paypalRef.value.innerHTML = '';

  window.paypal
    .Buttons({
      style: {
        layout: "vertical",
        color: "gold",
        shape: "rect",
        label: "paypal",
        height: 45
      },
      createOrder: async (data, actions) => {
        const formIsValid = await checkoutFormRef.value.validate();

        if (!formIsValid) {
          $q.notify({
            message: "Por favor, completa todos los campos requeridos del formulario.",
            color: "red-5",
            textColor: "white",
            icon: "warning",
          });
          return actions.reject();
        }

        if (cartStore.items.length === 0) {
          $q.notify({
            message: "El carrito está vacío, no se puede realizar el pago.",
            color: "orange-5",
            textColor: "white",
            icon: "info",
          });
          return actions.reject();
        }

        const amountForBackend = totalAmountUSD.value;

        const itemsForBackend = cartStore.items.map(item => ({
            productId: item.id,
            name: item.nombre,
            quantity: item.cantidad,
            price: item.precio
        }));

        try {
          const response = await fetch('http://localhost:3200/api/payments/create-order', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              amount: amountForBackend,
              items: itemsForBackend,
              user: '654a9d7d4c9f1d002f8e4c7e',
              orderId: `ORDER-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              customerInfo: form.value
            }),
          });
          const order = await response.json();
          if (!response.ok) {
            throw new Error(order.error || 'Error al crear la orden de PayPal en el backend.');
          }
          return order.id;
        } catch (error) {
          console.error('Error al crear la orden de PayPal en el backend:', error);
          paymentError.value = 'Error al crear la orden de PayPal.';
          $q.notify({
            message: paymentError.value,
            color: "red-5",
            textColor: "white",
            icon: "error",
          });
          return actions.reject();
        }
      },
      onApprove: async (data, actions) => {
        paymentStatus.value = 'Procesando pago...';
        try {
          const response = await fetch('http://localhost:3200/api/payments/capture-order', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              orderID: data.orderID,
            }),
          });

          const result = await response.json();

          if (response.ok) {
            $q.notify({
              message: `¡Pago completado! ID: ${data.orderID}`,
              color: "green-4",
              textColor: "white",
              icon: "done",
            });
            console.log("Pago exitoso:", result);
            handleFormDataAndPaymentSuccess();
            cartStore.clearCart();
            router.push("/");
          } else {
            $q.notify({
              message: result.error || 'Error al completar el pago.',
              color: "red-5",
              textColor: "white",
              icon: "error",
            });
            console.error('Error al capturar el pago:', result);
          }
        } catch (error) {
          $q.notify({
            message: 'Error de red al completar el pago.',
            color: "red-5",
            textColor: "white",
            icon: "error",
          });
          console.error('Error de red al completar el pago:', error);
        }
      },
      onError: (err) => {
        console.error("Error en PayPal:", err);
        $q.notify({
          message: "Hubo un error con el pago de PayPal. Inténtalo de nuevo.",
          color: "red-5",
          textColor: "white",
          icon: "error",
        });
      },
      onCancel: (data) => {
        console.log("Pago de PayPal cancelado:", data);
        $q.notify({
          message: "El pago de PayPal fue cancelado.",
          color: "orange-5",
          textColor: "white",
          icon: "cancel",
        });
      },
    })
    .render(paypalRef.value);
};

onMounted(() => {
  if (window.paypal && window.paypal.Buttons) {
    renderPayPalButtons();
  } else {
    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=Ad_aU-6n4cARm5VnD-nBVwrxJXLH7ifet0ddAMxcAaBZyQ1k-XZinYdo3P61-h9ErwzzjCbTQNi-MPoU&currency=USD&vault=true&intent=capture&enable-funding=paylater`;
    script.onload = renderPayPalButtons;
    document.head.appendChild(script);
  }
});
</script>

<style scoped>
.home {
  background-color: #f5f5f0;
  min-height: 100vh;
}

.form-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.form-title {
  color: #5d4037;
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 1rem;
  text-align: center;
}

.form-divider {
  height: 2px;
  background: linear-gradient(to right, transparent, #8d6e63, transparent);
  margin: 1.5rem 0;
}

.section-title {
  color: #5d4037;
  font-size: 1.2rem;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #d7ccc8;
}

.form-input {
  margin-bottom: 1rem;
}

.form-input :deep(.q-field__label) {
  color: #5d4037;
}

.form-input :deep(.q-field__control) {
  border-radius: 4px;
}

.form-input :deep(.q-field__control:before) {
  border-color: #bcaaa4;
}

.form-input :deep(.q-field__control:hover:before) {
  border-color: #8d6e63;
}

.form-checkbox :deep(.q-checkbox__inner) {
  color: #8d6e63;
}

.form-radio :deep(.q-radio__inner) {
  color: #8d6e63;
}

.form-card {
  border-radius: 8px;
  border: 1px solid #d7ccc8;
  box-shadow: none;
}

.order-item {
  padding: 0.5rem 0;
  color: #5d4037;
}

.order-separator {
  margin: 1rem 0;
  background-color: #d7ccc8;
}

.order-total {
  font-weight: 600;
  font-size: 1.1rem;
  color: #5d4037;
  padding: 0.5rem 0;
}

.carrito-btn {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: #6d4c41;
  color: white;
  border: none;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  font-size: 24px;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.carrito-btn:hover {
  background-color: #5d4037;
  transform: scale(1.1);
}

/* Estilos responsivos */
@media (max-width: 768px) {
  .form-container {
    padding: 1rem;
  }
  
  .form-title {
    font-size: 1.5rem;
  }
}
</style>
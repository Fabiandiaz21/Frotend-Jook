<template>
  <div class="home">
    <q-layout view="hHh Lpr lFf">
      <q-page-container>
        <q-page class="q-pa-md">
          <q-form @submit.prevent="submitForm">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-input v-model="form.nombre" label="Nombre *" required />
                <q-input
                  v-model="form.apellidos"
                  label="Apellidos *"
                  required
                />
                <q-input
                  v-model="form.email"
                  label="Correo electrónico *" 
                  type="email"
                  required
                />
                <q-input
                  v-model="form.confirmarEmail"
                  label="Confirmar email *"
                  type="email"
                  required
                />
                <q-checkbox
                  v-model="form.aceptaPrivacidad"
                  label="He leído y aceptado la Política de Privacidad"
                  required
                />
              </div>

              <div class="col-12 col-md-6">
                <q-input v-model="form.dni" label="DNI *" required />
                <q-input
                  v-model="form.direccion"
                  label="Dirección *"
                  required
                />
                <q-select
                  v-model="form.pais"
                  :options="paises"
                  label="País *"
                />
                <div class="row q-col-gutter-sm">
                  <div class="col-6">
                    <q-input
                      v-model="form.codigoPostal"
                      label="Código Postal"
                    />
                  </div>
                  <div class="col-6">
                    <q-input
                      v-model="form.provincia"
                      label="Provincia *"
                      required
                    />
                  </div>
                </div>
                <q-input v-model="form.ciudad" label="Ciudad *" required />
                <q-input v-model="form.telefonoMovil" label="Teléfono móvil" />
              </div>
            </div>

            <q-card class="q-mt-md">
              <q-card-section>
                <q-checkbox
                  v-model="form.mismaDireccion"
                  label="Usar la misma dirección para la facturación"
                />
                <div v-if="!form.mismaDireccion" class="row q-col-gutter-md">
                  <div class="col-12 col-md-6">
                    <q-input
                      label="Empresa (opcional)"
                      v-model="form.empresa"
                    />
                    <q-input
                      label="Dirección de Facturación"
                      v-model="form.direccionFacturacion"
                    />
                  </div>
                </div>
              </q-card-section>
            </q-card>

            <q-card class="q-mt-md">
              <q-card-section>
                <q-radio
                  v-model="form.envio"
                  val="rapido"
                  label="Envío Rápido (7,00€ - 2 a 5 días)"
                />
                <q-radio
                  v-model="form.pago"
                  val="tarjeta"
                  label="Tarjeta de crédito (Visa, MasterCard, Maestro)"
                />
              </q-card-section>
            </q-card>

            <q-card class="q-mt-md">
              <q-card-section>
                <div
                  v-for="item in cartStore.items"
                  :key="item.id"
                  class="row justify-between"
                >
                  <div>
                    {{ item.nombre }}
                    <span v-if="item.cantidad">x{{ item.cantidad }}</span>
                  </div>
                  <div>{{ item.precio.toFixed(2) }}€</div>
                </div>
                <div class="row justify-between">
                  <div>Envío</div>
                  <div>7,00 €</div>
                </div>
                <q-separator />
                <div class="row justify-between text-bold">
                  <div>Total</div>
                  <div>{{ (cartStore.totalPrice + 7).toFixed(2) }} €</div>
                </div>
              </q-card-section>
            </q-card>

            <q-checkbox
              v-model="form.aceptaTerminos"
              label="Acepto los términos de servicio"
              class="q-mt-md"
              required
            />

            <div class="row justify-end q-gutter-sm q-mt-md">
              <q-btn
                label="Guardar información"
                color="primary"
                type="submit"
              />
              <div ref="paypalRef" class="q-ml-sm"></div>
            </div>
          </q-form>
        </q-page>
      </q-page-container>
    </q-layout>
    <button class="carrito-btn" @click="irAlCarrito">🛒</button>
  </div>
</template>

<script setup>
import { useCartStore } from "../Store/useCartStore";
import { useRouter } from "vue-router";
import { ref, onMounted } from "vue";
import { QLayout, QPageContainer, QPage, useQuasar } from "quasar"; // Importa useQuasar

const cartStore = useCartStore();
const router = useRouter();
const $q = useQuasar(); // Instancia de Quasar para notificaciones

const form = ref({
  nombre: "",
  apellidos: "",
  email: "",
  confirmarEmail: "",
  aceptaPrivacidad: false,
  aceptaTerminos: false,
  dni: "",
  direccion: "",
  pais: "España",
  codigoPostal: "",
  provincia: "",
  ciudad: "",
  telefonoMovil: "",
  envio: "rapido",
  pago: "tarjeta",
  mismaDireccion: true,
  empresa: "",
  direccionFacturacion: "",
});

const paises = ["España", "Portugal", "Francia"];

const paypalRef = ref(null); // Referencia al div donde se renderizarán los botones de PayPal

const submitForm = () => {
  console.log("Guardado:", form.value);
  $q.notify({
    message: "Información guardada correctamente.",
    color: "green-4",
    textColor: "white",
    icon: "cloud_done",
  });
};

const irAlCarrito = () => {
  router.push("/carrito");
};



// Función para renderizar los botones de PayPal
const renderPayPalButtons = () => {
  if (!paypalRef.value) {
    console.error("PayPal reference element not found.");
    return;
  }

  // Ensure PayPal SDK is loaded
  if (!window.paypal) {
    console.log("PayPal SDK not yet available, retrying render in 300ms...");
    setTimeout(renderPayPalButtons, 300); // Retry after a short delay
    return;
  }

  // Clear previous buttons to prevent duplicates if function is called multiple times
  paypalRef.value.innerHTML = '';

  window.paypal
    .Buttons({
      style: {
        layout: "vertical",
        color: "blue",
        shape: "rect",
        label: "paypal",
      },
      createOrder: (data, actions) => {
        // Form validation before creating the PayPal order
        if (!form.value.aceptaPrivacidad || !form.value.aceptaTerminos) {
          $q.notify({
            message: "Debes aceptar los términos y la política de privacidad.",
            color: "red-5",
            textColor: "white",
            icon: "warning",
          });
          return actions.reject(); // Reject order creation
        }

        if (form.value.email !== form.value.confirmarEmail) {
          $q.notify({
            message: "Los correos electrónicos no coinciden.",
            color: "red-5",
            textColor: "white",
            icon: "warning",
          });
          return actions.reject(); // Reject order creation
        }

        if (cartStore.items.length === 0) {
          $q.notify({
            message: "El carrito está vacío, no se puede realizar el pago.",
            color: "orange-5",
            textColor: "white",
            icon: "info",
          });
          return actions.reject(); // Reject order creation
        }

        const totalAmount = (cartStore.totalPrice + 7).toFixed(2);
        return actions.order.create({
          purchase_units: [
            {
              amount: {
                value: totalAmount,
                currency_code: "EUR",
              },
            },
          ],
        });
      },
      onApprove: async (data, actions) => {
        try {
          const details = await actions.order.capture();
          $q.notify({
            message: `¡Pago completado! ID: ${details.id}`,
            color: "green-4",
            textColor: "white",
            icon: "done",
          });
          console.log("Pago exitoso:", details);
          cartStore.clearCart(); // Clear the cart after successful payment
          router.push("/gracias"); // Redirect to a thank you page
        } catch (error) {
          console.error("Error al capturar el pago:", error);
          $q.notify({
            message: "Error al procesar el pago. Por favor, inténtalo de nuevo.",
            color: "red-5",
            textColor: "white",
            icon: "error",
          });
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
    .render(paypalRef.value); // Render buttons into the specific div
};

onMounted(async () => {
  try {
    renderPayPalButtons();
  } catch (error) {
    console.error("Failed to load PayPal SDK:", error);
    $q.notify({
      message: "No se pudo cargar el sistema de pago de PayPal. Por favor, recarga la página.",
      color: "negative",
      textColor: "white",
      icon: "signal_wifi_off",
    });
  }
});

// The 'comprar' function is no longer needed since PayPal buttons handle the click directly
// You can remove it or keep it for other payment methods if you plan to add them.
// For now, I've commented it out as it's not relevant to the PayPal integration approach.
/*
const comprar = () => {
  // This logic is now handled within the createOrder callback of PayPal Buttons
  // and the PayPal buttons are clicked by the user directly.
  alert(
    "Por favor, utiliza los botones de PayPal que aparecen para completar la compra."
  );
};
*/
</script>

<style scoped>
/* Tus estilos existentes aquí */
.carrito-btn {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: #007bff; /* Ejemplo de color */
  color: white;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  z-index: 1000; /* Asegúrate de que esté por encima de otros elementos */
}
</style>

<style scoped>
/* Tus estilos existentes se mantienen igual */
* {
  margin: 0;
  box-sizing: border-box;
}

html,
body {
  font-family: Arial, sans-serif;
  background-color: #fff;
}

/* ... (el resto de tus estilos permanecen igual) ... */

.carrito-btn {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: #8b4513;
  color: white;
  border: none;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  font-size: 24px;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  transition: transform 0.2s;
  z-index: 1000; /* Asegura que esté por encima de otros elementos */
}

.carrito-btn:hover {
  transform: scale(1.1);
  background-color: #a0522d;
}
</style>

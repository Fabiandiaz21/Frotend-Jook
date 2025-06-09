<template>
  <div class="home">
    <q-layout view="hHh Lpr lFf">
      <q-page-container>
        <q-page class="q-pa-md">
          <div class="form-header q-mb-lg">
            <h2 class="text-h4 text-brown-8">Finalizar Compra</h2>
            <p class="text-brown-6">Complete sus datos para procesar su pedido</p>
          </div>
          
          <q-form @submit.prevent="submitForm" class="checkout-form">
            <div class="row q-col-gutter-md">
              <!-- Columna izquierda - Datos personales -->
              <div class="col-12 col-md-6">
                <q-card class="form-section">
                  <q-card-section>
                    <div class="section-title">Información Personal</div>
                    
                    <q-input 
                      v-model="form.nombre" 
                      label="Nombre *" 
                      required
                      color="brown-7"
                      class="q-mb-sm"
                      outlined
                    />
                    <q-input
                      v-model="form.apellidos"
                      label="Apellidos *"
                      required
                      color="brown-7"
                      class="q-mb-sm"
                      outlined
                    />
                    <q-input
                      v-model="form.email"
                      label="Correo electrónico *" 
                      type="email"
                      required
                      color="brown-7"
                      class="q-mb-sm"
                      outlined
                    />
                    <q-input
                      v-model="form.confirmarEmail"
                      label="Confirmar email *"
                      type="email"
                      required
                      color="brown-7"
                      class="q-mb-sm"
                      outlined
                    />
                    <q-input 
                      v-model="form.dni" 
                      label="DNI *" 
                      required
                      color="brown-7"
                      class="q-mb-sm"
                      outlined
                    />
                    <q-input
                      v-model="form.telefonoMovil" 
                      label="Teléfono móvil"
                      color="brown-7"
                      class="q-mb-sm"
                      outlined
                    />
                    
                    <q-checkbox
                      v-model="form.aceptaPrivacidad"
                      label="He leído y aceptado la Política de Privacidad"
                      required
                      color="brown-7"
                      class="q-mt-md"
                    />
                  </q-card-section>
                </q-card>
              </div>

              <!-- Columna derecha - Dirección -->
              <div class="col-12 col-md-6">
                <q-card class="form-section">
                  <q-card-section>
                    <div class="section-title">Dirección de Envío</div>
                    
                    <q-input
                      v-model="form.direccion"
                      label="Dirección *"
                      required
                      color="brown-7"
                      class="q-mb-sm"
                      outlined
                    />
                    <q-select
                      v-model="form.pais"
                      :options="paises"
                      label="País *"
                      color="brown-7"
                      class="q-mb-sm"
                      outlined
                    />
                    <div class="row q-col-gutter-sm">
                      <div class="col-6">
                        <q-input
                          v-model="form.codigoPostal"
                          label="Código Postal"
                          color="brown-7"
                          class="q-mb-sm"
                          outlined
                        />
                      </div>
                      <div class="col-6">
                        <q-input
                          v-model="form.provincia"
                          label="Provincia *"
                          required
                          color="brown-7"
                          class="q-mb-sm"
                          outlined
                        />
                      </div>
                    </div>
                    <q-input 
                      v-model="form.ciudad" 
                      label="Ciudad *" 
                      required
                      color="brown-7"
                      class="q-mb-sm"
                      outlined
                    />
                  </q-card-section>
                </q-card>

                <!-- Facturación -->
                <q-card class="form-section q-mt-md">
                  <q-card-section>
                    <div class="section-title">Dirección de Facturación</div>
                    
                    <q-checkbox
                      v-model="form.mismaDireccion"
                      label="Usar la misma dirección para la facturación"
                      color="brown-7"
                    />
                    <div v-if="!form.mismaDireccion" class="row q-col-gutter-md q-mt-sm">
                      <div class="col-12">
                        <q-input
                          label="Empresa (opcional)"
                          v-model="form.empresa"
                          color="brown-7"
                          class="q-mb-sm"
                          outlined
                        />
                        <q-input
                          label="Dirección de Facturación"
                          v-model="form.direccionFacturacion"
                          color="brown-7"
                          class="q-mb-sm"
                          outlined
                        />
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </div>
            </div>

            <!-- Método de envío y pago -->
            <q-card class="form-section q-mt-md">
              <q-card-section>
                <div class="section-title">Método de Envío</div>
                <q-radio
                  v-model="form.envio"
                  val="rapido"
                  label="Envío Rápido (7,00€ - 2 a 5 días)"
                  color="brown-7"
                  class="q-mb-sm"
                />
                
                <div class="section-title q-mt-md">Método de Pago</div>
                <q-radio
                  v-model="form.pago"
                  val="tarjeta"
                  label="Tarjeta de crédito (Visa, MasterCard, Maestro)"
                  color="brown-7"
                />
              </q-card-section>
            </q-card>

            <!-- Resumen del pedido -->
            <q-card class="form-section q-mt-md">
              <q-card-section>
                <div class="section-title">Resumen del Pedido</div>
                
                <div class="order-summary">
                  <div 
                    v-for="item in cartStore.items"
                    :key="item.id"
                    class="order-item row justify-between q-pa-xs"
                  >
                    <div class="item-name">
                      {{ item.nombre }}
                      <span v-if="item.cantidad" class="text-brown-6">x{{ item.cantidad }}</span>
                    </div>
                    <div class="item-price">{{ item.precio.toFixed(2) }}€</div>
                  </div>
                  
                  <q-separator class="q-my-sm" />
                  
                  <div class="order-item row justify-between q-pa-xs">
                    <div class="text-weight-medium">Envío</div>
                    <div>7,00 €</div>
                  </div>
                  
                  <q-separator class="q-my-sm" />
                  
                  <div class="order-total row justify-between q-pa-xs">
                    <div class="text-weight-bold">Total</div>
                    <div class="text-weight-bold">{{ (cartStore.totalPrice + 7).toFixed(2) }} €</div>
                  </div>
                </div>
              </q-card-section>
            </q-card>

            <!-- Términos y condiciones -->
            <q-card class="form-section q-mt-md">
              <q-card-section>
                <q-checkbox
                  v-model="form.aceptaTerminos"
                  label="Acepto los términos de servicio"
                  required
                  color="brown-7"
                />
              </q-card-section>
            </q-card>

            <!-- Botones de acción -->
            <div class="row justify-between items-center q-mt-lg">
              <q-btn
                label="Volver al carrito"
                color="brown-4"
                flat
                @click="irAlCarrito"
                class="q-mr-sm"
              />
              
              <div class="action-buttons">
                <q-btn
                  label="Guardar información"
                  color="brown-7"
                  type="submit"
                  class="q-mr-sm"
                />
                <div ref="paypalRef"></div>
              </div>
            </div>
          </q-form>
        </q-page>
      </q-page-container>
    </q-layout>
    
    <button class="carrito-btn" @click="irAlCarrito">
      <q-icon name="shopping_cart" size="24px" />
    </button>
  </div>
</template>

<script setup>
import { useCartStore } from "../Store/useCartStore";
import { useRouter } from "vue-router";
import { ref, onMounted } from "vue";
import { QLayout, QPageContainer, QPage, useQuasar } from "quasar";
import { getData } from "../Services/jook";

const cartStore = useCartStore();
const router = useRouter();
const $q = useQuasar();

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
const paypalRef = ref(null);

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

const renderPayPalButtons = () => {
  if (!paypalRef.value) {
    console.error("PayPal reference element not found.");
    return;
  }

  if (!window.paypal) {
    console.log("PayPal SDK not yet available, retrying render in 300ms...");
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
        height: 45,
      },
      createOrder: (data, actions) => {
        if (!form.value.aceptaPrivacidad || !form.value.aceptaTerminos) {
          $q.notify({
            message: "Debes aceptar los términos y la política de privacidad.",
            color: "red-5",
            textColor: "white",
            icon: "warning",
          });
          return actions.reject();
        }

        if (form.value.email !== form.value.confirmarEmail) {
          $q.notify({
            message: "Los correos electrónicos no coinciden.",
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
          console.log("Pago exitoso:", details)

          async function saveOrder() {
            try {
              const response = await getData("")
            } catch (error) {
              
            }
            console.log("Guardando la orden en la base de datos...");
            return new Promise((resolve) => setTimeout(resolve, 1000));
          }
          cartStore.clearCart(); 
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
    .render(paypalRef.value);
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
</script>

<style scoped>
.home {
  background-color: #f9f5f0;
  min-height: 100vh;
}

.form-header {
  text-align: center;
  padding: 20px 0;
  border-bottom: 1px solid #e0d6cc;
  margin-bottom: 20px;
}

.checkout-form {
  max-width: 1200px;
  margin: 0 auto;
}

.form-section {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(139, 69, 19, 0.1);
  border: 1px solid #e0d6cc;
  background-color: #fff;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #5d4037;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #efebe9;
}

.order-summary {
  background-color: #faf6f2;
  border-radius: 6px;
  padding: 8px;
}

.order-item {
  transition: background-color 0.2s;
}

.order-item:hover {
  background-color: #f0e6dc;
}

.order-total {
  background-color: #efebe9;
  border-radius: 4px;
}

.item-name {
  color: #5d4037;
}

.item-price {
  font-weight: 500;
  color: #6d4c41;
}

.action-buttons {
  display: flex;
  align-items: center;
}

.carrito-btn {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: #6d4c41;
  color: white;
  border: none;
  border-radius: 50%;
  width: 56px;
  height: 56px;
  font-size: 24px;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.carrito-btn:hover {
  background-color: #5d4037;
  transform: scale(1.1);
}

/* Estilos para los inputs y selects */
.q-field--outlined .q-field__control {
  border-radius: 4px;
}

.q-field--outlined .q-field__control:before {
  border-color: #d7ccc8;
}

.q-field--outlined:hover .q-field__control:before {
  border-color: #a1887f;
}

/* Estilos para los radios y checkboxes */
.q-radio__inner, .q-checkbox__inner {
  color: #8d6e63;
}

.q-radio__inner--truthy, .q-checkbox__inner--truthy {
  color: #6d4c41;
}

/* Estilos para los botones */
.q-btn.bg-brown-7 {
  background: #6d4c41;
  color: white;
}

.q-btn.bg-brown-7:hover {
  background: #5d4037;
}

.q-btn.bg-brown-4 {
  background: #d7ccc8;
  color: #5d4037;
}

.q-btn.bg-brown-4:hover {
  background: #bcaaa4;
}
</style>
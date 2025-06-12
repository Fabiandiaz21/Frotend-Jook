<template>
  <div class="cart-container">
    <h1>Tu Carrito de Compras</h1>

    <div v-if="cartStore.items.length === 0" class="empty-cart-message">
      <p>Tu carrito está vacío. ¡Empieza a añadir productos!</p>
      <router-link to="/productos">Ir a la tienda</router-link>
    </div>

    <div v-else class="cart-layout">
      <div class="products-container">
        <div class="cart-items-container">
          <div v-for="item in cartStore.items" :key="item.id" class="cart-item">
            <div class="item-left-section">
              <img :src="item.imagen" alt="Imagen del producto" class="item-image" />
            </div>
            <div class="item-right-section">
              <div class="item-info">
                <h3>{{ item.nombre }}</h3>
                <p>Precio: ${{ formatNumberWithThousandsSeparator (item.precio.toFixed(2) )}}</p>
                <p>Subtotal: ${{formatNumberWithThousandsSeparator  ((item.precio * item.cantidad).toFixed(2)) }}</p>
              </div>
              <div class="item-controls">
                <div class="item-quantity-control">
                  <button @click="cartStore.decrementItem(item.id)">-</button>
                  <span>{{ item.cantidad }}</span>
                  <button @click="cartStore.incrementItem(item.id)" :disabled="item.cantidad >= item.stock">+</button>
                </div>
                <button @click="cartStore.removeItem(item.id)" class="remove-item-button">Eliminar</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="summary-container">
        <div class="cart-summary">
          <h2>Resumen del Carrito</h2>
          <p>Total de ítems: {{ cartStore.totalItems }}</p>
          <p class="total-price">Total a pagar: <strong>${{ formatNumberWithThousandsSeparator (cartStore.totalPrice.toFixed(2) )}}</strong></p>
          <q-btn class="checkout-button" to="/formularioCompra/">Proceder al pago</q-btn>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useCartStore } from '../Store/useCartStore';
import { formatNumberWithThousandsSeparator, getPrecioInfo } from '../utils/utils.js';


const cartStore = useCartStore();
</script>

<style scoped>
.cart-container {
  width: 95%;
  max-width: 1400px;
  margin: 20px auto;
  padding: 30px;
  background-color: #F5F0E6;
  border-radius: 12px;
  box-shadow: 0 6px 12px rgba(101, 67, 33, 0.15);
  border: 1px solid #D2B48C;
  min-height: 80vh;
}

h1 {
  text-align: center;
  color: #5D4037;
  margin-bottom: 30px;
  font-size: 2.2em;
  border-bottom: 2px solid #8D6E63;
  padding-bottom: 10px;
}

.empty-cart-message {
  text-align: center;
  padding: 50px;
  border: 2px dashed #BCAAA4;
  border-radius: 12px;
  background-color: #EFEBE9;
}

.empty-cart-message p {
  font-size: 1.2em;
  color: #5D4037;
  margin-bottom: 25px;
}

.empty-cart-message a {
  display: inline-block;
  padding: 12px 25px;
  background-color: #6D4C41;
  color: #EFEBE9;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.3s ease;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(93, 64, 55, 0.2);
}

.empty-cart-message a:hover {
  background-color: #5D4037;
  transform: translateY(-2px);
}

.cart-layout {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 40px;
  position: relative;
}

.products-container {
  background-color: #FFF8F0;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 3px 6px rgba(141, 110, 99, 0.1);
}

.summary-container {
  position: sticky;
  top: 200px;
  align-self: start;
  background-color: #EFEBE9;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 3px 6px rgba(141, 110, 99, 0.1);
  border: 1px solid #D2B48C;
  height: fit-content;
  transition: top 0.1s ease;
}

.cart-items-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.cart-item {
  display: flex;
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(141, 110, 99, 0.1);
  border-left: 5px solid #A1887F;
  transition: transform 0.3s ease;
}

.cart-item:hover {
  transform: translateY(-3px);
}

.item-left-section {
  flex: 1;
  display: flex;
  justify-content: center;
}

.item-image {
  width: 180px;
  height: 180px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #D2B48C;
}

.item-right-section {
  flex: 2;
  display: flex;
  justify-content: space-between;
  padding-left: 20px;
}

.item-info {
  flex: 1;
}

.item-info h3 {
  margin: 0 0 12px 0;
  color: #4E342E;
  font-size: 1.3em;
}

.item-info p {
  margin: 8px 0;
  color: #5D4037;
  font-size: 1.05em;
}

.item-controls {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-end;
  min-width: 180px;
}

.item-quantity-control {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 15px 0;
}

.item-quantity-control button {
  background-color: #D7CCC8;
  border: 1px solid #A1887F;
  border-radius: 6px;
  padding: 5px 15px;
  cursor: pointer;
  font-size: 1.1em;
  color: #5D4037;
  transition: all 0.2s ease;
}

.item-quantity-control button:hover:not(:disabled) {
  background-color: #BCAAA4;
  transform: scale(1.05);
}

.item-quantity-control button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.item-quantity-control span {
  font-weight: bold;
  font-size: 1.2em;
  min-width: 30px;
  text-align: center;
  color: #5D4037;
}

.remove-item-button {
  background-color: #8D6E63;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(93, 64, 55, 0.2);
  width: 100%;
  max-width: 150px;
}

.remove-item-button:hover {
  background-color: #6D4C41;
  transform: translateY(-2px);
}

.cart-summary {
  padding: 15px;
}

.cart-summary h2 {
  margin-top: 0;
  color: #4E342E;
  border-bottom: 1px solid #A1887F;
  padding-bottom: 10px;
}

.cart-summary p {
  margin: 10px 0;
  font-size: 1.1em;
  color: #5D4037;
}

.total-price {
  font-size: 1.6em;
  color: #5D4037;
  margin: 20px 0;
  font-weight: bold;
}

.total-price strong {
  color: #4E342E;
}

.checkout-button {
  background-color: #6D4C41;
  color: white;
  border: none;
  padding: 15px 30px;
  border-radius: 8px;
  font-size: 1.2em;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 20px;
  font-weight: 600;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 8px rgba(93, 64, 55, 0.3);
  width: 100%;
}

.checkout-button:hover {
  background-color: #5D4037;
  transform: translateY(-3px);
  box-shadow: 0 6px 12px rgba(93, 64, 55, 0.4);
}

/* Responsive design */
@media (max-width: 1024px) {
  .cart-layout {
    grid-template-columns: 1fr;
  }
  
  .summary-container {
    position: static;
    margin-top: 30px;
  }
}

@media (max-width: 768px) {
  .cart-item {
    flex-direction: column;
  }
  
  .item-right-section {
    flex-direction: column;
    padding-left: 0;
    margin-top: 15px;
  }
  
  .item-controls {
    flex-direction: row;
    align-items: center;
    margin-top: 15px;
  }
  
  .item-quantity-control {
    margin: 0;
  }
  
  .remove-item-button {
    max-width: 120px;
  }
  
  .item-image {
    width: 100%;
    height: auto;
    max-height: 250px;
  }
}

@media (max-width: 480px) {
  .cart-container {
    padding: 15px;
    width: 100%;
    border-radius: 0;
    margin: 0;
  }
  
  .item-controls {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .remove-item-button {
    max-width: 100%;
  }
  
  .products-container,
  .summary-container {
    padding: 15px;
}
}
</style>
<template>
    <div class="cart-container">
      <h1>Tu Carrito de Compras</h1>
  
      <div v-if="cartStore.items.length === 0" class="empty-cart-message">
        <p>Tu carrito está vacío. ¡Empieza a añadir productos!</p>
        <router-link to="/productos">Ir a la tienda</router-link>
      </div>
  
      <div v-else>
        <div class="cart-items">
          <div v-for="item in cartStore.items" :key="item.id" class="cart-item">
            <img :src="item.imagen" alt="Imagen del producto" class="item-image" />
            <div class="item-details">
              <h3>{{ item.nombre }}</h3>
              <p>Precio: ${{ item.precio.toFixed(2) }}</p>
              <div class="item-quantity-control">
                <button @click="cartStore.decrementItem(item.id)">-</button>
                <span>{{ item.cantidad }}</span>
                <button @click="cartStore.incrementItem(item.id)" :disabled="item.cantidad >= item.stock">+</button>
              </div>
              <p>Subtotal: ${{ (item.precio * item.cantidad).toFixed(2) }}</p>
              <button @click="cartStore.removeItem(item.id)" class="remove-item-button">Eliminar</button>
            </div>
          </div>
        </div>
  
        <div class="cart-summary">
          <h2>Resumen del Carrito</h2>
          <p>Total de ítems: {{ cartStore.totalItems }}</p>
          <p class="total-price">Total a pagar: <strong>${{ cartStore.totalPrice.toFixed(2) }}</strong></p>
          <button class="checkout-button">Proceder al Pago</button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { useCartStore } from '../Store/useCartStore';
  // No necesitas useRoute, useQuasar, getData, postData, etc. aquí
  // a menos que Carrito.vue también maneje reseñas o favoritos a nivel general,
  // lo cual no es el propósito de un carrito de compras.
  
  const cartStore = useCartStore(); // ¡Obtén la instancia del store!
  </script>
  
  <style scoped>
  .cart-container {
    max-width: 900px;
    margin: 40px auto;
    padding: 20px;
    background-color: #f9f9f9;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  h1 {
    text-align: center;
    color: #333;
    margin-bottom: 30px;
  }
  
  .empty-cart-message {
    text-align: center;
    padding: 50px;
    border: 1px dashed #ccc;
    border-radius: 8px;
    background-color: #fff;
  }
  
  .empty-cart-message p {
    font-size: 1.1em;
    color: #666;
    margin-bottom: 20px;
  }
  
  .empty-cart-message a {
    display: inline-block;
    padding: 10px 20px;
    background-color: #007bff;
    color: white;
    text-decoration: none;
    border-radius: 5px;
    transition: background-color 0.3s ease;
  }
  
  .empty-cart-message a:hover {
    background-color: #0056b3;
  }
  
  .cart-items {
    display: flex;
    flex-direction: column;
    gap: 20px;
    margin-bottom: 30px;
  }
  
  .cart-item {
    display: flex;
    align-items: center;
    background-color: #fff;
    padding: 15px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }
  
  .item-image {
    width: 100px;
    height: 100px;
    object-fit: cover;
    border-radius: 5px;
    margin-right: 20px;
  }
  
  .item-details {
    flex-grow: 1;
  }
  
  .item-details h3 {
    margin: 0 0 10px 0;
    color: #333;
  }
  
  .item-details p {
    margin: 5px 0;
    color: #555;
  }
  
  .item-quantity-control {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 10px 0;
  }
  
  .item-quantity-control button {
    background-color: #e2e6ea;
    border: 1px solid #c4c8cb;
    border-radius: 4px;
    padding: 5px 10px;
    cursor: pointer;
    font-size: 1em;
    transition: background-color 0.2s ease;
  }
  
  .item-quantity-control button:hover:not(:disabled) {
    background-color: #d1d5db;
  }
  
  .item-quantity-control button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
  }
  
  .item-quantity-control span {
    font-weight: bold;
    font-size: 1.1em;
    min-width: 30px;
    text-align: center;
  }
  
  .remove-item-button {
    background-color: #dc3545;
    color: white;
    border: none;
    padding: 8px 12px;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s ease;
    margin-top: 10px; /* Separación del resto de los detalles */
  }
  
  .remove-item-button:hover {
    background-color: #c82333;
  }
  
  .cart-summary {
    background-color: #e9ecef;
    padding: 20px;
    border-radius: 8px;
    text-align: right;
  }
  
  .cart-summary h2 {
    margin-top: 0;
    color: #333;
  }
  
  .cart-summary p {
    margin: 5px 0;
    font-size: 1.1em;
    color: #555;
  }
  
  .total-price {
    font-size: 1.5em;
    color: #28a745;
    margin-top: 15px;
  }
  
  .checkout-button {
    background-color: #28a745;
    color: white;
    border: none;
    padding: 12px 25px;
    border-radius: 5px;
    font-size: 1.2em;
    cursor: pointer;
    transition: background-color 0.3s ease;
    margin-top: 20px;
  }
  
  .checkout-button:hover {
    background-color: #218838;
  }
  </style>
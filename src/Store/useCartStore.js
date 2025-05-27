// Stores/useCartStore.js
import { defineStore } from 'pinia';
import { Notify } from 'quasar';

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [], // Inicializa como array vacío. Pinia-persist lo llenará al cargar.
  }),
  getters: {
    totalItems: (state) => {
      return state.items.reduce((sum, item) => sum + (item.cantidad || 0), 0);
    },
    totalPrice: (state) => {
      return state.items.reduce((sum, item) => {
        const precio = typeof item.precio === 'number' ? item.precio : 0;
        const cantidad = typeof item.cantidad === 'number' ? item.cantidad : 0;
        return sum + (precio * cantidad);
      }, 0);
    },
    formatPrice: () => (value) => {
      const numValue = typeof value === 'number' ? value : 0;
      return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(numValue);
    },
  },
  actions: {
    addItem(product) {
      const productToAdd = { ...product };

      if (typeof productToAdd.precio !== 'number' || isNaN(productToAdd.precio)) {
        console.error('Error: El precio del producto no es un número válido. Producto:', productToAdd);
        Notify.create({
          type: 'negative',
          message: `No se pudo añadir ${productToAdd.nombre}: Precio inválido.`,
          position: 'top',
          timeout: 2500,
        });
        return;
      }
      if (typeof productToAdd.cantidad !== 'number' || isNaN(productToAdd.cantidad) || productToAdd.cantidad <= 0) {
        console.error('Error: La cantidad del producto no es un número válido o es cero/negativa. Producto:', productToAdd);
        Notify.create({
          type: 'negative',
          message: `No se pudo añadir ${productToAdd.nombre}: Cantidad inválida.`,
          position: 'top',
          timeout: 2500,
        });
        return;
      }
      productToAdd.stock = typeof productToAdd.stock === 'number' ? productToAdd.stock : Infinity;

      const existingItem = this.items.find(item => item.id === productToAdd.id);

      if (existingItem) {
        if (existingItem.cantidad + productToAdd.cantidad > productToAdd.stock) {
          Notify.create({
            type: 'warning',
            message: `Solo hay ${productToAdd.stock} unidades de ${productToAdd.nombre}. No se puede añadir más.`,
            position: 'top',
            timeout: 3000,
          });
          return;
        }
        existingItem.cantidad += productToAdd.cantidad;
        Notify.create({
          type: 'info',
          message: `${productToAdd.nombre} (x${productToAdd.cantidad}) actualizado en el carrito.`,
          position: 'top',
          timeout: 2000,
        });
      } else {
        if (productToAdd.cantidad > productToAdd.stock) {
          Notify.create({
            type: 'warning',
            message: `No puedes añadir ${productToAdd.cantidad} unidades de ${productToAdd.nombre}. Solo hay ${productToAdd.stock} disponibles.`,
            position: 'top',
            timeout: 3000,
          });
          return;
        }
        this.items.push(productToAdd);
        Notify.create({
          type: 'positive',
          message: `${productToAdd.nombre} agregado al carrito.`,
          position: 'top',
          timeout: 2000,
        });
      }
      this.saveCart(); // Llama a saveCart después de modificar el array 'items'
    },
    removeItem(productId) {
      this.items = this.items.filter(item => item.id !== productId);
      Notify.create({
        type: 'negative',
        message: 'Producto eliminado del carrito.',
        position: 'top',
        timeout: 2000,
      });
      this.saveCart(); // Llama a saveCart después de eliminar un ítem
    },
    incrementItem(productId) {
      const item = this.items.find(item => item.id === productId);
      if (item) {
        const currentStock = typeof item.stock === 'number' ? item.stock : Infinity;
        if (item.cantidad < currentStock) {
          item.cantidad++;
          this.saveCart(); // Llama a saveCart después de incrementar la cantidad
        } else {
          Notify.create({
            type: 'warning',
            message: `No hay más stock disponible para ${item.nombre}.`,
            position: 'top',
            timeout: 2000,
          });
        }
      }
    },
    decrementItem(productId) {
      const item = this.items.find(item => item.id === productId);
      if (item) {
        if (item.cantidad > 1) {
          item.cantidad--;
          this.saveCart(); // Llama a saveCart después de decrementar la cantidad
        } else {
          this.removeItem(productId); // Si la cantidad llega a 1 y se decrementa, elimínalo
        }
      }
    },
    saveCart() {
      localStorage.setItem('cart', JSON.stringify(this.items));
    },
    clearCart() {
      this.items = [];
      this.saveCart();
      Notify.create({
        type: 'positive',
        message: 'El carrito ha sido vaciado.',
        position: 'top',
        timeout: 2000,
      });
    }
  },
  persist: {
    enabled: true,
    strategies: [
      {
        key: 'cart',
        storage: localStorage,
        paths: ['items'],
      },
    ],
  },
});
<template>
  <div class="container">
    <!-- Barra de navegación superior -->
    <nav class="main-nav">
      <div class="nav-brand"></div>
      <div class="search-bar">
        <input type="text" placeholder="Buscar productos..." v-model="searchQuery" />
        <button @click="handleSearch">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path
              d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
          </svg>
          Buscar
        </button>
      </div>
      <div class="nav-actions">
        <button class="nav-button">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path
              d="M8 1a2.5 2.5 0 0 1 2.5 2.5V4h-5v-.5A2.5 2.5 0 0 1 8 1zm3.5 3v-.5a3.5 3.5 0 1 0-7 0V4H1v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4h-3.5z" />
          </svg>
          Carrito
        </button>
        <button class="nav-button">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path
              d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z" />
          </svg>
          Mi cuenta
        </button>
      </div>
    </nav>

    <!-- Hero Slider -->
    <div class="slider-wrapper">
      <div class="slider" :style="{ transform: `translateX(-${currentSlide * 100}%)` }">
        <div class="slide" v-for="(slide, index) in slides" :key="index">
          <img :src="slide.image" :alt="slide.title" />
          <div class="slide-content">
            <h1>{{ slide.title }}</h1>
            <p>{{ slide.description }}</p>
            <button class="cta-button">Ver más</button>
          </div>
        </div>
      </div>
      <div class="slider-controls">
        <button class="slider-prev" @click="prevSlide">‹</button>
        <button class="slider-next" @click="nextSlide">›</button>
      </div>
    </div>

    <!-- Servicios destacados -->
    <section class="services-section">
      <h2 class="section-title">Nuestros Servicios</h2>
      <p class="section-subtitle">Todo lo que necesitas para una experiencia de compra perfecta</p>

      <div class="card-container">
        <div class="service-card" v-for="(card, i) in cards" :key="i">
          <div class="card-icon">
            <img :src="card.icon" :alt="card.title" />
          </div>
          <h3>{{ card.title }}</h3>
          <p>{{ card.description }}</p>
          <button class="service-button">Más información</button>
        </div>
      </div>
    </section>

    <!-- Productos destacados -->
    <section class="featured-products">
      <div class="section-header">
        <h2 class="section-title">Más vendidos esta semana</h2>
        <a href="#" class="view-all">Ver todos ›</a>
      </div>

      <div class="product-grid">
        <div class="product-card" v-for="(product, i) in products" :key="i">
          <div class="product-badge" v-if="product.isNew">Nuevo</div>
          <div class="product-badge discount" v-if="product.discount">-{{ product.discount }}%</div>
          <div class="product-image">
            <img :src="product.image" :alt="product.name" />
            <div class="product-actions">
              <button class="action-button wishlist">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path
                    d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01L8 2.748zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143c.06.055.119.112.176.171a3.12 3.12 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15z" />
                </svg>
              </button>
              <button class="action-button cart">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path
                    d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5zM3.102 4l1.313 7h8.17l1.313-7H3.102zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
                </svg>
              </button>
            </div>
          </div>
          <div class="product-info">
            <h3>{{ product.name }}</h3>
            <div class="product-price">
              <span class="current-price">${{ product.price }}</span>
              <span class="original-price" v-if="product.originalPrice">${{ product.originalPrice }}</span>
            </div>
            <div class="product-rating">
              <span class="stars">★★★★★</span>
              <span class="review-count">({{ product.reviews }})</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Newsletter -->
    <section class="newsletter">
      <div class="newsletter-content">
        <h2>Suscríbete a nuestro boletín</h2>
        <p>Recibe ofertas exclusivas y novedades directamente en tu correo</p>
        <div class="newsletter-form">
          <input type="email" placeholder="Tu correo electrónico" />
          <button class="cta-button">Suscribirse</button>
        </div>
      </div>
    </section>
  </div>
  <!-- Footer -->
  <footer class="main-footer">
    <div class="footer-columns">
      <div class="footer-column">
        <h3>Jook</h3>
        <p>Tu tienda online favorita con los mejores productos y precios competitivos.</p>
        <div class="social-icons">
          <a href="#"><img src="https://img.icons8.com/ios-filled/50/ffffff/facebook-new.png" alt="Facebook" /></a>
          <a href="#"><img src="https://img.icons8.com/ios-filled/50/ffffff/instagram-new.png" alt="Instagram" /></a>
          <a href="#"><img src="https://img.icons8.com/ios-filled/50/ffffff/twitter.png" alt="Twitter" /></a>
        </div>
      </div>
      <div class="footer-column">
        <h4>Comprar</h4>
        <ul>
          <li><a href="#">Productos</a></li>
          <li><a href="#">Ofertas</a></li>
          <li><a href="#">Nuevos lanzamientos</a></li>
          <li><a href="#">Más vendidos</a></li>
        </ul>
      </div>
      <div class="footer-column">
        <h4>Ayuda</h4>
        <ul>
          <li><a href="#">Centro de ayuda</a></li>
          <li><a href="#">Contacto</a></li>
          <li><a href="#">Devoluciones</a></li>
          <li><a href="#">Estado del pedido</a></li>
        </ul>
      </div>
      <div class="footer-column">
        <h4>Legal</h4>
        <ul>
          <li><a href="#">Términos y condiciones</a></li>
          <li><a href="#">Política de privacidad</a></li>
          <li><a href="#">Política de cookies</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <p>&copy; 2023 Jook. Todos los derechos reservados.</p>
      <div class="payment-methods">
        <img src="https://img.icons8.com/ios-filled/50/ffffff/visa.png" alt="Visa" />
        <img src="https://img.icons8.com/ios-filled/50/ffffff/mastercard.png" alt="Mastercard" />
        <img src="https://img.icons8.com/ios-filled/50/ffffff/paypal.png" alt="PayPal" />
      </div>
    </div>
  </footer>
</template>

<script setup>
import { ref } from 'vue';

const currentSlide = ref(0);
const slides = [
  {
    image: 'https://images.pexels.com/photos/1038628/pexels-photo-1038628.jpeg?auto=compress&cs=tinysrgb&w=1600',
    title: 'Nueva Colección',
    description: 'Descubre los productos más vendidos de la temporada',
  },
  {
    image: 'https://images.pexels.com/photos/1092671/pexels-photo-1092671.jpeg?auto=compress&cs=tinysrgb&w=1600',
    title: 'Hasta 50% de descuento',
    description: 'En productos seleccionados por tiempo limitado',
  },
  {
    image: 'https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=1600',
    title: 'Tecnología de punta',
    description: 'Explora los últimos gadgets y dispositivos',
  }
];

const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % slides.length;
};
const prevSlide = () => {
  currentSlide.value = (currentSlide.value - 1 + slides.length) % slides.length;
};

const cards = [
  {
    title: 'Medios de pago',
    description: 'Paga tus compras de forma rápida y segura',
    icon: 'https://img.icons8.com/ios-filled/50/5e3307/credit-card.png',
  },
  {
    title: 'Ventas',
    description: 'Disfruta de ofertas y compra sin límites',
    icon: 'https://img.icons8.com/ios-filled/50/5e3307/cash-in-hand.png',
  },
  {
    title: 'Devoluciones',
    description: 'Compra sin miedo de perder tu dinero',
    icon: 'https://img.icons8.com/ios-filled/50/5e3307/handshake.png',
  },
];

const products = [
  {
    name: 'Smartphone X9 Pro',
    price: 599.99,
    originalPrice: 699.99,
    image: 'https://images.pexels.com/photos/31930182/pexels-photo-31930182/free-photo-of-primer-plano-de-la-lente-de-la-camara-de-un-telefono-inteligente-moderno.jpeg?auto=compress&cs=tinysrgb&w=600',
    reviews: 124,
    discount: 15,
    isNew: false
  },
  {
    name: 'Auriculares Inalámbricos',
    price: 89.99,
    originalPrice: 129.99,
    image: 'https://images.pexels.com/photos/1649771/pexels-photo-1649771.jpeg?auto=compress&cs=tinysrgb&w=600',
    reviews: 89,
    discount: 30,
    isNew: true
  },
  {
    name: 'Reloj Inteligente',
    price: 199.99,
    image: 'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=600',
    reviews: 56,
    isNew: true
  },
  {
    name: 'Portátil Ultra Slim',
    price: 899.99,
    originalPrice: 999.99,
    image: 'https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=600',
    reviews: 42,
    discount: 10,
    isNew: false
  },
  {
    name: 'Cámara Profesional',
    price: 459.99,
    image: 'https://images.pexels.com/photos/51383/photo-camera-subject-photographer-51383.jpeg?auto=compress&cs=tinysrgb&w=600',
    reviews: 78,
    isNew: false
  }
];

const handleSearch = () => {
  // Lógica de búsqueda
};
</script>

<style scoped>
/* Variables de color */
:root {
  --primary-dark: #3E2723;    /* Café oscuro */
  --primary-medium: #5D4037;  /* Café medio */
  --primary-light: #8D6E63;   /* Café claro */
  --secondary-dark: #6D4C41;  /* Café secundario oscuro */
  --secondary-light: #D7CCC8; /* Café claro claro */
  --accent-color: #A1887F;    /* Café acento */
  --light-bg: #EFEBE9;        /* Fondo café muy claro */
  --dark-text: #3E2723;       /* Texto café oscuro */
  --light-text: #FFFFFF;      /* Texto blanco */
  --gray-text: #795548;       /* Texto gris café */
  --border-color: #BCAAA4;    /* Borde café claro */
  --success-color: #689F38;   /* Verde para contrastar */
  --discount-color: #D32F2F;  /* Rojo para ofertas */
}

/* Reset y estilos base */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  color: var(--dark-text);
  background-color: var(--light-bg);
  line-height: 1.6;
}

.container {
  max-width: 1440px;
  margin: 0 auto;
  overflow: hidden;
}

/* Barra de navegación */
.main-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: var(--primary-dark);
  color: var(--light-text);
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  
}

.nav-brand {
  font-size: 1.8rem;
  font-weight: 700;
  letter-spacing: 1px;
}

.search-bar {
  display: flex;
  width: 40%;
  margin: 0 1rem;
}

.search-bar input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 4px 0 0 4px;
  font-size: 1rem;
  outline: none;
}

.search-bar button {
  padding: 0 1.5rem;
  background-color: var(--primary-medium);
  color: white;
  border: none;
  border-radius: 0 4px 4px 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background-color 0.3s;
}

.search-bar button:hover {
  background-color: var(--primary-light);
}

.nav-actions {
  display: flex;
  gap: 1rem;
}

.nav-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: transparent;
  border: 1px solid var(--secondary-light);
  color: var(--secondary-light);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.nav-button:hover {
  background-color: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.5);
}

/* Slider */
.slider-wrapper {
  position: relative;
  width: 100%;
  height: 500px;
  overflow: hidden;
  margin-bottom: 3rem;
}

.slider {
  display: flex;
  width: 100%;
  height: 100%;
  transition: transform 0.5s ease;
}

.slide {
  min-width: 100%;
  position: relative;
}

.slide img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.slide-content {
  position: absolute;
  top: 50%;
  left: 10%;
  transform: translateY(-50%);
  color: var(--light-text);
  max-width: 500px;
  text-align: left;
}

.slide-content h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.slide-content p {
  font-size: 1.2rem;
  margin-bottom: 2rem;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.slider-controls {
  position: absolute;
  top: 50%;
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 0 1rem;
  transform: translateY(-50%);
  z-index: 10;
}

.slider-prev,
.slider-next {
  background-color: rgba(255, 255, 255, 0.3);
  color: var(--light-text);
  border: none;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.slider-prev:hover,
.slider-next:hover {
  background-color: rgba(255, 255, 255, 0.5);
}

.slider-dots {
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 0.5rem;
}

/* Botones */
.cta-button {
  padding: 0.75rem 2rem;
  background-color: var(--secondary-color);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.cta-button:hover {
  background-color: var(--accent-color);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* Secciones */
.section-title {
  font-size: 2rem;
  margin-bottom: 1rem;
  color: var(--primary-color);
  text-align: center;
  position: relative;
  padding-bottom: 0.5rem;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 3px;
  background-color: var(--secondary-color);
}

.section-subtitle {
  font-size: 1.1rem;
  color: var(--gray-text);
  text-align: center;
  margin-bottom: 2rem;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
}

.services-section,
.featured-products {
  padding: 4rem 2rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 0 1rem;
}

.view-all {
  color: var(--primary-color);
  font-weight: 600;
  text-decoration: none;
  transition: color 0.3s;
}

.view-all:hover {
  color: var(--accent-color);
}

/* Tarjetas de servicios */
.card-container {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 2rem;
  margin-top: 2rem;
}

.service-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  padding: 2rem;
  width: 300px;
  text-align: center;
  transition: transform 0.3s, box-shadow 0.3s;
}

.service-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.card-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(214, 163, 84, 0.1);
  border-radius: 50%;
}

.card-icon img {
  width: 50px;
  height: 50px;
}

.service-card h3 {
  font-size: 1.3rem;
  margin-bottom: 1rem;
  color: var(--primary-color);
}

.service-card p {
  color: var(--gray-text);
  margin-bottom: 1.5rem;
}

.service-button {
  padding: 0.5rem 1.5rem;
  background-color: transparent;
  color: var(--primary-color);
  border: 1px solid var(--primary-color);
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.service-button:hover {
  background-color: var(--primary-color);
  color: white;
}

/* Productos */
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 2rem;
  padding: 0 1rem;
}

.product-card {
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s, box-shadow 0.3s;
  position: relative;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.product-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  background-color: var(--success-color);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
  z-index: 2;
}

.product-badge.discount {
  background-color: var(--discount-color);
  left: auto;
  right: 10px;
}

.product-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s;
}

.product-card:hover .product-image img {
  transform: scale(1.05);
}

.product-actions {
  position: absolute;
  bottom: -50px;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: center;
  gap: 1rem;
  padding: 0.5rem;
  background-color: rgba(255, 255, 255, 0.9);
  transition: bottom 0.3s;
  z-index: 2;
}

.product-card:hover .product-actions {
  bottom: 0;
}

.action-button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background-color: var(--light-text);
  color: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.action-button:hover {
  background-color: var(--primary-color);
  color: white;
  transform: translateY(-2px);
}

.product-info {
  padding: 1.5rem;
}

.product-info h3 {
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.product-price {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.current-price {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--primary-color);
}

.original-price {
  font-size: 0.9rem;
  text-decoration: line-through;
  color: var(--gray-text);
}

.product-rating {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.stars {
  color: var(--secondary-color);
  font-size: 0.9rem;
}

.review-count {
  font-size: 0.8rem;
  color: var(--gray-text);
}

/* Newsletter */
.newsletter {
  background-color: var(--primary-color);
  color: var(--light-text);
  padding: 4rem 2rem;
  text-align: center;
  margin: 3rem 0;
}

.newsletter-content {
  max-width: 600px;
  margin: 0 auto;
}

.newsletter h2 {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.newsletter p {
  margin-bottom: 2rem;
  color: rgba(255, 255, 255, 0.8);
}

.newsletter-form {
  display: flex;
  max-width: 500px;
  margin: 0 auto;
}

.newsletter-form input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 4px 0 0 4px;
  font-size: 1rem;
  outline: none;
}

.newsletter-form button {
  padding: 0 2rem;
  background-color: var(--secondary-color);
  color: white;
  border: none;
  border-radius: 0 4px 4px 0;
  cursor: pointer;
  transition: background-color 0.3s;
}

.newsletter-form button:hover {
  background-color: var(--accent-color);
}

/* Footer */
.main-footer {
  background-color: #2c2c2c;
  color: white;
  padding: 4rem 2rem 2rem;
  width: 100%;
}

.footer-columns {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.footer-column h3 {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: var(--secondary-color);
}

.footer-column h4 {
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
  color: var(--light-text);
  position: relative;
  padding-bottom: 0.5rem;
}

.footer-column h4::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 40px;
  height: 2px;
  background-color: var(--secondary-color);
}

.footer-column p {
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 1.5rem;
}

.footer-column ul {
  list-style: none;
}

.footer-column ul li {
  margin-bottom: 0.75rem;
}

.footer-column ul li a {
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  transition: color 0.3s;
}

.footer-column ul li a:hover {
  color: var(--secondary-color);
}

.social-icons {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.social-icons img {
  width: 24px;
  height: 24px;
  opacity: 0.7;
  transition: opacity 0.3s;
}

.social-icons img:hover {
  opacity: 1;
}

.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 2rem;
  margin-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

.footer-bottom p {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.9rem;
}

.payment-methods {
  display: flex;
  gap: 0.5rem;
}

.payment-methods img {
  width: 40px;
  height: auto;
  opacity: 0.7;
}

/* Responsive */
@media (max-width: 1024px) {
  .slider-wrapper {
    height: 400px;
  }

  .slide-content h1 {
    font-size: 2.5rem;
  }
}

@media (max-width: 768px) {
  .main-nav {
    flex-direction: column;
    padding: 1rem;
    gap: 1rem;
  }

  .search-bar {
    width: 100%;
    order: 3;
    margin: 0;
  }

  .nav-actions {
    width: 100%;
    justify-content: center;
  }

  .slider-wrapper {
    height: 300px;
  }

  .slide-content {
    left: 5%;
    max-width: 90%;
  }

  .slide-content h1 {
    font-size: 2rem;
  }

  .slide-content p {
    font-size: 1rem;
  }

  .section-title {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .slider-wrapper {
    height: 250px;
  }

  .slide-content h1 {
    font-size: 1.5rem;
  }

  .cta-button,
  .service-button {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }

  .footer-columns {
    grid-template-columns: 1fr;
  }

  .footer-bottom {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
}
</style>
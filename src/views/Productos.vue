<template>
  <div class="page-wrapper">
    <!-- Búsqueda -->
    <div class="search-bar">
      <div class="search-input-wrapper">
        <span class="search-icon">🔍</span>
        <input
          v-model="search"
          type="text"
          placeholder="Buscar tu casco ideal..."
        />
      </div>
    </div>

    <!-- Filtros -->
    <div class="filter-bar">
      <button
        v-for="filter in filters"
        :key="filter"
        class="filter-btn"
        @click="handleFilter(filter)"
      >
        {{ filter }}
      </button>
    </div>

    <!-- Carruseles -->
    <div
      v-for="(carousel, index) in carouselsData"
      :key="index"
      class="carousel-container"
    >
      <div class="carousel">
        <!-- Botón izquierdo -->
        <button
          class="carousel-btn left"
          @click="moveCarousel(index, 'left')"
        >
          &#9664;
        </button>
        
        <!-- Carrusel -->
        <div
          class="carousel-items"
          :style="{ transform: 'translateX(' + carouselPositions[index] + 'px)' }"
          ref="carousels"
        >
          <div class="carousel-item" v-for="(item, i) in carousel" :key="i">
            <!-- Enlace alrededor de la imagen -->
            <a :href="item.url" target="_blank">
              <img :src="item.img" alt="Producto" class="product-img" />
            </a>
            <div class="product-info">
              <p class="price">{{ item.price }}</p>
              <p class="desc">{{ item.desc }}</p>
              <p class="discount">{{ item.discount }}</p>
            </div>
          </div>
        </div>

        <!-- Botón derecho -->
        <button
          class="carousel-btn right"
          @click="moveCarousel(index, 'right')"
        >
          &#9654;
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'

// Para las búsquedas y filtros
const search = ref('')
const filters = [
  'Filtros',
  'Ordenar por: Destacados',
  'Categoría',
  'Marca',
  'Precio',
  'Tipo de uso'
]

// Lista de productos con precios, descripciones, descuentos, URLs e imágenes organizadas
const sampleProducts = [
  {
    price: '$1,206.91',
    desc: 'MacBook 13 Air',
    discount: '10% Descuento',
    url: 'https://www.amazon.com/dp/B08V8MQW7G',
    img: 'https://m.media-amazon.com/images/I/61WYHkstl9L.AC_SL1500.jpg'
  },
  {
    price: '$80.00',
    desc: 'Zapatos deportivos',
    discount: '15% Descuento',
    url: 'https://www.asics.com/',
    img: 'https://asicsco.vteximg.com.br/arquivos/ids/368811-700-700/1011B548_005_SR_RT_GLB.jpg?v=638422112086670000'
  },
  {
    price: '$1,150.75',
    desc: 'Airpods 2 Pro',
    discount: '5% Descuento',
    url: 'https://www.apple.com/airpods-2-pro',
    img: 'https://co.tiendasishop.com/cdn/shop/files/IMG-14912675.jpg?v=1726874179&width=1000'
  },
  {
    price: '$999.00',
    desc: 'Auriculares Bluetooth',
    discount: '20% Descuento',
    url: 'https://www.apple.com/airpods-max',
    img: 'https://onlinebusiness.com.co/wp-content/uploads/2018/08/apple_mgyn3am_a_airpods_max_green.jpeg'
  },
  {
    price: '$2,999.99',
    desc: 'Laptop ultradelgada',
    discount: '30% Descuento',
    url: 'https://www.amazon.com/dp/B08V8MQW7G',
    img: 'https://m.media-amazon.com/images/I/71SeB+qG0qL.jpg'
  },
  {
    price: '$1,699.99',
    desc: 'iPhone 11',
    discount: '15% Descuento',
    url: 'https://www.apple.com/iphone-11',
    img: 'https://tienda.movistar.com.co/media/catalog/product/cache/ebd1de6550e0d0b8d8c505e2a09b56c4/i/p/iphone11morado01.jpg?v=638422112086670000'
  },
  {
    price: '$2,299.99',
    desc: 'Smartwatch Garmin',
    discount: '5% Descuento',
    url: 'https://www.garmin.com/',
    img: 'https://http2.mlstatic.com/D_NQ_NP_959477-CBT75867871299_042024-O.webp'
  },
  {
    price: '$399.99',
    desc: 'Auriculares Bose QuietComfort',
    discount: '25% Descuento',
    url: 'https://www.bose.com/en_us/products/headphones.html',
    img: 'https://assets.bose.com/content/dam/cloudassets/Bose_DAM/Web/consumer_electronics/global/products/headphones/qcue-headphonein/product_silo_images/AEM_PDP_GALLERY_BLACK-8.jpg/jcr:content/renditions/cq5dam.web.1920.1920.jpeg'
  },
  {
    price: '$1,799.00',
    desc: 'PNY GEFORCE RTX 5090',
    discount: '10% Descuento',
    url: 'https://www.pny.com/',
    img: 'https://media.ldlc.com/r1600/ld/products/00/06/20/52/LD0006205272.jpg'
  },
  {
    price: '$1,099.99',
    desc: 'Silla Ejecutiva Gerencial Magnux Ergonómica',
    discount: '15% Descuento',
    url: 'https://www.magnux.com/sillas-ejecutivas',
    img: 'https://http2.mlstatic.com/D_NQ_NP_809846-MLU74085660355_012024-O.webp'
  },
  {
    price: '$2,549.900.99',
    desc: 'Consola Playstation 5 Slim Disco 1tb Con Juego Fisico Fc 25',
    discount: '20% Descuento',
    url: 'https://www.playstation.com/',
    img: 'https://http2.mlstatic.com/D_NQ_NP_747798-MCO79545904923_092024-O.webp'
  },
  {
    price: '$1,400.556.00',
    desc: 'GoPro Hero 9 Black',
    discount: '10% Descuento',
    url: 'https://gopro.com/',
    img: 'https://http2.mlstatic.com/D_NQ_NP_843539-CBT81549071194_012025-O.webp'
  },
  {
    price: '$3,249.900.00',
    desc: 'Consola Microsoft Xbox Series X Digital 1tb Color Blanco',
    discount: '15% Descuento',
    url: 'https://www.microsoft.com/xbox',
    img: 'https://http2.mlstatic.com/D_NQ_NP_640569-MLA80427179894_112024-O.webp'
  },
  {
    price: '$1,999.99',
    desc: 'MacBook Pro 16"',
    discount: '10% Descuento',
    url: 'https://www.apple.com/macbook-pro-16',
    img: 'https://http2.mlstatic.com/D_NQ_NP_778821-MLA73281234734_122023-O.webp'
  },
  {
    price: '$750.00',
    desc: 'Smartwatch Apple Watch Series 6',
    discount: '5% Descuento',
    url: 'https://www.apple.com/apple-watch-series-6',
    img: 'https://http2.mlstatic.com/D_NQ_NP_2X_816100-MLA72067667918_102023-F.webp'
  },
  {
    price: '$499.99',
    desc: 'Pc Gamer Amd Ryzen 5 7500f Rtx 4060 Ti 8gb Ram 32gb M.2 1tb',
    discount: '20% Descuento',
    url: 'https://www.dell.com',
    img: 'https://http2.mlstatic.com/D_NQ_NP_671556-MCO83438027532_042025-O.webp'
  },
  {
    price: '$2,090.00',
    desc: 'Nintendo Switch Oled 64gb Standard',
    discount: '10% Descuento',
    url: 'https://www.nintendo.com',
    img: 'https://http2.mlstatic.com/D_NQ_NP_845205-MLA70414548864_072023-O.webp'
  },
  {
    price: '$4,000.00',
    desc: 'Tablet Lenovo Smart 10.4 128gb',
    discount: '10% Descuento',
    url: 'https://www.lenovo.com',
    img: 'https://http2.mlstatic.com/D_NQ_NP_851136-MLA82169043662_022025-O.webp'
  },
]

const carouselsData = ref(
  Array.from({ length: 6 }, () =>
    Array.from({ length: 12 }, () => {
      const randomProduct = sampleProducts[Math.floor(Math.random() * sampleProducts.length)]
      return {
        ...randomProduct,
        img: randomProduct.img
      }
    })
  )
)

const carouselPositions = ref(Array(carouselsData.value.length).fill(0))
const itemWidth = 200 // ancho estimado del item + gap

onMounted(() => {
  carouselsData.value.forEach((carousel, index) => {
    setInterval(() => {
      moveCarousel(index, 'right')
    }, 4000)
  })
})

// Función para mover el carrusel manualmente
function moveCarousel(index, direction) {
  const maxScroll = carouselsData.value[index].length * itemWidth - window.innerWidth
  if (direction === 'right') {
    carouselPositions.value[index] = (carouselPositions.value[index] - itemWidth) % (maxScroll + itemWidth)
  } else {
    carouselPositions.value[index] = (carouselPositions.value[index] + itemWidth) % (maxScroll + itemWidth)
  }
}

// Para debug de búsqueda y filtros
watch(search, (val) => {
  console.log('Buscando:', val)
})

function handleFilter(filter) {
  console.log('Filtro seleccionado:', filter)
}
</script>

<style scoped>
body {
  margin: 0;
  font-family: 'Segoe UI', sans-serif;
  background: #f5f5f5;
}

.page-wrapper {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 40px;
}

/* Búsqueda */
.search-bar {
  margin-bottom: 8px;
}

.search-input-wrapper {
  position: relative;
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
}

.search-input-wrapper input {
  width: 100%;
  padding: 14px 16px 14px 44px;
  border-radius: 12px;
  border: 1px solid #ccc;
  font-size: 16px;
  background: #fff;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.05);
  transition: 0.2s ease;
}

.search-input-wrapper input:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
}

.search-icon {
  position: absolute;
  top: 50%;
  left: 14px;
  transform: translateY(-50%);
  font-size: 18px;
  color: #888;
}

/* Filtros */
.filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
}

.filter-btn {
  background-color: #f3f4f6;
  color: #374151;
  padding: 10px 18px;
  border-radius: 20px;
  font-weight: 500;
  font-size: 14px;
  border: 1px solid transparent;
  transition: all 0.2s ease;
  cursor: pointer;
}

.filter-btn:hover {
  background-color: #e5e7eb;
  border-color: #d1d5db;
}

/* Carruseles */
.carousel-container {
  background: white;
  padding: 20px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.12);
  border-radius: 12px;
  overflow: hidden;
}

.carousel {
  display: flex;
  overflow: hidden;
  position: relative;
  width: 100%;
  height: 300px;
  background-color: white;
}

.carousel-items {
  display: flex;
  transition: transform 1s ease-in-out;
}

.carousel-item {
  flex: 0 0 200px; /* Ancho del item */
  margin-right: 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.carousel-btn {
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  padding: 10px;
  font-size: 24px;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  cursor: pointer;
}

.carousel-btn.left {
  left: 10px;
}

.carousel-btn.right {
  right: 10px;
}

/* Imagen */
.product-img {
  width: 100%;
  height: 180px; /* Ajustamos la altura */
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
}

/* Estilo de los productos */
.product-info {
  font-size: 12px;
  color: #333;
  line-height: 1.4;
}

.price {
  font-weight: bold;
  color: #d0021b;
  font-size: 14px;
}

.discount {
  color: #f90;
  font-size: 12px;
}
</style>
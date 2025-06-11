import { createRouter, createWebHistory } from 'vue-router';
import Login from '../views/login.vue';
import Perfl from '../views/perfl.vue';
import Header from '../views/Header.vue';
import Inicio from '../views/Inicio.vue';
import Productos from '../views/Productos.vue';
import Agregar from '../views/Agregar.vue';
import Admi from '../views/Admi.vue';
import Categorias from '../views/Categorias.vue';
import Usuarios from '../views/Usuarios.vue';
import Vistap from '../views/Vistap.vue';
import Favoritos from '../views/Favoritos.vue'; // Tu componente de favoritos
import VistaCategoria from '../views/VistaCategoria.vue';
import VistaMarca from '../views/VistaMarca.vue';
import Carrito from '../views/Carrito.vue';
import FormularioCompra from '../views/FormularioCompra.vue';

import { useAuthStore } from '../Store/useAunt'; // Tu tienda de autenticación

const routes = [
  {
    path: "/",
    component: Header,
    children: [
      { path: '', component: Inicio, name: 'Inicio' },
      { 
        path: '/perfil', 
        component: Perfl, 
        name: 'Perfil', 
        meta: { requiresAuth: true } // Protegida
      },
      { path: '/productos', component: Productos, name: 'Productos' },
      { path: '/vistap/:id', component: Vistap, name: 'vistap', props: true }, 
      { 
        path: '/favoritos', 
        component: Favoritos, 
        name: 'favoritos', 
        meta: { requiresAuth: true } // ¡Aquí está la protección para Favoritos!
      }, 
      { path: '/vistacategoria/:id', component: VistaCategoria, name: 'vistacategoria'}, 
      { path: '/vistamarca/:id', component: VistaMarca, name: 'vistamarca'}, 
      { 
        path: '/carrito/', 
        component: Carrito, 
        name: 'carrito', 
        meta: { requiresAuth: true } // Protegida
      },
      {
        path: '/formularioCompra/', 
        component: FormularioCompra, 
        name: 'formularioCompra', 
        meta: { requiresAuth: true } // Protegida
      },
    ],
  },
  {
    path: "/login",
    component: Login,
    name: 'Login'
  },
  {
    path: "/admin",
    component: Admi,
    meta: { requiresAuth: true, requiresAdmin: true }, // Protegida
    children: [
      { path: '/agregar', component: Agregar, name: 'Agregar' }, 
      { path: '/categoria', component: Categorias, name: 'Categoria' },
      { path: '/usuarios', component: Usuarios, name: 'Usuarios' },
    ],
  },
  // Captura cualquier otra ruta no definida
  { path: '/:catchAll(.*)*', redirect: '/' }, 
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  
  // 1. Verificar si la ruta requiere autenticación y si el usuario NO está logueado
  if (to.meta.requiresAuth && !authStore.isLoggedIn()) {
    next({ name: 'Login', query: { redirect: to.fullPath } });
  } 
  // 2. Verificar si la ruta requiere rol de administrador y si el usuario NO es admin
  else if (to.meta.requiresAdmin && authStore.userRole !== 'admin') {
    next({ name: 'Inicio' }); 
  }
  // 3. Si el usuario está logueado e intenta acceder a la página de login
  else if (to.name === 'Login' && authStore.isLoggedIn()) {
    next({ name: 'Inicio' }); 
  }
  // 4. Si ninguna de las condiciones anteriores se cumple, permite la navegación
  else {
    next(); 
  }
});

export default router;
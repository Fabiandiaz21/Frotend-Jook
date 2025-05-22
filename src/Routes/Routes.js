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
import Favoritos from '../views/Favoritos.vue';
import VistaCategoria from '../views/VistaCategoria.vue';
import { useAuthStore } from '../Store/useAunt'; // Importa tu store de autenticación

const routes = [
  {
    path: "/",
    component: Header,
    children: [
      { path: '', component: Inicio, name: 'Inicio' },
      { path: '/perfil', component: Perfl, name: 'Perfil' },
      { path: '/productos', component: Productos, name: 'Productos' },
      { path: '/vistap/:id', component: Vistap, name: 'vistap', props: true }, 
      { path: '/favoritos', component: Favoritos, name: 'favoritos'}, 
      { path: '/vistacategoria/:id', component: VistaCategoria, name: 'vistacategoria'}, 
    ],
  },
  {
    path: "/login",
    component: Login,
  },
  {
    path: "/admin",
    component: Admi,
    children: [
      { path: '/agregar', component: Agregar, name: 'Agregar' }, // Corregí la capitalización
      { path: '/categoria', component: Categorias, name: 'Categoria' },
      { path: '/usuarios', component: Usuarios, name: 'Usuarios' }, // Corregí la capitalización
    ],
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const isProtectedRoute = to.path === '/perfil';

  if (isProtectedRoute && !authStore.token) {
    next('/login'); // Redirige a la página de login si no hay token
  } else {
    next(); // Permite la navegación normal
  }
});

export default router;
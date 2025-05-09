import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/login.vue'
import Perfl from '../views/perfl.vue'
import Header from '../views/Header.vue'
import Inicio from '../views/Inicio.vue'
import Productos from '../views/Productos.vue'
import Agregar from '../views/Agregar.vue'
import Admi from '../views/Admi.vue'
import Categorias from '../views/Categorias.vue'
import Usuarios from '../views/Usuarios.vue'

const routes = [
  {
    path: "/",
    component: Login
  },
  {
    path: "/Header",
    component: Header,
    children: [
      { path: '/perfil', component: Perfl, name: 'Perfil' },
      { path: '/inicio', component: Inicio, name: 'Inicio' },
      { path: '/productos', component: Productos, name: 'Productos' },
    ]
  },
  {
    path: "/admin",
    component: Admi,
    children: [
      { path: 'Agregar', component: Agregar, name: 'Agregar' },
      { path: 'categoria', component: Categorias, name: 'Categoria' },
      { path: 'Usuarios', component: Usuarios, name: 'Usuarios' },
    ]
  }
]

export const router = createRouter({
  history: createWebHistory(),
  routes
})

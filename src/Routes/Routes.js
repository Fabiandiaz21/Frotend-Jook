import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/login.vue'
import Perfl from '../views/perfl.vue'
import Header from '../views/Header.vue'
import Inicio from '../views/Inicio.vue'
import Productos from '../views/Productos.vue'
import Agregar from '../views/Agregar.vue'


const routes = [
    {
          path:"/",
    component: Login  
    },
    {
        path:"/Header",
        component: Header,
        children: [
            { path: '/perfil', component: Perfl , name: 'Perfil' },
            { path: '/inicio', component: Inicio , name: 'Inicio' },
            { path: '/productos', component: Productos , name: 'Productos' },
            { path: '/Agregar', component: Agregar , name: 'Agregar' },

          ],
    }
]


export const router = createRouter({
    history: createWebHistory(),
    routes
  })
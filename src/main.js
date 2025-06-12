import { createApp } from 'vue'
import { Quasar, Notify, Dialog } from 'quasar'
import { router } from "./Routes/Routes"
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from "pinia-plugin-persistedstate"

// ✅ Importa Tailwind CSS
import './assets/main.css'

// Import icon libraries
import '@quasar/extras/material-icons/material-icons.css'
import '@quasar/extras/material-icons-outlined/material-icons-outlined.css'
import '@quasar/extras/material-icons-round/material-icons-round.css'
import '@quasar/extras/material-icons-sharp/material-icons-sharp.css'
import '@quasar/extras/material-symbols-outlined/material-symbols-outlined.css'
import '@quasar/extras/material-symbols-rounded/material-symbols-rounded.css'
import '@quasar/extras/material-symbols-sharp/material-symbols-sharp.css'
import '@quasar/extras/eva-icons/eva-icons.css'

// Import Quasar css
import 'quasar/src/css/index.sass'

// Componente raíz
import App from './App.vue'

const myApp = createApp(App)
const pinia = createPinia()

pinia.use(piniaPluginPersistedstate)

myApp.use(pinia)
myApp.use(router)
myApp.use(Quasar, {
  plugins: {
    Notify,
    Dialog
  }
})

myApp.mount('#app')

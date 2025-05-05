<template>
  <div class="main-container">
    <!-- Botones Ingresar / Registrar -->
    <div class="screen-top-buttons q-gutter-sm">
      <q-btn flat color="White" :label="'Ingresar'" @click="setLoginMode(true)"
        :class="{ 'bg-brown-7 text-white': isLogin }" class="q-mr-sm" />
      <q-btn flat color="White" :label="'Registrar'" @click="setLoginMode(false)"
        :class="{ 'bg-brown-7 text-white': !isLogin }" class="q-mr-sm" />
    </div>

    <!-- Contenido principal -->
    <div class="content">
      <!-- Área del logo -->
      <div class="logo-area">
        <h1>Logo</h1>
      </div>

      <!-- Área del formulario -->
      <div class="form-area">
        <div class="card q-pa-lg">
          <h2 class="q-mb-md">{{ isLogin ? 'Iniciar Sesión' : 'Registro' }}</h2>

          <form @submit.prevent="handleSubmit">
            <!-- Mostrar campo nombre solo si es registro -->
            <div class="form-group q-mb-md" v-if="!isLogin">
              <q-input v-model="name" label="Nombre" type="text" autocomplete="username" outlined dense required />
            </div>

            <div class="form-group q-mb-md" v-if="!isLogin">
              <q-select v-model="selectedRole" :options="roles" label="Rol" outlined dense emit-value map-options
                required   :input-attrs="{ autocomplete: 'off' }" />
            </div>

            <div class="form-group q-mb-md">
              <q-input v-model="email" label="Correo" type="email" autocomplete="username" outlined dense required />
            </div>

            <div class="form-group q-mb-md">
              <input v-model="password" placeholder="Contraseña" type="password" autocomplete="current-password"
                outlined dense required :toggle-password="true" />
            </div>

            <div class="form-group q-mb-md" v-if="!isLogin">
              <input v-model="confirmPassword" placeholder="Confirmar Contraseña" type="password"
                autocomplete="current-password" outlined dense required :toggle-password="true" />
            </div>

            <q-btn type="submit" color="brown-5" class="full-width q-mt-md"
              :label="loading ? 'Cargando...' : (isLogin ? 'Entrar' : 'Registrar')" :loading="loading" />
          </form>

          <div v-if="passwordError" class="error-message text-negative q-mt-sm">{{ passwordError }}</div>

          <!-- Olvidaste contraseña solo en login -->
          <div v-if="isLogin" class="forgot-password q-mt-md">
            <q-btn flat size="sm" color="brown" label="¿Olvidaste tu contraseña?" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, onMounted } from 'vue';
import { postData } from '../Services/jook.js';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../Store/useAunt.js';
import { useQuasar } from 'quasar';

const $q = useQuasar();
const router = useRouter();
const Store = useAuthStore();

const isLogin = ref(true);
const loading = ref(false);

const email = ref('');
const password = ref('');
const name = ref('');
const role = ref('')
const confirmPassword = ref('');
const passwordError = ref('');

const setLoginMode = (mode) => {
  isLogin.value = mode;
  // Limpiar campos al cambiar de modo
  email.value = '';
  password.value = '';
  name.value = '';
  selectedRole.value ='';
  confirmPassword.value = '';
  passwordError.value = '';
};

onMounted(() => {
  // Mostrar el formulario con animación si deseas
});

const handleSubmit = async () => {
  if (isLogin.value) {
    await login();
  } else {
    await register();
  }
};

const login = async () => {
  loading.value = true;
  try {
    const response = await postData('/usuario/login', {
      email: email.value,
      password: password.value
    });

    if (response && response.token) {
      Store.setToken(response.token);

      if (response.user) {
        Store.setUser(response.user);

        // Guardar el rol en localStorage
        localStorage.setItem('userRole', response.user.role);

        // Verificar si el rol es 'admin'
        if (response.user.role === 'admin') {
          Store.setUserRole(response.user.role);
          $q.notify({
            type: 'positive',
            message: 'Inicio de sesión exitoso',
            position: 'top-right'
          });

          // Redirigir a la vista de agregar productos
          router.replace('/Agregar'); // Aquí va la ruta de agregar productos
        } else {
          // Redirigir a la vista normal para clientes o vendedores
          router.replace('/inicio');
        }
      }
    }
  } catch (error) {
    console.error('Error durante el inicio de sesión:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al iniciar sesión',
      position: 'top'
    });
  } finally {
    loading.value = false;
  }
};


const register = async () => {
  loading.value = true;

  if (password.value !== confirmPassword.value) {
    $q.notify({
      type: 'warning',
      message: 'Las contraseñas no coinciden',
      position: 'topt'
    });
    loading.value = false;
    return;
  }

  try {
    const response = await postData('/usuario', {
      name: name.value,
      email: email.value,
      password: password.value,
      role: selectedRole.value
    });

    $q.notify({
      type: 'positive',
      message: 'Usuario registrado con éxito',
      position: 'top'
    });

    setLoginMode(true);
  } catch (error) {
    console.error('Error completo:', error); // <-- Esto es útil para depurar
    const serverMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      'Error al registrar. Intenta nuevamente.';

    if (serverMessage.toLowerCase().includes('correo') && serverMessage.toLowerCase().includes('registrado')) {
      $q.notify({
        type: 'negative',
        message: 'Este correo ya está registrado. Intenta con otro.',
        position: 'top'
      });
    } else {
      $q.notify({
        type: 'negative',
        message: serverMessage,
        position: 'top'
      });
    }
  } finally {
    loading.value = false;
  }
};


const roles = [
  { label: 'Cliente', value: 'cliente' },
];
const selectedRole = ref('cliente');

</script>


<style scoped>
/* Contenedor principal */
.main-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #fff8f1;
  position: relative;
}

/* Botones en la pantalla */
.screen-top-buttons {
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  gap: 10px;
}

.screen-top-buttons button {
  background-color: transparent;
  border: 2px solid #6f4e37;
  color: #6f4e37;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.screen-top-buttons button.active,
.screen-top-buttons button:hover {
  background-color: #6f4e37;
  color: white;
}

/* Contenedor de contenido */
.content {
  display: flex;
  width: 1000px;
  height: 600px;
  background-color: white;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  border-radius: 16px;
  overflow: hidden;
  margin-top: 40px;
}

/* Área del logo */
.logo-area {
  flex: 1;
  background-color: #6f4e37;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: bold;
}

/* Área del formulario */
.form-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card {
  background-color: #ffffff;
  padding: 2rem;
  border-radius: 12px;
  width: 300px;
  color: #000000;
  text-align: center;
}

h2 {
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group input {
  width: 100%;
  padding: 0.7rem;
  margin-top: 0.3rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #fff;
  color: #333;
  font-weight: bold;
}

.form-group input::placeholder {
  color: #aaa;
  font-weight: normal;
}

.form-group input:focus {
  border-color: #6f4e37;
  outline: none;
}

/* Botón de enviar */
.btn {
  background-color: #d2b48c;
  border: none;
  padding: 0.7rem 1.5rem;
  border-radius: 8px;
  color: #6f4e37;
  font-weight: bold;
  cursor: pointer;
  margin-top: 1rem;
}

.btn:hover {
  background-color: #c9a66b;
}

/* Olvidaste contraseña */
.forgot-password {
  margin-top: 1rem;
}

.forgot-password a {
  color: #6f4e37;
  font-size: 0.9rem;
  text-decoration: none;
}

.forgot-password a:hover {
  text-decoration: underline;
}
</style>
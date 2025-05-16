import { defineStore } from 'pinia';
import { ref } from 'vue';
import {jwtDecode} from 'jwt-decode'


export const useAuthStore = defineStore('auth', () => {
  const token = ref(null);
  const user = ref(null);
  const userRole = ref(null);
  const userID = ref()
  
  const setToken = (newToken) => {
    token.value = newToken;
    const tokenDecoded = jwtDecode(String(newToken))
    userID.value = tokenDecoded.uid
    console.log("id de usuario en store" , userID.value)



  };

  const setUser = (newUser) => {
    user.value = newUser;
  };

  const setUserRole = (role) => {
    userRole.value = role;
  };

  const clearAuth = () => {
    token.value = null;
    user.value = null;
    userRole.value = null;
  };

  const isLoggedIn = () => {
    return !!token.value;
  };

  return {
    token,
    user,
    userID,
    userRole,
    setToken,
    setUser,
    setUserRole,
    clearAuth,
    isLoggedIn,
  };
}, { // Configuración de persistencia
  persist: {
    enabled: true, // Habilita la persistencia para este store
    strategies: [
      {
        key: 'auth', // Clave para identificar los datos en el storage
        storage: localStorage, // Puedes usar localStorage o sessionStorage
        // Opcional: Puedes especificar qué estados quieres persistir.  Si no se especifica, todos se guardan.
        paths: ['token', 'user', 'userRole']
      },
    ],
  },
});

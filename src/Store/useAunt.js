import { defineStore } from 'pinia';
import { ref } from 'vue';
import { jwtDecode } from 'jwt-decode';

export const useAuthStore = defineStore('auth', () => {
  const token = ref(null);
  const favorites = ref([]);
  const user = ref(null);
  const userRole = ref(null);
  const userID = ref();

  const setToken = (newToken) => {
    token.value = newToken;
    const tokenDecoded = jwtDecode(String(newToken));
    userID.value = tokenDecoded.uid;
    console.log('id de usuario en store', userID.value);
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
    // Elimina los datos persistidos por pinia-plugin-persist
    localStorage.removeItem('auth'); // 'auth' es la clave que definiste en persist.strategies.key
  };

  const isLoggedIn = () => {
    return !!token.value;
  };

  return {
    token,
    user,
    userID,
    userRole,
    favorites,
    setToken,
    setUser,
    setUserRole,
    clearAuth,
    isLoggedIn,
  };
}, {
  persist: {
    enabled: true,
    strategies: [
      {
        key: 'auth',
        storage: localStorage,
        paths: ['token', 'user', 'userRole'],
      },
    ],
  },
});
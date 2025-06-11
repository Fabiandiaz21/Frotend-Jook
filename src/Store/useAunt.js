// stores/useAunt.js
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
    favorites.value = []; // ← Aquí se limpian los favoritos
    localStorage.removeItem('auth'); // 'auth' es la clave de persistencia
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

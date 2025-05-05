import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAuthStore = defineStore('auth', () => {
  const token = ref('');
  const user = ref(null);
  const isAuthenticated = ref(false);
  const userRole = ref('');

  function setToken(newToken) {
    token.value = newToken || '';
    isAuthenticated.value = !!newToken;
  }

  function setUser(newUser) {
    user.value = newUser;
  }

  function setUserRole(role) {
    userRole.value = role;
  }

  function logout() {
    token.value = '';
    user.value = null;
    userRole.value = '';
    isAuthenticated.value = false;
  }

  return {
    token,
    user,
    isAuthenticated,
    userRole,
    setToken,
    setUser,
    setUserRole,
    logout
  };
}, {
  persist: true
});

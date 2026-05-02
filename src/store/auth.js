import { defineStore } from 'pinia'
import secureStorage from '../utils/secureStorage'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: (() => {
      try {
        const storedUser = secureStorage.getItem('user');
        return typeof storedUser === 'string' ? JSON.parse(storedUser) : storedUser;
      } catch {
        return null;
      }
    })(),
    token: secureStorage.getItem('token') || null,
    role: secureStorage.getItem('role') || null,
    tokenExpiry: secureStorage.getItem('tokenExpiry') || null,
    isInitialized: false,
    expiryCheckInterval: null,
  }),

  actions: {
    async init() {
      if (this.isInitialized) return;

      if (this.isTokenExpired()) {
        this.clearAuth();
      }
      
      this.isInitialized = true;
      this.startExpiryCheck();
    },

    startExpiryCheck() {
      this.stopExpiryCheck();
      
      let lastCheckTime = Date.now();
      this.expiryCheckInterval = setInterval(() => {
        const now = Date.now();
        if (now - lastCheckTime < 60000) return; // Only check every minute
        lastCheckTime = now;

        if (this.isTokenExpired()) {
          this.clearAuth();
          if (typeof window !== 'undefined' && window.location.pathname.startsWith('/student')) {
            window.location.href = '/login';
          }
        }
      }, 60000);
    },

    stopExpiryCheck() {
      if (this.expiryCheckInterval) {
        clearInterval(this.expiryCheckInterval);
        this.expiryCheckInterval = null;
      }
    },

    setAuth(user, token, role = null) {
      const userRole = role || user?.user_metadata?.role || user?.app_metadata?.role || 'student';
      
      this.user = user;
      this.token = token;
      this.role = userRole;
      
      // Token expires in 3 hours
      const expiryTime = Date.now() + (3 * 60 * 60 * 1000);
      this.tokenExpiry = expiryTime;
      
      secureStorage.setItem('token', token);
      secureStorage.setItem('role', userRole);
      secureStorage.setItem('tokenExpiry', expiryTime);
      secureStorage.setItem('user', user);
    },

    clearAuth() {
      this.stopExpiryCheck();
      this.user = null;
      this.token = null;
      this.role = null;
      this.tokenExpiry = null;
      
      secureStorage.removeItem('token');
      secureStorage.removeItem('tokenExpiry');
      secureStorage.removeItem('role');
      secureStorage.removeItem('user');
    },

    isTokenExpired() {
      const expiry = this.tokenExpiry || secureStorage.getItem('tokenExpiry');
      if (!expiry) return false;
      return Date.now() > parseInt(expiry);
    },

    isAuthenticated() {
      if (!this.token || !this.tokenExpiry) return false;
      return Date.now() < parseInt(this.tokenExpiry);
    },

    getTimeRemaining() {
      if (!this.tokenExpiry) return null;
      const remaining = parseInt(this.tokenExpiry) - Date.now();
      if (remaining <= 0) return null;
      
      const hours = Math.floor(remaining / (60 * 60 * 1000));
      const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
      
      return { hours, minutes, totalMs: remaining };
    },

    hasRole(requiredRole) {
      return this.role === requiredRole;
    },

    hasAnyRole(roles) {
      return roles.includes(this.role);
    }
  }
})

/**
 * Backward compatibility wrapper.
 * This allows non-component files (like api.js) to continue using `authStore.token`
 * by proxying it to the active Pinia store instance.
 */
export const authStore = new Proxy({}, {
  get(target, prop) {
    const store = useAuthStore();
    const value = store[prop];
    if (typeof value === 'function') {
      return value.bind(store);
    }
    return value;
  },
  set(target, prop, value) {
    const store = useAuthStore();
    store[prop] = value;
    return true;
  }
});

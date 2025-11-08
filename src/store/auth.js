import { reactive } from 'vue';
import { supabase } from '../supabase';
import secureStorage from '../utils/secureStorage';
import router from '../router';

/**
 * Store manajemen autentikasi.
 * Mengelola state user, token, dan sesi.
 * Uses encrypted localStorage for security.
 */
export const authStore = reactive({
  user: (() => {
    try {
      return secureStorage.getItem('user');
    } catch {
      return null;
    }
  })(),
  token: secureStorage.getItem('token') || null,
  role: secureStorage.getItem('role') || null,
  tokenExpiry: secureStorage.getItem('tokenExpiry') || null,
  isInitialized: false,
  expiryCheckInterval: null,

  /**
   * Init auth store.
   * Setup listener and interval check.
   */
  async init() {
    // Prevent double initialization
    if (this.isInitialized) {
      if (import.meta.env.DEV) {
        console.log('Auth store already initialized, skipping');
      }
      return;
    }

    // Check if token is expired on initialization
    if (this.isTokenExpired()) {
      if (import.meta.env.DEV) {
        console.log('Token expired on init, clearing auth');
      }
      this.clearAuth();
      this.isInitialized = true;
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      this.setAuth(session.user, session.access_token);
    }
    
    // Listen for auth state changes
    supabase.auth.onAuthStateChange((event, session) => {
      if (import.meta.env.DEV) {
        console.log('Auth state change:', event);
      }

      if (event === 'SIGNED_IN' && session) {
        if (this.token !== session.access_token) {
          this.setAuth(session.user, session.access_token);
          setTimeout(() => {
            router.push('/student/dashboard');
          }, 100);
        }
      } else if (event === 'SIGNED_OUT') {
        if (this.user) {
          this.clearAuth();
        }
      }
    });
    
    this.isInitialized = true;
    this.startExpiryCheck();
  },

  /**
   * Start interval to check token expiry.
   */
  startExpiryCheck() {
    this.stopExpiryCheck();

    let lastCheckTime = Date.now();
    this.expiryCheckInterval = setInterval(() => {
      const now = Date.now();
      if (now - lastCheckTime < 60000) {
        return;
      }
      lastCheckTime = now;

      if (this.isTokenExpired()) {
        if (import.meta.env.DEV) {
          console.log('Token expired, auto-logout');
        }
        this.clearAuth();
        if (window.location.pathname.startsWith('/student')) {
          router.push({ name: 'Login' });
        }
      }
    }, 60000);
  },

  /**
   * Stop token expiry check interval.
   */
  stopExpiryCheck() {
    if (this.expiryCheckInterval) {
      clearInterval(this.expiryCheckInterval);
      this.expiryCheckInterval = null;
    }
  },

  /**
   * Set authentication data and persist.
   */
  setAuth(user, token, role) {
    this.user = user;
    this.token = token;
    this.role = role;
    this.isAuthenticated = true;

    secureStorage.setItem('authToken', token);
    secureStorage.setItem('userRole', role);
    secureStorage.setItem('userName', user?.fullname || user?.username || '');
    secureStorage.setItem('tokenExpiry', new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString());

    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    this.startExpiryCheck();
  },

  /**
   * Clear auth state and redirect to login.
   */
  clearAuth() {
    if (import.meta.env.DEV) {
      console.log('Clearing auth state');
    }
    
    this.user = null;
    this.token = null;
    this.role = null;
    this.isAuthenticated = false;

    secureStorage.removeItem('authToken');
    secureStorage.removeItem('userRole');
    secureStorage.removeItem('userName');
    secureStorage.removeItem('tokenExpiry');

    delete apiClient.defaults.headers.common['Authorization'];
    this.stopExpiryCheck();
  },

  /**
   * Check if token is expired.
   * @returns {boolean} True if expired
   */
  isTokenExpired() {
    if (!this.tokenExpiry && !secureStorage.getItem('tokenExpiry')) {
      return true; // No token = expired (security fix)
    }
    
    const expiry = this.tokenExpiry || secureStorage.getItem('tokenExpiry');
    return Date.now() > parseInt(expiry);
  },

  /**
   * Check if user is authenticated.
   * @returns {boolean} True if authenticated
   */
  isAuthenticated() {
    return !!(this.token || secureStorage.getItem('token')) && !this.isTokenExpired();
  },

  /**
   * Get time remaining until token expires.
   * @returns {Object|null} Hours and minutes remaining
   */
  getTimeRemaining() {
    const expiry = this.tokenExpiry || secureStorage.getItem('tokenExpiry');
    if (!expiry) return null;
    
    const remaining = parseInt(expiry) - Date.now();
    if (remaining <= 0) return null;
    
    const hours = Math.floor(remaining / (60 * 60 * 1000));
    const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
    
    return { hours, minutes, totalMs: remaining };
  },

  /**
   * Check if user has specific role.
   * @param {string} requiredRole - Role to check
   * @returns {boolean} True if user has role
   */
  hasRole(requiredRole) {
    return this.role === requiredRole;
  },

  /**
   * Check if user has any of the specified roles.
   * @param {string[]} roles - Array of roles to check
   * @returns {boolean} True if user has any role
   */
  hasAnyRole(roles) {
    return roles.includes(this.role);
  }
});

document.addEventListener('visibilitychange', () => {
  if (import.meta.env.DEV) {
    console.log('Visibility:', document.visibilityState);
  }
});


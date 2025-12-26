import { reactive } from 'vue';
import secureStorage from '../utils/secureStorage';

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
   * Inisialisasi auth store.
   * Setup listener dan interval check.
   */
  async init() {
    // Prevent double initialization
    if (this.isInitialized) {
      return;
    }

    // Check if token is expired on initialization
    if (this.isTokenExpired()) {
      this.clearAuth();
      this.isInitialized = true;
      return;
    }
    
    this.isInitialized = true;

    // Start token expiry check interval
    this.startExpiryCheck();
  },

  /**
   * Start interval to check token expiry.
   */
  startExpiryCheck() {
    // Clear existing interval
    this.stopExpiryCheck();

    let lastCheckTime = Date.now();
    this.expiryCheckInterval = setInterval(() => {
      const now = Date.now();
      if (now - lastCheckTime < 60000) {
        return;
      }
      lastCheckTime = now;

      if (this.isTokenExpired()) {
        this.clearAuth();
        if (window.location.pathname.startsWith('/student')) {
          window.location.href = '/login';
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
   * Set auth data. Handles both JWT and OAuth.
   * Data is encrypted before storing in localStorage.
   * @param {Object} user - User data
   * @param {string} token - Access token
   * @param {string} role - User role (student/lecturer/admin/etc)
   */
  setAuth(user, token, role = null) {
    // Determine role: prioritize explicit role, fallback to metadata
    const userRole = role || user?.user_metadata?.role || user?.app_metadata?.role || 'student';
    
    this.user = user;
    this.token = token;
    this.role = userRole;
    
    // Token expires in 3 hours
    const expiryTime = Date.now() + (3 * 60 * 60 * 1000);
    this.tokenExpiry = expiryTime;
    
    // Store encrypted data
    secureStorage.setItem('token', token);
    secureStorage.setItem('role', userRole);
    secureStorage.setItem('tokenExpiry', expiryTime);
    secureStorage.setItem('user', user);
  },

  /**
   * Clear all auth data.
   */
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

  /**
   * Check if token is expired.
   * @returns {boolean} True if expired
   */
  isTokenExpired() {
    if (!this.tokenExpiry && !secureStorage.getItem('tokenExpiry')) {
      return false;
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

// Cleanup interval when page unloads
window.addEventListener('beforeunload', () => {
  authStore.stopExpiryCheck();
});

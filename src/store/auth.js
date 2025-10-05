import { reactive } from 'vue';
import { supabase } from '../supabase';

/**
 * Store manajemen autentikasi.
 * Mengelola state user, token, dan sesi.
 */
export const authStore = reactive({
  user: (() => {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })(),
  token: localStorage.getItem('token') || null,
  role: localStorage.getItem('role') || null,
  tokenExpiry: localStorage.getItem('tokenExpiry') || null,
  isInitialized: false,
  expiryCheckInterval: null,

  /**
   * Inisialisasi auth store.
   * Setup listener dan interval check.
   */
  async init() {
    // Prevent double initialization
    if (this.isInitialized) {
      console.log('Auth store already initialized, skipping');
      return;
    }

    // Check if token is expired on initialization
    if (this.isTokenExpired()) {
      console.log('Token expired on init, clearing auth');
      this.clearAuth();
      this.isInitialized = true;
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      this.setAuth(session.user, session.access_token);
    }
    
    // Listen for auth state changes but prevent unnecessary redirects
    supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state change detected:', { event, session });

      if (event === 'SIGNED_IN' && session) {
        if (this.token !== session.access_token) { // Only handle if token has changed
          console.log('Handling SIGNED_IN event');
          this.setAuth(session.user, session.access_token);
          // Use setTimeout to ensure reactive state is updated before navigation
          setTimeout(() => {
            if (typeof window !== 'undefined' && window.$router) {
              window.$router.push('/student/dashboard');
            } else {
              window.location.href = '/student/dashboard';
            }
          }, 100);
        } else {
          console.log('Skipping redundant SIGNED_IN handling due to session refresh');
        }
      } else if (event === 'SIGNED_OUT') {
        if (this.user) {
          console.log('Handling SIGNED_OUT event');
          this.clearAuth();
        }
      }

      // Ignore TOKEN_REFRESHED and other events
      if (event === 'TOKEN_REFRESHED') {
        console.log('Ignoring TOKEN_REFRESHED event');
      }
    });
    
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
        console.log('Skipping redundant token check');
        return;
      }
      lastCheckTime = now;

      if (this.isTokenExpired()) {
        console.log('Token expired, auto-logout');
        this.clearAuth();
        if (window.location.pathname.startsWith('/student')) {
          window.location.href = '/login';
        }
      } else {
        console.log('Token still valid, no action taken');
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
   * @param {Object} user - User data
   * @param {string} token - Access token
   * @param {string} role - User role (student/lecturer/admin/etc)
   */
  setAuth(user, token, role = null) {
    console.log('Setting auth:', { user, token: token ? 'present' : 'null', role });
    
    // Determine role: prioritize explicit role, fallback to metadata
    const userRole = role || user?.user_metadata?.role || user?.app_metadata?.role || 'student';
    
    this.user = user;
    this.token = token;
    this.role = userRole;
    
    // Token expires in 3 hours
    const expiryTime = Date.now() + (3 * 60 * 60 * 1000);
    this.tokenExpiry = expiryTime;
    
    localStorage.setItem('token', token);
    localStorage.setItem('role', userRole);
    localStorage.setItem('tokenExpiry', expiryTime.toString());
    try {
      localStorage.setItem('user', JSON.stringify(user));
    } catch {}
    
    console.log('Auth state after setAuth:', {
      user: this.user,
      token: this.token ? 'present' : 'null',
      role: this.role,
      expiry: new Date(expiryTime).toLocaleString(),
      isAuthenticated: this.isAuthenticated()
    });
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
    localStorage.removeItem('token');
    localStorage.removeItem('tokenExpiry');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    // Only sign out Supabase if OAuth was used
    supabase.auth.signOut();
  },

  /**
   * Check if token is expired.
   * @returns {boolean} True if expired
   */
  isTokenExpired() {
    if (!this.tokenExpiry && !localStorage.getItem('tokenExpiry')) {
      return false;
    }
    
    const expiry = this.tokenExpiry || localStorage.getItem('tokenExpiry');
    return Date.now() > parseInt(expiry);
  },

  /**
   * Check if user is authenticated.
   * @returns {boolean} True if authenticated
   */
  isAuthenticated() {
    return !!(this.token || localStorage.getItem('token')) && !this.isTokenExpired();
  },

  /**
   * Get time remaining until token expires.
   * @returns {Object|null} Hours and minutes remaining
   */
  getTimeRemaining() {
    const expiry = this.tokenExpiry || localStorage.getItem('tokenExpiry');
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
  console.log('Document visibility changed:', document.visibilityState);
  if (document.visibilityState === 'hidden') {
    console.log('Tab became inactive');
  } else if (document.visibilityState === 'visible') {
    console.log('Tab became active');
  }
});

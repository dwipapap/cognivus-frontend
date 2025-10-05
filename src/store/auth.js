import { reactive } from 'vue';
import { supabase } from '../supabase';

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

  setAuth(user, token, role = null) {
    console.log('Setting auth:', { user, token: token ? 'present' : 'null', role });
    
    // Determine role based on user data or default to student for OAuth users
    let userRole = role;
    if (!userRole) {
      // If no role provided, check user metadata or default to student
      // For Google OAuth users, default to student unless specified otherwise
      userRole = user?.user_metadata?.role || user?.app_metadata?.role || 'student';
    }
    
  this.user = user;
    this.token = token;
    this.role = userRole;
    
    // Set token expiry to 3 hours from now
    const expiryTime = Date.now() + (3 * 60 * 60 * 1000); // 3 hours in milliseconds
    this.tokenExpiry = expiryTime;
    
    localStorage.setItem('token', token);
    localStorage.setItem('role', userRole);
    localStorage.setItem('tokenExpiry', expiryTime.toString());
    try {
      localStorage.setItem('user', JSON.stringify(user));
    } catch {}
    
    // Store refresh token for session persistence
    if (user?.refresh_token) {
      localStorage.setItem('refresh_token', user.refresh_token);
    }
    
    console.log('Auth state after setAuth:', {
      user: this.user,
      token: this.token ? 'present' : 'null',
      role: this.role,
      expiry: new Date(expiryTime).toLocaleString(),
      isAuthenticated: this.isAuthenticated()
    });
  },

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
    localStorage.removeItem('refresh_token');
    supabase.auth.signOut();
  },

  isTokenExpired() {
    if (!this.tokenExpiry && !localStorage.getItem('tokenExpiry')) {
      return false; // No expiry set
    }
    
    const expiry = this.tokenExpiry || localStorage.getItem('tokenExpiry');
    const now = Date.now();
    const isExpired = now > parseInt(expiry);
    
    if (isExpired) {
      console.log('Token expired:', {
        now: new Date(now).toLocaleString(),
        expiry: new Date(parseInt(expiry)).toLocaleString()
      });
    }
    
    return isExpired;
  },

  isAuthenticated() {
    // Check if token exists and is not expired
    const hasToken = !!(this.token || localStorage.getItem('token'));
    const notExpired = !this.isTokenExpired();
    
    return hasToken && notExpired;
  },

  getTimeRemaining() {
    if (!this.tokenExpiry && !localStorage.getItem('tokenExpiry')) {
      return null;
    }
    
    const expiry = this.tokenExpiry || localStorage.getItem('tokenExpiry');
    const remaining = parseInt(expiry) - Date.now();
    
    if (remaining <= 0) return null;
    
    const hours = Math.floor(remaining / (60 * 60 * 1000));
    const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
    
    return { hours, minutes, totalMs: remaining };
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

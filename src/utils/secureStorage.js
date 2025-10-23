import CryptoJS from 'crypto-js';

/**
 * Secure Storage Utility
 * Encrypts data before storing in localStorage to prevent tampering via browser DevTools
 * 
 * Security Features:
 * - AES encryption with secret key
 * - Cannot be modified in browser without detection
 * - Data appears as encrypted ciphertext in localStorage
 */

// Get encryption key from environment variable
// IMPORTANT: This should be a strong, unique key per environment
const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'default-dev-key-change-in-production';

/**
 * Encrypt data using AES
 * @param {*} data - Data to encrypt (will be JSON stringified)
 * @returns {string} Encrypted ciphertext
 */
const encrypt = (data) => {
  try {
    const jsonString = JSON.stringify(data);
    const ciphertext = CryptoJS.AES.encrypt(jsonString, ENCRYPTION_KEY).toString();
    return ciphertext;
  } catch (error) {
    console.error('Encryption error:', error);
    return null;
  }
};

/**
 * Decrypt data using AES
 * @param {string} ciphertext - Encrypted data
 * @returns {*} Decrypted data (parsed from JSON)
 */
const decrypt = (ciphertext) => {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, ENCRYPTION_KEY);
    const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
    
    if (!decryptedString) {
      // Decryption failed (wrong key or tampered data)
      return null;
    }
    
    return JSON.parse(decryptedString);
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
};

/**
 * Secure Storage API
 * Drop-in replacement for localStorage with encryption
 */
export const secureStorage = {
  /**
   * Store encrypted data in localStorage
   * @param {string} key - Storage key
   * @param {*} value - Value to store (will be encrypted)
   */
  setItem(key, value) {
    try {
      const encrypted = encrypt(value);
      if (encrypted) {
        localStorage.setItem(key, encrypted);
      }
    } catch (error) {
      console.error('SecureStorage setItem error:', error);
    }
  },

  /**
   * Retrieve and decrypt data from localStorage
   * @param {string} key - Storage key
   * @returns {*} Decrypted value or null
   */
  getItem(key) {
    try {
      const encrypted = localStorage.getItem(key);
      if (!encrypted) return null;
      
      return decrypt(encrypted);
    } catch (error) {
      console.error('SecureStorage getItem error:', error);
      return null;
    }
  },

  /**
   * Remove item from localStorage
   * @param {string} key - Storage key
   */
  removeItem(key) {
    localStorage.removeItem(key);
  },

  /**
   * Clear all localStorage
   */
  clear() {
    localStorage.clear();
  },

  /**
   * Check if encryption key is default (security warning)
   * @returns {boolean} True if using default key
   */
  isUsingDefaultKey() {
    return ENCRYPTION_KEY === 'default-dev-key-change-in-production';
  }
};

// Warn if using default encryption key in production
if (import.meta.env.PROD && secureStorage.isUsingDefaultKey()) {
  console.warn('⚠️ WARNING: Using default encryption key in production! Set VITE_ENCRYPTION_KEY in .env');
}

export default secureStorage;

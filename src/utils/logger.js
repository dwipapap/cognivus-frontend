/**
 * Logger Utility
 * Provides conditional logging that only runs in development mode.
 * In production builds, these logs are stripped out automatically.
 * 
 * Usage:
 *   import { logger } from '@/utils/logger';
 *   logger.log('Debug info:', data);        // Only logs in dev
 *   logger.warn('Warning:', issue);         // Only logs in dev
 *   logger.error('Error:', error);          // Always logs
 * 
 * @module utils/logger
 */

const isDev = import.meta.env.DEV;

/**
 * Logger instance with conditional logging based on environment
 */
export const logger = {
  /**
   * Log general information (dev only)
   * @param {...any} args - Arguments to log
   */
  log: (...args) => {
    if (isDev) {
      console.log(...args);
    }
  },

  /**
   * Log warnings (dev only)
   * @param {...any} args - Arguments to log
   */
  warn: (...args) => {
    if (isDev) {
      console.warn(...args);
    }
  },

  /**
   * Log errors (always logged, even in production)
   * @param {...any} args - Arguments to log
   */
  error: (...args) => {
    console.error(...args);
  },

  /**
   * Log with custom emoji prefix (dev only)
   * @param {string} emoji - Emoji to prefix the log
   * @param {...any} args - Arguments to log
   */
  emoji: (emoji, ...args) => {
    if (isDev) {
      console.log(emoji, ...args);
    }
  },

  /**
   * Group logs together (dev only)
   * @param {string} label - Group label
   */
  group: (label) => {
    if (isDev) {
      console.group(label);
    }
  },

  /**
   * End log group (dev only)
   */
  groupEnd: () => {
    if (isDev) {
      console.groupEnd();
    }
  },

  /**
   * Log table data (dev only)
   * @param {any} data - Data to display as table
   */
  table: (data) => {
    if (isDev) {
      console.table(data);
    }
  }
};

export default logger;

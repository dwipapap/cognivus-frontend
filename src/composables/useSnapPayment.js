import { ref, onUnmounted } from 'vue';

/**
 * Composable for Midtrans Snap payment integration
 * Handles dynamic script loading, payment initiation, and callback management
 * 
 * @returns {Object} Payment utilities and state
 */
export function useSnapPayment() {
  const isSnapLoaded = ref(false);
  const isLoading = ref(false);
  const error = ref(null);
  const paymentStatus = ref(null);

  /**
   * Dynamically load Midtrans Snap.js script
   * @returns {Promise<boolean>} Success status
   */
  const loadSnapScript = () => {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      if (window.snap) {
        isSnapLoaded.value = true;
        resolve(true);
        return;
      }

      // Check if script already exists in DOM
      const existingScript = document.getElementById('midtrans-snap-script');
      if (existingScript) {
        existingScript.onload = () => {
          isSnapLoaded.value = true;
          resolve(true);
        };
        return;
      }

      // Create and load script
      const script = document.createElement('script');
      script.id = 'midtrans-snap-script';
      script.src = 'https://app.sandbox.midtrans.com/snap/snap.js'; // Use sandbox for testing
      // For production: 'https://app.midtrans.com/snap/snap.js'
      script.setAttribute('data-client-key', import.meta.env.VITE_MIDTRANS_CLIENT_KEY);
      
      script.onload = () => {
        isSnapLoaded.value = true;
        console.log('✅ Midtrans Snap.js loaded successfully');
        resolve(true);
      };

      script.onerror = (err) => {
        error.value = 'Failed to load Midtrans payment script';
        console.error('❌ Failed to load Snap.js:', err);
        reject(new Error('Failed to load Midtrans script'));
      };

      document.head.appendChild(script);
    });
  };

  /**
   * Initialize Snap payment popup
   * @param {string} snapToken - Transaction token from backend
   * @param {Object} callbacks - Payment event callbacks
   * @returns {Promise<void>}
   */
  const pay = async (snapToken, callbacks = {}) => {
    try {
      isLoading.value = true;
      error.value = null;

      // Ensure Snap.js is loaded
      if (!isSnapLoaded.value) {
        await loadSnapScript();
      }

      if (!window.snap) {
        throw new Error('Midtrans Snap is not available');
      }

      // Default callbacks with user overrides
      const defaultCallbacks = {
        onSuccess: (result) => {
          console.log('✅ Payment success:', result);
          paymentStatus.value = 'success';
          callbacks.onSuccess?.(result);
        },
        onPending: (result) => {
          console.log('⏳ Payment pending:', result);
          paymentStatus.value = 'pending';
          callbacks.onPending?.(result);
        },
        onError: (result) => {
          console.error('❌ Payment error:', result);
          paymentStatus.value = 'error';
          error.value = result.status_message || 'Payment failed';
          callbacks.onError?.(result);
        },
        onClose: () => {
          console.log('🚪 Payment popup closed');
          if (!paymentStatus.value) {
            paymentStatus.value = 'closed';
          }
          callbacks.onClose?.();
        }
      };

      // Trigger Snap popup
      window.snap.pay(snapToken, defaultCallbacks);
    } catch (err) {
      error.value = err.message || 'Failed to initialize payment';
      console.error('Payment initialization error:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Reset payment state
   */
  const resetPaymentState = () => {
    paymentStatus.value = null;
    error.value = null;
    isLoading.value = false;
  };

  /**
   * Cleanup script on unmount (optional, as script can be reused)
   */
  onUnmounted(() => {
    // Keep script loaded for performance, but reset state
    resetPaymentState();
  });

  return {
    isSnapLoaded,
    isLoading,
    error,
    paymentStatus,
    loadSnapScript,
    pay,
    resetPaymentState
  };
}

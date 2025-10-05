import { ref, computed, reactive } from 'vue';

/**
 * Kelola state dan validasi form.
 * @param {Object} initialData - Nilai awal form
 * @param {Object} validationRules - Aturan validasi field
 * @returns {Object} Utilitas form
 */
export function useForm(initialData = {}, validationRules = {}) {
  const formData = reactive({ ...initialData });
  const errors = ref({});
  const isSubmitting = ref(false);
  const isDirty = ref(false);

  /**
   * Aturan validasi bawaan.
   */
  const rules = {
    /** Validasi field wajib diisi */
    required: (value) => {
      if (value === null || value === undefined || value === '') {
        return 'This field is required';
      }
      return null;
    },
    
    /** Validasi format email */
    email: (value) => {
      if (!value) return null;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value) ? null : 'Please enter a valid email address';
    },
    
    /** Validasi panjang minimum */
    minLength: (min) => (value) => {
      if (!value) return null;
      return value.length >= min ? null : `Minimum ${min} characters required`;
    },
    
    /** Validasi panjang maksimum */
    maxLength: (max) => (value) => {
      if (!value) return null;
      return value.length <= max ? null : `Maximum ${max} characters allowed`;
    },
    
    /** Validasi nomor telepon */
    phone: (value) => {
      if (!value) return null;
      const phoneRegex = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s./0-9]*$/;
      return phoneRegex.test(value) ? null : 'Please enter a valid phone number';
    },
    
    /** Validasi URL */
    url: (value) => {
      if (!value) return null;
      try {
        new URL(value);
        return null;
      } catch {
        return 'Please enter a valid URL';
      }
    },
    
    /** Validasi dengan pattern regex */
    pattern: (regex, message = 'Invalid format') => (value) => {
      if (!value) return null;
      return regex.test(value) ? null : message;
    },
    
    /** Validasi kustom */
    custom: (validator) => validator
  };

  const isValid = computed(() => {
    return Object.keys(errors.value).length === 0;
  });

  const hasErrors = computed(() => {
    return Object.keys(errors.value).some(field => errors.value[field]);
  });

  /**
   * Validasi satu field.
   * @param {string} fieldName - Nama field
   * @param {*} value - Nilai field
   * @returns {string|null} Pesan error atau null
   */
  const validateField = (fieldName, value) => {
    const fieldRules = validationRules[fieldName];
    if (!fieldRules) return null;

    const ruleList = Array.isArray(fieldRules) ? fieldRules : [fieldRules];
    
    for (const rule of ruleList) {
      let validator;
      
      if (typeof rule === 'string') {
        validator = rules[rule];
      } else if (typeof rule === 'function') {
        validator = rule;
      } else if (typeof rule === 'object') {
        const { type, ...params } = rule;
        if (type in rules) {
          validator = rules[type](...Object.values(params));
        }
      }
      
      if (validator) {
        const error = validator(value);
        if (error) {
          return error;
        }
      }
    }
    
    return null;
  };

  /**
   * Validasi semua field.
   * @returns {boolean} True jika valid
   */
  const validate = () => {
    const newErrors = {};
    
    Object.keys(validationRules).forEach(fieldName => {
      const error = validateField(fieldName, formData[fieldName]);
      if (error) {
        newErrors[fieldName] = error;
      }
    });
    
    errors.value = newErrors;
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Validasi satu field saja.
   * @param {string} fieldName - Nama field
   * @returns {boolean} True jika valid
   */
  const validateSingleField = (fieldName) => {
    const error = validateField(fieldName, formData[fieldName]);
    if (error) {
      errors.value[fieldName] = error;
    } else {
      delete errors.value[fieldName];
    }
    return !error;
  };

  /** Hapus semua error */
  const clearErrors = () => {
    errors.value = {};
  };

  /**
   * Hapus error field tertentu.
   * @param {string} fieldName - Nama field
   */
  const clearError = (fieldName) => {
    delete errors.value[fieldName];
  };

  /**
   * Set error untuk field.
   * @param {string} fieldName - Nama field
   * @param {string} message - Pesan error
   */
  const setError = (fieldName, message) => {
    errors.value[fieldName] = message;
  };

  /**
   * Set multiple errors.
   * @param {Object} errorObj - Object error
   */
  const setErrors = (errorObj) => {
    errors.value = { ...errors.value, ...errorObj };
  };

  /** Reset form ke nilai awal */
  const reset = () => {
    Object.keys(formData).forEach(key => {
      formData[key] = initialData[key] || '';
    });
    clearErrors();
    isDirty.value = false;
  };

  /**
   * Submit form dengan validasi.
   * @param {Function} submitHandler - Handler untuk submit
   * @returns {Promise} Hasil submit
   */
  const submit = async (submitHandler) => {
    if (isSubmitting.value) return;
    
    isSubmitting.value = true;
    
    try {
      const isFormValid = validate();
      if (!isFormValid) {
        throw new Error('Form validation failed');
      }
      
      const result = await submitHandler(formData);
      return result;
    } catch (error) {
      throw error;
    } finally {
      isSubmitting.value = false;
    }
  };

  /**
   * Update nilai field.
   * @param {string} fieldName - Nama field
   * @param {*} value - Nilai baru
   */
  const updateField = (fieldName, value) => {
    formData[fieldName] = value;
    isDirty.value = true;
    
    if (errors.value[fieldName]) {
      clearError(fieldName);
    }
  };

  /** Tandai form sudah diubah */
  const markDirty = () => {
    isDirty.value = true;
  };

  return {
    // Data
    formData,
    errors: computed(() => errors.value),
    isSubmitting: computed(() => isSubmitting.value),
    isDirty: computed(() => isDirty.value),
    isValid,
    hasErrors,
    
    // Methods
    validate,
    validateSingleField,
    clearErrors,
    clearError,
    setError,
    setErrors,
    reset,
    submit,
    updateField,
    markDirty,
    
    /**
     * Dapatkan props untuk field component.
     * @param {string} fieldName - Nama field
     * @returns {Object} Props untuk v-bind
     */
    getFieldProps: (fieldName) => ({
      modelValue: formData[fieldName],
      error: errors.value[fieldName],
      'onUpdate:modelValue': (value) => updateField(fieldName, value),
      onBlur: () => validateSingleField(fieldName)
    })
  };
}

/**
 * Set aturan validasi umum.
 */
export const commonValidations = {
  email: ['required', 'email'],
  password: ['required', { type: 'minLength', min: 6 }],
  phone: ['phone'],
  name: ['required', { type: 'minLength', min: 2 }],
  username: ['required', { type: 'minLength', min: 2 }]
};
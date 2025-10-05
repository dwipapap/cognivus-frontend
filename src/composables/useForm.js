import { ref, computed, reactive } from 'vue';

export function useForm(initialData = {}, validationRules = {}) {
  // Form data
  const formData = reactive({ ...initialData });
  const errors = ref({});
  const isSubmitting = ref(false);
  const isDirty = ref(false);

  // Validation rules
  const rules = {
    required: (value) => {
      if (value === null || value === undefined || value === '') {
        return 'This field is required';
      }
      return null;
    },
    
    email: (value) => {
      if (!value) return null;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value) ? null : 'Please enter a valid email address';
    },
    
    minLength: (min) => (value) => {
      if (!value) return null;
      return value.length >= min ? null : `Minimum ${min} characters required`;
    },
    
    maxLength: (max) => (value) => {
      if (!value) return null;
      return value.length <= max ? null : `Maximum ${max} characters allowed`;
    },
    
    phone: (value) => {
      if (!value) return null;
      // Allow spaces, digits, and optional + at the start.
      const phoneRegex = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s./0-9]*$/;
      return phoneRegex.test(value) ? null : 'Please enter a valid phone number';
    },
    
    url: (value) => {
      if (!value) return null;
      try {
        new URL(value);
        return null;
      } catch {
        return 'Please enter a valid URL';
      }
    },
    
    pattern: (regex, message = 'Invalid format') => (value) => {
      if (!value) return null;
      return regex.test(value) ? null : message;
    },
    
    custom: (validator) => validator
  };

  // Computed properties
  const isValid = computed(() => {
    return Object.keys(errors.value).length === 0;
  });

  const hasErrors = computed(() => {
    return Object.keys(errors.value).some(field => errors.value[field]);
  });

  // Methods
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

  const validateSingleField = (fieldName) => {
    const error = validateField(fieldName, formData[fieldName]);
    if (error) {
      errors.value[fieldName] = error;
    } else {
      delete errors.value[fieldName];
    }
    return !error;
  };

  const clearErrors = () => {
    errors.value = {};
  };

  const clearError = (fieldName) => {
    delete errors.value[fieldName];
  };

  const setError = (fieldName, message) => {
    errors.value[fieldName] = message;
  };

  const setErrors = (errorObj) => {
    errors.value = { ...errors.value, ...errorObj };
  };

  const reset = () => {
    Object.keys(formData).forEach(key => {
      formData[key] = initialData[key] || '';
    });
    clearErrors();
    isDirty.value = false;
  };

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

  const updateField = (fieldName, value) => {
    formData[fieldName] = value;
    isDirty.value = true;
    
    // Clear error for this field if it exists
    if (errors.value[fieldName]) {
      clearError(fieldName);
    }
  };

  // Watch for changes to mark form as dirty
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
    
    // Field helpers
    getFieldProps: (fieldName) => ({
      modelValue: formData[fieldName],
      error: errors.value[fieldName],
      'onUpdate:modelValue': (value) => updateField(fieldName, value),
      onBlur: () => validateSingleField(fieldName)
    })
  };
}

// Predefined validation rule sets
export const commonValidations = {
  email: ['required', 'email'],
  password: ['required', { type: 'minLength', min: 6 }],
  phone: ['phone'],
  name: ['required', { type: 'minLength', min: 2 }],
  username: ['required', { type: 'minLength', min: 2 }]
};
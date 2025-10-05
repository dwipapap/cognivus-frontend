<script setup>
import { ref, computed, useSlots } from 'vue';

// Props definition
const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  type: {
    type: String,
    default: 'text',
    validator: (value) => ['text', 'email', 'password', 'tel', 'number', 'url', 'search', 'date'].includes(value)
  },
  label: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
  },
  error: {
    type: String,
    default: ''
  },
  required: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  readonly: {
    type: Boolean,
    default: false
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'filled', 'outline'].includes(value)
  },
  icon: {
    type: String,
    default: ''
  },
  iconPosition: {
    type: String,
    default: 'left',
    validator: (value) => ['left', 'right'].includes(value)
  }
});

// Emits definition
const emit = defineEmits(['update:modelValue', 'focus', 'blur', 'input']);

// Refs
const inputRef = ref(null);
const slots = useSlots();

// Computed properties
const inputId = computed(() => `input-${Math.random().toString(36).substr(2, 9)}`);

const inputClasses = computed(() => {
  const baseClasses = 'block w-full rounded-lg border text-gray-900 transition-colors focus:ring-2 focus:outline-none';
  
  const sizeClasses = {
    sm: 'text-sm p-2',
    md: 'text-sm p-2.5',
    lg: 'text-base p-3'
  };
  
  const variantClasses = {
    default: props.error 
      ? 'bg-red-50 border-red-300 text-red-900 placeholder-red-700 focus:ring-red-500 focus:border-red-500'
      : 'bg-gray-50 border-gray-300 focus:ring-blue-500 focus:border-blue-500',
    filled: props.error
      ? 'bg-red-100 border-red-300 text-red-900 placeholder-red-700 focus:ring-red-500 focus:border-red-500'
      : 'bg-blue-50 border-blue-300 focus:ring-blue-500 focus:border-blue-500',
    outline: props.error
      ? 'bg-transparent border-red-300 text-red-900 placeholder-red-700 focus:ring-red-500 focus:border-red-500'
      : 'bg-transparent border-gray-300 focus:ring-blue-500 focus:border-blue-500'
  };
  
  const disabledClasses = props.disabled 
    ? 'opacity-50 cursor-not-allowed' 
    : '';
  
  const paddingClasses = (props.icon || slots.icon) 
    ? (props.iconPosition === 'left' ? 'pl-10' : 'pr-10')
    : '';
  
  return [
    baseClasses,
    sizeClasses[props.size],
    variantClasses[props.variant],
    disabledClasses,
    paddingClasses
  ].join(' ');
});

const labelClasses = computed(() => {
  const baseClasses = 'block mb-2 text-sm font-medium';
  const colorClasses = props.error ? 'text-red-700' : 'text-gray-900';
  return `${baseClasses} ${colorClasses}`;
});

// Methods
const handleInput = (event) => {
  const value = event.target.value;
  emit('update:modelValue', value);
  emit('input', event);
};

const handleFocus = (event) => {
  emit('focus', event);
};

const handleBlur = (event) => {
  emit('blur', event);
};

const handleKeydown = (event) => {
  // Ensure space key is allowed in input fields
  if (event.key === ' ') {
    event.stopPropagation();
  }
};

const focus = () => {
  inputRef.value?.focus();
};

// Expose methods
defineExpose({
  focus,
  blur: () => inputRef.value?.blur(),
  select: () => inputRef.value?.select()
});
</script>

<template>
  <div class="w-full">
    <!-- Label -->
    <label 
      v-if="label" 
      :for="inputId" 
      :class="labelClasses"
    >
      {{ label }}
      <span v-if="required" class="text-red-500 ml-1">*</span>
    </label>

    <!-- Input Container -->
    <div class="relative">
      <!-- Left Icon -->
      <div 
        v-if="(icon || slots.icon) && iconPosition === 'left'" 
        class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"
      >
        <slot name="icon">
          <svg class="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
            <!-- Default user icon -->
            <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
          </svg>
        </slot>
      </div>

      <!-- Input Element -->
      <input
        :id="inputId"
        ref="inputRef"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :required="required"
        :disabled="disabled"
        :readonly="readonly"
        :class="inputClasses"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
        @keydown="handleKeydown"
      />

      <!-- Right Icon -->
      <div 
        v-if="(icon || slots.icon) && iconPosition === 'right'" 
        class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none"
      >
        <slot name="icon">
          <svg class="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
            <!-- Default icon -->
            <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
          </svg>
        </slot>
      </div>
    </div>

    <!-- Error Message -->
    <p v-if="error" class="mt-2 text-sm text-red-600">
      {{ error }}
    </p>

    <!-- Help Text Slot -->
    <div v-if="slots.help" class="mt-2 text-sm text-gray-600">
      <slot name="help"></slot>
    </div>
  </div>
</template>
<script setup>
import { ref, computed } from 'vue';

// Props definition
const props = defineProps({
  modelValue: {
    type: [String, Number, Boolean, Object],
    default: ''
  },
  options: {
    type: Array,
    default: () => []
  },
  label: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'Select an option'
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
  valueKey: {
    type: String,
    default: 'value'
  },
  labelKey: {
    type: String,
    default: 'label'
  },
  multiple: {
    type: Boolean,
    default: false
  }
});

// Emits definition
const emit = defineEmits(['update:modelValue', 'change']);

// Refs
const selectRef = ref(null);

// Computed properties
const selectId = computed(() => `select-${Math.random().toString(36).substr(2, 9)}`);

const selectClasses = computed(() => {
  const baseClasses = 'block w-full rounded-lg border text-gray-900 transition-colors focus:ring-2 focus:outline-none cursor-pointer';
  
  const sizeClasses = {
    sm: 'text-sm p-2',
    md: 'text-sm p-2.5',
    lg: 'text-base p-3'
  };
  
  const variantClasses = {
    default: props.error 
      ? 'bg-red-50 border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500'
      : 'bg-gray-50 border-gray-300 focus:ring-blue-500 focus:border-blue-500',
    filled: props.error
      ? 'bg-red-100 border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500'
      : 'bg-blue-50 border-blue-300 focus:ring-blue-500 focus:border-blue-500',
    outline: props.error
      ? 'bg-transparent border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500'
      : 'bg-transparent border-gray-300 focus:ring-blue-500 focus:border-blue-500'
  };
  
  const disabledClasses = props.disabled 
    ? 'opacity-50 cursor-not-allowed' 
    : '';
  
  return [
    baseClasses,
    sizeClasses[props.size],
    variantClasses[props.variant],
    disabledClasses
  ].join(' ');
});

const labelClasses = computed(() => {
  const baseClasses = 'block mb-2 text-sm font-medium';
  const colorClasses = props.error ? 'text-red-700' : 'text-gray-900';
  return `${baseClasses} ${colorClasses}`;
});

const normalizedOptions = computed(() => {
  return props.options.map(option => {
    if (typeof option === 'string' || typeof option === 'number') {
      return { [props.valueKey]: option, [props.labelKey]: option };
    }
    return option;
  });
});

// Methods
const handleChange = (event) => {
  const value = event.target.value;
  emit('update:modelValue', value);
  emit('change', value);
};

const focus = () => {
  selectRef.value?.focus();
};

// Expose methods
defineExpose({
  focus,
  blur: () => selectRef.value?.blur()
});
</script>

<template>
  <div class="w-full">
    <!-- Label -->
    <label 
      v-if="label" 
      :for="selectId" 
      :class="labelClasses"
    >
      {{ label }}
      <span v-if="required" class="text-red-500 ml-1">*</span>
    </label>

    <!-- Select Element -->
    <select
      :id="selectId"
      ref="selectRef"
      :value="modelValue"
      :required="required"
      :disabled="disabled"
      :multiple="multiple"
      :class="selectClasses"
      @change="handleChange"
    >
      <!-- Placeholder option -->
      <option 
        v-if="!multiple && placeholder" 
        value="" 
        disabled
        :selected="modelValue === ''"
      >
        {{ placeholder }}
      </option>

      <!-- Options -->
      <option
        v-for="option in normalizedOptions"
        :key="option[valueKey]"
        :value="option[valueKey]"
      >
        {{ option[labelKey] }}
      </option>
    </select>

    <!-- Error Message -->
    <p v-if="error" class="mt-2 text-sm text-red-600">
      {{ error }}
    </p>

    <!-- Help Text Slot -->
    <div v-if="$slots.help" class="mt-2 text-sm text-gray-600">
      <slot name="help"></slot>
    </div>
  </div>
</template>
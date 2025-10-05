<script setup>
import { ref, computed } from 'vue';

// Props definition
const props = defineProps({
  modelValue: {
    type: String,
    default: ''
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
  rows: {
    type: Number,
    default: 4
  },
  resize: {
    type: String,
    default: 'vertical',
    validator: (value) => ['none', 'vertical', 'horizontal', 'both'].includes(value)
  },
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'filled', 'outline'].includes(value)
  },
  maxlength: {
    type: Number,
    default: null
  },
  showCount: {
    type: Boolean,
    default: false
  }
});

// Emits definition
const emit = defineEmits(['update:modelValue', 'focus', 'blur', 'input']);

// Refs
const textareaRef = ref(null);

// Computed properties
const textareaId = computed(() => `textarea-${Math.random().toString(36).substr(2, 9)}`);

const textareaClasses = computed(() => {
  const baseClasses = 'block w-full rounded-lg border text-gray-900 transition-colors focus:ring-2 focus:outline-none p-2.5 text-sm';
  
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
    
  const resizeClasses = {
    none: 'resize-none',
    vertical: 'resize-y',
    horizontal: 'resize-x',
    both: 'resize'
  };
  
  return [
    baseClasses,
    variantClasses[props.variant],
    disabledClasses,
    resizeClasses[props.resize]
  ].join(' ');
});

const labelClasses = computed(() => {
  const baseClasses = 'block mb-2 text-sm font-medium';
  const colorClasses = props.error ? 'text-red-700' : 'text-gray-900';
  return `${baseClasses} ${colorClasses}`;
});

const characterCount = computed(() => {
  return props.modelValue?.length || 0;
});

const isOverLimit = computed(() => {
  return props.maxlength && characterCount.value > props.maxlength;
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
  // Ensure space key is allowed in textarea fields
  if (event.key === ' ') {
    event.stopPropagation();
  }
};

const focus = () => {
  textareaRef.value?.focus();
};

// Expose methods
defineExpose({
  focus,
  blur: () => textareaRef.value?.blur(),
  select: () => textareaRef.value?.select()
});
</script>

<template>
  <div class="w-full">
    <!-- Label -->
    <label 
      v-if="label" 
      :for="textareaId" 
      :class="labelClasses"
    >
      {{ label }}
      <span v-if="required" class="text-red-500 ml-1">*</span>
    </label>

    <!-- Textarea Element -->
    <textarea
      :id="textareaId"
      ref="textareaRef"
      :value="modelValue"
      :placeholder="placeholder"
      :required="required"
      :disabled="disabled"
      :readonly="readonly"
      :rows="rows"
      :maxlength="maxlength"
      :class="textareaClasses"
      @input="handleInput"
      @focus="handleFocus"
      @blur="handleBlur"
      @keydown="handleKeydown"
    ></textarea>

    <!-- Character Count -->
    <div v-if="showCount || maxlength" class="flex justify-between mt-1">
      <div></div>
      <div 
        :class="[
          'text-xs',
          isOverLimit ? 'text-red-600' : 'text-gray-500'
        ]"
      >
        <span v-if="showCount">{{ characterCount }}</span>
        <span v-if="maxlength">{{ showCount ? '/' : '' }}{{ maxlength }}</span>
      </div>
    </div>

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
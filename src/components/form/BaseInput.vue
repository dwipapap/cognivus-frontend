<script setup>
import { ref, computed, useSlots } from 'vue';
import { useId } from '../../composables/useId';

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  type: {
    type: String,
    default: 'text',
    validator: (value) => {
      const allowed = ['text', 'email', 'password', 'tel', 'number', 'url', 'search', 'date', 'time', 'datetime-local'];
      if (!allowed.includes(value)) {
        console.error(`Invalid input type "${value}". Allowed types:`, allowed);
        return false;
      }
      return true;
    }
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

const emit = defineEmits(['update:modelValue', 'focus', 'blur', 'input']);

const inputRef = ref(null);
const slots = useSlots();

const inputId = computed(() => useId('input'));

const errorId = computed(() => props.error ? useId('input-error') : '');
const helpId = computed(() => slots.help ? useId('input-help') : '');

const describedBy = computed(() => {
  const parts = [];
  if (errorId.value) parts.push(errorId.value);
  if (helpId.value) parts.push(helpId.value);
  return parts.length ? parts.join(' ') : undefined;
});

const inputClasses = computed(() => {
  const baseClasses = 'block w-full rounded-token-lg border text-ink transition-colors duration-token-default focus:ring-2 focus:outline-none';

  const sizeClasses = {
    sm: 'text-sm p-2',
    md: 'text-sm p-2.5',
    lg: 'text-base p-3'
  };

  const variantClasses = {
    default: props.error
      ? 'bg-red-50 border-red-300 text-red-900 placeholder-red-700 focus:ring-red-500 focus:border-red-500'
      : 'bg-surface-subtle border-divider focus:ring-brand-primary-ring focus:border-brand-primary',
    filled: props.error
      ? 'bg-red-100 border-red-300 text-red-900 placeholder-red-700 focus:ring-red-500 focus:border-red-500'
      : 'bg-blue-50 border-blue-300 focus:ring-brand-primary-ring focus:border-brand-primary',
    outline: props.error
      ? 'bg-transparent border-red-300 text-red-900 placeholder-red-700 focus:ring-red-500 focus:border-red-500'
      : 'bg-transparent border-divider focus:ring-brand-primary-ring focus:border-brand-primary'
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
  const colorClasses = props.error ? 'text-red-700' : 'text-ink';
  return `${baseClasses} ${colorClasses}`;
});

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
  if (event.key === ' ') {
    event.stopPropagation();
  }
};

const focus = () => {
  inputRef.value?.focus();
};

defineExpose({
  focus,
  blur: () => inputRef.value?.blur(),
  select: () => inputRef.value?.select()
});
</script>

<template>
  <div class="w-full">
    <label
      v-if="label"
      :for="inputId"
      :class="labelClasses"
    >
      {{ label }}
      <span v-if="required" class="text-brand-danger ml-1">*</span>
    </label>

    <div class="relative">
      <div
        v-if="(icon || slots.icon) && iconPosition === 'left'"
        class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"
      >
        <slot name="icon">
          <svg class="w-4 h-4 text-ink-muted" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
          </svg>
        </slot>
      </div>

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
        :aria-describedby="describedBy"
        :aria-invalid="!!error"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
        @keydown="handleKeydown"
      />

      <div
        v-if="(icon || slots.icon) && iconPosition === 'right'"
        class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none"
      >
        <slot name="icon">
          <svg class="w-4 h-4 text-ink-muted" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
          </svg>
        </slot>
      </div>
    </div>

    <p v-if="error" :id="errorId" class="mt-2 text-sm text-brand-danger">
      {{ error }}
    </p>

    <div v-if="slots.help" :id="helpId" class="mt-2 text-sm text-ink-muted">
      <slot name="help"></slot>
    </div>
  </div>
</template>

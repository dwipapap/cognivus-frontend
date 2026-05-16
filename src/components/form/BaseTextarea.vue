<script setup>
import { ref, computed } from 'vue';
import { useId } from '../../composables/useId';

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

const emit = defineEmits(['update:modelValue', 'focus', 'blur', 'input']);

const textareaRef = ref(null);

const textareaId = computed(() => useId('textarea'));

const errorId = computed(() => props.error ? useId('textarea-error') : '');
const helpId = computed(() => emit('help') ? useId('textarea-help') : '');

const describedBy = computed(() => {
  const parts = [];
  if (errorId.value) parts.push(errorId.value);
  return parts.length ? parts.join(' ') : undefined;
});

const textareaClasses = computed(() => {
  const baseClasses = 'block w-full rounded-token-lg border text-ink transition-colors duration-token-default focus:ring-2 focus:outline-none p-2.5 text-sm';

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
  const colorClasses = props.error ? 'text-red-700' : 'text-ink';
  return `${baseClasses} ${colorClasses}`;
});

const characterCount = computed(() => {
  return props.modelValue?.length || 0;
});

const isOverLimit = computed(() => {
  return props.maxlength && characterCount.value > props.maxlength;
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
  textareaRef.value?.focus();
};

defineExpose({
  focus,
  blur: () => textareaRef.value?.blur(),
  select: () => textareaRef.value?.select()
});
</script>

<template>
  <div class="w-full">
    <label
      v-if="label"
      :for="textareaId"
      :class="labelClasses"
    >
      {{ label }}
      <span v-if="required" class="text-brand-danger ml-1">*</span>
    </label>

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
      :aria-describedby="describedBy"
      :aria-invalid="!!error"
      @input="handleInput"
      @focus="handleFocus"
      @blur="handleBlur"
      @keydown="handleKeydown"
    ></textarea>

    <div v-if="showCount || maxlength" class="flex justify-between mt-1">
      <div></div>
      <div
        :class="[
          'text-xs',
          isOverLimit ? 'text-brand-danger' : 'text-ink-muted'
        ]"
      >
        <span v-if="showCount">{{ characterCount }}</span>
        <span v-if="maxlength">{{ showCount ? '/' : '' }}{{ maxlength }}</span>
      </div>
    </div>

    <p v-if="error" :id="errorId" class="mt-2 text-sm text-brand-danger">
      {{ error }}
    </p>

    <div v-if="$slots.help" :id="helpId" class="mt-2 text-sm text-ink-muted">
      <slot name="help"></slot>
    </div>
  </div>
</template>

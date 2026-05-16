<script setup>
import { ref, computed } from 'vue';
import { useId } from '../../composables/useId';

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

const emit = defineEmits(['update:modelValue', 'change']);

const selectRef = ref(null);

const selectId = computed(() => useId('select'));

const errorId = computed(() => props.error ? useId('select-error') : '');
const helpId = computed(() => emit('help') ? useId('select-help') : '');

const describedBy = computed(() => {
  const parts = [];
  if (errorId.value) parts.push(errorId.value);
  return parts.length ? parts.join(' ') : undefined;
});

const selectClasses = computed(() => {
  const baseClasses = 'block w-full rounded-token-lg border text-ink transition-colors duration-token-default focus:ring-2 focus:outline-none cursor-pointer';

  const sizeClasses = {
    sm: 'text-sm p-2',
    md: 'text-sm p-2.5',
    lg: 'text-base p-3'
  };

  const variantClasses = {
    default: props.error
      ? 'bg-red-50 border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500'
      : 'bg-surface-subtle border-divider focus:ring-brand-primary-ring focus:border-brand-primary',
    filled: props.error
      ? 'bg-red-100 border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500'
      : 'bg-blue-50 border-blue-300 focus:ring-brand-primary-ring focus:border-brand-primary',
    outline: props.error
      ? 'bg-transparent border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500'
      : 'bg-transparent border-divider focus:ring-brand-primary-ring focus:border-brand-primary'
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
  const colorClasses = props.error ? 'text-red-700' : 'text-ink';
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

const handleChange = (event) => {
  const value = event.target.value;
  emit('update:modelValue', value);
  emit('change', value);
};

const focus = () => {
  selectRef.value?.focus();
};

defineExpose({
  focus,
  blur: () => selectRef.value?.blur()
});
</script>

<template>
  <div class="w-full">
    <label
      v-if="label"
      :for="selectId"
      :class="labelClasses"
    >
      {{ label }}
      <span v-if="required" class="text-brand-danger ml-1">*</span>
    </label>

    <select
      :id="selectId"
      ref="selectRef"
      :value="modelValue"
      :required="required"
      :disabled="disabled"
      :multiple="multiple"
      :class="selectClasses"
      :aria-describedby="describedBy"
      :aria-invalid="!!error"
      @change="handleChange"
    >
      <option
        v-if="!multiple && placeholder && !$slots.default"
        value=""
        disabled
        :selected="modelValue === ''"
      >
        {{ placeholder }}
      </option>

      <slot v-if="$slots.default"></slot>

      <option
        v-else
        v-for="option in normalizedOptions"
        :key="option[valueKey]"
        :value="option[valueKey]"
      >
        {{ option[labelKey] }}
      </option>
    </select>

    <p v-if="error" :id="errorId" class="mt-2 text-sm text-brand-danger">
      {{ error }}
    </p>

    <div v-if="$slots.help" :id="helpId" class="mt-2 text-sm text-ink-muted">
      <slot name="help"></slot>
    </div>
  </div>
</template>

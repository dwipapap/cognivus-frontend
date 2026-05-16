<script setup>
import { computed } from 'vue';

const props = defineProps({
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['xs', 'sm', 'md', 'lg', 'xl'].includes(value)
  },
  color: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'success', 'danger', 'warning', 'info', 'ink'].includes(value)
  },
  variant: {
    type: String,
    default: 'spin',
    validator: (value) => ['spin', 'pulse', 'ping'].includes(value)
  },
  text: {
    type: String,
    default: ''
  },
  overlay: {
    type: Boolean,
    default: false
  },
  center: {
    type: Boolean,
    default: false
  }
});

const spinnerClasses = computed(() => {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const colorClasses = {
    primary: 'text-brand-primary',
    success: 'text-brand-success',
    danger: 'text-brand-danger',
    warning: 'text-brand-warning',
    info: 'text-brand-info',
    ink: 'text-ink'
  };

  const variantClasses = {
    spin: 'animate-spin',
    pulse: 'animate-pulse',
    ping: 'animate-ping'
  };

  return [
    sizeClasses[props.size],
    colorClasses[props.color],
    variantClasses[props.variant]
  ].join(' ');
});

const containerClasses = computed(() => {
  const baseClasses = 'flex items-center';
  const centerClasses = props.center ? 'justify-center' : '';
  const overlayClasses = props.overlay
    ? 'fixed inset-0 bg-surface/75 z-50'
    : '';

  return [baseClasses, centerClasses, overlayClasses].filter(Boolean).join(' ');
});

const textClasses = computed(() => {
  const sizeMap = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  };

  return [
    'text-ink-muted font-medium',
    sizeMap[props.size]
  ].join(' ');
});
</script>

<template>
  <div :class="containerClasses">
    <svg
      :class="spinnerClasses"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <template v-if="variant === 'spin'">
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        ></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </template>

      <template v-else-if="variant === 'pulse'">
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
          fill="none"
        ></circle>
      </template>

      <template v-else-if="variant === 'ping'">
        <circle
          cx="12"
          cy="12"
          r="6"
          fill="currentColor"
        ></circle>
      </template>
    </svg>

    <span
      v-if="text"
      :class="textClasses"
      class="ml-3"
    >
      {{ text }}
    </span>

    <span
      v-else-if="$slots.default"
      :class="textClasses"
      class="ml-3"
    >
      <slot></slot>
    </span>
  </div>
</template>

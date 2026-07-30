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
  text: { type: String, default: '' },
  overlay: { type: Boolean, default: false },
  center: { type: Boolean, default: false }
});

const SIZES = {
  xs: ['w-3 h-3', 'text-xs'],
  sm: ['w-4 h-4', 'text-sm'],
  md: ['w-6 h-6', 'text-sm'],
  lg: ['w-8 h-8', 'text-base'],
  xl: ['w-12 h-12', 'text-lg']
};

const COLORS = {
  primary: 'text-brand-primary',
  success: 'text-brand-success',
  danger: 'text-brand-danger',
  warning: 'text-brand-warning',
  info: 'text-brand-info',
  ink: 'text-ink'
};

const spinnerClasses = computed(() => [SIZES[props.size][0], COLORS[props.color], 'animate-spin']);
const textClasses = computed(() => ['text-ink-muted font-medium ml-3', SIZES[props.size][1]]);
</script>

<template>
  <div
    class="flex items-center"
    :class="[center && 'justify-center', overlay && 'fixed inset-0 bg-surface/75 z-50']"
  >
    <UIcon name="i-lucide-loader-circle" :class="spinnerClasses" />
    <span v-if="text || $slots.default" :class="textClasses">
      <slot>{{ text }}</slot>
    </span>
  </div>
</template>

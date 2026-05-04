<script setup>
import { computed, useSlots } from 'vue';

// Props definition
const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark', 'link', 'glass', 'glass-primary', 'glass-secondary', 'gradient'].includes(value)
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['xs', 'sm', 'md', 'lg', 'xl'].includes(value)
  },
  type: {
    type: String,
    default: 'button',
    validator: (value) => ['button', 'submit', 'reset'].includes(value)
  },
  disabled: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  block: {
    type: Boolean,
    default: false
  },

  href: {
    type: String,
    default: ''
  },
  target: {
    type: String,
    default: '_self'
  },
  icon: {
    type: Boolean,
    default: false
  },
  iconPosition: {
    type: String,
    default: 'left',
    validator: (value) => ['left', 'right'].includes(value)
  }
});

const emit = defineEmits(['click']);
const slots = useSlots();

const variantConfig = computed(() => {
  const map = {
    primary: { color: 'primary', variant: 'solid' },
    secondary: { color: 'gray', variant: 'outline' },
    success: { color: 'green', variant: 'solid' },
    danger: { color: 'red', variant: 'solid' },
    warning: { color: 'yellow', variant: 'solid' },
    info: { color: 'cyan', variant: 'solid' },
    light: { color: 'gray', variant: 'soft' },
    dark: { color: 'gray', variant: 'solid', class: 'bg-gray-800 hover:bg-gray-900 text-white' },
    link: { color: 'primary', variant: 'link' },
    glass: { color: 'white', variant: 'solid', class: 'glass-button-solid text-gray-700' },
    'glass-primary': { color: 'primary', variant: 'solid', class: 'glass-button-primary-solid text-white hover:text-white' },
    'glass-secondary': { color: 'gray', variant: 'solid', class: 'glass-button-secondary-solid text-gray-600' },
    gradient: { color: 'primary', variant: 'solid', class: 'solid-button text-white hover:text-white' }
  };
  return map[props.variant] || map.primary;
});



const hasIconSlot = computed(() => !!slots.icon);

const handleClick = (event) => {
  if (!props.disabled && !props.loading) {
    emit('click', event);
  }
};
</script>

<template>
  <UButton
    :type="href ? undefined : type"
    :to="href || undefined"
    :target="href ? target : undefined"
    :disabled="disabled"
    :loading="loading"
    :block="block"
    :size="size"
    :color="variantConfig.color"
    :variant="variantConfig.variant"
    :class="['transition-all duration-300 rounded-full', variantConfig.class]"
    @click="handleClick"
  >
    <template #leading v-if="hasIconSlot && iconPosition === 'left'">
      <slot name="icon"></slot>
    </template>
    <slot></slot>
    <template #trailing v-if="hasIconSlot && iconPosition === 'right'">
      <slot name="icon"></slot>
    </template>
  </UButton>
</template>

<style scoped>
/* Glassmorphism Button Styles - Retained for legacy support */
.glass-button-solid {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 4px 16px rgba(31, 38, 135, 0.15);
  will-change: transform;
  transform: translateZ(0);
}

.glass-button-solid:hover {
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 6px 24px rgba(31, 38, 135, 0.2);
  transform: translateY(-1px) translateZ(0);
}

.glass-button-primary-solid {
  background: rgba(37, 99, 235, 0.85);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 16px rgba(37, 99, 235, 0.25);
  will-change: transform;
  transform: translateZ(0);
}

.glass-button-primary-solid:hover {
  background: rgba(37, 99, 235, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 8px 32px rgba(37, 99, 235, 0.35);
  transform: translateY(-2px) translateZ(0);
}

.glass-button-secondary-solid {
  background: rgba(249, 250, 251, 0.7);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  border: 1px solid rgba(209, 213, 219, 0.5);
  box-shadow: 0 4px 16px rgba(156, 163, 175, 0.15);
  will-change: transform;
  transform: translateZ(0);
}

.glass-button-secondary-solid:hover {
  background: rgba(249, 250, 251, 0.85);
  border: 1px solid rgba(209, 213, 219, 0.6);
  box-shadow: 0 6px 24px rgba(156, 163, 175, 0.2);
  transform: translateY(-1px) translateZ(0);
}

.solid-button {
  background: #3b82f6;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 20px rgba(59, 130, 246, 0.35);
  position: relative;
  overflow: hidden;
  will-change: transform;
  transform: translateZ(0);
}

.solid-button:hover {
  background: #2563eb;
  box-shadow: 0 8px 32px rgba(59, 130, 246, 0.45);
  transform: translateY(-2px) translateZ(0);
}

@media (max-width: 640px) {
  .glass-button-solid,
  .glass-button-primary-solid,
  .glass-button-secondary-solid,
  .solid-button {
    backdrop-filter: blur(3px);
    -webkit-backdrop-filter: blur(3px);
  }
}
</style>
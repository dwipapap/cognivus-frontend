<template>
  <UButton
    :type="href ? undefined : type"
    :to="href || undefined"
    :target="href ? target : undefined"
    :disabled="disabled"
    :loading="loading"
    :block="block"
    :color="uiColor"
    :variant="uiVariant"
    :size="size"
    class="rounded-full"
    @click="handleClick"
  >
    <template v-if="hasIconSlot" #leading>
      <slot name="icon" v-if="iconPosition === 'left'"></slot>
    </template>
    
    <slot></slot>
    
    <template v-if="hasIconSlot && iconPosition === 'right'" #trailing>
      <slot name="icon"></slot>
    </template>
  </UButton>
</template>

<script setup>
import { computed, useSlots } from 'vue';

const props = defineProps({
  variant: {
    type: String,
    default: 'primary'
  },
  size: {
    type: String,
    default: 'md'
  },
  type: {
    type: String,
    default: 'button'
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
  rounded: {
    type: String,
    default: 'full'
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
    default: 'left'
  }
});

const emit = defineEmits(['click']);
const slots = useSlots();

const hasIconSlot = computed(() => !!slots.icon);

const uiColor = computed(() => {
  switch (props.variant) {
    case 'primary': return 'blue';
    case 'secondary': return 'gray';
    case 'success': return 'green';
    case 'danger': return 'red';
    case 'warning': return 'yellow';
    case 'info': return 'blue';
    default: return 'blue';
  }
});

const uiVariant = computed(() => {
  if (props.variant === 'secondary') return 'outline';
  if (props.variant.includes('glass')) return 'soft';
  return 'solid';
});

const handleClick = (event) => {
  if (!props.disabled && !props.loading) {
    emit('click', event);
  }
};
</script>


<style scoped>
/* Glassmorphism Button Styles - Solid Color Variants */
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

.glass-button-solid:active {
  transform: translateY(0) translateZ(0);
  box-shadow: 0 2px 8px rgba(31, 38, 135, 0.1);
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

.glass-button-primary-solid:active {
  transform: translateY(0) translateZ(0);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
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

.glass-button-secondary-solid:active {
  transform: translateY(0) translateZ(0);
  box-shadow: 0 2px 8px rgba(156, 163, 175, 0.1);
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

.solid-button:active {
  transform: translateY(0) translateZ(0);
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.25);
}

/* Enhanced focus states for glassmorphism */
.glass-button-solid:focus,
.glass-button-primary-solid:focus,
.glass-button-secondary-solid:focus,
.solid-button:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3), 0 4px 16px rgba(31, 38, 135, 0.15);
}

/* Loading spinner enhancement for glass buttons */
.glass-button-solid .animate-spin,
.glass-button-primary-solid .animate-spin,
.glass-button-secondary-solid .animate-spin,
.solid-button .animate-spin {
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
}

/* Disabled state for glass buttons - Optimized */
.glass-button-solid:disabled,
.glass-button-primary-solid:disabled,
.glass-button-secondary-solid:disabled,
.solid-button:disabled {
  transform: translateZ(0);
  cursor: not-allowed;
  opacity: 0.5;
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
}

/* Responsive improvements - Reduced blur for better performance */
@media (max-width: 640px) {
  .glass-button-solid,
  .glass-button-primary-solid,
  .glass-button-secondary-solid,
  .solid-button {
    backdrop-filter: blur(3px);
    -webkit-backdrop-filter: blur(3px);
  }
}

/* Prefers reduced motion for accessibility and performance */
@media (prefers-reduced-motion: reduce) {
  .glass-button-solid,
  .glass-button-primary-solid,
  .glass-button-secondary-solid,
  .solid-button {
    transition: none;
    transform: none;
  }
  
  .glass-button-solid:hover,
  .glass-button-primary-solid:hover,
  .glass-button-secondary-solid:hover,
  .solid-button:hover {
    transform: none;
  }
}
</style>
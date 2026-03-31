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
  rounded: {
    type: String,
    default: 'full',
    validator: (value) => ['none', 'sm', 'md', 'lg', 'xl', 'full'].includes(value)
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

// Emits definition
const emit = defineEmits(['click']);

// Slots
const slots = useSlots();

// Computed properties
const buttonClasses = computed(() => {
  const baseClasses = 'inline-flex items-center justify-center font-medium text-center transition-all duration-300 focus:ring-4 focus:outline-none relative overflow-hidden';
  
  const variantClasses = {
    // Traditional variants with solid colors
    primary: 'text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-300 disabled:bg-blue-400 shadow-md hover:shadow-lg',
    secondary: 'text-gray-700 bg-white border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 focus:ring-gray-200 disabled:bg-gray-100 shadow-sm hover:shadow-md',
    success: 'text-white bg-green-600 hover:bg-green-700 focus:ring-green-300 disabled:bg-green-400 shadow-md hover:shadow-lg',
    danger: 'text-white bg-red-600 hover:bg-red-700 focus:ring-red-300 disabled:bg-red-400 shadow-md hover:shadow-lg',
    warning: 'text-white bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-300 disabled:bg-yellow-400 shadow-md hover:shadow-lg',
    info: 'text-white bg-cyan-600 hover:bg-cyan-700 focus:ring-cyan-300 disabled:bg-cyan-400 shadow-md hover:shadow-lg',
    light: 'text-gray-800 bg-gray-100 hover:bg-gray-200 focus:ring-gray-200 disabled:bg-gray-50 shadow-sm hover:shadow-md',
    dark: 'text-white bg-gray-700 hover:bg-gray-800 focus:ring-gray-700 disabled:bg-gray-600 shadow-md hover:shadow-lg',
    link: 'text-blue-600 hover:text-blue-800 underline hover:no-underline disabled:text-blue-400',
    
    // Glassmorphism variants with solid colors
    glass: 'glass-button-solid text-gray-700 hover:text-blue-700 focus:ring-blue-300/50 disabled:opacity-40 shadow-md hover:shadow-lg',
    'glass-primary': 'glass-button-primary-solid text-white hover:text-white focus:ring-blue-300/50 disabled:opacity-40 shadow-md hover:shadow-xl',
    'glass-secondary': 'glass-button-secondary-solid text-gray-600 hover:text-gray-800 focus:ring-gray-300/50 disabled:opacity-40 shadow-sm hover:shadow-md',
    gradient: 'solid-button text-white hover:text-white focus:ring-blue-300/50 disabled:opacity-40 shadow-lg hover:shadow-xl'
  };
  
  const sizeClasses = {
    xs: 'px-4 py-2 text-xs gap-1.5',
    sm: 'px-5 py-2 text-sm gap-2',
    md: 'px-6 py-2.5 text-sm gap-2',
    lg: 'px-8 py-3 text-base gap-2.5',
    xl: 'px-10 py-3.5 text-base gap-3'
  };
  
  const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full'
  };
  
  const blockClass = props.block ? 'w-full' : '';
  const disabledClass = (props.disabled || props.loading) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105 active:scale-95';
  const linkClass = props.variant === 'link' ? '' : '';
  
  return [
    baseClasses,
    variantClasses[props.variant],
    props.variant !== 'link' ? sizeClasses[props.size] : 'p-0',
    props.variant !== 'link' ? roundedClasses[props.rounded] : '',
    blockClass,
    disabledClass
  ].filter(Boolean).join(' ');
});

const hasIconSlot = computed(() => !!slots.icon);
const hasDefaultSlot = computed(() => !!slots.default);

// Methods
const handleClick = (event) => {
  if (!props.disabled && !props.loading) {
    emit('click', event);
  }
};

// Component determination
const component = computed(() => props.href ? 'a' : 'button');
</script>

<template>
  <component
    :is="component"
    :type="href ? undefined : type"
    :href="href || undefined"
    :target="href ? target : undefined"
    :disabled="(disabled || loading) && !href"
    :class="buttonClasses"
    @click="handleClick"
  >
    <!-- Loading Spinner -->
    <svg
      v-if="loading"
      class="animate-spin -ml-1 mr-3 h-4 w-4 text-current"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
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
    </svg>

    <!-- Left Icon -->
    <span
      v-if="hasIconSlot && iconPosition === 'left' && !loading"
      :class="hasDefaultSlot ? 'mr-2' : ''"
    >
      <slot name="icon"></slot>
    </span>

    <!-- Button Text -->
    <slot></slot>

    <!-- Right Icon -->
    <span
      v-if="hasIconSlot && iconPosition === 'right' && !loading"
      :class="hasDefaultSlot ? 'ml-2' : ''"
    >
      <slot name="icon"></slot>
    </span>
  </component>
</template>

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
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
    default: 'lg',
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
    // Traditional variants
    primary: 'text-white bg-blue-700 hover:bg-blue-800 focus:ring-blue-300 disabled:bg-blue-400',
    secondary: 'text-gray-900 bg-white border border-gray-300 hover:bg-gray-100 focus:ring-gray-200 disabled:bg-gray-100',
    success: 'text-white bg-green-700 hover:bg-green-800 focus:ring-green-300 disabled:bg-green-400',
    danger: 'text-white bg-red-700 hover:bg-red-800 focus:ring-red-300 disabled:bg-red-400',
    warning: 'text-white bg-yellow-700 hover:bg-yellow-800 focus:ring-yellow-300 disabled:bg-yellow-400',
    info: 'text-white bg-cyan-700 hover:bg-cyan-800 focus:ring-cyan-300 disabled:bg-cyan-400',
    light: 'text-gray-900 bg-gray-100 hover:bg-gray-200 focus:ring-gray-200 disabled:bg-gray-50',
    dark: 'text-white bg-gray-800 hover:bg-gray-900 focus:ring-gray-700 disabled:bg-gray-600',
    link: 'text-blue-600 hover:text-blue-800 underline hover:no-underline disabled:text-blue-400',
    
    // Glassmorphism variants
    glass: 'glass-button text-gray-700 hover:text-blue-700 focus:ring-blue-300/50 disabled:opacity-40',
    'glass-primary': 'glass-button-primary text-white hover:text-white focus:ring-blue-300/50 disabled:opacity-40',
    'glass-secondary': 'glass-button-secondary text-gray-600 hover:text-gray-800 focus:ring-gray-300/50 disabled:opacity-40',
    gradient: 'gradient-button text-white hover:text-white focus:ring-blue-300/50 disabled:opacity-40'
  };
  
  const sizeClasses = {
    xs: 'px-3 py-2 text-xs',
    sm: 'px-3 py-2 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-5 py-3 text-base',
    xl: 'px-6 py-3.5 text-base'
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
  const disabledClass = (props.disabled || props.loading) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';
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
/* Glassmorphism Button Styles - Optimized for Performance */
.glass-button {
  background: rgba(255, 255, 255, 0.45);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 4px 16px rgba(31, 38, 135, 0.2);
  /* Performance optimizations */
  will-change: transform;
  transform: translateZ(0);
}

.glass-button:hover {
  background: rgba(255, 255, 255, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 6px 24px rgba(31, 38, 135, 0.25);
  transform: translateY(-1px) translateZ(0);
}

.glass-button:active {
  transform: translateY(0) translateZ(0);
  box-shadow: 0 2px 8px rgba(31, 38, 135, 0.15);
}

.glass-button-primary {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.5), rgba(147, 51, 234, 0.5));
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.25);
  /* Performance optimizations */
  will-change: transform;
  transform: translateZ(0);
}

.glass-button-primary:hover {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.6), rgba(147, 51, 234, 0.6));
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 6px 24px rgba(59, 130, 246, 0.3);
  transform: translateY(-1px) translateZ(0);
}

.glass-button-primary:active {
  transform: translateY(0) translateZ(0);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
}

.glass-button-secondary {
  background: rgba(249, 250, 251, 0.5);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  border: 1px solid rgba(209, 213, 219, 0.6);
  box-shadow: 0 4px 16px rgba(156, 163, 175, 0.2);
  /* Performance optimizations */
  will-change: transform;
  transform: translateZ(0);
}

.glass-button-secondary:hover {
  background: rgba(249, 250, 251, 0.6);
  border: 1px solid rgba(209, 213, 219, 0.7);
  box-shadow: 0 6px 24px rgba(156, 163, 175, 0.25);
  transform: translateY(-1px) translateZ(0);
}

.glass-button-secondary:active {
  transform: translateY(0) translateZ(0);
  box-shadow: 0 2px 8px rgba(156, 163, 175, 0.15);
}

.gradient-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
  position: relative;
  overflow: hidden;
  /* Performance optimizations */
  will-change: transform;
  transform: translateZ(0);
}

.gradient-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s;
}

.gradient-button:hover {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 6px 24px rgba(102, 126, 234, 0.4);
  transform: translateY(-1px) translateZ(0);
}

.gradient-button:hover::before {
  left: 100%;
}

.gradient-button:active {
  transform: translateY(0) translateZ(0);
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.25);
}

/* Enhanced focus states for glassmorphism */
.glass-button:focus,
.glass-button-primary:focus,
.glass-button-secondary:focus,
.gradient-button:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3), 0 4px 16px rgba(31, 38, 135, 0.15);
}

/* Loading spinner enhancement for glass buttons */
.glass-button .animate-spin,
.glass-button-primary .animate-spin,
.glass-button-secondary .animate-spin,
.gradient-button .animate-spin {
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
}

/* Disabled state for glass buttons - Optimized */
.glass-button:disabled,
.glass-button-primary:disabled,
.glass-button-secondary:disabled,
.gradient-button:disabled {
  transform: translateZ(0);
  cursor: not-allowed;
  opacity: 0.5;
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
}

/* Responsive improvements - Reduced blur for better performance */
@media (max-width: 640px) {
  .glass-button,
  .glass-button-primary,
  .glass-button-secondary,
  .gradient-button {
    backdrop-filter: blur(3px);
    -webkit-backdrop-filter: blur(3px);
  }
}

/* Prefers reduced motion for accessibility and performance */
@media (prefers-reduced-motion: reduce) {
  .glass-button,
  .glass-button-primary,
  .glass-button-secondary,
  .gradient-button {
    transition: none;
    transform: none;
  }
  
  .glass-button:hover,
  .glass-button-primary:hover,
  .glass-button-secondary:hover,
  .gradient-button:hover {
    transform: none;
  }
}
</style>
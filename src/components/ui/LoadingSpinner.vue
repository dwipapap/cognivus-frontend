<script setup>
import { computed } from 'vue';

// Props definition
const props = defineProps({
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['xs', 'sm', 'md', 'lg', 'xl'].includes(value)
  },
  color: {
    type: String,
    default: 'blue',
    validator: (value) => ['blue', 'green', 'red', 'yellow', 'purple', 'pink', 'indigo', 'gray'].includes(value)
  },
  variant: {
    type: String,
    default: 'spin',
    validator: (value) => ['spin', 'pulse', 'ping', 'bounce'].includes(value)
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

// Computed properties
const spinnerClasses = computed(() => {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };
  
  const colorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    red: 'text-red-600',
    yellow: 'text-yellow-600',
    purple: 'text-purple-600',
    pink: 'text-pink-600',
    indigo: 'text-indigo-600',
    gray: 'text-gray-600'
  };
  
  const variantClasses = {
    spin: 'animate-spin',
    pulse: 'animate-pulse',
    ping: 'animate-ping',
    bounce: 'animate-bounce'
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
    ? 'fixed inset-0 bg-white bg-opacity-75 backdrop-blur-sm z-50' 
    : '';
  
  return [baseClasses, centerClasses, overlayClasses].filter(Boolean).join(' ');
});

const textClasses = computed(() => {
  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  };
  
  return [
    'text-gray-600 font-medium',
    sizeClasses[props.size]
  ].join(' ');
});
</script>

<template>
  <div :class="containerClasses">
    <!-- Spinner SVG -->
    <svg
      :class="spinnerClasses"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <!-- Spin variant -->
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
      
      <!-- Pulse variant -->
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
      
      <!-- Ping variant -->
      <template v-else-if="variant === 'ping'">
        <circle
          cx="12"
          cy="12"
          r="6"
          fill="currentColor"
        ></circle>
      </template>
      
      <!-- Bounce variant -->
      <template v-else>
        <circle
          cx="12"
          cy="12"
          r="8"
          fill="currentColor"
        ></circle>
      </template>
    </svg>

    <!-- Loading Text -->
    <span
      v-if="text"
      :class="textClasses"
      class="ml-3"
    >
      {{ text }}
    </span>
    
    <!-- Default slot for custom text -->
    <span
      v-else-if="$slots.default"
      :class="textClasses"
      class="ml-3"
    >
      <slot></slot>
    </span>
  </div>
</template>
<template>
  <div :class="containerClasses">
    <UIcon
      :name="iconName"
      :class="spinnerClasses"
    />

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

<script setup>
import { computed } from 'vue';

const props = defineProps({
  size: {
    type: String,
    default: 'md'
  },
  color: {
    type: String,
    default: 'blue'
  },
  variant: {
    type: String,
    default: 'spin'
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

const iconName = computed(() => {
  switch (props.variant) {
    case 'pulse': return 'i-svg-spinners-pulse-rings-multiple';
    case 'ping': return 'i-svg-spinners-pulse-2';
    case 'bounce': return 'i-svg-spinners-bouncing-ball';
    default: return 'i-svg-spinners-90-ring-with-bg';
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
    blue: 'text-blue-600',
    green: 'text-green-600',
    red: 'text-red-600',
    yellow: 'text-yellow-600',
    purple: 'text-purple-600',
    pink: 'text-pink-600',
    indigo: 'text-indigo-600',
    gray: 'text-gray-600'
  };
  
  return [
    sizeClasses[props.size],
    colorClasses[props.color]
  ].join(' ');
});

const containerClasses = computed(() => {
  const baseClasses = 'flex items-center';
  const centerClasses = props.center ? 'justify-center' : '';
  const overlayClasses = props.overlay 
    ? 'fixed inset-0 bg-white/75 backdrop-blur-sm z-50' 
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
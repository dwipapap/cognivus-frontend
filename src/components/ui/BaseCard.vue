<script setup>
import { computed, useSlots } from 'vue';

const props = defineProps({
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'elevated', 'outlined', 'filled'].includes(value)
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg', 'xl'].includes(value)
  },
  rounded: {
    type: String,
    default: 'lg',
    validator: (value) => ['none', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'].includes(value)
  },
  clickable: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['click']);

const slots = useSlots();

const cardClasses = computed(() => {
  const baseClasses = 'relative bg-surface transition-all duration-token-default';

  const variantClasses = {
    default: 'border border-divider',
    elevated: 'shadow-modal-overlay border-0',
    outlined: 'border-2 border-divider-strong',
    filled: 'bg-surface-subtle border border-divider'
  };

  const sizeClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10'
  };

  const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded-token-sm',
    md: 'rounded-token-md',
    lg: 'rounded-token-lg',
    xl: 'rounded-token-xl',
    '2xl': 'rounded-token-2xl',
    '3xl': 'rounded-token-3xl'
  };

  const interactionClasses = props.clickable
    ? 'cursor-pointer hover:shadow-card-hover focus:outline-none focus:ring-4 focus:ring-brand-primary-ring'
    : '';

  const disabledClasses = props.disabled
    ? 'opacity-50 cursor-not-allowed'
    : '';

  return [
    baseClasses,
    variantClasses[props.variant],
    sizeClasses[props.size],
    roundedClasses[props.rounded],
    interactionClasses,
    disabledClasses
  ].filter(Boolean).join(' ');
});

const hasHeader = computed(() => slots.header || slots.title || slots.actions);
const hasFooter = computed(() => slots.footer || slots.actions);

const handleClick = (event) => {
  if (props.clickable && !props.disabled && !props.loading) {
    emit('click', event);
  }
};
</script>

<template>
  <div
    :class="cardClasses"
    :tabindex="clickable ? 0 : undefined"
    @click="handleClick"
    @keydown.enter="handleClick"
    @keydown.space.prevent="handleClick"
  >
    <div
      v-if="loading"
      class="absolute inset-0 bg-surface/75 flex items-center justify-center z-10 rounded-inherit"
    >
      <svg class="animate-spin h-8 w-8 text-brand-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>

    <header v-if="hasHeader" class="flex items-center justify-between mb-4 pb-4 border-b border-divider">
      <div class="flex-1">
        <slot name="title">
          <slot name="header"></slot>
        </slot>
      </div>

      <div v-if="slots.actions" class="flex items-center space-x-2 ml-4">
        <slot name="actions"></slot>
      </div>
    </header>

    <main class="flex-1">
      <slot></slot>
    </main>

    <footer v-if="hasFooter" class="mt-4 pt-4 border-t border-divider">
      <slot name="footer"></slot>
    </footer>
  </div>
</template>

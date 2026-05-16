<script setup>
import { computed, useSlots } from 'vue';

const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark', 'link'].includes(value)
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

const emit = defineEmits(['click']);

const slots = useSlots();

const buttonClasses = computed(() => {
  const baseClasses = 'inline-flex items-center justify-center font-medium text-center transition-all duration-token-default transition-timing-token-ease focus:outline-none relative';

  const variantClasses = {
    primary: 'text-white bg-brand-primary hover:bg-brand-primary-hover focus:ring-4 focus:ring-brand-primary-ring disabled:bg-brand-primary-disabled shadow-card-rest hover:shadow-card-hover',
    secondary: 'text-ink bg-surface border-2 border-divider hover:bg-surface-subtle hover:border-divider-strong focus:ring-4 focus:ring-brand-primary-ring disabled:bg-surface-subtle shadow-input-rest hover:shadow-card-hover',
    success: 'text-white bg-brand-success hover:bg-brand-success-hover focus:ring-4 focus:ring-brand-success-ring disabled:bg-brand-success-disabled shadow-card-rest hover:shadow-card-hover',
    danger: 'text-white bg-brand-danger hover:bg-brand-danger-hover focus:ring-4 focus:ring-brand-danger-ring disabled:bg-brand-danger-disabled shadow-card-rest hover:shadow-card-hover',
    warning: 'text-white bg-brand-warning hover:bg-brand-warning-hover focus:ring-4 focus:ring-brand-warning-ring disabled:bg-brand-warning-disabled shadow-card-rest hover:shadow-card-hover',
    info: 'text-white bg-brand-info hover:bg-brand-info-hover focus:ring-4 focus:ring-brand-info-ring disabled:bg-brand-info-disabled shadow-card-rest hover:shadow-card-hover',
    light: 'text-ink bg-surface-subtle hover:bg-divider focus:ring-4 focus:ring-brand-primary-ring disabled:bg-surface-subtle shadow-input-rest hover:shadow-card-hover',
    dark: 'text-white bg-ink hover:bg-gray-800 focus:ring-4 focus:ring-brand-primary-ring disabled:bg-ink-muted shadow-card-rest hover:shadow-card-hover',
    link: 'text-brand-primary hover:text-brand-primary-hover underline hover:no-underline disabled:text-brand-primary-disabled'
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
    sm: 'rounded-token-sm',
    md: 'rounded-token-md',
    lg: 'rounded-token-lg',
    xl: 'rounded-token-xl',
    full: 'rounded-token-full'
  };

  const blockClass = props.block ? 'w-full' : '';
  const disabledClass = (props.disabled || props.loading) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';

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

const handleClick = (event) => {
  if (!props.disabled && !props.loading) {
    emit('click', event);
  }
};

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

    <span
      v-if="hasIconSlot && iconPosition === 'left' && !loading"
      :class="hasDefaultSlot ? 'mr-2' : ''"
    >
      <slot name="icon"></slot>
    </span>

    <slot></slot>

    <span
      v-if="hasIconSlot && iconPosition === 'right' && !loading"
      :class="hasDefaultSlot ? 'ml-2' : ''"
    >
      <slot name="icon"></slot>
    </span>
  </component>
</template>

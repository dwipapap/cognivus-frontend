<script setup>
import { computed, useSlots } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (v) => ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark', 'link'].includes(v)
  },
  size: {
    type: String,
    default: 'md',
    validator: (v) => ['xs', 'sm', 'md', 'lg', 'xl'].includes(v)
  },
  type: {
    type: String,
    default: 'button',
    validator: (v) => ['button', 'submit', 'reset'].includes(v)
  },
  disabled: Boolean,
  loading: Boolean,
  block: Boolean,
  rounded: {
    type: String,
    default: 'full',
    validator: (v) => ['none', 'sm', 'md', 'lg', 'xl', 'full'].includes(v)
  },
  href: { type: String, default: '' },
  target: { type: String, default: '_self' },
  icon: Boolean,
  iconPosition: {
    type: String,
    default: 'left',
    validator: (v) => ['left', 'right'].includes(v)
  },
  label: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['click'])
const slots = useSlots()

const buttonColor = computed(() => {
  const map = {
    primary:   { color: 'primary',   variant: 'solid' },
    secondary: { color: 'secondary', variant: 'solid' },
    success:   { color: 'success',   variant: 'solid' },
    danger:    { color: 'error',     variant: 'solid' },
    warning:   { color: 'warning',   variant: 'solid' },
    info:      { color: 'info',      variant: 'solid' },
    light:     { color: 'neutral',   variant: 'subtle' },
    dark:      { color: 'neutral',   variant: 'solid' },
    link:      { color: 'primary',   variant: 'link' }
  }
  return map[props.variant]
})

const roundedClass = computed(() => {
  const map = {
    none: 'rounded-none',
    sm:   'rounded-sm',
    md:   'rounded-md',
    lg:   'rounded-lg',
    xl:   'rounded-xl',
    full: 'rounded-full'
  }
  return map[props.rounded]
})

const tokenRoundedClass = computed(() => {
  const map = {
    none: '',
    sm:   'rounded-token-sm',
    md:   'rounded-token-md',
    lg:   'rounded-token-lg',
    xl:   'rounded-token-xl',
    full: 'rounded-token-full'
  }
  return map[props.rounded]
})

const brandTransitionClass = 'transition-all duration-token-default transition-timing-token-ease'

const handleClick = (e) => {
  if (!props.disabled && !props.loading) emit('click', e)
}
</script>

<template>
  <UButton
    v-if="!href"
    :type="type"
    :color="buttonColor.color"
    :variant="buttonColor.variant"
    :size="size"
    :loading="loading"
    :disabled="disabled"
    :block="block"
    :label="slots.default ? undefined : label"
    :icon="typeof icon === 'string' ? icon : undefined"
    :trailing-icon="typeof icon === 'string' && iconPosition === 'right' ? icon : undefined"
    :class="['justify-center', roundedClass, tokenRoundedClass, brandTransitionClass].filter(Boolean).join(' ')"
    @click="handleClick"
  >
    <slot />
    <template v-if="slots.icon && iconPosition === 'left' && !loading" #leading>
      <slot name="icon" />
    </template>
    <template v-if="slots.icon && iconPosition === 'right' && !loading" #trailing>
      <slot name="icon" />
    </template>
  </UButton>

  <a
    v-else
    :href="href"
    :target="target"
    :class="[
      'inline-flex items-center justify-center font-medium text-center',
      brandTransitionClass,
      roundedClass,
      tokenRoundedClass,
      (disabled || loading) ? 'opacity-50 pointer-events-none' : 'cursor-pointer'
    ]"
    @click="handleClick"
  >
    <slot>{{ label }}</slot>
  </a>
</template>

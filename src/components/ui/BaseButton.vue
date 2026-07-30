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
  icon: Boolean,
  iconPosition: {
    type: String,
    default: 'left',
    validator: (v) => ['left', 'right'].includes(v)
  },
  label: { type: String, default: '' }
})

defineEmits(['click'])
const slots = useSlots()

// ponytail: only reason this component still exists over plain UButton — it maps the
// app's variant names onto nuxt/ui's color+variant pair across 19 call sites.
const buttonColor = computed(() => ({
  primary:   { color: 'primary',   variant: 'solid' },
  secondary: { color: 'secondary', variant: 'solid' },
  success:   { color: 'success',   variant: 'solid' },
  danger:    { color: 'error',     variant: 'solid' },
  warning:   { color: 'warning',   variant: 'solid' },
  info:      { color: 'info',      variant: 'solid' },
  light:     { color: 'neutral',   variant: 'subtle' },
  dark:      { color: 'neutral',   variant: 'solid' },
  link:      { color: 'primary',   variant: 'link' }
}[props.variant]))
</script>

<template>
  <UButton
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
    class="justify-center transition-all duration-token-default"
    @click="$emit('click', $event)"
  >
    <slot />
    <template v-if="slots.icon && iconPosition === 'left' && !loading" #leading>
      <slot name="icon" />
    </template>
    <template v-if="slots.icon && iconPosition === 'right' && !loading" #trailing>
      <slot name="icon" />
    </template>
  </UButton>
</template>

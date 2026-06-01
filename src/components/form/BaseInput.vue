<script setup>
import { computed, useSlots, ref } from 'vue'

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  type: { type: String, default: 'text' },
  placeholder: { type: String, default: '' },
  label: { type: String, default: '' },
  error: { type: String, default: '' },
  disabled: Boolean,
  required: Boolean,
  readonly: Boolean,
  size: {
    type: String,
    default: 'md',
    validator: (v) => ['sm', 'md', 'lg'].includes(v)
  },
  variant: {
    type: String,
    default: 'default',
    validator: (v) => ['default', 'filled', 'outline'].includes(v)
  },
  icon: { type: String, default: '' },
  iconPosition: {
    type: String,
    default: 'left',
    validator: (v) => ['left', 'right'].includes(v)
  },
  name: String,
  id: String,
  autocomplete: String
})

const emit = defineEmits(['update:modelValue', 'focus', 'blur', 'input'])

const slots = useSlots()
const inputRef = ref(null)

const inputId = computed(() => props.id || `input-${Math.random().toString(36).slice(2, 9)}`)

const uinputVariant = computed(() => {
  const map = {
    default: 'outline',
    filled: 'soft',
    outline: 'subtle'
  }
  return map[props.variant]
})

function handleFocus(e) {
  emit('focus', e)
}

function handleBlur(e) {
  emit('blur', e)
}

function handleInput(v) {
  emit('input', { target: { value: v } })
}

function handleKeydown(event) {
  if (event.key === ' ') {
    event.stopPropagation()
  }
}

defineExpose({
  focus: () => inputRef.value?.focus?.(),
  blur: () => inputRef.value?.blur?.(),
  select: () => inputRef.value?.select?.()
})
</script>

<template>
  <div class="flex flex-col gap-1.5 w-full">
    <label
      v-if="label"
      :for="inputId"
      class="text-sm font-medium text-ink"
    >
      {{ label }}
      <span v-if="required" class="text-brand-danger">*</span>
    </label>

    <UInput
      :id="inputId"
      ref="inputRef"
      :model-value="modelValue"
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :required="required"
      :name="name"
      :autocomplete="autocomplete"
      :size="size"
      :variant="uinputVariant"
      :color="error ? 'error' : 'primary'"
      :class="[
        'rounded-token-md',
        'shadow-input-rest',
        'transition-all duration-token-default',
        error ? 'ring-2 ring-brand-danger-ring' : ''
      ]"
      @update:model-value="(v) => emit('update:modelValue', v)"
      @input="handleInput"
      @focus="handleFocus"
      @blur="handleBlur"
      @keydown="handleKeydown"
    >
      <template v-if="(icon || slots.icon) && iconPosition === 'left'" #leading-icon>
        <slot name="icon">
          <svg class="w-4 h-4 text-ink-muted" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
          </svg>
        </slot>
      </template>
      <template v-if="(icon || slots.icon) && iconPosition === 'right'" #trailing-icon>
        <slot name="icon">
          <svg class="w-4 h-4 text-ink-muted" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
          </svg>
        </slot>
      </template>
    </UInput>

    <p v-if="error" class="text-xs text-brand-danger">{{ error }}</p>

    <div v-if="slots.help" class="mt-1 text-sm text-ink-muted">
      <slot name="help" />
    </div>
  </div>
</template>

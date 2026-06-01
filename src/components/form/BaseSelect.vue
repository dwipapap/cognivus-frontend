<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: [String, Number, Object, null], default: null },
  options: { type: Array, required: true },
  placeholder: { type: String, default: 'Select an option' },
  label: { type: String, default: '' },
  error: { type: String, default: '' },
  disabled: Boolean,
  required: Boolean,
  valueKey: { type: String, default: 'value' },
  labelKey: { type: String, default: 'label' }
})

const emit = defineEmits(['update:modelValue'])

const items = computed(() => props.options)

function onUpdate(value) {
  emit('update:modelValue', value)
}
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <label v-if="label" class="text-sm font-medium text-ink">
      {{ label }}
      <span v-if="required" class="text-brand-danger">*</span>
    </label>

    <USelectMenu
      :model-value="modelValue"
      :items="items"
      :placeholder="placeholder"
      :disabled="disabled"
      :value-key="valueKey"
      :label-key="labelKey"
      :color="error ? 'error' : 'primary'"
      :class="[
        'rounded-token-md',
        'shadow-input-rest',
        'transition-all duration-token-default'
      ]"
      @update:model-value="onUpdate"
    />

    <p v-if="error" class="text-xs text-brand-danger">{{ error }}</p>
  </div>
</template>

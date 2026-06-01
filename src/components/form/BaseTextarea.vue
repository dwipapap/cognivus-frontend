<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  label: { type: String, default: '' },
  error: { type: String, default: '' },
  disabled: Boolean,
  required: Boolean,
  rows: { type: Number, default: 4 },
  name: String,
  id: String
})

const emit = defineEmits(['update:modelValue'])

const inputId = computed(() => props.id || `textarea-${Math.random().toString(36).slice(2, 9)}`)
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <label v-if="label" :for="inputId" class="text-sm font-medium text-ink">
      {{ label }}
      <span v-if="required" class="text-brand-danger">*</span>
    </label>

    <UTextarea
      :id="inputId"
      :model-value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      :rows="rows"
      :name="name"
      :color="error ? 'error' : 'primary'"
      :class="[
        'rounded-token-md',
        'shadow-input-rest',
        'transition-all duration-token-default'
      ]"
      @update:model-value="(v) => emit('update:modelValue', v)"
    />

    <p v-if="error" class="text-xs text-brand-danger">{{ error }}</p>
  </div>
</template>

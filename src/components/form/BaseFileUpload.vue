<script setup>
const props = defineProps({
  modelValue: { type: [File, Array], default: null },
  accept: { type: String, default: '' },
  multiple: Boolean,
  label: { type: String, default: 'Upload file' },
  description: { type: String, default: '' },
  disabled: Boolean
})

const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <UFileUpload
    :model-value="modelValue"
    :accept="accept"
    :multiple="multiple"
    :label="label"
    :description="description"
    :disabled="disabled"
    color="primary"
    :class="['rounded-token-lg', 'border-dashed']"
    @update:model-value="(v) => emit('update:modelValue', v)"
  />
</template>

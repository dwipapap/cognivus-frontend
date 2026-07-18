<script setup>
defineProps({
  label: {
    type: String,
    required: true
  },
  error: {
    type: String,
    default: ''
  }
});
</script>

<template>
  <div>
    <label class="block text-base font-bold text-blue-600 mb-3">{{ label }}</label>
    <slot />
    <p v-if="error" class="mt-2 text-sm text-red-600">{{ error }}</p>
  </div>
</template>

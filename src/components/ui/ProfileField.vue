<script setup>
defineProps({
  label: {
    type: String,
    required: true
  },
  value: {
    type: [String, Number],
    default: '-'
  },
  truncate: {
    type: Boolean,
    default: false
  }
});
</script>

<template>
  <div>
    <p class="text-base font-bold text-blue-600 mb-3">{{ label }}</p>
    <div class="bg-blue-200 rounded-full px-6 py-3">
      <p
        class="text-base font-medium text-gray-900"
        :class="{ 'truncate': truncate }"
        :title="truncate ? value : undefined"
      >{{ value || '-' }}</p>
    </div>
  </div>
</template>

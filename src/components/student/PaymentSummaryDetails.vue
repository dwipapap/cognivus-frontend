<script setup>
import IconInfo from '~icons/basil/info-circle-outline'

// ponytail: exists only to stop PaymentSummaryPanel rendering this block twice
// (desktop card + mobile drawer). Not meant for reuse elsewhere.
defineProps({
  studentName: { type: String, default: '' },
  studentEmail: { type: String, default: '' },
  paymentTypeName: { type: String, default: '-' },
  selected: { type: Boolean, default: false },
  total: { type: String, required: true },
  /** Desktop card uses tighter spacing than the drawer */
  compact: { type: Boolean, default: false }
})
</script>

<template>
  <div :class="compact ? 'space-y-3' : 'space-y-4'">
    <div class="flex items-center justify-between">
      <span class="text-sm text-gray-500">Name</span>
      <span class="ml-2 max-w-[60%] truncate text-right text-sm font-semibold text-gray-800">
        {{ studentName }}
      </span>
    </div>
    <div class="flex items-center justify-between">
      <span class="text-sm text-gray-500">Email</span>
      <span class="ml-2 max-w-[60%] truncate text-right text-sm font-semibold text-gray-800">
        {{ studentEmail }}
      </span>
    </div>
    <div class="flex items-center justify-between">
      <span class="text-sm text-gray-500">Payment Type</span>
      <span class="text-sm font-semibold text-gray-800">{{ paymentTypeName }}</span>
    </div>

    <div class="h-px bg-gray-100" :class="compact && 'my-3'"></div>

    <div
      v-if="selected"
      class="flex items-start gap-2 rounded-lg border border-blue-100 bg-blue-50 p-3"
      :class="compact && 'mb-3'"
    >
      <IconInfo class="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
      <p class="text-xs text-blue-700">Please verify the details above before confirming</p>
    </div>

    <div class="flex items-center justify-between">
      <span class="text-base font-bold text-gray-800">Total</span>
      <span class="text-2xl font-bold text-blue-600">{{ total }}</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  isMobile: { type: Boolean, default: false },
  payment: { type: Object, default: null },
  loading: { type: Boolean, default: false },
  getPaymentTypeName: { type: Function, required: true },
  formatCurrency: { type: Function, required: true },
  formatDate: { type: Function, required: true }
})

const emit = defineEmits(['cancel', 'pay'])
const open = defineModel('open', { type: Boolean, default: false })
</script>

<template>
  <UModal
    v-if="!isMobile"
    v-model:open="open"
    title="Continue Payment"
    description="Complete your pending payment."
    :ui="{ footer: 'justify-end' }"
  >
    <template #body>
      <div v-if="payment" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <p class="mb-1 text-xs font-medium text-gray-500">Payment Type</p>
            <p class="text-sm font-semibold text-gray-800">
              {{ getPaymentTypeName(payment.payment_type) }}
            </p>
          </div>
          <div>
            <p class="mb-1 text-xs font-medium text-gray-500">Amount</p>
            <p class="text-sm font-bold text-blue-600">
              {{ formatCurrency(payment.amount) }}
            </p>
          </div>
        </div>
        <div>
          <p class="mb-1 text-xs font-medium text-gray-500">Order ID</p>
          <p class="text-sm font-mono text-gray-700">
            {{ payment.midtrans_orderid }}
          </p>
        </div>
        <div>
          <p class="mb-1 text-xs font-medium text-gray-500">Created</p>
          <p class="text-sm text-gray-700">{{ formatDate(payment.created_at) }}</p>
        </div>
        <div class="flex items-start gap-2 rounded-lg border border-blue-100 bg-blue-50 p-3">
          <UIcon name="i-lucide-info" class="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
          <p class="text-xs text-blue-700">
            You have a pending payment. Click below to reopen the payment window and complete your transaction.
          </p>
        </div>
      </div>
    </template>

    <template #footer>
      <UButton
        label="Cancel"
        color="neutral"
        variant="outline"
        @click="emit('cancel')"
      />
      <UButton
        label="Pay Now"
        color="primary"
        :loading="loading"
        @click="emit('pay')"
      />
    </template>
  </UModal>

  <USlideover
    v-else
    v-model:open="open"
    side="bottom"
    :close="false"
    :ui="{ content: 'rounded-t-2xl min-h-[35vh]' }"
  >
    <template #body>
      <div v-if="payment" class="flex flex-col gap-5 px-6 py-6">
        <div class="flex items-center justify-center">
          <div class="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100">
            <UIcon name="i-lucide-wallet" class="h-7 w-7 text-blue-600" />
          </div>
        </div>
        <div class="text-center">
          <h3 class="text-lg font-bold text-gray-900">Continue Payment</h3>
          <p class="mt-1 text-sm text-gray-500">Complete your pending payment</p>
        </div>
        <div class="space-y-3 rounded-xl bg-gray-50 p-4">
          <div class="flex items-center justify-between">
            <span class="text-xs text-gray-500">Payment Type</span>
            <span class="text-sm font-semibold text-gray-800">
              {{ getPaymentTypeName(payment.payment_type) }}
            </span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-xs text-gray-500">Amount</span>
            <span class="text-sm font-bold text-blue-600">
              {{ formatCurrency(payment.amount) }}
            </span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-xs text-gray-500">Order ID</span>
            <span class="text-xs font-mono text-gray-600">
              {{ payment.midtrans_orderid }}
            </span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-xs text-gray-500">Created</span>
            <span class="text-xs text-gray-600">
              {{ formatDate(payment.created_at) }}
            </span>
          </div>
        </div>
        <div class="flex items-start gap-2 rounded-lg border border-blue-100 bg-blue-50 p-3">
          <UIcon name="i-lucide-info" class="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
          <p class="text-xs text-blue-700">
            You have a pending payment. Tap below to reopen the payment window and complete your transaction.
          </p>
        </div>
        <UButton
          label="Pay Now"
          color="primary"
          size="lg"
          class="w-full rounded-full"
          :loading="loading"
          @click="emit('pay')"
        />
        <UButton
          label="Cancel"
          color="neutral"
          variant="outline"
          size="lg"
          class="w-full rounded-full"
          @click="emit('cancel')"
        />
      </div>
    </template>
  </USlideover>
</template>

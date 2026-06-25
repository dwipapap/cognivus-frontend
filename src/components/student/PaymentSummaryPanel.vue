<script setup>
import BaseButton from '../ui/BaseButton.vue'
import IconClose from '~icons/solar/close-circle-bold'
import IconInfo from '~icons/basil/info-circle-outline'

const props = defineProps({
  studentName: { type: String, default: '' },
  studentEmail: { type: String, default: '' },
  paymentTypeName: { type: String, default: '-' },
  selected: { type: Boolean, default: false },
  amount: { type: Number, default: 0 },
  canPay: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  formatCurrency: { type: Function, required: true }
})

const emit = defineEmits(['cancel', 'pay'])
const open = defineModel('open', { type: Boolean, default: false })

const totalLabel = () => props.selected
  ? props.formatCurrency(props.amount)
  : 'Rp 0'
</script>

<template>
  <div class="hidden lg:block">
    <section
      class="rounded-xl border border-gray-200 bg-white p-5 shadow-md"
      aria-labelledby="payment-summary-title"
    >
      <h2 id="payment-summary-title" class="mb-4 text-lg font-bold text-gray-800">
        Payment Summary
      </h2>

      <div class="mb-5 space-y-3">
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
          <span class="text-sm font-semibold text-gray-800">
            {{ paymentTypeName }}
          </span>
        </div>
        <div class="my-3 h-px bg-gray-100"></div>
        <div
          v-if="selected"
          class="mb-3 flex items-start gap-2 rounded-lg border border-blue-100 bg-blue-50 p-3"
        >
          <IconInfo class="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
          <p class="text-xs text-blue-700">
            Please verify the details above before confirming
          </p>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-base font-bold text-gray-800">Total</span>
          <span class="text-2xl font-bold text-blue-600">{{ totalLabel() }}</span>
        </div>
      </div>

      <BaseButton
        variant="primary"
        size="lg"
        block
        :disabled="!canPay"
        :loading="loading"
        @click="emit('pay')"
      >
        {{ canPay ? 'Confirm & Pay' : 'Select Payment Type' }}
      </BaseButton>

      <p class="mt-3 text-center text-xs text-gray-400">
        {{
          canPay
            ? 'Secure payment powered by Midtrans'
            : 'Choose a payment option to continue'
        }}
      </p>
    </section>
  </div>

  <Transition name="slide-up">
    <div
      v-if="selected"
      class="fixed bottom-4 left-4 right-4 z-40 rounded-3xl border border-gray-200 bg-white px-5 py-3 shadow-xl lg:hidden"
    >
      <div class="flex items-center justify-between">
        <div>
          <p class="text-xs text-gray-500">Total</p>
          <p class="text-lg font-bold text-blue-600">
            {{ formatCurrency(amount) }}
          </p>
        </div>
        <div class="flex items-center gap-2">
          <BaseButton variant="primary" size="md" @click="open = true">
            Review Payment
          </BaseButton>
          <button
            type="button"
            class="flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            aria-label="Cancel payment selection"
            @click="emit('cancel')"
          >
            <IconClose class="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  </Transition>

  <UDrawer
    v-model:open="open"
    title="Payment Summary"
    class="lg:hidden"
    :ui="{ footer: 'px-4 pb-6 pt-2', body: 'px-4' }"
  >
    <template #body>
      <div class="space-y-4">
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
        <div class="h-px bg-gray-100"></div>
        <div
          v-if="selected"
          class="flex items-start gap-2 rounded-lg border border-blue-100 bg-blue-50 p-3"
        >
          <IconInfo class="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
          <p class="text-xs text-blue-700">
            Please verify the details above before confirming
          </p>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-base font-bold text-gray-800">Total</span>
          <span class="text-2xl font-bold text-blue-600">
            {{ formatCurrency(amount) }}
          </span>
        </div>
      </div>
    </template>

    <template #footer>
      <BaseButton
        variant="primary"
        size="lg"
        block
        :disabled="!canPay"
        :loading="loading"
        @click="emit('pay')"
      >
        {{ canPay ? 'Confirm & Pay' : 'Select Payment Type' }}
      </BaseButton>
      <p class="mt-2 text-center text-xs text-gray-400">
        {{
          canPay
            ? 'Secure payment powered by Midtrans'
            : 'Choose a payment option to continue'
        }}
      </p>
    </template>
  </UDrawer>
</template>

<style scoped>
.slide-up-enter-active {
  transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-up-leave-active {
  transition: transform 0.2s ease-in;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
}

@media (prefers-reduced-motion: reduce) {
  .slide-up-enter-active,
  .slide-up-leave-active {
    transition: none;
  }

  .slide-up-enter-from,
  .slide-up-leave-to {
    transform: none;
  }
}
</style>

<script setup>
import BaseButton from '../ui/BaseButton.vue'
import PaymentSummaryDetails from './PaymentSummaryDetails.vue'
import IconClose from '~icons/solar/close-circle-bold'

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

      <PaymentSummaryDetails
        class="mb-5"
        compact
        :student-name="studentName"
        :student-email="studentEmail"
        :payment-type-name="paymentTypeName"
        :selected="selected"
        :total="totalLabel()"
      />

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
      <PaymentSummaryDetails
        :student-name="studentName"
        :student-email="studentEmail"
        :payment-type-name="paymentTypeName"
        :selected="selected"
        :total="formatCurrency(amount)"
      />
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

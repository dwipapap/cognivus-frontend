<script setup>
import PaymentOptionCard from './PaymentOptionCard.vue'

defineProps({
  regularPaymentTypes: { type: Array, default: () => [] },
  ancillaryPaymentTypes: { type: Array, default: () => [] },
  selectedPaymentType: { type: String, default: null },
  semesterFee: { type: Number, default: 0 },
  monthlyFee: { type: Number, default: 0 },
  regularPricingAvailable: { type: Boolean, default: false },
  regularLoading: { type: Boolean, default: false },
  ancillaryLoading: { type: Boolean, default: false },
  formatCurrency: { type: Function, required: true }
})

const emit = defineEmits(['select'])
</script>

<template>
  <section
    class="rounded-xl border border-gray-200 bg-white px-4 py-5 shadow-md md:p-6"
    aria-labelledby="payment-options-title"
  >
    <h2
      id="payment-options-title"
      class="mb-4 text-base font-bold text-gray-800 md:mb-5 md:text-lg"
    >
      Payment Options
    </h2>

    <div class="mb-4 md:mb-5">
      <h3 class="mb-3 text-xs font-semibold uppercase tracking-wider text-blue-600">
        Regular Payments
      </h3>

      <UAlert
        v-if="!regularLoading && !regularPricingAvailable"
        color="warning"
        variant="soft"
        icon="i-lucide-triangle-alert"
        title="Regular payment unavailable"
        description="No billing price is configured for your current level. Please contact an administrator."
        class="mb-3"
      />

      <div
        v-if="regularLoading"
        class="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4"
        aria-label="Loading regular payment options"
      >
        <div v-for="i in 2" :key="i" class="animate-pulse">
          <div class="h-24 rounded-lg bg-gray-100 md:h-28"></div>
        </div>
      </div>

      <div v-else class="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4">
        <PaymentOptionCard
          v-for="type in regularPaymentTypes"
          :key="type.id"
          :selected="selectedPaymentType === type.id"
          :name="type.name"
          :description="type.description"
          :price="type.id === 'semester' ? semesterFee : monthlyFee"
          :icon-path="type.icon"
          variant="regular"
          :format-currency="formatCurrency"
          :disabled="!regularPricingAvailable"
          :price-label="regularPricingAvailable ? '' : 'Unavailable'"
          @select="emit('select', type.id)"
        />
      </div>
    </div>

    <div class="my-4 border-t border-gray-100 md:my-5"></div>

    <div>
      <h3 class="mb-3 text-xs font-semibold uppercase tracking-wider text-blue-600">
        Additional Fees
      </h3>

      <div v-if="ancillaryLoading" class="animate-pulse" aria-label="Loading additional fees">
        <div class="h-24 rounded-lg bg-gray-100 md:h-28"></div>
      </div>

      <div
        v-else-if="ancillaryPaymentTypes.length === 0"
        class="py-5 text-center text-sm text-gray-400 md:py-6"
      >
        No additional fees available
      </div>

      <div v-else class="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4">
        <PaymentOptionCard
          v-for="type in ancillaryPaymentTypes"
          :key="type.id"
          :selected="selectedPaymentType === type.id"
          :name="type.name"
          :description="type.description"
          :price="type.price"
          :icon-path="type.icon"
          variant="ancillary"
          :format-currency="formatCurrency"
          @select="emit('select', type.id)"
        />
      </div>
    </div>
  </section>
</template>

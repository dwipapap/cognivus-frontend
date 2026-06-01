<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import IconClipboard from '~icons/basil/clipboard-solid';
import IconLoading from '~icons/svg-spinners/pulse-rings-multiple';
import BaseButton from '../ui/BaseButton.vue';

const props = defineProps({
  payments: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  currentPage: { type: Number, default: 1 },
  itemsPerPage: { type: Number, default: 10 },
  getPaymentTypeName: { type: Function, required: true },
  formatCurrency: { type: Function, required: true },
  formatDate: { type: Function, required: true }
});

const emit = defineEmits(['refresh', 'page-change']);

const isMobile = ref(false);

onMounted(() => {
  const mql = window.matchMedia('(max-width: 1023px)');
  isMobile.value = mql.matches;
  const handler = (e) => { isMobile.value = e.matches; };
  mql.addEventListener('change', handler);
  onUnmounted(() => mql.removeEventListener('change', handler));
});

const effectiveItemsPerPage = computed(() => isMobile.value ? 5 : props.itemsPerPage);

const totalPages = computed(() => Math.ceil(props.payments.length / effectiveItemsPerPage.value));
const hasPrevious = computed(() => props.currentPage > 1);
const hasNext = computed(() => props.currentPage < totalPages.value);

const paginated = computed(() => {
  const itemsPerPage = effectiveItemsPerPage.value;
  const start = (props.currentPage - 1) * itemsPerPage;
  return props.payments.slice(start, start + itemsPerPage);
});

const statusClass = (status) => {
  const map = {
    success: 'bg-green-100 text-green-800 border-green-200',
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    error: 'bg-red-100 text-red-800 border-red-200',
    failed: 'bg-red-100 text-red-800 border-red-200'
  };
  return map[status] || 'bg-gray-100 text-gray-800 border-gray-200';
};

const nextPage = () => { if (hasNext.value) emit('page-change', props.currentPage + 1); };
const previousPage = () => { if (hasPrevious.value) emit('page-change', props.currentPage - 1); };
</script>

<template>
  <div class="payment-section-glass rounded-3xl md:rounded-2xl px-4 py-5 md:p-6 shadow-md border border-gray-200">
    <div class="flex justify-between items-center mb-4 md:mb-5">
      <h2 class="text-lg font-bold text-gray-800">Payment History</h2>
      <BaseButton variant="secondary" size="sm" icon :disabled="loading" @click="emit('refresh')"
        aria-label="Refresh payment history">
        <template #icon>
          <IconLoading v-if="loading" class="w-5 h-5 animate-spin text-blue-600" />
          <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </template>
      </BaseButton>
    </div>

    <div v-if="payments.length === 0" class="text-center py-12">
      <div class="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <IconClipboard class="w-8 h-8 text-gray-300" />
      </div>
      <p class="text-gray-500 text-sm">No payments yet. Select a payment option above to get started.</p>
    </div>

    <div v-else>
      <!-- Desktop: Table (lg+) -->
      <div class="hidden lg:block overflow-x-auto rounded-xl">
        <table class="w-full">
          <thead>
            <tr class="bg-gray-50/80">
              <th class="text-left py-3.5 px-4 text-xs font-bold text-gray-600 uppercase tracking-wider first:rounded-tl-xl">Date</th>
              <th class="text-left py-3.5 px-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Type</th>
              <th class="text-left py-3.5 px-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Amount</th>
              <th class="text-left py-3.5 px-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
              <th class="text-left py-3.5 px-4 text-xs font-bold text-gray-600 uppercase tracking-wider last:rounded-tr-xl">Order ID</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="(payment, index) in paginated" :key="payment.paymentid"
              class="hover:bg-blue-50/30 transition-colors"
              :class="index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'">
              <td class="py-3.5 px-4 text-sm text-gray-600">{{ formatDate(payment.created_at) }}</td>
              <td class="py-3.5 px-4 text-sm font-medium text-gray-800">{{ getPaymentTypeName(payment.payment_type) }}</td>
              <td class="py-3.5 px-4 text-sm font-bold text-gray-800">{{ formatCurrency(payment.amount) }}</td>
              <td class="py-3.5 px-4">
                <span class="px-3 py-1 text-xs font-semibold rounded-full capitalize" :class="statusClass(payment.status)">
                  {{ payment.status }}
                </span>
              </td>
              <td class="py-3.5 px-4 text-xs text-gray-500 font-mono">{{ payment.midtrans_transactionid || payment.midtrans_orderid }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile: Stacked list (< lg) -->
      <div class="lg:hidden space-y-3">
        <div v-for="payment in paginated" :key="payment.paymentid"
          class="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs text-gray-500">{{ formatDate(payment.created_at) }}</span>
            <span class="px-2.5 py-0.5 text-xs font-semibold rounded-full capitalize" :class="statusClass(payment.status)">
              {{ payment.status }}
            </span>
          </div>
          <div class="space-y-2">
            <div class="flex justify-between items-center">
              <span class="text-xs text-gray-500">Type</span>
              <span class="text-sm font-medium text-gray-800">{{ getPaymentTypeName(payment.payment_type) }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-xs text-gray-500">Amount</span>
              <span class="text-sm font-bold text-gray-800">{{ formatCurrency(payment.amount) }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-xs text-gray-500">Order ID</span>
              <span class="text-xs text-gray-500 font-mono truncate max-w-[55%] text-right">{{ payment.midtrans_transactionid || payment.midtrans_orderid }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1"
        class="flex flex-col sm:flex-row items-center justify-between mt-6 pt-4 border-t border-gray-100 gap-3 px-4">
        <div class="text-sm text-gray-600 font-medium">Page {{ currentPage }} of {{ totalPages }}</div>
        <div class="flex gap-2 w-full sm:w-auto">
          <BaseButton variant="secondary" size="md" :disabled="!hasPrevious" @click="previousPage" class="flex-1 sm:flex-none min-h-[44px]">
            Previous
          </BaseButton>
          <BaseButton variant="primary" size="md" :disabled="!hasNext" @click="nextPage" class="flex-1 sm:flex-none min-h-[44px]">
            Next
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>

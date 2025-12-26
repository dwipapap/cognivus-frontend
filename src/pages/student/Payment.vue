<script setup>
import { ref, computed, onMounted } from 'vue';
import { authStore } from '../../store/auth';
import { useStudentProfile } from '../../composables/useStudentProfile';
import { useClassDetails } from '../../composables/useClassDetails';
import { useSnapPayment } from '../../composables/useSnapPayment';
import { paymentAPI, priceAPI, ancillaryPriceAPI } from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';
import IconWallet from '~icons/basil/wallet-outline';
import IconCheck from '~icons/basil/check-solid';
import IconBook from '~icons/basil/book-solid';
import IconBadge from '~icons/basil/award-solid';
import IconMoney from '~icons/solar/wallet-money-bold-duotone';
import IconInfo from '~icons/basil/info-circle-outline';
import IconClose from '~icons/basil/cross-solid';
import IconClipboard from '~icons/basil/clipboard-solid';
import IconLoading from '~icons/svg-spinners/pulse-rings-multiple';
import IconQuestionCircle from '~icons/solar/question-circle-broken';

// Composables
const { studentProfile, isLoading: isProfileLoading } = useStudentProfile();
const classId = computed(() => studentProfile.value?.classid);
const { classInfo, levelName, programName, isLoading: isClassLoading } = useClassDetails(classId);
const { pay, isLoading: isPaymentLoading, error: paymentError, paymentStatus, resetPaymentState } = useSnapPayment();

// State
const selectedPaymentType = ref(null);
const prices = ref([]);
const isPricesLoading = ref(true);
const showSuccessModal = ref(false);
const showErrorModal = ref(false);
const showGuideModal = ref(false);
const isHistoryLoading = ref(false);
const paymentHistory = ref([]);
const ancillaryPrices = ref([]);
const isAncillaryLoading = ref(true);

// Pagination state
const currentPage = ref(1);
const itemsPerPage = 10;

// Payment types: regular (semester, monthly) + dynamic ancillary
const regularPaymentTypes = [
  {
    id: 'semester',
    name: 'Pay Per Semester',
    description: 'Full payment for one semester',
    icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
    category: 'regular'
  },
  {
    id: 'monthly',
    name: 'Pay Per Month',
    description: 'Payment for this month',
    icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
    category: 'regular'
  }
];

/** Ancillary payment types from database */
const ancillaryPaymentTypes = computed(() => {
  return ancillaryPrices.value.map(item => ({
    id: `ancillary_${item.apid}`,
    name: item.name,
    description: item.description || '',
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    category: 'ancillary',
    price: item.price
  }));
});

// Computed
const selectedAmount = computed(() => {
  if (!selectedPaymentType.value) return 0;

  if (selectedPaymentType.value === 'semester') {
    return currentSemesterFee.value;
  } else if (selectedPaymentType.value === 'monthly') {
    return currentMonthlyFee.value;
  } else if (selectedPaymentType.value.startsWith('ancillary_')) {
    const item = ancillaryPaymentTypes.value.find(t => t.id === selectedPaymentType.value);
    return item?.price || 0;
  }

  return 0;
});

const studentName = computed(() => {
  return studentProfile.value?.nama_lengkap ||
    studentProfile.value?.fullname ||
    authStore.user?.username ||
    'Student';
});

const studentEmail = computed(() => {
  return studentProfile.value?.email ||
    authStore.user?.email ||
    '';
});

const currentSemesterFee = computed(() => {
  if (!classInfo.value?.levelid || prices.value.length === 0) {
    return prices.value[0]?.harga || 0;
  }

  // Find price matching the student's level
  const matchingPrice = prices.value.find(p => p.levelid === classInfo.value.levelid);

  if (matchingPrice) {
    return matchingPrice.harga || 0;
  }

  // Fallback to first available price
  return prices.value[0]?.harga || 0;
});

const currentMonthlyFee = computed(() => {
  if (!classInfo.value?.levelid || prices.value.length === 0) {
    return prices.value[0]?.monthlyprice || 0;
  }

  // Find price matching the student's level
  const matchingPrice = prices.value.find(p => p.levelid === classInfo.value.levelid);

  if (matchingPrice) {
    return matchingPrice.monthlyprice || 0;
  }

  // Fallback to first available price
  return prices.value[0]?.monthlyprice || 0;
});

/** Fetch ancillary prices from API */
const fetchAncillaryPrices = async () => {
  try {
    isAncillaryLoading.value = true;
    const response = await ancillaryPriceAPI.getAll();
    if (response.data?.success && response.data?.data) {
      ancillaryPrices.value = response.data.data;
    }
  } catch (err) {
    console.error('Failed to fetch ancillary prices:', err);
  } finally {
    isAncillaryLoading.value = false;
  }
};

const canPay = computed(() => {
  return selectedPaymentType.value && selectedAmount.value > 0 && !isPaymentLoading.value;
});

// Pagination computed properties
const totalPages = computed(() => {
  return Math.ceil(paymentHistory.value.length / itemsPerPage);
});

const paginatedHistory = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return paymentHistory.value.slice(start, end);
});

const hasPrevious = computed(() => currentPage.value > 1);
const hasNext = computed(() => currentPage.value < totalPages.value);

// Methods
const fetchPrices = async () => {
  try {
    isPricesLoading.value = true;
    const response = await priceAPI.getAllPrices();

    if (response.data?.success && response.data?.data) {
      prices.value = response.data.data;
    } else if (response.data) {
      // Handle case where data might be directly in response.data
      prices.value = Array.isArray(response.data) ? response.data : [response.data];
    }
  } catch (err) {
    console.error('Failed to fetch prices:', err);
  } finally {
    isPricesLoading.value = false;
  }
};

const selectPaymentType = (typeId) => {
  selectedPaymentType.value = typeId;
  resetPaymentState();
};

const handlePayment = async () => {
  if (!canPay.value) return;

  try {
    resetPaymentState();

    const paymentData = {
      email: studentEmail.value,
      amount: selectedAmount.value,
      name: studentName.value,
      studentid: studentProfile.value?.studentid || authStore.user?.userid,
      payment_type: selectedPaymentType.value
    };

    // Generate token from backend
    const response = await paymentAPI.generateToken(paymentData);

    if (!response.data?.success || !response.data?.token) {
      throw new Error('Failed to generate payment token');
    }

    const { token, order_id } = response.data;

    // Trigger Snap payment
    await pay(token, {
      onSuccess: (result) => {
        showSuccessModal.value = true;
        fetchPaymentHistory();
        selectedPaymentType.value = null;
      },
      onPending: (result) => {
        fetchPaymentHistory();
      },
      onError: (result) => {
        showErrorModal.value = true;
      },
      onClose: () => {
        fetchPaymentHistory();
      }
    });

  } catch (err) {
    console.error('Payment error:', err);
    showErrorModal.value = true;
  }
};

const closeSuccessModal = () => {
  showSuccessModal.value = false;
};

const closeErrorModal = () => {
  showErrorModal.value = false;
};

const openGuideModal = () => {
  showGuideModal.value = true;
};

const closeGuideModal = () => {
  showGuideModal.value = false;
};

const getPaymentTypeName = (typeId) => {
  const regular = regularPaymentTypes.find(t => t.id === typeId);
  if (regular) return regular.name;
  const ancillary = ancillaryPaymentTypes.value.find(t => t.id === typeId);
  return ancillary?.name || typeId;
};

const getStatusBadgeClass = (status) => {
  const classes = {
    success: 'bg-green-100 text-green-800 border-green-200',
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    error: 'bg-red-100 text-red-800 border-red-200',
    failed: 'bg-red-100 text-red-800 border-red-200'
  };
  return classes[status] || 'bg-gray-100 text-gray-800 border-gray-200';
};

const nextPage = () => {
  if (hasNext.value) {
    currentPage.value++;
  }
};

const previousPage = () => {
  if (hasPrevious.value) {
    currentPage.value--;
  }
};

const fetchPaymentHistory = async () => {
  try {
    isHistoryLoading.value = true;
    // Wait for student profile to be available
    const studentid = studentProfile.value?.studentid || authStore.user?.userid;

    if (!studentid) {
      return;
    }

    const response = await paymentAPI.getPaymentHistory(studentid);

    if (response.data?.success && response.data?.data) {
      paymentHistory.value = Array.isArray(response.data.data) ? response.data.data : [];
      currentPage.value = 1; // Reset to first page
    } else {
      paymentHistory.value = [];
    }
  } catch (err) {
    console.error('Failed to fetch payment history:', err);
    paymentHistory.value = [];
  } finally {
    isHistoryLoading.value = false;
  }
};

const handleRefreshHistory = async () => {
  try {
    isHistoryLoading.value = true;
    const studentid = studentProfile.value?.studentid || authStore.user?.userid;

    if (!studentid) {
      return;
    }

    // First, refresh payment status from Midtrans
    await paymentAPI.refreshPaymentStatus(studentid);

    // Then fetch updated payment history
    await fetchPaymentHistory();
  } catch (err) {
    console.error('Failed to refresh payment history:', err);
    // Still try to fetch history even if refresh fails
    await fetchPaymentHistory();
  }
};

// Lifecycle
onMounted(async () => {
  fetchPrices();
  fetchAncillaryPrices();
  await new Promise(resolve => setTimeout(resolve, 500));
  fetchPaymentHistory();
});
</script>

<template>
  <div class="space-y-6">
    <!-- Page Header - Clean Blue Gradient -->
    <div class="relative bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 rounded-3xl shadow-xl overflow-hidden">
      <!-- Decorative Elements -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute -top-8 -right-8 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
        <div class="absolute top-1/2 -left-12 w-32 h-32 bg-blue-400/20 rounded-full blur-xl"></div>
        <div class="absolute bottom-0 right-1/4 w-24 h-24 bg-white/5 rounded-full"></div>
      </div>

      <!-- Content -->
      <div class="relative p-6 md:p-8 z-10">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 class="text-2xl md:text-3xl font-bold text-white mb-1">Payment</h1>
            <p class="text-sm text-blue-100">Manage your course payments securely</p>
          </div>
          <button @click="openGuideModal"
            class="flex items-center gap-2 bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white px-5 py-2.5 rounded-full transition-all duration-300 hover:shadow-lg border border-white/20">
            <IconQuestionCircle class="w-5 h-5" />
            <span class="text-sm font-medium">Payment Guide</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Program & Billing Information (Mobile: Top, Desktop: Right) -->
    <div class="payment-section-glass rounded-3xl p-5 shadow-lg border border-white/40 lg:hidden">
      <h2 class="text-lg font-bold text-gray-800 mb-4">Program & Billing Info</h2>

      <!-- Loading State -->
      <div v-if="isClassLoading || isPricesLoading" class="grid grid-cols-2 gap-3">
        <div v-for="i in 4" :key="i" class="animate-pulse">
          <div class="h-24 bg-gray-100 rounded-xl"></div>
        </div>
      </div>

      <!-- Content - 2x2 Grid with unified blue theme -->
      <div v-else class="grid grid-cols-2 gap-3">
        <!-- 1. Current Program -->
        <div class="bg-blue-50/50 rounded-xl p-3.5 border border-blue-100/50 hover:shadow-sm transition-shadow">
          <div class="flex items-center gap-2 mb-2">
            <div class="w-9 h-9 rounded-lg bg-blue-500 flex items-center justify-center shadow-sm">
              <IconBook class="w-4.5 h-4.5 text-white" />
            </div>
          </div>
          <p class="text-xs font-medium text-gray-500 mb-0.5">Program</p>
          <p class="text-sm font-bold text-gray-800 truncate">{{ programName || 'Loading...' }}</p>
        </div>

        <!-- 2. Student Level -->
        <div class="bg-blue-50/50 rounded-xl p-3.5 border border-blue-100/50 hover:shadow-sm transition-shadow">
          <div class="flex items-center gap-2 mb-2">
            <div class="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm">
              <IconBadge class="w-4.5 h-4.5 text-white" />
            </div>
          </div>
          <p class="text-xs font-medium text-gray-500 mb-0.5">Level</p>
          <p class="text-sm font-bold text-gray-800 truncate">{{ levelName || 'Loading...' }}</p>
        </div>

        <!-- 3. Semester Fee -->
        <div class="bg-blue-50/50 rounded-xl p-3.5 border border-blue-100/50 hover:shadow-sm transition-shadow">
          <div class="flex items-center gap-2 mb-2">
            <div class="w-9 h-9 rounded-lg bg-blue-500 flex items-center justify-center shadow-sm">
              <IconWallet class="w-4.5 h-4.5 text-white" />
            </div>
          </div>
          <p class="text-xs font-medium text-gray-500 mb-0.5">Semester Fee</p>
          <p class="text-sm font-bold text-blue-600 truncate">{{ formatCurrency(currentSemesterFee) }}</p>
        </div>

        <!-- 4. Monthly Fee -->
        <div class="bg-blue-50/50 rounded-xl p-3.5 border border-blue-100/50 hover:shadow-sm transition-shadow">
          <div class="flex items-center gap-2 mb-2">
            <div class="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm">
              <IconMoney class="w-4.5 h-4.5 text-white" />
            </div>
          </div>
          <p class="text-xs font-medium text-gray-500 mb-0.5">Monthly Fee</p>
          <p class="text-sm font-bold text-blue-600 truncate">{{ formatCurrency(currentMonthlyFee) }}</p>
        </div>
      </div>

      <!-- Info Note -->
      <div class="mt-4 flex items-start gap-2 bg-blue-50 rounded-full p-3 border border-blue-100">
        <IconInfo class="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
        <p class="text-xs text-blue-700">Fees are calculated based on your program level</p>
      </div>
    </div>

    <!-- Main Grid Layout: 2 columns on desktop -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

      <!-- LEFT COLUMN: Payment Types & History (spans 2 cols on desktop) -->
      <div class="lg:col-span-2 space-y-6">

        <!-- Payment Options Card (Always first) -->
        <div class="payment-section-glass rounded-3xl p-6 shadow-lg border border-white/40">
          <h2 class="text-lg font-bold text-gray-800 mb-5">Payment Options</h2>

          <!-- Regular Payments Section -->
          <div class="mb-5">
            <h3 class="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-3">Regular Payments</h3>

            <div v-if="isPricesLoading" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div v-for="i in 2" :key="i" class="animate-pulse">
                <div class="h-28 bg-gray-100 rounded-2xl"></div>
              </div>
            </div>

            <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div v-for="type in regularPaymentTypes" :key="type.id" @click="selectPaymentType(type.id)"
                class="payment-type-card cursor-pointer rounded-2xl p-4 border-2 transition-all duration-300 bg-white"
                :class="selectedPaymentType === type.id
                  ? 'border-blue-500 ring-2 ring-blue-200 shadow-lg'
                  : 'border-gray-100 hover:border-blue-200 hover:shadow-md'">
                <div class="flex items-start gap-3">
                  <div class="flex-shrink-0">
                    <div class="w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
                      :class="selectedPaymentType === type.id ? 'bg-blue-500' : 'bg-blue-50'">
                      <svg class="w-5 h-5" :class="selectedPaymentType === type.id ? 'text-white' : 'text-blue-600'"
                        fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="type.icon"></path>
                      </svg>
                    </div>
                  </div>
                  <div class="flex-1 min-w-0">
                    <h4 class="text-sm font-bold text-gray-800">{{ type.name }}</h4>
                    <p class="text-xs text-gray-500 mt-0.5">{{ type.description }}</p>
                    <p class="text-lg font-bold text-blue-600 mt-2">
                      {{ formatCurrency(type.id === 'semester' ? currentSemesterFee : currentMonthlyFee) }}
                    </p>
                  </div>
                  <div v-if="selectedPaymentType === type.id" class="flex-shrink-0">
                    <div class="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <IconCheck class="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Divider -->
          <div class="border-t border-gray-100 my-5"></div>

          <!-- Additional Fees Section (Dynamic from database) -->
          <div>
            <h3 class="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-3">Additional Fees</h3>

            <div v-if="isAncillaryLoading" class="animate-pulse">
              <div class="h-28 bg-gray-100 rounded-2xl"></div>
            </div>

            <div v-else-if="ancillaryPaymentTypes.length === 0" class="text-center py-6 text-gray-400 text-sm">
              No additional fees available
            </div>

            <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div v-for="type in ancillaryPaymentTypes" :key="type.id" @click="selectPaymentType(type.id)"
                class="payment-type-card cursor-pointer rounded-2xl p-4 border-2 transition-all duration-300 bg-white"
                :class="selectedPaymentType === type.id
                  ? 'border-blue-600 ring-2 ring-blue-200 shadow-lg'
                  : 'border-gray-100 hover:border-blue-200 hover:shadow-md'">
                <div class="flex items-start gap-3">
                  <div class="flex-shrink-0">
                    <div class="w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
                      :class="selectedPaymentType === type.id ? 'bg-blue-600' : 'bg-slate-100'">
                      <svg class="w-5 h-5" :class="selectedPaymentType === type.id ? 'text-white' : 'text-slate-600'"
                        fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="type.icon"></path>
                      </svg>
                    </div>
                  </div>
                  <div class="flex-1 min-w-0">
                    <h4 class="text-sm font-bold text-gray-800">{{ type.name }}</h4>
                    <p v-if="type.description" class="text-xs text-gray-500 mt-0.5">{{ type.description }}</p>
                    <p class="text-lg font-bold text-blue-600 mt-2">
                      {{ formatCurrency(type.price) }}
                    </p>
                  </div>
                  <div v-if="selectedPaymentType === type.id" class="flex-shrink-0">
                    <div class="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                      <IconCheck class="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Payment History (Desktop Only - hidden on mobile) -->
        <div class="hidden lg:block payment-section-glass rounded-3xl p-6 shadow-lg border border-white/40">
          <div class="flex justify-between items-center mb-5">
            <h2 class="text-lg font-bold text-gray-800">Payment History</h2>
            <button @click="handleRefreshHistory" :disabled="isHistoryLoading"
              class="p-2.5 rounded-full hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              title="Refresh History">
              <IconLoading v-if="isHistoryLoading" class="w-5 h-5 animate-spin text-blue-600" />
              <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>

          <div v-if="paymentHistory.length === 0" class="text-center py-12">
            <div class="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <IconClipboard class="w-8 h-8 text-gray-300" />
            </div>
            <p class="text-gray-500 text-sm">No payment history yet</p>
          </div>

          <div v-else class="overflow-x-auto rounded-xl">
            <table class="w-full">
              <thead>
                <tr class="bg-gray-50/80">
                  <th
                    class="text-left py-3.5 px-4 text-xs font-bold text-gray-600 uppercase tracking-wider first:rounded-tl-xl">
                    Date</th>
                  <th class="text-left py-3.5 px-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Type</th>
                  <th class="text-left py-3.5 px-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Amount</th>
                  <th class="text-left py-3.5 px-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
                  <th
                    class="text-left py-3.5 px-4 text-xs font-bold text-gray-600 uppercase tracking-wider last:rounded-tr-xl">
                    Order ID</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50">
                <tr v-for="(payment, index) in paginatedHistory" :key="payment.paymentid"
                  class="hover:bg-blue-50/30 transition-colors" :class="index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'">
                  <td class="py-3.5 px-4 text-sm text-gray-600">{{ formatDate(payment.created_at) }}</td>
                  <td class="py-3.5 px-4 text-sm font-medium text-gray-800">{{ getPaymentTypeName(payment.payment_type)
                    }}</td>
                  <td class="py-3.5 px-4 text-sm font-bold text-gray-800">{{ formatCurrency(payment.amount) }}</td>
                  <td class="py-3.5 px-4">
                    <span class="px-3 py-1 text-xs font-semibold rounded-full capitalize"
                      :class="getStatusBadgeClass(payment.status)">
                      {{ payment.status }}
                    </span>
                  </td>
                  <td class="py-3.5 px-4 text-xs text-gray-500 font-mono">{{ payment.midtrans_transactionid ||
                    payment.midtrans_orderid }}</td>
                </tr>
              </tbody>
            </table>

            <!-- Pagination Controls -->
            <div v-if="totalPages > 1" class="flex items-center justify-between mt-6 pt-4 border-t border-gray-100 px-4">
              <div class="text-sm text-gray-600 font-medium">
                Page {{ currentPage }} of {{ totalPages }}
              </div>
              <div class="flex gap-2">
                <button @click="previousPage" :disabled="!hasPrevious"
                  class="px-4 py-2 rounded-full bg-white border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow">
                  Previous
                </button>
                <button @click="nextPage" :disabled="!hasNext"
                  class="px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg border border-blue-500/30">
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- RIGHT COLUMN: Program Info & Payment Summary (spans 1 col on desktop) -->
      <div class="lg:col-span-1 space-y-6">

        <!-- Program & Billing Information (Desktop Only) -->
        <div class="payment-section-glass rounded-3xl p-5 shadow-lg border border-white/40 hidden lg:block">
          <h2 class="text-lg font-bold text-gray-800 mb-4">Program & Billing Info</h2>

          <!-- Loading State -->
          <div v-if="isClassLoading || isPricesLoading" class="grid grid-cols-2 gap-3">
            <div v-for="i in 4" :key="i" class="animate-pulse">
              <div class="h-24 bg-gray-100 rounded-xl"></div>
            </div>
          </div>

          <!-- Content - 2x2 Grid with unified blue theme -->
          <div v-else class="grid grid-cols-2 gap-3">
            <!-- 1. Current Program -->
            <div class="bg-blue-50/50 rounded-xl p-3.5 border border-blue-100/50 hover:shadow-sm transition-shadow">
              <div class="flex items-center gap-2 mb-2">
                <div class="w-9 h-9 rounded-lg bg-blue-500 flex items-center justify-center shadow-sm">
                  <IconBook class="w-4.5 h-4.5 text-white" />
                </div>
              </div>
              <p class="text-xs font-medium text-gray-500 mb-0.5">Program</p>
              <p class="text-sm font-bold text-gray-800 truncate">{{ programName || 'Loading...' }}</p>
            </div>

            <!-- 2. Student Level -->
            <div class="bg-blue-50/50 rounded-xl p-3.5 border border-blue-100/50 hover:shadow-sm transition-shadow">
              <div class="flex items-center gap-2 mb-2">
                <div class="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm">
                  <IconBadge class="w-4.5 h-4.5 text-white" />
                </div>
              </div>
              <p class="text-xs font-medium text-gray-500 mb-0.5">Level</p>
              <p class="text-sm font-bold text-gray-800 truncate">{{ levelName || 'Loading...' }}</p>
            </div>

            <!-- 3. Semester Fee -->
            <div class="bg-blue-50/50 rounded-xl p-3.5 border border-blue-100/50 hover:shadow-sm transition-shadow">
              <div class="flex items-center gap-2 mb-2">
                <div class="w-9 h-9 rounded-lg bg-blue-500 flex items-center justify-center shadow-sm">
                  <IconWallet class="w-4.5 h-4.5 text-white" />
                </div>
              </div>
              <p class="text-xs font-medium text-gray-500 mb-0.5">Semester Fee</p>
              <p class="text-sm font-bold text-blue-600 truncate">{{ formatCurrency(currentSemesterFee) }}</p>
            </div>

            <!-- 4. Monthly Fee -->
            <div class="bg-blue-50/50 rounded-xl p-3.5 border border-blue-100/50 hover:shadow-sm transition-shadow">
              <div class="flex items-center gap-2 mb-2">
                <div class="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm">
                  <IconMoney class="w-4.5 h-4.5 text-white" />
                </div>
              </div>
              <p class="text-xs font-medium text-gray-500 mb-0.5">Monthly Fee</p>
              <p class="text-sm font-bold text-blue-600 truncate">{{ formatCurrency(currentMonthlyFee) }}</p>
            </div>
          </div>

          <!-- Info Note -->
          <div class="mt-4 flex items-start gap-2 bg-blue-50 rounded-full p-3 border border-blue-100">
            <IconInfo class="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <p class="text-xs text-blue-700">Fees are calculated based on your program level</p>
          </div>
        </div>

        <!-- Payment Summary -->
        <div class="payment-section-glass rounded-3xl p-5 shadow-lg border border-white/40">
          <h2 class="text-lg font-bold text-gray-800 mb-4">Payment Summary</h2>

          <div class="space-y-3 mb-5">
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-500">Name</span>
              <span class="text-sm font-semibold text-gray-800 truncate ml-2 max-w-[60%] text-right">{{ studentName
                }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-500">Email</span>
              <span class="text-sm font-semibold text-gray-800 truncate ml-2 max-w-[60%] text-right">{{ studentEmail
                }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-500">Payment Type</span>
              <span class="text-sm font-semibold text-gray-800">{{ selectedPaymentType ?
                getPaymentTypeName(selectedPaymentType) : '-' }}</span>
            </div>
            <div class="h-px bg-gray-100 my-3"></div>
            <div class="flex justify-between items-center">
              <span class="text-base font-bold text-gray-800">Total</span>
              <span class="text-2xl font-bold text-blue-600">{{ selectedPaymentType ? formatCurrency(selectedAmount) :
                'Rp 0' }}</span>
            </div>
          </div>

          <button @click="handlePayment" :disabled="!canPay || isPaymentLoading"
            class="w-full py-3 px-5 rounded-full font-bold text-white transition-all duration-300 shadow-md" :class="canPay && !isPaymentLoading
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 hover:shadow-xl active:scale-[0.98] cursor-pointer'
              : 'bg-gray-300 cursor-not-allowed'">
            <span v-if="isPaymentLoading" class="flex items-center justify-center">
              <IconLoading class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
              Processing...
            </span>
            <span v-else>{{ canPay ? 'Pay Now' : 'Select Payment Type' }}</span>
          </button>

          <p class="text-xs text-gray-400 text-center mt-3">
            {{ canPay ? 'Secure payment powered by Midtrans' : 'Choose a payment option to continue' }}
          </p>
        </div>
      </div>
    </div>

    <!-- Payment History (Mobile Only - shown at bottom on small screens) -->
    <div class="lg:hidden payment-section-glass rounded-3xl p-6 shadow-lg border border-white/40">
      <div class="flex justify-between items-center mb-5">
        <h2 class="text-lg font-bold text-gray-800">Payment History</h2>
        <button @click="handleRefreshHistory" :disabled="isHistoryLoading"
          class="p-2.5 rounded-full hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          title="Refresh History">
          <IconLoading v-if="isHistoryLoading" class="w-5 h-5 animate-spin text-blue-600" />
          <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      <div v-if="paymentHistory.length === 0" class="text-center py-12">
        <div class="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <IconClipboard class="w-8 h-8 text-gray-300" />
        </div>
        <p class="text-gray-500 text-sm">No payment history yet</p>
      </div>

      <div v-else class="overflow-x-auto rounded-xl">
        <table class="w-full">
          <thead>
            <tr class="bg-gray-50/80">
              <th
                class="text-left py-3.5 px-4 text-xs font-bold text-gray-600 uppercase tracking-wider first:rounded-tl-xl">
                Date</th>
              <th class="text-left py-3.5 px-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Type</th>
              <th class="text-left py-3.5 px-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Amount</th>
              <th class="text-left py-3.5 px-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
              <th
                class="text-left py-3.5 px-4 text-xs font-bold text-gray-600 uppercase tracking-wider last:rounded-tr-xl">
                Order ID</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="(payment, index) in paginatedHistory" :key="payment.paymentid"
              class="hover:bg-blue-50/30 transition-colors" :class="index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'">
              <td class="py-3.5 px-4 text-sm text-gray-600">{{ formatDate(payment.created_at) }}</td>
              <td class="py-3.5 px-4 text-sm font-medium text-gray-800">{{ getPaymentTypeName(payment.payment_type) }}
              </td>
              <td class="py-3.5 px-4 text-sm font-bold text-gray-800">{{ formatCurrency(payment.amount) }}</td>
              <td class="py-3.5 px-4">
                <span class="px-3 py-1 text-xs font-semibold rounded-full capitalize"
                  :class="getStatusBadgeClass(payment.status)">
                  {{ payment.status }}
                </span>
              </td>
              <td class="py-3.5 px-4 text-xs text-gray-500 font-mono">{{ payment.midtrans_transactionid ||
                payment.midtrans_orderid }}</td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination Controls -->
        <div v-if="totalPages > 1" class="flex flex-col sm:flex-row items-center justify-between mt-6 pt-4 border-t border-gray-100 gap-3">
          <div class="text-sm text-gray-600 font-medium">
            Page {{ currentPage }} of {{ totalPages }}
          </div>
          <div class="flex gap-2 w-full sm:w-auto">
            <button @click="previousPage" :disabled="!hasPrevious"
              class="flex-1 sm:flex-none px-4 py-2 rounded-full bg-white border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow min-h-[44px]">
              Previous
            </button>
            <button @click="nextPage" :disabled="!hasNext"
              class="flex-1 sm:flex-none px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg border border-blue-500/30 min-h-[44px]">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Success Modal -->
    <Teleport to="body">
      <div v-if="showSuccessModal"
        class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div class="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl transform transition-all">
          <div class="text-center">
            <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <IconCheck class="w-10 h-10 text-green-500" />
            </div>
            <h3 class="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h3>
            <p class="text-gray-600 mb-6">Your transaction has been processed successfully.</p>
            <button @click="closeSuccessModal"
              class="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-full transition-colors shadow-lg hover:shadow-xl">
              Done
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Error Modal -->
    <Teleport to="body">
      <div v-if="showErrorModal"
        class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div class="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl transform transition-all">
          <div class="text-center">
            <div class="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <IconClose class="w-10 h-10 text-red-500" />
            </div>
            <h3 class="text-2xl font-bold text-gray-800 mb-2">Payment Failed</h3>
            <p class="text-gray-600 mb-6">{{ paymentError || 'An error occurred while processing the payment.' }}</p>
            <button @click="closeErrorModal"
              class="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-full transition-colors shadow-lg hover:shadow-xl">
              Close
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Payment Guide Modal -->
    <Teleport to="body">
      <div v-if="showGuideModal"
        class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        @keydown.esc="closeGuideModal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="guide-modal-title"
        aria-describedby="guide-modal-description">
        <div
          class="guide-modal-container bg-white/95 backdrop-blur-lg rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl transform transition-all max-h-[90vh] overflow-y-auto border border-white/20">
          
          <!-- Header -->
          <div class="mb-8">
            <div class="flex items-center gap-4 mb-4">
              <div class="question-icon-container w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <IconQuestionCircle class="w-8 h-8 text-white" aria-hidden="true" />
              </div>
              <div class="flex-1">
                <h3 id="guide-modal-title" class="text-3xl font-bold text-gray-800 mb-1">Payment Guide</h3>
                <p id="guide-modal-description" class="text-base text-gray-500">Important information about payments</p>
              </div>
            </div>
            <!-- Elegant divider -->
            <div class="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mt-4"></div>
          </div>

          <div class="space-y-4 mb-8">
            <!-- Step 1: Info -->
            <div class="guide-step-card flex items-start gap-4 p-5 bg-white/90 backdrop-blur rounded-2xl border border-blue-100 border-l-4 border-l-blue-600 hover:shadow-lg transition-all duration-300 cursor-default">
              <div
                class="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-base shadow-md"
                aria-hidden="true">
                1
              </div>
              <div class="flex-1">
                <h4 class="text-sm font-bold text-gray-800 mb-2 leading-tight">Payment Confirmation Time</h4>
                <p class="text-sm text-gray-600 leading-relaxed">Payment confirmation takes approximately 5-10 minutes to process</p>
              </div>
            </div>

            <!-- Step 2: Neutral -->
            <div class="guide-step-card flex items-start gap-4 p-5 bg-white/90 backdrop-blur rounded-2xl border border-slate-100 border-l-4 border-l-slate-600 hover:shadow-lg transition-all duration-300 cursor-default">
              <div
                class="flex-shrink-0 w-10 h-10 bg-slate-600 text-white rounded-full flex items-center justify-center font-bold text-base shadow-md"
                aria-hidden="true">
                2
              </div>
              <div class="flex-1">
                <h4 class="text-sm font-bold text-gray-800 mb-2 leading-tight">Changing Payment Method</h4>
                <p class="text-sm text-gray-600 leading-relaxed">To change payment method, wait until the current transaction expires before creating a new one</p>
              </div>
            </div>

            <!-- Step 3: Info -->
            <div class="guide-step-card flex items-start gap-4 p-5 bg-white/90 backdrop-blur rounded-2xl border border-blue-100 border-l-4 border-l-blue-600 hover:shadow-lg transition-all duration-300 cursor-default">
              <div
                class="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-base shadow-md"
                aria-hidden="true">
                3
              </div>
              <div class="flex-1">
                <h4 class="text-sm font-bold text-gray-800 mb-2 leading-tight">Course Fee Calculation</h4>
                <p class="text-sm text-gray-600 leading-relaxed">Course fees are calculated based on your student level and program</p>
              </div>
            </div>

            <!-- Step 4: Neutral -->
            <div class="guide-step-card flex items-start gap-4 p-5 bg-white/90 backdrop-blur rounded-2xl border border-slate-100 border-l-4 border-l-slate-600 hover:shadow-lg transition-all duration-300 cursor-default">
              <div
                class="flex-shrink-0 w-10 h-10 bg-slate-600 text-white rounded-full flex items-center justify-center font-bold text-base shadow-md"
                aria-hidden="true">
                4
              </div>
              <div class="flex-1">
                <h4 class="text-sm font-bold text-gray-800 mb-2 leading-tight">Refresh Payment History</h4>
                <p class="text-sm text-gray-600 leading-relaxed">If status doesn't update automatically, use the refresh button in payment history</p>
              </div>
            </div>

            <!-- Step 5: Warning -->
            <div class="guide-step-card flex items-start gap-4 p-5 bg-white/90 backdrop-blur rounded-2xl border border-red-100 border-l-4 border-l-red-600 hover:shadow-lg transition-all duration-300 cursor-default">
              <div
                class="flex-shrink-0 w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center font-bold text-base shadow-md"
                aria-hidden="true">
                !
              </div>
              <div class="flex-1">
                <h4 class="text-sm font-bold text-gray-800 mb-2 leading-tight">Payment Status Issue</h4>
                <p class="text-sm text-gray-600 leading-relaxed">If payment succeeded but shows pending/failed, please contact admin immediately</p>
              </div>
            </div>

          </div>

          <!-- Close Button -->
          <button @click="closeGuideModal"
            class="guide-close-button w-full min-h-[44px] py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-full transition-all duration-300 shadow-lg hover:shadow-xl active:scale-[0.98] border border-blue-500/30"
            aria-label="Close payment guide">
            Got it, Thanks!
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
/* Clean Glassmorphism for payment sections */
.payment-section-glass {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.payment-type-card {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.payment-type-card:hover {
  transform: translateY(-2px);
}

.payment-type-card:active {
  transform: translateY(0);
}

/* Smooth animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.payment-section-glass {
  animation: fadeIn 0.4s ease-out;
}

/* Custom scrollbar for modals */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Payment Guide Modal Styles */
.guide-modal-container {
  animation: modalFadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Step cards with staggered animation */
.guide-step-card {
  opacity: 0;
  animation: cardSlideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.guide-step-card:nth-child(1) { animation-delay: 0.05s; }
.guide-step-card:nth-child(2) { animation-delay: 0.1s; }
.guide-step-card:nth-child(3) { animation-delay: 0.15s; }
.guide-step-card:nth-child(4) { animation-delay: 0.2s; }
.guide-step-card:nth-child(5) { animation-delay: 0.25s; }

@keyframes cardSlideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Step card hover effects */
.guide-step-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
}

/* Question icon pulse animation */
.question-icon-container {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

/* Close button hover effect */
.guide-close-button:hover {
  transform: scale(1.02);
}

.guide-close-button:active {
  transform: scale(0.98);
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .guide-modal-container,
  .guide-step-card,
  .question-icon-container,
  .payment-type-card {
    animation: none;
    transition: none;
  }

  .guide-step-card:hover {
    transform: none;
  }

  .guide-close-button:hover {
    transform: none;
  }
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .guide-modal-container {
    max-width: 100%;
    padding: 1.5rem;
  }

  .guide-step-card {
    padding: 1rem;
  }
}
</style>

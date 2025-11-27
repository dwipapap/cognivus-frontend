<script setup>
import { ref, computed, onMounted } from 'vue';
import { authStore } from '../../store/auth';
import { useStudentProfile } from '../../composables/useStudentProfile';
import { useClassDetails } from '../../composables/useClassDetails';
import { useSnapPayment } from '../../composables/useSnapPayment';
import { paymentAPI } from '../../services/api';
import { priceAPI } from '../../services/api';
import IconWallet from '~icons/basil/wallet-outline';
import IconCheck from '~icons/basil/check-solid';
import IconBook from '~icons/basil/book-solid';
import IconBadge from '~icons/basil/award-solid';
import IconMoney from '~icons/solar/wallet-money-bold-duotone';
import IconInfo from '~icons/basil/info-circle-outline';
import IconClose from '~icons/basil/cross-solid';
import IconClipboard from '~icons/basil/clipboard-solid';
import IconLoading from '~icons/svg-spinners/pulse-rings-multiple';

// Composables
const { studentProfile, isLoading: isProfileLoading } = useStudentProfile();
const classId = computed(() => studentProfile.value?.classid);
const { classInfo, levelName, isLoading: isClassLoading } = useClassDetails(classId);
const { pay, isLoading: isPaymentLoading, error: paymentError, paymentStatus, resetPaymentState } = useSnapPayment();

// State
const selectedPaymentType = ref(null);
const prices = ref([]);
const isPricesLoading = ref(true);
const showSuccessModal = ref(false);
const showErrorModal = ref(false);
const paymentHistory = ref([]);

// Payment types configuration
const paymentTypes = [
  {
    id: 'semester',
    name: 'Pay Per Semester',
    description: 'Full payment for one semester',
    icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
    category: 'regular',
    priceKey: 'semester'
  },
  {
    id: 'monthly',
    name: 'Pay Per Month',
    description: 'Payment for this month',
    icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
    category: 'regular',
    priceKey: 'monthly'
  },
  {
    id: 'final_exam',
    name: 'Final Exam',
    description: 'Final exam fee payment',
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    category: 'exam',
    priceKey: 'final_exam'
  }
];

// Computed
const selectedAmount = computed(() => {
  if (!selectedPaymentType.value) return 0;
  
  if (selectedPaymentType.value === 'semester') {
    return currentSemesterFee.value;
  } else if (selectedPaymentType.value === 'monthly') {
    return currentMonthlyFee.value;
  } else if (selectedPaymentType.value === 'final_exam') {
    return finalExamFee.value;
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

const finalExamFee = computed(() => {
  // Fixed price for Final Exam
  return 150000;
});

const canPay = computed(() => {
  return selectedPaymentType.value && selectedAmount.value > 0 && !isPaymentLoading.value;
});

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

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
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

const getPaymentTypeName = (typeId) => {
  return paymentTypes.find(t => t.id === typeId)?.name || typeId;
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

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const fetchPaymentHistory = async () => {
  try {
    // Wait for student profile to be available
    const studentid = studentProfile.value?.studentid || authStore.user?.userid;
    
    if (!studentid) {
      return;
    }
    
    const response = await paymentAPI.getPaymentHistory(studentid);
    
    if (response.data?.success && response.data?.data) {
      paymentHistory.value = response.data.data;
    }
  } catch (err) {
    console.error('Failed to fetch payment history:', err);
  }
};

// Lifecycle
onMounted(async () => {
  fetchPrices();
  // Wait a bit for student profile to load
  await new Promise(resolve => setTimeout(resolve, 500));
  fetchPaymentHistory();
});
</script>

<template>
  <div class="space-y-6">
    <!-- Page Header - Info Card Style -->
    <div class="relative bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg overflow-hidden">
      <!-- Diagonal Graphics -->
      <div class="absolute top-0 right-0 w-1/2 h-full pointer-events-none overflow-hidden">
        <div class="absolute -top-10 -right-10 w-40 h-48 bg-blue-400/30 rounded-lg transform rotate-12"></div>
        <div class="absolute top-20 -right-5 w-32 h-40 bg-blue-300/40 rounded-lg transform rotate-12"></div>
        <div class="absolute top-40 right-10 w-28 h-36 bg-white/20 rounded-lg transform rotate-12"></div>
      </div>

      <!-- Content -->
      <div class="relative p-5 md:p-5 z-10">
        <div class="mb-4">
          <h1 class="text-2xl md:text-3xl font-bold text-white mb-2">Payment</h1>
          <p class="text-sm text-white/80">Manage your course payments</p>
        </div>
      </div>
    </div>

    <!-- Main Grid Layout: 2 columns on desktop -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <!-- LEFT COLUMN: Payment Types & History (spans 2 cols on desktop) -->
      <div class="lg:col-span-2 space-y-6">
        
        <!-- MERGED Payment Options Card (Regular + Final Exam) -->
        <div class="payment-section-glass rounded-2xl p-6 shadow-lg border border-white/20">
          <h2 class="text-lg font-semibold text-gray-800 mb-4">Payment Options</h2>
          
          <!-- Regular Payments Section -->
          <div class="mb-4">
            <h3 class="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Regular Payments</h3>
            
            <div v-if="isPricesLoading" class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div v-for="i in 2" :key="i" class="animate-pulse">
                <div class="h-24 bg-gray-200 rounded-lg"></div>
              </div>
            </div>

            <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div
                v-for="type in paymentTypes.filter(t => t.category === 'regular')"
                :key="type.id"
                @click="selectPaymentType(type.id)"
                class="payment-type-card cursor-pointer rounded-lg p-3 border-2 transition-all duration-300"
                :class="selectedPaymentType === type.id 
                  ? 'border-blue-500 bg-blue-50 shadow-md' 
                  : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'"
              >
                <div class="flex items-start gap-2">
                  <div class="flex-shrink-0">
                    <div class="w-8 h-8 rounded-lg flex items-center justify-center"
                         :class="selectedPaymentType === type.id ? 'bg-blue-500' : 'bg-gray-200'">
                      <svg class="w-4 h-4" :class="selectedPaymentType === type.id ? 'text-white' : 'text-gray-600'" 
                           fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="type.icon"></path>
                      </svg>
                    </div>
                  </div>
                  <div class="flex-1 min-w-0">
                    <h4 class="text-sm font-semibold text-gray-800">{{ type.name }}</h4>
                    <p class="text-xs text-gray-500 mt-0.5">{{ type.description }}</p>
                    <p class="text-base font-bold text-blue-600 mt-1">
                      {{ formatCurrency(type.id === 'semester' ? currentSemesterFee : currentMonthlyFee) }}
                    </p>
                  </div>
                  <div v-if="selectedPaymentType === type.id" class="flex-shrink-0">
                    <IconCheck class="w-4 h-4 text-blue-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Divider -->
          <div class="border-t border-gray-200 my-3"></div>

          <!-- Final Exam Payment Section -->
          <div>
            <h3 class="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Final Exam Payment</h3>
            
            <div v-if="isPricesLoading" class="animate-pulse">
              <div class="h-24 bg-gray-200 rounded-lg"></div>
            </div>

            <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div
                v-for="type in paymentTypes.filter(t => t.category === 'exam')"
                :key="type.id"
                @click="selectPaymentType(type.id)"
                class="payment-type-card cursor-pointer rounded-lg p-3 border-2 transition-all duration-300"
                :class="selectedPaymentType === type.id 
                  ? 'border-purple-500 bg-purple-50 shadow-md' 
                  : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-sm'"
              >
                <div class="flex items-start gap-2">
                  <div class="flex-shrink-0">
                    <div class="w-8 h-8 rounded-lg flex items-center justify-center"
                         :class="selectedPaymentType === type.id ? 'bg-purple-500' : 'bg-gray-200'">
                      <svg class="w-4 h-4" :class="selectedPaymentType === type.id ? 'text-white' : 'text-gray-600'" 
                           fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="type.icon"></path>
                      </svg>
                    </div>
                  </div>
                  <div class="flex-1 min-w-0">
                    <h4 class="text-sm font-semibold text-gray-800">{{ type.name }}</h4>
                    <p class="text-xs text-gray-500 mt-0.5">{{ type.description }}</p>
                    <p class="text-base font-bold text-purple-600 mt-1">
                      {{ formatCurrency(finalExamFee) }}
                    </p>
                    <div class="mt-1.5 flex items-start gap-1 bg-purple-50 rounded p-1.5 border border-purple-100">
                      <IconInfo class="w-3 h-3 text-purple-600 flex-shrink-0 mt-0.5" />
                      <p class="text-xs text-purple-800">Required only when taking final exam</p>
                    </div>
                  </div>
                  <div v-if="selectedPaymentType === type.id" class="flex-shrink-0">
                    <IconCheck class="w-4 h-4 text-purple-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Payment History -->
        <div class="payment-section-glass rounded-2xl p-6 shadow-lg border border-white/20">
          <h2 class="text-xl font-semibold text-gray-800 mb-4">Payment History</h2>
          
          <div v-if="paymentHistory.length === 0" class="text-center py-8">
            <IconClipboard class="w-16 h-16 mx-auto text-gray-300 mb-3" />
            <p class="text-gray-500 text-sm">No payment history yet</p>
          </div>
          
          <div v-else class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b border-gray-200">
                  <th class="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                  <th class="text-left py-3 px-4 text-sm font-semibold text-gray-700">Type</th>
                  <th class="text-left py-3 px-4 text-sm font-semibold text-gray-700">Amount</th>
                  <th class="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                  <th class="text-left py-3 px-4 text-sm font-semibold text-gray-700">Order ID</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="payment in paymentHistory" :key="payment.paymentid" class="border-b border-gray-100 hover:bg-gray-50">
                  <td class="py-3 px-4 text-sm text-gray-600">{{ formatDate(payment.created_at) }}</td>
                  <td class="py-3 px-4 text-sm text-gray-800">{{ getPaymentTypeName(payment.payment_type) }}</td>
                  <td class="py-3 px-4 text-sm font-semibold text-gray-800">{{ formatCurrency(payment.amount) }}</td>
                  <td class="py-3 px-4">
                    <span class="px-2 py-1 text-xs font-medium rounded-full border capitalize"
                          :class="getStatusBadgeClass(payment.status)">
                      {{ payment.status }}
                    </span>
                  </td>
                  <td class="py-3 px-4 text-sm text-gray-600 font-mono">{{ payment.midtrans_transactionid || payment.midtrans_orderid }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- RIGHT COLUMN: Program Info & Payment Summary (spans 1 col on desktop) -->
      <div class="lg:col-span-1 space-y-6">
        
        <!-- Program & Billing Information (2x2 Grid) -->
        <div class="payment-section-glass rounded-2xl p-5 shadow-lg border border-white/20">
          <h2 class="text-lg font-semibold text-gray-800 mb-4">Program & Billing Info</h2>
          
          <!-- Loading State -->
          <div v-if="isClassLoading || isPricesLoading" class="grid grid-cols-2 gap-3">
            <div v-for="i in 4" :key="i" class="animate-pulse">
              <div class="h-20 bg-gray-200 rounded-lg"></div>
            </div>
          </div>

          <!-- Content - 2x2 Grid -->
          <div v-else class="grid grid-cols-2 gap-3">
            <!-- 1. Current Program -->
            <div class="bg-white/60 rounded-lg p-3 border border-blue-100">
              <div class="flex items-center gap-2 mb-2">
                <div class="w-8 h-8 rounded-md bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                  <IconBook class="w-4 h-4 text-white" />
                </div>
                <p class="text-xs font-medium text-gray-600">Program</p>
              </div>
              <p class="text-sm font-bold text-gray-800 truncate">{{ classInfo?.class_code || '-' }}</p>
            </div>

            <!-- 2. Student Level -->
            <div class="bg-white/60 rounded-lg p-3 border border-purple-100">
              <div class="flex items-center gap-2 mb-2">
                <div class="w-8 h-8 rounded-md bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <IconBadge class="w-4 h-4 text-white" />
                </div>
                <p class="text-xs font-medium text-gray-600">Level</p>
              </div>
              <p class="text-sm font-bold text-gray-800 truncate">{{ levelName || 'Loading...' }}</p>
            </div>

            <!-- 3. Semester Fee -->
            <div class="bg-white/60 rounded-lg p-3 border border-green-100">
              <div class="flex items-center gap-2 mb-2">
                <div class="w-8 h-8 rounded-md bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                  <IconWallet class="w-4 h-4 text-white" />
                </div>
                <p class="text-xs font-medium text-gray-600">Semester</p>
              </div>
              <p class="text-sm font-bold text-green-600 truncate">{{ formatCurrency(currentSemesterFee) }}</p>
            </div>

            <!-- 4. Monthly Fee -->
            <div class="bg-white/60 rounded-lg p-3 border border-orange-100">
              <div class="flex items-center gap-2 mb-2">
                <div class="w-8 h-8 rounded-md bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                  <IconMoney class="w-4 h-4 text-white" />
                </div>
                <p class="text-xs font-medium text-gray-600">Monthly</p>
              </div>
              <p class="text-sm font-bold text-orange-600 truncate">{{ formatCurrency(currentMonthlyFee) }}</p>
            </div>
          </div>

          <!-- Info Note -->
          <div class="mt-4 flex items-start gap-2 bg-blue-50 rounded-lg p-2.5 border border-blue-100">
            <IconInfo class="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <p class="text-xs text-blue-800">Fees based on your program level</p>
          </div>
        </div>

        <!-- Payment Summary (ALWAYS VISIBLE - Persistent) -->
        <div class="payment-section-glass rounded-2xl p-5 shadow-lg border border-white/20">
          <h2 class="text-lg font-semibold text-gray-800 mb-4">Payment Summary</h2>
          
          <div class="space-y-2.5 mb-5">
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">Name</span>
              <span class="text-sm font-semibold text-gray-800 truncate ml-2">{{ studentName }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">Email</span>
              <span class="text-sm font-semibold text-gray-800 truncate ml-2">{{ studentEmail }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">Payment Type</span>
              <span class="text-sm font-semibold text-gray-800">{{ selectedPaymentType ? getPaymentTypeName(selectedPaymentType) : '-' }}</span>
            </div>
            <div class="h-px bg-gray-200 my-2"></div>
            <div class="flex justify-between items-center">
              <span class="text-base font-semibold text-gray-800">Total</span>
              <span class="text-xl font-bold text-blue-600">{{ selectedPaymentType ? formatCurrency(selectedAmount) : 'Rp 0' }}</span>
            </div>
          </div>

          <button
            @click="handlePayment"
            :disabled="!canPay"
            class="w-full py-2.5 px-5 rounded-full font-semibold text-white transition-all duration-300"
            :class="canPay 
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-md hover:shadow-lg active:scale-95 cursor-pointer' 
              : 'bg-gray-400 cursor-not-allowed opacity-60'"
          >
            <span v-if="isPaymentLoading" class="flex items-center justify-center">
              <IconLoading class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
              Processing...
            </span>
            <span v-else>{{ canPay ? 'Pay Now' : 'Select Payment Type' }}</span>
          </button>

          <p class="text-xs text-gray-500 text-center mt-2.5">
            {{ canPay ? 'Secure payment via Midtrans' : 'Choose a payment option to continue' }}
          </p>
        </div>
      </div>
    </div>

    <!-- Success Modal -->
    <Teleport to="body">
      <div v-if="showSuccessModal" class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div class="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl transform transition-all">
          <div class="text-center">
            <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <IconCheck class="w-8 h-8 text-green-500" />
            </div>
            <h3 class="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h3>
            <p class="text-gray-600 mb-6">Your transaction has been processed successfully.</p>
            <button @click="closeSuccessModal" class="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors">
              Close
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Error Modal -->
    <Teleport to="body">
      <div v-if="showErrorModal" class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div class="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl transform transition-all">
          <div class="text-center">
            <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <IconClose class="w-8 h-8 text-red-500" />
            </div>
            <h3 class="text-2xl font-bold text-gray-800 mb-2">Payment Failed</h3>
            <p class="text-gray-600 mb-6">{{ paymentError || 'An error occurred while processing the payment.' }}</p>
            <button @click="closeErrorModal" class="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors">
              Close
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
/* Glassmorphism for payment sections */
.payment-section-glass {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(240, 249, 255, 0.85), rgba(224, 242, 254, 0.8));
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.payment-type-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
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
</style>

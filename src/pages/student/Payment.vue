<script setup>
import { ref, computed, onMounted } from 'vue';
import { authStore } from '../../store/auth';
import { useStudentProfile } from '../../composables/useStudentProfile';
import { useClassDetails } from '../../composables/useClassDetails';
import { useSnapPayment } from '../../composables/useSnapPayment';
import { paymentAPI } from '../../services/api';
import { priceAPI } from '../../services/api';

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
    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-800">Payment</h1>
        <p class="text-gray-600 mt-1">Manage your course payments</p>
      </div>
    </div>

    <!-- Program & Billing Information -->
    <div class="payment-section-glass rounded-2xl p-6 shadow-lg border border-white/20">
      <h2 class="text-xl font-semibold text-gray-800 mb-4">Program & Billing Information</h2>
      
      <!-- Loading State -->
      <div v-if="isClassLoading || isPricesLoading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div v-for="i in 4" :key="i" class="animate-pulse">
          <div class="h-24 bg-gray-200 rounded-xl"></div>
        </div>
      </div>

      <!-- Content -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- 1. Program Saat Ini -->
        <div class="bg-white/60 rounded-xl p-4 border border-blue-100">
          <div class="flex flex-col gap-3">
            <div class="flex items-center gap-3">
              <div class="flex-shrink-0">
                <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                  </svg>
                </div>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-xs font-medium text-gray-600 mb-0.5">Current Program</p>
              </div>
            </div>
            <div>
              <p class="text-base font-bold text-gray-800 truncate">{{ classInfo?.class_code || '-' }}</p>
              <p class="text-xs text-gray-500 mt-0.5">Class Code</p>
            </div>
          </div>
        </div>

        <!-- 2. Level Siswa -->
        <div class="bg-white/60 rounded-xl p-4 border border-purple-100">
          <div class="flex flex-col gap-3">
            <div class="flex items-center gap-3">
              <div class="flex-shrink-0">
                <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
                  </svg>
                </div>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-xs font-medium text-gray-600 mb-0.5">Student Level</p>
              </div>
            </div>
            <div>
              <p class="text-base font-bold text-gray-800 truncate">{{ levelName || 'Loading...' }}</p>
              <p class="text-xs text-gray-500 mt-0.5">Level</p>
            </div>
          </div>
        </div>

        <!-- 3. Biaya Per Semester -->
        <div class="bg-white/60 rounded-xl p-4 border border-green-100">
          <div class="flex flex-col gap-3">
            <div class="flex items-center gap-3">
              <div class="flex-shrink-0">
                <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/>
                  </svg>
                </div>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-xs font-medium text-gray-600 mb-0.5">Semester Fee</p>
              </div>
            </div>
            <div>
              <p class="text-base font-bold text-green-600 truncate">{{ formatCurrency(currentSemesterFee) }}</p>
              <p class="text-xs text-gray-500 mt-0.5">Per Semester</p>
            </div>
          </div>
        </div>

        <!-- 4. Biaya Per Bulan -->
        <div class="bg-white/60 rounded-xl p-4 border border-orange-100">
          <div class="flex flex-col gap-3">
            <div class="flex items-center gap-3">
              <div class="flex-shrink-0">
                <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-xs font-medium text-gray-600 mb-0.5">Monthly Fee</p>
              </div>
            </div>
            <div>
              <p class="text-base font-bold text-orange-600 truncate">{{ formatCurrency(currentMonthlyFee) }}</p>
              <p class="text-xs text-gray-500 mt-0.5">Per Month</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Info Note -->
      <div class="mt-4 flex items-start gap-2 bg-blue-50 rounded-lg p-3 border border-blue-100">
        <svg class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <p class="text-sm text-blue-800">The fee information above is based on your program level. Select a payment type below to continue.</p>
      </div>
    </div>

    <!-- Payment Type Selection -->
    <div class="space-y-6">
      <!-- Regular Payments (Semester & Monthly) -->
      <div class="payment-section-glass rounded-2xl p-6 shadow-lg border border-white/20">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">Regular Payments</h2>
        
        <div v-if="isPricesLoading" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div v-for="i in 2" :key="i" class="animate-pulse">
            <div class="h-32 bg-gray-200 rounded-xl"></div>
          </div>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            v-for="type in paymentTypes.filter(t => t.category === 'regular')"
            :key="type.id"
            @click="selectPaymentType(type.id)"
            class="payment-type-card cursor-pointer rounded-xl p-6 border-2 transition-all duration-300"
            :class="selectedPaymentType === type.id 
              ? 'border-blue-500 bg-blue-50 shadow-lg scale-105' 
              : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'"
          >
            <div class="flex items-start gap-4">
              <div class="flex-shrink-0">
                <div class="w-12 h-12 rounded-lg flex items-center justify-center"
                     :class="selectedPaymentType === type.id ? 'bg-blue-500' : 'bg-gray-200'">
                  <svg class="w-6 h-6" :class="selectedPaymentType === type.id ? 'text-white' : 'text-gray-600'" 
                       fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="type.icon"></path>
                  </svg>
                </div>
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="text-lg font-semibold text-gray-800">{{ type.name }}</h3>
                <p class="text-sm text-gray-600 mt-1">{{ type.description }}</p>
                <p class="text-xl font-bold text-blue-600 mt-2">
                  {{ formatCurrency(selectedPaymentType === type.id ? selectedAmount : (type.id === 'semester' ? currentSemesterFee : currentMonthlyFee)) }}
                </p>
              </div>
              <div v-if="selectedPaymentType === type.id" class="flex-shrink-0">
                <svg class="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Final Exam Payment -->
      <div class="payment-section-glass rounded-2xl p-6 shadow-lg border border-white/20">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">Final Exam Payment</h2>
        
        <div v-if="isPricesLoading" class="animate-pulse">
          <div class="h-32 bg-gray-200 rounded-xl"></div>
        </div>

        <div v-else>
          <div
            v-for="type in paymentTypes.filter(t => t.category === 'exam')"
            :key="type.id"
            @click="selectPaymentType(type.id)"
            class="payment-type-card cursor-pointer rounded-xl p-6 border-2 transition-all duration-300"
            :class="selectedPaymentType === type.id 
              ? 'border-purple-500 bg-purple-50 shadow-lg scale-105' 
              : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-md'"
          >
            <div class="flex items-start gap-4">
              <div class="flex-shrink-0">
                <div class="w-12 h-12 rounded-lg flex items-center justify-center"
                     :class="selectedPaymentType === type.id ? 'bg-purple-500' : 'bg-gray-200'">
                  <svg class="w-6 h-6" :class="selectedPaymentType === type.id ? 'text-white' : 'text-gray-600'" 
                       fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="type.icon"></path>
                  </svg>
                </div>
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="text-lg font-semibold text-gray-800">{{ type.name }}</h3>
                <p class="text-sm text-gray-600 mt-1">{{ type.description }}</p>
                <p class="text-xl font-bold text-purple-600 mt-2">
                  {{ formatCurrency(finalExamFee) }}
                </p>
                <div class="mt-3 flex items-start gap-2 bg-purple-50 rounded-lg p-2 border border-purple-100">
                  <svg class="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <p class="text-xs text-purple-800">This fee is separate from regular payments and only required when taking the final exam.</p>
                </div>
              </div>
              <div v-if="selectedPaymentType === type.id" class="flex-shrink-0">
                <svg class="w-6 h-6 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Payment Summary & Action -->
    <div v-if="selectedPaymentType" class="payment-section-glass rounded-2xl p-6 shadow-lg border border-white/20">
      <h2 class="text-xl font-semibold text-gray-800 mb-4">Payment Summary</h2>
      
      <div class="space-y-3 mb-6">
        <div class="flex justify-between items-center">
          <span class="text-gray-600">Name</span>
          <span class="font-semibold text-gray-800">{{ studentName }}</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-gray-600">Email</span>
          <span class="font-semibold text-gray-800">{{ studentEmail }}</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-gray-600">Payment Type</span>
          <span class="font-semibold text-gray-800">{{ getPaymentTypeName(selectedPaymentType) }}</span>
        </div>
        <div class="h-px bg-gray-200 my-2"></div>
        <div class="flex justify-between items-center">
          <span class="text-lg font-semibold text-gray-800">Total</span>
          <span class="text-2xl font-bold text-blue-600">{{ formatCurrency(selectedAmount) }}</span>
        </div>
      </div>

      <button
        @click="handlePayment"
        :disabled="!canPay"
        class="w-full py-3 px-6 rounded-lg font-semibold text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        :class="canPay 
          ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl active:scale-95' 
          : 'bg-gray-400'"
      >
        <span v-if="isPaymentLoading" class="flex items-center justify-center">
          <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Processing...
        </span>
        <span v-else>Pay Now</span>
      </button>

      <p class="text-xs text-gray-500 text-center mt-3">
        You will be redirected to secure Midtrans payment page
      </p>
    </div>

    <!-- Payment History -->
    <div class="payment-section-glass rounded-2xl p-6 shadow-lg border border-white/20">
      <h2 class="text-xl font-semibold text-gray-800 mb-4">Payment History</h2>
      
      <div v-if="paymentHistory.length === 0" class="text-center py-8">
        <svg class="w-16 h-16 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
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
              <th class="text-left py-3 px-4 text-sm font-semibold text-gray-700">Transaction ID</th>
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

    <!-- Success Modal -->
    <Teleport to="body">
      <div v-if="showSuccessModal" class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div class="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl transform transition-all">
          <div class="text-center">
            <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
              </svg>
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
              <svg class="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
              </svg>
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

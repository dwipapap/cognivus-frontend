<script setup>
import { ref, computed, onMounted } from 'vue';
import { authStore } from '../../store/auth';
import { useStudentProfile } from '../../composables/useStudentProfile';
import { useSnapPayment } from '../../composables/useSnapPayment';
import { paymentAPI } from '../../services/api';
import { priceAPI } from '../../services/api';

// Composables
const { studentProfile, isLoading: isProfileLoading } = useStudentProfile();
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
    id: 'monthly',
    name: 'Tagihan Bulanan',
    description: 'Pembayaran biaya kursus bulanan',
    icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
    priceKey: 'monthly_fee'
  },
  {
    id: 'final_exam',
    name: 'Final Exam',
    description: 'Pembayaran biaya ujian akhir',
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    priceKey: 'exam_fee'
  }
];

// Computed
const selectedAmount = computed(() => {
  if (!selectedPaymentType.value || prices.value.length === 0) return 0;
  
  if (selectedPaymentType.value === 'monthly') {
    // Get monthly price from tbprice table
    // Use the first price item's monthlyprice or harga field
    const priceItem = prices.value[0];
    return priceItem?.monthlyprice || priceItem?.harga || 0;
  } else if (selectedPaymentType.value === 'final_exam') {
    // For final exam, use a fixed price or the harga field
    // You can adjust this based on your business logic
    const priceItem = prices.value[0];
    const basePrice = priceItem?.monthlyprice || priceItem?.harga || 0;
    // Exam fee could be 50% of monthly price, or a fixed amount
    return Math.floor(basePrice * 0.5); // Example: 50% of monthly fee
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
        <h1 class="text-3xl font-bold text-gray-800">Pembayaran</h1>
        <p class="text-gray-600 mt-1">Kelola pembayaran kursus Anda</p>
      </div>
    </div>

    <!-- Payment Type Selection -->
    <div class="payment-section-glass rounded-2xl p-6 shadow-lg border border-white/20">
      <h2 class="text-xl font-semibold text-gray-800 mb-4">Pilih Jenis Pembayaran</h2>
      
      <div v-if="isPricesLoading" class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div v-for="i in 2" :key="i" class="animate-pulse">
          <div class="h-32 bg-gray-200 rounded-xl"></div>
        </div>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          v-for="type in paymentTypes"
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
                {{ formatCurrency(selectedPaymentType === type.id ? selectedAmount : 0) }}
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

    <!-- Payment Summary & Action -->
    <div v-if="selectedPaymentType" class="payment-section-glass rounded-2xl p-6 shadow-lg border border-white/20">
      <h2 class="text-xl font-semibold text-gray-800 mb-4">Ringkasan Pembayaran</h2>
      
      <div class="space-y-3 mb-6">
        <div class="flex justify-between items-center">
          <span class="text-gray-600">Nama</span>
          <span class="font-semibold text-gray-800">{{ studentName }}</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-gray-600">Email</span>
          <span class="font-semibold text-gray-800">{{ studentEmail }}</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-gray-600">Jenis Pembayaran</span>
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
          Memproses...
        </span>
        <span v-else>Bayar Sekarang</span>
      </button>

      <p class="text-xs text-gray-500 text-center mt-3">
        Anda akan diarahkan ke halaman pembayaran Midtrans yang aman
      </p>
    </div>

    <!-- Payment History -->
    <div class="payment-section-glass rounded-2xl p-6 shadow-lg border border-white/20">
      <h2 class="text-xl font-semibold text-gray-800 mb-4">Riwayat Pembayaran</h2>
      
      <div v-if="paymentHistory.length === 0" class="text-center py-8">
        <svg class="w-16 h-16 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
        <p class="text-gray-500 text-sm">Belum ada riwayat pembayaran</p>
      </div>
      
      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-gray-200">
              <th class="text-left py-3 px-4 text-sm font-semibold text-gray-700">Tanggal</th>
              <th class="text-left py-3 px-4 text-sm font-semibold text-gray-700">Jenis</th>
              <th class="text-left py-3 px-4 text-sm font-semibold text-gray-700">Jumlah</th>
              <th class="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
              <th class="text-left py-3 px-4 text-sm font-semibold text-gray-700">ID Transaksi</th>
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
            <h3 class="text-2xl font-bold text-gray-800 mb-2">Pembayaran Berhasil!</h3>
            <p class="text-gray-600 mb-6">Transaksi Anda telah berhasil diproses.</p>
            <button @click="closeSuccessModal" class="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors">
              Tutup
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
            <h3 class="text-2xl font-bold text-gray-800 mb-2">Pembayaran Gagal</h3>
            <p class="text-gray-600 mb-6">{{ paymentError || 'Terjadi kesalahan saat memproses pembayaran.' }}</p>
            <button @click="closeErrorModal" class="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors">
              Tutup
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

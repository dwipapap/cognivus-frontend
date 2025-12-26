<script setup>
import { ref, onMounted, computed } from 'vue';
import { paymentAPI, studentAPI } from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';
import Modal from '../../components/ui/Modal.vue';
import BaseButton from '../../components/ui/BaseButton.vue';

const payments = ref([]);
const students = ref([]);
const isLoading = ref(true);
const showDetailsModal = ref(false);
const showNotificationModal = ref(false);
const notificationMessage = ref('');
const notificationType = ref('info');
const selectedPayment = ref(null);
const searchQuery = ref('');
const statusFilter = ref('');
const typeFilter = ref('');

const getStudentName = (studentid) => {
  if (!studentid) return 'Unknown';
  const student = students.value.find(s => s.studentid === studentid);
  return student?.fullname || 'Unknown';
};

/** Get status badge classes */
const getStatusBadge = (status) => {
  const classes = {
    success: 'bg-green-100 text-green-800 border-green-200',
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    error: 'bg-red-100 text-red-800 border-red-200',
    failed: 'bg-red-100 text-red-800 border-red-200'
  };
  return classes[status] || 'bg-gray-100 text-gray-800 border-gray-200';
};

const filteredPayments = computed(() => {
  let result = payments.value;

  // Filter by status
  if (statusFilter.value) {
    result = result.filter(p => p.status === statusFilter.value);
  }

  // Filter by payment type
  if (typeFilter.value) {
    result = result.filter(p => p.payment_type === typeFilter.value);
  }

  // Search by student name, order ID, or transaction ID
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(p => {
      const studentName = getStudentName(p.studentid).toLowerCase();
      const orderId = (p.midtrans_orderid || '').toLowerCase();
      const transactionId = (p.midtrans_transactionid || '').toLowerCase();
      return studentName.includes(query) || orderId.includes(query) || transactionId.includes(query);
    });
  }

  // Sort by created_at descending (newest first)
  return result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
});

/** Payment statistics */
const stats = computed(() => {
  const total = payments.value.length;
  const pending = payments.value.filter(p => p.status === 'pending').length;
  const success = payments.value.filter(p => p.status === 'success').length;
  const failed = payments.value.filter(p => p.status === 'failed').length;
  const totalRevenue = payments.value
    .filter(p => p.status === 'success')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  return { total, pending, success, failed, totalRevenue };
});

/** Fetch all payments */
const fetchPayments = async () => {
  try {
    isLoading.value = true;
    const response = await paymentAPI.getAllPayments();
    if (response.data.success) {
      payments.value = response.data.data;
    }
  } catch (error) {
    showNotification('error', 'Failed to load payment data.');
    console.error('Failed to fetch payments:', error);
  } finally {
    isLoading.value = false;
  }
};

/** Fetch all students for name mapping */
const fetchStudents = async () => {
  try {
    const response = await studentAPI.getAllStudents();
    if (response.data.success) {
      students.value = response.data.data;
    }
  } catch (error) {
    console.error('Failed to fetch students:', error);
  }
};

/** Show notification */
const showNotification = (type, message) => {
  notificationType.value = type;
  notificationMessage.value = message;
  showNotificationModal.value = true;
};

/** Open payment details modal */
const openDetailsModal = (payment) => {
  selectedPayment.value = payment;
  showDetailsModal.value = true;
};

/** Refresh payments */
const refreshPayments = async () => {
  await fetchPayments();
  showNotification('success', 'Payment data refreshed successfully!');
};

/** Export to CSV */
const exportToCSV = () => {
  const headers = ['Payment ID', 'Student Name', 'Order ID', 'Transaction ID', 'Amount', 'Type', 'Status', 'Date'];
  const rows = filteredPayments.value.map(p => [
    p.paymentid,
    getStudentName(p.studentid),
    p.midtrans_orderid || '-',
    p.midtrans_transactionid || '-',
    p.amount,
    p.payment_type,
    p.status,
    formatDate(p.created_at)
  ]);

  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `payments_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
};

onMounted(() => {
  fetchPayments();
  fetchStudents();
});
</script>

<template>
  <div class="p-4 md:p-6">
    <!-- Header -->
    <div class="mb-6">
      <div class="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">Manage Payments</h1>
          <p class="text-gray-600 mt-1">View and monitor all student payment transactions</p>
        </div>
        <div class="flex gap-2">
          <BaseButton @click="refreshPayments" variant="secondary" size="md">
            <template #icon>
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
            </template>
            Refresh
          </BaseButton>
          <BaseButton @click="exportToCSV" variant="primary" size="md">
            <template #icon>
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
            </template>
            Export CSV
          </BaseButton>
        </div>
      </div>

      <!-- Statistics Cards -->
      <div class="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 mb-6">
        <div class="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div class="text-sm text-gray-600 mb-1">Total Payments</div>
          <div class="text-2xl font-bold text-gray-900">{{ stats.total }}</div>
        </div>
        <div class="bg-white rounded-lg border border-yellow-200 p-4 shadow-sm">
          <div class="text-sm text-yellow-700 mb-1">Pending</div>
          <div class="text-2xl font-bold text-yellow-800">{{ stats.pending }}</div>
        </div>
        <div class="bg-white rounded-lg border border-green-200 p-4 shadow-sm">
          <div class="text-sm text-green-700 mb-1">Success</div>
          <div class="text-2xl font-bold text-green-800">{{ stats.success }}</div>
        </div>
        <div class="bg-white rounded-lg border border-red-200 p-4 shadow-sm">
          <div class="text-sm text-red-700 mb-1">Failed</div>
          <div class="text-2xl font-bold text-red-800">{{ stats.failed }}</div>
        </div>
        <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 shadow-sm col-span-2 md:col-span-1">
          <div class="text-sm text-blue-100 mb-1">Total Revenue</div>
          <div class="text-lg md:text-xl font-bold text-white truncate">{{ formatCurrency(stats.totalRevenue) }}</div>
        </div>
      </div>

      <!-- Filters Section -->
      <div class="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
        <div class="flex flex-col lg:flex-row gap-4">
          <!-- Search -->
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input 
              v-model="searchQuery"
              type="text"
              placeholder="Search by student name, order ID, or transaction ID..."
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          <!-- Status Filter -->
          <div class="w-full lg:w-48">
            <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select 
              v-model="statusFilter"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          <!-- Payment Type Filter -->
          <div class="w-full lg:w-48">
            <label class="block text-sm font-medium text-gray-700 mb-2">Payment Type</label>
            <select 
              v-model="typeFilter"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="">All Types</option>
              <option value="semester">Semester</option>
              <option value="monthly">Monthly</option>
              <option value="exam">Exam</option>
            </select>
          </div>
        </div>

        <div class="mt-3 text-sm text-gray-500">
          Showing {{ filteredPayments.length }} of {{ payments.length }} payments
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="bg-white rounded-lg border border-gray-200 shadow-sm p-12 text-center">
      <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
      <p class="text-gray-600 mt-4">Loading payments...</p>
    </div>

    <template v-else>
      <!-- Desktop Table View -->
      <div class="hidden md:block bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full border-collapse">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-200">
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-20">ID</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Student</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Order ID</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Transaction ID</th>
              <th class="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
              <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(payment, index) in filteredPayments" :key="payment.paymentid" 
              class="border-b border-gray-200 hover:bg-gray-50 transition-colors"
              :class="index % 2 === 0 ? 'bg-white' : 'bg-gray-50'"
            >
              <td class="px-4 py-3 text-sm text-gray-500 font-medium">#{{ payment.paymentid }}</td>
              <td class="px-4 py-3">
                <div class="text-sm font-semibold text-gray-900">{{ getStudentName(payment.studentid) }}</div>
                <div class="text-xs text-gray-500">ID: {{ payment.studentid }}</div>
              </td>
              <td class="px-4 py-3">
                <code class="text-xs bg-gray-100 px-2 py-1 rounded text-gray-700">{{ payment.midtrans_orderid || '-' }}</code>
              </td>
              <td class="px-4 py-3">
                <code class="text-xs bg-gray-100 px-2 py-1 rounded text-gray-700">{{ payment.midtrans_transactionid || '-' }}</code>
              </td>
              <td class="px-4 py-3 text-right">
                <span class="text-sm font-semibold text-gray-900">{{ formatCurrency(payment.amount) }}</span>
              </td>
              <td class="px-4 py-3">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                  {{ payment.payment_type }}
                </span>
              </td>
              <td class="px-4 py-3">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border capitalize" 
                  :class="getStatusBadge(payment.status)">
                  {{ payment.status }}
                </span>
              </td>
              <td class="px-4 py-3">
                <div class="text-sm text-gray-900">{{ formatDate(payment.created_at) }}</div>
              </td>
              <td class="px-4 py-3">
                <div class="flex justify-center">
                  <BaseButton 
                    @click="openDetailsModal(payment)" 
                    variant="secondary" 
                    size="sm"
                  >
                    Details
                  </BaseButton>
                </div>
              </td>
            </tr>
            <tr v-if="filteredPayments.length === 0">
              <td colspan="9" class="px-4 py-12 text-center">
                <div class="text-gray-400">
                  <svg class="mx-auto h-12 w-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/>
                  </svg>
                  <p class="text-sm font-medium text-gray-900">No payments found</p>
                  <p class="text-sm text-gray-500 mt-1">
                    {{ searchQuery || statusFilter || typeFilter ? 'Try adjusting your filters' : 'No payment records available' }}
                  </p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

      <!-- Mobile Card View -->
      <div class="md:hidden space-y-3">
        <div v-for="payment in filteredPayments" :key="payment.paymentid"
        class="bg-white rounded-lg border border-gray-200 shadow-sm p-4"
      >
        <div class="flex justify-between items-start mb-3">
          <div>
            <div class="text-sm font-semibold text-gray-900">{{ getStudentName(payment.studentid) }}</div>
            <div class="text-xs text-gray-500">Payment #{{ payment.paymentid }}</div>
          </div>
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border capitalize" 
            :class="getStatusBadge(payment.status)">
            {{ payment.status }}
          </span>
        </div>

        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-600">Amount:</span>
            <span class="font-semibold text-gray-900">{{ formatCurrency(payment.amount) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Type:</span>
            <span class="capitalize">{{ payment.payment_type }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Date:</span>
            <span>{{ formatDate(payment.created_at) }}</span>
          </div>
        </div>

        <div class="mt-3 pt-3 border-t border-gray-200">
          <BaseButton 
            @click="openDetailsModal(payment)" 
            variant="secondary" 
            size="sm"
            class="w-full"
          >
            View Details
          </BaseButton>
        </div>
      </div>

      <div v-if="filteredPayments.length === 0" class="bg-white rounded-lg border border-gray-200 shadow-sm p-8 text-center">
        <svg class="mx-auto h-12 w-12 mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/>
        </svg>
        <p class="text-sm font-medium text-gray-900">No payments found</p>
        <p class="text-sm text-gray-500 mt-1">
          {{ searchQuery || statusFilter || typeFilter ? 'Try adjusting your filters' : 'No payment records available' }}
        </p>
      </div>
    </div>
    </template>

    <!-- Payment Details Modal -->
    <Modal 
      :show="showDetailsModal" 
      @close="showDetailsModal = false" 
      size="2xl" 
      title="Payment Details"
      variant="gradient"
    >
      <template #icon>
        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      </template>
      <template #content>
        <div v-if="selectedPayment" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Payment ID</label>
              <p class="text-sm text-gray-900">#{{ selectedPayment.paymentid }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border capitalize" 
                :class="getStatusBadge(selectedPayment.status)">
                {{ selectedPayment.status }}
              </span>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Student</label>
            <p class="text-sm text-gray-900">{{ getStudentName(selectedPayment.studentid) }}</p>
            <p class="text-xs text-gray-500">Student ID: {{ selectedPayment.studentid }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Amount</label>
            <p class="text-lg font-bold text-gray-900">{{ formatCurrency(selectedPayment.amount) }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Payment Type</label>
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-800 capitalize">
              {{ selectedPayment.payment_type }}
            </span>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Midtrans Order ID</label>
            <code class="block text-sm bg-gray-100 px-3 py-2 rounded text-gray-700">
              {{ selectedPayment.midtrans_orderid || '-' }}
            </code>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Midtrans Transaction ID</label>
            <code class="block text-sm bg-gray-100 px-3 py-2 rounded text-gray-700">
              {{ selectedPayment.midtrans_transactionid || '-' }}
            </code>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Created At</label>
              <p class="text-sm text-gray-900">{{ formatDate(selectedPayment.created_at) }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Updated At</label>
              <p class="text-sm text-gray-900">{{ formatDate(selectedPayment.updated_at) }}</p>
            </div>
          </div>
        </div>
      </template>
      <template #footer>
        <BaseButton @click="showDetailsModal = false" variant="secondary">
          Close
        </BaseButton>
      </template>
    </Modal>

    <!-- Notification Modal -->
    <Modal 
      :show="showNotificationModal" 
      @close="showNotificationModal = false" 
      :type="notificationType"
      :message="notificationMessage"
      variant="gradient"
    />
  </div>
</template>

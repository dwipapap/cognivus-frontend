<script setup>
import { ref, onMounted, computed } from 'vue';
import { paymentAPI, studentAPI } from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { createCsvContent } from '../../utils/csv';
import Modal from '../../components/ui/Modal.vue';


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
const paymentPage = ref(1);
const paymentPageSize = 20;

const currentMonth = new Date();
const currentMonthLabel = currentMonth.toLocaleDateString('en-US', {
  month: 'long',
  year: 'numeric'
});

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
  return classes[status] || 'bg-muted text-default border-default';
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

const paginatedPayments = computed(() => {
  const start = (paymentPage.value - 1) * paymentPageSize;
  const end = start + paymentPageSize;
  return filteredPayments.value.slice(start, end);
});

/** Payment statistics */
const stats = computed(() => {
  const total = payments.value.length;
  const pending = payments.value.filter(p => p.status === 'pending').length;
  const success = payments.value.filter(p => p.status === 'success').length;
  const failed = payments.value.filter(p => p.status === 'failed').length;
  const monthlyRevenue = payments.value
    .filter(p => {
      if (p.status !== 'success' || !p.created_at) return false;

      const paymentDate = new Date(p.created_at);
      return !Number.isNaN(paymentDate.getTime())
        && paymentDate.getFullYear() === currentMonth.getFullYear()
        && paymentDate.getMonth() === currentMonth.getMonth();
    })
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  return { total, pending, success, failed, monthlyRevenue };
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
    // Failed to fetch students
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

  const csvContent = createCsvContent([headers, ...rows]);

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const objectUrl = URL.createObjectURL(blob);
  link.href = objectUrl;
  link.download = `payments_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(objectUrl);
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
          <h1 class="text-2xl font-bold text-default">Manage Payments</h1>
          <p class="text-toned mt-1">View and monitor all student payment transactions</p>
        </div>
        <div class="flex gap-2">
          <UButton @click="refreshPayments" color="neutral" variant="soft" icon="i-lucide-refresh-cw">
            Refresh
          </UButton>
          <UButton @click="exportToCSV" color="primary" variant="solid" icon="i-lucide-download">
            Export CSV
          </UButton>
        </div>
      </div>

      <!-- Statistics Cards -->
      <div class="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 mb-6">
        <div class="bg-default rounded-lg border border-default p-4 shadow-sm">
          <div class="text-sm text-toned mb-1">Total Payments</div>
          <div class="text-2xl font-bold text-default">{{ stats.total }}</div>
        </div>
        <div class="bg-default rounded-lg border border-yellow-200 p-4 shadow-sm">
          <div class="text-sm text-yellow-700 mb-1">Pending</div>
          <div class="text-2xl font-bold text-yellow-800">{{ stats.pending }}</div>
        </div>
        <div class="bg-default rounded-lg border border-green-200 p-4 shadow-sm">
          <div class="text-sm text-green-700 mb-1">Success</div>
          <div class="text-2xl font-bold text-green-800">{{ stats.success }}</div>
        </div>
        <div class="bg-default rounded-lg border border-red-200 p-4 shadow-sm">
          <div class="text-sm text-red-700 mb-1">Failed</div>
          <div class="text-2xl font-bold text-red-800">{{ stats.failed }}</div>
        </div>
        <div class="bg-inverted rounded-lg p-4 shadow-sm col-span-2 md:col-span-1">
          <div class="text-sm text-muted mb-1">Monthly Revenue</div>
          <div class="text-lg md:text-xl font-bold text-white truncate">{{ formatCurrency(stats.monthlyRevenue) }}</div>
          <div class="text-xs text-muted mt-1">{{ currentMonthLabel }}</div>
        </div>
      </div>

      <!-- Filters Section -->
      <div class="bg-default rounded-lg border border-default p-4 shadow-sm">
        <div class="flex flex-col lg:flex-row gap-4">
          <!-- Search -->
          <div class="flex-1">
            <UFormField label="Search">
              <UInput v-model="searchQuery" placeholder="Search by student name, order ID, or transaction ID..." />
            </UFormField>
          </div>

          <!-- Status Filter -->
          <div class="w-full lg:w-48">
            <UFormField label="Status">
              <USelect v-model="statusFilter" :items="[
                { label: 'Pending', value: 'pending' },
                { label: 'Success', value: 'success' },
                { label: 'Failed', value: 'failed' }
              ]" placeholder="All Status" clearable />
            </UFormField>
          </div>

          <!-- Payment Type Filter -->
          <div class="w-full lg:w-48">
            <UFormField label="Payment Type">
              <USelect v-model="typeFilter" :items="[
                { label: 'Semester', value: 'semester' },
                { label: 'Monthly', value: 'monthly' },
                { label: 'Exam', value: 'exam' }
              ]" placeholder="All Types" clearable />
            </UFormField>
          </div>
        </div>

        <div class="mt-3 text-sm text-muted">
          Showing {{ filteredPayments.length }} of {{ payments.length }} payments
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="bg-default rounded-lg border border-default shadow-sm p-12 text-center">
      <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-toned border-r-transparent"></div>
      <p class="text-toned mt-4">Loading payments...</p>
    </div>

    <template v-else>
      <!-- Desktop Table View -->
      <div class="hidden md:block bg-default rounded-lg border border-default shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full border-collapse">
          <thead>
            <tr class="bg-muted border-b border-default">
              <th class="px-4 py-3 text-left text-xs font-semibold text-toned uppercase tracking-wider w-20">ID</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-toned uppercase tracking-wider">Student</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-toned uppercase tracking-wider">Order ID</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-toned uppercase tracking-wider">Transaction ID</th>
              <th class="px-4 py-3 text-right text-xs font-semibold text-toned uppercase tracking-wider">Amount</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-toned uppercase tracking-wider">Type</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-toned uppercase tracking-wider">Status</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-toned uppercase tracking-wider">Date</th>
              <th class="px-4 py-3 text-center text-xs font-semibold text-toned uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(payment, index) in paginatedPayments" :key="payment.paymentid" 
              class="border-b border-default transition-colors"
              :class="index % 2 === 0 ? 'bg-default' : 'bg-muted'"
            >
              <td class="px-4 py-3 text-sm text-muted font-medium">#{{ payment.paymentid }}</td>
              <td class="px-4 py-3">
                <div class="text-sm font-semibold text-default">{{ getStudentName(payment.studentid) }}</div>
                <div class="text-xs text-muted">ID: {{ payment.studentid }}</div>
              </td>
              <td class="px-4 py-3">
                <code class="text-xs bg-muted px-2 py-1 rounded text-default">{{ payment.midtrans_orderid || '-' }}</code>
              </td>
              <td class="px-4 py-3">
                <code class="text-xs bg-muted px-2 py-1 rounded text-default">{{ payment.midtrans_transactionid || '-' }}</code>
              </td>
              <td class="px-4 py-3 text-right">
                <span class="text-sm font-semibold text-default">{{ formatCurrency(payment.amount) }}</span>
              </td>
              <td class="px-4 py-3">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-muted text-default capitalize">
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
                <div class="text-sm text-default">{{ formatDate(payment.created_at) }}</div>
              </td>
              <td class="px-4 py-3">
                <div class="flex justify-center">
                  <UButton @click="openDetailsModal(payment)" color="neutral" variant="soft" size="sm">
                    Details
                  </UButton>
                </div>
              </td>
            </tr>
            <tr v-if="paginatedPayments.length === 0">
              <td colspan="9" class="px-4 py-12 text-center">
                <div class="text-muted">
                  <UIcon name="i-lucide-search" class="mx-auto h-12 w-12 mb-4" />
                  <p class="text-sm font-medium text-default">No payments found</p>
                  <p class="text-sm text-muted mt-1">
                    {{ searchQuery || statusFilter || typeFilter ? 'Try adjusting your filters' : 'No payment records available' }}
                  </p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="filteredPayments.length > paymentPageSize" class="hidden md:flex items-center justify-between px-4 py-3 bg-muted border-t border-default">
      <p class="text-sm text-toned">
        Showing {{ (paymentPage - 1) * paymentPageSize + 1 }} to {{ Math.min(paymentPage * paymentPageSize, filteredPayments.length) }} of {{ filteredPayments.length }} payments
      </p>
      <UPagination v-model:page="paymentPage" :total="filteredPayments.length" :max="paymentPageSize" :sibling-count="1" size="sm" />
    </div>

      <!-- Mobile Card View -->
      <div class="md:hidden space-y-3">
        <div v-for="payment in paginatedPayments" :key="payment.paymentid"
        class="bg-default rounded-lg border border-default shadow-sm p-4"
      >
        <div class="flex justify-between items-start mb-3">
          <div>
            <div class="text-sm font-semibold text-default">{{ getStudentName(payment.studentid) }}</div>
            <div class="text-xs text-muted">Payment #{{ payment.paymentid }}</div>
          </div>
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border capitalize" 
            :class="getStatusBadge(payment.status)">
            {{ payment.status }}
          </span>
        </div>

        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-toned">Amount:</span>
            <span class="font-semibold text-default">{{ formatCurrency(payment.amount) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-toned">Type:</span>
            <span class="capitalize">{{ payment.payment_type }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-toned">Date:</span>
            <span>{{ formatDate(payment.created_at) }}</span>
          </div>
        </div>

        <div class="mt-3 pt-3 border-t border-default">
          <UButton @click="openDetailsModal(payment)" color="neutral" variant="soft" size="sm" class="w-full">
            View Details
          </UButton>
        </div>
      </div>

      <div v-if="filteredPayments.length === 0" class="bg-default rounded-lg border border-default shadow-sm p-8 text-center">
        <UIcon name="i-lucide-search" class="mx-auto h-12 w-12 mb-4 text-muted" />
        <p class="text-sm font-medium text-default">No payments found</p>
        <p class="text-sm text-muted mt-1">
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
    >
      <template #icon>
        <UIcon name="i-lucide-wallet" class="w-6 h-6 text-white" />
      </template>
      <template #content>
        <div v-if="selectedPayment" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-default mb-1">Payment ID</label>
              <p class="text-sm text-default">#{{ selectedPayment.paymentid }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-default mb-1">Status</label>
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border capitalize" 
                :class="getStatusBadge(selectedPayment.status)">
                {{ selectedPayment.status }}
              </span>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-default mb-1">Student</label>
            <p class="text-sm text-default">{{ getStudentName(selectedPayment.studentid) }}</p>
            <p class="text-xs text-muted">Student ID: {{ selectedPayment.studentid }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-default mb-1">Amount</label>
            <p class="text-lg font-bold text-default">{{ formatCurrency(selectedPayment.amount) }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-default mb-1">Payment Type</label>
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-muted text-default capitalize">
              {{ selectedPayment.payment_type }}
            </span>
          </div>

          <div>
            <label class="block text-sm font-medium text-default mb-1">Midtrans Order ID</label>
            <code class="block text-sm bg-muted px-3 py-2 rounded text-default">
              {{ selectedPayment.midtrans_orderid || '-' }}
            </code>
          </div>

          <div>
            <label class="block text-sm font-medium text-default mb-1">Midtrans Transaction ID</label>
            <code class="block text-sm bg-muted px-3 py-2 rounded text-default">
              {{ selectedPayment.midtrans_transactionid || '-' }}
            </code>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-default mb-1">Created At</label>
              <p class="text-sm text-default">{{ formatDate(selectedPayment.created_at) }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-default mb-1">Updated At</label>
              <p class="text-sm text-default">{{ formatDate(selectedPayment.updated_at) }}</p>
            </div>
          </div>

        </div>
      </template>
      <template #footer>
        <UButton @click="showDetailsModal = false" color="neutral" variant="outline">
          Close
        </UButton>
      </template>
    </Modal>

    <!-- Notification Modal -->
    <Modal 
      :show="showNotificationModal" 
      @close="showNotificationModal = false" 
      :type="notificationType"
      :message="notificationMessage"
    />
  </div>
</template>

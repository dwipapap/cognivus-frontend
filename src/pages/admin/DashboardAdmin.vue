<script setup>
import { ref, onMounted, computed } from 'vue';
import { studentAPI, lecturerAPI, classAPI, dashboardAPI, paymentAPI } from '@/services/api';
import BaseCard from '@/components/ui/BaseCard.vue';
import LoadingBar from '@/components/ui/LoadingBar.vue';

const students = ref([]);
const lecturers = ref([]);
const classes = ref([]);
const payments = ref([]);
const recentActivities = ref([]);
const isLoading = ref(true);

/** Fetch dashboard data */
const fetchDashboardData = async () => {
  try {
    isLoading.value = true;
    const [studentsRes, lecturersRes, classesRes, paymentsRes, activitiesRes] = await Promise.all([
      studentAPI.getAllStudents(),
      lecturerAPI.getAllLecturers(),
      classAPI.getAllClasses(),
      paymentAPI.getAllPayments(),
      dashboardAPI.getRecentActivity()
    ]);

    if (studentsRes.data.success) students.value = studentsRes.data.data;
    if (lecturersRes.data.success) lecturers.value = lecturersRes.data.data;
    if (classesRes.data.success) classes.value = classesRes.data.data;
    if (paymentsRes.data.success) payments.value = paymentsRes.data.data;
    if (activitiesRes.data.success) recentActivities.value = activitiesRes.data.data;
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error);
  } finally {
    isLoading.value = false;
  }
};

/** Format timestamp to relative time */
const getRelativeTime = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  }
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  }
  const days = Math.floor(diffInSeconds / 86400);
  if (days < 30) return `${days} day${days !== 1 ? 's' : ''} ago`;
  if (days < 365) {
    const months = Math.floor(days / 30);
    return `${months} month${months !== 1 ? 's' : ''} ago`;
  }
  const years = Math.floor(days / 365);
  return `${years} year${years !== 1 ? 's' : ''} ago`;
};

/** Format currency (Indonesian Rupiah) */
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
};

/** Calculate total revenue from successful payments */
const totalRevenue = computed(() => {
  return payments.value
    .filter(payment => payment.status === 'success')
    .reduce((sum, payment) => sum + (payment.amount || 0), 0);
});

/** Computed stats */
const stats = computed(() => [
  { title: 'Total Students', value: students.value.length.toString(), icon: 'users', color: 'blue' },
  { title: 'Total Lecturers', value: lecturers.value.length.toString(), icon: 'teacher', color: 'green' },
  { title: 'Total Classes', value: classes.value.length.toString(), icon: 'class', color: 'purple' },
]);

onMounted(() => {
  fetchDashboardData();
});
</script>

<template>
  <div>
    <h1 class="text-4xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
    <p class="text-gray-600 mb-8">Welcome to the admin control panel</p>

    <!-- Stats Grid -->
        <!-- Loading State -->
    <div v-if="isLoading" class="max-w-2xl mx-auto py-20">
      <LoadingBar :loading="true" color="blue" :duration="2000" />
      <p class="text-center text-gray-600 mt-4">Loading dashboard...</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div 
        v-for="stat in stats" 
        :key="stat.title"
        class="stat-card bg-white/60 backdrop-blur-sm border border-white/50 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
      >
        <div class="flex items-center justify-between">
          <div class="flex-1 min-w-0 mr-4">
            <p class="text-sm font-medium text-gray-600 mb-1">{{ stat.title }}</p>
            <h3 
              :class="stat.icon === 'money' ? 'text-xl md:text-2xl font-bold text-gray-800' : 'text-3xl font-bold text-gray-800'"
            >
              {{ stat.value }}
            </h3>
          </div>
          <div :class="`w-14 h-14 flex-shrink-0 rounded-2xl flex items-center justify-center bg-${stat.color}-100`">
            <svg class="w-7 h-7" :class="`text-${stat.color}-600`" fill="currentColor" viewBox="0 0 20 20">
              <path v-if="stat.icon === 'users'" d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"></path>
              <path v-else-if="stat.icon === 'teacher'" d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"></path>
              <path v-else-if="stat.icon === 'class'" d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
              <path v-else-if="stat.icon === 'money'" d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"></path>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="bg-white/60 backdrop-blur-sm border border-white/50 p-6 rounded-2xl shadow-lg mb-8">
      <h2 class="text-2xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <router-link 
          to="/admin/lecturers" 
          class="quick-action-btn flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all duration-200 border border-blue-200 hover:shadow-md"
        >
          <svg class="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z"></path>
          </svg>
          <div>
            <h3 class="font-semibold text-gray-800">Add Lecturer</h3>
            <p class="text-sm text-gray-600">Register new instructor</p>
          </div>
        </router-link>

        <router-link 
          to="/admin/classes" 
          class="quick-action-btn flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 rounded-xl transition-all duration-200 border border-green-200 hover:shadow-md"
        >
          <svg class="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"></path>
          </svg>
          <div>
            <h3 class="font-semibold text-gray-800">Create Class</h3>
            <p class="text-sm text-gray-600">Setup new class</p>
          </div>
        </router-link>

        <router-link 
          to="/admin/prices" 
          class="quick-action-btn flex items-center gap-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-xl transition-all duration-200 border border-purple-200 hover:shadow-md"
        >
          <svg class="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"></path>
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clip-rule="evenodd"></path>
          </svg>
          <div>
            <h3 class="font-semibold text-gray-800">Manage Prices</h3>
            <p class="text-sm text-gray-600">Update class pricing</p>
          </div>
        </router-link>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="bg-white/60 backdrop-blur-sm border border-white/50 p-6 rounded-2xl shadow-lg">
      <h2 class="text-2xl font-semibold text-gray-800 mb-4">Recent Activity</h2>
      
      <!-- Loading State -->
      <div v-if="isLoading" class="text-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p class="text-sm text-gray-600 mt-2">Loading activities...</p>
      </div>
      
      <!-- Empty State -->
      <div v-else-if="recentActivities.length === 0" class="text-center py-12">
        <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <p class="text-gray-500 font-medium">No recent activity</p>
        <p class="text-sm text-gray-400 mt-1">Activity will appear here as actions occur</p>
      </div>
      
      <!-- Activity List -->
      <div v-else class="space-y-3">
        <div 
          v-for="(activity, index) in recentActivities" 
          :key="`${activity.type}-${activity.timestamp}-${index}`"
          class="flex items-start gap-3 p-3 bg-white/40 rounded-lg hover:bg-white/60 transition-colors"
        >
          <div 
            :class="`w-2 h-2 rounded-full bg-${activity.color}-500 mt-2 flex-shrink-0`"
          ></div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-800">{{ activity.title }}</p>
            <p class="text-xs text-gray-600 truncate">
              {{ activity.description }} • {{ getRelativeTime(activity.timestamp) }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stat-card {
  animation: fadeInUp 0.5s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.quick-action-btn {
  animation: fadeIn 0.6s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Rick Roll specific animations */
@keyframes pulse-slow {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.95;
  }
}

.animate-pulse-slow {
  animation: pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.aspect-video {
  aspect-ratio: 16 / 9;
}
</style>
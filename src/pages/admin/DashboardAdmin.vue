<script setup>
import { ref, onMounted, computed } from 'vue';
import { studentAPI, lecturerAPI, classAPI, dashboardAPI, paymentAPI } from '@/services/api';
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
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  const days = Math.floor(diffInSeconds / 86400);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
};

/** Format currency */
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
};

/** Total revenue from successful payments */
const totalRevenue = computed(() => {
  return payments.value
    .filter(p => p.status === 'success')
    .reduce((sum, p) => sum + (p.amount || 0), 0);
});

/** Pending payments count */
const pendingCount = computed(() => payments.value.filter(p => p.status === 'pending').length);

/** Recent team members (students + lecturers) */
const recentTeam = computed(() => {
  const team = [];
  students.value.slice(0, 4).forEach(s => {
    team.push({ name: s.fullname, type: 'student', initials: getInitials(s.fullname) });
  });
  lecturers.value.slice(0, 2).forEach(l => {
    team.push({ name: l.fullname, type: 'lecturer', initials: getInitials(l.fullname) });
  });
  return team.slice(0, 6);
});

/** Get initials from name */
const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

/** Activity dot color */
const getDotColor = (color) => {
  const colors = { blue: 'bg-blue-500', green: 'bg-green-500', yellow: 'bg-yellow-500', emerald: 'bg-emerald-500', orange: 'bg-orange-500' };
  return colors[color] || 'bg-gray-400';
};

onMounted(fetchDashboardData);
</script>

<template>
  <div>
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-900">Dashboard</h1>
      <p class="text-gray-500 mt-1">Overview of your institution</p>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="max-w-md mx-auto py-20">
      <LoadingBar :loading="true" color="blue" :duration="2000" />
    </div>

    <!-- Bento Grid -->
    <div v-else class="grid grid-cols-2 md:grid-cols-4 gap-4">

      <!-- Stat: Students -->
      <div class="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between mb-3">
          <span class="text-sm text-gray-500">Total Students</span>
          <span class="text-gray-300">•••</span>
        </div>
        <div class="text-3xl font-bold text-gray-900">{{ students.length }}</div>
        <div class="mt-3 flex items-end gap-1 h-8">
          <div v-for="i in 6" :key="i" class="flex-1 bg-blue-500 rounded-sm"
            :style="`height: ${20 + Math.random() * 80}%`"></div>
        </div>
        <router-link to="/admin/students" class="mt-3 block text-xs text-blue-600 hover:text-blue-800 font-medium">
          Manage Students →
        </router-link>
      </div>

      <!-- Stat: Lecturers -->
      <div class="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between mb-3">
          <span class="text-sm text-gray-500">Total Lecturers</span>
          <span class="text-gray-300">•••</span>
        </div>
        <div class="text-3xl font-bold text-gray-900">{{ lecturers.length }}</div>
        <div class="mt-3 flex items-end gap-1 h-8">
          <div v-for="i in 6" :key="i" class="flex-1 rounded-sm" :class="i % 2 === 0 ? 'bg-green-400' : 'bg-blue-400'"
            :style="`height: ${30 + Math.random() * 70}%`"></div>
        </div>
        <router-link to="/admin/lecturers" class="mt-3 block text-xs text-green-600 hover:text-green-800 font-medium">
          Manage Lecturers →
        </router-link>
      </div>

      <!-- Last Actions -->
      <div class="col-span-2 md:col-span-1 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <span class="text-sm font-semibold text-gray-700">Last actions</span>
          <span class="text-gray-300">•••</span>
        </div>
        <div class="space-y-3">
          <div v-for="(act, i) in recentActivities.slice(0, 3)" :key="i" class="flex items-start gap-2">
            <div :class="['w-2 h-2 rounded-full mt-1.5 flex-shrink-0', getDotColor(act.color)]"></div>
            <div class="flex-1 min-w-0">
              <p class="text-sm text-gray-800 truncate">{{ act.title }}</p>
              <p class="text-xs text-gray-400">{{ act.description }}</p>
            </div>
            <span class="text-xs text-gray-400 flex-shrink-0">{{ getRelativeTime(act.timestamp) }}</span>
          </div>
        </div>
      </div>

      <!-- Quick Actions (was Team) -->
      <div class="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <p class="text-sm font-semibold text-gray-700 mb-3">Quick Actions</p>
        <div class="space-y-2">
          <router-link to="/admin/lecturers"
            class="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors">
            <div class="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
              <svg class="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
              </svg>
            </div>
            Add Lecturer
          </router-link>
          <router-link to="/admin/classes"
            class="flex items-center gap-2 text-sm text-gray-600 hover:text-green-600 transition-colors">
            <div class="w-6 h-6 bg-green-100 rounded flex items-center justify-center">
              <svg class="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd"
                  d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                  clip-rule="evenodd" />
              </svg>
            </div>
            Create Class
          </router-link>
          <router-link to="/admin/prices"
            class="flex items-center gap-2 text-sm text-gray-600 hover:text-purple-600 transition-colors">
            <div class="w-6 h-6 bg-purple-100 rounded flex items-center justify-center">
              <svg class="w-3 h-3 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                  clip-rule="evenodd" />
              </svg>
            </div>
            Manage Prices
          </router-link>
        </div>
      </div>

      <!-- Revenue Card (Wide) -->
      <div class="col-span-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-white/70">Total Revenue</p>
            <p class="text-2xl md:text-3xl font-bold mt-1">{{ formatCurrency(totalRevenue) }}</p>
            <p class="text-sm text-white/60 mt-1">{{ pendingCount }} pending</p>
          </div>
          <div class="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                clip-rule="evenodd" />
            </svg>
          </div>
        </div>
      </div>

      <!-- Classes Card -->
      <div class="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between mb-3">
          <span class="text-sm text-gray-500">Classes</span>
          <span class="text-gray-300">•••</span>
        </div>
        <div class="text-3xl font-bold text-gray-900">{{ classes.length }}</div>
        <p class="text-xs text-purple-600 mt-1">Active classes</p>
        <router-link to="/admin/classes" class="mt-3 block text-xs text-purple-600 hover:text-purple-800 font-medium">
          Manage Classes →
        </router-link>
      </div>

      <!-- Payments Card -->
      <div class="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between mb-3">
          <span class="text-sm text-gray-500">Payments</span>
          <span class="text-gray-300">•••</span>
        </div>
        <div class="text-3xl font-bold text-gray-900">{{ payments.length }}</div>
        <p class="text-xs text-orange-600 mt-1">{{ pendingCount }} pending</p>
        <router-link to="/admin/transactions"
          class="mt-3 block text-xs text-orange-600 hover:text-orange-800 font-medium">
          View Transactions →
        </router-link>
      </div>

      <!-- Full Activity Feed (Full Width) -->
      <div class="col-span-2 md:col-span-4 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <span class="font-semibold text-gray-800">Recent Activity</span>
          <span class="text-xs text-gray-400">Last 10</span>
        </div>
        <div v-if="recentActivities.length === 0" class="text-center py-8 text-gray-400 text-sm">
          No recent activity
        </div>
        <div v-else class="space-y-3 max-h-64 overflow-y-auto">
          <div v-for="(act, i) in recentActivities" :key="i"
            class="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
            <div :class="['w-2 h-2 rounded-full mt-1.5', getDotColor(act.color)]"></div>
            <div class="flex-1 min-w-0">
              <p class="text-sm text-gray-800">{{ act.title }}</p>
              <p class="text-xs text-gray-400 truncate">{{ act.description }}</p>
            </div>
            <span class="text-xs text-gray-400">{{ getRelativeTime(act.timestamp) }}</span>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.grid>div {
  animation: fadeIn 0.3s ease-out;
  animation-fill-mode: backwards;
}

.grid>div:nth-child(1) {
  animation-delay: 0.05s;
}

.grid>div:nth-child(2) {
  animation-delay: 0.1s;
}

.grid>div:nth-child(3) {
  animation-delay: 0.15s;
}

.grid>div:nth-child(4) {
  animation-delay: 0.2s;
}

.grid>div:nth-child(5) {
  animation-delay: 0.25s;
}

.grid>div:nth-child(6) {
  animation-delay: 0.3s;
}

.grid>div:nth-child(7) {
  animation-delay: 0.35s;
}

.grid>div:nth-child(8) {
  animation-delay: 0.4s;
}

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
</style>
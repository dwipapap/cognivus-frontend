<script setup>
import { ref, onMounted, computed } from 'vue';
import { studentAPI, lecturerAPI, classAPI, dashboardAPI, paymentAPI } from '@/services/api';

import { formatCurrency } from '../../utils/formatters';

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

/** Total revenue from successful payments */
const totalRevenue = computed(() => {
  return payments.value
    .filter(p => p.status === 'success')
    .reduce((sum, p) => sum + (p.amount || 0), 0);
});

/** Pending payments count */
const pendingCount = computed(() => payments.value.filter(p => p.status === 'pending').length);

onMounted(fetchDashboardData);
</script>

<template>
  <div class="space-y-8 pb-8 w-full">
    <!-- Header -->
    <header class="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
      <div>
        <h1 class="text-2xl md:text-3xl font-semibold text-default tracking-tight">Dashboard</h1>
        <p class="text-muted mt-2">Overview of the institution's key metrics and recent activity.</p>
      </div>
      <div class="flex items-center gap-3 sm:gap-4 flex-wrap">
        <router-link to="/admin/lecturers" class="text-sm font-medium text-muted hover:text-default transition-colors">
          Add Staff
        </router-link>
        <span class="text-muted">•</span>
        <router-link to="/admin/classes" class="text-sm font-medium text-muted hover:text-default transition-colors">
          Create Class
        </router-link>
        <span class="text-muted">•</span>
        <router-link to="/admin/prices" class="text-sm font-medium text-muted hover:text-default transition-colors">
          Manage Prices
        </router-link>
      </div>
    </header>

    <!-- Loading -->
    <div v-if="isLoading" class="flex justify-center py-16">
      <UIcon name="i-lucide-loader-circle" class="w-8 h-8 animate-spin text-muted" />
    </div>

    <div v-else class="space-y-16">
      <!-- Key Metrics Ledger (replaces cards) -->
      <section>
        <h2 class="text-xs font-semibold text-muted uppercase tracking-widest mb-6">Key Metrics</h2>
        <div class="grid grid-cols-2 md:grid-cols-5 gap-8 md:gap-6 border-y border-default py-8">
          
          <!-- Metric: Revenue -->
          <div class="flex flex-col">
            <div class="text-sm font-medium text-muted mb-2">Total Revenue</div>
            <div class="text-2xl md:text-3xl font-semibold text-default tracking-tight">{{ formatCurrency(totalRevenue) }}</div>
            <div class="mt-2 text-xs text-muted h-4 flex items-center">
              <span v-if="pendingCount > 0" class="inline-flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                {{ pendingCount }} pending
              </span>
            </div>
          </div>
          
          <!-- Metric: Students -->
          <div class="flex flex-col">
            <div class="text-sm font-medium text-muted mb-2">Students</div>
            <div class="text-2xl md:text-3xl font-semibold text-default tracking-tight">{{ students.length }}</div>
            <router-link to="/admin/students" class="mt-2 text-xs font-medium text-muted hover:text-default transition-colors h-4 inline-flex items-center group">
              View directory <span class="ml-1 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all">→</span>
            </router-link>
          </div>
          
          <!-- Metric: Lecturers -->
          <div class="flex flex-col">
            <div class="text-sm font-medium text-muted mb-2">Lecturers</div>
            <div class="text-2xl md:text-3xl font-semibold text-default tracking-tight">{{ lecturers.length }}</div>
            <router-link to="/admin/lecturers" class="mt-2 text-xs font-medium text-muted hover:text-default transition-colors h-4 inline-flex items-center group">
              Manage staff <span class="ml-1 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all">→</span>
            </router-link>
          </div>
          
          <!-- Metric: Classes -->
          <div class="flex flex-col">
            <div class="text-sm font-medium text-muted mb-2">Classes</div>
            <div class="text-2xl md:text-3xl font-semibold text-default tracking-tight">{{ classes.length }}</div>
            <router-link to="/admin/classes" class="mt-2 text-xs font-medium text-muted hover:text-default transition-colors h-4 inline-flex items-center group">
              Active curriculum <span class="ml-1 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all">→</span>
            </router-link>
          </div>
          
          <!-- Metric: Payments -->
          <div class="flex flex-col">
            <div class="text-sm font-medium text-muted mb-2">Payments</div>
            <div class="text-2xl md:text-3xl font-semibold text-default tracking-tight">{{ payments.length }}</div>
            <router-link to="/admin/payments" class="mt-2 text-xs font-medium text-muted hover:text-default transition-colors h-4 inline-flex items-center group">
              Transactions <span class="ml-1 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all">→</span>
            </router-link>
          </div>

        </div>
      </section>

      <!-- Recent Activity (Flattened) -->
      <section>
        <div class="flex items-baseline justify-between mb-6">
          <h2 class="text-xs font-semibold text-muted uppercase tracking-widest">Recent Activity</h2>
          <span class="text-xs text-muted font-medium">Last 10 events</span>
        </div>
        
        <div v-if="recentActivities.length === 0" class="py-8 text-muted text-sm">
          No recent activity recorded.
        </div>
        
        <div v-else class="space-y-0 border-t border-default">
          <div v-for="(act, i) in recentActivities" :key="i"
            class="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-6 py-4 border-b border-muted hover:bg-elevated transition-colors group px-2 sm:px-4 -mx-2 sm:-mx-4 rounded-lg"
          >
            <div class="w-24 flex-shrink-0 text-xs text-muted font-mono tracking-tight group-hover:text-toned transition-colors">
              {{ getRelativeTime(act.timestamp) }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-default truncate">{{ act.title }}</p>
            </div>
            <div class="flex-[2] min-w-0">
              <p class="text-sm text-toned truncate">{{ act.description }}</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  </div>
</template>

<style scoped>
/* Removed decorative animations for a snappier product experience */
</style>

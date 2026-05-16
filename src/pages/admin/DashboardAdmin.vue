<script setup>
import { ref, onMounted, computed } from 'vue';
import { studentAPI, lecturerAPI, classAPI, dashboardAPI, paymentAPI } from '@/services/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue';
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
        <h1 class="text-2xl md:text-3xl font-semibold text-slate-900 tracking-tight">Dashboard</h1>
        <p class="text-slate-500 mt-2">Overview of the institution's key metrics and recent activity.</p>
      </div>
      <div class="flex items-center gap-3 sm:gap-4 flex-wrap">
        <router-link to="/admin/lecturers" class="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
          Add Staff
        </router-link>
        <span class="text-slate-300">•</span>
        <router-link to="/admin/classes" class="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
          Create Class
        </router-link>
        <span class="text-slate-300">•</span>
        <router-link to="/admin/prices" class="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
          Manage Prices
        </router-link>
      </div>
    </header>

    <!-- Loading -->
    <div v-if="isLoading" class="py-20 flex justify-center">
      <LoadingSpinner size="lg" color="slate" :center="true" />
    </div>

    <div v-else class="space-y-16">
      <!-- Key Metrics Ledger (replaces cards) -->
      <section>
        <h2 class="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-6">Key Metrics</h2>
        <div class="grid grid-cols-2 md:grid-cols-5 gap-8 md:gap-6 border-y border-slate-200 py-8">
          
          <!-- Metric: Revenue -->
          <div class="flex flex-col">
            <div class="text-sm font-medium text-slate-500 mb-2">Total Revenue</div>
            <div class="text-2xl md:text-3xl font-semibold text-slate-900 tracking-tight">{{ formatCurrency(totalRevenue) }}</div>
            <div class="mt-2 text-xs text-slate-500 h-4 flex items-center">
              <span v-if="pendingCount > 0" class="inline-flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                {{ pendingCount }} pending
              </span>
            </div>
          </div>
          
          <!-- Metric: Students -->
          <div class="flex flex-col">
            <div class="text-sm font-medium text-slate-500 mb-2">Students</div>
            <div class="text-2xl md:text-3xl font-semibold text-slate-900 tracking-tight">{{ students.length }}</div>
            <router-link to="/admin/students" class="mt-2 text-xs font-medium text-slate-400 hover:text-slate-900 transition-colors h-4 inline-flex items-center group">
              View directory <span class="ml-1 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all">→</span>
            </router-link>
          </div>
          
          <!-- Metric: Lecturers -->
          <div class="flex flex-col">
            <div class="text-sm font-medium text-slate-500 mb-2">Lecturers</div>
            <div class="text-2xl md:text-3xl font-semibold text-slate-900 tracking-tight">{{ lecturers.length }}</div>
            <router-link to="/admin/lecturers" class="mt-2 text-xs font-medium text-slate-400 hover:text-slate-900 transition-colors h-4 inline-flex items-center group">
              Manage staff <span class="ml-1 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all">→</span>
            </router-link>
          </div>
          
          <!-- Metric: Classes -->
          <div class="flex flex-col">
            <div class="text-sm font-medium text-slate-500 mb-2">Classes</div>
            <div class="text-2xl md:text-3xl font-semibold text-slate-900 tracking-tight">{{ classes.length }}</div>
            <router-link to="/admin/classes" class="mt-2 text-xs font-medium text-slate-400 hover:text-slate-900 transition-colors h-4 inline-flex items-center group">
              Active curriculum <span class="ml-1 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all">→</span>
            </router-link>
          </div>
          
          <!-- Metric: Payments -->
          <div class="flex flex-col">
            <div class="text-sm font-medium text-slate-500 mb-2">Payments</div>
            <div class="text-2xl md:text-3xl font-semibold text-slate-900 tracking-tight">{{ payments.length }}</div>
            <router-link to="/admin/payments" class="mt-2 text-xs font-medium text-slate-400 hover:text-slate-900 transition-colors h-4 inline-flex items-center group">
              Transactions <span class="ml-1 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all">→</span>
            </router-link>
          </div>

        </div>
      </section>

      <!-- Recent Activity (Flattened) -->
      <section>
        <div class="flex items-baseline justify-between mb-6">
          <h2 class="text-xs font-semibold text-slate-400 uppercase tracking-widest">Recent Activity</h2>
          <span class="text-xs text-slate-400 font-medium">Last 10 events</span>
        </div>
        
        <div v-if="recentActivities.length === 0" class="py-8 text-slate-400 text-sm">
          No recent activity recorded.
        </div>
        
        <div v-else class="space-y-0 border-t border-slate-200">
          <div v-for="(act, i) in recentActivities" :key="i"
            class="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-6 py-4 border-b border-slate-100 hover:bg-slate-50 transition-colors group px-2 sm:px-4 -mx-2 sm:-mx-4 rounded-lg"
          >
            <div class="w-24 flex-shrink-0 text-xs text-slate-400 font-mono tracking-tight group-hover:text-slate-500 transition-colors">
              {{ getRelativeTime(act.timestamp) }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-slate-900 truncate">{{ act.title }}</p>
            </div>
            <div class="flex-[2] min-w-0">
              <p class="text-sm text-slate-500 truncate">{{ act.description }}</p>
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

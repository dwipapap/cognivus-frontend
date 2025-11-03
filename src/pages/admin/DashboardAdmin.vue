<script setup>
import { ref, onMounted, computed } from 'vue';
import { adminAPI } from '@/services/api';
import BaseCard from '@/components/ui/BaseCard.vue';
import LoadingBar from '@/components/ui/LoadingBar.vue';

const students = ref([]);
const lecturers = ref([]);
const classes = ref([]);
const isLoading = ref(true);

/** Fetch dashboard data */
const fetchDashboardData = async () => {
  try {
    isLoading.value = true;
    const [studentsRes, lecturersRes, classesRes] = await Promise.all([
      studentAPI.getAllStudents(),
      lecturerAPI.getAllLecturers(),
      classAPI.getAllClasses()
    ]);

    if (studentsRes.data.success) students.value = studentsRes.data.data;
    if (lecturersRes.data.success) lecturers.value = lecturersRes.data.data;
    if (classesRes.data.success) classes.value = classesRes.data.data;
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error);
  } finally {
    isLoading.value = false;
  }
};

/** Computed stats */
const stats = computed(() => [
  { title: 'Total Students', value: students.value.length.toString(), icon: 'users', color: 'blue' },
  { title: 'Total Lecturers', value: lecturers.value.length.toString(), icon: 'teacher', color: 'green' },
  { title: 'Total Classes', value: classes.value.length.toString(), icon: 'class', color: 'purple' },
  { title: 'Revenue', value: 'Coming Soon', icon: 'money', color: 'yellow' },
]);

onMounted(() => {
  fetchDashboardData();
});
</script>

<template>
  <div>
    <h1 class="text-4xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
    <p class="text-gray-600 mb-8">Welcome to the admin control panel</p>

    <!-- ==================== RICK ROLL SECTION - DELETE THIS BLOCK LATER ==================== -->
    <div class="bg-gradient-to-br from-red-50 via-pink-50 to-purple-50 backdrop-blur-sm border-2 border-pink-300 p-6 rounded-2xl shadow-lg mb-8 animate-pulse-slow">
      <div class="flex items-center gap-3 mb-4">
        <h2 class="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-pink-600 to-purple-600">
          🎵 Mandatory Admin Training Video 🎵
        </h2>
      </div>
      <p class="text-sm text-gray-600 mb-4 italic">⚠️ VIDEO WAJIB PENGGUNAAN ADMIN USER ITTR</p>
      <div class="aspect-video relative rounded-xl overflow-hidden shadow-xl border-4 border-white">
        <iframe
          class="absolute top-0 left-0 w-full h-full"
          src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&loop=1&playlist=dQw4w9WgXcQ"
          title="Important Admin Training"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        ></iframe>
      </div>
    </div>
    <!-- ==================== END OF RICK ROLL SECTION ==================== -->

    <!-- Stats Grid -->
        <!-- Loading State -->
    <div v-if="loading" class="max-w-2xl mx-auto py-20">
      <LoadingBar :loading="true" color="blue" :duration="2000" />
      <p class="text-center text-gray-600 mt-4">Loading dashboard...</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div 
        v-for="stat in stats" 
        :key="stat.title"
        class="stat-card bg-white/60 backdrop-blur-sm border border-white/50 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600 mb-1">{{ stat.title }}</p>
            <h3 class="text-3xl font-bold text-gray-800">{{ stat.value }}</h3>
          </div>
          <div :class="`w-14 h-14 rounded-2xl flex items-center justify-center bg-${stat.color}-100`">
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
      <div class="space-y-3">
        <div class="flex items-start gap-3 p-3 bg-white/40 rounded-lg hover:bg-white/60 transition-colors">
          <div class="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
          <div class="flex-1">
            <p class="text-sm font-medium text-gray-800">New lecturer registration</p>
            <p class="text-xs text-gray-600">John Doe registered 5 minutes ago</p>
          </div>
        </div>
        <div class="flex items-start gap-3 p-3 bg-white/40 rounded-lg hover:bg-white/60 transition-colors">
          <div class="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
          <div class="flex-1">
            <p class="text-sm font-medium text-gray-800">Class created</p>
            <p class="text-xs text-gray-600">Advanced Programming class added 1 hour ago</p>
          </div>
        </div>
        <div class="flex items-start gap-3 p-3 bg-white/40 rounded-lg hover:bg-white/60 transition-colors">
          <div class="w-2 h-2 rounded-full bg-yellow-500 mt-2"></div>
          <div class="flex-1">
            <p class="text-sm font-medium text-gray-800">Price updated</p>
            <p class="text-xs text-gray-600">Web Development course pricing modified 2 hours ago</p>
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
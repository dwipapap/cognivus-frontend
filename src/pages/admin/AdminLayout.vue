<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { authStore } from '../../store/auth';

const router = useRouter();

const displayName = computed(() => {
  return authStore.user?.email?.split('@')[0] || 'Admin';
});

const handleLogout = async () => {
  authStore.clearAuth();
  router.push('/login');
};
</script>

<template>
  <div class="flex flex-col min-h-screen bg-gray-900 text-white">
    <header class="bg-gray-800 shadow-lg sticky top-0 z-40">
      <div class="flex items-center justify-between px-6 py-4">
        <div class="flex items-center">
          <img src="/src/assets/ittrlogo.png" alt="ITTR Logo" class="h-10 w-auto object-contain" />
          <span class="ml-4 text-lg font-semibold">Admin Panel</span>
        </div>
        <div class="flex items-center gap-4">
          <span>Welcome, {{ displayName }}</span>
          <button @click="handleLogout" class="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium">
            Logout
          </button>
        </div>
      </div>
    </header>

    <div class="flex flex-1">
      <aside class="w-64 bg-gray-800 shadow-2xl p-4">
        <nav>
          <ul class="space-y-2">
            <li>
              <router-link to="/admin/dashboard" class="flex items-center px-3 py-2 text-sm font-medium rounded-lg hover:bg-gray-700">
                <svg class="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path></svg>
                Dashboard
              </router-link>
            </li>
            <li>
              <router-link to="/admin/lecturers" class="flex items-center px-3 py-2 text-sm font-medium rounded-lg hover:bg-gray-700">
                <svg class="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path></svg>
                Manage Lecturers
              </router-link>
            </li>
            <li>
              <router-link to="/admin/classes" class="flex items-center px-3 py-2 text-sm font-medium rounded-lg hover:bg-gray-700">
                <svg class="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20"><path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"></path></svg>
                Manage Classes
              </router-link>
            </li>
            <li>
              <router-link to="/admin/prices" class="flex items-center px-3 py-2 text-sm font-medium rounded-lg hover:bg-gray-700">
                <svg class="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20"><path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"></path><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clip-rule="evenodd"></path></svg>
                Classes Price
              </router-link>
            </li>
          </ul>
        </nav>
      </aside>

      <main class="flex-1 p-6 lg:p-8 overflow-auto">
        <router-view />
      </main>
    </div>
  </div>
</template>
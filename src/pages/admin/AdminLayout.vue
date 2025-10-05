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
          </ul>
        </nav>
      </aside>

      <main class="flex-1 p-6 lg:p-8 overflow-auto">
        <router-view />
      </main>
    </div>
  </div>
</template>
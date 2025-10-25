<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { authStore } from '../store/auth';
import LoadingSpinner from '../components/ui/LoadingSpinner.vue';

const router = useRouter();
const error = ref(null);

onMounted(async () => {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const role = urlParams.get('role');
    const id = urlParams.get('id');
    const username = urlParams.get('username');
    const email = urlParams.get('email');

    if (!token || !role || !id || !username || !email) {
      throw new Error('Invalid authentication response');
    }

    const user = {
      id: parseInt(id),
      username,
      email
    };

    authStore.setAuth(user, token, role);

    await new Promise(resolve => setTimeout(resolve, 500));

    // Redirect based on user role
    let dashboardPath = '/student/dashboard';
    if (role === 'lecturer') {
      dashboardPath = '/lecturer/dashboard';
    } else if (role === 'admin') {
      dashboardPath = '/admin/dashboard';
    }
    router.push(dashboardPath);
  } catch (err) {
    error.value = err.message;
    setTimeout(() => {
      router.push('/login');
    }, 3000);
  }
});
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-cyan-400 flex items-center justify-center">
    <div class="bg-white/90 backdrop-blur-md rounded-3xl p-8 shadow-2xl text-center max-w-md">
      <div v-if="!error">
        <LoadingSpinner size="lg" />
        <h2 class="mt-6 text-2xl font-bold text-gray-800">Menyelesaikan Login...</h2>
        <p class="mt-2 text-gray-600">Mohon tunggu sebentar</p>
      </div>
      <div v-else>
        <div class="text-red-500 text-5xl mb-4">⚠️</div>
        <h2 class="text-2xl font-bold text-gray-800 mb-2">Login Gagal</h2>
        <p class="text-gray-600">{{ error }}</p>
        <p class="text-sm text-gray-500 mt-4">Mengalihkan ke halaman login...</p>
      </div>
    </div>
  </div>
</template>

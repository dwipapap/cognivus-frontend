<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { authStore } from '../store/auth'
import apiClient from '../services/api'
import LoadingSpinner from '../components/ui/LoadingSpinner.vue'
import ittrLogo from '../assets/ittrlogo.png'

const router = useRouter();
const error = ref(null);
const statusMessage = ref('Completing login...');

onMounted(async () => {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const role = urlParams.get('role');
    const id = urlParams.get('id');
    const username = urlParams.get('username');
    const email = urlParams.get('email');
    const avatarUrl = urlParams.get('avatar_url');
    const givenName = urlParams.get('given_name');
    const familyName = urlParams.get('family_name');

    // Do not leave bearer credentials in browser history after reading them.
    window.history.replaceState({}, document.title, window.location.pathname);
    authStore.clearAuth();

    const allowedRoles = ['owner', 'admin', 'moderator', 'lecturer', 'student'];
    if (
      !token ||
      !allowedRoles.includes(role) ||
      !id ||
      !username ||
      !email ||
      isNaN(parseInt(id, 10))
    ) {
      throw new Error('Invalid authentication response');
    }

    const user = {
      id: parseInt(id, 10),
      username,
      email,
      user_metadata: {
        avatar_url: avatarUrl ? decodeURIComponent(avatarUrl) : null,
        given_name: givenName ? decodeURIComponent(givenName) : null,
        family_name: familyName ? decodeURIComponent(familyName) : null
      }
    };

    // Check if user needs to complete profile setup
    statusMessage.value = 'Checking account status...';
    const authenticatedRequest = {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 15000
    };
    const response = await apiClient.get(`/users/${id}`, authenticatedRequest);

    if (!response.data.success) {
      throw new Error('Unable to verify your account. Please try logging in again.');
    }

    const userData = response.data.data;
    const isGoogleUser = userData.raw_meta_data && userData.raw_meta_data.sub;
    let targetRoute = '/student/dashboard';

    if (isGoogleUser && role === 'student') {
      const studentResponse = await apiClient.get(
        `/students/${id}`,
        authenticatedRequest
      );

      if (!studentResponse.data.success) {
        throw new Error('Unable to verify your student profile.');
      }

      const studentData = Array.isArray(studentResponse.data.data)
        ? studentResponse.data.data[0]
        : studentResponse.data.data;

      if (!studentData || !studentData.phone || !studentData.address) {
        statusMessage.value = 'Setting up your account...';
        targetRoute = '/new-user';
      }
    } else if (role === 'student' && !userData.password) {
      statusMessage.value = 'Setting up your account...';
      targetRoute = '/new-user';
    }

    if (targetRoute !== '/new-user') {
      const dashboardRoutes = {
        owner: '/admin/dashboard',
        admin: '/admin/dashboard',
        moderator: '/admin/dashboard',
        lecturer: '/lecturer/dashboard',
        student: '/student/dashboard'
      };
      targetRoute = dashboardRoutes[role] || '/student/dashboard';
      statusMessage.value = 'Redirecting to dashboard...';
    }

    // Persist the session only after all account checks have succeeded.
    authStore.setAuth(user, token, role);
    await new Promise(resolve => setTimeout(resolve, 500));
    await router.replace(targetRoute);
  } catch (err) {
    console.error('OAuth callback error:', err);
    authStore.clearAuth();
    error.value = err.message || 'Unable to complete login.';
    setTimeout(() => {
      router.replace('/login');
    }, 3000);
  }
});
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-400 to-blue-200 flex items-center justify-center p-4">
    <div class="bg-gradient-to-br from-white/80 via-blue-50/70 to-indigo-100/60 backdrop-blur-md border border-white/20 shadow-2xl rounded-3xl p-8 md:p-12 text-center max-w-md w-full">
      <!-- ITTR Logo -->
      <div class="mb-8">
        <img :src="ittrLogo" alt="ITTR English Logo" class="w-32 mx-auto" />
      </div>

      <!-- Success State -->
      <div v-if="!error" class="space-y-6">
        <LoadingSpinner size="xl" color="primary" variant="spin" class="mx-auto" />
        
        <div class="space-y-3">
          <h2 class="text-2xl md:text-3xl font-bold text-gray-800">{{ statusMessage }}</h2>
          <p class="text-gray-600">Please wait a moment while we set up your account...</p>
        </div>

        <!-- Loading Progress -->
        <div class="w-full bg-blue-100 rounded-full h-2 overflow-hidden">
          <div class="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full animate-pulse" style="width: 70%"></div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else class="space-y-6">
        <UAlert
          color="error"
          variant="soft"
          icon="i-lucide-circle-alert"
          title="Login failed"
          :description="error"
        />
        <p class="text-sm text-muted">Redirecting to login page...</p>

        <!-- Error Progress -->
        <div class="w-full bg-red-100 rounded-full h-2 overflow-hidden">
          <div class="bg-gradient-to-r from-red-500 to-red-600 h-full rounded-full animate-pulse" style="width: 100%"></div>
        </div>
      </div>
    </div>
  </div>
</template>

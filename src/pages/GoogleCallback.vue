<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { authStore } from '../store/auth';
import apiClient, { studentAPI } from '../services/api';
import LoadingSpinner from '../components/ui/LoadingSpinner.vue';
import ittrLogo from '../assets/ittrlogo.png';

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

    if (!token || !role || !id || !username || !email) {
      throw new Error('Invalid authentication response');
    }

    const user = {
      id: parseInt(id),
      username,
      email,
      user_metadata: {
        avatar_url: avatarUrl ? decodeURIComponent(avatarUrl) : null,
        given_name: givenName ? decodeURIComponent(givenName) : null,
        family_name: familyName ? decodeURIComponent(familyName) : null
      }
    };

    authStore.setAuth(user, token, role);

    // Check if user needs to complete profile setup
    statusMessage.value = 'Checking account status...';
    
    try {
      const response = await apiClient.get(`/users/${id}`);
      
      if (response.data.success) {
        const userData = response.data.data;
        
        // Check if this is a Google user (has raw_meta_data from Google OAuth)
        const isGoogleUser = userData.raw_meta_data && userData.raw_meta_data.sub;
        
        if (isGoogleUser) {
          // For Google users, check if student profile is complete
          const studentResponse = await studentAPI.getStudentById(id);
          
          if (studentResponse.data.success) {
            const studentData = Array.isArray(studentResponse.data.data)
              ? studentResponse.data.data[0]
              : studentResponse.data.data;
            
            // Check if critical fields are missing (indicates first-time login)
            // Using OR logic: if ANY of these fields is missing, it's first-time
            const isFirstTime = !studentData.phone || 
                               !studentData.birthdate || 
                               !studentData.address;
            
            if (isFirstTime) {
              statusMessage.value = 'Setting up your account...';
              await new Promise(resolve => setTimeout(resolve, 500));
              router.push('/new-user');
              return;
            }
          }
        } else {
          // For non-Google users, check password (existing logic)
          if (!userData.password || userData.password === null) {
            statusMessage.value = 'Setting up your account...';
            await new Promise(resolve => setTimeout(resolve, 500));
            router.push('/new-user');
            return;
          }
        }
      }
    } catch (checkError) {
      console.error('Error checking user status:', checkError);
      // Continue to dashboard if check fails (fail gracefully)
    }

    statusMessage.value = 'Redirecting to dashboard...';
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
  <div class="min-h-screen bg-gradient-to-br from-blue-400 to-blue-200 flex items-center justify-center p-4">
    <div class="bg-gradient-to-br from-white/80 via-blue-50/70 to-indigo-100/60 backdrop-blur-md border border-white/20 shadow-2xl rounded-3xl p-8 md:p-12 text-center max-w-md w-full">
      <!-- ITTR Logo -->
      <div class="mb-8">
        <img :src="ittrLogo" alt="ITTR English Logo" class="w-32 mx-auto" />
      </div>

      <!-- Success State -->
      <div v-if="!error" class="space-y-6">
        <LoadingSpinner size="xl" color="blue" variant="spin" class="mx-auto" />
        
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
        <div class="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
          <svg class="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        
        <div class="space-y-3">
          <h2 class="text-2xl md:text-3xl font-bold text-gray-800">Login Failed</h2>
          <p class="text-gray-600">{{ error }}</p>
          <p class="text-sm text-gray-500">Redirecting to login page...</p>
        </div>

        <!-- Error Progress -->
        <div class="w-full bg-red-100 rounded-full h-2 overflow-hidden">
          <div class="bg-gradient-to-r from-red-500 to-red-600 h-full rounded-full animate-pulse" style="width: 100%"></div>
        </div>
      </div>
    </div>
  </div>
</template>

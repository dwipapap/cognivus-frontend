<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { authStore } from '../store/auth';
import apiClient from '../services/api';
import { useForm } from '../composables/useForm';
import ittrLogo from '../assets/ittrlogo.png';
import login from '../assets/login.png';

import Modal from '../components/ui/Modal.vue';
import BaseButton from '../components/ui/BaseButton.vue';
import BaseCard from '../components/ui/BaseCard.vue';

// Modal state
const showModal = ref(false);
const modalType = ref('info');
const modalTitle = ref('');
const modalMessage = ref('');

const router = useRouter();

// Form setup with validation
const { formData, errors, isSubmitting, submit } = useForm(
  {
    username: '',
    password: ''
  },
  {
    username: ['required'],
    password: ['required']
  }
);

// Modal functions
const openModal = (type, title, message) => {
  modalType.value = type;
  modalTitle.value = title;
  modalMessage.value = message;
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  modalType.value = 'info';
  modalTitle.value = '';
  modalMessage.value = '';
};

const handleLogin = async () => {
  try {
    await submit(async (data) => {
      const response = await apiClient.post('/auth/login', {
        username: data.username,
        password: data.password,
      });

      if (response.data.success) {
        const { user, token, role } = response.data;
        
        // Save JWT token and role to auth store
        authStore.setAuth(user, token, role);

        // Role-based redirect mapping
        const roleRoutes = {
          student: '/student/dashboard',
          lecturer: '/lecturer/dashboard',
          moderator: '/admin/dashboard',
          admin: '/admin/dashboard',
          owner: '/admin/dashboard'
        };

        const targetRoute = roleRoutes[role] || '/student/dashboard';
        
        openModal('success', 'Login Berhasil!', `Selamat datang! Anda akan diarahkan ke dashboard ${role}.`);
        
        setTimeout(() => {
          closeModal();
          router.push(targetRoute);
        }, 2000);
      }
    });
  } catch (error) {
    const errorMsg = error.response?.data?.message || 'Login gagal. Silahkan periksa kembali data Anda.';
    openModal('error', 'Login Gagal', errorMsg);
  }
};

const handleGoogleLogin = () => {
  // Use environment variable for API base URL
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
  window.location.href = `${apiBaseUrl}/auth/google`;
};
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-400 to-blue-200 flex items-center justify-center p-4 animate-fade-in">
    <div class="bg-gradient-to-br from-white/80 via-blue-50/70 to-indigo-100/60 backdrop-blur-md border border-white/20 shadow-2xl rounded-3xl max-w-6xl w-full grid grid-cols-1 lg:grid-cols-5 overflow-hidden opacity-0 animate-fade-in-scale"
         style="animation-delay: 0.1s; animation-fill-mode: forwards;">
      <!-- Left side - Login Form (2 columns) -->
      <div class="lg:col-span-2 p-8 flex items-center justify-center">
        <BaseCard size="md" class="w-full max-w-md">
          <template #title>
            <div class="text-center">
              <router-link to="/" class="inline-block">
                <img :src="ittrLogo" alt="ITTR English Logo" class="w-40 mb-6 mx-auto cursor-pointer hover:opacity-80 transition-opacity" />
              </router-link>
              <h2 class="text-2xl font-bold text-gray-900 mb-2">Welcome!</h2>
              <p class="text-gray-600 mb-6 text-sm">Put your username and password to login</p>
            </div>
          </template>

          <form @submit.prevent="handleLogin" class="space-y-4" autocomplete="off" novalidate>
            <!-- Hidden fields to prevent browser autofill/autocomplete popups -->
            <input type="text" name="fakeusernameremembered" id="fakeusernameremembered" style="position: absolute; left: -9999px; top: -9999px; width: 1px; height: 1px; opacity: 0;" autocomplete="username" />
            <input type="password" name="fakepasswordremembered" id="fakepasswordremembered" style="position: absolute; left: -9999px; top: -9999px; width: 1px; height: 1px; opacity: 0;" autocomplete="new-password" />
            <!-- Username Input with Addon -->
            <div>
              <label for="username" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Username</label>
              <div class="flex">
                <span class="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-e-0 border-gray-300 rounded-s-lg dark:bg-gray-600 dark:text-gray-400 dark:border-gray-600">
                  <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                  </svg>
                </span>
                <input 
                  type="text" 
                  id="username"
                  name="login-identifier"
                  autocomplete="off"
                  autocorrect="off"
                  autocapitalize="none"
                  spellcheck="false"
                  v-model="formData.username"
                  class="rounded-none rounded-e-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500 block flex-1 min-w-0 w-full text-sm p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  :class="{ 'border-red-500 dark:border-red-500': errors.username }"
                  placeholder="Username"
                />
              </div>
              <p v-if="errors.username" class="mt-1 text-sm text-red-600 dark:text-red-500">{{ errors.username }}</p>
            </div>

            <!-- Password Input with Addon -->
            <div>
              <label for="password" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Password</label>
              <div class="flex">
                <span class="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-e-0 border-gray-300 rounded-s-lg dark:bg-gray-600 dark:text-gray-400 dark:border-gray-600">
                  <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
                  </svg>
                </span>
                <input 
                  type="password" 
                  id="password"
                  name="password"
                  autocomplete="current-password"
                  autocorrect="off"
                  autocapitalize="none"
                  spellcheck="false"
                  v-model="formData.password"
                  class="rounded-none rounded-e-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500 block flex-1 min-w-0 w-full text-sm p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  :class="{ 'border-red-500 dark:border-red-500': errors.password }"
                  placeholder="Password"
                />
              </div>
              <p v-if="errors.password" class="mt-1 text-sm text-red-600 dark:text-red-500">{{ errors.password }}</p>
            </div>

            <BaseButton
              type="submit"
              variant="glass-primary"
              size="lg"
              block
              :loading="isSubmitting"
            >
              Masuk
            </BaseButton>
          </form>

          <!-- Divider -->
          <div class="flex items-center my-4">
            <div class="flex-grow border-t border-gray-300"></div>
            <span class="flex-shrink mx-4 text-gray-500 text-sm">Atau</span>
            <div class="flex-grow border-t border-gray-300"></div>
          </div>

          <!-- Google Login Button -->
          <BaseButton
            @click="handleGoogleLogin"
            variant="glass"
            size="lg"
            block
          >
            <template #icon>
              <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </template>
            Masuk dengan Google
          </BaseButton>

          <!-- Footer text -->
          <div class="mt-6 text-center">
            <p class="text-xs text-gray-500">
              Butuh informasi lebih lanjut? 
              <a href="#" class="text-blue-600 hover:underline">WhatsApp</a> atau 
              <a href="#" class="text-blue-600 hover:underline">Email</a>
            </p>
            <p class="text-xs text-gray-400 mt-2">2024 ITTR English Course. Hak cipta dilindungi</p>
          </div>
        </BaseCard>
      </div>

      <!-- Right side - Illustration (3 columns) -->
      <div class="lg:col-span-3 hidden lg:flex items-center justify-center p-8 bg-gradient-to-br from-blue-50 to-indigo-100">
        <img :src="login" alt="Ilustrasi" class="w-full max-w-4xl" />
      </div>
    </div>

    <!-- Modal Component -->
    <Modal
      :show="showModal"
      :type="modalType"
      :title="modalTitle"
      :message="modalMessage"
      variant="gradient"
      @close="closeModal"
    />
  </div>
</template>

<style scoped>
/* Custom fade-in animations */
@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fade-in-scale {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.6s ease-out;
}

.animate-fade-in-scale {
  animation: fade-in-scale 0.5s ease-out;
}
</style>

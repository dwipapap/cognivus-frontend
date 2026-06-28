<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { authStore } from '../store/auth';
import apiClient from '../services/api';
import { useForm } from '../composables/useForm';
import ittrLogo from '../assets/ittrlogo.png';
import login from '../assets/login.png';

import Modal from '../components/ui/Modal.vue';
import BaseButton from '../components/ui/BaseButton.vue';
import BaseCard from '../components/ui/BaseCard.vue';
import OtpFlow from '../components/ui/OtpFlow.vue';

// Modal state
const showModal = ref(false);
const modalType = ref('info');
const modalTitle = ref('');
const modalMessage = ref('');

// Forgot Password state
const showForgotPassword = ref(false);

const openForgotPassword = () => {
  showForgotPassword.value = true;
};

const closeForgotPassword = () => {
  showForgotPassword.value = false;
};

// Responsive state for mobile slideover
const isMobile = ref(false);

function checkScreen() {
  isMobile.value = window.innerWidth < 1024;
}

onMounted(() => {
  checkScreen();
  window.addEventListener('resize', checkScreen);
});

onUnmounted(() => {
  window.removeEventListener('resize', checkScreen);
});

// Slideover icon helpers
const slideoverIconClass = computed(() => {
  const classes = {
    success: 'text-brand-success bg-brand-success/10',
    error: 'text-brand-danger bg-brand-danger/10',
    info: 'text-brand-primary bg-brand-primary/10',
    warning: 'text-brand-warning bg-brand-warning/10'
  };
  return classes[modalType.value] || classes.info;
});

const slideoverIcon = computed(() => {
  const icons = {
    success: 'i-lucide-check-circle',
    error: 'i-lucide-x-circle',
    warning: 'i-lucide-alert-triangle',
    info: 'i-lucide-info'
  };
  return icons[modalType.value] || icons.info;
});

const handleForgotPasswordSuccess = () => {
  closeForgotPassword();
  openModal('success', 'Password Reset', 'Your password has been successfully changed. You can now log in with your new password.');
};

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
        
        openModal('success', 'Login Successful!', `Welcome! You will be redirected to the ${role} dashboard.`);
        
        setTimeout(() => {
          closeModal();
          router.push(targetRoute);
        }, 2000);
      }
    });
  } catch (error) {
    const errorMsg = error.response?.data?.message || 'Login failed. Please check your credentials.';
    openModal('error', 'Login Failed', errorMsg);
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
    <!-- Desktop / tablet layout (unchanged) -->
    <div class="bg-gradient-to-br from-white/80 via-blue-50/70 to-indigo-100/60 backdrop-blur-md border border-white/20 shadow-2xl rounded-3xl max-w-6xl w-full hidden lg:grid lg:grid-cols-5 overflow-hidden opacity-0 animate-fade-in-scale"
         style="animation-delay: 0.1s; animation-fill-mode: forwards;">
      <!-- Left side - Login Form (2 columns) -->
      <div class="lg:col-span-2 p-8 flex items-center justify-center">
        <BaseCard size="md" rounded="3xl" class="w-full max-w-md">
          <template #title>
            <div class="text-center">
              <router-link to="/" class="inline-block">
                <img :src="ittrLogo" alt="ITTR English Logo" class="w-40 mb-6 mx-auto cursor-pointer hover:opacity-80 transition-opacity" />
              </router-link>
              <h2 class="text-2xl font-bold text-gray-900 mb-2">Welcome!</h2>
              <p class="text-gray-600 mb-6 text-sm">Put your username and password to login</p>
            </div>
          </template>

          <!-- Student note -->
          <p class="text-xs text-gray-500 text-center mb-3">
            Students, please click the "Login with Google" button to sign in.
          </p>

          <!-- Google Login Button (primary CTA) -->
          <BaseButton
            @click="handleGoogleLogin"
            variant="primary"
            size="lg"
            block
            label="Login with Google"
          >
            <template #icon>
              <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </template>
          </BaseButton>

          <!-- Divider -->
          <div class="flex items-center my-4">
            <div class="flex-grow border-t border-gray-300"></div>
            <span class="flex-shrink mx-4 text-gray-500 text-sm">Or</span>
            <div class="flex-grow border-t border-gray-300"></div>
          </div>

          <form @submit.prevent="handleLogin" class="space-y-5" autocomplete="off" novalidate>
            <!-- Hidden fields to prevent browser autofill/autocomplete popups -->
            <input type="text" name="fakeusernameremembered" id="fakeusernameremembered" style="position: absolute; left: -9999px; top: -9999px; width: 1px; height: 1px; opacity: 0;" autocomplete="username" />
            <input type="password" name="fakepasswordremembered" id="fakepasswordremembered" style="position: absolute; left: -9999px; top: -9999px; width: 1px; height: 1px; opacity: 0;" autocomplete="new-password" />
            
            <!-- Username Input -->
            <div>
              <label for="username" class="block mb-2 text-sm font-medium text-gray-900">
                Username
                <span class="text-red-500 ml-1">*</span>
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <UIcon name="i-solar-user-bold" class="w-5 h-5 text-gray-400" />
                </div>
                <input 
                  type="text" 
                  id="username"
                  name="login-identifier"
                  autocomplete="off"
                  autocorrect="off"
                  autocapitalize="none"
                  spellcheck="false"
                  v-model="formData.username"
                  class="block w-full !bg-white pl-11 pr-4 py-2.5 text-gray-900 placeholder-gray-400 border rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  :class="errors.username ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'"
                  placeholder="Enter your username"
                />
              </div>
              <p v-if="errors.username" class="mt-2 text-sm text-red-600">{{ errors.username }}</p>
            </div>

            <!-- Password Input -->
            <div>
              <label for="password" class="block mb-2 text-sm font-medium text-gray-900">
                Password
                <span class="text-red-500 ml-1">*</span>
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <UIcon name="i-solar-lock-password-bold" class="w-5 h-5 text-gray-400" />
                </div>
                <input 
                  type="password" 
                  id="password"
                  name="password"
                  autocomplete="current-password"
                  autocorrect="off"
                  autocapitalize="none"
                  spellcheck="false"
                  v-model="formData.password"
                  class="block w-full !bg-white pl-11 pr-4 py-2.5 text-gray-900 placeholder-gray-400 border rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  :class="errors.password ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'"
                  placeholder="Enter your password"
                />
              </div>
              <div class="flex justify-between items-center mt-2">
                <p v-if="errors.password" class="text-sm text-red-600">{{ errors.password }}</p>
                <button
                  type="button"
                  @click="openForgotPassword"
                  class="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors ml-auto"
                >
                  Forgot Password?
                </button>
              </div>
            </div>

            <BaseButton
              type="submit"
              variant="primary"
              size="lg"
              block
              :loading="isSubmitting"
              label="Login"
            />
          </form>

          <!-- Footer text -->
          <div class="mt-6 text-center">
            <p class="text-xs text-gray-500">
              Need more information? 
              <a href="#" class="text-blue-600 hover:underline">WhatsApp</a> or 
              <a href="#" class="text-blue-600 hover:underline">Email</a>
            </p>
            <p class="text-xs text-gray-400 mt-2">2025 ITTR English Course. All rights reserved</p>
          </div>
        </BaseCard>
      </div>

      <!-- Right side - Illustration (3 columns) -->
      <div class="lg:col-span-3 hidden lg:flex items-center justify-center p-8 bg-gradient-to-br from-blue-50 to-indigo-100">
        <img :src="login" alt="Ilustrasi" class="w-full max-w-4xl" />
      </div>
    </div>

    <!-- Mobile layout (only < lg) -->
    <div class="lg:hidden w-full max-w-sm">
      <div class="bg-white border-[6px] border-gray-200 rounded-[2.5rem] shadow-2xl p-6 flex flex-col gap-6 opacity-0 animate-fade-in-scale"
           style="animation-delay: 0.1s; animation-fill-mode: forwards;">
        <!-- Hero illustration area -->
        <router-link to="/" class="block">
          <div class="w-full aspect-[5/4] rounded-3xl flex items-center justify-center overflow-hidden">
            <img :src="login" alt="ITTR English" class="w-3/4 h-auto object-contain" />
          </div>
        </router-link>

        <!-- Heading -->
        <div class="text-center">
          <h1 class="text-2xl font-bold text-gray-900">Welcome!</h1>
          <p class="text-sm text-gray-500 mt-1">Put your username and password to login.</p>
          <p class="text-xs text-gray-400 mt-3">
            Students, please use the "Login with Google" option below to sign in.
          </p>
        </div>

        <!-- Google Login (primary CTA) -->
        <button
          type="button"
          @click="handleGoogleLogin"
          class="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold py-3.5 rounded-2xl shadow-sm transition-colors"
        >
          <span class="flex items-center justify-center w-7 h-7 rounded-full bg-white">
            <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          </span>
          <span>Login with Google</span>
        </button>

        <!-- Or divider -->
        <div class="flex items-center gap-4">
          <div class="flex-grow border-t border-gray-200"></div>
          <span class="text-xs text-gray-400">Or</span>
          <div class="flex-grow border-t border-gray-200"></div>
        </div>

        <!-- Credential form -->
        <form @submit.prevent="handleLogin" class="flex flex-col gap-4" autocomplete="off" novalidate>
          <!-- Username -->
          <div>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <UIcon name="i-solar-user-bold" class="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="text"
                name="mobile-login-identifier"
                autocomplete="off"
                autocorrect="off"
                autocapitalize="none"
                spellcheck="false"
                v-model="formData.username"
                class="block w-full !bg-gray-50 pl-11 pr-4 py-3 text-gray-900 placeholder-gray-400 border rounded-2xl shadow-inner transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                :class="errors.username ? 'border-red-300 focus:ring-red-500' : 'border-gray-200'"
                placeholder="Enter your username"
              />
            </div>
            <p v-if="errors.username" class="mt-1.5 text-xs text-red-600">{{ errors.username }}</p>
          </div>

          <!-- Password -->
          <div>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <UIcon name="i-solar-lock-password-bold" class="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="password"
                name="mobile-password"
                autocomplete="current-password"
                autocorrect="off"
                autocapitalize="none"
                spellcheck="false"
                v-model="formData.password"
                class="block w-full !bg-gray-50 pl-11 pr-4 py-3 text-gray-900 placeholder-gray-400 border rounded-2xl shadow-inner transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                :class="errors.password ? 'border-red-300 focus:ring-red-500' : 'border-gray-200'"
                placeholder="Enter your password"
              />
            </div>
            <div class="flex justify-between items-center mt-1.5">
              <p v-if="errors.password" class="text-xs text-red-600">{{ errors.password }}</p>
              <button
                type="button"
                @click="openForgotPassword"
                class="text-xs text-blue-600 hover:text-blue-800 hover:underline transition-colors ml-auto"
              >
                Forgot Password?
              </button>
            </div>
          </div>

          <!-- Login submit -->
          <button
            type="submit"
            :disabled="isSubmitting"
            class="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-60 text-white font-semibold py-3.5 rounded-2xl shadow-sm transition-colors mt-2"
          >
            <UIcon v-if="isSubmitting" name="i-lucide-loader-circle" class="w-5 h-5 animate-spin" />
            <span v-else>Login</span>
          </button>
        </form>

        <!-- Footer -->
        <div class="text-center">
          <p class="text-xs text-gray-500">
            Need more information?
            <a href="#" class="text-blue-600 hover:underline">WhatsApp</a> us or
            <a href="#" class="text-blue-600 hover:underline">Email</a>
          </p>
          <p class="text-[10px] text-gray-400 mt-2">2025 ITTR English Course. All rights reserved.</p>
        </div>
      </div>
    </div>

    <!-- Desktop Modal -->
    <template v-if="!isMobile">
      <Modal
        alert
        :show="showModal"
        :type="modalType"
        :title="modalTitle"
        :message="modalMessage"
        @close="closeModal"
        @confirm="closeModal"
      />
    </template>

    <!-- Mobile Slideover (bottom sheet) -->
    <USlideover
      v-if="isMobile"
      v-model:open="showModal"
      side="bottom"
      :title="modalTitle || undefined"
      :close="false"
      :ui="{
        content: 'rounded-t-2xl min-h-[35vh]'
      }"
    >
      <template #body>
        <div class="flex flex-col items-center px-8 py-8 gap-4">
          <div class="flex items-center justify-center w-16 h-16 rounded-token-full" :class="slideoverIconClass">
            <UIcon :name="slideoverIcon" class="w-8 h-8" />
          </div>
          <h3 class="text-lg font-bold text-ink text-center">{{ modalTitle }}</h3>
          <p v-if="modalMessage" class="text-sm text-ink-muted text-center leading-relaxed">{{ modalMessage }}</p>
          <UButton
            label="OK"
            :color="modalType === 'error' ? 'error' : modalType === 'warning' ? 'warning' : 'primary'"
            size="lg"
            class="px-8 rounded-full"
            @click="closeModal"
          />
        </div>
      </template>
    </USlideover>

    <!-- Forgot Password OTP Flow -->
    <OtpFlow
      :show="showForgotPassword"
      title="Reset Password"
      @close="closeForgotPassword"
      @success="handleForgotPasswordSuccess"
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

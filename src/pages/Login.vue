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
const showPassword = ref(false);

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
      } else {
        throw new Error(response.data.message || 'Login failed. Please check your credentials.');
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
  <div class="login-page-background relative isolate h-[100dvh] overflow-hidden lg:flex lg:h-[100dvh] lg:min-h-0 lg:items-center lg:justify-center lg:p-2 animate-fade-in">
    <!-- Desktop / tablet layout (unchanged) -->
    <div class="bg-gradient-to-br from-white/80 via-blue-50/70 to-indigo-100/60 backdrop-blur-md border border-white/20 shadow-2xl rounded-3xl max-w-6xl w-full hidden lg:grid lg:h-[calc(100dvh-1rem)] lg:grid-cols-5 lg:overflow-hidden opacity-0 animate-fade-in-scale"
         style="animation-delay: 0.1s; animation-fill-mode: forwards;">
      <!-- Left side - Login Form (2 columns) -->
      <div class="lg:col-span-2 lg:min-h-0 lg:overflow-hidden p-5 2xl:p-8 flex items-center justify-center">
        <BaseCard size="sm" rounded="3xl" class="w-full max-w-md">
          <template #title>
            <div class="text-center">
              <router-link to="/" class="inline-block">
                <img :src="ittrLogo" alt="ITTR English Logo" class="w-32 2xl:w-40 mb-4 2xl:mb-6 mx-auto cursor-pointer hover:opacity-80 transition-opacity" />
              </router-link>
              <h2 class="text-xl 2xl:text-2xl font-bold text-gray-900 mb-2">Welcome!</h2>
              <p class="text-gray-600 mb-4 2xl:mb-6 text-sm">Put your username and password to login</p>
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
          <div class="flex items-center my-3 2xl:my-4">
            <div class="flex-grow border-t border-gray-300"></div>
            <span class="flex-shrink mx-4 text-gray-500 text-sm">Or</span>
            <div class="flex-grow border-t border-gray-300"></div>
          </div>

          <form @submit.prevent="handleLogin" class="space-y-4 2xl:space-y-5" autocomplete="off" novalidate>
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
                  :type="showPassword ? 'text' : 'password'"
                  id="password"
                  name="password"
                  autocomplete="current-password"
                  autocorrect="off"
                  autocapitalize="none"
                  spellcheck="false"
                  v-model="formData.password"
                  class="block w-full !bg-white pl-11 pr-11 py-2.5 text-gray-900 placeholder-gray-400 border rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  :class="errors.password ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  class="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600"
                  :aria-label="showPassword ? 'Hide password' : 'Show password'"
                  @click="showPassword = !showPassword"
                >
                  <UIcon :name="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'" class="h-5 w-5" />
                </button>
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
          <div class="mt-4 2xl:mt-6 text-center">
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
      <div class="lg:col-span-3 hidden lg:flex items-center justify-center overflow-hidden p-8 bg-gradient-to-br from-blue-50 to-indigo-100">
        <img :src="login" alt="Ilustrasi" class="max-h-full w-full max-w-4xl object-contain" />
      </div>
    </div>

    <!-- Mobile layout (only < lg) -->
    <div class="mobile-login-stage relative isolate flex h-full w-full items-center justify-center overflow-hidden p-2 sm:p-4 lg:hidden">
      <div class="mobile-orb mobile-orb-top" aria-hidden="true"></div>
      <div class="mobile-orb mobile-orb-bottom" aria-hidden="true"></div>
      <div class="mobile-dot-grid" aria-hidden="true"></div>

      <div class="mobile-login-card relative z-10 mx-auto flex max-h-full w-full max-w-sm flex-col overflow-y-auto rounded-[2rem] border px-5 py-3.5 opacity-0 animate-fade-in-scale sm:px-6 sm:py-4"
           style="animation-delay: 0.1s; animation-fill-mode: forwards;">
        <!-- Hero illustration area -->
        <router-link to="/" class="block shrink-0" aria-label="Back to home">
          <div class="flex h-[clamp(7.5rem,22dvh,11rem)] w-full items-center justify-center overflow-hidden rounded-2xl bg-blue-50/70">
            <img :src="login" alt="ITTR English login illustration" class="h-full w-auto max-w-full object-contain" />
          </div>
        </router-link>

        <!-- Heading -->
        <div class="mt-2 text-center sm:mt-3">
          <h1 class="text-2xl font-bold tracking-tight text-slate-900">Welcome!</h1>
          <p class="mt-0.5 text-xs text-slate-600 sm:text-sm">Put your username and password to login.</p>
          <p class="mx-auto mt-1 max-w-[19rem] text-[10px] leading-4 text-slate-400 sm:text-[11px]">
            Students, please use the "Login with Google" option below to sign in.
          </p>
        </div>

        <!-- Google Login (primary CTA) -->
        <button
          type="button"
          @click="handleGoogleLogin"
          class="mt-3 flex h-11 w-full shrink-0 items-center justify-center gap-3 rounded-full bg-blue-600 px-5 text-sm font-semibold text-white shadow-md transition-colors duration-200 hover:bg-blue-700 active:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          <span class="flex h-7 w-7 items-center justify-center rounded-full bg-white">
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
        <div class="my-2 flex shrink-0 items-center gap-3">
          <div class="flex-grow border-t border-gray-200"></div>
          <span class="text-[11px] font-medium text-gray-400">Or</span>
          <div class="flex-grow border-t border-gray-200"></div>
        </div>

        <!-- Credential form -->
        <form @submit.prevent="handleLogin" class="flex flex-col gap-2.5" autocomplete="off" novalidate>
          <!-- Username -->
          <div>
            <label for="mobile-username" class="sr-only">Username</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <UIcon name="i-solar-user-bold" class="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="mobile-username"
                name="mobile-login-identifier"
                autocomplete="off"
                autocorrect="off"
                autocapitalize="none"
                spellcheck="false"
                v-model="formData.username"
                class="block h-11 w-full rounded-full border !bg-white pl-11 pr-4 text-sm text-gray-900 placeholder-gray-400 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                :class="errors.username ? 'border-red-300 focus:ring-red-500' : 'border-gray-200'"
                placeholder="Enter your username"
              />
            </div>
            <p v-if="errors.username" class="mt-1.5 text-xs text-red-600">{{ errors.username }}</p>
          </div>

          <!-- Password -->
          <div>
            <label for="mobile-password" class="sr-only">Password</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <UIcon name="i-solar-lock-password-bold" class="w-5 h-5 text-gray-400" />
              </div>
              <input
                :type="showPassword ? 'text' : 'password'"
                id="mobile-password"
                name="mobile-password"
                autocomplete="current-password"
                autocorrect="off"
                autocapitalize="none"
                spellcheck="false"
                v-model="formData.password"
                class="block h-11 w-full rounded-full border !bg-white pl-11 pr-12 text-sm text-gray-900 placeholder-gray-400 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                :class="errors.password ? 'border-red-300 focus:ring-red-500' : 'border-gray-200'"
                placeholder="Enter your password"
              />
              <button
                type="button"
                class="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-full text-gray-400 transition-colors hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500"
                :aria-label="showPassword ? 'Hide password' : 'Show password'"
                @click="showPassword = !showPassword"
              >
                <UIcon :name="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'" class="h-5 w-5" />
              </button>
            </div>
            <div class="mt-1 flex items-center justify-between">
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
            class="mt-0.5 flex h-11 w-full items-center justify-center rounded-full bg-blue-600 px-5 text-sm font-semibold text-white shadow-md transition-colors duration-200 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            <UIcon v-if="isSubmitting" name="i-lucide-loader-circle" class="w-5 h-5 animate-spin" />
            <span v-else>Login</span>
          </button>
        </form>

        <!-- Footer -->
        <div class="mobile-login-footer pt-3 text-center">
          <p class="text-[10px] text-gray-500 sm:text-xs">
            Need more information?
            <a href="#" class="text-blue-600 hover:underline">WhatsApp</a> us or
            <a href="#" class="text-blue-600 hover:underline">Email</a>
          </p>
          <p class="mt-1 text-[9px] text-gray-400 sm:text-[10px]">2025 ITTR English Course. All rights reserved.</p>
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
.login-page-background,
.mobile-login-stage {
  background:
    radial-gradient(circle at 12% 8%, oklch(0.94 0.045 255 / 0.9), transparent 34%),
    linear-gradient(145deg, oklch(0.91 0.075 252), oklch(0.84 0.105 258));
}

@media (min-width: 1024px) {
  .login-page-background::before,
  .login-page-background::after {
    position: absolute;
    z-index: -1;
    content: '';
    border-radius: 9999px;
    background: oklch(0.98 0.02 250 / 0.32);
  }

  .login-page-background::before {
    width: 34rem;
    height: 34rem;
    top: -20rem;
    left: -12rem;
  }

  .login-page-background::after {
    width: 42rem;
    height: 42rem;
    right: -26rem;
    bottom: -22rem;
  }
}

.mobile-login-card {
  border-color: oklch(0.94 0.018 255);
  background: oklch(0.995 0.004 255);
  box-shadow: 0 20px 55px oklch(0.4 0.12 258 / 0.24);
  scrollbar-width: none;
}

.mobile-login-card::-webkit-scrollbar {
  display: none;
}

.mobile-orb {
  position: absolute;
  z-index: -1;
  border-radius: 9999px;
  background: oklch(0.98 0.02 250 / 0.38);
}

.mobile-orb-top {
  width: 18rem;
  height: 18rem;
  top: -11rem;
  left: -7rem;
}

.mobile-orb-bottom {
  width: 22rem;
  height: 22rem;
  right: -15rem;
  bottom: -9rem;
}

.mobile-dot-grid {
  position: absolute;
  left: 0.75rem;
  bottom: 4.5rem;
  z-index: -1;
  width: 3.5rem;
  height: 4.5rem;
  opacity: 0.55;
  background-image: radial-gradient(circle, oklch(0.99 0.005 255) 1.5px, transparent 1.75px);
  background-size: 0.75rem 0.75rem;
}

@media (max-height: 600px) and (max-width: 1023px) {
  .mobile-login-footer {
    display: none;
  }
}

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

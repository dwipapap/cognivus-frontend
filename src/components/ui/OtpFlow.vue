<script setup>
import { ref, computed, watch } from 'vue';
import { authAPI } from '../../services/api';
import Modal from './Modal.vue';
import BaseButton from './BaseButton.vue';

// Props
const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  // Pre-filled data for authenticated users
  prefillEmail: {
    type: String,
    default: ''
  },
  prefillPhone: {
    type: String,
    default: ''
  },
  // Title for the flow
  title: {
    type: String,
    default: 'Reset Password'
  }
});

// Emits
const emit = defineEmits(['close', 'success']);

// Constants
const STEPS = {
  REQUEST: 1,
  VERIFY: 2,
  RESET: 3,
  SUCCESS: 4
};

// State
const currentStep = ref(STEPS.REQUEST);
const isSubmitting = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

// Step 1: Request OTP
const channel = ref('email');
const email = ref('');
const phone = ref('');

// Step 2: Verify OTP
const otpCode = ref('');
const resetToken = ref('');

// Step 3: New Password
const newPassword = ref('');
const confirmPassword = ref('');

// Computed
const stepTitle = computed(() => {
  switch (currentStep.value) {
    case STEPS.REQUEST:
      return 'Choose Verification Method';
    case STEPS.VERIFY:
      return 'Enter Verification Code';
    case STEPS.RESET:
      return 'Set New Password';
    case STEPS.SUCCESS:
      return 'Password Changed!';
    default:
      return props.title;
  }
});

const stepDescription = computed(() => {
  switch (currentStep.value) {
    case STEPS.REQUEST:
      return 'Select how you want to receive the OTP verification code.';
    case STEPS.VERIFY:
      return `Enter the 6-digit code sent to your ${channel.value === 'email' ? 'email address' : 'WhatsApp number'}.`;
    case STEPS.RESET:
      return 'Create a new secure password for your account.';
    case STEPS.SUCCESS:
      return 'Your password has been successfully changed. You can now log in with your new password.';
    default:
      return '';
  }
});

const isStep1Valid = computed(() => {
  if (channel.value === 'email') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.value);
  } else {
    // WhatsApp: validate numeric phone
    return /^\d{10,15}$/.test(phone.value.replace(/\D/g, ''));
  }
});

const isStep2Valid = computed(() => {
  return otpCode.value.length === 6;
});

const isStep3Valid = computed(() => {
  return newPassword.value.length >= 6 && newPassword.value === confirmPassword.value;
});

const passwordErrors = computed(() => {
  const errors = [];
  if (newPassword.value && newPassword.value.length < 6) {
    errors.push('Password must be at least 6 characters');
  }
  if (confirmPassword.value && newPassword.value !== confirmPassword.value) {
    errors.push('Passwords do not match');
  }
  return errors;
});

// Watch for show prop to reset state
watch(() => props.show, (newVal) => {
  if (newVal) {
    resetState();
    // Prefill data if available
    if (props.prefillEmail) {
      email.value = props.prefillEmail;
    }
    if (props.prefillPhone) {
      phone.value = props.prefillPhone;
    }
  }
});

// Methods
const resetState = () => {
  currentStep.value = STEPS.REQUEST;
  isSubmitting.value = false;
  errorMessage.value = '';
  successMessage.value = '';
  channel.value = 'email';
  email.value = '';
  phone.value = '';
  otpCode.value = '';
  resetToken.value = '';
  newPassword.value = '';
  confirmPassword.value = '';
};

const handleClose = () => {
  if (!isSubmitting.value) {
    resetState();
    emit('close');
  }
};

const handleRequestOtp = async () => {
  if (!isStep1Valid.value) return;
  
  isSubmitting.value = true;
  errorMessage.value = '';
  
  try {
    const payload = {
      address: channel.value === 'email' ? email.value : '',
      phone: channel.value === 'whatsapp' ? phone.value : '',
      channel: channel.value
    };
    
    const response = await authAPI.requestOtp(payload);
    
    if (response.data.success) {
      successMessage.value = response.data.message || 'OTP sent successfully!';
      currentStep.value = STEPS.VERIFY;
    } else {
      errorMessage.value = response.data.message || 'Failed to send OTP. Please try again.';
    }
  } catch (error) {
    console.error('Request OTP error:', error);
    errorMessage.value = error.response?.data?.message || error.message || 'Failed to send OTP. Please try again.';
  } finally {
    isSubmitting.value = false;
  }
};

const handleVerifyOtp = async () => {
  if (!isStep2Valid.value) return;
  
  isSubmitting.value = true;
  errorMessage.value = '';
  
  try {
    const payload = {
      address: channel.value === 'email' ? email.value : '',
      phone: channel.value === 'whatsapp' ? phone.value : '',
      channel: channel.value,
      otp: otpCode.value
    };
    
    const response = await authAPI.verifyOtp(payload);
    
    if (response.data.success) {
      resetToken.value = response.data.resetToken;
      successMessage.value = 'OTP verified successfully!';
      currentStep.value = STEPS.RESET;
    } else {
      errorMessage.value = response.data.message || 'Invalid OTP. Please try again.';
    }
  } catch (error) {
    console.error('Verify OTP error:', error);
    errorMessage.value = error.response?.data?.message || error.message || 'Invalid OTP. Please try again.';
  } finally {
    isSubmitting.value = false;
  }
};

const handleChangePassword = async () => {
  if (!isStep3Valid.value) return;
  
  isSubmitting.value = true;
  errorMessage.value = '';
  
  try {
    const payload = {
      resetToken: resetToken.value,
      newPassword: newPassword.value
    };
    
    const response = await authAPI.changePassword(payload);
    
    if (response.data.success) {
      successMessage.value = response.data.message || 'Password changed successfully!';
      currentStep.value = STEPS.SUCCESS;
    } else {
      errorMessage.value = response.data.message || 'Failed to change password. Please try again.';
    }
  } catch (error) {
    console.error('Change password error:', error);
    errorMessage.value = error.response?.data?.message || error.message || 'Failed to change password. Please try again.';
  } finally {
    isSubmitting.value = false;
  }
};

const handleSuccess = () => {
  emit('success');
  handleClose();
};

const handleResendOtp = async () => {
  isSubmitting.value = true;
  errorMessage.value = '';
  successMessage.value = '';
  
  try {
    const payload = {
      address: channel.value === 'email' ? email.value : '',
      phone: channel.value === 'whatsapp' ? phone.value : '',
      channel: channel.value
    };
    
    const response = await authAPI.requestOtp(payload);
    
    if (response.data.success) {
      successMessage.value = 'New OTP sent successfully!';
      otpCode.value = '';
    } else {
      errorMessage.value = response.data.message || 'Failed to resend OTP.';
    }
  } catch (error) {
    console.error('Resend OTP error:', error);
    errorMessage.value = error.response?.data?.message || error.message || 'Failed to resend OTP.';
  } finally {
    isSubmitting.value = false;
  }
};

const goBack = () => {
  if (currentStep.value === STEPS.VERIFY) {
    currentStep.value = STEPS.REQUEST;
    otpCode.value = '';
  } else if (currentStep.value === STEPS.RESET) {
    currentStep.value = STEPS.VERIFY;
    newPassword.value = '';
    confirmPassword.value = '';
  }
  errorMessage.value = '';
  successMessage.value = '';
};

// OTP Input handling
const handleOtpInput = (event) => {
  // Only allow digits
  const value = event.target.value.replace(/\D/g, '').slice(0, 6);
  otpCode.value = value;
};
</script>

<template>
  <Modal
    :show="show"
    :title="title"
    :persistent="isSubmitting"
    size="md"
    variant="gradient"
    :hide-footer="true"
    @close="handleClose"
  >
    <template #content>
      <div class="py-4 px-2">
        <!-- Progress Steps -->
        <div class="flex items-center justify-center mb-8">
          <div class="flex items-center">
            <!-- Step 1 -->
            <div class="flex flex-col items-center">
              <div
                :class="[
                  'w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all',
                  currentStep.value >= STEPS.REQUEST
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                ]"
              >
                <svg v-if="currentStep > STEPS.REQUEST" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span v-else>1</span>
              </div>
              <span class="text-xs mt-1 text-gray-600">Request</span>
            </div>
            
            <!-- Connector -->
            <div :class="['w-16 h-1 mx-2', currentStep > STEPS.REQUEST ? 'bg-blue-600' : 'bg-gray-200']"></div>
            
            <!-- Step 2 -->
            <div class="flex flex-col items-center">
              <div
                :class="[
                  'w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all',
                  currentStep >= STEPS.VERIFY
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                ]"
              >
                <svg v-if="currentStep > STEPS.VERIFY" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span v-else>2</span>
              </div>
              <span class="text-xs mt-1 text-gray-600">Verify</span>
            </div>
            
            <!-- Connector -->
            <div :class="['w-16 h-1 mx-2', currentStep > STEPS.VERIFY ? 'bg-blue-600' : 'bg-gray-200']"></div>
            
            <!-- Step 3 -->
            <div class="flex flex-col items-center">
              <div
                :class="[
                  'w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all',
                  currentStep >= STEPS.RESET
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                ]"
              >
                <svg v-if="currentStep > STEPS.RESET" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span v-else>3</span>
              </div>
              <span class="text-xs mt-1 text-gray-600">Reset</span>
            </div>
          </div>
        </div>

        <!-- Step Title & Description -->
        <div class="text-center mb-6">
          <h3 class="text-lg font-semibold text-gray-800">{{ stepTitle }}</h3>
          <p class="text-sm text-gray-500 mt-1">{{ stepDescription }}</p>
        </div>

        <!-- Error Message -->
        <div
          v-if="errorMessage"
          class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2"
        >
          <svg class="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="text-sm text-red-700">{{ errorMessage }}</span>
        </div>

        <!-- Success Message -->
        <div
          v-if="successMessage && currentStep !== STEPS.SUCCESS"
          class="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2"
        >
          <svg class="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <span class="text-sm text-green-700">{{ successMessage }}</span>
        </div>

        <!-- Step 1: Request OTP -->
        <div v-if="currentStep === STEPS.REQUEST" class="space-y-4">
          <!-- Channel Selection -->
          <div class="grid grid-cols-2 gap-3">
            <button
              type="button"
              @click="channel = 'email'"
              :class="[
                'p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2',
                channel === 'email'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              ]"
            >
              <svg class="w-8 h-8" :class="channel === 'email' ? 'text-blue-600' : 'text-gray-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span :class="channel === 'email' ? 'text-blue-700 font-medium' : 'text-gray-600'">Email</span>
            </button>
            
            <button
              type="button"
              @click="channel = 'whatsapp'"
              :class="[
                'p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2',
                channel === 'whatsapp'
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              ]"
            >
              <svg class="w-8 h-8" :class="channel === 'whatsapp' ? 'text-green-600' : 'text-gray-400'" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              <span :class="channel === 'whatsapp' ? 'text-green-700 font-medium' : 'text-gray-600'">WhatsApp</span>
            </button>
          </div>

          <!-- Email Input -->
          <div v-if="channel === 'email'">
            <label class="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <input
              v-model="email"
              type="email"
              placeholder="Enter your email address"
              class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
              :disabled="isSubmitting"
            />
          </div>

          <!-- Phone Input -->
          <div v-else>
            <label class="block text-sm font-medium text-gray-700 mb-2">WhatsApp Number</label>
            <input
              v-model="phone"
              type="tel"
              placeholder="08xxxxxxxxxx"
              class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none"
              :disabled="isSubmitting"
            />
            <p class="text-xs text-gray-500 mt-1">Enter your WhatsApp number (e.g., 08123456789)</p>
          </div>

          <!-- Submit Button -->
          <BaseButton
            variant="glass-primary"
            size="lg"
            block
            :loading="isSubmitting"
            :disabled="!isStep1Valid"
            @click="handleRequestOtp"
          >
            Send OTP Code
          </BaseButton>
        </div>

        <!-- Step 2: Verify OTP -->
        <div v-if="currentStep === STEPS.VERIFY" class="space-y-4">
          <!-- OTP Input -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Verification Code</label>
            <input
              :value="otpCode"
              @input="handleOtpInput"
              type="text"
              inputmode="numeric"
              maxlength="6"
              placeholder="000000"
              class="w-full px-4 py-4 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none text-center text-2xl font-mono tracking-[0.5em]"
              :disabled="isSubmitting"
            />
          </div>

          <!-- Resend OTP -->
          <div class="text-center">
            <button
              type="button"
              @click="handleResendOtp"
              :disabled="isSubmitting"
              class="text-sm text-blue-600 hover:text-blue-800 underline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Didn't receive the code? Resend
            </button>
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-3">
            <BaseButton
              variant="secondary"
              size="lg"
              @click="goBack"
              :disabled="isSubmitting"
            >
              Back
            </BaseButton>
            <BaseButton
              variant="glass-primary"
              size="lg"
              block
              :loading="isSubmitting"
              :disabled="!isStep2Valid"
              @click="handleVerifyOtp"
            >
              Verify Code
            </BaseButton>
          </div>
        </div>

        <!-- Step 3: Reset Password -->
        <div v-if="currentStep === STEPS.RESET" class="space-y-4">
          <!-- New Password -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">New Password</label>
            <input
              v-model="newPassword"
              type="password"
              placeholder="Enter new password (min 6 characters)"
              class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
              :disabled="isSubmitting"
            />
          </div>

          <!-- Confirm Password -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
            <input
              v-model="confirmPassword"
              type="password"
              placeholder="Confirm your new password"
              class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
              :disabled="isSubmitting"
            />
          </div>

          <!-- Password Validation Errors -->
          <div v-if="passwordErrors.length > 0" class="space-y-1">
            <p v-for="(error, index) in passwordErrors" :key="index" class="text-sm text-red-600 flex items-center gap-1">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {{ error }}
            </p>
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-3">
            <BaseButton
              variant="secondary"
              size="lg"
              @click="goBack"
              :disabled="isSubmitting"
            >
              Back
            </BaseButton>
            <BaseButton
              variant="glass-primary"
              size="lg"
              block
              :loading="isSubmitting"
              :disabled="!isStep3Valid"
              @click="handleChangePassword"
            >
              Change Password
            </BaseButton>
          </div>
        </div>

        <!-- Step 4: Success -->
        <div v-if="currentStep === STEPS.SUCCESS" class="text-center space-y-6">
          <!-- Success Icon -->
          <div class="flex justify-center">
            <div class="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
              <svg class="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          <!-- Success Message -->
          <p class="text-gray-600">{{ successMessage }}</p>

          <!-- Done Button -->
          <BaseButton
            variant="success"
            size="lg"
            block
            @click="handleSuccess"
          >
            Done
          </BaseButton>
        </div>
      </div>
    </template>
  </Modal>
</template>

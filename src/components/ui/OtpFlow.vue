<script setup>
import { ref, computed, watch, onUnmounted } from 'vue';
import { authAPI } from '../../services/api';
import Modal from './Modal.vue';
import BaseButton from './BaseButton.vue';
import BaseInput from '../form/BaseInput.vue';

const props = defineProps({
  show: { type: Boolean, default: false },
  prefillEmail: { type: String, default: '' },
  prefillPhone: { type: String, default: '' },
  title: { type: String, default: 'Reset Password' }
});

const emit = defineEmits(['close', 'success']);

const STEPS = { REQUEST: 1, VERIFY: 2, RESET: 3, SUCCESS: 4 };
const currentStep = ref(STEPS.REQUEST);
const isSubmitting = ref(false);
const errorMessage = ref('');
const successMessage = ref('');
const channel = ref('email');
const email = ref('');
const phone = ref('');
const otpCode = ref('');
const resetToken = ref('');
const newPassword = ref('');
const confirmPassword = ref('');

const otpTimer = ref(0);
let timerInterval = null;

const stepTitle = computed(() => {
  switch (currentStep.value) {
    case STEPS.REQUEST: return 'Choose verification method';
    case STEPS.VERIFY: return 'Enter verification code';
    case STEPS.RESET: return 'Set new password';
    case STEPS.SUCCESS: return 'Password changed';
    default: return props.title;
  }
});

const stepDescription = computed(() => {
  switch (currentStep.value) {
    case STEPS.REQUEST: return 'Select how to receive the code.';
    case STEPS.VERIFY: return `Enter the 6-digit code sent to your ${channel.value === 'email' ? 'email' : 'WhatsApp'}.`;
    case STEPS.RESET: return 'Create a new secure password for your account.';
    case STEPS.SUCCESS: return 'You can now log in with your new password.';
    default: return '';
  }
});

const channelLabel = computed(() => {
  return channel.value === 'email' ? email.value : phone.value;
});

const maskedChannel = computed(() => {
  if (channel.value === 'email') {
    const [name, domain] = email.value.split('@');
    if (!domain) return email.value;
    return `${name.slice(0, 2)}***@${domain}`;
  }
  const digits = phone.value.replace(/\D/g, '');
  if (digits.length < 6) return phone.value;
  return `${digits.slice(0, 3)}****${digits.slice(-3)}`;
});

const isStep1Valid = computed(() => {
  if (channel.value === 'email') {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value);
  }
  return /^\d{10,15}$/.test(phone.value.replace(/\D/g, ''));
});

const isStep2Valid = computed(() => otpCode.value?.length === 6);

const isStep3Valid = computed(() => {
  return newPassword.value.length >= 6 && newPassword.value === confirmPassword.value;
});

const passwordStrength = computed(() => {
  const pw = newPassword.value;
  if (!pw) return { level: 0, label: '' };
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const levels = ['Weak', 'Fair', 'Good', 'Strong', 'Very strong'];
  const index = Math.min(Math.floor(score / 2), 4);
  const colors = ['bg-red-500', 'bg-orange-400', 'bg-yellow-400', 'bg-green-400', 'bg-green-500'];
  return { level: score, label: levels[index], color: colors[index], width: `${((index + 1) / 5) * 100}%` };
});

const passwordErrors = computed(() => {
  const errors = [];
  if (!newPassword.value || !confirmPassword.value) return errors;
  if (newPassword.value && newPassword.value.length < 6) {
    errors.push('Password must be at least 6 characters');
  }
  if (confirmPassword.value && newPassword.value !== confirmPassword.value) {
    errors.push('Passwords do not match');
  }
  return errors;
});

function startOtpTimer() {
  stopOtpTimer();
  otpTimer.value = 120;
  timerInterval = setInterval(() => {
    otpTimer.value--;
    if (otpTimer.value <= 0) {
      stopOtpTimer();
    }
  }, 1000);
}

function stopOtpTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

const otpExpired = computed(() => otpTimer.value <= 0);

const formattedTimer = computed(() => {
  const m = Math.floor(otpTimer.value / 60);
  const s = otpTimer.value % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
});

watch(() => props.show, (newVal) => {
  if (newVal) {
    resetState();
    if (props.prefillEmail) email.value = props.prefillEmail;
    if (props.prefillPhone) phone.value = props.prefillPhone;
  }
});

function resetState() {
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
  stopOtpTimer();
  otpTimer.value = 0;
}

function handleClose() {
  if (!isSubmitting.value) {
    resetState();
    emit('close');
  }
}

async function handleRequestOtp() {
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
      successMessage.value = 'Code sent!';
      currentStep.value = STEPS.VERIFY;
      startOtpTimer();
    } else {
      errorMessage.value = response.data.message || 'Failed to send the code. Try again.';
    }
  } catch (error) {
    console.error('Request OTP error:', error);
    errorMessage.value = error.response?.data?.message || error.message || 'Failed to send the code. Try again.';
  } finally {
    isSubmitting.value = false;
  }
}

function onOtpComplete(value) {
  otpCode.value = value;
  if (value && value.length === 6) {
    handleVerifyOtp();
  }
}

async function handleVerifyOtp() {
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
      stopOtpTimer();
      successMessage.value = 'Code verified';
      currentStep.value = STEPS.RESET;
    } else {
      errorMessage.value = response.data.message || 'Invalid code. Try again.';
    }
  } catch (error) {
    console.error('Verify OTP error:', error);
    errorMessage.value = error.response?.data?.message || error.message || 'Invalid code. Try again.';
  } finally {
    isSubmitting.value = false;
  }
}

async function handleChangePassword() {
  if (!isStep3Valid.value) return;
  isSubmitting.value = true;
  errorMessage.value = '';

  try {
    const payload = { resetToken: resetToken.value, newPassword: newPassword.value };
    const response = await authAPI.changePassword(payload);
    if (response.data.success) {
      successMessage.value = response.data.message || 'Password changed';
      currentStep.value = STEPS.SUCCESS;
    } else {
      errorMessage.value = response.data.message || 'Failed to change password. Try again.';
    }
  } catch (error) {
    console.error('Change password error:', error);
    errorMessage.value = error.response?.data?.message || error.message || 'Failed to change password. Try again.';
  } finally {
    isSubmitting.value = false;
  }
}

function handleSuccess() {
  emit('success');
  handleClose();
}

async function handleResendOtp() {
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
      successMessage.value = 'New code sent!';
      otpCode.value = '';
      startOtpTimer();
    } else {
      errorMessage.value = response.data.message || 'Failed to resend code.';
    }
  } catch (error) {
    console.error('Resend OTP error:', error);
    errorMessage.value = error.response?.data?.message || error.message || 'Failed to resend code.';
  } finally {
    isSubmitting.value = false;
  }
}

function goBack() {
  if (currentStep.value === STEPS.VERIFY) {
    currentStep.value = STEPS.REQUEST;
    otpCode.value = '';
    stopOtpTimer();
    otpTimer.value = 0;
  } else if (currentStep.value === STEPS.RESET) {
    currentStep.value = STEPS.VERIFY;
    newPassword.value = '';
    confirmPassword.value = '';
  }
  errorMessage.value = '';
  successMessage.value = '';
}

function handleStepKeydown(e) {
  if (e.key === 'Enter' && !isSubmitting.value) {
    if (currentStep.value === STEPS.REQUEST && isStep1Valid.value) handleRequestOtp();
    if (currentStep.value === STEPS.RESET && isStep3Valid.value) handleChangePassword();
  }
}

onUnmounted(() => {
  stopOtpTimer();
});
</script>

<template>
  <Modal
    :show="show"
    :title="title"
    :persistent="isSubmitting"
    size="md"
    :hide-footer="true"
    responsive-drawer
    @close="handleClose"
  >
    <template #content>
      <div class="py-4 px-2" @keydown="handleStepKeydown">
        <div
          v-if="currentStep !== STEPS.SUCCESS"
          class="flex items-center justify-center mb-8"
        >
          <div class="flex items-center">
            <div class="flex flex-col items-center">
              <div
                :class="[
                  'w-10 h-10 rounded-token-full flex items-center justify-center font-bold text-sm transition-all duration-token-default',
                  currentStep >= STEPS.REQUEST ? 'bg-brand-primary text-white' : 'bg-divider text-ink-muted'
                ]"
                :aria-current="currentStep === STEPS.REQUEST ? 'step' : undefined"
              >
                <UIcon v-if="currentStep > STEPS.REQUEST" name="i-lucide-check" class="w-5 h-5" />
                <span v-else>1</span>
              </div>
              <span class="text-xs mt-1 text-ink-muted">Request</span>
            </div>
            <div :class="['w-16 h-1 mx-2', currentStep > STEPS.REQUEST ? 'bg-brand-primary' : 'bg-divider']" />
            <div class="flex flex-col items-center">
              <div
                :class="[
                  'w-10 h-10 rounded-token-full flex items-center justify-center font-bold text-sm transition-all duration-token-default',
                  currentStep >= STEPS.VERIFY ? 'bg-brand-primary text-white' : 'bg-divider text-ink-muted'
                ]"
                :aria-current="currentStep === STEPS.VERIFY ? 'step' : undefined"
              >
                <UIcon v-if="currentStep > STEPS.VERIFY" name="i-lucide-check" class="w-5 h-5" />
                <span v-else>2</span>
              </div>
              <span class="text-xs mt-1 text-ink-muted">Verify</span>
            </div>
            <div :class="['w-16 h-1 mx-2', currentStep > STEPS.VERIFY ? 'bg-brand-primary' : 'bg-divider']" />
            <div class="flex flex-col items-center">
              <div
                :class="[
                  'w-10 h-10 rounded-token-full flex items-center justify-center font-bold text-sm transition-all duration-token-default',
                  currentStep >= STEPS.RESET ? 'bg-brand-primary text-white' : 'bg-divider text-ink-muted'
                ]"
                :aria-current="currentStep === STEPS.RESET ? 'step' : undefined"
              >
                <UIcon v-if="currentStep > STEPS.RESET" name="i-lucide-check" class="w-5 h-5" />
                <span v-else>3</span>
              </div>
              <span class="text-xs mt-1 text-ink-muted">Reset</span>
            </div>
          </div>
        </div>

        <div class="text-center mb-6">
          <h3 class="text-lg font-semibold text-ink">{{ stepTitle }}</h3>
          <p class="text-sm text-ink-muted mt-1">{{ stepDescription }}</p>
          <div
            v-if="currentStep === STEPS.VERIFY || currentStep === STEPS.RESET"
            class="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-surface-elevated rounded-token-full text-xs text-ink-muted"
          >
            <UIcon
              :name="channel === 'email' ? 'i-lucide-mail' : 'i-lucide-message-circle'"
              class="w-3.5 h-3.5"
            />
            {{ maskedChannel }}
          </div>
        </div>

        <div
          v-if="errorMessage"
          role="alert"
          aria-live="polite"
          class="mb-4 p-3 bg-red-50 border border-red-200 rounded-token-lg flex items-start gap-2"
        >
          <UIcon name="i-lucide-alert-circle" class="w-5 h-5 text-brand-danger flex-shrink-0 mt-0.5" />
          <span class="text-sm text-red-700">{{ errorMessage }}</span>
        </div>

        <div
          v-if="successMessage && currentStep !== STEPS.SUCCESS"
          role="status"
          aria-live="polite"
          class="mb-4 p-3 bg-green-50 border border-green-200 rounded-token-lg flex items-start gap-2"
        >
          <UIcon name="i-lucide-check-circle" class="w-5 h-5 text-brand-success flex-shrink-0 mt-0.5" />
          <span class="text-sm text-green-700">{{ successMessage }}</span>
        </div>

        <div v-if="currentStep === STEPS.REQUEST" class="space-y-4">
          <div class="grid grid-cols-2 gap-3">
            <button
              type="button"
              @click="channel = 'email'"
              :class="[
                'p-4 rounded-token-xl border-2 transition-all duration-token-default flex flex-col items-center gap-2',
                channel === 'email'
                  ? 'border-brand-primary bg-brand-primary/5'
                  : 'border-divider hover:border-divider-strong bg-surface'
              ]"
            >
              <UIcon
                name="i-lucide-mail"
                class="w-8 h-8"
                :class="channel === 'email' ? 'text-brand-primary' : 'text-ink-muted'"
              />
              <span
                :class="channel === 'email' ? 'text-brand-primary font-medium' : 'text-ink-muted'"
              >Email</span>
            </button>
            <button
              type="button"
              @click="channel = 'whatsapp'"
              :class="[
                'p-4 rounded-token-xl border-2 transition-all duration-token-default flex flex-col items-center gap-2',
                channel === 'whatsapp'
                  ? 'border-brand-primary bg-brand-primary/5'
                  : 'border-divider hover:border-divider-strong bg-surface'
              ]"
            >
              <UIcon
                name="i-lucide-message-circle"
                class="w-8 h-8"
                :class="channel === 'whatsapp' ? 'text-brand-primary' : 'text-ink-muted'"
              />
              <span
                :class="channel === 'whatsapp' ? 'text-brand-primary font-medium' : 'text-ink-muted'"
              >WhatsApp</span>
            </button>
          </div>

          <div v-if="channel === 'email'">
            <BaseInput
              v-model="email"
              type="email"
              label="Email address"
              placeholder="you@university.ac.id"
              :disabled="isSubmitting"
              size="lg"
            />
          </div>
          <div v-else>
            <BaseInput
              v-model="phone"
              type="tel"
              label="WhatsApp number"
              placeholder="08xxxxxxxxxx"
              :disabled="isSubmitting"
              size="lg"
            />
            <p class="text-xs text-ink-muted mt-1">Enter your WhatsApp number, e.g. 08123456789</p>
          </div>

          <BaseButton
            variant="primary"
            size="lg"
            block
            :loading="isSubmitting"
            :disabled="!isStep1Valid"
            @click="handleRequestOtp"
          >
            Send code
          </BaseButton>
        </div>

        <div v-if="currentStep === STEPS.VERIFY" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-ink mb-2">Verification code</label>
            <div class="flex justify-center">
              <UPinInput
                v-model="otpCode"
                :length="6"
                :disabled="isSubmitting || otpExpired"
                placeholder="&#9679;"
                otp
                autofocus
                @complete="onOtpComplete"
              />
            </div>
          </div>

          <div class="flex items-center justify-between text-sm">
            <span
              v-if="otpTimer > 0"
              class="text-ink-muted font-mono tabular-nums"
            >
              Code expires in {{ formattedTimer }}
            </span>
            <span
              v-else-if="otpExpired"
              class="text-brand-danger"
            >
              Code expired. Request a new one.
            </span>
            <button
              type="button"
              @click="handleResendOtp"
              :disabled="isSubmitting || (!otpExpired && otpTimer > 0)"
              class="text-brand-primary hover:text-brand-primary-hover disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
            >
              Resend code
            </button>
          </div>

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
              variant="primary"
              size="lg"
              block
              :loading="isSubmitting"
              :disabled="!isStep2Valid || otpExpired"
              @click="handleVerifyOtp"
            >
              Verify code
            </BaseButton>
          </div>
        </div>

        <div v-if="currentStep === STEPS.RESET" class="space-y-4">
          <BaseInput
            v-model="newPassword"
            type="password"
            label="New password"
            placeholder="Enter new password (min 6 characters)"
            :disabled="isSubmitting"
            size="lg"
          />

          <div v-if="newPassword" class="space-y-1">
            <div class="h-1.5 w-full bg-divider rounded-token-full overflow-hidden">
              <div
                :class="['h-full rounded-token-full transition-all duration-token-default', passwordStrength.color]"
                :style="{ width: passwordStrength.width }"
              />
            </div>
            <p v-if="passwordStrength.label" class="text-xs text-ink-muted">
              {{ passwordStrength.label }}
            </p>
          </div>

          <BaseInput
            v-model="confirmPassword"
            type="password"
            label="Confirm password"
            placeholder="Confirm your new password"
            :disabled="isSubmitting"
            size="lg"
          />

          <div v-if="passwordErrors.length > 0" class="space-y-1" role="alert" aria-live="polite">
            <p v-for="(error, index) in passwordErrors" :key="index" class="text-sm text-brand-danger flex items-center gap-1">
              <UIcon name="i-lucide-alert-circle" class="w-4 h-4" />
              {{ error }}
            </p>
          </div>

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
              variant="primary"
              size="lg"
              block
              :loading="isSubmitting"
              :disabled="!isStep3Valid"
              @click="handleChangePassword"
            >
              Change password
            </BaseButton>
          </div>
        </div>

        <div v-if="currentStep === STEPS.SUCCESS" class="text-center space-y-6">
          <div class="flex justify-center">
            <div class="w-20 h-20 rounded-token-full bg-brand-success/10 flex items-center justify-center">
              <UIcon name="i-lucide-check-circle" class="w-10 h-10 text-brand-success" />
            </div>
          </div>
          <p class="text-ink-muted">{{ successMessage }}</p>
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

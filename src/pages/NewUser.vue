<script setup>
// This page is the first-time onboarding for students who just signed in via Google.
// It writes the username + password directly via the user update API (no OTP).
// Staff do not reach this page.
// Note: username and password are required even for Google-primary students —
// they serve as a fallback login method.
import { computed, ref, onMounted, onUnmounted, nextTick } from 'vue';
import { studentAPI, userAPI } from '../services/api';
import { authStore } from '../store/auth';
import { useRoute, useRouter } from 'vue-router';
import { useForm } from '../composables/useForm';
import Modal from '../components/ui/Modal.vue';
import LoadingSpinner from '../components/ui/LoadingSpinner.vue';
import UCalendar from '@nuxt/ui/components/Calendar.vue';
import UPopover from '@nuxt/ui/components/Popover.vue';
import { CalendarDate } from '@internationalized/date';
import ittrLogo from '../assets/ittrlogo.png';

const router = useRouter();
const route = useRoute();
const isDevPreview = import.meta.env.DEV && route.meta.devPreview;

// Gender mapping helper
const mapGenderToBackend = (frontendGender) => {
  if (frontendGender === 'Male') return 'L';
  if (frontendGender === 'Female') return 'P';
  return frontendGender; // Already in backend format
};

const isLoading = ref(true);
const showModal = ref(false);
const showMobileSubmit = ref(false);
const modalType = ref('info');
const modalMessage = ref('');

// Gender options for select
const genderOptions = [
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' }
];

const { formData, errors, isSubmitting, submit, getFieldProps, reset, validate, validateSingleField } = useForm(
  {
    // User credentials (top section)
    username: '',
    password: '',
    confirmPassword: '',
    
    // Student profile fields
    studentid: null,
    fullname: '',
    gender: '',
    address: '',
    phone: '',
    parentname: '',
    parentphone: '',
    birthdate: '',
    birthplace: '',
    classid: null,
    userid: null
  },
  {
    username: ['required', { type: 'minLength', min: 3 }],
    password: ['required', { type: 'minLength', min: 6 }],
    confirmPassword: ['required', (value) => value === formData.password ? null : 'Passwords do not match'],
    fullname: ['required', { type: 'minLength', min: 2 }],
    gender: ['required'],
    address: ['required'],
    phone: ['required', 'phone'],
    parentname: ['required'],
    parentphone: ['phone']
  }
);

const birthDateValue = computed({
  get() {
    if (!formData.birthdate) return undefined;
    const [year, month, day] = formData.birthdate.split('-').map(Number);
    return year && month && day ? new CalendarDate(year, month, day) : undefined;
  },
  set(value) {
    formData.birthdate = value?.toString() || '';
    validateSingleField('birthdate');
  }
});

const formattedBirthDate = computed(() => {
  if (!formData.birthdate) return 'Select date';
  const [year, month, day] = formData.birthdate.split('-');
  return `${month}/${day}/${year}`;
});

const fetchProfile = async () => {
  if (isDevPreview) {
    Object.assign(formData, {
      username: 'student.google',
      password: '',
      confirmPassword: '',
      studentid: 1001,
      fullname: 'Nadia Putri',
      gender: 'Female',
      address: 'Jl. Mawar No. 12, Jakarta',
      phone: '081234567890',
      parentname: 'Rina Putri',
      parentphone: '081298765432',
      birthdate: '2010-04-18',
      birthplace: 'Jakarta',
      classid: 3,
      userid: 42
    });
    isLoading.value = false;
    return;
  }

  const userId = authStore.user?.id;
  if (!userId) {
    modalType.value = 'error';
    modalMessage.value = "User not authenticated.";
    openModal();
    isLoading.value = false;
    return;
  }

  try {
    const response = await studentAPI.getStudentById(userId);
    if (response.data.success) {
      // Handle both array and object response from backend
      let studentData = response.data.data;
      
      // If response is array, take first element
      if (Array.isArray(studentData)) {
        studentData = studentData[0];
      }
      
      // If no data found, exit early
      if (!studentData) {
        modalType.value = 'info';
        modalMessage.value = "No student profile found. Please fill in the form.";
        openModal();
        return;
      }
      
      // Assign student fields to form
      Object.keys(studentData).forEach(key => {
        if (key in formData && key !== 'password' && key !== 'confirmPassword' && key !== 'tbuser') {
          formData[key] = studentData[key];
        }
      });
      
      // Extract user data from nested tbuser object
      if (studentData.tbuser) {
        const userData = studentData.tbuser;
        if (userData.username) {
          formData.username = userData.username;
        }
        if (userData.userid) {
          formData.userid = userData.userid;
        }
      }
    }
  } catch (error) {
    modalType.value = 'error';
    modalMessage.value = "Failed to load profile data.";
    openModal();
    console.error(error);
  } finally {
    isLoading.value = false;
  }
};

const handleCompleteProfile = async () => {
  if (isDevPreview) {
    modalType.value = 'success';
    modalMessage.value = 'Preview only: profile would be saved here.';
    openModal();
    return;
  }

  await submit(async (data) => {
    try {
      const userId = data.userid || authStore.user?.id;
      
      if (!userId) {
        throw new Error('Cannot update profile: User ID not found.');
      }
      
      // Step 1: Update user credentials (username and password)
      const userUpdateData = {
        username: data.username,
        password: data.password
      };
      
      await userAPI.updateUser(userId, userUpdateData);
      
      // Step 2: Update student profile (record should exist from Google OAuth signup)
      const studentUpdateData = {
        fullname: data.fullname,
        gender: mapGenderToBackend(data.gender),
        address: data.address,
        phone: data.phone,
        parentname: data.parentname,
        parentphone: data.parentphone,
        birthdate: data.birthdate,
        birthplace: data.birthplace
      };
      
      // Always update existing student record (created during OAuth)
      const response = await studentAPI.updateStudent(userId, studentUpdateData);
      
      if (response.data.success) {
        modalType.value = 'success';
        modalMessage.value = "Profile completed successfully! Redirecting to dashboard...";
        openModal();
        
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          router.push('/student/dashboard');
        }, 2000);
      }
    } catch (error) {
      console.error('Complete profile error:', error);
      modalType.value = 'error';
      modalMessage.value = error.response?.data?.message || error.message || "Failed to complete profile. Please try again.";
      openModal();
    }
  });
};

const openModal = async () => {
  showModal.value = true;
  await nextTick();
};

const closeModal = () => {
  showModal.value = false;
  modalType.value = 'info';
  modalMessage.value = '';
};

const updateMobileSubmitVisibility = () => {
  if (window.innerWidth >= 768) {
    showMobileSubmit.value = true;
    return;
  }

  const scrollBottom = window.scrollY + window.innerHeight;
  const pageBottom = document.documentElement.scrollHeight;
  showMobileSubmit.value = scrollBottom >= pageBottom - 16;
};

onMounted(() => {
  fetchProfile();
  window.addEventListener('scroll', updateMobileSubmitVisibility, { passive: true });
  window.addEventListener('resize', updateMobileSubmitVisibility);
  nextTick(updateMobileSubmitVisibility);
});

onUnmounted(() => {
  window.removeEventListener('scroll', updateMobileSubmitVisibility);
  window.removeEventListener('resize', updateMobileSubmitVisibility);
});
</script>

<template>
  <div class="new-user-page min-h-screen bg-blue-600 md:flex md:h-screen md:items-center md:justify-center md:overflow-hidden md:bg-[#eef6ff] md:p-6">
    <!-- Loading State -->
    <div v-if="isLoading" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div class="bg-white p-8 rounded-lg shadow-2xl max-w-md w-full">
            <LoadingSpinner size="lg" color="primary" :center="true" />
            <p class="text-center text-gray-600 mt-4 font-medium">Loading profile data...</p>
        </div>
    </div>

    <!-- Main Card -->
    <div v-else class="relative w-full overflow-hidden md:grid md:h-full md:max-h-[900px] md:max-w-7xl md:grid-cols-[0.9fr_1.35fr] md:items-center md:gap-8">
      <aside class="desktop-intro hidden h-full flex-col justify-between rounded-[1.5rem] p-8 md:flex">
        <div>
          <img :src="ittrLogo" alt="ITTR Logo" class="h-12 w-auto object-contain" />

          <div class="mt-16">
            <p class="mb-4 flex items-center gap-2 text-sm font-semibold text-blue-500">
              <UIcon name="i-lucide-sparkles" class="h-5 w-5" />
              You're almost there!
            </p>
            <h1 class="max-w-md text-4xl font-bold leading-tight text-slate-950 xl:text-5xl">
              Complete Your <span class="text-blue-600">Profile</span>
            </h1>
            <p class="mt-5 max-w-sm text-sm leading-6 text-blue-950/55 xl:text-base xl:leading-7">
              Tell us a bit about yourself to personalize your learning journey.
            </p>
          </div>
        </div>

        <div>
          <div class="study-visual mx-auto mb-5">
            <div class="study-platform"></div>
            <div class="study-book study-book-bottom"></div>
            <div class="study-book study-book-top"></div>
            <div class="study-cap"></div>
            <div class="study-pot"></div>
          </div>

          <UCard class="max-w-sm border-0 bg-white/75 shadow-sm ring-1 ring-blue-100" :ui="{ body: 'p-4' }">
            <div class="flex items-center gap-4">
              <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <UIcon name="i-lucide-shield-check" class="h-6 w-6" />
              </div>
              <div>
                <p class="text-sm font-semibold text-blue-950">Your information is safe with us.</p>
                <p class="mt-1 text-xs leading-5 text-blue-950/55">We use industry-standard security to protect your data.</p>
              </div>
            </div>
          </UCard>
        </div>
      </aside>

      <div class="mobile-hero px-5 pt-4 pb-12 text-slate-950 md:hidden">
        <div class="mb-7 flex items-center justify-between">
          <img :src="ittrLogo" alt="ITTR Logo" class="h-9 w-auto object-contain" />
          <div class="flex h-11 w-11 items-center justify-center rounded-full bg-white text-blue-600 shadow-sm">
            <UIcon name="i-lucide-user-round" class="h-5 w-5" />
          </div>
        </div>
        <h1 class="max-w-xs text-3xl font-bold leading-tight">Complete Your <span class="text-blue-600">Profile</span></h1>
        <p class="mt-2 text-xs font-medium text-slate-500">All fields marked with <span class="text-red-500">*</span> are required</p>
      </div>
      
      <!-- Form -->
      <UCard class="profile-sheet w-full border-0 bg-white shadow-xl ring-1 ring-blue-100/80 md:max-h-full md:self-center md:rounded-[1.75rem]" :ui="{ body: 'px-5 pb-24 pt-6 md:p-6 xl:p-8' }">
        <div class="max-w-3xl mx-auto w-full">
          <!-- Header -->
          <div class="hidden items-center gap-4 mb-5 md:flex xl:mb-8">
            <div class="flex h-14 w-14 items-center justify-center rounded-full bg-blue-500 text-white shadow-lg shadow-blue-500/25 xl:h-16 xl:w-16">
              <UIcon name="i-lucide-user-round" class="h-7 w-7 xl:h-8 xl:w-8" />
            </div>
            <div>
              <h1 class="text-xl font-bold text-slate-950 xl:text-2xl">Personal Information</h1>
              <p class="text-sm text-slate-500">All fields marked with <span class="text-red-500">*</span> are required</p>
            </div>
          </div>

          <form @submit.prevent="handleCompleteProfile" class="space-y-5 md:space-y-4 xl:space-y-6">
            <!-- Personal Information Section -->
            <div>
              <h2 class="section-title text-lg font-semibold text-blue-600 mb-4 flex items-center gap-2 md:hidden">
                <span class="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500 text-white">
                  <UIcon name="i-lucide-user-round" class="h-5 w-5" />
                </span>
                <span>Personal Information</span>
              </h2>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5 md:gap-x-8 md:gap-y-3 xl:gap-y-5">
                <!-- Full Name -->
                <div class="md:col-span-2">
                  <label class="block text-sm font-medium text-gray-900 mb-2">
                    Full Name <span class="text-red-500">*</span>
                  </label>
                  <UInput
                    v-model="formData.fullname"
                    @blur="validateSingleField('fullname')"
                    type="text" 
                    size="sm"
                    placeholder="Enter your full name"
                    leading-icon="i-lucide-user-round"
                    class="w-full"
                    :color="errors.fullname ? 'error' : 'primary'"
                  />
                  <p v-if="errors.fullname" class="text-red-600 text-xs mt-1.5">{{ errors.fullname }}</p>
                </div>

                <!-- Birth Date -->
                <div class="col-span-1">
                  <label class="block text-sm font-medium text-gray-900 mb-2">Birth Date</label>
                  <UPopover :content="{ side: 'bottom', align: 'start', sideOffset: 8 }">
                    <UInput
                      :model-value="formattedBirthDate"
                      readonly
                      size="sm"
                      trailing-icon="i-lucide-calendar-days"
                      class="w-full"
                      :color="errors.birthdate ? 'error' : 'primary'"
                    />
                    <template #content="{ close }">
                      <UCalendar
                        v-model="birthDateValue"
                        type="date"
                        view-control
                        color="primary"
                        month-controls
                        year-controls
                        class="p-2"
                        @update:model-value="close"
                      />
                    </template>
                  </UPopover>
                  <p v-if="errors.birthdate" class="text-red-600 text-xs mt-1.5">{{ errors.birthdate }}</p>
                </div>

                <!-- Birth Place -->
                <div class="col-span-1">
                  <label class="block text-sm font-medium text-gray-900 mb-2">Birth Place</label>
                  <UInput
                    v-model="formData.birthplace"
                    @blur="validateSingleField('birthplace')"
                    type="text" 
                    size="sm"
                    placeholder="City"
                    leading-icon="i-lucide-map-pin"
                    class="w-full"
                    :color="errors.birthplace ? 'error' : 'primary'"
                  />
                  <p v-if="errors.birthplace" class="text-red-600 text-xs mt-1.5">{{ errors.birthplace }}</p>
                </div>

                <!-- Address -->
                <div class="md:col-span-2">
                  <label class="block text-sm font-medium text-gray-900 mb-2">
                    Address <span class="text-red-500">*</span>
                  </label>
                  <UInput
                    v-model="formData.address"
                    @blur="validateSingleField('address')"
                    type="text" 
                    size="sm"
                    placeholder="Complete address"
                    leading-icon="i-lucide-home"
                    class="w-full"
                    :color="errors.address ? 'error' : 'primary'"
                  />
                  <p v-if="errors.address" class="text-red-600 text-xs mt-1.5">{{ errors.address }}</p>
                </div>

                <!-- Gender -->
                <div class="col-span-1">
                  <label class="block text-sm font-medium text-gray-900 mb-2">
                    Gender <span class="text-red-500">*</span>
                  </label>
                  <USelect
                    v-model="formData.gender"
                    :items="genderOptions"
                    size="sm"
                    placeholder="Select"
                    icon="i-lucide-user-round"
                    class="w-full"
                    :color="errors.gender ? 'error' : 'primary'"
                    @blur="validateSingleField('gender')"
                  />
                  <p v-if="errors.gender" class="text-red-600 text-xs mt-1.5">{{ errors.gender }}</p>
                </div>

                <!-- Phone -->
                <div class="col-span-1">
                  <label class="block text-sm font-medium text-gray-900 mb-2">
                    Phone <span class="text-red-500">*</span>
                  </label>
                  <UInput
                    v-model="formData.phone"
                    @blur="validateSingleField('phone')"
                    type="tel" 
                    size="sm"
                    placeholder="08xxxxxxxxx"
                    leading-icon="i-lucide-phone"
                    class="w-full"
                    :color="errors.phone ? 'error' : 'primary'"
                  />
                  <p v-if="errors.phone" class="text-red-600 text-xs mt-1.5">{{ errors.phone }}</p>
                </div>

                <!-- Parent Name -->
                <div class="col-span-1">
                  <label class="block text-sm font-medium text-gray-900 mb-2">
                    Parent Name <span class="text-red-500">*</span>
                  </label>
                  <UInput
                    v-model="formData.parentname"
                    @blur="validateSingleField('parentname')"
                    type="text" 
                    size="sm"
                    placeholder="Parent's full name"
                    leading-icon="i-lucide-users-round"
                    class="w-full"
                    :color="errors.parentname ? 'error' : 'primary'"
                  />
                  <p v-if="errors.parentname" class="text-red-600 text-xs mt-1.5">{{ errors.parentname }}</p>
                </div>

                <!-- Parent Phone -->
                <div class="col-span-1">
                  <label class="block text-sm font-medium text-gray-900 mb-2">Parent Phone</label>
                  <UInput
                    v-model="formData.parentphone"
                    @blur="validateSingleField('parentphone')"
                    type="tel" 
                    size="sm"
                    placeholder="08xxxxxxxxx"
                    leading-icon="i-lucide-phone"
                    class="w-full"
                    :color="errors.parentphone ? 'error' : 'primary'"
                  />
                  <p v-if="errors.parentphone" class="text-red-600 text-xs mt-1.5">{{ errors.parentphone }}</p>
                </div>
              </div>
            </div>

            <!-- Account Credentials Section -->
            <div class="border-t border-gray-200 pt-5 md:pt-4 xl:pt-6">
              <h2 class="section-title text-lg font-semibold text-blue-600 mb-4 flex items-center gap-2">
                <span class="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500 text-white">
                  <UIcon name="i-lucide-lock-keyhole" class="h-5 w-5" />
                </span>
                <span>Account Credentials</span>
              </h2>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5 md:gap-x-8 md:gap-y-3 xl:gap-y-5">
                <!-- Username -->
                <div class="md:col-span-2">
                  <label class="block text-sm font-medium text-gray-900 mb-2">
                    Username <span class="text-red-500">*</span>
                  </label>
                  <UInput
                    v-model="formData.username"
                    @blur="validateSingleField('username')"
                    type="text" 
                    size="sm"
                    placeholder="Choose a username"
                    leading-icon="i-lucide-user-round"
                    class="w-full"
                    :color="errors.username ? 'error' : 'primary'"
                  />
                  <p v-if="errors.username" class="text-red-600 text-xs mt-1.5">{{ errors.username }}</p>
                </div>

                <!-- Password -->
                <div class="col-span-1">
                  <label class="block text-sm font-medium text-gray-900 mb-2">
                    Password <span class="text-red-500">*</span>
                  </label>
                  <UInput
                    v-model="formData.password"
                    @blur="validateSingleField('password')"
                    type="password" 
                    size="sm"
                    placeholder="Min. 6 characters"
                    leading-icon="i-lucide-lock-keyhole"
                    class="w-full"
                    :color="errors.password ? 'error' : 'primary'"
                  />
                  <p v-if="errors.password" class="text-red-600 text-xs mt-1.5">{{ errors.password }}</p>
                </div>

                <!-- Confirm Password -->
                <div class="col-span-1">
                  <label class="block text-sm font-medium text-gray-900 mb-2">
                    Confirm Password <span class="text-red-500">*</span>
                  </label>
                  <UInput
                    v-model="formData.confirmPassword"
                    @blur="validateSingleField('confirmPassword')"
                    type="password" 
                    size="sm"
                    placeholder="Re-enter password"
                    leading-icon="i-lucide-lock-keyhole"
                    class="w-full"
                    :color="errors.confirmPassword ? 'error' : 'primary'"
                  />
                  <p v-if="errors.confirmPassword" class="text-red-600 text-xs mt-1.5">{{ errors.confirmPassword }}</p>
                </div>
              </div>
            </div>

            <!-- Submit Button -->
            <div class="submit-bar flex justify-end pt-2" :class="{ 'mobile-submit-visible': showMobileSubmit }">
              <UButton 
                type="submit"
                :disabled="isSubmitting"
                color="primary"
                size="xl"
                block
                trailing-icon="i-lucide-arrow-right"
                class="submit-button justify-center rounded-full font-bold shadow-lg shadow-blue-500/25"
              >
                <span v-if="isSubmitting">Saving...</span>
                <span v-else>Complete Profile</span>
              </UButton>
            </div>
          </form>
        </div>
      </UCard>

    </div>

    <!-- Modal Component -->
    <Modal
      :show="showModal"
      :type="modalType"
      :message="modalMessage"
      @close="closeModal"
      @confirm="closeModal"
    />
  </div>
</template>

<style scoped>
.desktop-intro {
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.92), rgba(232, 244, 255, 0.7)),
    radial-gradient(circle at 76% 54%, rgba(37, 99, 235, 0.12) 0 11rem, transparent 11.25rem);
}

.study-visual {
  position: relative;
  width: min(25rem, 100%);
  height: 14rem;
}

.study-platform {
  position: absolute;
  inset: auto 1rem 0 1rem;
  height: 3.75rem;
  border-radius: 9999px 9999px 2rem 2rem;
  background: linear-gradient(180deg, #d9efff, #b9dcff);
  box-shadow: 0 1.5rem 3rem rgba(37, 99, 235, 0.18);
}

.study-book {
  position: absolute;
  left: 7rem;
  width: 10.5rem;
  height: 2.8rem;
  border-radius: 0.9rem;
  background: linear-gradient(180deg, #eff8ff, #b8dcff);
  border: 1px solid rgba(37, 99, 235, 0.18);
  box-shadow: 0 0.9rem 1.8rem rgba(37, 99, 235, 0.14);
}

.study-book-bottom {
  bottom: 3rem;
  transform: rotate(1deg);
}

.study-book-top {
  bottom: 5.25rem;
  left: 7.8rem;
  transform: rotate(-2deg);
}

.study-cap {
  position: absolute;
  left: 7.7rem;
  bottom: 7.75rem;
  width: 12rem;
  height: 2.6rem;
  background: linear-gradient(135deg, #1d4ed8, #60a5fa);
  clip-path: polygon(50% 0, 100% 42%, 50% 84%, 0 42%);
  filter: drop-shadow(0 1rem 1.5rem rgba(37, 99, 235, 0.24));
}

.study-cap::after {
  content: '';
  position: absolute;
  right: 1.5rem;
  top: 1.15rem;
  width: 0.15rem;
  height: 4.25rem;
  background: #1d4ed8;
}

.study-pot {
  position: absolute;
  left: 2.2rem;
  bottom: 2.3rem;
  width: 3.8rem;
  height: 3.5rem;
  border-radius: 1.4rem 1.4rem 1.8rem 1.8rem;
  background: linear-gradient(180deg, #bfdbfe, #60a5fa);
  box-shadow: 0 1rem 1.8rem rgba(37, 99, 235, 0.18);
}

.study-pot::before {
  content: '';
  position: absolute;
  left: 1.9rem;
  bottom: 3.1rem;
  width: 0.16rem;
  height: 4.5rem;
  background: #60a5fa;
}

.study-pot::after {
  content: '';
  position: absolute;
  left: 0.7rem;
  bottom: 5.7rem;
  width: 3rem;
  height: 2.2rem;
  border-radius: 100% 0 100% 0;
  background: linear-gradient(135deg, #dbeafe, #93c5fd);
  transform: rotate(-18deg);
}

@media (max-width: 767px) {
  .new-user-page {
    background:
      radial-gradient(circle at 88% 0%, rgba(96, 165, 250, 0.45) 0 5.5rem, transparent 5.6rem),
      linear-gradient(180deg, #f8fbff 0%, #eef6ff 100%);
  }

  .mobile-hero {
    min-height: 14rem;
  }

  .profile-sheet {
    margin-top: -1.5rem;
    border-radius: 1.25rem 1.25rem 0 0;
  }

  .section-title {
    font-size: 1.125rem;
  }

  .submit-bar {
    position: fixed;
    left: 1rem;
    right: 1rem;
    bottom: max(0.75rem, env(safe-area-inset-bottom));
    z-index: 40;
    padding: 0;
    opacity: 0;
    pointer-events: none;
    transform: translateY(1rem);
    transition: opacity 180ms ease, transform 180ms ease;
  }

  .submit-bar.mobile-submit-visible {
    opacity: 1;
    pointer-events: auto;
    transform: translateY(0);
  }

  .submit-button {
    width: 100%;
    min-height: 3.125rem;
  }
}
</style>

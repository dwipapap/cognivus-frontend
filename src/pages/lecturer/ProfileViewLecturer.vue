<script setup>
import { ref, computed } from 'vue';
import { authStore } from '../../store/auth';
import { useLecturerProfile } from '../../composables/useLecturerProfile';
import iconBoyImage from '../../assets/iconboy.webp';
import iconGirlImage from '../../assets/icongirl.webp';
import { formatDate, calculateAge } from '../../utils/formatters';
import OtpFlow from '../../components/ui/OtpFlow.vue';
import Modal from '../../components/ui/Modal.vue';
import ProfileSection from '../../components/ui/ProfileSection.vue';
import ProfileField from '../../components/ui/ProfileField.vue';

const { lecturerProfile, isLoading, errorMessage } = useLecturerProfile();

// Change Password state
const showChangePassword = ref(false);
const showModal = ref(false);
const modalType = ref('info');
const modalMessage = ref('');

// Computed properties for prefilling OtpFlow
const userEmail = computed(() => {
  return authStore.user?.email || '';
});

const userPhone = computed(() => {
  return lecturerProfile.value?.phone || '';
});

const openChangePassword = () => {
  showChangePassword.value = true;
};

const closeChangePassword = () => {
  showChangePassword.value = false;
};

const handleChangePasswordSuccess = () => {
  closeChangePassword();
  modalType.value = 'success';
  modalMessage.value = 'Your password has been successfully changed.';
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  modalType.value = 'info';
  modalMessage.value = '';
};

/** Gender-based avatar computed property */
const avatarUrl = computed(() => {
  // Check if user has OAuth avatar from Google
  if (authStore.user?.user_metadata?.avatar_url) {
    return authStore.user.user_metadata.avatar_url;
  }

  // Use gender-based icon from lecturer profile
  const gender = lecturerProfile.value?.gender;
  if (gender === 'Laki-laki' || gender === 'L') {
    return iconBoyImage;
  } else if (gender === 'Perempuan' || gender === 'P') {
    return iconGirlImage;
  }

  // Default fallback
  return iconBoyImage;
});

/** Handle avatar image loading errors */
const handleImageError = (event) => {
  event.target.src = iconBoyImage;
};
</script>

<template>
  <!-- Welcome Banner -->
  <div class="relative bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 rounded-xl shadow-lg mb-8 overflow-hidden">
    <!-- Diagonal ID Card Graphics -->
    <div class="absolute top-0 right-0 w-1/2 h-full pointer-events-none overflow-hidden">
      <div class="absolute -top-10 -right-10 w-40 h-48 bg-indigo-400/30 rounded-lg transform rotate-12 flex items-center justify-center">
        <svg class="w-20 h-20 text-white/40" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
          <path fill-rule="evenodd" d="M4 4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H4Zm10 5a1 1 0 0 1 1-1h3a1 1 0 1 1 0 2h-3a1 1 0 0 1-1-1Zm0 3a1 1 0 0 1 1-1h3a1 1 0 1 1 0 2h-3a1 1 0 0 1-1-1Zm0 3a1 1 0 0 1 1-1h3a1 1 0 1 1 0 2h-3a1 1 0 0 1-1-1Zm-8-5a3 3 0 1 1 6 0 3 3 0 0 1-6 0Zm1.942 4a3 3 0 0 0-2.847 2.051l-.044.133-.004.012c-.042.126-.055.167-.042.195.006.013.02.023.038.039.032.025.08.064.146.155A1 1 0 0 0 6 17h6a1 1 0 0 0 .811-.415.713.713 0 0 1 .146-.155c.019-.016.031-.026.038-.04.014-.027 0-.068-.042-.194l-.004-.012-.044-.133A3 3 0 0 0 10.059 14H7.942Z" clip-rule="evenodd"/>
        </svg>
      </div>
      <div class="absolute top-20 -right-5 w-32 h-40 bg-indigo-300/40 rounded-lg transform rotate-12 flex items-center justify-center">
        <svg class="w-16 h-16 text-white/40" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
          <path fill-rule="evenodd" d="M4 4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H4Zm10 5a1 1 0 0 1 1-1h3a1 1 0 1 1 0 2h-3a1 1 0 0 1-1-1Zm0 3a1 1 0 0 1 1-1h3a1 1 0 1 1 0 2h-3a1 1 0 0 1-1-1Zm0 3a1 1 0 0 1 1-1h3a1 1 0 1 1 0 2h-3a1 1 0 0 1-1-1Zm-8-5a3 3 0 1 1 6 0 3 3 0 0 1-6 0Zm1.942 4a3 3 0 0 0-2.847 2.051l-.044.133-.004.012c-.042.126-.055.167-.042.195.006.013.02.023.038.039.032.025.08.064.146.155A1 1 0 0 0 6 17h6a1 1 0 0 0 .811-.415.713.713 0 0 1 .146-.155c.019-.016.031-.026.038-.04.014-.027 0-.068-.042-.194l-.004-.012-.044-.133A3 3 0 0 0 10.059 14H7.942Z" clip-rule="evenodd"/>
        </svg>
      </div>
      <div class="absolute top-40 right-10 w-28 h-36 bg-white/20 rounded-lg transform rotate-12 flex items-center justify-center">
        <svg class="w-14 h-14 text-white/40" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
          <path fill-rule="evenodd" d="M4 4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H4Zm10 5a1 1 0 0 1 1-1h3a1 1 0 1 1 0 2h-3a1 1 0 0 1-1-1Zm0 3a1 1 0 0 1 1-1h3a1 1 0 1 1 0 2h-3a1 1 0 0 1-1-1Zm0 3a1 1 0 0 1 1-1h3a1 1 0 1 1 0 2h-3a1 1 0 0 1-1-1Zm-8-5a3 3 0 1 1 6 0 3 3 0 0 1-6 0Zm1.942 4a3 3 0 0 0-2.847 2.051l-.044.133-.004.012c-.042.126-.055.167-.042.195.006.013.02.023.038.039.032.025.08.064.146.155A1 1 0 0 0 6 17h6a1 1 0 0 0 .811-.415.713.713 0 0 1 .146-.155c.019-.016.031-.026.038-.04.014-.027 0-.068-.042-.194l-.004-.012-.044-.133A3 3 0 0 0 10.059 14H7.942Z" clip-rule="evenodd"/>
        </svg>
      </div>
    </div>

    <!-- Content -->
    <div class="relative p-5 md:p-8 lg:p-12 z-10">
      <h1 class="text-2xl md:text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight">
        My Profile
      </h1>
      <p class="text-white/80 text-base lg:text-lg leading-relaxed max-w-lg">
        View and manage your personal information and account details.
      </p>
    </div>
  </div>

  <!-- Loading State -->
  <div v-if="isLoading" class="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8 animate-pulse">
<<<<<<< HEAD
    <div class="lg:col-span-1 bg-blue-100 rounded-xl p-10 shadow-lg"></div>
=======
    <div class="lg:col-span-1 bg-blue-100 rounded-xl p-10 shadow-lg h-[540px]"></div>
>>>>>>> 0178cc57c10546831414baed2dd038bf444d8d99
    <div class="lg:col-span-2 bg-blue-50 rounded-xl p-10 shadow-lg">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
        <div class="h-12 bg-blue-200 rounded-full"></div>
        <div class="h-12 bg-blue-200 rounded-full"></div>
        <div class="h-12 bg-blue-200 rounded-full"></div>
        <div class="h-12 bg-blue-200 rounded-full"></div>
        <div class="h-12 bg-blue-200 rounded-full"></div>
        <div class="h-12 bg-blue-200 rounded-full"></div>
        <div class="h-12 bg-blue-200 rounded-full"></div>
        <div class="h-12 bg-blue-200 rounded-full"></div>
      </div>
    </div>
  </div>

  <!-- Error State -->
  <div v-else-if="errorMessage" class="bg-red-50 border border-red-200 rounded-lg p-6 text-center max-w-2xl mx-auto mb-8">
    <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
      <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    </div>
    <h3 class="text-lg font-semibold text-red-900 mb-2">Error Loading Profile</h3>
    <p class="text-red-600">{{ errorMessage }}</p>
  </div>

  <!-- Profile Content -->
  <div v-else-if="lecturerProfile" class="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
    <!-- Left Profile Card -->
    <div class="lg:col-span-1">
      <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-10 text-white text-center shadow-lg">
        <img
          :src="avatarUrl"
          :alt="lecturerProfile.fullname"
          class="w-24 h-24 md:w-48 md:h-48 rounded-full mx-auto object-cover border-4 border-white shadow-xl mb-6"
          @error="handleImageError"
        />

        <h2 class="text-3xl font-bold mb-3">{{ lecturerProfile.fullname || 'Lecturer' }}</h2>
        <p class="text-lg md:text-xl font-semibold text-white/95 mb-2">Teacher</p>
        <p class="text-base text-white/80 mb-8 break-words px-2">{{ authStore.user?.email || '-' }}</p>

        <router-link
          to="/lecturer/profile"
          class="inline-block w-full px-8 py-3.5 bg-white text-blue-600 font-semibold text-base rounded-full hover:bg-blue-50 transition-colors shadow-md"
        >
          Edit Profile
        </router-link>

        <button type="button" @click="openChangePassword"
          class="w-full mt-3 px-6 py-3 bg-gradient-to-r from-blue-700 to-indigo-700 text-white font-semibold text-base rounded-full hover:from-blue-800 hover:to-indigo-800 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Change Password
        </button>
      </div>
    </div>

    <!-- Right Details Card -->
    <div class="lg:col-span-2 flex flex-col gap-4 md:gap-6">
      <!-- Personal Information -->
      <ProfileSection title="Personal Information" :default-open="true">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
          <ProfileField label="Full Name" :value="lecturerProfile.fullname" />
          <ProfileField label="Birth Date" :value="formatDate(lecturerProfile.birthdate)" />
          <ProfileField label="Birth Place" :value="lecturerProfile.birthplace" />
          <ProfileField label="Age" :value="calculateAge(lecturerProfile.birthdate)" />
          <ProfileField label="Gender" :value="lecturerProfile.gender" />
          <ProfileField label="Phone" :value="lecturerProfile.phone" />
          <ProfileField label="Address" :value="lecturerProfile.address" :truncate="true" />
          <ProfileField label="Last Education" :value="lecturerProfile.lasteducation" />
        </div>
      </ProfileSection>
    </div>
  </div>

  <!-- Modal Component -->
  <Modal :show="showModal" :type="modalType" :message="modalMessage" @close="closeModal" @confirm="closeModal" />

  <!-- Change Password OTP Flow -->
  <OtpFlow :show="showChangePassword" title="Change Password" :prefill-email="userEmail" :prefill-phone="userPhone"
    @close="closeChangePassword" @success="handleChangePasswordSuccess" />
</template>
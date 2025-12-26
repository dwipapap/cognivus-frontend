<script setup>
import { computed } from 'vue';
import { authStore } from '../../store/auth';
import { useLecturerProfile } from '../../composables/useLecturerProfile';
import LoadingBar from '../../components/ui/LoadingBar.vue';
import iconBoyImage from '../../assets/iconboy.webp';
import iconGirlImage from '../../assets/icongirl.webp';
import { formatDate } from '../../utils/formatters';

const { lecturerProfile, isLoading, errorMessage } = useLecturerProfile();

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
  <!-- Loading State -->
  <div v-if="isLoading" class="max-w-2xl mx-auto py-20">
    <LoadingBar :loading="true" color="blue" :duration="2000" />
    <p class="text-center text-gray-600 mt-4">Loading profile...</p>
  </div>

  <!-- Error State -->
  <div v-else-if="errorMessage" class="bg-red-50 border border-red-200 rounded-2xl p-6 text-center max-w-2xl mx-auto mb-8">
    <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
      <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    </div>
    <h3 class="text-lg font-semibold text-red-900 mb-2">Error Loading Profile</h3>
    <p class="text-red-600">{{ errorMessage }}</p>
  </div>

  <!-- Profile Content -->
  <div v-else-if="lecturerProfile" class="space-y-8 mb-8">
    <!-- Profile Header Card -->
    <div class="relative bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl shadow-lg overflow-hidden">
      <div class="absolute top-0 right-0 w-1/2 h-full pointer-events-none overflow-hidden opacity-20">
        <div class="absolute -top-10 -right-10 w-40 h-48 bg-white rounded-lg transform rotate-12"></div>
        <div class="absolute top-20 -right-5 w-32 h-40 bg-white rounded-lg transform rotate-12"></div>
        <div class="absolute top-40 right-10 w-28 h-36 bg-white rounded-lg transform rotate-12"></div>
      </div>

      <div class="relative p-8 md:p-12 z-10">
        <div class="flex flex-col md:flex-row items-center gap-8">
          <!-- Avatar -->
          <img 
            :src="avatarUrl" 
            :alt="lecturerProfile.fullname"
            class="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-white shadow-xl flex-shrink-0"
            @error="handleImageError"
          />
          
          <!-- Profile Info -->
          <div class="flex-1 text-center md:text-left">
            <h1 class="text-3xl md:text-4xl font-bold text-white mb-3">{{ lecturerProfile.fullname || 'Lecturer' }}</h1>
            <div class="flex flex-wrap gap-3 justify-center md:justify-start mb-4">
              <!-- Education Badge -->
              <div class="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 border border-white/30">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0v6m0-6l4.5-2.5M12 14L7.5 11.5" />
                </svg>
                <span class="text-white font-medium text-sm">{{ lecturerProfile.lasteducation || 'Education Level' }}</span>
              </div>
              
              <!-- Email Badge -->
              <div class="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 border border-white/30">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span class="text-white font-medium text-sm break-all">{{ authStore.user?.email || '-' }}</span>
              </div>
            </div>
            <router-link 
              to="/lecturer/profile"
              class="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 font-semibold rounded-full hover:bg-blue-50 transition-all shadow-md hover:shadow-lg"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Profile
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Profile Details Card -->
    <div class="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-6 md:p-8 shadow-sm">
      <div class="flex items-center gap-3 mb-6">
        <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h2 class="text-xl md:text-2xl font-bold text-gray-900">Personal Information</h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Full Name -->
        <div class="bg-white rounded-xl p-5 shadow-sm border border-blue-100/50">
          <p class="text-sm font-semibold text-blue-600 mb-2 flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Full Name
          </p>
          <p class="text-base font-medium text-gray-900">{{ lecturerProfile.fullname || '-' }}</p>
        </div>

        <!-- Birth Date -->
        <div class="bg-white rounded-xl p-5 shadow-sm border border-blue-100/50">
          <p class="text-sm font-semibold text-blue-600 mb-2 flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Birth Date
          </p>
          <p class="text-base font-medium text-gray-900">{{ formatDate(lecturerProfile.birthdate) }}</p>
        </div>

        <!-- Birth Place -->
        <div class="bg-white rounded-xl p-5 shadow-sm border border-blue-100/50">
          <p class="text-sm font-semibold text-blue-600 mb-2 flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Birth Place
          </p>
          <p class="text-base font-medium text-gray-900">{{ lecturerProfile.birthplace || '-' }}</p>
        </div>

        <!-- Gender -->
        <div class="bg-white rounded-xl p-5 shadow-sm border border-blue-100/50">
          <p class="text-sm font-semibold text-blue-600 mb-2 flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Gender
          </p>
          <p class="text-base font-medium text-gray-900">{{ lecturerProfile.gender || '-' }}</p>
        </div>

        <!-- Phone -->
        <div class="bg-white rounded-xl p-5 shadow-sm border border-blue-100/50">
          <p class="text-sm font-semibold text-blue-600 mb-2 flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            Phone
          </p>
          <p class="text-base font-medium text-gray-900">{{ lecturerProfile.phone || '-' }}</p>
        </div>

        <!-- Address -->
        <div class="bg-white rounded-xl p-5 shadow-sm border border-blue-100/50">
          <p class="text-sm font-semibold text-blue-600 mb-2 flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Address
          </p>
          <p class="text-base font-medium text-gray-900" :title="lecturerProfile.address">{{ lecturerProfile.address || '-' }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

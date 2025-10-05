<script setup>
import { authStore } from '../../store/auth';
import { useLecturerProfile } from '../../composables/useLecturerProfile';

const { lecturerProfile, isLoading, errorMessage } = useLecturerProfile();

/** Handle avatar image loading errors */
const handleImageError = (event) => {
  event.target.src = '/src/assets/kucingterbang.png';
};

/** Format date to DD-MM-YYYY */
const formatDate = (dateString) => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  } catch {
    return dateString;
  }
};
</script>


<template>
  <div class="max-w-full mx-auto px-4 py-8">
    <h1 class="text-4xl font-bold text-gray-900 mb-8">Profile</h1>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center py-20">
      <svg class="w-12 h-12 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>

    <!-- Error State -->
    <div v-else-if="errorMessage" class="bg-red-50 border border-red-200 rounded-xl p-6">
      <p class="text-red-800">{{ errorMessage }}</p>
    </div>

    <!-- Profile Content -->
    <div v-else-if="lecturerProfile" class="bg-white rounded-3xl shadow-xl p-12 lg:p-16">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
        <!-- Left Profile Card -->
        <div class="lg:col-span-1">
          <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl p-12 text-white text-center shadow-lg">
            <img 
              :src="authStore.user?.user_metadata?.avatar_url || '/src/assets/kucingterbang.png'" 
              :alt="lecturerProfile.fullname"
              class="w-48 h-48 rounded-full mx-auto object-cover border-4 border-white shadow-xl mb-6"
              @error="handleImageError"
            />
            
            <h2 class="text-3xl font-bold mb-2">{{ lecturerProfile.fullname || 'Full Name' }}</h2>
            <p class="text-blue-100 text-base mb-1">Lecturer Level</p>
            <p class="text-2xl font-semibold mb-6">{{ lecturerProfile.lasteducation || '-' }}</p>
            <p class="text-base text-blue-100 mb-8">{{ authStore.user?.email || '-' }}</p>

            <router-link 
              to="/lecturer/profile"
              class="inline-block px-10 py-3 bg-white text-blue-600 font-semibold text-base rounded-xl hover:bg-blue-50 transition-colors shadow-md"
            >
              Edit Profile
            </router-link>
          </div>
        </div>

        <!-- Right Details Card -->
        <div class="lg:col-span-2">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
            <!-- Full Name -->
            <div>
              <p class="text-base font-bold text-gray-900 mb-2">Full Name</p>
              <p class="text-lg text-gray-700">{{ lecturerProfile.fullname || '-' }}</p>
            </div>

            <!-- Birth Date -->
            <div>
              <p class="text-base font-bold text-gray-900 mb-2">Birth Date</p>
              <p class="text-lg text-gray-700">{{ formatDate(lecturerProfile.birthdate) }}</p>
            </div>

            <!-- Address -->
            <div>
              <p class="text-base font-bold text-gray-900 mb-2">Address</p>
              <p class="text-lg text-gray-700">{{ lecturerProfile.address || '-' }}</p>
            </div>

            <!-- Place Date -->
            <div>
              <p class="text-base font-bold text-gray-900 mb-2">Place Date</p>
              <p class="text-lg text-gray-700">{{ lecturerProfile.birthplace || '-' }}</p>
            </div>

            <!-- Gender -->
            <div>
              <p class="text-base font-bold text-gray-900 mb-2">Gender</p>
              <p class="text-lg text-gray-700">{{ lecturerProfile.gender || '-' }}</p>
            </div>

            <!-- Phone -->
            <div>
              <p class="text-base font-bold text-gray-900 mb-2">Phone</p>
              <p class="text-lg text-gray-700">{{ lecturerProfile.phone || '-' }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

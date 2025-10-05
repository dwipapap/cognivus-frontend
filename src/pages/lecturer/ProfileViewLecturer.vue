<script setup>
import { authStore } from '../../store/auth';
import { useLecturerProfile } from '../../composables/useLecturerProfile';

const { lecturerProfile, isLoading, errorMessage } = useLecturerProfile();

// Handle image error - fallback to default image
const handleImageError = (event) => {
  event.target.src = '/src/assets/kucingterbang.png';
};

// Format birthdate for display
const formatBirthdate = (dateString) => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return dateString;
  }
};
</script>

<template>
  <!-- Profile Content Card -->

  <!-- Main Profile Card -->
  <div class="text-left">
    <h1 class="text-3xl font-bold text-gray-900 mb-2">Lecturer's Information</h1>
  </div>
  
  <div v-if="lecturerProfile" class="bg-gradient-to-r from-blue-50 to-indigo-100 rounded-2xl p-8 mb-8 shadow-sm">
    
    <!-- Header Section -->
    <div class="bg-gradient-to-r from-blue-50 to-indigo-100 rounded-2xl p-8 mb-8">
    </div>

    <!-- Profile Header with Image -->
    <div class="text-center mb-8">
      <div class="relative inline-block">
        <img 
          :src="authStore.user?.user_metadata?.avatar_url || '/src/assets/kucingterbang.png'" 
          :alt="lecturerProfile.fullname || 'Lecturer Avatar'"
          class="w-32 h-32 rounded-full mx-auto object-cover border-4 border-white shadow-lg"
          @error="handleImageError"
        />
      </div>
      
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white mt-4">
        {{ lecturerProfile.fullname || 'Full Name' }}
      </h2>
      
      <!-- Action Button (Centered) -->
      <div class="flex justify-center mt-6">
        <router-link to="/lecturer/profile" 
                    class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg focus:ring-4 focus:outline-none focus:ring-blue-300">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
          </svg>
          Update Data
        </router-link>
      </div>
    </div>

    <!-- Lecturer Profile Information -->
    <div class="mt-8">
      <div class="bg-white/60 dark:bg-gray-900/50 backdrop-blur-lg border border-white/20 rounded-2xl p-8 shadow-lg">
        <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center">Lecturer Profile</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 max-w-4xl mx-auto">
          <!-- Left Column -->
          <div class="space-y-5">
            <!-- Gender -->
            <div>
              <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Gender</dt>
              <dd class="mt-1 text-base font-semibold text-gray-900 dark:text-white">{{ lecturerProfile.gender || '-' }}</dd>
            </div>

            <!-- Email -->
            <div>
              <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Email</dt>
              <dd class="mt-1 text-base font-semibold text-gray-900 dark:text-white">{{ authStore.user?.email || '-' }}</dd>
            </div>

            <!-- Phone Number -->
            <div>
              <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Phone Number</dt>
              <dd class="mt-1 text-base font-semibold text-gray-900 dark:text-white">{{ lecturerProfile.phone || '-' }}</dd>
            </div>

            <!-- Birthplace -->
            <div>
              <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Birth Place</dt>
              <dd class="mt-1 text-base font-semibold text-gray-900 dark:text-white">{{ lecturerProfile.birthplace || '-' }}</dd>
            </div>
          </div>

          <!-- Right Column -->
          <div class="space-y-5">
            <!-- Birthdate -->
            <div>
              <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Birth Date</dt>
              <dd class="mt-1 text-base font-semibold text-gray-900 dark:text-white">{{ formatBirthdate(lecturerProfile.birthdate) }}</dd>
            </div>

            <!-- Last Education -->
            <div>
              <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Last Education</dt>
              <dd class="mt-1 text-base font-semibold text-gray-900 dark:text-white">{{ lecturerProfile.lasteducation || '-' }}</dd>
            </div>

            <!-- Address -->
            <div>
              <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Address</dt>
              <dd class="mt-1 text-base font-semibold text-gray-900 dark:text-white whitespace-pre-line">{{ lecturerProfile.address || '-' }}</dd>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Loading State -->
  <div v-if="isLoading" class="bg-white/60 dark:bg-gray-800/50 backdrop-blur-sm border border-white/10 rounded-2xl p-8 shadow-lg">
    <div class="text-center">
      <div role="status">
        <svg aria-hidden="true" class="inline w-8 h-8 mr-2 text-gray-200 animate-spin fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
          <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
        </svg>
        <span class="sr-only">Loading...</span>
      </div>
    </div>
  </div>

  <!-- Error State -->
  <div v-else-if="errorMessage" class="bg-white/60 dark:bg-gray-800/50 backdrop-blur-sm border border-white/10 rounded-2xl p-8 shadow-lg">
    <div class="flex items-center p-4 text-sm text-red-800 rounded-lg bg-red-50" role="alert">
      <svg class="flex-shrink-0 inline w-4 h-4 mr-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"/>
      </svg>
      <span class="sr-only">Error</span>
      <div>{{ errorMessage }}</div>
    </div>
  </div>
</template>

<style scoped>
/* Maintain text format for address if there are line breaks */
.whitespace-pre-line {
  white-space: pre-line;
}
</style>
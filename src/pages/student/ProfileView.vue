<script setup>
import { ref, watchEffect } from 'vue';
import { authStore } from '../../store/auth';
import { useStudentProfile } from '../../composables/useStudentProfile';
import { classAPI, levelAPI } from '../../services/api';

const { studentProfile, isLoading, errorMessage } = useStudentProfile();
const classCode = ref('-');
const levelName = ref('-');

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

/** Fetch class and level data */
watchEffect(async () => {
  if (studentProfile.value?.classid) {
    try {
      const classRes = await classAPI.getClassById(studentProfile.value.classid);
      if (classRes.data.success) {
        classCode.value = classRes.data.data.class_code || '-';
        
        // Fetch level name
        if (classRes.data.data.levelid) {
          const levelRes = await levelAPI.getLevelById(classRes.data.data.levelid);
          if (levelRes.data.success) {
            levelName.value = levelRes.data.data.name || '-';
          }
        }
      }
    } catch (error) {
      console.error('Error fetching class data:', error);
    }
  }
});
</script>


<template>
  <div class="w-full px-4 py-8">
    <h1 class="text-5xl font-bold mb-10">Profile</h1>

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
      <div v-else-if="studentProfile" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Left Profile Card -->
        <div class="lg:col-span-1">
              <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl p-10 text-white text-center shadow-lg h-full flex flex-col justify-between">
                <img 
                  :src="authStore.user?.user_metadata?.avatar_url || '/src/assets/kucingterbang.png'" 
                  :alt="studentProfile.fullname"
                  class="w-48 h-48 rounded-full mx-auto object-cover border-4 border-white shadow-xl mb-6"
                  @error="handleImageError"
                />
                
                <h2 class="text-3xl font-bold mb-3">{{ studentProfile.fullname || 'Student' }}</h2>
                <p class="text-base text-white/90 mb-2">{{ levelName }}</p>
                <p class="text-2xl font-semibold mb-4">{{ classCode }}</p>
                <p class="text-base text-white/80 mb-8 break-words px-2">{{ authStore.user?.email || '-' }}</p>

                <router-link 
                  to="/student/profile"
                  class="inline-block w-full px-8 py-3.5 bg-white text-blue-600 font-semibold text-base rounded-full hover:bg-blue-50 transition-colors shadow-md"
                >
                  Edit Profile
                </router-link>
              </div>
            </div>

            <!-- Right Details Card -->
            <div class="lg:col-span-2">
              <div class="bg-blue-50 rounded-3xl p-10 shadow-lg h-full">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                  <!-- Full Name -->
                  <div>
                    <p class="text-base font-bold text-blue-600 mb-3">Full Name</p>
                    <div class="bg-blue-200 rounded-full px-6 py-3">
                      <p class="text-base font-medium text-gray-900">{{ studentProfile.fullname || '-' }}</p>
                    </div>
                  </div>

                  <!-- Birth Date -->
                  <div>
                    <p class="text-base font-bold text-blue-600 mb-3">Birth Date</p>
                    <div class="bg-blue-200 rounded-full px-6 py-3">
                      <p class="text-base font-medium text-gray-900">{{ formatDate(studentProfile.birthdate) }}</p>
                    </div>
                  </div>

                  <!-- Address -->
                  <div>
                    <p class="text-base font-bold text-blue-600 mb-3">Address</p>
                    <div class="bg-blue-200 rounded-full px-6 py-3">
                      <p class="text-base font-medium text-gray-900 truncate" :title="studentProfile.address">{{ studentProfile.address || '-' }}</p>
                    </div>
                  </div>

                  <!-- Place Date -->
                  <div>
                    <p class="text-base font-bold text-blue-600 mb-3">Place Date</p>
                    <div class="bg-blue-200 rounded-full px-6 py-3">
                      <p class="text-base font-medium text-gray-900">{{ studentProfile.birthplace || '-' }}</p>
                    </div>
                  </div>

                  <!-- Gender -->
                  <div>
                    <p class="text-base font-bold text-blue-600 mb-3">Gender</p>
                    <div class="bg-blue-200 rounded-full px-6 py-3">
                      <p class="text-base font-medium text-gray-900">{{ studentProfile.gender || '-' }}</p>
                    </div>
                  </div>

                  <!-- Phone -->
                  <div>
                    <p class="text-base font-bold text-blue-600 mb-3">Phone</p>
                    <div class="bg-blue-200 rounded-full px-6 py-3">
                      <p class="text-base font-medium text-gray-900">{{ studentProfile.phone || '-' }}</p>
                    </div>
                  </div>

                  <!-- Parent Name -->
                  <div>
                    <p class="text-base font-bold text-blue-600 mb-3">Parent Name</p>
                    <div class="bg-blue-200 rounded-full px-6 py-3">
                      <p class="text-base font-medium text-gray-900">{{ studentProfile.parentname || '-' }}</p>
                    </div>
                  </div>

                  <!-- Parent Phone -->
                  <div>
                    <p class="text-base font-bold text-blue-600 mb-3">Parent Phone</p>
                    <div class="bg-blue-200 rounded-full px-6 py-3">
                      <p class="text-base font-medium text-gray-900">{{ studentProfile.parentphone || '-' }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
      </div>
</template>

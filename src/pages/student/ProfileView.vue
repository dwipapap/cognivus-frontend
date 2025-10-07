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
    <div v-else-if="studentProfile" class="bg-white rounded-3xl shadow-xl p-12 lg:p-16">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
        <!-- Left Profile Card -->
        <div class="lg:col-span-1">
          <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl p-12 text-white text-center shadow-lg">
            <img 
              :src="authStore.user?.user_metadata?.avatar_url || '/src/assets/kucingterbang.png'" 
              :alt="studentProfile.fullname"
              class="w-48 h-48 rounded-full mx-auto object-cover border-4 border-white shadow-xl mb-6"
              @error="handleImageError"
            />
            
            <h2 class="text-3xl font-bold mb-2">{{ studentProfile.fullname || 'Full Name' }}</h2>
            <p class="text-blue-100 text-base mb-1">{{ levelName }}</p>
            <p class="text-2xl font-semibold mb-6">{{ classCode }}</p>
            <p class="text-base text-blue-100 mb-8">{{ authStore.user?.email || '-' }}</p>

            <router-link 
              to="/student/profile"
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
              <p class="text-lg text-gray-700">{{ studentProfile.fullname || '-' }}</p>
            </div>

            <!-- Birth Date -->
            <div>
              <p class="text-base font-bold text-gray-900 mb-2">Birth Date</p>
              <p class="text-lg text-gray-700">{{ formatDate(studentProfile.birthdate) }}</p>
            </div>

            <!-- Address -->
            <div>
              <p class="text-base font-bold text-gray-900 mb-2">Address</p>
              <p class="text-lg text-gray-700">{{ studentProfile.address || '-' }}</p>
            </div>

            <!-- Place Date -->
            <div>
              <p class="text-base font-bold text-gray-900 mb-2">Place Date</p>
              <p class="text-lg text-gray-700">{{ studentProfile.birthplace || '-' }}</p>
            </div>

            <!-- Gender -->
            <div>
              <p class="text-base font-bold text-gray-900 mb-2">Gender</p>
              <p class="text-lg text-gray-700">{{ studentProfile.gender || '-' }}</p>
            </div>

            <!-- Phone -->
            <div>
              <p class="text-base font-bold text-gray-900 mb-2">Phone</p>
              <p class="text-lg text-gray-700">{{ studentProfile.phone || '-' }}</p>
            </div>

            <!-- Parent Name -->
            <div>
              <p class="text-base font-bold text-gray-900 mb-2">Parent Name</p>
              <p class="text-lg text-gray-700">{{ studentProfile.parentname || '-' }}</p>
            </div>

            <!-- Parent Phone -->
            <div>
              <p class="text-base font-bold text-gray-900 mb-2">Parent Phone</p>
              <p class="text-lg text-gray-700">{{ studentProfile.parentphone || '-' }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

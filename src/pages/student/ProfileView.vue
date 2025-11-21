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
  event.target.src = 'https://media1.tenor.com/m/JyHMlpMxRKwAAAAC/arisbm.gif';
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
  <!-- Welcome Banner -->
  <div class="relative bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 rounded-3xl shadow-lg mb-8 overflow-hidden">
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
      <!-- Loading State -->
    <div v-if="loading" class="max-w-2xl mx-auto py-20">
      <LoadingBar :loading="true" color="blue" :duration="2000" />
      <p class="text-center text-gray-600 mt-4">Loading profile...</p>
    </div>

      <!-- Error State -->
      <div v-else-if="errorMessage" class="bg-red-50 border border-red-200 rounded-xl p-6">
        <p class="text-red-800">{{ errorMessage }}</p>
      </div>

      <!-- Profile Content -->
      <div v-else-if="studentProfile" class="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
        <!-- Left Profile Card -->
        <div class="lg:col-span-1">
              <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl p-10 text-white text-center shadow-lg h-full flex flex-col justify-between">
                <img 
                  :src="authStore.user?.user_metadata?.avatar_url || 'https://media1.tenor.com/m/JyHMlpMxRKwAAAAC/arisbm.gif'" 
                  :alt="studentProfile.fullname"
                  class="w-24 h-24 md:w-48 md:h-48 rounded-full mx-auto object-cover border-4 border-white shadow-xl mb-6"
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
</template>

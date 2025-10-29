<script setup>
import { ref, onMounted, nextTick } from 'vue';
import apiClient from '../services/api';
import { authStore } from '../store/auth';
import { useRouter } from 'vue-router';
import Modal from '../components/ui/Modal.vue';

const router = useRouter();

// Gender mapping helper
const mapGenderToBackend = (frontendGender) => {
  if (frontendGender === 'Laki-laki') return 'L';
  if (frontendGender === 'Perempuan') return 'P';
  return frontendGender; // Already in backend format
};

const isLoading = ref(true);
const isSubmitting = ref(false);
const showModal = ref(false);
const modalType = ref('info');
const modalMessage = ref('');
const modalRef = ref(null);

// Form data - includes username and password fields
const formData = ref({
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
});

// Validation errors
const errors = ref({});

// Gender options for select
const genderOptions = [
  { value: 'Laki-laki', label: 'Laki-laki' },
  { value: 'Perempuan', label: 'Perempuan' }
];

// Validation
const validateForm = () => {
  errors.value = {};
  
  // Username validation
  if (!formData.value.username || formData.value.username.trim().length < 3) {
    errors.value.username = 'Username must be at least 3 characters';
  }
  
  // Password validation
  if (!formData.value.password || formData.value.password.length < 6) {
    errors.value.password = 'Password must be at least 6 characters';
  }
  
  if (formData.value.password !== formData.value.confirmPassword) {
    errors.value.confirmPassword = 'Passwords do not match';
  }
  
  // Profile validations (same as Profile.vue)
  if (!formData.value.fullname || formData.value.fullname.trim().length < 2) {
    errors.value.fullname = 'Full name must be at least 2 characters';
  }
  
  if (!formData.value.gender) {
    errors.value.gender = 'Gender is required';
  }
  
  if (!formData.value.address || formData.value.address.trim().length === 0) {
    errors.value.address = 'Address is required';
  }
  
  if (!formData.value.phone || !/^08\d{8,11}$/.test(formData.value.phone)) {
    errors.value.phone = 'Phone must start with 08 and have 10-13 digits';
  }
  
  if (!formData.value.parentname || formData.value.parentname.trim().length === 0) {
    errors.value.parentname = 'Parent name is required';
  }
  
  if (formData.value.parentphone && !/^08\d{8,11}$/.test(formData.value.parentphone)) {
    errors.value.parentphone = 'Parent phone must start with 08 and have 10-13 digits';
  }
  
  return Object.keys(errors.value).length === 0;
};

const fetchProfile = async () => {
  const userId = authStore.user?.id;
  if (!userId) {
    modalType.value = 'error';
    modalMessage.value = "User not authenticated.";
    openModal();
    isLoading.value = false;
    return;
  }

  try {
    const response = await apiClient.get(`/students/${userId}`);
    if (response.data.success) {
      // Assign backend data to form (excluding password fields)
      const studentData = response.data.data;
      Object.keys(studentData).forEach(key => {
        if (key in formData.value && key !== 'password' && key !== 'confirmPassword') {
          formData.value[key] = studentData[key];
        }
      });
      
      // Pre-fill username from auth store if available
      if (authStore.user?.username) {
        formData.value.username = authStore.user.username;
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
  // Validate form
  if (!validateForm()) {
    return;
  }
  
  isSubmitting.value = true;
  
  try {
    const userId = formData.value.userid || authStore.user?.id;
    
    if (!userId) {
      throw new Error('Cannot update profile: User ID not found.');
    }
    
    // Step 1: Update user credentials (username and password)
    const userUpdateData = {
      username: formData.value.username,
      password: formData.value.password
    };
    
    await apiClient.put(`/users/${userId}`, userUpdateData);
    
    // Step 2: Update student profile
    const studentUpdateData = {
      fullname: formData.value.fullname,
      gender: mapGenderToBackend(formData.value.gender),
      address: formData.value.address,
      phone: formData.value.phone,
      parentname: formData.value.parentname,
      parentphone: formData.value.parentphone,
      birthdate: formData.value.birthdate,
      birthplace: formData.value.birthplace
    };
    
    const response = await apiClient.put(`/students/${userId}`, studentUpdateData);
    
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
  } finally {
    isSubmitting.value = false;
  }
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

onMounted(fetchProfile);
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-cyan-400 flex items-center justify-center px-4 py-8">
    <div class="w-full max-w-5xl">
      <div class="bg-white/95 backdrop-blur-md rounded-3xl p-10 shadow-2xl">
        <h1 class="text-4xl font-bold text-gray-900 mb-3 text-center">Complete Your Profile</h1>
        <p class="text-gray-600 text-center mb-8">Welcome! Please set up your account and complete your profile information.</p>

        <!-- Loading State -->
        <div v-if="isLoading" class="flex items-center justify-center py-20">
          <svg class="w-12 h-12 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>

        <!-- Form Content -->
        <div v-else>
          <form @submit.prevent="handleCompleteProfile">
            <!-- Account Credentials Section -->
            <div class="bg-blue-50 rounded-3xl p-8 mb-8">
              <h2 class="text-2xl font-bold text-blue-600 mb-6">Account Credentials</h2>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <!-- Username -->
                <div>
                  <label class="block text-base font-bold text-blue-600 mb-3">Username *</label>
                  <input
                    v-model="formData.username"
                    type="text"
                    placeholder="Choose a username"
                    class="w-full bg-white rounded-full px-6 py-3 text-base font-medium text-gray-900 border border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-colors"
                    required
                  />
                  <p v-if="errors.username" class="mt-2 text-sm text-red-600">{{ errors.username }}</p>
                </div>

                <div></div>

                <!-- Password -->
                <div>
                  <label class="block text-base font-bold text-blue-600 mb-3">Password *</label>
                  <input
                    v-model="formData.password"
                    type="password"
                    placeholder="Minimum 6 characters"
                    class="w-full bg-white rounded-full px-6 py-3 text-base font-medium text-gray-900 border border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-colors"
                    required
                  />
                  <p v-if="errors.password" class="mt-2 text-sm text-red-600">{{ errors.password }}</p>
                </div>

                <!-- Confirm Password -->
                <div>
                  <label class="block text-base font-bold text-blue-600 mb-3">Confirm Password *</label>
                  <input
                    v-model="formData.confirmPassword"
                    type="password"
                    placeholder="Re-enter password"
                    class="w-full bg-white rounded-full px-6 py-3 text-base font-medium text-gray-900 border border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-colors"
                    required
                  />
                  <p v-if="errors.confirmPassword" class="mt-2 text-sm text-red-600">{{ errors.confirmPassword }}</p>
                </div>
              </div>
            </div>

            <!-- Personal Information Section -->
            <div class="bg-purple-50 rounded-3xl p-8">
              <h2 class="text-2xl font-bold text-purple-600 mb-6">Personal Information</h2>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <!-- Full Name -->
                <div>
                  <label class="block text-base font-bold text-purple-600 mb-3">Full Name *</label>
                  <input
                    v-model="formData.fullname"
                    type="text"
                    placeholder="Full Name"
                    class="w-full bg-white rounded-full px-6 py-3 text-base font-medium text-gray-900 border border-purple-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 focus:outline-none transition-colors"
                    required
                  />
                  <p v-if="errors.fullname" class="mt-2 text-sm text-red-600">{{ errors.fullname }}</p>
                </div>

                <!-- Birth Date -->
                <div>
                  <label class="block text-base font-bold text-purple-600 mb-3">Birth Date</label>
                  <input
                    v-model="formData.birthdate"
                    type="date"
                    class="w-full bg-white rounded-full px-6 py-3 text-base font-medium text-gray-900 border border-purple-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 focus:outline-none transition-colors"
                  />
                  <p v-if="errors.birthdate" class="mt-2 text-sm text-red-600">{{ errors.birthdate }}</p>
                </div>

                <!-- Address -->
                <div>
                  <label class="block text-base font-bold text-purple-600 mb-3">Address *</label>
                  <input
                    v-model="formData.address"
                    type="text"
                    placeholder="Complete address"
                    class="w-full bg-white rounded-full px-6 py-3 text-base font-medium text-gray-900 border border-purple-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 focus:outline-none transition-colors"
                    required
                  />
                  <p v-if="errors.address" class="mt-2 text-sm text-red-600">{{ errors.address }}</p>
                </div>

                <!-- Birth Place -->
                <div>
                  <label class="block text-base font-bold text-purple-600 mb-3">Birth Place</label>
                  <input
                    v-model="formData.birthplace"
                    type="text"
                    placeholder="Birth Place"
                    class="w-full bg-white rounded-full px-6 py-3 text-base font-medium text-gray-900 border border-purple-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 focus:outline-none transition-colors"
                  />
                  <p v-if="errors.birthplace" class="mt-2 text-sm text-red-600">{{ errors.birthplace }}</p>
                </div>

                <!-- Gender -->
                <div>
                  <label class="block text-base font-bold text-purple-600 mb-3">Gender *</label>
                  <select
                    v-model="formData.gender"
                    class="w-full bg-white rounded-full px-6 py-3 text-base font-medium text-gray-900 border border-purple-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 focus:outline-none transition-colors"
                    required
                  >
                    <option value="" disabled>Select Gender</option>
                    <option v-for="option in genderOptions" :key="option.value" :value="option.value">
                      {{ option.label }}
                    </option>
                  </select>
                  <p v-if="errors.gender" class="mt-2 text-sm text-red-600">{{ errors.gender }}</p>
                </div>

                <!-- Phone -->
                <div>
                  <label class="block text-base font-bold text-purple-600 mb-3">Phone *</label>
                  <input
                    v-model="formData.phone"
                    type="tel"
                    placeholder="08xxxxxxxxxx"
                    class="w-full bg-white rounded-full px-6 py-3 text-base font-medium text-gray-900 border border-purple-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 focus:outline-none transition-colors"
                    required
                  />
                  <p v-if="errors.phone" class="mt-2 text-sm text-red-600">{{ errors.phone }}</p>
                </div>

                <!-- Parent Name -->
                <div>
                  <label class="block text-base font-bold text-purple-600 mb-3">Parent Name *</label>
                  <input
                    v-model="formData.parentname"
                    type="text"
                    placeholder="Parent Name"
                    class="w-full bg-white rounded-full px-6 py-3 text-base font-medium text-gray-900 border border-purple-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 focus:outline-none transition-colors"
                    required
                  />
                  <p v-if="errors.parentname" class="mt-2 text-sm text-red-600">{{ errors.parentname }}</p>
                </div>

                <!-- Parent Phone -->
                <div>
                  <label class="block text-base font-bold text-purple-600 mb-3">Parent Phone</label>
                  <input
                    v-model="formData.parentphone"
                    type="tel"
                    placeholder="08xxxxxxxxxx"
                    class="w-full bg-white rounded-full px-6 py-3 text-base font-medium text-gray-900 border border-purple-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 focus:outline-none transition-colors"
                  />
                  <p v-if="errors.parentphone" class="mt-2 text-sm text-red-600">{{ errors.parentphone }}</p>
                </div>
              </div>
            </div>

            <!-- Action Button -->
            <div class="flex justify-center mt-8">
              <button
                type="submit"
                class="px-12 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg rounded-full hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="isSubmitting"
              >
                <span v-if="isSubmitting">Completing Profile...</span>
                <span v-else>Complete Profile & Continue</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal Component -->
    <Modal
      :show="showModal"
      :type="modalType"
      :message="modalMessage"
      @close="closeModal"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { studentAPI, userAPI } from '../services/api';
import { authStore } from '../store/auth';
import { useRouter } from 'vue-router';
import { useForm } from '../composables/useForm';
import Modal from '../components/ui/Modal.vue';
import LoadingBar from '../components/ui/LoadingBar.vue';
import BaseInput from '../components/form/BaseInput.vue';
import BaseSelect from '../components/form/BaseSelect.vue';
import BaseButton from '../components/ui/BaseButton.vue';

const router = useRouter();

// Gender mapping helper
const mapGenderToBackend = (frontendGender) => {
  if (frontendGender === 'Male') return 'L';
  if (frontendGender === 'Female') return 'P';
  return frontendGender; // Already in backend format
};

const isLoading = ref(true);
const showModal = ref(false);
const modalType = ref('info');
const modalMessage = ref('');

// Gender options for select
const genderOptions = [
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' }
];

const { formData, errors, isSubmitting, submit, getFieldProps, reset, validate } = useForm(
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
    const response = await studentAPI.getStudentById(userId);
    if (response.data.success) {
      // Assign backend data to form (excluding password fields)
      const studentData = response.data.data;
      Object.keys(studentData).forEach(key => {
        if (key in formData && key !== 'password' && key !== 'confirmPassword') {
          formData[key] = studentData[key];
        }
      });
      
      // Pre-fill username from auth store if available
      if (authStore.user?.username) {
        formData.username = authStore.user.username;
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
      
      // Step 2: Update student profile
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

onMounted(fetchProfile);
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-cyan-400 flex items-center justify-center px-4 py-8">
    <div class="w-full max-w-5xl">
      <div class="bg-white/95 backdrop-blur-md rounded-3xl p-10 shadow-2xl">
        <h1 class="text-4xl font-bold text-gray-900 mb-3 text-center">Complete Your Profile</h1>
        <p class="text-gray-600 text-center mb-8">Welcome! Please set up your account and complete your profile information.</p>

        <!-- Loading State -->
        <div v-if="isLoading" class="max-w-2xl mx-auto py-20">
          <LoadingBar :loading="true" color="blue" :duration="2000" />
          <p class="text-center text-gray-600 mt-4">Loading...</p>
        </div>

        <!-- Form Content -->
        <div v-else>
          <form @submit.prevent="handleCompleteProfile">
            <!-- Account Credentials Section -->
            <div class="bg-blue-50 rounded-3xl p-8 mb-8">
              <h2 class="text-2xl font-bold text-blue-600 mb-6">Account Credentials</h2>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <!-- Username -->
                <BaseInput
                  v-bind="getFieldProps('username')"
                  label="Username"
                  required
                  placeholder="Choose a username"
                />

                <div></div>

                <!-- Password -->
                <BaseInput
                  v-bind="getFieldProps('password')"
                  type="password"
                  label="Password"
                  required
                  placeholder="Minimum 6 characters"
                />

                <!-- Confirm Password -->
                <BaseInput
                  v-bind="getFieldProps('confirmPassword')"
                  type="password"
                  label="Confirm Password"
                  required
                  placeholder="Re-enter password"
                />
              </div>
            </div>

            <!-- Personal Information Section -->
            <div class="bg-purple-50 rounded-3xl p-8">
              <h2 class="text-2xl font-bold text-purple-600 mb-6">Personal Information</h2>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <!-- Full Name -->
                <BaseInput
                  v-bind="getFieldProps('fullname')"
                  label="Full Name"
                  required
                  placeholder="Full Name"
                />

                <!-- Birth Date -->
                <BaseInput
                  v-bind="getFieldProps('birthdate')"
                  type="date"
                  label="Birth Date"
                />

                <!-- Address -->
                <BaseInput
                  v-bind="getFieldProps('address')"
                  label="Address"
                  required
                  placeholder="Complete address"
                />

                <!-- Birth Place -->
                <BaseInput
                  v-bind="getFieldProps('birthplace')"
                  label="Birth Place"
                  placeholder="Birth Place"
                />

                <!-- Gender -->
                <BaseSelect
                  v-bind="getFieldProps('gender')"
                  label="Gender"
                  required
                  :options="genderOptions"
                  placeholder="Select Gender"
                />

                <!-- Phone -->
                <BaseInput
                  v-bind="getFieldProps('phone')"
                  type="tel"
                  label="Phone"
                  required
                  placeholder="08xxxxxxxxxx"
                />

                <!-- Parent Name -->
                <BaseInput
                  v-bind="getFieldProps('parentname')"
                  label="Parent Name"
                  required
                  placeholder="Parent Name"
                />

                <!-- Parent Phone -->
                <BaseInput
                  v-bind="getFieldProps('parentphone')"
                  type="tel"
                  label="Parent Phone"
                  placeholder="08xxxxxxxxxx"
                />
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

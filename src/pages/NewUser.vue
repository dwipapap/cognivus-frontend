<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { studentAPI, userAPI } from '../services/api';
import { authStore } from '../store/auth';
import { useRouter } from 'vue-router';
import { useForm } from '../composables/useForm';
import Modal from '../components/ui/Modal.vue';
import LoadingBar from '../components/ui/LoadingBar.vue';

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
      
      // Step 2: Check if student record exists first
      let studentExists = false;
      try {
        const checkResponse = await studentAPI.getStudentById(userId);
        // Backend returns array, check if it has data
        studentExists = checkResponse.data.success && checkResponse.data.data && checkResponse.data.data.length > 0;
      } catch (checkError) {
        console.log('Student check error:', checkError);
        studentExists = false;
      }
      
      // Step 3: Update or create student profile
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
      
      let response;
      if (studentExists) {
        // Update existing student record
        response = await studentAPI.updateStudent(userId, studentUpdateData);
      } else {
        // Create new student record if it doesn't exist
        response = await studentAPI.createStudent({
          ...studentUpdateData,
          userid: userId,
          classid: 4 // Default class
        });
      }
      
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
  <div class="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-blue-400 flex items-center justify-center p-4 font-sans">
    <!-- Loading State -->
    <div v-if="isLoading" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div class="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full">
            <LoadingBar :loading="true" color="blue" :duration="2000" />
            <p class="text-center text-gray-600 mt-4 font-medium">Loading profile data...</p>
        </div>
    </div>

    <!-- Main Card -->
    <div v-else class="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden">
      
      <!-- Form -->
      <div class="w-full p-6 md:p-8 bg-blue-50/30 flex flex-col justify-center">
        <div class="max-w-3xl mx-auto w-full">
          <!-- Header -->
          <div class="text-center mb-6">
            <h1 class="text-3xl font-bold text-gray-900 mb-2">Complete Your Profile</h1>
            <p class="text-gray-600 text-sm">Set up your account and profile information</p>
          </div>

          <form @submit.prevent="handleCompleteProfile" class="space-y-6">
            <!-- Personal Information Section -->
            <div>
              <h2 class="text-lg font-semibold text-blue-600 mb-4">Personal Information</h2>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- Full Name -->
                <div class="md:col-span-2">
                  <label class="block text-sm font-medium text-gray-900 mb-2">
                    Full Name <span class="text-red-500">*</span>
                  </label>
                  <input 
                    v-model="formData.fullname"
                    @blur="validateSingleField('fullname')"
                    type="text" 
                    placeholder="Enter your full name"
                    class="block w-full !bg-white px-4 py-2.5 text-gray-900 placeholder-gray-400 border rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    :class="errors.fullname ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'"
                  >
                  <p v-if="errors.fullname" class="text-red-600 text-xs mt-1.5">{{ errors.fullname }}</p>
                </div>

                <!-- Birth Date -->
                <div class="col-span-1">
                  <label class="block text-sm font-medium text-gray-900 mb-2">Birth Date</label>
                  <input 
                    v-model="formData.birthdate"
                    @blur="validateSingleField('birthdate')"
                    type="date" 
                    class="block w-full !bg-white px-4 py-2.5 text-gray-900 border rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    :class="errors.birthdate ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'"
                  >
                  <p v-if="errors.birthdate" class="text-red-600 text-xs mt-1.5">{{ errors.birthdate }}</p>
                </div>

                <!-- Birth Place -->
                <div class="col-span-1">
                  <label class="block text-sm font-medium text-gray-900 mb-2">Birth Place</label>
                  <input 
                    v-model="formData.birthplace"
                    @blur="validateSingleField('birthplace')"
                    type="text" 
                    placeholder="City"
                    class="block w-full !bg-white px-4 py-2.5 text-gray-900 placeholder-gray-400 border rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    :class="errors.birthplace ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'"
                  >
                  <p v-if="errors.birthplace" class="text-red-600 text-xs mt-1.5">{{ errors.birthplace }}</p>
                </div>

                <!-- Address -->
                <div class="md:col-span-2">
                  <label class="block text-sm font-medium text-gray-900 mb-2">
                    Address <span class="text-red-500">*</span>
                  </label>
                  <input 
                    v-model="formData.address"
                    @blur="validateSingleField('address')"
                    type="text" 
                    placeholder="Complete address"
                    class="block w-full !bg-white px-4 py-2.5 text-gray-900 placeholder-gray-400 border rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    :class="errors.address ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'"
                  >
                  <p v-if="errors.address" class="text-red-600 text-xs mt-1.5">{{ errors.address }}</p>
                </div>

                <!-- Gender -->
                <div class="col-span-1">
                  <label class="block text-sm font-medium text-gray-900 mb-2">
                    Gender <span class="text-red-500">*</span>
                  </label>
                  <div class="relative">
                    <select 
                      v-model="formData.gender"
                      @blur="validateSingleField('gender')"
                      class="block w-full !bg-white px-4 py-2.5 text-gray-900 border rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                      :class="errors.gender ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'"
                    >
                      <option value="" disabled>Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                    <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-gray-500">
                      <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                  </div>
                  <p v-if="errors.gender" class="text-red-600 text-xs mt-1.5">{{ errors.gender }}</p>
                </div>

                <!-- Phone -->
                <div class="col-span-1">
                  <label class="block text-sm font-medium text-gray-900 mb-2">
                    Phone <span class="text-red-500">*</span>
                  </label>
                  <input 
                    v-model="formData.phone"
                    @blur="validateSingleField('phone')"
                    type="tel" 
                    placeholder="08xxxxxxxxx"
                    class="block w-full !bg-white px-4 py-2.5 text-gray-900 placeholder-gray-400 border rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    :class="errors.phone ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'"
                  >
                  <p v-if="errors.phone" class="text-red-600 text-xs mt-1.5">{{ errors.phone }}</p>
                </div>

                <!-- Parent Name -->
                <div class="col-span-1">
                  <label class="block text-sm font-medium text-gray-900 mb-2">
                    Parent Name <span class="text-red-500">*</span>
                  </label>
                  <input 
                    v-model="formData.parentname"
                    @blur="validateSingleField('parentname')"
                    type="text" 
                    placeholder="Parent's full name"
                    class="block w-full !bg-white px-4 py-2.5 text-gray-900 placeholder-gray-400 border rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    :class="errors.parentname ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'"
                  >
                  <p v-if="errors.parentname" class="text-red-600 text-xs mt-1.5">{{ errors.parentname }}</p>
                </div>

                <!-- Parent Phone -->
                <div class="col-span-1">
                  <label class="block text-sm font-medium text-gray-900 mb-2">Parent Phone</label>
                  <input 
                    v-model="formData.parentphone"
                    @blur="validateSingleField('parentphone')"
                    type="tel" 
                    placeholder="08xxxxxxxxx"
                    class="block w-full !bg-white px-4 py-2.5 text-gray-900 placeholder-gray-400 border rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    :class="errors.parentphone ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'"
                  >
                  <p v-if="errors.parentphone" class="text-red-600 text-xs mt-1.5">{{ errors.parentphone }}</p>
                </div>
              </div>
            </div>

            <!-- Account Credentials Section -->
            <div>
              <h2 class="text-lg font-semibold text-blue-600 mb-4">Account Credentials</h2>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- Username -->
                <div class="md:col-span-2">
                  <label class="block text-sm font-medium text-gray-900 mb-2">
                    Username <span class="text-red-500">*</span>
                  </label>
                  <input 
                    v-model="formData.username"
                    @blur="validateSingleField('username')"
                    type="text" 
                    placeholder="Choose a username"
                    class="block w-full !bg-white px-4 py-2.5 text-gray-900 placeholder-gray-400 border rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    :class="errors.username ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'"
                  >
                  <p v-if="errors.username" class="text-red-600 text-xs mt-1.5">{{ errors.username }}</p>
                </div>

                <!-- Password -->
                <div class="col-span-1">
                  <label class="block text-sm font-medium text-gray-900 mb-2">
                    Password <span class="text-red-500">*</span>
                  </label>
                  <input 
                    v-model="formData.password"
                    @blur="validateSingleField('password')"
                    type="password" 
                    placeholder="Min. 6 characters"
                    class="block w-full !bg-white px-4 py-2.5 text-gray-900 placeholder-gray-400 border rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    :class="errors.password ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'"
                  >
                  <p v-if="errors.password" class="text-red-600 text-xs mt-1.5">{{ errors.password }}</p>
                </div>

                <!-- Confirm Password -->
                <div class="col-span-1">
                  <label class="block text-sm font-medium text-gray-900 mb-2">
                    Confirm Password <span class="text-red-500">*</span>
                  </label>
                  <input 
                    v-model="formData.confirmPassword"
                    @blur="validateSingleField('confirmPassword')"
                    type="password" 
                    placeholder="Re-enter password"
                    class="block w-full !bg-white px-4 py-2.5 text-gray-900 placeholder-gray-400 border rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    :class="errors.confirmPassword ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'"
                  >
                  <p v-if="errors.confirmPassword" class="text-red-600 text-xs mt-1.5">{{ errors.confirmPassword }}</p>
                </div>
              </div>
            </div>

            <!-- Submit Button -->
            <div class="flex justify-end pt-2">
              <button 
                type="submit"
                :disabled="isSubmitting"
                class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-10 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span v-if="isSubmitting">Saving...</span>
                <span v-else>Complete Profile</span>
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

<style scoped>
/* Custom scrollbar if needed */
input::-webkit-calendar-picker-indicator {
  opacity: 0.5;
}
input:focus::-webkit-calendar-picker-indicator {
  opacity: 1;
}
</style>
